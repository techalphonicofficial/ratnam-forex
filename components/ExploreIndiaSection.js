'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getFeaturedTourHref, BookingCardV2 } from '@/components/FeaturedToursRow';
import { getTripInquiries, getMediaUrl } from '@/utils/api';

/* ── Filter options ──────────────────────────────────── */
const FILTER_OPTIONS = {
  hotDeal: {
    label: 'Hot Deal',
    items: ['All', 'Yes', 'No'],
  },
  duration: {
    label: 'Duration',
    items: ['All', '1-3 Nights', '4-6 Nights', '7-10 Nights', '10+ Nights'],
  },
  theme: {
    label: 'Theme',
    items: ['All', 'Couple', 'Family', 'Adventure', 'Solo', 'Spiritual'],
  },
  travelClass: {
    label: 'Travel Class',
    items: ['All', 'Economy', 'Standard', 'Luxury'],
  },
  season: {
    label: 'Season',
    items: ['All', 'Summer', 'Winter', 'Monsoon', 'Spring'],
  },
};

/* ── India tour data ─────────────────────────────────── */
export const indiaTours = [
  {
    id: 'ei1',
    title: 'Kashmir Paradise',
    dest: 'India',
    locations: ['Srinagar (2N)', 'Pahalgam (2N)', 'Gulmarg (1N)'],
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80',
    nights: 5, days: 6, price: 28999, rating: 4.8,
    priceCategory: 'under50',
    type: 'COUPLE', typeColor: '#f97316',
    theme: 'couple', season: 'summer',
    user: { name: 'Riya', city: 'Delhi', avatar: 'R', avatarBg: '#f97316', ago: '2hr ago' },
  },
  {
    id: 'ei2',
    title: 'Himachal Escape',
    dest: 'India',
    locations: ['Shimla (2N)', 'Manali (2N)'],
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80',
    nights: 4, days: 5, price: 18999, rating: 4.6,
    priceCategory: 'under50',
    type: 'FAMILY', typeColor: '#6366f1',
    theme: 'family', season: 'summer',
    user: { name: 'Vikram', city: 'Chandigarh', avatar: 'V', avatarBg: '#6366f1', ago: '4hr ago' },
  },
  {
    id: 'ei3',
    title: 'Kerala Backwaters',
    dest: 'India',
    locations: ['Kochi (2N)', 'Alleppey (2N)', 'Munnar (1N)'],
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80',
    nights: 4, days: 5, price: 22999, rating: 4.7,
    priceCategory: 'under50',
    type: 'COUPLE', typeColor: '#f97316',
    theme: 'couple', season: 'monsoon',
    user: { name: 'Suresh', city: 'Chennai', avatar: 'S', avatarBg: '#10b981', ago: '5hr ago' },
  },
  {
    id: 'ei4',
    title: 'Rajasthan Royal',
    dest: 'India',
    locations: ['Jaipur (2N)', 'Jodhpur (2N)', 'Udaipur (2N)'],
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80',
    nights: 6, days: 7, price: 35999, rating: 4.8,
    priceCategory: 'under50',
    type: 'FAMILY', typeColor: '#6366f1',
    theme: 'family', season: 'winter',
    user: { name: 'Anita', city: 'Jaipur', avatar: 'A', avatarBg: '#ec4899', ago: '6hr ago' },
  },
  {
    id: 'ei5',
    title: 'Goa Beach Bliss',
    dest: 'India',
    locations: ['North Goa (3N)', 'South Goa (2N)'],
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80',
    nights: 5, days: 6, price: 19999, rating: 4.5,
    priceCategory: 'under50',
    type: 'ADVENTURE', typeColor: '#10b981',
    theme: 'adventure', season: 'winter',
    user: { name: 'Kiran', city: 'Mumbai', avatar: 'K', avatarBg: '#0ea5e9', ago: '3hr ago' },
  },
  {
    id: 'ei6',
    title: 'Andaman Islands',
    dest: 'India',
    locations: ['Port Blair (2N)', 'Havelock (3N)', 'Neil Island (1N)'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    nights: 6, days: 7, price: 42999, rating: 4.9,
    priceCategory: 'under50',
    type: 'COUPLE', typeColor: '#f97316',
    theme: 'couple', season: 'winter',
    user: { name: 'Pooja', city: 'Bangalore', avatar: 'P', avatarBg: '#ec4899', ago: '8hr ago' },
  },
  {
    id: 'ei7',
    title: 'Leh Ladakh Adventure',
    dest: 'India',
    locations: ['Leh (3N)', 'Nubra Valley (2N)', 'Pangong (1N)'],
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
    nights: 6, days: 7, price: 38999, rating: 4.8,
    priceCategory: 'under50',
    type: 'ADVENTURE', typeColor: '#10b981',
    theme: 'adventure', season: 'summer',
    user: { name: 'Arjun', city: 'Pune', avatar: 'A', avatarBg: '#10b981', ago: '1hr ago' },
  },
  {
    id: 'ei8',
    title: 'Varanasi Spiritual',
    dest: 'India',
    locations: ['Varanasi (3N)', 'Prayagraj (1N)'],
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&q=80',
    nights: 4, days: 5, price: 15999, rating: 4.6,
    priceCategory: 'under50',
    type: 'SOLO', typeColor: '#0ea5e9',
    theme: 'spiritual', season: 'winter',
    user: { name: 'Deepak', city: 'Lucknow', avatar: 'D', avatarBg: '#8b5cf6', ago: '7hr ago' },
  },
  {
    id: 'ei9',
    title: 'Sikkim Serenity',
    dest: 'India',
    locations: ['Gangtok (3N)', 'Pelling (2N)', 'Darjeeling (2N)'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    nights: 7, days: 8, price: 32999, rating: 4.7,
    priceCategory: 'under50',
    type: 'FAMILY', typeColor: '#6366f1',
    theme: 'family', season: 'spring',
    user: { name: 'Sneha', city: 'Kolkata', avatar: 'S', avatarBg: '#6366f1', ago: '9hr ago' },
  },
  {
    id: 'ei10',
    title: 'Rishikesh Thrills',
    dest: 'India',
    locations: ['Rishikesh (3N)', 'Haridwar (1N)'],
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
    nights: 4, days: 5, price: 16999, rating: 4.5,
    priceCategory: 'under50',
    type: 'ADVENTURE', typeColor: '#10b981',
    theme: 'adventure', season: 'spring',
    user: { name: 'Nikhil', city: 'Delhi', avatar: 'N', avatarBg: '#10b981', ago: '12hr ago' },
  },
];

/* ── Dropdown Filter Component ───────────────────────── */
function FilterDropdown({ label, items, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="ei-dropdown">
      <button
        className={`ei-dropdown-btn ${open ? 'ei-dropdown-btn--open' : ''} ${value !== 'All' ? 'ei-dropdown-btn--active' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span>{value !== 'All' ? value : label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="ei-dropdown-menu">
          {items.map((item) => {
            const isActive = item === value;
            return (
              <button
                key={item}
                className={`ei-dropdown-item ${isActive ? 'ei-dropdown-item--active' : ''}`}
                onClick={() => {
                  onChange(item);
                  setOpen(false);
                }}
              >
                {item}
              </button>
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
    list = list.filter(t => t.theme === filters.theme.toLowerCase());
  }

  if (filters.season !== 'All') {
    list = list.filter(t => t.season === filters.season.toLowerCase());
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

  // Mock Hot Deal logic
  if (filters.hotDeal === 'Yes') {
    list = list.filter((t, i) => i % 2 === 0);
  }

  return list;
}

/* ── Main Section ────────────────────────────────────── */
export default function ExploreIndiaSection() {
  const [filters, setFilters] = useState({
    hotDeal: 'All',
    duration: 'All',
    theme: 'All',
    travelClass: 'All',
    season: 'All',
  });
  const scrollRef = useRef(null);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filtered = applyFilters(indiaTours, filters);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' });
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
          font-family: "Italiana", sans-serif;
          font-size: clamp(18px, 2vw, 22px);
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
          flex-wrap: wrap;
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
          border: 1.5px solid #d1d5db;
          background: #ffffff;
          color: #374151;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .ei-dropdown-btn:hover {
          border-color: #9ca3af;
          background: #fafafa;
        }

        .ei-dropdown-btn--open {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(209, 180, 100, 0.12);
        }

        .ei-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          min-width: 180px;
          z-index: 50;
          padding: 6px 0;
          animation: eiDropIn 0.2s ease;
        }

        @keyframes eiDropIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ei-dropdown-item {
          display: block;
          width: 100%;
          padding: 10px 18px;
          border: none;
          background: none;
          text-align: left;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: background 0.15s;
        }

        .ei-dropdown-item:hover {
          background: #f9fafb;
        }

        .ei-dropdown-item--active {
          color: var(--color-accent);
          font-weight: 700;
          background: #fffbeb;
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
          scroll-snap-type: x proximity;
        }

        .ei-scroll-area::-webkit-scrollbar { display: none; }

        .ei-scroll-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1.5px solid var(--color-border, #E5E5E5);
          background: #ffffff;
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
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          color: #64748b;
          background: #f9fafb;
          font-size: 14px;
          font-weight: 600;
        }

        /* ── Responsive ───────────────── */
        @media (max-width: 768px) {
          .ei-scroll-btn--left { left: 4px; }
          .ei-scroll-btn--right { right: 4px; }
          
          .ei-section {
            padding: 32px 0 40px;
          }
          .ei-inner {
            padding: 0 16px;
          }
          .ei-filter-bar {
            flex-wrap: wrap;
            padding-bottom: 8px;
            justify-content: center;
          }
          .ei-filter-bar::-webkit-scrollbar { display: none; }
        }
      `}</style>

      <div className="ei-inner">
        <h2 className="ei-title" id="ei-title">
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
            {filtered.length > 0 ? (
              filtered.map((tour, idx) => (
                <div key={tour.id} style={{ width: 320, flexShrink: 0 }}>
                  <BookingCardV2 pkg={tour} animDelay={idx * 50} />
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
