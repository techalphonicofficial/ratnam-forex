'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getFeaturedTourHref } from '@/components/FeaturedToursRow';
import TourCard from '@/components/TourCard';
import { getTripInquiries, getMediaUrl, getPackages, normalizePackageToTour } from '@/utils/api';

/* ── Filter options ──────────────────────────────────── */
const FILTER_OPTIONS = {
  duration: {
    label: 'Duration',
    items: ['All', '1-3 Nights', '4-6 Nights', '7-10 Nights', '10+ Nights'],
  },
  travelClass: {
    label: 'Travel Class',
    items: ['All', 'Economy', 'Standard', 'Luxury'],
  },
  theme: {
    label: 'Theme',
    items: ['All', 'Couple', 'Family', 'Adventure', 'Solo', 'Spiritual'],
  },
  season: {
    label: 'Season',
    items: ['All', 'Summer', 'Winter', 'Monsoon', 'Spring'],
  },
};

/* ── Filter Logic ────────────────────────────────────── */
function applyFilters(tours, filters) {
  let list = [...tours];

  if (filters.theme !== 'All') {
    list = list.filter(t => t.theme?.toLowerCase() === filters.theme.toLowerCase());
  }

  if (filters.season !== 'All') {
    list = list.filter(t => t.season?.toLowerCase() === filters.season.toLowerCase());
  }

  if (filters.travelClass !== 'All') {
    if (filters.travelClass === 'Economy') list = list.filter(t => t.price < 50000);
    else if (filters.travelClass === 'Standard') list = list.filter(t => t.price >= 50000 && t.price < 150000);
    else if (filters.travelClass === 'Luxury') list = list.filter(t => t.price >= 150000);
  }

  if (filters.duration !== 'All') {
    if (filters.duration === '1-3 Nights') list = list.filter(t => t.nights <= 3);
    else if (filters.duration === '4-6 Nights') list = list.filter(t => t.nights >= 4 && t.nights <= 6);
    else if (filters.duration === '7-10 Nights') list = list.filter(t => t.nights >= 7 && t.nights <= 10);
    else if (filters.duration === '10+ Nights') list = list.filter(t => t.nights > 10);
  }

  return list;
}

/* ── Dropdown Filter Component ───────────────────────── */
function FilterDropdown({ label, items, value, onChange }) {
  return (
    <div className="ei-dropdown" style={{ position: 'relative', display: 'inline-block', flex: '0 1 auto', minWidth: 0 }}>
      <select
        className="ei-dropdown-btn"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          padding: '6px 18px 6px 8px',
          fontSize: '12px',
          width: '100%',
          outline: 'none',
          textOverflow: 'ellipsis'
        }}
      >
        <option disabled value="">{label}</option>
        {items.map((item) => (
          <option key={item} value={item}>
            {item === 'All' ? label : item}
          </option>
        ))}
      </select>
      <svg style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
    </div>
  );
}

/* ── Main Section ────────────────────────────────────── */
export default function ExploreIndiaSection() {
  const [filters, setFilters] = useState({
    duration: 'All',
    theme: 'All',
    travelClass: 'All',
    season: 'All',
  });
  const [indiaPackages, setIndiaPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const fetchIndiaPackages = async () => {
      setIsLoading(true);
      try {
        const result = await getPackages({ country: 'india' });
        if (!mounted) return;
        const pkgs = Array.isArray(result) ? result.map(normalizePackageToTour) : [];
        setIndiaPackages(pkgs);
      } catch (err) {
        console.error('Failed to load India packages', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchIndiaPackages();
    return () => { mounted = false; };
  }, []);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filtered = applyFilters(indiaPackages, filters);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const firstCard = scrollRef.current.firstElementChild;
    const cardWidth = firstCard ? firstCard.offsetWidth + 24 : scrollRef.current.offsetWidth;
    scrollRef.current.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
  };

  return (
    <section className="ei-section" aria-labelledby="ei-title">
      <style>{`
        .ei-section {
          background: var(--color-bg);
          padding: 48px 0 56px;
        }

        .ei-inner {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .ei-title {
          margin: 0 0 24px;
          color: #151922;
          font-family: 'Hoefler Text', 'Voga', serif;
          font-size: clamp(28px, 4vw, 36px);
          font-weight: 800;
          line-height: 1.2;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        /* ── Filter bar ───────────────── */
        .ei-filter-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 28px;
          flex-wrap: nowrap;
          width: 100%;
        }

        .ei-dropdown {
          position: relative;
        }

        .ei-dropdown-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 999px;
          border: 1.5px solid var(--color-border);
          background: var(--color-card);
          color: var(--color-text-primary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .ei-dropdown-btn:hover {
          border-color: var(--color-text-muted);
          background: #fafafa;
        }

        .ei-dropdown-item--active {
          color: white;
          font-weight: 700;
          background: var(--color-primary);
        }

        /* ── Scroll area ──────────────── */
        .ei-scroll-wrapper {
          position: relative;
        }

        .ei-scroll-area {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          padding: 8px 4px 24px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-snap-type: x mandatory;
        }

        .ei-card-wrap {
          scroll-snap-align: start;
        }

        .ei-scroll-area::-webkit-scrollbar { display: none; }

        .ei-scroll-btn {
          position: absolute;
          top: 35%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1.5px solid var(--color-border, #E5E5E5);
          background: var(--color-card);
          color: var(--color-text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }

        .ei-scroll-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
          transform: translateY(-50%) translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .ei-scroll-btn--left { left: -18px; }
        .ei-scroll-btn--right { right: -18px; }

        /* ── Empty state ──────────────── */
        .ei-empty {
          flex: 1 0 100%;
          min-height: 160px;
          display: grid;
          place-items: center;
          border: 2px dashed var(--color-border);
          border-radius: 12px;
          color: var(--color-text-muted);
          background: var(--color-bg-soft);
          font-size: 14px;
          font-weight: 600;
        }

        /* ── Responsive ───────────────── */
        @media (max-width: 768px) {
          .ei-scroll-btn--left { left: 4px; top: 108px !important; }
          .ei-scroll-btn--right { right: 4px; top: 108px !important; }
          
          .ei-section {
            padding: 32px 0 40px;
          }
          .ei-inner {
            padding: 0 16px;
          }
          .ei-filter-bar {
            flex-wrap: nowrap;
            padding-bottom: 8px;
            justify-content: space-between;
            gap: 4px;
          }
          .ei-card-wrap {
            width: calc(100vw - 40px);
            flex-shrink: 0;
          }
        }

        @media (min-width: 769px) {
          .ei-card-wrap {
            width: 300px;
            flex-shrink: 0;
          }
        }
      `}</style>

      <div className="ei-inner">
        <h2 className="ei-title theme-underline-heading" id="ei-title">
          Explore India
        </h2>

        {/* Filter dropdowns */}
        <div className="ei-filter-bar">
          {Object.entries(FILTER_OPTIONS).map(([key, opt]) => (
            <FilterDropdown
              key={key}
              label={opt.label}
              items={opt.items}
              value={filters[key]}
              onChange={(val) => updateFilter(key, val)}
            />
          ))}
        </div>

        {/* Cards scroll area */}
        <div className="ei-scroll-wrapper">
          <button
            className="ei-scroll-btn ei-scroll-btn--left"
            aria-label="Scroll left"
            onClick={() => scroll(-1)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          <div ref={scrollRef} className="ei-scroll-area">
            {isLoading ? (
              <div className="ei-empty" style={{ border: 'none', background: 'transparent' }}>
                <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite', color: '#FF6000' }}>
                  Loading Incredible India Packages...
                </span>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((tour, idx) => (
                <div key={tour.id} className="ei-card-wrap">
                  <TourCard tour={tour} />
                </div>
              ))
            ) : (
              <div className="ei-empty">
                No tours match your filters. Try adjusting your selection.
              </div>
            )}
          </div>

          <button
            className="ei-scroll-btn ei-scroll-btn--right"
            aria-label="Scroll right"
            onClick={() => scroll(1)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
