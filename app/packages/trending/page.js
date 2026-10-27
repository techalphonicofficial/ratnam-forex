'use client';

import React, { useState, useEffect } from 'react';
import PremiumDestinationLayout from '@/components/PremiumDestinationLayout';
import DestinationPicker from '@/components/DestinationPicker';
import {
  getDestinations,
  getHomeDestinations,
  getPackages,
  getPageBySlug,
  getMediaUrl,
} from '@/utils/api';

export default function TrendingPackagePage() {
  const [cmsPageData, setCmsPageData] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [destinationsError, setDestinationsError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setDestinationsLoading(true);
      setDestinationsError('');

      try {
        const [dests, trendingDests, visaFreeDests, cmsRes] = await Promise.all([
          getDestinations(),
          getHomeDestinations('trending'),
          getHomeDestinations('visa-free'),
          getPageBySlug('trending-package'),
        ]);

        if (!mounted) return;

        if (cmsRes?.data) {
          setCmsPageData(cmsRes.data);
        } else if (cmsRes) {
          setCmsPageData(cmsRes);
        }

        if (Array.isArray(dests)) {
          const imageMap = new Map();
          [...(trendingDests || []), ...(visaFreeDests || [])].forEach((d) => {
            if (d?.id && d?.feature_image) {
              imageMap.set(d.id, d.feature_image);
            }
          });

          const defaultFallbacks = [
            'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
          ];

          setDestinations(
            dests.map((d, index) => ({
              id: d.id || d.slug,
              name: d.name || d.title,
              subtitle: d.subtitle || d.country || '',
              image:
                d.feature_image ||
                imageMap.get(d.id) ||
                defaultFallbacks[index % defaultFallbacks.length],
              type: d.type || '',
              categories: d.categories || [],
              slug: d.slug || '',
            }))
          );
        }
      } catch (err) {
        if (mounted) setDestinationsError('Unable to load destinations.');
        console.error('Error loading trending package data:', err);
      } finally {
        if (mounted) setDestinationsLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const pkg = {
    name: cmsPageData?.title || 'Trending Destinations, Unforgettable Journeys',
    rating: 4.9,
    review_count: 3200,
    description:
      cmsPageData?.description ||
      'Discover handpicked trending travel packages designed for unforgettable journeys. From scenic getaways and beautiful beaches to vibrant cities and cultural experiences, explore destinations that travelers love.',
  };

  const media = {
    images: [
      {
        url: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=2000&q=80',
        alt: 'Trending Destinations Hero',
      },
      {
        url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
        alt: 'Nav',
      },
    ],
  };

  const handleDestinationPick = (destName) => {
    if (destName) {
      window.location.href = `/customize?step=1&dest=${encodeURIComponent(destName)}&traveller=Trending`;
    }
  };

  const renderBottom = () => (
    <section
      className="premium-picker-wrapper"
      style={{
        background: '#FFF9F7',
        borderTop: '1px solid #FFCEC0',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto', paddingTop: 0, paddingBottom: 32 }}>
        <DestinationPicker
          destinations={destinations}
          error={destinationsError}
          loading={destinationsLoading}
          onPick={handleDestinationPick}
          themeClass="trending-theme trending"
          cmsPage={cmsPageData}
          showMarketingSections={true}
        />
      </div>
    </section>
  );

  return (
    <main style={{ background: '#FFF9F7', minHeight: '100vh' }}>
      <PremiumDestinationLayout
        pkg={pkg}
        media={media}
        destinationNames={[]}
        includedItems={[]}
        excludedItems={[]}
        renderBottom={renderBottom}
        themeType="trending"
        cmsPage={cmsPageData}
      />
    </main>
  );
}
