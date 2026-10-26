import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';
import TeamCard from '@/components/TeamCard';
import { getMediaUrl, getPageBySlug } from '@/utils/api';

export const dynamic = 'force-dynamic';

const FALLBACK_HERO_IMAGE = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80';

const fallbackTeam = [
  { name: 'Sarah Mitchell', role: 'CEO & Co-Founder', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', bio: 'Former travel writer with 15+ years exploring 80 countries.' },
  { name: 'James Thompson', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', bio: 'Operations expert ensuring every tour runs seamlessly.' },
  { name: 'Emma Wilson', role: 'Lead Tour Designer', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', bio: 'Crafts unique itineraries blending culture, adventure & luxury.' },
  { name: 'David Martinez', role: 'Customer Experience', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', bio: 'Dedicated to making every traveler feel truly cared for.' },
];

const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, '').trim();

const decodeHtml = (value = '') =>
  String(value)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();

export async function generateMetadata() {
  const page = await getPageBySlug('our-team');
  const image = getMediaUrl(page?.feature_image) || FALLBACK_HERO_IMAGE;

  return {
    title: page?.meta_title || page?.title || 'Meet Our Team | Travel Holiday',
    description: page?.meta_description || page?.description || 'Meet the passionate travelers and experts behind Travel Holiday.',
    keywords: page?.keyword ? [page.keyword] : undefined,
    openGraph: {
      title: page?.meta_title || page?.title || 'Meet Our Team | Travel Holiday',
      description: page?.meta_description || page?.description || 'Meet the passionate travelers and experts behind Travel Holiday.',
      images: [{ url: image, width: 1200, height: 630, alt: page?.alt_text || 'Our Team' }],
    },
  };
}

export default async function OurTeamPage() {
  const page = await getPageBySlug('our-team');

  const teamSection =
    page?.details?.find(
      (s) => s.section === 'tabs_section' || s.section === 'team_grid' || s.key === 'hero_key'
    ) || page?.details?.[0];

  const jsonData = teamSection?.json_data || {};
  const rawList =
    jsonData.tabs ||
    jsonData.team ||
    jsonData.members ||
    jsonData.items ||
    [];

  const subtitle =
    jsonData.heading_content ||
    teamSection?.title ||
    'The People Behind The Magic';

  const title =
    teamSection?.title ||
    page?.title ||
    'Meet Our Team';

  const description =
    jsonData.block_desc ||
    teamSection?.description ||
    page?.description ||
    'Passionate travelers who turned their love of adventure into a career.';

  const members = Array.isArray(rawList) && rawList.length > 0
    ? rawList.map((m) => {
        const name = m.title || m.name || '';
        const role = m.badge || m.role || '';
        const rawBio = m.content || m.bio || m.description || '';
        const bio = decodeHtml(stripHtml(rawBio));
        const imagePath = m.img || m.image || '';
        const image = getMediaUrl(imagePath);
        const fallbackMatch = fallbackTeam.find(
          (t) => t.name.toLowerCase() === name.toLowerCase()
        )?.image;

        return {
          name,
          role,
          bio,
          image: image || fallbackMatch || fallbackTeam[0].image,
          fallbackImage: fallbackMatch || fallbackTeam[0].image,
        };
      }).filter((m) => m.name)
    : fallbackTeam;

  return (
    <>
      {/* Hero Banner */}
      <section style={{ position: 'relative', minHeight: '44vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FALLBACK_HERO_IMAGE}
            alt="Our Team"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,10,40,0.88) 0%, rgba(0,82,204,0.55) 100%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: 120, paddingBottom: 50 }}>
          <div className="row">
            <div className="col-lg-8">
              <ScrollReveal>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--color-primary-light, #deb887)', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
                  {subtitle}
                </div>
                <h1 style={{ fontFamily: '"Italiana", sans-serif', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: 16 }}>
                  {title}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 16, lineHeight: 1.7, maxWidth: 620, margin: 0 }}>
                  {description}
                </p>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Team Cards Grid */}
      <section className="section" id="team" style={{ padding: '80px 0', background: 'var(--color-bg-light, #fafafa)' }}>
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-5">
              <span className="section-label">{subtitle}</span>
              <h2 className="section-title">{title}</h2>
              <p className="section-subtitle mx-auto">{description}</p>
            </div>
          </ScrollReveal>
          <div className="row g-4">
            {members.map((member, i) => (
              <div key={member.name} className="col-lg-3 col-md-6">
                <ScrollReveal delay={i * 100}>
                  <TeamCard member={member} />
                </ScrollReveal>
              </div>
            ))}
          </div>

          {/* Join / Contact CTA */}
          <ScrollReveal delay={400}>
            <div
              style={{
                marginTop: 64,
                padding: '36px 32px',
                borderRadius: 20,
                background: 'linear-gradient(135deg, #0b1528 0%, #172554 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 24,
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)',
              }}
            >
              <div>
                <h3 style={{ fontFamily: '"Italiana", sans-serif', fontSize: 24, fontWeight: 700, margin: '0 0 6px 0', color: '#ffffff' }}>
                  Want to Plan Your Next Journey with Us?
                </h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
                  Our team of holiday specialists is available 24/7 to design your personalized itinerary.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link
                  href="/contact"
                  className="btn btn-primary"
                  style={{
                    padding: '12px 28px',
                    borderRadius: 999,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  Contact Our Team
                </Link>
                <Link
                  href="/about"
                  style={{
                    padding: '12px 24px',
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: 14,
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  Learn More About Us
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
