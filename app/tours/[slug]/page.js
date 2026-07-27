import { Suspense } from 'react';
import TourItineraryView from '../TourItineraryView';
import { notFound } from 'next/navigation';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ratnamforex.yber.in/api/v1';

async function fetchServerPackage(slug) {
  try {
    const backendUrl = new URL(
      `/api/v1/packages/${encodeURIComponent(slug)}`,
      BACKEND_BASE_URL.replace(/\/api\/v1\/?$/, '')
    );
    const res = await fetch(backendUrl.toString(), {
      headers: {
        accept: '*/*',
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store',
    });
    const data = await res.json();
    return data?.data || data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pkg = await fetchServerPackage(slug);
  
  if (!pkg) return { title: 'Tour Package | Travel Holiday' };

  const title = pkg.name || pkg.title || 'Tour Package';
  const description = pkg.description || `Book ${title} with Travel Holiday`;
  const image = pkg.main_image || (pkg.gallery && pkg.gallery[0] ? pkg.gallery[0].url || pkg.gallery[0].image : null);

  return {
    title: `${title} | Travel Holiday`,
    description,
    openGraph: {
      title: `${title} | Travel Holiday`,
      description,
      images: image ? [{ url: image, width: 1200, height: 630 }] : [],
    },
  };
}

export default async function TourDetailPage({ params }) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={<div style={{ padding: '100px 20px', textAlign: 'center' }}>Loading itinerary...</div>}>
      <TourItineraryView packageSlug={slug} />
    </Suspense>
  );
}
