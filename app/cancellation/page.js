import Image from 'next/image';
import Link from 'next/link';
import { getMediaUrl, getPageBySlug } from '@/utils/api';
import { getCompanyInfo } from '@/utils/companyInfo';
import {
  transformCancellationHtml,
  FALLBACK_CANCELLATION_HTML,
} from '@/utils/cancellationPolicy';

export const dynamic = 'force-dynamic';

const CANCELLATION_HERO_IMAGE = '/images/cancellation-hero-banner.jpg';

const findSection = (page, section) =>
  page?.details?.find(
    (item) => item.section === section || item.key === 'cancillation_key' || item.key === 'cancellation_key'
  );

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

const extractRefundSummary = (html) => {
  if (!html) return null;
  const match = html.match(/(?:2\.\s*Refund Policy|Refund Policy)<\/strong><\/h3>\s*<p>([\s\S]*?)<\/p>/i);
  if (match && match[1]) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text.length > 20) return text;
  }
  return null;
};

const parseSidebarSection = (refundSection, rawDesc) => {
  let refundTitle = refundSection?.title || 'Refund Policy';
  let refundDesc = '';
  let steps = [];
  let helpTitle = 'Need Help?';
  let helpDesc = 'Our travel experts are here to assist you with any questions.';

  const tabContent =
    refundSection?.json_data?.tabs?.[0]?.content ||
    (typeof refundSection?.json_data === 'string' ? refundSection.json_data : '') ||
    '';
  const plainDesc = refundSection?.description || '';

  if (tabContent) {
    const titleMatch = tabContent.match(/<h3><strong>(.*?)<\/strong><\/h3>/i);
    if (titleMatch && titleMatch[1]) {
      refundTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    const descMatch = tabContent.match(/<\/h3>\s*<p>(.*?)<\/p>/i);
    if (descMatch && descMatch[1]) {
      refundDesc = descMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    // Extract steps: all <p><strong>...</strong></p> before Need Help
    const parts = tabContent.split(/<h3><strong>\s*Need Help\??\s*<\/strong><\/h3>/i);
    if (parts[0]) {
      const stepMatches = [...parts[0].matchAll(/<p>\s*<strong>(.*?)<\/strong>\s*<\/p>/gi)];
      steps = stepMatches
        .map((m) => m[1].replace(/&amp;/g, '&').replace(/<[^>]+>/g, '').trim())
        .filter((s) => s && !s.toLowerCase().includes('refund policy'));
    }

    if (parts[1]) {
      const hMatch = tabContent.match(/<h3><strong>\s*(Need Help\??)\s*<\/strong><\/h3>/i);
      if (hMatch && hMatch[1]) helpTitle = hMatch[1].replace(/<[^>]+>/g, '').trim();
      const pMatch = parts[1].match(/<p>(.*?)<\/p>/i);
      if (pMatch && pMatch[1]) helpDesc = pMatch[1].replace(/<[^>]+>/g, '').trim();
    }
  }

  // Fallback to plain description if HTML didn't yield values
  if (!refundDesc && plainDesc) {
    const lines = plainDesc.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0) refundDesc = lines[0];

    const needHelpIdx = lines.findIndex((l) => /need help\?/i.test(l));
    if (needHelpIdx !== -1) {
      helpTitle = lines[needHelpIdx];
      if (lines[needHelpIdx + 1]) helpDesc = lines[needHelpIdx + 1];
      if (steps.length === 0) steps = lines.slice(1, needHelpIdx);
    } else if (steps.length === 0) {
      steps = lines.slice(1);
    }
  }

  // Default fallback if still empty
  if (!refundDesc) {
    refundDesc =
      extractRefundSummary(rawDesc) ||
      'Once a cancellation request has been reviewed and the applicable charges have been calculated, any eligible refund will be processed using the original payment method wherever possible.';
  }

  if (steps.length === 0) {
    steps = [
      'Request Received',
      'Verification & Review',
      'Refund Approved',
      'Refund Processed',
    ];
  }

  return { refundTitle, refundDesc, steps, helpTitle, helpDesc };
};

const buildCancellationContent = (page, fallbackSlug = 'cancellation-policy') => {
  const storyGrid = findSection(page, 'story_grid');
  const rawDesc = storyGrid?.json_data?.story_desc || page?.meta_description || FALLBACK_CANCELLATION_HTML;
  const statsVal = Array.isArray(storyGrid?.json_data?.stats) ? storyGrid.json_data.stats[0]?.value : null;

  // Eyebrow / breadcrumb title
  const eyebrow = page?.title || storyGrid?.title || 'Cancellation Policy';

  // Hero main heading title:
  const rawTitle = page?.description || page?.title || storyGrid?.title || 'Cancellation & Refund Policy';

  // Subtitle / heading content:
  const description =
    storyGrid?.json_data?.heading_content?.trim() ||
    page?.meta_description ||
    'Transparent terms & a clear refund process';

  // Hero image: Dynamic from CMS feature_image, with fallback
  const cmsImage = getMediaUrl(page?.feature_image);
  const image = cmsImage || CANCELLATION_HERO_IMAGE;
  const imageAlt = page?.alt_text || page?.title || 'Cancellation policy';

  // Body HTML
  const html = transformCancellationHtml(rawDesc);

  // Last Updated Date
  const updatedAt = statsVal || formatDate(page?.updated_at || page?.created_at);

  // Refund policy & help details from CMS details (e.g. section tabs_section, key refund_policy)
  const refundSection = page?.details?.find(
    (d) =>
      d.section === 'tabs_section' ||
      d.key === 'refund_policy' ||
      d.title?.toLowerCase().includes('refund')
  );
  const sidebarData = parseSidebarSection(refundSection, rawDesc);

  return {
    slug: page?.slug || fallbackSlug,
    eyebrow,
    title: rawTitle,
    description,
    image,
    imageAlt,
    html,
    updatedAt,
    refundTitle: sidebarData.refundTitle,
    refundDesc: sidebarData.refundDesc,
    steps: sidebarData.steps,
    helpTitle: sidebarData.helpTitle,
    helpDesc: sidebarData.helpDesc,
    schema: page?.schema,
  };
};

export const fetchCancellationCmsPage = async (requestedSlug = 'cancellation-policy') => {
  let page = null;
  const targetSlug = requestedSlug || 'cancellation-policy';

  // 1. Try requested slug
  page = await getPageBySlug(targetSlug);

  // 2. Try alternative slugs if not found
  if (!page && targetSlug !== 'cancellation-policy') {
    page = await getPageBySlug('cancellation-policy');
  }
  if (!page && targetSlug !== 'cancellation') {
    page = await getPageBySlug('cancellation');
  }

  return page;
};

export async function generateMetadata(props) {
  const params = await props?.params;
  const searchParams = await props?.searchParams;
  const slug = params?.slug || searchParams?.slug || 'cancellation-policy';

  const page = await fetchCancellationCmsPage(slug);
  const companyInfo = await getCompanyInfo();

  const title = page?.meta_title || page?.title || 'Cancellation & Refund Policy';
  const description =
    page?.meta_description ||
    page?.description ||
    `Cancellation and refund policy for ${companyInfo?.company_name || 'ITS TRAVELS AND TOURS'}.`;
  const image = getMediaUrl(page?.feature_image) || CANCELLATION_HERO_IMAGE;

  return {
    title,
    description,
    keywords: page?.keyword ? [page.keyword] : undefined,
    alternates: {
      canonical: `/${page?.slug || slug || 'cancellation'}`,
    },
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: page?.alt_text || title }],
    },
  };
}

function renderDynamicTitle(title) {
  if (!title) return null;
  const trimmed = String(title).trim();

  // If contains "&"
  if (trimmed.includes('&')) {
    const parts = trimmed.split('&');
    const firstPart = parts[0].trim();
    const secondPart = parts.slice(1).join('&').trim();
    return (
      <>
        <span className="title-dark">{firstPart} &amp;</span>
        <span className="title-gold">{secondPart}</span>
      </>
    );
  }

  // If contains " and "
  if (/\s+and\s+/i.test(trimmed)) {
    const parts = trimmed.split(/\s+and\s+/i);
    const firstPart = parts[0].trim();
    const secondPart = parts.slice(1).join(' and ').trim();
    return (
      <>
        <span className="title-dark">{firstPart} and</span>
        <span className="title-gold">{secondPart}</span>
      </>
    );
  }

  // If multiple words (e.g. "Cancellation Policy")
  const words = trimmed.split(/\s+/);
  if (words.length > 1) {
    const splitIndex = Math.ceil(words.length / 2);
    const firstHalf = words.slice(0, splitIndex).join(' ');
    const secondHalf = words.slice(splitIndex).join(' ');
    return (
      <>
        <span className="title-dark">{firstHalf}</span>
        <span className="title-gold">{secondHalf}</span>
      </>
    );
  }

  return <span className="title-dark">{trimmed}</span>;
}

export default async function CancellationPolicy(props) {
  const params = await props?.params;
  const searchParams = await props?.searchParams;
  const requestedSlug = params?.slug || searchParams?.slug || 'cancellation-policy';

  const [page, companyInfo] = await Promise.all([
    fetchCancellationCmsPage(requestedSlug),
    getCompanyInfo(),
  ]);

  const content = buildCancellationContent(page, requestedSlug);
  const phone = companyInfo?.contact?.phone || '2323424';
  const whatsapp = companyInfo?.contact?.whatsapp || phone || '3232323';
  const email = companyInfo?.contact?.email || 'info@tourandholiday.com';
  const rawPhone = String(phone).replace(/[^0-9]/g, '') || '2323424';
  const rawWhatsapp = String(whatsapp).replace(/[^0-9]/g, '') || rawPhone;

  const cleanUpdatedDate = String(content.updatedAt || 'October 2026')
    .replace(/^Updated\s+/i, '')
    .trim();

  let schemaJson = null;
  if (content.schema && typeof content.schema === 'string') {
    try {
      schemaJson = JSON.parse(content.schema);
    } catch {
      // ignore invalid json
    }
  }

  return (
    <main className="cancellation-page-wrap" data-slug={content.slug}>
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
      )}

      {/* ── SEAMLESS PANORAMIC HERO (MATCHING REFERENCE IMAGE) ── */}
      <section className="cancellation-hero">
        <div className="cancellation-hero-bg">
          <Image
            src={content.image}
            alt={content.imageAlt}
            fill
            priority
            unoptimized={typeof content.image === 'string' && content.image.startsWith('http')}
            sizes="100vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'right center',
            }}
          />
          <div className="cancellation-hero-overlay" />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="row align-items-center">
            <div className="col-12 col-md-9 col-lg-7 cancellation-hero-left">
              <nav aria-label="breadcrumb" className="cancellation-breadcrumb mb-3">
                <Link href="/" className="crumb-link">Home</Link>
                <span className="crumb-sep">/</span>
                <span className="crumb-current">{content.eyebrow}</span>
              </nav>

              <h1 className="cancellation-hero-title">
                {renderDynamicTitle(content.title)}
              </h1>

              <p className="cancellation-hero-subtitle">
                {content.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT & SIDEBAR ─────────────────────────────────── */}
      <section className="cancellation-body-section">
        <div className="container">
          <div className="row g-4 g-lg-5">
            {/* Left Column: Main Policy Card */}
            <div className="col-12 col-lg-8">
              <article className="cancellation-main-card">
                <div className="cancellation-updated-bar">
                  <svg className="updated-cal-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>Last Updated: {cleanUpdatedDate}</span>
                </div>

                <div className="policy-content" dangerouslySetInnerHTML={{ __html: content.html }} />
              </article>
            </div>

            {/* Right Column: Sidebar */}
            <div className="col-12 col-lg-4">
              <aside className="cancellation-sidebar">
                {/* Card 1: Refund Policy Process */}
                <div className="sidebar-card refund-policy-card">
                  <div className="sidebar-card-header">
                    <div className="sidebar-icon-circle">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                    </div>
                    <h3 className="sidebar-card-title">{content.refundTitle}</h3>
                  </div>

                  <p className="sidebar-card-desc">
                    {content.refundDesc}
                  </p>

                  <div className="refund-stepper">
                    {content.steps.map((step, idx) => {
                      const isLast = idx === content.steps.length - 1;
                      return (
                        <div
                          key={idx}
                          className={`stepper-item ${isLast ? 'stepper-item--active' : ''}`}
                        >
                          <div
                            className={`stepper-marker ${isLast ? 'stepper-marker--active' : ''}`}
                          ></div>
                          <div
                            className={`stepper-text ${isLast ? 'stepper-text--active' : ''}`}
                          >
                            {step}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card 2: Need Help? */}
                <div className="sidebar-card need-help-card">
                  <div className="sidebar-card-header">
                    <div className="sidebar-icon-circle">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                      </svg>
                    </div>
                    <h3 className="sidebar-card-title">{content.helpTitle}</h3>
                  </div>

                  <p className="sidebar-card-desc">
                    {content.helpDesc}
                  </p>

                  <div className="need-help-contacts">
                    {phone && (
                      <a href={`tel:${phone}`} className="help-contact-item">
                        <svg className="help-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                        </svg>
                        <span>{phone}</span>
                      </a>
                    )}
                    {whatsapp && (
                      <a href={`https://wa.me/${rawWhatsapp}`} target="_blank" rel="noopener noreferrer" className="help-contact-item">
                        <svg className="help-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.177 8.177 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.53c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29" />
                        </svg>
                        <span>{whatsapp}</span>
                      </a>
                    )}
                    {email && (
                      <a href={`mailto:${email}`} className="help-contact-item">
                        <svg className="help-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                        <span>{email}</span>
                      </a>
                    )}
                  </div>

                  <Link href="/contact" className="contact-support-btn">
                    Contact Support
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .cancellation-page-wrap {
          background: #F8F6F0;
          min-height: 100vh;
        }

        /* ── Hero Section ────────────────────────────── */
        .cancellation-hero {
          position: relative;
          min-height: 400px;
          display: flex;
          align-items: center;
          background: #FDFBF7;
          border-bottom: 1px solid #EAE3D6;
          padding: 146px 0 52px;
          overflow: hidden;
        }

        .cancellation-hero-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .cancellation-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            #FDFBF7 0%,
            #FDFBF7 40%,
            rgba(253, 251, 247, 0.94) 52%,
            rgba(253, 251, 247, 0.45) 68%,
            transparent 88%
          );
        }

        .cancellation-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: #6B7280;
        }

        .crumb-link {
          color: #6B7280;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.15s ease;
        }

        .crumb-link:hover {
          color: var(--color-primary, #C28E46);
        }

        .crumb-sep {
          color: #9CA3AF;
        }

        .crumb-current {
          color: #4B5563;
        }

        .cancellation-hero-title {
          font-family: 'Hoefler Text', 'Italiana', Georgia, serif;
          font-size: clamp(38px, 4.8vw, 56px);
          font-weight: 850;
          line-height: 1.12;
          margin: 16px 0 16px;
          letter-spacing: -0.5px;
        }

        .title-dark {
          color: #1F2937;
          display: block;
        }

        .title-gold {
          color: var(--color-primary, #C28E46);
          display: block;
        }

        .cancellation-hero-subtitle {
          font-size: clamp(15px, 1.8vw, 17px);
          color: #64748B;
          max-width: 520px;
          line-height: 1.6;
          margin: 0;
        }

        /* ── Body Section ────────────────────────────── */
        .cancellation-body-section {
          padding: 44px 0 88px;
        }

        .cancellation-main-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #EFEAE0;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.03);
          padding: clamp(24px, 4vw, 42px);
        }

        .cancellation-updated-bar {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #4B5563;
          margin-bottom: 26px;
        }

        .updated-cal-icon {
          color: #9CA3AF;
        }

        /* ── Policy Content Styles ────────────────────── */
        .policy-content {
          color: #4B5563;
          font-size: 15px;
          line-height: 1.75;
        }

        .cpm-intro-callout {
          background: #FCFBF7;
          border: 1px solid #EFEAE0;
          border-left: 4px solid var(--color-primary, #C28E46);
          border-radius: 8px;
          padding: 18px 22px;
          margin-bottom: 30px;
          font-size: 14.5px;
          line-height: 1.7;
          color: #374151;
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
          border-bottom: 1px solid #F1ECE1;
        }

        .cpm-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .cpm-section-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: clamp(18px, 2.4vw, 21px);
          font-weight: 800;
          color: #111827;
          margin: 32px 0 14px;
          letter-spacing: -0.2px;
        }

        .cpm-section-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary, #C28E46);
          flex-shrink: 0;
        }

        .policy-content p {
          margin: 0 0 16px;
        }

        .policy-content ul,
        .policy-content ol {
          margin: 0 0 24px;
          padding-left: 22px;
        }

        .policy-content li {
          margin-bottom: 10px;
        }

        .policy-content li::marker {
          color: var(--color-primary, #C28E46);
        }

        /* ── Schedule Table matching Reference Image ──── */
        .cpm-schedule-box {
          background: #FAF7F2;
          border: 1px solid #EFEAE0;
          border-radius: 12px;
          padding: 18px 20px;
          margin: 22px 0 16px;
        }

        .cpm-table-head {
          display: grid;
          grid-template-columns: minmax(260px, 340px) 1fr;
          gap: 20px;
          font-size: 13px;
          font-weight: 800;
          color: #78716C;
          padding: 0 4px 12px;
          border-bottom: 1px solid #EFE8DC;
          margin-bottom: 12px;
        }

        .cpm-table-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cpm-table-row {
          display: grid;
          grid-template-columns: minmax(260px, 340px) 1fr;
          gap: 20px;
          align-items: center;
          padding: 2px 0;
        }

        .cpm-table-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #F3EDE3;
          border: 1px solid #EAE2D5;
          border-radius: 8px;
          padding: 9px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .cpm-cal-icon {
          color: #9A7B38;
          flex-shrink: 0;
        }

        .cpm-table-charge {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .cpm-charge-rate {
          font-size: 15.5px;
          font-weight: 800;
          color: #9A6F29;
          white-space: nowrap;
        }

        .cpm-charge-note {
          font-size: 13px;
          color: #6B7280;
        }

        @media (max-width: 640px) {
          .cpm-table-head {
            display: none;
          }
          .cpm-table-row {
            grid-template-columns: 1fr;
            gap: 8px;
            padding: 6px 0;
            border-bottom: 1px dashed #EFE8DC;
          }
          .cpm-table-row:last-child {
            border-bottom: none;
          }
        }

        /* ── Disclaimer Callout ──────────────────────── */
        .cpm-disclaimer-callout {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #FAF8F4;
          border: 1px solid #EFEAE0;
          border-radius: 10px;
          padding: 14px 18px;
          margin: 16px 0 28px;
        }

        .cpm-disclaimer-icon {
          color: #B8860B;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .cpm-disclaimer-text {
          font-size: 13px;
          line-height: 1.65;
          color: #4B5563;
          margin: 0 !important;
        }

        /* ── Highlight Boxes ─────────────────────────── */
        .cpm-highlight-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #F4F7FC;
          border: 1px solid #DCE6F5;
          border-radius: 10px;
          padding: 14px 18px;
          color: #1E3A8A;
          font-size: 14px;
          margin: 16px 0;
        }

        .cpm-highlight-box--amber {
          background: #FEFAF2;
          border-color: #F8E7C5;
          color: #92400E;
        }

        .cpm-highlight-icon {
          font-size: 18px;
          line-height: 1;
        }

        .cpm-acknowledgment-box {
          background: #F2FBF5;
          border: 1px solid #C7EED4;
          border-radius: 8px;
          padding: 14px 18px;
          color: #15803D;
          font-weight: 600;
          font-size: 13.5px;
          margin-top: 16px !important;
        }

        /* ── Sidebar Styles (Sticky & Balanced +10%) ──── */
        .cancellation-sidebar {
          position: sticky;
          top: 105px;
          z-index: 10;
        }

        .sidebar-card {
          background: #FFFFFF;
          border: 1px solid #EFEAE0;
          border-radius: 16px;
          padding: 24px 26px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          margin-bottom: 18px;
        }

        .sidebar-card:last-child {
          margin-bottom: 0;
        }

        .sidebar-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .sidebar-icon-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(194, 142, 70, 0.12);
          color: #B8860B;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-icon-circle svg {
          width: 19px;
          height: 19px;
        }

        .sidebar-card-title {
          font-size: 17px;
          font-weight: 800;
          color: #111827;
          margin: 0;
          letter-spacing: -0.2px;
        }

        .sidebar-card-desc {
          font-size: 13.5px;
          line-height: 1.6;
          color: #4B5563;
          margin-bottom: 16px;
        }

        /* ── Stepper ─────────────────────────────────── */
        .refund-stepper {
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          padding-left: 26px;
        }

        .refund-stepper::before {
          content: '';
          position: absolute;
          left: 4.5px;
          top: 5px;
          bottom: 8px;
          width: 1.5px;
          background: #E5E7EB;
        }

        .stepper-item {
          position: relative;
          display: flex;
          align-items: center;
        }

        .stepper-marker {
          position: absolute;
          left: -26px;
          width: 11.5px;
          height: 11.5px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 2px solid #C28E46;
          box-sizing: border-box;
        }

        .stepper-marker--active {
          background: #B8860B;
          border-color: #B8860B;
          box-shadow: 0 0 0 2.5px rgba(184, 134, 11, 0.2);
        }

        .stepper-text {
          font-size: 13.5px;
          font-weight: 600;
          color: #6B7280;
        }

        .stepper-text--active {
          font-weight: 800;
          color: #9A6F29;
        }

        /* ── Need Help Contacts ──────────────────────── */
        .need-help-contacts {
          display: flex;
          flex-direction: column;
          gap: 11px;
          margin-bottom: 18px;
        }

        .help-contact-item {
          display: flex;
          align-items: center;
          gap: 11px;
          color: #1F2937;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .help-contact-item:hover {
          color: var(--color-primary, #B8860B);
        }

        .help-icon {
          color: #9A7B38;
          flex-shrink: 0;
          width: 17px;
          height: 17px;
        }

        .contact-support-btn {
          display: block;
          width: 100%;
          text-align: center;
          background: #9A6F29;
          color: #FFFFFF !important;
          font-size: 14px;
          font-weight: 700;
          padding: 11px 20px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.15s ease;
        }

        .contact-support-btn:hover {
          background: #7F581A;
          transform: translateY(-1px);
        }

        @media (max-width: 991px) {
          .cancellation-hero {
            padding: 120px 0 40px;
          }
          .cancellation-hero-overlay {
            background: linear-gradient(
              180deg,
              rgba(253, 251, 247, 0.95) 0%,
              rgba(253, 251, 247, 0.88) 60%,
              rgba(253, 251, 247, 0.6) 100%
            );
          }
          .cancellation-sidebar {
            position: static;
            margin-top: 16px;
          }
        }
      `}</style>
    </main>
  );
}
