import { notFound } from 'next/navigation';
import tours from '@/data/tours.json';
import { packageData } from '@/data/packages';
import TourDetailClient from './TourDetailClient';

const transformPackage = (pkg) => ({
  ...pkg,
  gallery: [pkg.image, pkg.image, pkg.image, pkg.image],
  highlights: ["Inclusive Breakfast", "Expert Local Guide", "Airport Transfers", "Premium Stay", "Taxes & Fees"],
  included: ["3-star/4-star Accommodation", "Daily Breakfast", "Sightseeing as per itinerary", "Round-trip airport transfers"],
  excluded: ["Round-trip airfare", "Travel insurance", "Tips and gratuities", "Personal expenses"],
  itinerary: [
    { day: 1, title: "Arrival", description: "Arrive and check in." },
    { day: 2, title: "Sightseeing", description: "Explore the city." },
    { day: 3, title: "Culture", description: "Learn traditions." },
    { day: 4, title: "Leisure", description: "Relax." },
    { day: 5, title: "Departure", description: "Transfer to airport." }
  ],
  groupSize: 12,
  duration: (pkg.nights || 0) + 1,
  location: pkg.destination,
});

const findEntity = (slug) => {
  // 1. Try in standard tours by SLUG
  const tourBySlug = tours.find((t) => t.slug === slug);
  if (tourBySlug) return tourBySlug;

  // 2. Try in standard tours by ID
  const tourById = tours.find((t) => String(t.id) === String(slug));
  if (tourById) return tourById;

  // 3. Try in packages by SLUG
  const pkgBySlug = packageData.find((p) => p.slug === slug);
  if (pkgBySlug) return transformPackage(pkgBySlug);

  // 4. Try in packages by ID
  const pkgById = packageData.find((p) => String(p.id) === String(slug));
  if (pkgById) return transformPackage(pkgById);

  return null;
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (slug === 'deluxe-chardham-yatra') {
    return { title: 'Char Dham Yatra – Kedarnath & Badrinath', description: 'Experience the divine Char Dham Yatra' };
  }
  const entity = findEntity(slug);
  if (!entity) return { title: 'Tour Not Found' };

  return {
    title: entity.title,
    description: entity.description || entity.title,
    openGraph: {
      title: entity.title,
      description: entity.description || entity.title,
      images: [{ url: entity.gallery?.[0] || entity.image, width: 1200, height: 630 }],
    },
  };
}

export function generateStaticParams() {
  const tourSlugs = tours.map((t) => ({ slug: t.slug }));
  const pkgSlugs = packageData.map((p) => ({ slug: p.slug }));
  return [...tourSlugs, ...pkgSlugs];
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

  const entity = findEntity(slug);
  if (!entity) notFound();

  const similarEntities = tours
    .filter((t) => t.slug !== slug && (t.type === entity.type || t.country === entity.country))
    .slice(0, 3);

  return (
    <>
      {/* Breadcrumb */}
      {/* <div style={{ background: 'var(--color-bg-soft)', borderBottom: '1px solid var(--color-border)', marginTop: 140 }}>
        <div className="container py-3">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0" style={{ fontSize: 14 }}>
              <li className="breadcrumb-item"><a href="/" style={{ color: 'var(--color-primary)' }}>Home</a></li>
              <li className="breadcrumb-item"><a href="/tours" style={{ color: 'var(--color-primary)' }}>Tours</a></li>
              <li className="breadcrumb-item active" style={{ color: 'var(--color-text-muted)' }}>{entity.title}</li>
            </ol>
          </nav>
        </div>
      </div> */}

      <TourDetailClient tour={entity} similarTours={similarEntities} />
    </>
  );
}
