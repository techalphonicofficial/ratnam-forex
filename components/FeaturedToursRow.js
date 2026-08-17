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

function CustomDropdown({ label, options, currentValue, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = currentValue;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', minWidth: '130px', textAlign: 'left' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 4,
          padding: '6px 28px 6px 12px',
          fontSize: 13,
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none'
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayValue}</span>
        <svg style={{ position: 'absolute', right: 8, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          width: '100%',
          minWidth: '150px',
          maxHeight: '160px',
          overflowY: 'auto',
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 4,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 100
        }}>
          {label && (
            <div
              style={{
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 'bold',
                color: 'var(--color-text-muted)',
                borderBottom: '1px solid var(--color-bg-soft)',
                background: 'var(--color-bg-soft)'
              }}
            >
              {label}
            </div>
          )}
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              style={{
                padding: '8px 12px',
                fontSize: 13,
                color: opt === currentValue ? 'var(--color-primary)' : 'var(--color-text-primary)',
                background: opt === currentValue ? 'var(--color-bg-soft)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (opt !== currentValue) e.currentTarget.style.background = 'var(--color-bg-soft)';
              }}
              onMouseLeave={(e) => {
                if (opt !== currentValue) e.currentTarget.style.background = 'transparent';
              }}
            >
              {opt}
            </div>
          ))}
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
        }
        .booking-cards-wrap::-webkit-scrollbar { display: none; }
        .booking-cards-wrap.hidden { opacity: 0; }
        .booking-cards-wrap.shown  { opacity: 1; }
        
        .booking-card-item {
          animation: fadeSlideIn 0.32s ease both;
        }
        
        .recent-bookings-section {
          background: var(--color-card);
          padding: 100px 0 60px 0;
        }
        
        .recent-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          min-width: 0;
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
           .recent-bookings-section { padding: 40px 0; }
           .recent-bookings-section .th-section-intro {
             width: 100%;
             min-width: 0;
             margin-bottom: 20px;
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
             width: 100%;
             flex-wrap: wrap;
             justify-content: center;
           }
           .recent-filters::-webkit-scrollbar { display: none; }
           .recent-scroll-actions { display: none; }
           .recent-booking-card { width: calc(100vw - 40px); }
           .responsive-header-row {
             flex-direction: column;
             align-items: flex-start !important;
             gap: 20px !important;
           }
        }

        .th-scroll-btn-pos--left { left: -22px; }
        .th-scroll-btn-pos--right { right: -22px; }

        @media (max-width: 420px) {
           .recent-bookings-section .th-section-copy p {
             font-size: 13px;
           }
           .recent-filters {
             gap: 8px;
           }
           .recent-filters > * {
             flex: 0 0 auto;
           }
           .recent-booking-card {
             width: calc(100vw - 32px);
           }
        }
        @media (max-width: 991px) {
          .th-scroll-btn-pos--left { left: 4px; top: 108px !important; }
          .th-scroll-btn-pos--right { right: 4px; top: 108px !important; }
        }
      `}</style>

      <div className="container">
        {/* ── Centered Header Section matching design ── */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 className="theme-underline-heading" style={{ fontFamily: '"Italiana", sans-serif', fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
            Hot Deals
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', margin: '0 0 20px' }}>
            Unbeatable prices for unforgettable places creates a nice, memorable rhythm!
          </p>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--color-primary-light)', border: '1px solid var(--color-secondary)', padding: '4px 12px', borderRadius: 999, marginBottom: 24 }}>
             <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-secondary)' }}></div>
             <span style={{ fontSize: 11, fontWeight: 700, color: '#FF6000', letterSpacing: 0.5 }}>
               {liveBookings.length ? `${liveBookings.length}+ tour packages` : '20+ tour packages'}
             </span>
          </div>

          <div className="recent-filters" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
             <CustomDropdown currentValue={activeDest} onChange={handleDestChange} options={DEST_FILTERS} />
             <CustomDropdown currentValue={activeDuration} onChange={handleDurationChange} options={['DURATION', '1-3 Days', '4-7 Days', '8+ Days']} />
             <CustomDropdown label="TRAVEL CLASS" currentValue={activeClass} onChange={handleClassSort} options={CLASS_FILTERS} />
          </div>

          <div className="recent-result-row" style={{ color: 'var(--color-text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <span style={{ background: 'var(--color-primary)', color: 'white', padding: '3px 10px', borderRadius: 12, marginRight: 8, fontWeight: 700 }}>
               {filtered.length} itineraries
             </span>
             <span>
               {loading ? 'loading latest trips' : 'showing top combined trips'}
             </span>
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
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/packages?hideFilters=true" className="btn-primary circle-btn-hover" style={{ display: 'inline-flex', width: 'auto', minWidth: '160px' }}>
            <svg className="circle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            View All Hot Deals
          </Link>
        </div>

      </div>
    </section>
  );
}
