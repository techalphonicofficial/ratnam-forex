'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getHomeCategories, getMediaUrl } from '@/utils/api';

const DEFAULT_CUSTOMIZE_ROOMS = [
  {
    id: 1,
    adults: 2,
    children: 0,
    childAges: [],
  },
];

const fallbackImages = [
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&q=80',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=300&q=80',
  'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=300&q=80',
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=300&q=80',
];

const getFallbackCategoryImage = (name) => {
  const normalized = String(name || '').toLowerCase();
  if (normalized.includes('couple')) return fallbackImages[0];
  if (normalized.includes('family')) return fallbackImages[1];
  if (normalized.includes('friends')) return fallbackImages[2];
  return fallbackImages[3];
};

const getCategoryIcon = (label) => {
  const l = String(label || '').toLowerCase();
  if (l.includes('couple') || l.includes('friends')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="8" width="12" height="14" rx="2" ry="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <path d="M10 12v6" />
        <path d="M14 12v6" />
      </svg>
    );
  }
  if (l.includes('family')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.5l-1 2c-.2.5 0 1 .5 1.3L9 13l-4 4-2.5-.5c-.3-.1-.6 0-.8.2l-1 1c-.3.3-.3.8 0 1.1l3.5 1.5 1.5 3.5c.3.3.8.3 1.1 0l1-1c.2-.2.3-.5.2-.8L7.5 19l4-4 3 5.8c.3.5.8.7 1.3.5l2-1c.3-.2.6-.6.5-1.1z"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
};

export default function TravelerTypesSection() {
  const router = useRouter();
  const travellerRowRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTraveler, setActiveTraveler] = useState(null);
  const [canScroll, setCanScroll] = useState({ prev: false, next: false });

  const updateScrollState = useCallback(() => {
    const row = travellerRowRef.current;
    if (!row) return;
    const maxScroll = Math.max(0, row.scrollWidth - row.clientWidth);
    setCanScroll({
      prev: row.scrollLeft > 4,
      next: row.scrollLeft < maxScroll - 4,
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadCategories() {
      try {
        const data = await getHomeCategories();
        if (!mounted) return;
        if (data?.length) {
          setCategories(
            data
              .slice()
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              .map((cat, idx) => ({
                id: cat.id || cat.slug || cat.name?.toLowerCase(),
                label: cat.name,
                image: getMediaUrl(cat.feature_image) || getFallbackCategoryImage(cat.name),
                alt: cat.feature_image_alt || cat.name,
              }))
          );
        }
      } catch (err) {
        console.error('Error loading traveler types:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const row = travellerRowRef.current;
    if (!row) return;
    row.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    updateScrollState();
    return () => {
      row.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [categories, updateScrollState]);

    // Auto-scrolling implemented via CSS marquee animation.

  const handleSelect = (label) => {
    const params = new URLSearchParams();
    params.set('step', '0');
    params.set('subStep', 'room-config');
    params.set('traveller', String(label || '').trim());
    params.set('rooms', JSON.stringify(DEFAULT_CUSTOMIZE_ROOMS));
    router.push(`/customize?${params.toString()}`);
  };

  if (loading) return null;
  if (categories.length === 0) return null;

  return (
    <section
      style={{
        position: 'relative',
        padding: '80px 0 84px',
        background: 'var(--color-bg)',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(80px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 14px)); }
        }
        .sec-traveller-option {
          flex: 0 0 186px;
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          color: var(--color-text-primary);
          font-family: Poppins, sans-serif;
          text-align: center;
          transition: transform 0.35s ease-out;
          scroll-snap-align: start;
        }
        .sec-traveller-option:hover,
        .sec-traveller-option.is-active {
          transform: translateY(-10px);
        }
        .sec-traveller-visual {
          position: relative;
          display: flex;
          justify-content: center;
          height: 250px;
          margin-bottom: 30px;
        }
        .sec-traveller-photo-wrap {
          position: relative;
          width: 170px;
          height: 250px;
          border-radius: 120px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.12);
          border: 3px solid transparent;
          transition: border-color 0.35s ease-out, transform 0.35s ease-out, box-shadow 0.35s ease-out;
          will-change: transform, box-shadow;
        }
        .sec-traveller-option:hover .sec-traveller-photo-wrap,
        .sec-traveller-option.is-active .sec-traveller-photo-wrap {
          border-color: var(--color-primary);
          transform: scale(1.05);
          box-shadow: 0 18px 36px rgba(0,0,0,0.18);
        }
        .sec-traveller-photo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 120px;
        }
        .sec-traveller-badge {
          position: absolute;
          bottom: -22px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 50px;
          background: #FFFFFF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(0,0,0,0.25);
          z-index: 2;
          color: #A3C644;
          transition: transform 0.25s ease, background 0.25s ease;
        }
        .sec-traveller-option:hover .sec-traveller-badge,
        .sec-traveller-option.is-active .sec-traveller-badge {
          transform: translateX(-50%) scale(1.1);
          background: #F2F8D9;
        }
        .sec-traveller-badge svg {
          width: 24px;
          height: 24px;
        }
        .sec-traveller-label {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          font-size: 17.5px;
          line-height: 1.2;
          font-weight: 900;
          text-transform: uppercase;
          white-space: nowrap;
          transition: color 0.22s ease;
        }
        .sec-traveller-option:hover .sec-traveller-label,
        .sec-traveller-option.is-active .sec-traveller-label {
          color: var(--color-accent);
        }
        .sec-traveller-label svg {
          width: 14px;
          height: 14px;
          stroke-width: 3.5;
          flex: 0 0 auto;
        }
        .sec-traveller-marquee-wrapper {
          overflow: hidden;
          width: 100%;
          position: relative;
          display: flex;
        }
        .sec-traveller-row {
          display: flex;
          gap: 28px;
          width: max-content;
          padding: 16px 8px;
          animation: marqueeScroll 25s linear infinite;
          will-change: transform;
        }
        .sec-traveller-row:hover {
          animation-play-state: paused;
        }
        @media (max-width: 768px) {
          .sec-traveller-option { flex-basis: 150px; }
          .sec-traveller-row { gap: 16px; }
          .sec-traveller-photo-wrap {
            width: 130px;
            height: 195px;
            border-radius: 80px;
          }
          .sec-traveller-visual { height: 195px; margin-bottom: 26px; }
          .sec-traveller-photo-wrap img { border-radius: 80px; }
          .sec-traveller-label { font-size: 15px; }
          .sec-traveller-scroll-btn { display: none; }
          .sec-traveller-badge { width: 44px; height: 44px; bottom: -18px; }
          .sec-traveller-badge svg { width: 20px; height: 20px; }
        }
      `}</style>

      <div className="container" style={{ margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2.2,
            textTransform: 'uppercase',
            color: "var(--color-primary)",
            display: 'block',
            marginBottom: 8
          }}>
            Design Your Dream Trip
          </span>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(24px, 3vw, 36px)',
            color: 'var(--color-text-primary)',
            margin: '0 0 12px',
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            Who is traveling with you?
          </h2>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: 15,
            maxWidth: 580,
            margin: '0 auto'
          }}>
            Select your travel companionship to view itineraries custom-crafted for your vibe.
          </p>
        </div>

        {/* Scroll row wrapper */}
        <div className="sec-traveller-marquee-wrapper">
          <div
            ref={travellerRowRef}
            className="sec-traveller-row"
          >
            {[...categories, ...categories].map(({ id, label, image, alt }, index) => (
              <button
                key={`${id}-${index}`}
                type="button"
                className={`sec-traveller-option${activeTraveler === id ? ' is-active' : ''}`}
                onMouseEnter={() => setActiveTraveler(id)}
                onFocus={() => setActiveTraveler(id)}
                onMouseLeave={() => setActiveTraveler(null)}
                onBlur={() => setActiveTraveler(null)}
                onClick={() => handleSelect(label)}
              >
                <span className="sec-traveller-visual">
                  <span className="sec-traveller-photo-wrap">
                    <img src={image} alt={alt || label} loading="lazy" />
                    <span className="sec-traveller-badge">
                      {getCategoryIcon(label)}
                    </span>
                  </span>
                </span>
                <span className="sec-traveller-label">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
