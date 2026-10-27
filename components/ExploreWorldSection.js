'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getFeaturedTourHref } from '@/components/FeaturedToursRow';
import TourCard from '@/components/TourCard';
import { getTripInquiries, getMediaUrl, getPackages, normalizePackageToTour, isInternationalPackage } from '@/utils/api';

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
    items: ['All', 'Couple', 'Family', 'Adventure', 'Solo', 'Luxury'],
  },
  season: {
    label: 'Season',
    items: ['All', 'Summer', 'Winter', 'Monsoon', 'Spring'],
  },
};

/* ── Dropdown Filter Component ───────────────────────── */
function FilterDropdown({ label, items, value, onChange, alignRight = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOpt, setHoveredOpt] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayLabel = value === 'All' ? label : value;
  const isFiltered = value !== 'All';

  return (
    <div
      ref={dropdownRef}
      className="ew-dropdown"
      style={{
        position: 'relative',
        display: 'inline-block',
        flex: '1 1 0',
        minWidth: 0,
        textAlign: 'left'
      }}
    >
      <button
        type="button"
        className="ew-dropdown-btn"
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          background: 'var(--color-card, #ffffff)',
          border: isOpen || isFiltered
            ? '1px solid var(--color-primary, #aa8453)'
            : '1px solid var(--color-border)',
          borderRadius: 4,
          padding: '6px 24px 6px 10px',
          fontSize: 13,
          color: isFiltered ? 'var(--color-primary, #aa8453)' : 'var(--color-text-muted)',
          fontWeight: isFiltered ? 600 : 400,
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
          outline: 'none',
          width: '100%',
          boxShadow: isOpen
            ? '0 0 0 2px color-mix(in srgb, var(--color-primary, #aa8453) 20%, transparent)'
            : 'none',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (!isOpen && !isFiltered) e.currentTarget.style.borderColor = 'var(--color-primary, #aa8453)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen && !isFiltered) e.currentTarget.style.borderColor = 'var(--color-border)';
        }}
      >
        <span
          className="ew-dropdown-label"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block'
          }}
        >
          {displayLabel}
        </span>
        <svg
          className="ew-dropdown-arrow"
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: `translateY(-50%) ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}`,
            transition: 'transform 0.2s ease',
            pointerEvents: 'none',
            color: isFiltered || isOpen ? 'var(--color-primary, #aa8453)' : 'currentColor',
            flexShrink: 0
          }}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="ew-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: alignRight ? 'auto' : 0,
            right: alignRight ? 0 : 'auto',
            width: 'max-content',
            minWidth: '130px',
            maxWidth: '220px',
            background: 'var(--color-card, #ffffff)',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
            zIndex: 100,
            padding: '4px 0',
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          {items.map((opt) => {
            const isSelected = opt === value;
            const isHovered = opt === hoveredOpt;

            return (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                  setHoveredOpt(null);
                }}
                onMouseEnter={() => setHoveredOpt(opt)}
                onMouseLeave={() => setHoveredOpt(null)}
                style={{
                  padding: '8px 14px',
                  fontSize: 13,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected
                    ? '#ffffff'
                    : isHovered
                    ? 'var(--color-primary, #aa8453)'
                    : 'var(--color-text-primary)',
                  background: isSelected
                    ? 'var(--color-primary, #aa8453)'
                    : isHovered
                    ? 'color-mix(in srgb, var(--color-primary, #aa8453) 12%, transparent)'
                    : 'transparent',
                  transition: 'background 0.15s ease, color 0.15s ease',
                }}
              >
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

/* ── Main Section ────────────────────────────────────── */
export default function ExploreWorldSection() {
  const [filters, setFilters] = useState({
    duration: 'All',
    theme: 'All',
    travelClass: 'All',
    season: 'All',
  });
  const [worldPackages, setWorldPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const fetchWorldPackages = async () => {
      setIsLoading(true);
      try {
        const result = await getPackages({ limit: 100 });
        if (!mounted) return;
        const pkgs = Array.isArray(result) ? result.filter(isInternationalPackage).map(normalizePackageToTour) : [];
        setWorldPackages(pkgs);
      } catch (err) {
        console.error('Failed to load international packages', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchWorldPackages();
    return () => { mounted = false; };
  }, []);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filtered = applyFilters(worldPackages, filters);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const firstCard = scrollRef.current.firstElementChild;
    const cardWidth = firstCard ? firstCard.offsetWidth + 24 : scrollRef.current.offsetWidth;
    scrollRef.current.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
  };

  return (
    <section className="ew-section" aria-labelledby="ew-title">
      <style>{`
        .ew-section {
          background: var(--color-bg);
          padding: 32px 0 36px;
        }

        .ew-inner {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .ew-title {
          margin: 0 0 16px;
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
        .ew-filter-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: nowrap;
          width: 100%;
        }

        .ew-dropdown {
          position: relative;
        }

        .ew-dropdown-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 24px 6px 10px;
          border-radius: 4px;
          border: 1px solid var(--color-border);
          background: var(--color-card, #ffffff);
          color: var(--color-text-muted);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          width: 100%;
          outline: none;
        }

        .ew-dropdown-btn:hover {
          border-color: var(--color-primary, #aa8453);
        }

        /* ── Scroll area ──────────────── */
        .ew-scroll-wrapper {
          position: relative;
        }

        .ew-scroll-area {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          padding: 8px 4px 24px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-snap-type: x mandatory;
        }

        .ew-card-wrap {
          scroll-snap-align: start;
        }

        .ew-scroll-area::-webkit-scrollbar { display: none; }

        .ew-scroll-btn {
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

        .ew-scroll-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
          transform: translateY(-50%) translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .ew-scroll-btn--left { left: -18px; }
        .ew-scroll-btn--right { right: -18px; }

        .ew-scroll-btn--left { left: -18px; }
        .ew-scroll-btn--right { right: -18px; }

        .ew-card-body {
          padding: 16px 18px 18px;
        }

        .ew-card-title {
          margin: 0 0 10px;
          color: var(--color-text-primary);
          font-family: "Italiana", sans-serif;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ew-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .ew-card-duration {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--color-text-muted);
          font-size: 13px;
          font-weight: 500;
        }

        .ew-card-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--color-text-primary);
          font-size: 13px;
          font-weight: 700;
        }

        .ew-card-price {
          color: var(--color-text-primary);
          font-family: "Italiana", sans-serif;
          font-size: 22px;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 12px;
        }

        /* ── Empty state ──────────────── */
        .ew-empty {
          flex: 1 0 100%;
          min-height: 160px;
          display: grid;
          place-items: center;
          border: 2px dashed var(--color-border);
          border-radius: 12px;
          color: var(--color-text-muted);
          background: var(--color-card);
          font-size: 14px;
          font-weight: 600;
        }

        /* ── Responsive ───────────────── */
        @media (max-width: 768px) {
          .ew-scroll-btn--left { left: 4px; top: 108px !important; }
          .ew-scroll-btn--right { right: 4px; top: 108px !important; }
          
          .ew-section {
            padding: 24px 0 24px;
          }
          .ew-title {
            margin-bottom: 14px;
          }
          .ew-inner {
            padding: 0 16px;
          }
          .ew-filter-bar {
            flex-wrap: nowrap;
            padding-bottom: 6px;
            margin-bottom: 14px;
            justify-content: space-between;
            gap: 4px;
          }
          .ew-dropdown-btn {
            padding: 5px 16px 5px 6px !important;
            font-size: 11px !important;
          }
          .ew-dropdown-arrow {
            right: 4px !important;
          }
          .ew-card {
            width: calc(100vw - 40px);
          }
          .ew-card-wrap {
            width: calc(100vw - 40px);
            flex-shrink: 0;
          }
        }

        @media (min-width: 769px) {
          .ew-card-wrap {
            width: 300px;
            flex-shrink: 0;
          }
        }

        @media (max-width: 420px) {
          .ew-card {
            width: calc(100vw - 32px);
          }
        }
      `}</style>

      <div className="ew-inner">
        <h2 className="ew-title theme-underline-heading" id="ew-title">
          Explore The World
        </h2>

        {/* Filter dropdowns */}
        <div className="ew-filter-bar">
          {Object.entries(FILTER_OPTIONS).map(([key, opt], idx) => (
            <FilterDropdown
              key={key}
              label={opt.label}
              items={opt.items}
              value={filters[key]}
              onChange={(val) => updateFilter(key, val)}
              alignRight={idx >= 2}
            />
          ))}
        </div>

        {/* Cards scroll area */}
        <div className="ew-scroll-wrapper">
          <button
            className="ew-scroll-btn ew-scroll-btn--left"
            aria-label="Scroll left"
            onClick={() => scroll(-1)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          <div ref={scrollRef} className="ew-scroll-area">
            {isLoading ? (
              <div className="ew-empty" style={{ border: 'none', background: 'transparent' }}>
                <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite', color: '#FF6000' }}>
                  Loading International Packages...
                </span>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((tour, idx) => (
                <div key={tour.id} className="ew-card-wrap">
                  <TourCard tour={tour} />
                </div>
              ))
            ) : (
              <div className="ew-empty">
                No tours match your filters. Try adjusting your selection.
              </div>
            )}
          </div>

          <button
            className="ew-scroll-btn ew-scroll-btn--right"
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
