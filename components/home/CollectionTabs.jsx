'use client';

import Image from 'next/image';

function CollectionIcon() {
  return (
    <span className="collection-card-icon" aria-hidden="true">
      <span />
      <style jsx>{`
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
        @media (max-width: 540px) {
          .collection-card-icon {
            width: 26px;
            height: 20px;
            margin-bottom: 4px;
          }
        }
      `}</style>
    </span>
  );
}

export default function CollectionTabs({ collections, activeTab, onTabClick }) {
  return (
    <div className="collections-grid">
      <style>{`
        .collections-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 60px;
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
          cursor: pointer;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          border: 2px solid transparent;
        }

        .collection-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
        }

        .collection-card.active {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 24px 48px rgba(15, 23, 42, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          z-index: 10;
        }

        .collection-card img {
          object-fit: cover;
          transform: scale(1.01);
          transition: transform 0.5s ease, filter 0.5s ease;
        }

        .collection-card:hover img, .collection-card.active img {
          transform: scale(1.06);
          filter: saturate(1.1);
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
          transition: background 0.4s ease;
        }

        .collection-card:hover::before, .collection-card.active::before {
          background: linear-gradient(
            180deg,
            rgba(5, 8, 12, 0.05) 0%,
            rgba(5, 8, 12, 0.35) 50%,
            rgba(5, 8, 12, 0.88) 100%
          );
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

        .collection-card-title {
          margin: 0;
          font-family: "Italiana", sans-serif;
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
          .collections-grid {
            display: flex;
            overflow-x: auto;
            gap: 12px;
            padding-bottom: 12px;
            margin-bottom: 40px;
            scroll-snap-type: x mandatory;
            /* hide scrollbar */
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .collections-grid::-webkit-scrollbar {
            display: none;
          }
          .collection-card {
            flex: 0 0 80vw;
            aspect-ratio: 3 / 4;
            border-radius: 10px;
            scroll-snap-align: start;
          }
          .collection-card-content {
            inset: auto 10px 16px;
            gap: 4px;
          }
        }
      `}</style>

      {collections.map((collection) => (
        <button
          key={collection.id}
          className={`collection-card ${activeTab === collection.slug ? 'active' : ''}`}
          onClick={() => onTabClick(collection.slug)}
          aria-label={`View ${collection.title} collection`}
        >
          <Image
            src={collection.image}
            alt={collection.title}
            fill
            sizes="(max-width: 540px) 80vw, (max-width: 900px) 45vw, 25vw"
            priority={false}
          />
          <span className="collection-card-content">
            <CollectionIcon />
            <span className="collection-card-title">{collection.title}</span>
            <span className="collection-card-subtitle">{collection.subtitle}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
