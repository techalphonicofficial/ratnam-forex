'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getMediaUrl } from '@/utils/api';

export default function DescribeSection({ sectionData, collectionDescriptions = [] }) {
  const dataToMap = sectionData?.json_data?.collections || [];
  const sectionTitle = sectionData?.title || 'Distinct Journey Collections';

  // Build a map: slug-key -> description for quick lookup
  const descriptionBySlug = {};
  collectionDescriptions.forEach((item) => {
    // Use item.key if available (new format), otherwise strip 'collections/' from slug
    const k = item.key || (item.slug || '').replace(/^collections\//, '').split('/')[0];
    if (k) descriptionBySlug[k] = item.description;
  });

  return (
    <section className="collections-section" aria-labelledby="collections-title">
      <style>{`
        .collections-section {
          position: relative;
          background: var(--color-bg);
          padding: 60px 0 80px;
        }

        .collections-inner {
          /* Removed max-width and padding to rely on Bootstrap container */
        }

        .collections-title {
          margin: 0 0 50px;
          color: var(--color-text-primary);
          font-family: "Italiana", sans-serif;
          font-size: clamp(28px, 3.5vw, 42px);
          font-weight: 800;
          text-align: center;
        }

        .collection-block {
          display: flex;
          align-items: stretch;
          margin-bottom: 60px;
          gap: 50px;
        }

        /* Alternate layout for even items. Use nth-of-type so the h2 doesn't mess up the count */
        .collection-block:nth-of-type(even) {
          flex-direction: row-reverse;
        }

        .collection-text {
          flex: 0 0 calc(45% - 25px);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .collection-heading {
          font-family: "Italiana", sans-serif;
          font-size: clamp(28px, 3.5vw, 40px);
          font-weight: 800;
          color: var(--color-text-primary);
          margin: auto 0 20px 0;
        }

        .collection-desc {
          font-size: 16px;
          color: var(--color-text-muted);
          line-height: 1.6;
          margin: 0 0 32px 0;
        }

        .collection-highlights {
          display: grid;
          grid-template-columns: repeat(2, max-content);
          justify-content: center;
          gap: 12px 20px;
        }

        .highlight-item {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 10px;
          font-size: 15px;
          color: var(--color-text-primary);
          font-weight: 500;
        }

        .highlight-icon {
          color: #FF6000;
          flex-shrink: 0;
        }

        .btn-explore {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 32px;
          background: var(--color-primary);
          color: var(--color-card);
          font-weight: 600;
          font-size: 15px;
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: background 0.3s ease, transform 0.3s ease;
          align-self: center;
          margin-top: 32px;
        }

        .btn-explore:hover {
          background: color-mix(in srgb, var(--color-primary) 85%, black);
          transform: translateY(-2px);
        }

        .collection-image-wrapper {
          flex: 0 0 calc(55% - 25px);
          position: relative;
          aspect-ratio: 16 / 10;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          transition: box-shadow 0.4s ease;
        }

        .collection-image {
          object-fit: cover;
          transition: transform 0.7s ease;
        }

        .collection-image-wrapper:hover {
          box-shadow: 0 12px 35px rgba(255, 96, 0, 0.25), 0 4px 15px rgba(255, 96, 0, 0.15);
        }

        .collection-image-wrapper:hover .collection-image {
          transform: scale(1.03);
        }

        .collection-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 10;
          background: var(--color-secondary, #FF6000);
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 4px;
          pointer-events: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        }

        @media (max-width: 900px) {
          .collection-block, .collection-block:nth-of-type(even) {
            flex-direction: column-reverse; /* Stack with text on bottom, image on top */
            gap: 30px;
            margin-bottom: 50px;
          }
          .collection-image-wrapper {
            aspect-ratio: 4 / 3;
            width: 100%;
          }
          .collection-heading {
            margin-top: 0;
          }
          .btn-explore {
            margin-top: 40px;
          }
        }

        @media (max-width: 540px) {
          .collection-highlights {
            grid-template-columns: repeat(2, max-content);
            gap: 10px 15px; /* slightly smaller gap on mobile */
          }
          .collections-section {
            padding: 40px 0;
          }
        }
      `}</style>

      <div className="container">
        <div style={{ textAlign: 'center' }}>
          <h2 className="collections-title theme-underline-heading" id="collections-title">
            {sectionTitle}
          </h2>
        </div>

        {dataToMap.map((collection, index) => {
          const id = collection.id || index;
          const title = collection.label || collection.title;
          const description = collection.description;
          const rawImage = collection.image;
          const imageSrc = rawImage && rawImage.startsWith('http') ? rawImage : (rawImage ? getMediaUrl(rawImage) : '');
          const buttonLink = collection.button_link || (collection.slug ? `/collections/${collection.slug}` : '');
          const buttonLabel = collection.button_label || 'Explore Collection';
          const highlights = collection.features ? collection.features.map(f => f.label) : collection.highlights;
          // Get the page description for this collection (from API) – falls back to null
          // Try collection.slug first, then extract last segment from button_link
          const collectionSlugKey = collection.slug ||
            (collection.button_link ? collection.button_link.replace(/^\/collections\//, '').split('/')[0] : '');
          const badgeText = descriptionBySlug[collectionSlugKey] || null;

          return (
            <div key={id} className="collection-block">
              <div className="collection-text">
                <h3 className="collection-heading">{title}</h3>
                <p className="collection-desc">{description}</p>
                
                <div className="collection-highlights">
                  {highlights?.map((highlight, idx) => (
                    <div key={idx} className="highlight-item">
                      <svg className="highlight-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {highlight}
                    </div>
                  ))}
                </div>

                {buttonLink && (
                  <Link href={buttonLink} className="btn-explore circle-btn-hover">
                    <svg className="circle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    {buttonLabel}
                  </Link>
                )}
              </div>

              <div className="collection-image-wrapper">
                {imageSrc && (
                  <Image
                    src={imageSrc}
                    alt={title || 'Collection Image'}
                    fill
                    className="collection-image"
                    sizes="(max-width: 900px) 100vw, 55vw"
                  />
                )}
                {badgeText && (
                  <span className="collection-badge">{badgeText}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}