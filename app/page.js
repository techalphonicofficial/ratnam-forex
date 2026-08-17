import HomeHero from '@/components/HomeHero';
import TravelerTypesSection from '@/components/TravelerTypesSection';
import RecommendedPackages from '@/components/FeaturedToursRow';
import DescribeSection from '@/components/DescribeSection';
import ExploreWorldSection from '@/components/ExploreWorldSection';
import ExploreIndiaSection from '@/components/ExploreIndiaSection';
import BlogSection from '@/components/BlogSection';
import WhyChooseSection from '@/components/WhyChooseSection';
import DynamicCarouselBanner from '@/components/DynamicCarouselBanner';
import GramSection from '@/components/GramSection';
import AppBanner from '@/components/AppBanner';

import NewsletterForm from '@/components/NewsletterForm';
import { getHomePage, getPageBySlug } from '@/utils/api';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'TRAVEL & HOLIDAY ',
  description:
    'Fully personalized international holidays crafted by experts. Book Bali, Maldives, Europe, Japan & 120+ destinations. 50K+ happy travelers. Best price guarantee.',
  keywords: 'travel packages, holiday packages, international tours, customized holidays, Bali, Maldives, Europe tours',
};

export default async function HomePage() {
  const homePage = await getHomePage();
  const trustSection = homePage?.details?.find(
    (detail) => detail?.section === 'gallery' && detail?.key === 'our_trusted_partner'
  );
  const journeyCollections = homePage?.details?.find(
    (detail) => detail?.section === 'journey_collections'
  );
  const videoReviewsData = homePage?.details?.find(
    (detail) => detail?.key === 'video_reviews'
  );

  // Fetch all pages and build a map of collection-slug → description
  let collectionDescriptions = [];
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`;
    const pagesRes = await fetch(
      `${baseUrl}/api/pages?_t=${Date.now()}`,
      { cache: 'no-store', headers: { accept: 'application/json' } }
    );
    const pagesJson = await pagesRes.json();
    const allPages = Array.isArray(pagesJson?.data) ? pagesJson.data : [];
    // Filter to collection pages (slug starts with "collections/")
    collectionDescriptions = allPages
      .filter((p) => p.slug && p.slug.startsWith('collections/'))
      .map((p) => ({
        slug: p.slug,
        // Strip 'collections/' prefix so it matches the collection.slug in DescribeSection
        key: p.slug.replace(/^collections\//, '').split('/')[0],
        description: p.description || null,
      }));
  } catch {
    collectionDescriptions = [];
  }

  let blogHeading = 'BLOG : CITY INFO, TRAVEL TIPS : STORIES & ARTICLES';
  try {
    const blogPage = await getPageBySlug('blog');
    const dynamicHeading = blogPage?.details?.find((detail) => detail.key === 'blog_key_1')?.title;
    if (dynamicHeading) blogHeading = dynamicHeading;
  } catch (error) {
    // Keep fallback
  }

  return (
    <>
      {/* 1. HERO — dark bg image, traveler type, search */}
      <HomeHero />

      {/* Traveler Types Selection Section */}
      <TravelerTypesSection />

      {/* 2. RECOMMENDED PACKAGES — horizontal scroll cards */}
      <RecommendedPackages />
      <DescribeSection sectionData={journeyCollections} collectionDescriptions={collectionDescriptions} />
      <ExploreWorldSection />
      <ExploreIndiaSection />
      <BlogSection title={blogHeading} />

      {/* 3. WHY CHOOSE — stats + features + image collage */}
      <WhyChooseSection />

      {/* 4. DYNAMIC CAROUSEL BANNER */}
      <DynamicCarouselBanner />

      {/* 5. LOVE FROM THE GRAM — dark, Instagram photo strip */}
      <GramSection videoReviewsData={videoReviewsData} />

      {/* 6. PLAN ADVENTURES + POPULAR HAND-PICKED */}
      {/* 7. APP BANNER — dark green */}
      {/* <AppBanner /> */}

      {/* 8. TRUST LOGOS + AWARDS */}

      {/* 9. NEWSLETTER */}
      <section className="newsletter-section">
        <style>{`
          .newsletter-section {
            background: var(--color-primary);
            padding: 48px 16px;
            margin: 0 16px 40px;
            border-radius: 24px;
          }
          @media (min-width: 768px) {
            .newsletter-section {
              margin: 0 auto 60px;
              max-width: 1200px;
              width: calc(100% - 64px);
              padding: 64px 20px;
              border-radius: 32px;
            }
          }
        `}</style>
        <div className="container" style={{ textAlign: 'center', maxWidth: 600 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
            STAY IN THE LOOP
          </p>
          <h2 style={{ fontFamily: '"Italiana", sans-serif', fontWeight: 800, fontSize: 26, color: 'white', marginBottom: 10, lineHeight: 1.2 }}>
            Get Exclusive Deals & Travel Inspiration
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: 14, marginBottom: 24 }}>
            Early-bird discounts, curated guides & weekly travel ideas.
          </p>
          <NewsletterForm />
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 10 }}>
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </>
  );
}
