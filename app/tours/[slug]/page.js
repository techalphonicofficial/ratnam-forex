import { notFound } from 'next/navigation';
import TourDetailClient from './TourDetailClient';

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

const parseList = (data) => {
  let list = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) list = parsed;
      else list = data.split('\n').map((s) => s.trim()).filter(Boolean);
    } catch (e) {
      list = data.split('\n').map((s) => s.trim()).filter(Boolean);
    }
  }
  
  return list.map(item => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') return item.text || item.name || item.title || item.description || JSON.stringify(item);
    return String(item);
  }).filter(Boolean);
};

const mapApiPackageToEntity = (pkg) => {
  // Extract gallery images
  let gallery = [];
  if (Array.isArray(pkg.gallery) && pkg.gallery.length > 0) {
    gallery = pkg.gallery.map((g) => g.image || g.url || g.path || g).filter(Boolean);
  }
  if (gallery.length === 0 && pkg.main_image) {
    gallery = [pkg.main_image, pkg.main_image, pkg.main_image, pkg.main_image];
  }
  if (gallery.length === 0) {
    gallery = ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'];
  }

  // Extract itinerary
  let itinerary = [];
  if (Array.isArray(pkg.destinations)) {
    let dayCounter = 1;
    pkg.destinations.forEach((dest) => {
      if (dest.activities && typeof dest.activities === 'object') {
        if (Array.isArray(dest.activities)) {
           dest.activities.forEach(act => {
             itinerary.push({
               day: dayCounter++,
               title: act.title || act.name || `Day ${dayCounter - 1}`,
               description: act.description || act.name || 'Leisure day.',
               meals: ['Breakfast']
             });
           });
        } else {
          Object.entries(dest.activities).forEach(([day, acts]) => {
            const title = Array.isArray(acts) && acts.length ? acts[0].title || acts[0].name || `Day ${dayCounter}` : `Day ${dayCounter}`;
            const description = Array.isArray(acts) && acts.length ? acts.map((a) => a.description || a.name || '').join(' ') : 'Leisure day.';
            itinerary.push({
              day: dayCounter,
              title,
              description,
              meals: ['Breakfast'],
            });
            dayCounter++;
          });
        }
      }
    });
  }

  if (itinerary.length === 0) {
    itinerary = [
      { day: 1, title: 'Arrival', description: 'Arrive and check in.', meals: ['Breakfast'] },
      { day: 2, title: 'Sightseeing', description: 'Explore the destination.', meals: ['Breakfast'] },
      { day: 3, title: 'Departure', description: 'Transfer to airport.', meals: ['Breakfast'] },
    ];
  }

  const inclusions = parseList(pkg.inclusions);
  const exclusions = parseList(pkg.exclusions);

  return {
    ...pkg,
    id: pkg.id,
    title: pkg.name || pkg.title || 'Travel Package',
    description: pkg.description || 'Amazing travel experience.',
    price: Number(pkg.price) || 0,
    duration: Number(pkg.duration_days) || (pkg.nights ? pkg.nights + 1 : 1),
    gallery,
    highlights: inclusions.length > 0 ? inclusions : ['Inclusive Breakfast', 'Expert Local Guide', 'Premium Stay'],
    included: inclusions.length > 0 ? inclusions : ['Accommodation', 'Daily Breakfast', 'Sightseeing'],
    excluded: exclusions.length > 0 ? exclusions : ['Round-trip airfare', 'Travel insurance', 'Personal expenses'],
    itinerary,
    groupSize: pkg.group_size || 12,
    location: pkg.destinations?.[0]?.destination?.name || pkg.destination || pkg.location || 'Beautiful Destination',
    rating: Number(pkg.rating) || 4.8,
    reviews: Number(pkg.reviews_count) || 324,
    type: pkg.category || pkg.type || 'Package',
    trending: Boolean(pkg.show_in_home_page || pkg.is_trending),
  };
};

export async function generateMetadata({ params }) {
  const { slug } = await params;

  if (slug === 'deluxe-chardham-yatra') {
    return { title: 'Char Dham Yatra – Kedarnath & Badrinath', description: 'Experience the divine Char Dham Yatra' };
  }

  const pkg = await fetchServerPackage(slug);
  if (!pkg) return { title: 'Tour Not Found' };

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

  if (slug === 'deluxe-chardham-yatra') {
    const mockChardhamTour = {
      id: 'deluxe-chardham-yatra',
      title: 'Char Dham Yatra – Kedarnath & Badrinath',
      price: 26999,
      duration: 10,
      groupSize: 20,
      location: 'Uttarakhand, India',
      rating: 4.8,
      reviews: 324,
      highlights: ['Beautiful hill drive', 'Local village visit', 'Scenic waterfalls', 'Peaceful environment'],
      included: [
        'Accommodation on double/triple sharing basis',
        'Daily Buffet Breakfast & Dinner (except in kedarnath)',
        'Private Vehicle as per Pax (A/C will be till Rishikesh)',
        'Sightseeing as per itinerary',
        'Holy dip in river Ganga Rishikesh & Haridwar',
        'Most amazing spiritual experience Ganga Aarti Haridwar & Rishikesh',
        'Mana ‘last Indian Village’',
        'Tour Assistance, Rishikesh & in Kedarnath man on spot',
        'Special Gift Bio Organic Diya or Bhakti Route packed Pavitra Gangajal from Varanasi',
        'Prior information complimentary Pandit Ji assistance at Badrinath and Kedarnath Dham'
      ],
      excluded: [
        'Personal expanses’ laundry, telephone, tips, soft drink, portage etc',
        'Any things mentioned in the inclusions',
        'Any train or airfare or helicopter tickets not included',
        'Additional sightseeing or extra usages of vehicle other than mention in the itinerary',
        'Entrance fees, any pooja fees, guide charge, any pandit jee charge for pooja',
        'Any natural calamities like landslides, flood, road block or political disturbances',
        '5% G.S.T will be extra on total billing'
      ],
      itinerary: [
        { day: 1, title: 'Haridwar/Dehradun - Barkot (200 km / approx 06-07 Hrs)', description: 'Welcome you’re "Deluxe Chardham Yatra" You are greeted and assisted on arrival at Dehradun Airport/ Rly Station Haridwar, after pickup proceeds to Barkot. Rishikesh Vehicle will go for registration and hill certification. Drive to Barkot/Kharshali, a beautiful hill located at the foot of Yamunotri. Check-in to your hotel/camp. Overnight at Hotel/camp.', meals: ['Dinner'] },
        { day: 2, title: 'Barkot - Yamunotri Darshan - Kharshali (40 KMS + 06km trek / 4-5Hrs)', description: 'After breakfast, depart for Hanumanchatti, Janki Chatti. Here you begin the first Pahad Yatra of Yamunotri (6 Km trek). Take a holy dip in Yamuna River and perform Pooja. Overnight at Barkot.', meals: ['Breakfast', 'Dinner'] },
        { day: 3, title: 'Barkot - Uttarkashi (100km / approx 3-4 Hrs)', description: 'After breakfast check out and drive to Uttarkashi. Check in to the hotel. Visit the famous Kashi Vishwanath Temple in the evening. Overnight at Hotel.', meals: ['Breakfast', 'Dinner'] },
        { day: 4, title: 'Uttarkashi – Gangotri - Uttarkashi (110km / approx 3-4 Hrs)', description: 'Early morning breakfast and drive to Gangotri. Take a holy dip in the sacred river Ganges (Bhagirathi). Visit the Gangotri Temple. Late afternoon drive back to Uttarkashi. Overnight at Hotel.', meals: ['Breakfast', 'Dinner'] },
        { day: 5, title: 'Uttarkashi - Guptkashi (190 KM / approx drive 07-08 Hrs)', description: 'Leave for Guptkashi after early breakfast. Check-in to hotel. Visit famous ancient Ardhnareshwar Temple. Medical checkup for Kedarnath journey. Overnight at Hotel/Camp.', meals: ['Breakfast', 'Dinner'] },
        { day: 6, title: 'Guptkashi - Sonparyag - Kedarnath (30 kms + 19 kms Trek / 6-7 Hrs)', description: 'Drive to Sonprayag. Start 20 km trek to Kedarnath. Enveloping mists and picturesque beauty. Check in at Govt. Camps/Lodges/Ashram.', meals: [] },
        { day: 7, title: 'Kedarnath - Sonparyag - Guptkashi (19km trek + 30km drives / 05-06 Hrs)', description: 'Early morning Abhishek Pooja. Trek back 20 km to Sonprayag. Drive to hotel in Guptkashi/Rudraprayag. Overnight stay.', meals: ['Dinner'] },
        { day: 8, title: 'Guptkashi - Badrinath (190km / approx drive 07-08 Hrs)', description: 'Drive to Badrinath via Joshimath. Arrive at Badrinath and check into hotel. Darshan in the evening at Badrinath Temple after bathing in Tapt Kund.', meals: ['Breakfast', 'Dinner'] },
        { day: 9, title: 'Badrinath – Kirtinagar/Srinagar (250km / approx drive 07-08 Hrs)', description: 'Morning Badrinath Temple Darshan. Local sightseeing at Mana Village (last village of India), Vyas Gufa, Ganesh Gufa. Drive towards Kirtinagar via Joshimath. Overnight stay at hotel.', meals: ['Breakfast', 'Dinner'] },
        { day: 10, title: 'Srinagar/Kirtinagar – Dehradun Airport/ Haridwar Rly Station (150km / 4-5 Hrs)', description: 'Morning breakfast at hotel. Drive back to Dehradun Airport/Haridwar Railway Station for your journey home.', meals: ['Breakfast'] }
      ]
    };
    const ChardhamDetailClient = (await import('@/components/ChardhamDetailClient')).default;
    return <ChardhamDetailClient tour={mockChardhamTour} />;
  }

  const apiPkg = await fetchServerPackage(slug);

  if (!apiPkg) {
    notFound();
  }

  const entity = mapApiPackageToEntity(apiPkg);

  let similarEntities = [];
  // For similar entities, we could also fetch server packages if needed, but for now we skip or leave empty.

  return (
    <>
      <TourDetailClient tour={entity} similarTours={similarEntities} />
    </>
  );
}
