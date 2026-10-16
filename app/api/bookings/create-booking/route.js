const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ratnamforex.yber.in/api/v1';

export const dynamic = 'force-dynamic';

function balanceBookingSplit(payload) {
  if (!payload || typeof payload !== 'object') return payload;

  const total = Number(payload.package_total) || 0;
  const tax = Number(payload.tax_amount) || 0;
  const hotelTotal = Number(payload.hotel_addons_total) || 0;
  let base = Number(payload.package_base_amount) || 0;

  // The backend accounting ledger requires: package_base_amount + tax_amount === package_total
  if (base + tax !== total) {
    if (base + hotelTotal + tax === total) {
      base = base + hotelTotal;
    } else if (total > tax) {
      base = total - tax;
    }
  }

  const payableNow = Number(payload.payable_now) || 0;
  const remaining = Math.max(0, total - payableNow);

  return {
    ...payload,
    package_base_amount: base,
    remaining_amount: remaining,
  };
}

async function syncBookingToCrmAndInquiries(payload, bookingResult) {
  try {
    const customer = payload.customer || {};
    const customerName = customer.name || 'Guest Traveler';
    const customerEmail = customer.email || '';
    const customerPhone = customer.phone || '';
    const packageName = payload.package_name || payload.package_slug || 'Tour Package';
    const totalAmount = Number(payload.package_total) || 0;
    const paidAmount = Number(payload.payable_now) || 0;
    const paymentId = payload.razorpay_payment_id || '';
    const bookingRef = bookingResult?.data?.booking_reference || bookingResult?.booking_reference || '';
    const hotelAddons = Array.isArray(payload.hotel_addons)
      ? payload.hotel_addons.map((h) => `${h.name} (${h.rooms || 1} room, ${h.nights || 1} night)`).join(', ')
      : '';

    const crmApiKey =
      process.env.CRM_LEADS_API_KEY ||
      process.env.CRM_COMPANY_INFO_API_KEY ||
      'pt_dc9eae82075b27c1408392fa7d7e0e632ef9e846f6e4e33e';

    const baseUrl = BACKEND_BASE_URL.replace(/\/api\/v1\/?$/, '');

    // 1. Submit to Pipeline 16 ("Booking" pipeline in CRM Leads)
    const pipeline16Payload = {
      pipeline_id: 16,
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      source: 'Online Package Booking',
      notes: `Booking Confirmed: ${packageName} | Paid: ₹ ${paidAmount.toLocaleString('en-IN')} | Total: ₹ ${totalAmount.toLocaleString('en-IN')} | Ref: ${bookingRef} | Razorpay ID: ${paymentId}${payload.notes ? ` | Notes: ${payload.notes}` : ''}`,
      custom_fields: {
        where_to_go: payload.package_name || payload.package_slug || 'Destination',
        departure_from: 'India',
        when_do_you_want_to_go_: new Date().toISOString().split('T')[0],
        adults: `adult ${payload.traveller_count || 1}`,
        children: 'children 0',
        accommodation_type: '3 Star',
        additional_information__optional_: `Booking Ref: ${bookingRef} | Razorpay Payment ID: ${paymentId}${hotelAddons ? ` | Add-ons: ${hotelAddons}` : ''}`,
      },
    };

    // 2. Submit to Pipeline 3 ("Contact Page" with Subject "Tour Booking")
    const pipeline3Payload = {
      pipeline_id: 3,
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      source: 'Online Package Booking',
      notes: `Booking Confirmed: ${packageName} | Paid: ₹ ${paidAmount.toLocaleString('en-IN')} | Total: ₹ ${totalAmount.toLocaleString('en-IN')} | Ref: ${bookingRef} | Razorpay ID: ${paymentId}`,
      custom_fields: {
        subject: 'Tour Booking',
        country: payload.package_name || payload.package_slug || 'Destination',
      },
    };

    // 3. Submit to Trip Inquiries (admin panel trip inquiries list)
    const tripInquiryPayload = {
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      trip: {
        destination: packageName,
        destination_slug: payload.package_slug || '',
        travel_with: 'Online Package Booking',
        duration: payload.duration || '7N/8D',
        departure_city: 'India',
        departure_date: new Date().toISOString().split('T')[0],
        total_travellers: Number(payload.traveller_count) || 1,
        notes: `Confirmed Online Booking. Paid: ₹ ${paidAmount.toLocaleString('en-IN')} / Total: ₹ ${totalAmount.toLocaleString('en-IN')} | Ref: ${bookingRef} | Payment ID: ${paymentId}${hotelAddons ? ` | Hotels: ${hotelAddons}` : ''}`,
      },
    };

    await Promise.allSettled([
      fetch(`${baseUrl}/api/v1/crm/leads/submit`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-api-key': crmApiKey,
        },
        body: JSON.stringify(pipeline16Payload),
      }),
      fetch(`${baseUrl}/api/v1/crm/leads/submit`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-api-key': crmApiKey,
        },
        body: JSON.stringify(pipeline3Payload),
      }),
      fetch(`${baseUrl}/api/v1/trip-inquiries`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify(tripInquiryPayload),
      }),
    ]);
  } catch (err) {
    console.warn('CRM sync error (non-fatal):', err);
  }
}

export async function POST(request) {
  try {
    const rawPayload = await request.json();
    const payload = balanceBookingSplit(rawPayload);
    const backendUrl = new URL('/api/v1/bookings/create-booking', BACKEND_BASE_URL.replace(/\/api\/v1\/?$/, ''));
    const authorization = request.headers.get('authorization');

    if (!authorization) {
      return Response.json(
        { success: false, message: 'Please login before booking this package.' },
        { status: 401 }
      );
    }

    const response = await fetch(backendUrl.toString(), {
      method: 'POST',
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(authorization ? { authorization } : {}),
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    // When booking is successfully recorded, sync to CRM Leads and Trip Inquiries
    if (response.ok && data?.success) {
      syncBookingToCrmAndInquiries(payload, data).catch(() => {});
    }

    return Response.json(
      data || { success: response.ok, message: response.ok ? 'Booking created successfully.' : 'Unable to create booking.' },
      { status: response.status }
    );
  } catch (error) {
    console.error('Package booking create error:', error);

    return Response.json(
      { success: false, message: 'Unable to create your package booking. Please contact support.' },
      { status: 502 }
    );
  }
}
