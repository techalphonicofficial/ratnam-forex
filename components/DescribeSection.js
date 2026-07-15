'use client';

import Image from 'next/image';
import Link from 'next/link';

const collections = [
  {
    title: 'Incredible India',
    subtitle: 'Timeless. Diverse. Incredible.',
    slug: 'incredible-india',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=900&q=80',
  },
  {
    title: 'International',
    subtitle: 'Explore Beyond Borders',
    slug: 'international',
    image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=900&q=80',
  },
  {
    title: 'India Unlimited',
    subtitle: 'Endless Journeys Within',
    slug: 'india-unlimited',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=900&q=80',
  },
  {
    title: 'Trans India',
    subtitle: 'Crossing Landscapes',
    slug: 'trans-india',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80',
  },
];

function CollectionIcon() {
  return (
    <span className="collection-card-icon" aria-hidden="true">
      <span />
    </span>
  );
}

export default function DescribeSection() {
  return (
    <section className="collections-section" aria-labelledby="collections-title">
      <style>{`
        .collections-section {
          position: relative;
          overflow: hidden;
          background: var(--color-bg);
          padding: 48px 0 56px;
        }

        .collections-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .collections-title {
          margin: 0 0 28px;
          color: var(--color-text-primary);
          font-family: var(--font-poppins), Poppins, sans-serif;
          font-size: clamp(18px, 2vw, 22px);
          font-weight: 800;
          line-height: 1.2;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .collections-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .collection-card {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          border-radius: 12px;
          background: #101318;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.1);
          isolation: isolate;
          text-decoration: none;
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }

        .collection-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
        }

        .collection-card img {
          object-fit: cover;
          transform: scale(1.01);
          transition: transform 450ms ease, filter 450ms ease;
        }

        .collection-card::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            180deg,
            rgba(5, 8, 12, 0.02) 0%,
            rgba(5, 8, 12, 0.3) 50%,
            rgba(5, 8, 12, 0.82) 100%
          );
          transition: background 0.35s ease;
        }

        .collection-card:hover::before {
          background: linear-gradient(
            180deg,
            rgba(5, 8, 12, 0.05) 0%,
            rgba(5, 8, 12, 0.35) 50%,
            rgba(5, 8, 12, 0.88) 100%
          );
        }

        .collection-card:hover img {
          transform: scale(1.06);
          filter: saturate(1.1);
        }

        .collection-card:focus-visible {
          outline: 3px solid var(--color-accent);
          outline-offset: 3px;
        }

        .collection-card-content {
          position: absolute;
          inset: auto 16px 24px;
          z-index: 2;
          display: grid;
          justify-items: center;
          gap: 6px;
          text-align: center;
          color: #ffffff;
        }

        .collection-card-icon {
          position: relative;
          width: 30px;
          height: 24px;
          display: inline-grid;
          place-items: center;
          border: 2px solid rgba(255, 255, 255, 0.85);
          border-radius: 5px;
          background: rgba(8, 12, 17, 0.25);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
          margin-bottom: 6px;
        }

        .collection-card-icon::before {
          content: '';
          position: absolute;
          top: -7px;
          width: 12px;
          height: 6px;
          border: 2px solid rgba(255, 255, 255, 0.85);
          border-bottom: 0;
          border-radius: 4px 4px 0 0;
        }

        .collection-card-icon span {
          width: 8px;
          height: 8px;
          border-right: 2px solid rgba(255, 255, 255, 0.9);
          border-bottom: 2px solid rgba(255, 255, 255, 0.9);
          transform: rotate(45deg) translate(-1px, -1px);
        }

        .collection-card-title {
          margin: 0;
          font-family: var(--font-poppins), Poppins, sans-serif;
          font-size: clamp(14px, 1.4vw, 18px);
          font-weight: 800;
          line-height: 1.15;
          text-transform: uppercase;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
          letter-spacing: 0.3px;
        }

        .collection-card-subtitle {
          margin: 0;
          color: rgba(255, 255, 255, 0.85);
          font-size: clamp(11px, 1vw, 13px);
          font-weight: 500;
          line-height: 1.2;
          font-style: italic;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
        }

        /* Tablet */
        @media (max-width: 900px) {
          .collections-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .collection-card {
            aspect-ratio: 4 / 3;
          }
        }

        /* Mobile */
        @media (max-width: 540px) {
          .collections-section {
            padding: 32px 0 40px;
          }
          .collections-inner {
            padding: 0 16px;
          }
          .collections-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .collection-card {
            aspect-ratio: 3 / 4;
            border-radius: 10px;
          }
          .collection-card-content {
            inset: auto 10px 16px;
            gap: 4px;
          }
          .collection-card-icon {
            width: 26px;
            height: 20px;
            margin-bottom: 4px;
          }
        }
      `}</style>

      <div className="collections-inner">
        <h2 className="collections-title" id="collections-title">
          Discover Our Collections
        </h2>

        <div className="collections-grid">
          {collections.map((collection) => (
            <Link
              key={collection.title}
              className="collection-card"
              href={`/collections/${collection.slug}`}
            >
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                sizes="(max-width: 540px) 45vw, (max-width: 900px) 45vw, 25vw"
                priority={false}
              />
              <span className="collection-card-content">
                <CollectionIcon />
                <span className="collection-card-title">{collection.title}</span>
                <span className="collection-card-subtitle">{collection.subtitle}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}