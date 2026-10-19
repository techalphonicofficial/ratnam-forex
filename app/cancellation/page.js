import Image from 'next/image';
import { getMediaUrl, getPageBySlug } from '@/utils/api';
import {
  transformCancellationHtml,
  FALLBACK_CANCELLATION_HTML,
} from '@/utils/cancellationPolicy';

export const dynamic = 'force-dynamic';

const FALLBACK_HERO_IMAGE = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1920&q=75';

const findSection = (page, section) =>
  page?.details?.find((item) => item.section === section || item.key === 'cancillation_key');

const formatDate = (value) => {
  if (!value) return 'October 2026';

  try {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return 'October 2026';
  }
};

const buildCancellationContent = (page) => {
  const storyGrid = findSection(page, 'story_grid');
  const heroImage = getMediaUrl(page?.feature_image) || FALLBACK_HERO_IMAGE;
  const rawDesc = storyGrid?.json_data?.story_desc || FALLBACK_CANCELLATION_HTML;
  const statsVal = Array.isArray(storyGrid?.json_data?.stats) ? storyGrid.json_data.stats[0]?.value : null;

  return {
    eyebrow: page?.title || 'Cancellation Policy',
    title: page?.description || page?.title || 'Cancellation & Refund Policy',
    description:
      storyGrid?.json_data?.heading_content ||
      'Transparent terms & standard refund schedule',
    image: heroImage,
    imageAlt: page?.alt_text || page?.title || 'Cancellation policy',
    html: transformCancellationHtml(rawDesc),
    updatedAt: statsVal || formatDate(page?.updated_at || page?.created_at),
  };
};

const fetchCancellationCmsPage = async () => {
  let page = await getPageBySlug('cancellation-policy');
  if (!page) page = await getPageBySlug('cancellation');
  return page;
};

export async function generateMetadata() {
  const page = await fetchCancellationCmsPage();
  const image = getMediaUrl(page?.feature_image);

  return {
    title: page?.meta_title || page?.title || 'Cancellation Policy',
    description: page?.meta_description || page?.description || 'Cancellation and refund policy for ITS TRAVELS AND TOURS.',
    keywords: page?.keyword ? [page.keyword] : undefined,
    openGraph: {
      title: page?.meta_title || page?.title || 'Cancellation Policy',
      description: page?.meta_description || page?.description || 'Cancellation and refund policy.',
      images: image ? [{ url: image, width: 1200, height: 630, alt: page?.alt_text || page?.title || 'Cancellation Policy' }] : undefined,
    },
  };
}

export default async function CancellationPolicy() {
  const page = await fetchCancellationCmsPage();
  const content = buildCancellationContent(page);

  return (
    <main style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 360, display: 'flex', alignItems: 'center' }}>
        <Image
          src={content.image}
          alt={content.imageAlt}
          fill
          sizes="100vw"
          style={{ objectFit: 'cover' }}
          priority
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(17,24,39,0.92), rgba(31,41,55,0.82), rgba(153,27,27,0.72))' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: 130, paddingBottom: 80, textAlign: 'center' }}>
          <span style={{ color: '#fecaca', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
            {content.eyebrow}
          </span>
          <h1 style={{ fontFamily: '"Italiana", sans-serif', fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 900, color: 'white', margin: '12px auto 16px', maxWidth: 780, lineHeight: 1.08 }}>
            {content.title}
          </h1>
          <p style={{ color: '#fee2e2', fontSize: 18, maxWidth: 740, margin: '0 auto', lineHeight: 1.7 }}>
            {content.description}
          </p>
        </div>
      </section>

      <section className="container" style={{ marginTop: -48, position: 'relative', zIndex: 2 }}>
        <article style={{ maxWidth: 880, margin: '0 auto', background: 'white', padding: 'clamp(28px, 6vw, 60px)', borderRadius: 24, boxShadow: '0 18px 60px rgba(15,23,42,0.12)', border: '1px solid rgba(226,232,240,0.9)' }}>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 36, fontWeight: 700 }}>
            Last Updated: {content.updatedAt}
          </p>

          <div className="policy-content" dangerouslySetInnerHTML={{ __html: content.html }} />
        </article>
      </section>

      <style>{`
        .policy-content {
          color: #4b5563;
          font-size: 16px;
          line-height: 1.85;
        }

        .policy-content h2 {
          color: #1f2937;
          font-size: clamp(22px, 3vw, 28px);
          line-height: 1.25;
          margin: 38px 0 14px;
        }

        .policy-content h2:first-child {
          margin-top: 0;
        }

        .policy-content h2 strong,
        .policy-content h4 strong {
          font-weight: 800;
        }

        .policy-content p {
          margin: 0 0 20px;
        }

        .policy-content ul,
        .policy-content ol {
          margin: 0 0 28px;
          padding-left: 22px;
        }

        .policy-content li {
          margin-bottom: 12px;
          padding-left: 4px;
        }

        .policy-content li::marker {
          color: #ef4444;
        }

        .policy-content li strong {
          color: #dc2626;
          font-weight: 800;
        }

        .policy-content a {
          color: #0f766e;
          font-weight: 700;
          text-decoration: none;
          border-bottom: 1px solid rgba(15,118,110,0.28);
        }

        .policy-content h4 {
          color: #047857;
          margin: 42px 0 8px;
          font-size: 18px;
        }

        .policy-content h4 + p {
          background: #ecfdf5;
          border-left: 4px solid #10b981;
          padding: 20px 22px;
          border-radius: 10px;
          color: #065f46;
          margin-top: 0;
        }

        .policy-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 24px 0 32px;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 0 0 1px #e5e7eb;
        }

        .policy-content td,
        .policy-content th {
          border: 1px solid #e5e7eb;
          padding: 14px 16px;
          vertical-align: top;
        }

        .policy-content tr:nth-child(even) {
          background: #f9fafb;
        }

        .cpm-intro-callout {
          background: #f8fafc;
          border-left: 4px solid var(--color-primary, #AA8453);
          border-radius: 8px;
          padding: 18px 22px;
          margin-bottom: 28px;
          font-size: 15px;
          color: #1e293b;
        }
        .cpm-intro-callout p {
          margin: 0 0 10px;
        }
        .cpm-intro-callout p:last-child {
          margin-bottom: 0;
        }

        .cpm-section {
          padding-bottom: 24px;
          margin-bottom: 24px;
          border-bottom: 1px solid #f1f5f9;
        }
        .cpm-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .policy-content h3 {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 14px;
        }

        .cpm-schedule-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin: 18px 0;
        }

        .cpm-sched-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 16px;
          text-align: center;
          transition: transform 0.15s ease;
        }
        .cpm-sched-card:hover {
          transform: translateY(-2px);
          border-color: #cbd5e1;
        }
        .cpm-sched-card--full {
          grid-column: 1 / -1;
          background: #fff5f5;
          border-color: #fed7d7;
        }

        .cpm-sched-time {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 6px;
        }
        .cpm-sched-charge {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .cpm-sched-charge--low { color: #16a34a; }
        .cpm-sched-charge--med { color: #d97706; }
        .cpm-sched-charge--high { color: #ea580c; }
        .cpm-sched-charge--critical { color: #dc2626; }

        .cpm-sched-note {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }

        .cpm-disclaimer-text {
          font-size: 13px;
          color: #64748b;
          background: #fafafa;
          padding: 12px 16px;
          border-radius: 8px;
          margin-top: 14px !important;
          border-left: 3px solid #cbd5e1;
        }

        .cpm-highlight-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 10px;
          padding: 14px 18px;
          color: #1e3a8a;
          font-size: 14px;
          margin: 14px 0;
        }
        .cpm-highlight-box--amber {
          background: #fffbeb;
          border-color: #fde68a;
          color: #92400e;
        }
        .cpm-highlight-icon {
          font-size: 20px;
          line-height: 1;
        }

        .cpm-acknowledgment-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 12px 16px;
          color: #166534;
          font-weight: 600;
          font-size: 13.5px;
          margin-top: 14px !important;
        }
      `}</style>
    </main>
  );
}
