const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ratnamforex.yber.in/api/v1';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    // 1. Safely resolve params (Fully compatible with Next.js 14 and 15+)
    const resolvedParams = await params;
    const bookingId = resolvedParams?.bookingId;

    if (!bookingId) {
      return Response.json(
        { success: false, message: 'Booking ID is required.' },
        { status: 400 }
      );
    }

    // 2. Safely parse the body. Only parse if content actually exists to prevent JSON errors.
    const text = await request.text();
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch (e) {
      payload = null;
    }

    const backendUrl = new URL(
      `/api/v1/bookings/package/${encodeURIComponent(bookingId)}/cancel`,
      BACKEND_BASE_URL.replace(/\/api\/v1\/?$/, '')
    );

    const authorization = request.headers.get('authorization');

    // 3. Set headers conditionally
    const headers = {
      accept: '*/*',
      'ngrok-skip-browser-warning': 'true',
      ...(authorization ? { authorization } : {}),
    };

    // Only add 'content-type' if we are actually sending a JSON payload
    if (payload) {
      headers['content-type'] = 'application/json';
    }

    // 4. Build fetch options dynamically
    const fetchOptions = {
      method: 'POST',
      headers,
      cache: 'no-store',
    };

    // Only attach the body if the original request included one
    if (payload) {
      fetchOptions.body = JSON.stringify(payload);
    }

    const response = await fetch(backendUrl.toString(), fetchOptions);

    const data = await response.json().catch(() => null);

    return Response.json(
      data || { 
        success: response.ok, 
        message: response.ok ? 'Cancellation request submitted.' : 'Unable to cancel booking.' 
      },
      { status: response.status }
    );
  } catch (error) {
    console.error('Package cancellation error:', error);

    return Response.json(
      { success: false, message: 'Unable to submit cancellation request. Please contact support.' },
      { status: 502 }
    );
  }
}