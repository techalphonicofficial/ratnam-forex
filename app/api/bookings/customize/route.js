const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ratnamforex.yber.in/api/v1';
const CRM_API_KEY =
  process.env.CRM_LEADS_API_KEY ||
  process.env.CRM_COMPANY_INFO_API_KEY ||
  'pt_dc9eae82075b27c1408392fa7d7e0e632ef9e846f6e4e33e';
const CUSTOMIZE_INQUIRY_PIPELINE_ID = Number(process.env.CRM_CUSTOMIZE_INQUIRY_PIPELINE_ID) || 6;

export const dynamic = 'force-dynamic';

function titleCase(value) {
  return String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

async function syncCustomItineraryToCrm(payload, bookingResult) {
  try {
    const customer = payload?.customer || {};
    const trip = payload?.trip || {};

    const customerName =
      customer.name?.trim() ||
      customer.email?.split('@')[0] ||
      (customer.phone ? `Traveler (${customer.phone})` : '') ||
      'Custom Itinerary Traveler';
    const customerEmail = customer.email?.trim() || '';
    const customerPhone = customer.phone?.trim() || '';

    const bookingId =
      bookingResult?.data?.custom_booking_id ||
      bookingResult?.data?.id ||
      bookingResult?.custom_booking_id ||
      bookingResult?.id ||
      '';

    const destination = trip.destination || trip.package_name || 'Custom Destination';
    const packageName = trip.package_name || trip.packageName || '';
    const hotelCategory = trip.hotel_category || trip.hotelCategory || '';
    const mealPlan = trip.meal_plan || trip.mealPlan || '';
    const vehicleType = trip.vehicle_type || trip.vehicleType || '';
    const specialRequests = trip.special_requests || trip.specialRequests || trip.notes || '';
    const travelWith = trip.travel_with || '';
    const duration = trip.duration || '';
    const departureCity = trip.departure_city || '';
    const departureDate = trip.departure_date || '';
    const totalTravellers = trip.total_travellers || 1;
    const roomsCount = Array.isArray(trip.rooms) ? trip.rooms.length : 1;
    const citiesList = Array.isArray(trip.cities)
      ? trip.cities
        .map((c) => (typeof c === 'string' ? c : c.name || ''))
        .filter(Boolean)
        .join(', ')
      : '';

    const roomsSummary =
      Array.isArray(trip.rooms) && trip.rooms.length > 0
        ? trip.rooms
          .map(
            (r, i) =>
              `• Room ${i + 1}: ${r.adults || 0} Adult(s), ${r.children || 0} Child(ren)${Array.isArray(r.child_ages) && r.child_ages.length
                ? ` (Ages: ${r.child_ages.join(', ')})`
                : ''
              }`
          )
          .join('\n')
        : '';

    const itineraryDetailsText = [
      '=== CUSTOMIZED ITINERARY DETAILS ===',
      packageName ? `• Selected Package: ${packageName}` : '',
      `• Destination: ${destination}`,
      travelWith ? `• Travel With: ${travelWith}` : '',
      duration ? `• Duration: ${duration}` : '',
      departureCity ? `• Departure City: ${departureCity}` : '',
      departureDate ? `• Departure Date: ${departureDate}` : '',
      `• Travellers: ${totalTravellers} pax (${roomsCount} room${roomsCount > 1 ? 's' : ''})`,
      hotelCategory ? `• Stay Preference: ${hotelCategory}` : '',
      mealPlan ? `• Meal Plan: ${mealPlan}` : '',
      vehicleType ? `• Vehicle Preference: ${vehicleType}` : '',
      specialRequests ? `• Special Requests: ${specialRequests}` : '',
      citiesList ? `• Cities to Visit: ${citiesList}` : '',
      roomsSummary ? `\n--- Room Configuration ---\n${roomsSummary}` : '',
      bookingId ? `\n--- Custom Booking ID ---\n${bookingId}` : '',
      customerPhone || customerEmail
        ? `\n--- Customer Contact ---\n${customerName ? `Name: ${customerName}\n` : ''}${customerPhone ? `Phone: ${customerPhone}\n` : ''}${customerEmail ? `Email: ${customerEmail}` : ''}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const leadTitle = `${packageName || titleCase(destination)} Custom Itinerary${duration ? ` (${duration})` : ''}`;

    const leadPayload = {
      pipeline_id: CUSTOMIZE_INQUIRY_PIPELINE_ID,
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      source: 'Custom Itinerary Flow',
      notes: `Custom Itinerary Request for ${packageName || destination}${duration ? ` (${duration})` : ''} | Dep: ${departureCity} on ${departureDate} | Travellers: ${totalTravellers} pax, ${roomsCount} room(s)${hotelCategory ? ` | Stay: ${hotelCategory}` : ''}${mealPlan ? ` | Meals: ${mealPlan}` : ''}${vehicleType ? ` | Vehicle: ${vehicleType}` : ''}${citiesList ? ` | Cities: ${citiesList}` : ''}${bookingId ? ` | Ref: ${bookingId}` : ''}${specialRequests ? ` | Notes: ${specialRequests}` : ''}`,
      custom_fields: {
        custom_package_title: leadTitle,
        custom_package_id: bookingId || `CUSTOM-${Date.now()}`,
        itenary: itineraryDetailsText,
        destination,
        duration,
        departure_city: departureCity,
        departure_date: departureDate,
        total_travellers: String(totalTravellers),
        travel_with: travelWith,
        cities: citiesList,
        accommodation_type: hotelCategory || '4 Star Deluxe',
        additional_information__optional_: specialRequests || '',
      },
    };

    const baseUrl = BACKEND_BASE_URL.replace(/\/api\/v1\/?$/, '');
    const submitUrl = `${baseUrl}/api/v1/crm/leads/submit`;

    // 1. Submit lead to CRM Pipeline 6
    const crmResponse = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-api-key': CRM_API_KEY,
      },
      body: JSON.stringify(leadPayload),
    });

    const crmData = await crmResponse.json().catch(() => null);

    // 2. Also forward to Trip Inquiries so it shows in the Admin Panel Trip Inquiries list
    try {
      const tripInquiryUrl = `${baseUrl}/api/v1/trip-inquiries`;
      await fetch(tripInquiryUrl, {
        method: 'POST',
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
          },
          trip: {
            destination: packageName || destination,
            destination_slug: trip.destination_slug || '',
            travel_with: travelWith || 'Custom Itinerary Traveler',
            duration: duration || 'Custom',
            departure_city: departureCity || 'India',
            departure_date: departureDate || new Date().toISOString().split('T')[0],
            total_travellers: totalTravellers,
            rooms: trip.rooms || [{ adults: totalTravellers, children: 0 }],
          },
          source: 'Custom Itinerary Flow',
          notes: itineraryDetailsText,
        }),
      });
    } catch (inquiryErr) {
      console.warn('Trip inquiry sync error (non-fatal):', inquiryErr);
    }

    return crmData;
  } catch (err) {
    console.warn('CRM sync error (non-fatal):', err);
    return null;
  }
}

export async function POST(request) {
  let payload = null;
  try {
    payload = await request.json();
    const backendUrl = new URL('/api/v1/bookings/customize', BACKEND_BASE_URL.replace(/\/api\/v1\/?$/, ''));

    const response = await fetch(backendUrl.toString(), {
      method: 'POST',
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    // Sync customized itinerary lead to CRM Leads Pipeline 6 (customize_inquiry)
    const crmResult = await syncCustomItineraryToCrm(payload, data);

    const mergedData = data
      ? {
        ...data,
        crm_lead_id: crmResult?.data?.id || null,
        crm_synced: Boolean(crmResult?.success),
      }
      : {
        success: response.ok,
        message: response.ok ? 'Itinerary saved successfully.' : 'Unable to save itinerary.',
        crm_lead_id: crmResult?.data?.id || null,
        crm_synced: Boolean(crmResult?.success),
      };

    return Response.json(
      mergedData,
      { status: response.status }
    );
  } catch (error) {
    console.error('Customize booking submit error:', error);

    // If backend bookings endpoint failed, still attempt capturing lead into CRM pipeline 6
    if (payload) {
      try {
        await syncCustomItineraryToCrm(payload, null);
      } catch (crmErr) {
        console.warn('Fallback CRM sync error:', crmErr);
      }
    }

    return Response.json(
      { success: false, message: 'Unable to save your customized itinerary. Please try again.' },
      { status: 502 }
    );
  }
}
