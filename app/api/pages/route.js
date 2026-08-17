import { apiFetchOptions, buildBackendUrl } from '@/utils/backendConfig';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const incomingUrl = new URL(request.url);
  const backendUrl = new URL(buildBackendUrl('/api/v1/pages'));

  incomingUrl.searchParams.forEach((value, key) => {
    if (key !== '_t') backendUrl.searchParams.set(key, value);
  });
  backendUrl.searchParams.set('_t', String(Date.now()));

  try {
    const response = await fetch(backendUrl.toString(), apiFetchOptions({
      headers: {
        accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store',
    }));

    const data = await response.json().catch(() => null);

    return Response.json(
      data || { success: response.ok, data: null },
      { status: response.status }
    );
  } catch (error) {
    console.error('Pages proxy error:', error);
    return Response.json(
      { success: false, data: null, message: 'Unable to fetch pages' },
      { status: 502 }
    );
  }
}
