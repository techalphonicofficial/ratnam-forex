'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPackages, normalizePackageToTour } from '@/utils/api';
import { CardLink, CircleButton, FilterPill, SectionIntro, SoftBadge } from '@/components/ui/TravelPrimitives';
import TourCard from '@/components/TourCard';

const CLASS_FILTERS = [
  'All',
  'Economy',
  'Standard',
  'Luxury'
];

const DEST_FILTERS = [
  'All Destinations',
  'India Unlimited',
  'International',
  'India & Beyond'
];

/* priceCategory:
   under50   = < 50000
   50to150   = 50000 – 149999
   150to250  = 150000 – 249999
   luxury    = >= 250000
*/

export const getFeaturedTourHref = (title) => {
  if (!title) return '#';
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return `/tours/${slug}`;
};

function CustomDropdown({ options, currentValue, onChange, className = '' }) {
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

  return (
    <div
      ref={dropdownRef}
      className={`custom-dropdown-wrap ${className}`}
      style={{ position: 'relative', display: 'inline-block', textAlign: 'left' }}
    >
      <button
        type="button"
        className="custom-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          background: 'var(--color-card)',
          border: isOpen ? '1px solid var(--color-primary, #aa8453)' : '1px solid var(--color-border)',
          borderRadius: 4,
          padding: '6px 28px 6px 12px',
          fontSize: 13,
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 2px color-mix(in srgb, var(--color-primary, #aa8453) 20%, transparent)' : 'none',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = 'var(--color-primary, #aa8453)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = 'var(--color-border)';
        }}
      >
        <span
          className="custom-dropdown-label"
          style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {currentValue}
        </span>
        <svg
          className="custom-dropdown-arrow"
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: `translateY(-50%) ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}`,
            transition: 'transform 0.2s ease',
            pointerEvents: 'none'
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
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div
          className="custom-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            minWidth: '130px',
            background: 'var(--color-card, #ffffff)',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
            zIndex: 100,
            padding: '4px 0',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt === currentValue;
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

/* ── Main component ───────────────────────────────────── */
export default function RecommendedPackages() {
  const [activeClass, setActiveClass] = useState('All');
  const [activeDest, setActiveDest] = useState('All Destinations');
  const [activeDuration, setActiveDuration] = useState('DURATION');
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [liveBookings, setLiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const packagesResult = await getPackages({ limit: 10 });
        if (!mounted) return;
        const livePackages = Array.isArray(packagesResult) ? packagesResult.map(normalizePackageToTour) : [];
        setLiveBookings(livePackages);
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = liveBookings;

  const handleClassSort = (val) => {
    if (val === activeClass) return;
    setVisible(false);
    setTimeout(() => {
      setActiveClass(val);
      setVisible(true);
      if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    }, 180);
  };

  const handleDestChange = (dest) => {
    if (dest === activeDest) return;
    setVisible(false);
    setTimeout(() => {
      setActiveDest(dest);
      setVisible(true);
      if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    }, 180);
  };

  const handleDurationChange = (duration) => {
    if (duration === activeDuration) return;
    setVisible(false);
    setTimeout(() => {
      setActiveDuration(duration);
      setVisible(true);
      if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    }, 180);
  };

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const scrollAmount = isMobile ? (scrollRef.current.offsetWidth - 10) : 328;
    scrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="recent-bookings-section">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .booking-cards-wrap {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          padding: 8px 4px 24px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          transition: opacity 0.18s ease;
          scroll-snap-type: x proximity;
          align-items: stretch;
        }
        .booking-cards-wrap::-webkit-scrollbar { display: none; }
        .booking-cards-wrap.hidden { opacity: 0; }
        .booking-cards-wrap.shown  { opacity: 1; }
        
        .booking-card-item {
          animation: fadeSlideIn 0.32s ease both;
        }
        
        .recent-bookings-section {
          background: var(--color-card);
          padding: 40px 0 36px 0;
        }
        
        .recent-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        /* Styled to match the dropdown filters in the design */
        .recent-filters select,
        .recent-filters button {
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          padding: 6px 12px;
          font-size: 13px;
          color: var(--color-text-muted);
          cursor: pointer;
        }
        
        .recent-scroll-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .responsive-header-row {
          display: none !important;
        }
        
        .recent-result-row {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin: -10px 0 18px;
        }
        
        .recent-result-row p,
        .recent-result-row > span:last-child {
          margin: 0;
          color: var(--color-text-muted);
          font-size: 14px;
          font-weight: 500;
        }
        
        .recent-empty-state {
          flex: 1 0 100%;
          min-height: 128px;
          display: grid;
          place-items: center;
          border: 1px dashed var(--color-border);
          border-radius: 8px;
          color: var(--color-text-muted);
          background: var(--color-bg-soft);
          font-size: 14px;
          font-weight: 600;
        }
        
        /* Updated Card Styling */
        .recent-booking-card {
          flex-shrink: 0;
          width: 300px;
          overflow: hidden;
          border: 1px solid var(--color-bg-soft);
          border-radius: 8px;
          background: var(--color-card);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          scroll-snap-align: start;
          display: flex;
          flex-direction: column;
          align-self: stretch;
          height: auto;
        }
        
        .recent-booking-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 35px rgba(255, 96, 0, 0.25), 0 4px 15px rgba(255, 96, 0, 0.15);
          border-color: var(--color-secondary, #FF6000);
        }
        
        .recent-card-media {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: var(--color-bg-soft);
        }
        
        .recent-card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .recent-booking-card:hover .recent-card-media img {
          transform: scale(1.05);
        }
        
        /* Repurposed user badge for "30% OFF" style tag */
        .recent-user-badge {
          position: absolute;
          left: 12px;
          top: 12px;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 4px;
          background: var(--color-secondary); /* Red tag matching design */
          color: var(--color-card);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        
        .recent-user-avatar {
          display: none; /* Hidden to match clean Figma tag */
        }
        
        .recent-user-badge span {
          white-space: nowrap;
        }
        
        .recent-card-body { 
          padding: 16px 20px; 
        }
        
        .recent-card-title {
          margin: 0 0 10px;
          color: var(--color-text-primary);
          font-family: "Italiana", sans-serif;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Styled as the "6N/7D | Rating" row */
        .recent-card-location {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0 0 16px;
          color: var(--color-text-muted);
          font-size: 13px;
          font-weight: 500;
        }
        
        .recent-card-tags {
          display: none; /* Hidden if strictly following the Figma card layout */
        }
        
        .recent-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--color-bg-soft);
          padding-top: 16px;
        }
        
        .recent-card-price {
          color: var(--color-text-primary); /* Dark price text */
          font-family: "Italiana", sans-serif;
          font-size: 18px;
          font-weight: 700;
        }
        
        /* Repurposed as the "EXPLORE NOW" action button */
        .recent-card-price-note {
          margin: 0;
          color: #eab308; /* Theme gold/orange color */
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        
        .recent-card-price-note:hover {
          color: #ca8a04;
        }

        @media (max-width: 768px) {
           .recent-bookings-section { padding: 24px 0 20px; }
           .recent-bookings-header {
             margin-bottom: 16px !important;
           }
           .recent-bookings-header p {
             margin-bottom: 12px !important;
           }
           .recent-bookings-header .live-badge-wrap {
             margin-bottom: 14px !important;
           }
           .recent-bookings-header .recent-filters {
             margin-bottom: 0 !important;
           }
           .recent-bookings-btn-wrap {
             margin-top: 16px !important;
           }
           .recent-bookings-section .th-section-intro {
             width: 100%;
             min-width: 0;
             margin-bottom: 16px;
           }
           .recent-bookings-section .th-section-copy,
           .recent-bookings-section .th-section-actions {
             width: 100%;
             min-width: 0;
           }
           .recent-bookings-section .th-section-copy h2 {
             font-size: clamp(24px, 7vw, 28px);
           }
           .recent-bookings-section .th-section-copy p {
             font-size: 14px;
           }
           .recent-bookings-section .th-section-actions {
             display: grid;
             gap: 12px;
           }
           .recent-filters {
             width: 100% !important;
             display: flex !important;
             flex-direction: row !important;
             flex-wrap: nowrap !important;
             justify-content: space-between !important;
             align-items: center !important;
             gap: 6px !important;
             padding-bottom: 6px;
             box-sizing: border-box !important;
           }
           .recent-filters .custom-dropdown-wrap {
             flex: 1 1 0 !important;
             min-width: 0 !important;
             max-width: 100% !important;
             display: block !important;
           }
           .recent-filters .custom-dropdown-wrap:first-child {
             flex: 1.25 1 0 !important;
           }
           .recent-filters .custom-dropdown-wrap:nth-child(2) {
             flex: 0.95 1 0 !important;
           }
           .recent-filters .custom-dropdown-wrap:nth-child(3) {
             flex: 0.8 1 0 !important;
           }
           .recent-filters .custom-dropdown-btn {
             width: 100% !important;
             min-width: 0 !important;
             box-sizing: border-box !important;
             padding: 6px 18px 6px 8px !important;
             font-size: 11.5px !important;
             display: flex !important;
             align-items: center !important;
             justify-content: space-between !important;
           }
           .recent-filters .custom-dropdown-label {
             min-width: 0 !important;
             flex: 1 1 auto !important;
             white-space: nowrap !important;
             overflow: hidden !important;
             text-overflow: ellipsis !important;
             display: block !important;
             text-align: left !important;
           }
           .recent-filters .custom-dropdown-arrow {
             right: 5px !important;
             width: 10px !important;
             height: 10px !important;
           }
           .recent-filters .custom-dropdown-menu {
             min-width: 120px !important;
             width: max-content !important;
             max-width: 190px !important;
             z-index: 1000 !important;
           }
           .recent-filters .custom-dropdown-wrap:last-child .custom-dropdown-menu {
             left: auto !important;
             right: 0 !important;
           }
           .recent-scroll-actions { display: none; }
           .recent-booking-card { 
             width: calc((100vw - 40px) / 0.85); 
             zoom: 0.85; 
           }
           .responsive-header-row {
             flex-direction: column;
             align-items: flex-start !important;
             gap: 16px !important;
           }
        }

        .th-scroll-btn-pos--left { left: -22px; }
        .th-scroll-btn-pos--right { right: -22px; }

        @media (max-width: 420px) {
           .recent-bookings-section .th-section-copy p {
             font-size: 13px;
           }
           .recent-filters {
             gap: 4px !important;
           }
           .recent-filters .custom-dropdown-btn {
             padding: 5px 16px 5px 6px !important;
             font-size: 11px !important;
           }
           .recent-booking-card {
             width: calc((100vw - 32px) / 0.85);
           }
        }
        @media (max-width: 991px) {
          .th-scroll-btn-pos--left { left: 4px; top: 108px !important; }
          .th-scroll-btn-pos--right { right: 4px; top: 108px !important; }
        }
      `}</style>

      <div className="container">
        {/* ── Centered Header Section matching design ── */}
        <div className="recent-bookings-header" style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 className="theme-underline-heading" style={{ fontFamily: '"Italiana", sans-serif', fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
            Hot Deals
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', margin: '0 0 20px' }}>
            Unbeatable prices for unforgettable places creates a nice, memorable rhythm!
          </p>
          
          <div className="live-badge-wrap" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--color-primary-light)', border: '1px solid var(--color-secondary)', padding: '4px 12px', borderRadius: 999, marginBottom: 24 }}>
             <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-secondary)' }}></div>
             <span style={{ fontSize: 11, fontWeight: 700, color: '#FF6000', letterSpacing: 0.5 }}>
               {liveBookings.length ? `${liveBookings.length}+ tour packages` : '20+ tour packages'}
             </span>
          </div>

          <div className="recent-filters">
             <CustomDropdown currentValue={activeDest} onChange={handleDestChange} options={DEST_FILTERS} />
             <CustomDropdown currentValue={activeDuration} onChange={handleDurationChange} options={['DURATION', '1-3 Days', '4-7 Days', '8+ Days']} />
             <CustomDropdown currentValue={activeClass} onChange={handleClassSort} options={CLASS_FILTERS} />
          </div>
        </div>

        {/* ── Cards horizontal scroll ── */}
        <div style={{ position: 'relative' }}>
          <div
            ref={scrollRef}
            className={`booking-cards-wrap ${visible ? 'shown' : 'hidden'}`}
          >
            {filtered.slice(0, 5).map((pkg, idx) => (
              <TourCard key={pkg.id} tour={pkg} className="recent-booking-card" />
            ))}
            {!loading && filtered.length === 0 && (
              <div className="recent-empty-state">
                Live trip inquiries will appear here once the API returns data.
              </div>
            )}
          </div>
          
          <button
            onClick={() => scroll(-1)}
            aria-label="Previous"
            className="th-scroll-btn-pos--left"
            style={{
              position: 'absolute', top: '35%', transform: 'translateY(-50%)',
              width: 44, height: 44, borderRadius: '50%', border: '1.5px solid var(--color-border, #E5E5E5)',
              background: 'var(--color-card)', color: 'var(--color-text-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(-50%) translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border, #E5E5E5)'; e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.transform = 'translateY(-50%)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          <button
            onClick={() => scroll(1)}
            aria-label="Next"
            className="th-scroll-btn-pos--right"
            style={{
              position: 'absolute', top: '35%', transform: 'translateY(-50%)',
              width: 44, height: 44, borderRadius: '50%', border: '1.5px solid var(--color-border, #E5E5E5)',
              background: 'var(--color-card)', color: 'var(--color-text-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(-50%) translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border, #E5E5E5)'; e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.transform = 'translateY(-50%)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        {/* View More Button */}
        <div className="recent-bookings-btn-wrap" style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/packages?hideFilters=true" className="btn-primary circle-btn-hover" style={{ display: 'inline-flex', width: 'auto', minWidth: '160px' }}>
            <svg className="circle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            View All Hot Deals
          </Link>
        </div>

      </div>
    </section>
  );
}
