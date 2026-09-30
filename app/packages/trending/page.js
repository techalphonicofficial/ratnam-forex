'use client';

import React, { useState, useEffect } from 'react';
import PremiumDestinationLayout from '@/components/PremiumDestinationLayout';
import DestinationPicker from '@/components/DestinationPicker';
import { getDestinations } from '@/utils/api';

export default function TrendingPackagePage() {
  const [destinations, setDestinations] = useState([]);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [destinationsError, setDestinationsError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadDestinations() {
      try {
        const data = await getDestinations();
        if (mounted && Array.isArray(data)) {
          setDestinations(data.map(d => ({
            id: d.id || d.slug,
            name: d.name || d.title,
            subtitle: d.subtitle || d.country || '',
            image: d.feature_image || d.image || '',
            type: d.type || '',
            categories: d.categories || [],
            slug: d.slug || '',
          })));
        }
      } catch (err) {
        if (mounted) setDestinationsError('Unable to load destinations.');
        console.error('Error loading destinations:', err);
      } finally {
        if (mounted) setDestinationsLoading(false);
      }
    }
    loadDestinations();
    return () => { mounted = false; };
  }, []);

  const pkg = {
    name: 'Trending Destinations, Unforgettable Journeys',
    rating: 4.9,
    review_count: 3200,
    description: 'Discover handpicked trending travel packages to top destinations. From scenic getaways to cultural experiences, our trending packages are designed to give you the best of travel — with great value, comfort and unforgettable memories.',
  };

  const media = {
    images: [
      {
        url: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=2000&q=80',
        alt: 'Trending Destinations Hero'
      },
      {
        url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80',
        alt: 'Nav'
      },
      {
        url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
        alt: 'Santorini Greece'
      },
      {
        url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
        alt: 'Thailand'
      },
      {
        url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
        alt: 'Dubai'
      }
    ]
  };

  const handleDestinationPick = (destName) => {
    if (destName) {
      window.location.href = `/tour?search=${encodeURIComponent(destName)}`;
    }
  };

  const renderBottom = () => (
    <section
      className="premium-picker-wrapper"
      style={{
        background: '#FFF9F7',
        borderTop: '1px solid #FFCEC0'
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto', paddingTop: 60, paddingBottom: 60 }}>
        <DestinationPicker
          destinations={destinations}
          error={destinationsError}
          loading={destinationsLoading}
          onPick={handleDestinationPick}
          themeClass="trending-theme trending"
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
      />
    </main>
  );
}
