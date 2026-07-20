'use client';

import { useState } from 'react';
import CollectionTabs from './CollectionTabs';
import CollectionStory from './CollectionStory';
import FeelingSection from './FeelingSection';
import { collectionsData } from './collectionsData';

export default function CollectionsSection() {
  const [activeTabSlug, setActiveTabSlug] = useState(collectionsData[0]?.slug);

  const activeCollection = collectionsData.find(c => c.slug === activeTabSlug);

  return (
    <section className="collections-section" aria-labelledby="collections-title">
      <style>{`
        .collections-section {
          position: relative;
          overflow: hidden;
          background: var(--color-bg, #ffffff);
          padding: 80px 0 100px;
        }

        .collections-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .collections-title {
          margin: 0 0 48px;
          color: var(--color-text-primary, #111827);
          font-family: "Italiana", sans-serif;
          font-size: clamp(24px, 3vw, 36px);
          font-weight: 800;
          line-height: 1.2;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        @media (max-width: 540px) {
          .collections-inner {
            padding: 0 20px;
          }
          .collections-section {
            padding: 48px 0 60px;
          }
        }
      `}</style>

      <div className="collections-inner">
        <h2 className="collections-title" id="collections-title">
          Discover Our Collections
        </h2>

        {/* Tabbed Cards */}
        <CollectionTabs 
          collections={collectionsData} 
          activeTab={activeTabSlug} 
          onTabClick={setActiveTabSlug} 
        />

        {/* Story Section updating dynamically */}
        <CollectionStory collection={activeCollection} />

        {/* Static Branding Section */}
        <FeelingSection />
      </div>
    </section>
  );
}
