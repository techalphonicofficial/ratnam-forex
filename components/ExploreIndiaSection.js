'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getFeaturedTourHref } from '@/components/FeaturedToursRow';

/* ── Filter options ──────────────────────────────────── */
const FILTER_OPTIONS = {
  hotDeals: {
    label: 'Hot Deals',
    items: ['All', 'Under ₹20K', '₹20K – ₹40K', '₹40K – ₹80K', 'Premium'],
  },
  theme: {
    label: 'Theme',
    items: ['All', 'Couple', 'Family', 'Adventure', 'Solo', 'Spiritual'],
  },
  budget: {
    label: 'Budget',
    items: ['All', 'Under ₹20K', '₹20K – ₹40K', '₹40K – ₹80K', '₹80K+'],
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

/* ── India tour data ─────────────────────────────────── */
const indiaTours = [
  {
    id: 'ei1',
    title: 'Kashmir Paradise',
    dest: 'India',
    locations: ['Srinagar (2N)', 'Pahalgam (2N)', 'Gulmarg (1N)'],
    image: 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=600&q=80',
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
        className={`ei-dropdown-btn ${open ? 'ei-dropdown-btn--open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span>{label}</span>
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

  if (filters.budget !== 'All') {
    if (filters.budget === 'Under ₹20K') list = list.filter(t => t.price < 20000);
    else if (filters.budget === '₹20K – ₹40K') list = list.filter(t => t.price >= 20000 && t.price < 40000);
    else if (filters.budget === '₹40K – ₹80K') list = list.filter(t => t.price >= 40000 && t.price < 80000);
    else if (filters.budget === '₹80K+') list = list.filter(t => t.price >= 80000);
  }

  if (filters.hotDeals !== 'All') {
    if (filters.hotDeals === 'Under ₹20K') list = list.filter(t => t.price < 20000);
    else if (filters.hotDeals === '₹20K – ₹40K') list = list.filter(t => t.price >= 20000 && t.price < 40000);
    else if (filters.hotDeals === '₹40K – ₹80K') list = list.filter(t => t.price >= 40000 && t.price < 80000);
    else if (filters.hotDeals === 'Premium') list = list.filter(t => t.price >= 80000);
  }

  if (filters.duration !== 'All') {
    if (filters.duration === '1-3 Nights') list = list.filter(t => t.nights <= 3);
    else if (filters.duration === '4-6 Nights') list = list.filter(t => t.nights >= 4 && t.nights <= 6);
    else if (filters.duration === '7-10 Nights') list = list.filter(t => t.nights >= 7 && t.nights <= 10);
    else if (filters.duration === '10+ Nights') list = list.filter(t => t.nights > 10);
  }

  return list;
}

/* ── India Card ──────────────────────────────────────── */
function IndiaCard({ tour, animDelay }) {
  const searchTerm = tour.locations?.[0]?.replace(/\s*\([^)]*\)/g, '').trim() || tour.dest;
  const href = tour.isInquiry
    ? `/itineraries/${encodeURIComponent(tour.id)}`
    : `/tour?search=${encodeURIComponent(searchTerm)}`;

  return (
    <article className="ei-card" style={{ animationDelay: `${animDelay}ms` }}>
      <div className="ei-card-media">
        <Image
          src={tour.image}
          alt={tour.title}
          fill
          sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 45vw, 30vw"
        />
      </div>

      <div className="ei-card-body">
        <h3 className="ei-card-title">{tour.title}</h3>

        <div className="ei-card-meta">
          <span className="ei-card-duration">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {tour.nights}N / {tour.days}D
          </span>
          <span className="ei-card-rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {tour.rating}
          </span>
        </div>

        <div className="ei-card-price">
          ₹{Number(tour.price).toLocaleString('en-IN')}
        </div>

        <Link href={href} className="th-card-link w-100">
          EXPLORE NOW
        </Link>
      </div>
    </article>
  );
}

/* ── Main Section ────────────────────────────────────── */
export default function ExploreIndiaSection() {
  const [filters, setFilters] = useState({
    hotDeals: 'All',
    theme: 'All',
    budget: 'All',
    season: 'All',
    duration: 'All',
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
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1.5px solid #d1d5db;
          background: #ffffff;
          color: #374151;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 5;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.2s;
        }

        .ei-scroll-btn:hover {
          background: var(--brand-primary);
          color: white;
          border-color: var(--brand-primary);
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 10px 24px rgba(46,74,59,0.4);
        }

        .ei-scroll-btn--left { left: -12px; }
        .ei-scroll-btn--right { right: -12px; }

        /* ── Card ─────────────────────── */
        @keyframes eiCardIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ei-card {
          flex-shrink: 0;
          width: 280px;
          overflow: hidden;
          border-radius: 14px;
          background: #ffffff;
          border: 1px solid #eef0f4;
          box-shadow: 0 2px 12px rgba(15, 23, 42, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          scroll-snap-align: start;
          animation: eiCardIn 0.36s ease both;
        }

        .ei-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.1);
        }

        .ei-card-media {
          position: relative;
          height: 180px;
          overflow: hidden;
          background: #e2e8f0;
        }

        .ei-card-media img {
          object-fit: cover;
          transition: transform 0.45s ease;
        }

        .ei-card:hover .ei-card-media img {
          transform: scale(1.06);
        }

        .ei-card-body {
          padding: 16px 18px 18px;
        }

        .ei-card-title {
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

        .ei-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .ei-card-duration {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
        }

        .ei-card-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #374151;
          font-size: 13px;
          font-weight: 700;
        }

        .ei-card-price {
          color: var(--color-text-primary);
          font-family: var(--font-poppins), Poppins, sans-serif;
          font-size: 22px;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 12px;
        }



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
          .ei-section {
            padding: 32px 0 40px;
          }
          .ei-inner {
            padding: 0 16px;
          }
          .ei-filter-bar {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 8px;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .ei-filter-bar::-webkit-scrollbar { display: none; }
          .ei-card {
            width: calc(100vw - 40px);
          }
          .ei-scroll-btn {
            display: none;
          }
        }

        @media (max-width: 420px) {
          .ei-card {
            width: calc(100vw - 32px);
          }
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
            ‹
          </button>

          <div ref={scrollRef} className="ei-scroll-area">
            {filtered.length > 0 ? (
              filtered.map((tour, idx) => (
                <IndiaCard key={tour.id} tour={tour} animDelay={idx * 50} />
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
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
