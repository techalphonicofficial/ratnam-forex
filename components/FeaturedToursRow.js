'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getMediaUrl, getTripInquiries } from '@/utils/api';
import { CardLink, CircleButton, FilterPill, SectionIntro, SoftBadge } from '@/components/ui/TravelPrimitives';
import { indiaTours } from '@/components/ExploreIndiaSection';
import { exploreTours } from '@/components/ExploreWorldSection';

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
   luxury    = ≥ 250000
*/
export const allBookings = [
  /* ── Under ₹50K ──────────────────────────────────────── */
  {
    id: 'b1',
    slug: 'goa-beach-paradise',
    dest: 'India',
    title: 'Weekend Escape: 3 Nights In Goa Beach Paradise',
    locations: ['North Goa (2N)', 'South Goa (1N)'],
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80',
    nights: 3, price: 18500, priceCategory: 'under50',
    type: 'COUPLE', typeColor: 'var(--color-secondary)',
    user: { name: 'Riya', city: 'Pune', avatar: 'R', avatarBg: 'var(--color-secondary)', ago: '1hr ago' },
  },
  {
    id: 'b2',
    slug: 'kochi-alleppey-getaway',
    dest: 'India',
    title: 'Budget Getaway: 4 Nights In Kochi & Alleppey',
    locations: ['Kochi (2N)', 'Alleppey (2N)'],
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80',
    nights: 4, price: 24900, priceCategory: 'under50',
    type: 'FAMILY', typeColor: 'var(--color-primary)',
    user: { name: 'Suresh', city: 'Chennai', avatar: 'S', avatarBg: 'var(--color-primary)', ago: '3hr ago' },
  },
  {
    id: 'b3',
    slug: 'manali-snow-trip',
    dest: 'India',
    title: 'Hill Station: 3 Nights In Manali Snow Trip',
    locations: ['Manali (3N)'],
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
    nights: 3, price: 32000, priceCategory: 'under50',
    type: 'ADVENTURE', typeColor: 'var(--color-primary)',
    user: { name: 'Vikram', city: 'Delhi', avatar: 'V', avatarBg: 'var(--color-primary)', ago: '4hr ago' },
  },
  {
    id: 'b4',
    slug: 'jaisalmer-jodhpur-magic',
    dest: 'India',
    title: 'Desert Magic: 4 Nights In Jaisalmer & Jodhpur',
    locations: ['Jaisalmer (2N)', 'Jodhpur (2N)'],
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80',
    nights: 4, price: 28500, priceCategory: 'under50',
    type: 'COUPLE', typeColor: 'var(--color-secondary)',
    user: { name: 'Anita', city: 'Jaipur', avatar: 'A', avatarBg: 'var(--color-primary)', ago: '6hr ago' },
  },
  {
    id: 'b5',
    slug: 'bangkok-city-break',
    dest: 'Thailand',
    title: 'Budget Thailand: 5 Nights Bangkok City Break',
    locations: ['Bangkok (5N)'],
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80',
    nights: 5, price: 42000, priceCategory: 'under50',
    type: 'SOLO', typeColor: 'var(--color-secondary)',
    user: { name: 'Kiran', city: 'Hyderabad', avatar: 'K', avatarBg: 'var(--color-secondary)', ago: '8hr ago' },
  },
  {
    id: 'b6',
    slug: 'vietnam-backpacker',
    dest: 'Vietnam',
    title: 'Backpacker: 5 Nights In Vietnam Ho Chi Minh',
    locations: ['Ho Chi Minh (3N)', 'Hanoi (2N)'],
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80',
    nights: 5, price: 38000, priceCategory: 'under50',
    type: 'SOLO', typeColor: 'var(--color-secondary)',
    user: { name: 'Rohan', city: 'Mumbai', avatar: 'R', avatarBg: 'var(--color-primary)', ago: '9hr ago' },
  },

  /* ── ₹50K–₹1.5L ──────────────────────────────────────── */
  {
    id: 'b7',
    slug: 'couple-retreat-bali',
    dest: 'Bali',
    title: 'Couple Retreat: 8 Nights In Seminyak And Ubud',
    locations: ['Ubud (3N)', '+1 more'],
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
    nights: 8, price: 75656, priceCategory: '50to150',
    type: 'COUPLE', typeColor: 'var(--color-secondary)',
    user: { name: 'Gaurav', city: 'Mumbai', avatar: 'G', avatarBg: 'var(--color-secondary)', ago: '10hr ago' },
  },
  {
    id: 'b8',
    slug: 'family-escape-thailand',
    dest: 'Thailand',
    title: 'Family Escape: 6 Nights In Bangkok And Pattaya',
    locations: ['Pattaya (3N)', '+1 more'],
    image: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=600&q=80',
    nights: 6, price: 50009, priceCategory: '50to150',
    type: 'FAMILY', typeColor: 'var(--color-primary)',
    user: { name: 'Hema', city: 'Chennai', avatar: 'H', avatarBg: 'var(--color-primary)', ago: '11hr ago' },
  },
  {
    id: 'b9',
    slug: 'japan-cherry-blossom',
    dest: 'Japan',
    title: 'Solo: 10 Nights Japan Cherry Blossom Tour',
    locations: ['Tokyo (4N)', '+3 more'],
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80',
    nights: 10, price: 145000, priceCategory: '50to150',
    type: 'SOLO', typeColor: 'var(--color-secondary)',
    user: { name: 'Arjun', city: 'Hyderabad', avatar: 'A', avatarBg: 'var(--color-secondary)', ago: '5hr ago' },
  },
  {
    id: 'b10',
    slug: 'singapore-sentosa-romantic',
    dest: 'Singapore',
    title: 'Romantic: 6 Nights In Singapore & Sentosa',
    locations: ['Singapore (4N)', 'Sentosa (2N)'],
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80',
    nights: 6, price: 89000, priceCategory: '50to150',
    type: 'COUPLE', typeColor: 'var(--color-secondary)',
    user: { name: 'Pooja', city: 'Bangalore', avatar: 'P', avatarBg: 'var(--color-primary)', ago: '2hr ago' },
  },
  {
    id: 'b11',
    slug: 'vietnam-cambodia-adventure',
    dest: 'Vietnam',
    title: 'Adventure: 7 Nights In Vietnam & Cambodia',
    locations: ['Hanoi (3N)', 'Siem Reap (4N)'],
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80',
    nights: 7, price: 64000, priceCategory: '50to150',
    type: 'ADVENTURE', typeColor: 'var(--color-primary)',
    user: { name: 'Nikhil', city: 'Pune', avatar: 'N', avatarBg: 'var(--color-primary)', ago: '14hr ago' },
  },
  {
    id: 'b12',
    slug: 'dubai-theme-parks',
    dest: 'Dubai',
    title: 'Family: 8 Nights In Dubai With Theme Parks',
    locations: ['Dubai (5N)', 'Abu Dhabi (3N)'],
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
    nights: 8, price: 110000, priceCategory: '50to150',
    type: 'FAMILY', typeColor: 'var(--color-primary)',
    user: { name: 'Ramesh', city: 'Kolkata', avatar: 'R', avatarBg: 'var(--color-primary)', ago: '20hr ago' },
  },

  /* ── ₹1.5L–₹2.5L ─────────────────────────────────────── */
  {
    id: 'b13',
    slug: 'swiss-alps-paris-adventure',
    dest: 'Europe',
    title: 'Adventure: 7 Nights In Swiss Alps And Paris',
    locations: ['Interlaken (3N)', '+2 more'],
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&q=80',
    nights: 7, price: 189000, priceCategory: '150to250',
    type: 'ADVENTURE', typeColor: 'var(--color-primary)',
    user: { name: 'Priya', city: 'Bangalore', avatar: 'P', avatarBg: 'var(--color-primary)', ago: '2hr ago' },
  },
  {
    id: 'b14',
    slug: 'europe-trail-france-italy',
    dest: 'Europe',
    title: 'Europe Trail: 10 Nights France Italy & Spain',
    locations: ['Paris (3N)', 'Rome (3N)', '+2 more'],
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
    nights: 10, price: 210000, priceCategory: '150to250',
    type: 'COUPLE', typeColor: 'var(--color-secondary)',
    user: { name: 'Deepak', city: 'Delhi', avatar: 'D', avatarBg: 'var(--color-secondary)', ago: '1hr ago' },
  },
  {
    id: 'b15',
    slug: 'australia-sydney-melbourne',
    dest: 'Australia',
    title: 'Family: 9 Nights Australia Sydney & Melbourne',
    locations: ['Sydney (4N)', 'Melbourne (5N)'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    nights: 9, price: 235000, priceCategory: '150to250',
    type: 'FAMILY', typeColor: 'var(--color-primary)',
    user: { name: 'Sneha', city: 'Mumbai', avatar: 'S', avatarBg: 'var(--color-primary)', ago: '3hr ago' },
  },
  {
    id: 'b16',
    slug: 'greece-honeymoon-santorini',
    dest: 'Europe',
    title: 'Honeymoon: 8 Nights Greece Santorini & Mykonos',
    locations: ['Santorini (4N)', 'Mykonos (4N)'],
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80',
    nights: 8, price: 195000, priceCategory: '150to250',
    type: 'COUPLE', typeColor: 'var(--color-secondary)',
    user: { name: 'Rahul', city: 'Hyderabad', avatar: 'R', avatarBg: 'var(--color-primary)', ago: '5hr ago' },
  },
  {
    id: 'b17',
    slug: 'safari-south-africa-kruger',
    dest: 'Africa',
    title: 'Safari: 8 Nights South Africa Cape Town & Kruger',
    locations: ['Cape Town (4N)', 'Kruger (4N)'],
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80',
    nights: 8, price: 220000, priceCategory: '150to250',
    type: 'ADVENTURE', typeColor: 'var(--color-primary)',
    user: { name: 'Arun', city: 'Chennai', avatar: 'A', avatarBg: 'var(--color-primary)', ago: '7hr ago' },
  },
  {
    id: 'b18',
    slug: 'canada-vancouver-banff-niagara',
    dest: 'Canada',
    title: 'Canada: 10 Nights Vancouver Banff & Niagara',
    locations: ['Vancouver (3N)', 'Banff (4N)', '+1 more'],
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
    nights: 10, price: 245000, priceCategory: '150to250',
    type: 'FAMILY', typeColor: 'var(--color-primary)',
    user: { name: 'Meena', city: 'Pune', avatar: 'M', avatarBg: 'var(--color-primary)', ago: '12hr ago' },
  },

  /* ── Luxury (₹2.5L+) ──────────────────────────────────── */
  {
    id: 'b19',
    slug: 'maldives-lucerne-escape',
    dest: 'Europe',
    title: 'Couple Escape: 8 Nights In Maldives And Lucerne',
    locations: ['Zurich (2N)', '+2 more'],
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80',
    nights: 8, price: 325000, priceCategory: 'luxury',
    type: 'COUPLE', typeColor: 'var(--color-secondary)',
    user: { name: 'Mayank', city: 'Delhi', avatar: 'M', avatarBg: 'var(--color-primary)', ago: '13hr ago' },
  },
  {
    id: 'b20',
    slug: 'new-zealand-royal-island',
    dest: 'New Zealand',
    title: 'Royal: 10 Nights New Zealand North & South Island',
    locations: ['Auckland (3N)', 'Queenstown (4N)', '+1 more'],
    image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600&q=80',
    nights: 10, price: 380000, priceCategory: 'luxury',
    type: 'COUPLE', typeColor: 'var(--color-secondary)',
    user: { name: 'Leela', city: 'Chennai', avatar: 'L', avatarBg: 'var(--color-secondary)', ago: '4hr ago' },
  },
  {
    id: 'b21',
    slug: 'seychelles-mauritius-hop',
    dest: 'Seychelles',
    title: 'Luxury: 12 Nights Seychelles & Mauritius Island Hop',
    locations: ['Mahé (5N)', 'Mauritius (7N)'],
    image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80',
    nights: 12, price: 450000, priceCategory: 'luxury',
    type: 'LUXURY', typeColor: 'var(--color-secondary)',
    user: { name: 'Kavitha', city: 'Chennai', avatar: 'K', avatarBg: 'var(--color-secondary)', ago: '7hr ago' },
  },
  {
    id: 'b22',
    dest: 'USA',
    title: 'Opulent: 14 Nights USA New York LA & Vegas',
    locations: ['New York (4N)', 'Las Vegas (4N)', '+2 more'],
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80',
    nights: 14, price: 520000, priceCategory: 'luxury',
    type: 'LUXURY', typeColor: 'var(--color-secondary)',
    user: { name: 'Aditya', city: 'Mumbai', avatar: 'A', avatarBg: 'var(--color-secondary)', ago: '9hr ago' },
  },
  {
    id: 'b23',
    dest: 'Japan',
    title: 'Elite: 10 Nights Japan Private Tour With Ryokan',
    locations: ['Tokyo (4N)', 'Kyoto (3N)', '+1 more'],
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80',
    nights: 10, price: 395000, priceCategory: 'luxury',
    type: 'LUXURY', typeColor: 'var(--color-secondary)',
    user: { name: 'Shweta', city: 'Delhi', avatar: 'S', avatarBg: 'var(--color-primary)', ago: '15hr ago' },
  },
  {
    id: 'b24',
    dest: 'Europe',
    title: 'Grand: 15 Nights Europe 7 Countries Luxury Rail',
    locations: ['London (3N)', 'Paris (2N)', '+5 more'],
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80',
    nights: 15, price: 680000, priceCategory: 'luxury',
    type: 'LUXURY', typeColor: 'var(--color-secondary)',
    user: { name: 'Harish', city: 'Bangalore', avatar: 'H', avatarBg: 'var(--color-primary)', ago: '20hr ago' },
  },
];

/* ── Custom Dropdown Component ────────────────────────── */
function CustomDropdown({ label, currentValue, onChange, options }) {
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
          border: open ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
          background: 'white',
          color: 'var(--color-text-primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          whiteSpace: 'nowrap', transition: 'all 0.2s',
          boxShadow: open ? '0 0 0 3px rgba(20,83,45,0.1)' : 'none',
        }}
      >
        <span>{currentValue === 'All' && label ? label : currentValue}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0,
          background: 'white', border: '1px solid var(--color-border)',
          borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          minWidth: 200, zIndex: 50, padding: '8px 0',
          animation: 'fadeSlideIn 0.2s ease',
        }}>
          {options.map((d, i) => {
            const isActive = d === currentValue;
            return (
              <button
                key={d}
                onClick={() => {
                  onChange(d);
                  setOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%', padding: '10px 18px',
                  background: isActive ? 'var(--color-primary)' : 'none', border: 'none',
                  borderBottom: i < options.length - 1 && !isActive ? '1px solid var(--color-bg-soft)' : 'none',
                  textAlign: 'left', cursor: 'pointer',
                  color: isActive ? 'white' : 'var(--color-text-primary)',
                  fontSize: 13.5, fontWeight: isActive ? 700 : 500,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'var(--color-bg-soft)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'none';
                }}
              >
                {d}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Filter logic ─────────────────────────────────────── */
function filterBookings(travelClass, destFilter, durationFilter, source = []) {
  let list = source;

  // Filter by Travel Class
  if (travelClass === 'Economy') {
    list = list.filter(b => b.price < 50000);
  } else if (travelClass === 'Standard') {
    list = list.filter(b => b.price >= 50000 && b.price < 150000);
  } else if (travelClass === 'Luxury') {
    list = list.filter(b => b.price >= 150000);
  }

  // Filter by Destination
  if (destFilter === 'India Unlimited') {
    list = list.filter(b => indiaTours.some(i => i.id === b.id));
  } else if (destFilter === 'International') {
    list = list.filter(b => exploreTours.some(e => e.id === b.id));
  } else if (destFilter === 'India & Beyond') {
    // Both, no filter needed since source contains both
  }

  // Filter by Duration
  if (durationFilter === '1-3 Days') {
    list = list.filter(b => b.nights <= 3);
  } else if (durationFilter === '4-7 Days') {
    list = list.filter(b => b.nights >= 4 && b.nights <= 7);
  } else if (durationFilter === '8+ Days') {
    list = list.filter(b => b.nights >= 8);
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
  if (key.includes('luxury')) return 'var(--color-secondary)';
  if (key.includes('family')) return 'var(--color-primary)';
  if (key.includes('couple') || key.includes('honeymoon')) return 'var(--color-secondary)';
  if (key.includes('adventure') || key.includes('trending')) return 'var(--color-primary)';
  return 'var(--color-primary)';
};

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

const titleCase = (value) =>
  String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const getFeaturedTourHref = (pkg) => {
  const slug = pkg.slug || String(pkg.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return `/tours/${slug}`;
};

/* ── Main component ───────────────────────────────────── */
export default function RecommendedPackages() {
  const [activeClass, setActiveClass] = useState('All');
  const [activeDest, setActiveDest] = useState('All Destinations');
  const [activeDuration, setActiveDuration] = useState('DURATION');
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

    return () => {
      mounted = false;
    };
  }, []);

  const combinedTours = [...indiaTours, ...exploreTours];
  // We use combinedTours instead of liveBookings or allBookings
  const filtered = filterBookings(activeClass, activeDest, activeDuration, combinedTours);

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

  return <section className="recent-bookings-section">
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
          padding: 60px 0;
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
          width: 320px;
          overflow: hidden;
          border: 1px solid var(--color-bg-soft);
          border-radius: 8px;
          background: var(--color-card);
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
          .th-scroll-btn-pos--left { left: 4px; }
          .th-scroll-btn-pos--right { right: 4px; }
        }
      `}</style>

      <div className="container">
        {/* ── Centered Header Section matching design ── */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: '"Italiana", sans-serif', fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
            Hot Deals
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', margin: '0 0 20px' }}>
            Unbeatable prices for unforgettable places creates a nice, memorable rhythm!
          </p>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--color-primary-light)', border: '1px solid #fbcfe8', padding: '4px 12px', borderRadius: 999, marginBottom: 24 }}>
             <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-secondary)' }}></div>
             <span style={{ fontSize: 11, fontWeight: 700, color: '#FF6000', letterSpacing: 0.5 }}>
               {liveBookings.length ? `${liveBookings.length}+ recent trip requests` : '20+ recent trip requests'}
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
               {inquiriesLoading
                  ? 'loading latest trips'
                  : activeDest === 'All Destinations'
                    ? 'showing top combined trips'
                    : 'filtered results'}
             </span>
          </div>
        </div>

        {/* ── Cards horizontal scroll ── */}
        <div style={{ position: 'relative' }}>
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
                Live trip inquiries will appear here once the API returns data.
              </div>
            )}
          </div>
          
          <button
            onClick={() => scroll(-1)}
            aria-label="Previous"
            className="th-scroll-btn-pos--left"
            style={{
              position: 'absolute', top: '50%', transform: 'translateY(-50%)',
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
              position: 'absolute', top: '50%', transform: 'translateY(-50%)',
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
          <Link href="/packages" className="btn-primary circle-btn-hover" style={{ display: 'inline-flex', width: 'auto', minWidth: '160px' }}>
            <svg className="circle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            View All Hot Deals
          </Link>
        </div>

      </div>
    </section>
  
}

export function BookingCardV2({ pkg, animDelay }) {
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  
  const priceLabel = Number(pkg.price) > 0 ? `₹${Number(pkg.price).toLocaleString('en-IN')}*` : 'On request';
  const href = getFeaturedTourHref(pkg);
  const locationString = pkg.locations.join(' - ');
  const titleText = pkg.title.length > 35 ? pkg.title.substring(0, 35) + '...' : pkg.title;

  return (
    <article className="booking-card-item recent-booking-card" style={{ animationDelay: `${animDelay}ms`, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 460 }}>
      
      {/* Media Section */}
      <div className="recent-card-media" style={{ height: 210, minHeight: 210, position: 'relative', overflow: 'hidden' }}>
        <Image
          src={pkg.image}
          alt={pkg.title}
          fill
          sizes="(max-width: 768px) calc(100vw - 36px), 310px"
          style={{ objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: '#FF6600', color: '#FFFFFF',
          padding: '4px 10px', fontSize: 10, fontWeight: 800,
          borderRadius: 4, letterSpacing: 0.5, textTransform: 'uppercase',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          {pkg.user.name} FROM {pkg.user.city} - {pkg.user.ago.replace('ago', 'AGO')}
        </div>
      </div>

      {/* Info Section */}
      <div style={{ padding: '16px 16px 12px', background: 'white', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 className="anonymous-pro-bold" style={{ fontSize: 20, color: 'var(--color-text-primary)', margin: '0 0 8px', lineHeight: 1.2 }}>
          {titleText}
        </h3>
        
        <p style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 16px', lineHeight: 1.4 }}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          </svg>
          <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {locationString}
          </span>
        </p>
        
        {/* Trip Highlights & Tour Includes */}
        <div style={{ borderTop: '1px solid var(--color-bg-soft)', paddingTop: 12, marginTop: 'auto' }}>
          <div 
            onClick={() => setHighlightsOpen(!highlightsOpen)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, cursor: 'pointer', padding: '4px 0' }}
          >
             <span style={{ color: 'var(--color-primary)', fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>
               Trip Highlights
             </span>
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="3" style={{ transform: highlightsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          
          <div style={{ 
            maxHeight: highlightsOpen ? '100px' : '0', 
            overflow: 'hidden', 
            transition: 'max-height 0.3s ease, margin 0.3s ease, padding 0.3s ease',
            marginBottom: highlightsOpen ? 12 : 0,
          }}>
             <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                <li>Premium accommodations</li>
                <li>Daily breakfast & guided tours</li>
                <li>Private local transfers</li>
             </ul>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>Tour Includes</span>
             <div style={{ display: 'flex', gap: 6, color: 'var(--color-primary)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 7v10M21 7v10M3 13h18M5 10h14"/></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 3v18M17 3v18M12 8v8"/></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="8" width="18" height="12" rx="2" ry="2"/><circle cx="12" cy="14" r="3"/><path d="M7 8v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="5" width="18" height="12" rx="2" ry="2"/><path d="M3 10h18M8 17v2M16 17v2"/></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
             </div>
          </div>
        </div>
      </div>

      {/* Pricing Block */}
      <div style={{ background: '#fdf8f4', padding: '16px', borderTop: '1px dashed var(--color-border)' }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>All inclusive price starts</div>
        <div style={{ fontFamily: '"Italiana", sans-serif', fontSize: 26, fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1, marginBottom: 16 }}>
          {priceLabel}
        </div>
        
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={href} className="book-now-leaf" style={{ flex: 1, textAlign: 'center', background: 'var(--color-primary)', color: 'white', padding: '12px 0', fontSize: 13, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)'; e.currentTarget.style.opacity = '0.9'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.opacity = '1'; }}>
            View Tour
          </Link>
          <Link href={`/customize?step=0&subStep=room-config`} className="book-now-leaf" style={{ flex: 1, textAlign: 'center', background: '#FF6600', color: 'white', padding: '12px 0', fontSize: 13, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)'; e.currentTarget.style.opacity = '0.9'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.opacity = '1'; }}>
            Book Now
          </Link>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'white', borderTop: '1px solid var(--color-bg-soft)' }}>
        <a href="https://wa.me/910000000000" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'var(--color-text-primary)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
           <span style={{ fontSize: 12, fontWeight: 700, borderBottom: '1px solid var(--color-text-primary)' }}>Request Callback</span>
        </a>
        <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', padding: 0, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
           <span style={{ fontSize: 12, fontWeight: 700, borderBottom: '1px solid var(--color-text-primary)' }}>Get Itinerary</span>
        </button>
      </div>

    </article>
  );
}

function BookingCard({ pkg, animDelay, isMobile }) {
  const [hovered, setHovered] = useState(false);
  const searchTerm = pkg.locations?.[0]?.replace(/\s*\([^)]*\)/g, '').trim() || pkg.dest;
  const priceLabel = Number(pkg.price) > 0 ? `₹${Number(pkg.price).toLocaleString('en-IN')}` : 'On request';

  return (
    <div
      className="booking-card-item"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        width: isMobile ? 'calc(100vw - 32px)' : 310,
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        // boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.14)' : '0 2px 12px rgba(0,0,0,0.07)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.3s ease',
        animationDelay: `${animDelay}ms`,
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
        <Image
          src={pkg.image}
          alt={pkg.title}
          width={600}
          height={360}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.45s ease',
            display: 'block',
          }}
          loading="lazy"
        />
        {/* Price ribbon */}
        {/* <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          color: 'white', borderRadius: 999,
          padding: '3px 10px', fontSize: 11, fontWeight: 700,
        }}>
          ₹{pkg.price.toLocaleString('en-IN')}
        </div> */}

        {/* User badge */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          borderRadius: 999,
          padding: '5px 12px 5px 5px',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: pkg.user.avatarBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 11, color: 'white', flexShrink: 0,
          }}>
            {pkg.user.avatar}
          </div>
          <span style={{ color: 'white', fontSize: 11, fontWeight: 600 }}>
            {pkg.user.name} from {pkg.user.city} · {pkg.user.ago}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        {/* Title */}
        <p style={{
          fontFamily: '"Italiana", sans-serif', fontWeight: 700,
          fontSize: 14, color: 'var(--color-text-primary)', margin: '0 0 6px',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {pkg.title}
        </p>

        {/* Location */}
        <p style={{
          fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 10px',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <svg viewBox="0 0 24 24" fill="var(--color-text-muted)" width="11" height="11">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          </svg>
          {pkg.locations.join(' · ')}
        </p>

        {/* Type badge + nights */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{
            display: 'inline-block',
            background: pkg.typeColor + '18',
            color: pkg.typeColor,
            border: `1px solid ${pkg.typeColor}40`,
            borderRadius: 6,
            padding: '2px 10px',
            fontSize: 10, fontWeight: 800,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
          }}>
            {pkg.type}
          </span>
          <span style={{
            display: 'inline-block',
            background: 'var(--color-bg-soft)',
            color: 'var(--color-text-muted)',
            borderRadius: 6,
            padding: '2px 9px',
            fontSize: 10, fontWeight: 700,
          }}>
            🌙 {pkg.nights} Nights
          </span>
        </div>

        {/* Price + CTA */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--color-bg-soft)',
          paddingTop: 12, gap: 8,
        }}>
          <div>
            <div style={{ fontFamily: '"Italiana", sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--color-text-primary)', lineHeight: 1 }}>
              {priceLabel}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{pkg.nights} nights / person</div>
          </div>
          <Link
            href={pkg.isInquiry ? `/itineraries/${encodeURIComponent(pkg.id)}` : `/tour?search=${encodeURIComponent(searchTerm)}`}
            style={{
              background: 'var(--color-primary)', color: 'white',
              borderRadius: 8, padding: '9px 16px',
              fontWeight: 700, fontSize: 12,
              textDecoration: 'none',
              transition: 'background 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
