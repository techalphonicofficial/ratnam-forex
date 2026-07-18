'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { allBookings, getFeaturedTourHref } from '@/components/FeaturedToursRow';
import { getTripInquiries, getMediaUrl } from '@/utils/api';

/* ── Filter options ──────────────────────────────────── */
const FILTER_OPTIONS = {
  theme: {
    label: 'Theme',
    items: ['All', 'Couple', 'Family', 'Adventure', 'Solo', 'Luxury'],
  },
  travelClass: {
    label: 'Travel Class',
    items: ['All', 'Economy', 'Standard', 'Luxury'],
  },
  season: {
    label: 'Season',
    items: ['All', 'Summer', 'Winter', 'Monsoon', 'Spring'],
  },
  duration: {
    label: 'Duration',
    items: ['All', '1-3 Nights', '4-6 Nights', '7-10 Nights', '10+ Nights'],
  },
};

/* ── Explore world tour data ─────────────────────────── */
export const exploreTours = [
  {
    id: 'ew1',
    title: 'Switzerland Spectacular',
    dest: 'Europe',
    locations: ['Zurich (2N)', 'Interlaken (3N)', 'Lucerne (2N)'],
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&q=80',
    nights: 6, days: 7, price: 135999, rating: 4.8,
    priceCategory: '50to150',
    type: 'COUPLE', typeColor: '#f97316',
    theme: 'couple', season: 'summer',
    user: { name: 'Priya', city: 'Bangalore', avatar: 'P', avatarBg: '#10b981', ago: '2hr ago' },
  },
  {
    id: 'ew2',
    title: 'Thailand Tropical',
    dest: 'Thailand',
    locations: ['Bangkok (3N)', 'Phuket (2N)'],
    image: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=600&q=80',
    nights: 5, days: 6, price: 45999, rating: 4.6,
    priceCategory: 'under50',
    type: 'FAMILY', typeColor: '#6366f1',
    theme: 'family', season: 'winter',
    user: { name: 'Hema', city: 'Chennai', avatar: 'H', avatarBg: '#6366f1', ago: '5hr ago' },
  },
  {
    id: 'ew3',
    title: 'Turkey Delight',
    dest: 'Turkey',
    locations: ['Istanbul (3N)', 'Cappadocia (3N)', 'Antalya (1N)'],
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80',
    nights: 6, days: 7, price: 68999, rating: 4.7,
    priceCategory: '50to150',
    type: 'ADVENTURE', typeColor: '#10b981',
    theme: 'adventure', season: 'spring',
    user: { name: 'Rahul', city: 'Hyderabad', avatar: 'R', avatarBg: '#ec4899', ago: '3hr ago' },
  },
  {
    id: 'ew4',
    title: 'Bali Bliss',
    dest: 'Bali',
    locations: ['Ubud (3N)', 'Seminyak (3N)', 'Nusa Dua (2N)'],
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
    nights: 8, days: 9, price: 75656, rating: 4.9,
    priceCategory: '50to150',
    type: 'COUPLE', typeColor: '#f97316',
    theme: 'couple', season: 'summer',
    user: { name: 'Gaurav', city: 'Mumbai', avatar: 'G', avatarBg: '#f97316', ago: '10hr ago' },
  },
  {
    id: 'ew5',
    title: 'Japan Cherry Blossom',
    dest: 'Japan',
    locations: ['Tokyo (4N)', 'Kyoto (3N)', 'Osaka (3N)'],
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80',
    nights: 10, days: 11, price: 145000, rating: 4.8,
    priceCategory: '50to150',
    type: 'SOLO', typeColor: '#0ea5e9',
    theme: 'solo', season: 'spring',
    user: { name: 'Arjun', city: 'Hyderabad', avatar: 'A', avatarBg: '#0ea5e9', ago: '5hr ago' },
  },
  {
    id: 'ew6',
    title: 'Dubai Dazzle',
    dest: 'Dubai',
    locations: ['Dubai (5N)', 'Abu Dhabi (3N)'],
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
    nights: 8, days: 9, price: 110000, rating: 4.5,
    priceCategory: '50to150',
    type: 'FAMILY', typeColor: '#6366f1',
    theme: 'family', season: 'winter',
    user: { name: 'Ramesh', city: 'Kolkata', avatar: 'R', avatarBg: '#6366f1', ago: '20hr ago' },
  },
  {
    id: 'ew7',
    title: 'Maldives Luxury',
    dest: 'Maldives',
    locations: ['Malé (2N)', 'Resort Island (6N)'],
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80',
    nights: 8, days: 9, price: 325000, rating: 4.9,
    priceCategory: 'luxury',
    type: 'LUXURY', typeColor: '#f59e0b',
    theme: 'luxury', season: 'winter',
    user: { name: 'Mayank', city: 'Delhi', avatar: 'M', avatarBg: '#ec4899', ago: '13hr ago' },
  },
  {
    id: 'ew8',
    title: 'Paris Romance',
    dest: 'Europe',
    locations: ['Paris (4N)', 'Nice (3N)'],
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
    nights: 7, days: 8, price: 189000, rating: 4.7,
    priceCategory: '150to250',
    type: 'COUPLE', typeColor: '#f97316',
    theme: 'couple', season: 'spring',
    user: { name: 'Deepak', city: 'Delhi', avatar: 'D', avatarBg: '#f97316', ago: '1hr ago' },
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
    <div ref={ref} className="ew-dropdown">
      <button
        className={`ew-dropdown-btn ${open ? 'ew-dropdown-btn--open' : ''} ${value !== 'All' ? 'ew-dropdown-btn--active' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span>{value !== 'All' ? value : label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="ew-dropdown-menu">
          {items.map((item, i) => {
            const isActive = item === value;
            return (
              <button
                key={item}
                className={`ew-dropdown-item ${isActive ? 'ew-dropdown-item--active' : ''}`}
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

  return list;
}

/* ── Explore World Card ──────────────────────────────── */
function ExploreCard({ tour, animDelay }) {
  const searchTerm = tour.locations?.[0]?.replace(/\s*\([^)]*\)/g, '').trim() || tour.dest;
  const href = tour.isInquiry
    ? `/itineraries/${encodeURIComponent(tour.id)}`
    : `/tour?search=${encodeURIComponent(searchTerm)}`;

  return (
    <article className="ew-card" style={{ animationDelay: `${animDelay}ms` }}>
      <div className="ew-card-media">
        <Image
          src={tour.image}
          alt={tour.title}
          fill
          sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 45vw, 30vw"
        />
      </div>

      <div className="ew-card-body">
        <h3 className="ew-card-title">{tour.title}</h3>

        <div className="ew-card-meta">
          <span className="ew-card-duration">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {tour.nights}N / {tour.days}D
          </span>
          <span className="ew-card-rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {tour.rating}
          </span>
        </div>

        <div className="ew-card-price">
          ₹{Number(tour.price).toLocaleString('en-IN')}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Link href={href} className="th-card-link">
            EXPLORE NOW
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ── Main Section ────────────────────────────────────── */
export default function ExploreWorldSection() {
  const [filters, setFilters] = useState({
    theme: 'All',
    travelClass: 'All',
    season: 'All',
    duration: 'All',
  });
  const scrollRef = useRef(null);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filtered = applyFilters(exploreTours, filters);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  return (
    <section className="ew-section" aria-labelledby="ew-title">
      <style>{`
        .ew-section {
          background: var(--color-bg);
          padding: 48px 0 56px;
        }

        .ew-inner {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .ew-title {
          margin: 0 0 24px;
          color: #151922;
          font-family: var(--font-poppins), Poppins, sans-serif;
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
        .ew-filter-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .ew-dropdown {
          position: relative;
        }

        .ew-dropdown-btn {
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

        .ew-dropdown-btn:hover {
          border-color: #9ca3af;
          background: #fafafa;
        }

        .ew-dropdown-btn--open {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(209, 180, 100, 0.12);
        }

        .ew-dropdown-menu {
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
          animation: ewDropIn 0.2s ease;
        }

        @keyframes ewDropIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ew-dropdown-item {
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

        .ew-dropdown-item:hover {
          background: #f9fafb;
        }

        .ew-dropdown-item--active {
          color: var(--color-accent);
          font-weight: 700;
          background: #fffbeb;
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
          scroll-snap-type: x proximity;
        }

        .ew-scroll-area::-webkit-scrollbar { display: none; }

        .ew-scroll-btn {
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

        .ew-scroll-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
          transform: translateY(-50%) translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .ew-scroll-btn--left { left: -18px; }
        .ew-scroll-btn--right { right: -18px; }

        /* ── Card ─────────────────────── */
        @keyframes ewCardIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ew-card {
          flex-shrink: 0;
          width: 280px;
          overflow: hidden;
          border-radius: 14px;
          background: #ffffff;
          border: 1px solid #eef0f4;
          box-shadow: 0 2px 12px rgba(15, 23, 42, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          scroll-snap-align: start;
          animation: ewCardIn 0.36s ease both;
        }

        .ew-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.1);
        }

        .ew-card-media {
          position: relative;
          height: 180px;
          overflow: hidden;
          background: #e2e8f0;
        }

        .ew-card-media img {
          object-fit: cover;
          transition: transform 0.45s ease;
        }

        .ew-card:hover .ew-card-media img {
          transform: scale(1.06);
        }

        .ew-card-body {
          padding: 16px 18px 18px;
        }

        .ew-card-title {
          margin: 0 0 10px;
          color: var(--color-text-primary);
          font-family: var(--font-poppins), Poppins, sans-serif;
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
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
        }

        .ew-card-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #374151;
          font-size: 13px;
          font-weight: 700;
        }

        .ew-card-price {
          color: var(--color-text-primary);
          font-family: var(--font-poppins), Poppins, sans-serif;
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
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          color: #64748b;
          background: #ffffff;
          font-size: 14px;
          font-weight: 600;
        }

        /* ── Responsive ───────────────── */
        @media (max-width: 768px) {
          .ew-scroll-btn--left { left: 4px; }
          .ew-scroll-btn--right { right: 4px; }
          
          .ew-section {
            padding: 32px 0 40px;
          }
          .ew-inner {
            padding: 0 16px;
          }
          .ew-filter-bar {
            flex-wrap: wrap;
            padding-bottom: 8px;
            justify-content: center;
          }
          .ew-filter-bar::-webkit-scrollbar { display: none; }
          .ew-card {
            width: calc(100vw - 40px);
          }
        }

        @media (max-width: 420px) {
          .ew-card {
            width: calc(100vw - 32px);
          }
        }
      `}</style>

      <div className="ew-inner">
        <h2 className="ew-title" id="ew-title">
          Explore The World
        </h2>

        {/* Filter dropdowns */}
        <div className="ew-filter-bar">
          <span className="ew-dropdown-btn" style={{ background: '#fafafa', color: '#6b7280', cursor: 'default' }}>
            Hot Deals
          </span>
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
        <div className="ew-scroll-wrapper">
          <button
            className="ew-scroll-btn ew-scroll-btn--left"
            aria-label="Scroll left"
            onClick={() => scroll(-1)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          <div ref={scrollRef} className="ew-scroll-area">
            {filtered.length > 0 ? (
              filtered.map((tour, idx) => (
                <ExploreCard key={tour.id} tour={tour} animDelay={idx * 50} />
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
