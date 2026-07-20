'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function CollectionStory({ collection }) {
  if (!collection) return null;

  return (
    <div className="story-container" key={collection.id}>
      <style>{`
        .story-container {
          display: flex;
          align-items: stretch;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 80px;
          animation: fadeUp 0.5s ease-out forwards;
        }
        
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .story-content {
          flex: 0 0 45%;
          padding: 60px 40px 60px 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .story-title {
          font-family: "Italiana", sans-serif;
          font-size: clamp(28px, 3.5vw, 42px);
          font-weight: 800;
          color: #111827;
          margin: 0 0 16px 0;
        }

        .story-description {
          font-size: 16px;
          color: #4b5563;
          line-height: 1.6;
          margin: 0 0 32px 0;
        }

        .story-highlights {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px 24px;
          margin-bottom: 40px;
        }

        .highlight-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: #374151;
          font-weight: 500;
        }

        .highlight-icon {
          color: var(--color-primary);
          flex-shrink: 0;
        }

        .story-action {
          margin-top: auto;
        }

        .btn-explore {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 32px;
          background: var(--color-primary);
          color: #ffffff;
          font-weight: 600;
          font-size: 15px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.3s ease, transform 0.3s ease;
        }

        .btn-explore:hover {
          background: var(--color-primary-hover);
          transform: translateY(-2px);
        }

        .story-image-wrapper {
          flex: 0 0 55%;
          position: relative;
          min-height: 500px;
          border-radius: 12px;
          overflow: hidden;
        }

        .story-image {
          object-fit: cover;
          transition: transform 0.7s ease;
        }

        .story-image-wrapper:hover .story-image {
          transform: scale(1.03);
        }

        @media (max-width: 900px) {
          .story-container {
            flex-direction: column;
          }
          .story-content {
            padding: 40px 0;
          }
          .story-image-wrapper {
            min-height: 350px;
          }
          .story-highlights {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="story-content">
        <h3 className="story-title">{collection.title}</h3>
        <p className="story-description">{collection.description}</p>
        
        <div className="story-highlights">
          {collection.highlights?.map((highlight, idx) => (
            <div key={idx} className="highlight-item">
              <svg className="highlight-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {highlight}
            </div>
          ))}
        </div>

        <div className="story-action">
          <Link href={`/collections/${collection.slug}`} className="btn-explore">
            Explore Collection
          </Link>
        </div>
      </div>

      <div className="story-image-wrapper">
        <Image
          src={collection.featureImage}
          alt={collection.title}
          fill
          className="story-image"
          sizes="(max-width: 900px) 100vw, 55vw"
        />
      </div>
    </div>
  );
}
