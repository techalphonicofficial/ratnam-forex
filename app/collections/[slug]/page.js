'use client';

import { use, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { allBookings, getFeaturedTourHref } from '@/components/FeaturedToursRow';
import { CardLink, SectionIntro, SoftBadge, FilterPill, CircleButton } from '@/components/ui/TravelPrimitives';
import { getTripInquiries, getMediaUrl } from '@/utils/api';

/* ── Collection metadata ─────────────────────────────── */
const COLLECTION_META = {
  'incredible-india': {
    title: 'Incredible India',
    subtitle: 'Timeless. Diverse. Incredible.',
    description: 'Explore the rich heritage, diverse culture, and breathtaking landscapes of India.',
    banner: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1400&q=80',
    filterFn: (b) => b.dest === 'India',
  },
  'international': {
    title: 'International',
    subtitle: 'Explore Beyond Borders',
    description: 'Discover stunning destinations across the globe with curated international tour packages.',
    banner: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1400&q=80',
    filterFn: (b) => b.dest !== 'India',
  },
  'india-unlimited': {
    title: 'India Unlimited',
    subtitle: 'Endless Journeys Within',
    description: 'Unlimited adventures across every corner of India — from mountains to beaches.',
    banner: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1400&q=80',
    filterFn: (b) => b.dest === 'India',
  },
  'trans-india': {
    title: 'Trans India',
    subtitle: 'Crossing Landscapes',
    description: 'Journey across the vast and varied landscapes of the Indian subcontinent.',
    banner: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1400&q=80',
    filterFn: (b) => b.dest === 'India',
  },
};

/* ── Filter definitions ──────────────────────────────── */
const BUDGET_FILTERS = [
  { label: 'All Budgets', key: 'all' },
  { label: 'Under ₹50K', key: 'under50' },
  { label: '₹50K to ₹1.5L', key: '50to150' },
  { label: '₹1.5L to ₹2.5L', key: '150to250' },
  { label: 'Luxury', key: 'luxury' },
];

const getBudgetLabel = (key, fallback) => ({
  all: 'All Budgets',
  under50: 'Under Rs 50K',
  '50to150': 'Rs 50K to Rs 1.5L',
  '150to250': 'Rs 1.5L to Rs 2.5L',
  luxury: 'Luxury',
}[key] || fallback);

/* ── Filter logic ────────────────────────────────────── */
function filterBookings(budgetStr, destStr, source = []) {
  let list = source;
  if (budgetStr !== 'all') {
    list = list.filter(b => b.priceCategory === budgetStr);
  }
  if (destStr !== 'All Destinations') {
    list = list.filter(b => b.dest === destStr);
  }
  return list;
}

const getPriceCategory = (amount) => {
  const price = Number(amount) || 0;
  if (price >= 250000) return 'luxury';
  if (price >= 150000) return '150to250';
  if (price >= 50000) return '50to150';
  return 'under50';
};

const getRelativeTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'recently';
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
  if (diffHours < 24) return `${diffHours}hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const getTypeColor = (value) => {
  const key = String(value || '').toLowerCase();
  if (key.includes('luxury')) return '#f59e0b';
  if (key.includes('family')) return '#6366f1';
  if (key.includes('couple') || key.includes('honeymoon')) return '#f97316';
  if (key.includes('adventure') || key.includes('trending')) return '#10b981';
  return 'var(--color-primary)';
};

const titleCase = (value) =>
  String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const normalizeInquiry = (item) => {
  const cityNames = (item.cities || []).map((city) => city.name).filter(Boolean);
  const galleryImage = item.destination_gallery?.find((image) => image.is_primary)?.url || item.destination_gallery?.[0]?.url;
  const totalAmount = Number(item.total_amount || item.base_price || 0);
  const nights = Number(String(item.duration || '').match(/\d+/)?.[0]) || Math.max(cityNames.length, 1);
  const destination = item.destination || cityNames[0] || 'Custom Trip';
  const travelType = item.travel_with || item.status || 'CUSTOM';
  const city = item.departure_city?.split(',')?.[0]?.trim() || 'India';

  return {
    id: item.id,
    slug: item.destination_slug,
    isInquiry: true,
    dest: destination,
    title: `${item.duration || 'Custom'} ${destination} itinerary for ${item.total_travellers || 1} travellers`,
    locations: cityNames.length ? cityNames.map((name) => titleCase(name)) : [destination],
    image: getMediaUrl(galleryImage) || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
    nights,
    price: totalAmount,
    priceCategory: getPriceCategory(totalAmount),
    type: String(travelType).toUpperCase(),
    typeColor: getTypeColor(travelType),
    user: {
      name: item.customer_name?.split(' ')?.[0] || 'Traveler',
      city,
      avatar: (item.customer_name || 'T').charAt(0).toUpperCase(),
      avatarBg: getTypeColor(travelType),
      ago: getRelativeTime(item.created_at),
    },
  };
};

/* ── Destination Dropdown ────────────────────────────── */
function DestinationDropdown({ currentDest, onChange, destinations }) {
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
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 16px', borderRadius: 999,
          border: open ? '1.5px solid var(--color-primary)' : '1.5px solid #d1d5db',
          background: 'white',
          color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          whiteSpace: 'nowrap', transition: 'all 0.2s',
          boxShadow: open ? '0 0 0 3px rgba(20,83,45,0.1)' : 'none',
        }}
      >
        {currentDest}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0,
          background: 'white', border: '1px solid #e5e7eb',
          borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          minWidth: 200, zIndex: 50, padding: '8px 0',
          animation: 'fadeSlideIn 0.2s ease',
        }}>
          {destinations.map((d, i) => {
            const isActive = d === currentDest;
            return (
              <button
                key={d}
                onClick={() => {
                  onChange(d);
                  setOpen(false);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: '10px 18px',
                  background: 'none', border: 'none',
                  borderBottom: i < destinations.length - 1 ? '1px solid #f3f4f6' : 'none',
                  textAlign: 'left', cursor: 'pointer',
                  color: '#1f2937', fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: isActive ? '2px solid #16a34a' : '1.5px solid #d1d5db',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isActive && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />}
                </div>
                {d}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Single card (same as FeaturedToursRow) ───────────── */
function BookingCardV2({ pkg, animDelay }) {
  const priceLabel = Number(pkg.price) > 0 ? `Rs ${Number(pkg.price).toLocaleString('en-IN')}` : 'On request';
  const href = getFeaturedTourHref(pkg);

  return (
    <article className="booking-card-item recent-booking-card" style={{ animationDelay: `${animDelay}ms` }}>
      <div className="recent-card-media">
        <Image
          src={pkg.image}
          alt={pkg.title}
          fill
          sizes="(max-width: 768px) calc(100vw - 36px), 320px"
        />
        <div className="recent-user-badge">
          <div className="recent-user-avatar" style={{ background: pkg.user.avatarBg }}>
            {pkg.user.avatar}
          </div>
          <span>{pkg.user.name} from {pkg.user.city} - {pkg.user.ago}</span>
        </div>
      </div>

      <div className="recent-card-body">
        <p className="recent-card-title">{pkg.title}</p>
        <p className="recent-card-location">
          <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          </svg>
          <span>{pkg.locations.join(' - ')}</span>
        </p>

        <div className="recent-card-tags">
          <span
            className="recent-card-type"
            style={{
              background: `${pkg.typeColor}18`,
              border: `1px solid ${pkg.typeColor}40`,
              color: pkg.typeColor,
            }}
          >
            {pkg.type}
          </span>
          <span className="recent-card-nights">{pkg.nights} Nights</span>
        </div>

        <div className="recent-card-footer">
          <div>
            <div className="recent-card-price">{priceLabel}</div>
            <div className="recent-card-price-note">{pkg.nights} nights / person</div>
          </div>
          <CardLink href={href}>View Details</CardLink>
        </div>
      </div>
    </article>
  );
}

/* ── Main Page Component ─────────────────────────────── */
export default function CollectionPage({ params }) {
  const { slug } = use(params);
  const meta = COLLECTION_META[slug];

  const [activeBudget, setActiveBudget] = useState('all');
  const [activeDest, setActiveDest] = useState('All Destinations');
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [liveBookings, setLiveBookings] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth <= 768);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadTripInquiries = async () => {
      setInquiriesLoading(true);
      const result = await getTripInquiries({ page: 1, limit: 20 });
      if (!mounted) return;

      const rows = Array.isArray(result?.rows) ? result.rows : [];
      setLiveBookings(rows.map(normalizeInquiry));
      setInquiriesLoading(false);
    };

    loadTripInquiries();
    return () => { mounted = false; };
  }, []);

  if (!meta) {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center', color: '#64748b' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Collection Not Found</h1>
        <p>The collection you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" style={{ color: '#0d9488', fontWeight: 600, textDecoration: 'underline' }}>
          Go back home
        </Link>
      </div>
    );
  }

  /* Apply collection filter to live bookings first, fallback to allBookings */
  const collectionLive = liveBookings.filter(meta.filterFn);
  const collectionFallback = allBookings.filter(meta.filterFn);
  const bookingSource = collectionLive.length ? collectionLive : collectionFallback;

  const destinationOptions = [
    'All Destinations',
    ...Array.from(new Set(bookingSource.map((b) => b.dest).filter(Boolean))).sort(),
  ];
  const filtered = filterBookings(activeBudget, activeDest, bookingSource);

  const handleBudgetSort = (key) => {
    if (key === activeBudget) return;
    setVisible(false);
    setTimeout(() => {
      setActiveBudget(key);
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
          background: #ffffff;
          padding: 60px 0;
        }
        
        .recent-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          min-width: 0;
          margin-bottom: 24px;
        }
        
        .recent-filters select,
        .recent-filters button {
          background: #fff;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 6px 12px;
          font-size: 13px;
          color: #4b5563;
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
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin: -10px 0 18px;
        }
        
        .recent-result-row p,
        .recent-result-row > span:last-child {
          margin: 0;
          color: #4b5563;
          font-size: 14px;
          font-weight: 500;
        }
        
        .recent-empty-state {
          flex: 1 0 100%;
          min-height: 128px;
          display: grid;
          place-items: center;
          border: 1px dashed #d1d5db;
          border-radius: 8px;
          color: #64748b;
          background: #f9fafb;
          font-size: 14px;
          font-weight: 600;
        }
        
        .recent-booking-card {
          flex-shrink: 0;
          width: 320px;
          overflow: hidden;
          border: 1px solid #f3f4f6;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          scroll-snap-align: start;
        }
        
        .recent-booking-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
        }
        
        .recent-card-media {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: #f3f4f6;
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
        
        .recent-user-badge {
          position: absolute;
          left: 12px;
          top: 12px;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 4px;
          background: #ef4444;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        
        .recent-user-avatar {
          display: none;
        }
        
        .recent-user-badge span {
          white-space: nowrap;
        }
        
        .recent-card-body { 
          padding: 16px 20px; 
        }
        
        .recent-card-title {
          margin: 0 0 10px;
          color: #111827;
          font-family: var(--font-poppins), Poppins, sans-serif;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .recent-card-location {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0 0 16px;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
        }
        
        .recent-card-tags {
          display: none;
        }
        
        .recent-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid #f3f4f6;
          padding-top: 16px;
        }
        
        .recent-card-price {
          color: #111827;
          font-family: var(--font-poppins), Poppins, sans-serif;
          font-size: 18px;
          font-weight: 700;
        }
        
        .recent-card-price-note {
          margin: 0;
          color: #eab308;
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
             flex-wrap: nowrap;
             overflow-x: auto;
             padding-bottom: 8px;
             scrollbar-width: none;
             -webkit-overflow-scrolling: touch;
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
      `}</style>

      <div className="container">
        <SectionIntro
          eyebrow={meta.subtitle}
          title={meta.title}
          subtitle={meta.description}
          meta={(
            <SoftBadge tone="live">
              {collectionLive.length ? `${collectionLive.length}+ recent trip requests` : `${collectionFallback.length}+ tour packages`}
            </SoftBadge>
          )}
          actions={(
            <>
              <div className="recent-filters">
                <DestinationDropdown currentDest={activeDest} onChange={handleDestChange} destinations={destinationOptions} />
                {BUDGET_FILTERS.map((filter) => (
                  <FilterPill
                    key={filter.key}
                    active={activeBudget === filter.key}
                    onClick={() => handleBudgetSort(filter.key)}
                  >
                    {getBudgetLabel(filter.key, filter.label)}
                  </FilterPill>
                ))}
              </div>
              <div className="recent-scroll-actions">
                <CircleButton label="Previous itineraries" onClick={() => scroll(-1)}>
                  &lt;
                </CircleButton>
                <CircleButton label="Next itineraries" onClick={() => scroll(1)}>
                  &gt;
                </CircleButton>
              </div>
            </>
          )}
        />

        {/* ── Result count badge ── */}
        <div className="recent-result-row">
          <span style={{
            background: '#8EB69B', border: '1px solid #8EB69B',
            color: '#FFFFFF', borderRadius: 999,
            padding: '3px 12px', fontSize: 12, fontWeight: 700,
          }}>
            {filtered.length} itineraries
          </span>
          <span style={{ color: '#9ca3af', fontSize: 12 }}>
              {inquiriesLoading
                ? 'loading latest trips'
                : activeDest === 'All Destinations' && activeBudget === 'all'
                  ? (collectionLive.length ? 'showing latest saved trips' : 'showing all tours')
                  : 'filtered results'}
          </span>
        </div>

        {/* ── Cards horizontal scroll ── */}
        <div
          ref={scrollRef}
          className={`booking-cards-wrap ${visible ? 'shown' : 'hidden'}`}
        >
          {filtered.map((pkg, idx) => (
            <BookingCardV2
              key={pkg.id}
              pkg={pkg}
              animDelay={idx * 40}
            />
          ))}
          {!inquiriesLoading && filtered.length === 0 && (
            <div className="recent-empty-state">
              No tour packages match your current filters. Try adjusting your selection.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
