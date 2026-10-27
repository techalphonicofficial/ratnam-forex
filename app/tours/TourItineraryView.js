'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import GramSection from '@/components/GramSection';
import RouteMapModal from '@/components/RouteMapModal';
import CancellationPolicyModal from '@/components/CancellationPolicyModal';
import ReviewDetailModal from '@/components/ReviewDetailModal';
import {
  getCancellationPolicy,
  FALLBACK_CANCELLATION_DATA,
} from '@/utils/cancellationPolicy';
import TourCard from '@/components/TourCard';
import axios from 'axios';
import { blogsData } from '@/data/blogs';
import {
  createPackageBooking,
  createRazorpayOrder,
  customizeBooking,
  getBlogs,
  getCmsReviews,
  getHomePage,
  getMediaUrl,
  getPackageBySlug,
  getPackageReviews,
  getPackages,
  getPageBySlug,
  getPartialBookingSettings,
  getStoredAuth,
  getStoredToken,
  loginCustomer,
  normalizePackageToTour,
  searchCountryCityLocations,
  validateBookingCoupon,
  verifyRazorpayPayment,
} from '@/utils/api';

const FALLBACK_BLOG_IMAGE = 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&q=80&w=1200';

const stripBlogHtml = (val = '') => String(val).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const formatBlogDate = (val) => {
  if (!val) return 'Travel Guide';
  const date = new Date(val);
  if (Number.isNaN(date.getTime())) return String(val);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const resolveBlogImage = (b) => (
  getMediaUrl(b?.featured_image) ||
  getMediaUrl(b?.details?.find?.((d) => d?.image)?.image) ||
  b?.image ||
  FALLBACK_BLOG_IMAGE
);

const DEFAULT_PACKAGE_SLUGS = {
  paris: 'paris-honeymoon-special-6n7d',
  bangkok: 'bangkok-explorer-5n6d',
  thailand: 'bangkok-explorer-5n6d',
};

const PACKAGE_SLUG_ALIASES = {
  'package-25': 'bangkok-explorer-5n6d',
};

const fallbackImage = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80';

const FALLBACK_SIMILAR_PACKAGES = [
  {
    id: 'karnataka-highlights',
    title: 'Karnataka Highlights',
    slug: 'karnataka-highlights',
    location: 'Karnataka, India',
    duration: 6,
    nights: 5,
    price: 18999,
    originalPrice: 23999,
    rating: 4.8,
    reviews: 54,
    type: 'Family',
    image: 'https://images.unsplash.com/photo-1600100397608-f010f4414168?auto=format&fit=crop&w=600&q=80',
    highlights: ['Heritage Temple Trails', 'Scenic Coffee Plantations', 'Wildlife Safari'],
    icons: [{ icon: 'airplane' }, { icon: 'building' }, { icon: 'car-front' }, { icon: 'camera' }],
  },
  {
    id: 'kerala-family-tour',
    title: 'Kerala Family Tour',
    slug: 'kerala-family-tour',
    location: 'Kerala, India',
    duration: 5,
    nights: 4,
    price: 16999,
    originalPrice: 21999,
    rating: 4.9,
    reviews: 78,
    type: 'Couple',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80',
    highlights: ['Alleppey Houseboat Stay', 'Munnar Tea Hills', 'Kathakali Dance Show'],
    icons: [{ icon: 'airplane' }, { icon: 'building' }, { icon: 'water' }, { icon: 'camera' }],
  },
  {
    id: 'ooty-coorg-escape',
    title: 'Ooty & Coorg Escape',
    slug: 'ooty-coorg-escape',
    location: 'Tamil Nadu, India',
    duration: 5,
    nights: 4,
    price: 15499,
    originalPrice: 19999,
    rating: 4.7,
    reviews: 43,
    type: 'Holiday',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
    highlights: ['Botanical Gardens Tour', 'Abbey Falls Trek', 'Coffee Tasting Experience'],
    icons: [{ icon: 'airplane' }, { icon: 'building' }, { icon: 'car-front' }, { icon: 'camera' }],
  },
  {
    id: 'goa-beach-holiday',
    title: 'Goa Beach Holiday',
    slug: 'goa-beach-holiday',
    location: 'Goa, India',
    duration: 4,
    nights: 3,
    price: 12999,
    originalPrice: 16999,
    rating: 4.8,
    reviews: 65,
    type: 'Group',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    highlights: ['Calangute Water Sports', 'Sunset Boat Cruise', 'Old Goa Portuguese Churches'],
    icons: [{ icon: 'airplane' }, { icon: 'building' }, { icon: 'cup-hot' }, { icon: 'camera' }],
  },
];

const FALLBACK_REVIEWS = [
  {
    name: 'Priya Sharma',
    rating: 5.0,
    comment: 'An unforgettable trip! Everything was well organized and the team was very supportive.',
    date: '2 weeks ago',
  },
  {
    name: 'Rahul Verma',
    rating: 4.5,
    comment: 'Great experience with comfortable stays and amazing sightseeing. Highly recommended!',
    date: '1 month ago',
  },
  {
    name: 'Ananya Iyer',
    rating: 5.0,
    comment: 'The backwater houseboat stay was the highlight of our trip. Will book again!',
    date: '1 month ago',
  },
];

const cleanReviewContent = (content) => {
  if (!content) return '';
  const text = String(content)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
  return text.replace(/^[\s"“'”]+|[\s"“'”]+$/g, '').trim();
};

const parseStarRating = (badge, rating) => {
  if (typeof badge === 'string' && badge.trim()) {
    const starMatches = badge.match(/[⭐★]/g);
    if (starMatches && starMatches.length > 0) {
      return starMatches.length;
    }
    const num = parseFloat(badge);
    if (!isNaN(num) && num > 0) return Math.min(5, Math.max(1, Math.round(num)));
  }
  if (typeof rating === 'number' && rating > 0) {
    return Math.min(5, Math.max(1, Math.round(rating)));
  }
  return 5;
};

const titleCase = (value) =>
  String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getPackageSlug = (destination, packageSlug) => {
  const requestedSlug = packageSlug || DEFAULT_PACKAGE_SLUGS[String(destination || '').toLowerCase()] || destination;
  return PACKAGE_SLUG_ALIASES[requestedSlug] || requestedSlug;
};

const KNOWN_TRAVEL_SPLIT_PHRASES = [
  'Accommodation in Premium Hotels',
  'Daily Breakfast',
  'Daily Dinner',
  'Airport Pickup & Drop',
  'Private Cab for Sightseeing',
  'Shikara Ride on Dal Lake',
  'Local Sightseeing',
  'All Intercity Transfers',
  'Driver Allowance',
  'Parking Charges',
  'Toll Taxes',
  'GST Included',
  '24x7 Travel Assistance',
  'Airfare / Train Tickets',
  'Lunch',
  'Personal Expenses',
  'Laundry Charges',
  'Travel Insurance',
  'Camera Fees',
  'Adventure Activities',
  'Gondola Tickets',
  'Horse Riding Charges',
  'Entry Tickets to Monuments',
  'Anything Not Mentioned in Inclusions',
];

const extractInclusionExclusionItems = (data) => {
  if (!data) return [];
  let list = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) list = parsed;
      else list = [data];
    } catch {
      list = [data];
    }
  }

  const result = [];

  for (const item of list) {
    const rawText = typeof item === 'string' ? item : item?.text || item?.title || item?.description || item?.name || '';
    if (!rawText || typeof rawText !== 'string') continue;

    if (rawText.includes('\n')) {
      const lines = rawText.split('\n').map((l) => l.trim().replace(/^[-•*]\s*/, '')).filter(Boolean);
      result.push(...lines);
    } else if (rawText.includes('•')) {
      const parts = rawText.split('•').map((p) => p.trim()).filter(Boolean);
      result.push(...parts);
    } else if (rawText.includes(';') || (rawText.includes(',') && rawText.length > 50)) {
      const parts = rawText.split(/[,;]/).map((p) => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        result.push(...parts);
        continue;
      }
    } else {
      let matchedPhrases = [];
      let temp = rawText;
      KNOWN_TRAVEL_SPLIT_PHRASES.forEach((p) => {
        if (temp.includes(p)) {
          matchedPhrases.push(p);
          temp = temp.replace(p, '');
        }
      });
      if (matchedPhrases.length >= 2) {
        result.push(...matchedPhrases);
        continue;
      }

      const cleaned = rawText.trim().replace(/^[-•*]\s*/, '');
      if (cleaned) {
        result.push(cleaned);
      }
    }
  }
  return result;
};

const sortByOrder = (items) =>
  [...(items || [])].sort((a, b) => (Number(a?.order) || 0) - (Number(b?.order) || 0));

const getActivityEntries = (activities) =>
  Object.entries(activities || {})
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([day, activityList]) => ({
      day: Number(day),
      activities: Array.isArray(activityList) ? activityList : [],
    }));

const getRenderableActivityEntries = (activities, maxDays) => {
  const limit = Number(maxDays) || Infinity;
  return getActivityEntries(activities)
    .filter((entry) => entry.day <= limit)
    .filter((entry, index, list) => entry.activities.length || index < limit || list.length === 1);
};

const getActivityImages = (pkg) =>
  sortByOrder(pkg?.destinations).flatMap((destinationItem) =>
    getActivityEntries(destinationItem?.activities).flatMap((entry) =>
      entry.activities
        .map((activity) => ({
          id: activity.id || activity.image,
          type: 'image',
          url: getMediaUrl(activity.image),
          alt: activity.name || 'Activity image',
        }))
        .filter((item) => item.url)
    )
  );

const parseCmsMapPoint = (point, idx) => {
  if (!point) return null;
  if (typeof point === 'object' && point.name && point.dayLabel) {
    return {
      num: point.num || idx + 1,
      dayLabel: point.dayLabel,
      name: point.name,
      targetDay: point.targetDay || idx + 1,
      badgeText: point.badgeText || point.name,
      bullets: Array.isArray(point.bullets) && point.bullets.length > 0
        ? point.bullets
        : [{ icon: 'pin', text: point.name }],
    };
  }

  const raw = typeof point === 'string' ? point : (point.title || point.name || point.description || '');
  let str = raw.trim();
  let num = idx + 1;

  // Extract leading number
  const numMatch = str.match(/^(\d+)[\.\s-]*/);
  if (numMatch) {
    num = parseInt(numMatch[1], 10);
    str = str.slice(numMatch[0].length).trim();
  }

  // Extract Day label: e.g. "Day 1 - 2", "Day 3", "Days 4-5"
  let dayLabel = `Day ${num}`;
  let targetDay = num;
  const dayMatch = str.match(/^(Day[s]?\s*\d+(?:\s*(?:-|to)\s*\d+)?)\s*/i);
  if (dayMatch) {
    dayLabel = dayMatch[1].replace(/\s*-\s*/, ' - ');
    const firstNum = dayLabel.match(/\d+/);
    if (firstNum) targetDay = parseInt(firstNum[0], 10);
    str = str.slice(dayMatch[0].length).trim();
  }

  // Identify destination city: common stops or first word
  const knownCities = [
    'Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg',
    'Bangkok', 'Pattaya', 'Phuket', 'Krabi', 'Chiang Mai',
    'Paris', 'Zurich', 'Lucerne', 'Interlaken', 'Dubai',
    'Bali', 'Ubud', 'Seminyak', 'Kuta', 'Denpasar', 'Manila'
  ];
  let cityName = '';
  let restText = str;

  const foundCity = knownCities.find((c) => str.toLowerCase().startsWith(c.toLowerCase()));
  if (foundCity) {
    cityName = foundCity;
    restText = str.slice(foundCity.length).trim();
  } else {
    const words = str.split(/\s+/);
    if (words.length > 0) {
      cityName = words[0];
      restText = str.slice(cityName.length).trim();
    } else {
      cityName = `Stop ${num}`;
    }
  }

  let bullets = [];
  if (restText.includes(',')) {
    const parts = restText.split(',');
    bullets.push({ icon: 'pin', text: parts[0].trim() });
    if (parts.length > 1) {
      bullets.push({ icon: 'home', text: parts.slice(1).join(',').trim() });
    }
  } else if (restText.includes(' & ')) {
    const parts = restText.split(' & ');
    bullets.push({ icon: 'mountain', text: parts[0].trim() });
    bullets.push({ icon: 'camera', text: parts.slice(1).join(' & ').trim() });
  } else if (restText.length > 0) {
    const splitMatch = restText.match(/(.*?)(Snow Activities|Scenic Views|Nature Walks|Local Markets|Shikara Ride|Gondola Ride|Photography)(.*)/i);
    if (splitMatch && splitMatch[1].trim() && (splitMatch[2] + splitMatch[3]).trim()) {
      bullets.push({ icon: 'pin', text: splitMatch[1].trim() });
      bullets.push({ icon: 'camera', text: (splitMatch[2] + splitMatch[3]).trim() });
    } else {
      bullets.push({ icon: 'pin', text: restText });
    }
  } else {
    bullets.push({ icon: 'pin', text: `${cityName} Sightseeing` });
  }

  return {
    num,
    dayLabel,
    targetDay,
    name: cityName,
    badgeText: bullets.map((b) => b.text).join(' & ') || cityName,
    bullets: bullets.filter((b) => b.text && b.text.length > 0),
  };
};

const parseCmsTransferTab = (tab, idx = 0, pkgId = '1') => {
  if (!tab) return null;

  const rawTitle = String(tab.title || '').trim();
  const rawBadge = String(tab.badge || '').trim();
  const rawImg = String(tab.img || '').trim();
  const rawContent = String(tab.content || '').trim();

  // Decode common HTML entities
  const decodedContent = rawContent
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&bull;/gi, '•')
    .replace(/&middot;/gi, '•')
    .replace(/&#8226;/gi, '•')
    .replace(/&rarr;/gi, '→');

  // Split into paragraphs / lines
  const lines = decodedContent
    .split(/<\/p>|<br\s*\/?>|<div>/i)
    .map((line) => line.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean);

  // 1. Vehicle Name: e.g. "Maruti Suzuki Ertiga Cab", "Toyota Innova Crysta (AC)"
  let vehicleName = '';
  const strongMatch = decodedContent.match(/<strong[^>]*>([^<]+)<\/strong>/i);
  if (lines.length > 0 && !/[→⇄\->]|passenger|₹|refundable|itinerary|arrival|departure/i.test(lines[0])) {
    vehicleName = lines[0];
  } else if (strongMatch && !/refundable|itinerary|₹|passenger/i.test(strongMatch[1])) {
    vehicleName = strongMatch[1].trim();
  }
  if (!vehicleName) {
    vehicleName = 'Private Transfer Cab';
  }

  // 2. Route: e.g. "Kashmir Airport → Kashmir Hotel", "Kashmir → Kashmir"
  let route = '';
  const routeLine = lines.find((l) => /[→⇄\->]/.test(l) && !/passenger|itinerary|refundable|₹|vehicle/i.test(l));
  if (routeLine) {
    route = routeLine;
  } else if (lines[1] && !/passenger|refundable|₹|itinerary/i.test(lines[1])) {
    route = lines[1];
  } else {
    route = rawTitle || 'City to Hotel Transfer';
  }

  // 3. Vehicle Type and Duration: e.g. "Private transfer • 45 mins", "Private transfer • 1hr 50mins"
  let vehicleType = 'Private transfer';
  let duration = '45 mins';
  const typeDurLine = lines.find((l) =>
    /[•·|]/.test(l) ||
    /(?:min|mins|minute|minutes|hr|hrs|hour|hours)/i.test(l)
  );

  if (typeDurLine) {
    const parts = typeDurLine.split(/[•·|]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      if (/(?:min|hr|hour)/i.test(parts[0])) {
        duration = parts[0];
        vehicleType = parts[1];
      } else {
        vehicleType = parts[0];
        duration = parts[1];
      }
    } else if (parts.length === 1) {
      const durMatch = parts[0].match(/(?:(\d+\s*(?:hr|hrs|hour|hours)\s*)?(\d+\s*(?:min|mins|minutes)?)|(?:full\s*day(?:[^\)]*)?))/i);
      if (durMatch && durMatch[0]) {
        duration = durMatch[0].trim();
        const remType = parts[0].replace(durMatch[0], '').replace(/[•·\-]/g, '').trim();
        if (remType) vehicleType = remType;
      } else {
        vehicleType = parts[0];
      }
    }
  }

  // 4. Refundable:
  const hasNonRefundable = /non[-\s]*refundable/i.test(decodedContent);
  const hasRefundable = /(?:^|[^\w-])(?:refundable|free\s*cancellation)/i.test(decodedContent) || /✔️|✔/i.test(decodedContent);
  const isRefundable = Boolean(hasRefundable && !hasNonRefundable);
  const isNonRefundable = Boolean(hasNonRefundable || !isRefundable);

  // 5. Passengers: e.g. "4 Passengers in 1 vehicle"
  let passengers = '4 Passengers in 1 vehicle';
  const passLine = lines.find((l) => /passenger/i.test(l) && !/₹|per vehicle/i.test(l));
  if (passLine) {
    passengers = passLine;
  }

  // 6. Price: e.g. "₹ 1,800Per vehicle" or "₹ 2,800Per vehicle"
  let price = 1800;
  const priceMatch = decodedContent.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i);
  if (priceMatch) {
    price = parseInt(priceMatch[1].replace(/,/g, ''), 10) || 0;
  } else {
    const numPerVeh = decodedContent.match(/([\d,]+)\s*(?:per\s*vehicle|\/-\s*per)/i);
    if (numPerVeh) {
      price = parseInt(numPerVeh[1].replace(/,/g, ''), 10) || 0;
    }
  }

  // 7. Image:
  let vehicleImg = '';
  if (rawImg) {
    vehicleImg = getMediaUrl(rawImg);
  }
  if (!vehicleImg) {
    if (/innova/i.test(vehicleName)) {
      vehicleImg = '/images/transfers/innova_crysta.jpg';
    } else {
      vehicleImg = '/images/transfers/ertiga_cab.jpg';
    }
  }

  // 8. Unique ID:
  const slugifiedTitle = rawTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const id = `cms-transfer-${pkgId || 'pkg'}-${idx}-${slugifiedTitle || idx}`;

  return {
    id,
    title: rawTitle || vehicleName,
    route,
    dateTag: rawBadge || `Day ${idx + 1}`,
    vehicleType,
    vehicleName,
    vehicleImg,
    duration,
    passengers,
    refundable: isRefundable,
    nonRefundable: isNonRefundable,
    refundableLabel: isRefundable ? 'Refundable' : 'Non Refundable',
    price,
  };
};

const parseCmsActivityTab = (tab, idx = 0, pkgId = '1') => {
  if (!tab) return null;

  const rawTitle = String(tab.title || '').trim();
  const rawBadge = String(tab.badge || '').trim();
  const rawImg = String(tab.img || '').trim();
  const rawContent = String(tab.content || '').trim();

  // Decode common HTML entities
  const decodedContent = rawContent
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&bull;/gi, '•')
    .replace(/&middot;/gi, '•')
    .replace(/&#8226;/gi, '•');

  // Split into paragraphs / lines
  const lines = decodedContent
    .split(/<\/p>|<br\s*\/?>|<div>/i)
    .map((line) => line.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean);

  // 1. Tag: e.g. "ACTIVITY ADDON" or first strong match or default
  let tag = 'ACTIVITY ADDON';
  const strongMatches = [...decodedContent.matchAll(/<strong[^>]*>([^<]+)<\/strong>/gi)].map((m) => m[1].trim());
  if (lines.length > 0 && /addon|activity|pass|trail|cruise|tour|experience/i.test(lines[0]) && !/₹|per/i.test(lines[0])) {
    tag = lines[0];
  } else if (strongMatches[0] && !/₹|per|itinerary/i.test(strongMatches[0])) {
    tag = strongMatches[0];
  }

  // 2. Category and Duration: e.g. "Activity Addon • 1 Hour Sunset Cruise", "Adventure Pass • 3 - 4 Hours", "Nature Trail • 2 Hours"
  let category = 'Activity Addon';
  let duration = '1 - 2 Hours';
  const metaLine = lines.find((l) =>
    /[•·|]/.test(l) &&
    !/₹|per person|itinerary|Glide|Ascend|Explore/i.test(l)
  );

  if (metaLine) {
    const parts = metaLine.split(/[•·|]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      if (/(?:hour|hours|hr|hrs|min|mins|day)/i.test(parts[0])) {
        duration = parts[0];
        category = parts[1];
      } else {
        category = parts[0];
        duration = parts[1];
      }
    } else if (parts.length === 1) {
      if (/(?:hour|hours|hr|hrs|min|mins|day)/i.test(parts[0])) {
        duration = parts[0];
      } else {
        category = parts[0];
      }
    }
  }

  // 3. Notes / Description:
  let notes = '';
  const notesLine = lines.find((l) =>
    l.length > 25 &&
    !/[•·|]/.test(l) &&
    !/₹|per person|\+ add to itinerary|^activity addon$/i.test(l)
  );
  if (notesLine) {
    notes = notesLine;
  } else {
    const candidate = lines.find((l) =>
      !/^(activity addon|adventure pass|nature trail)$/i.test(l) &&
      !/₹|per person|per vehicle|add to itinerary/i.test(l) &&
      !/[•·|]/.test(l)
    );
    if (candidate) notes = candidate;
  }

  // 4. Price: e.g. "₹ 800", "₹ 1,950", "₹ 1,200"
  let price = 800;
  const priceMatch = decodedContent.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i);
  if (priceMatch) {
    price = parseInt(priceMatch[1].replace(/,/g, ''), 10) || 0;
  } else {
    const numPerPerson = decodedContent.match(/([\d,]+)\s*(?:per\s*person|\/-\s*per)/i);
    if (numPerPerson) {
      price = parseInt(numPerPerson[1].replace(/,/g, ''), 10) || 0;
    }
  }

  // 5. Image:
  let image = '';
  if (rawImg) {
    image = getMediaUrl(rawImg);
  }
  if (!image) {
    if (/shikara/i.test(rawTitle)) {
      image = 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80';
    } else if (/gondola|cable/i.test(rawTitle)) {
      image = 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80';
    } else if (/pony|horse/i.test(rawTitle)) {
      image = 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80';
    } else {
      image = 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&q=80';
    }
  }

  // 6. Unique ID:
  const slugifiedTitle = rawTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const id = `cms-addon-${pkgId || 'pkg'}-${idx}-${slugifiedTitle || idx}`;

  return {
    id,
    name: rawTitle,
    category,
    tag: tag || 'ACTIVITY ADDON',
    badge: rawBadge || 'Experience Pass',
    duration,
    image,
    notes,
    price,
  };
};

const DESTINATION_GALLERY_FALLBACKS = {
  thailand: [
    { url: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=1200&q=80', alt: 'Phi Phi Islands turquoise lagoon' },
    { url: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200&q=80', alt: 'Phuket white-sand beach and limestone cliffs' },
    { url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80', alt: 'Traditional Thai long-tail boat' },
    { url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80', alt: 'Khao Sok National Park emerald lake' },
    { url: 'https://images.unsplash.com/photo-1512553353614-82a7370096dc?auto=format&fit=crop&w=1200&q=80', alt: 'Damnoen Saduak Floating Market' },
    { url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1200&q=80', alt: 'Bangkok Grand Palace temple spires' },
    { url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80', alt: 'Chiang Mai cultural lanterns' },
    { url: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=1200&q=80', alt: 'Tropical Thai sunset over ocean' },
  ],
  bangkok: [
    { url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80', alt: 'Bangkok lively street & tuk-tuks' },
    { url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1200&q=80', alt: 'Wat Phra Kaew & Grand Palace' },
    { url: 'https://images.unsplash.com/photo-1512553353614-82a7370096dc?auto=format&fit=crop&w=1200&q=80', alt: 'Bangkok canal & floating market' },
    { url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80', alt: 'Chao Phraya River boat cruise' },
    { url: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=1200&q=80', alt: 'Thailand coastal adventure' },
    { url: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200&q=80', alt: 'Tropical island getaway' },
  ],
  kashmir: [
    { url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80', alt: 'Dal Lake Shikara boats at sunrise' },
    { url: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80', alt: 'Gulmarg snowy mountain slopes' },
    { url: 'https://images.unsplash.com/photo-1626014303757-656447767074?auto=format&fit=crop&w=1200&q=80', alt: 'Pahalgam Lidder valley & pine forest' },
    { url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80', alt: 'Luxury Dal Lake houseboat' },
    { url: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80', alt: 'Mughal Gardens Srinagar' },
    { url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=1200&q=80', alt: 'Sonamarg glacier meadow' },
  ],
  dubai: [
    { url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80', alt: 'Burj Khalifa skyline' },
    { url: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=1200&q=80', alt: 'Arabian Desert 4x4 safari' },
    { url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1200&q=80', alt: 'Dubai Marina luxury yachts' },
    { url: 'https://images.unsplash.com/photo-1578895101407-794711311f9f?auto=format&fit=crop&w=1200&q=80', alt: 'Palm Jumeirah & Atlantis' },
    { url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80', alt: 'Miracle Garden florals' },
  ],
  switzerland: [
    { url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80', alt: 'Zermatt & Matterhorn' },
    { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', alt: 'Lauterbrunnen alpine valley' },
    { url: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1200&q=80', alt: 'Lake Lucerne panoramic cruise' },
    { url: 'https://images.unsplash.com/photo-1573155993874-d5d48af862ba?auto=format&fit=crop&w=1200&q=80', alt: 'Glacier Express alpine train' },
  ],
  paris: [
    { url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80', alt: 'Eiffel Tower lights' },
    { url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80', alt: 'Louvre Museum pyramid' },
    { url: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=1200&q=80', alt: 'Romantic Seine river cruise' },
    { url: 'https://images.unsplash.com/photo-1520939817895-060bdef4df1a?auto=format&fit=crop&w=1200&q=80', alt: 'Palace of Versailles gardens' },
  ],
  maldives: [
    { url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80', alt: 'Overwater bungalow villas' },
    { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', alt: 'Crystal turquoise ocean' },
    { url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80', alt: 'Private sandbank at sunset' },
    { url: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1200&q=80', alt: 'Coral reef snorkeling' },
  ],
  bali: [
    { url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', alt: 'Tegalalang rice terraces Ubud' },
    { url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80', alt: 'Tanah Lot ocean temple' },
    { url: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1200&q=80', alt: 'Kelingking beach Nusa Penida' },
    { url: 'https://images.unsplash.com/photo-1558005530-a7958896ec60?auto=format&fit=crop&w=1200&q=80', alt: 'Jungle waterfall sanctuary' },
  ],
  default: [
    { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', alt: 'Scenic mountain landscape' },
    { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', alt: 'Tropical sandy coastline' },
    { url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80', alt: 'Tranquil water getaway' },
    { url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80', alt: 'Heritage cultural exploration' },
  ]
};

const getDestinationFallbackMedia = (pkg) => {
  const text = `${pkg?.name || ''} ${pkg?.slug || ''} ${(pkg?.destinations || []).map((d) => `${d?.destination?.name || ''} ${d?.destination?.country || ''}`).join(' ')}`.toLowerCase();

  for (const [key, items] of Object.entries(DESTINATION_GALLERY_FALLBACKS)) {
    if (key !== 'default' && text.includes(key)) {
      return items;
    }
  }
  return DESTINATION_GALLERY_FALLBACKS.default;
};

const isVideoUrl = (url) => /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(String(url || ''));

const isVideoMediaItem = (item) => {
  if (!item) return false;
  if (typeof item === 'string') return isVideoUrl(item);
  const mediaType = String(item.media_type || item.type || '').toLowerCase();
  if (mediaType === 'video') return true;
  return isVideoUrl(item.url || item.image || item.path || item.video);
};

const getPackageMedia = (pkg) => {
  let rawGallery = pkg?.gallery;
  if (typeof rawGallery === 'string') {
    try {
      rawGallery = JSON.parse(rawGallery);
    } catch {
      rawGallery = [];
    }
  }
  if (!Array.isArray(rawGallery)) {
    rawGallery = [];
  }

  const galleryItems = rawGallery.map((item) => {
    const rawUrl = typeof item === 'string' ? item : (item.url || item.image || item.path || item.video);
    const isVideo = isVideoMediaItem(item);
    return {
      id: (typeof item === 'object' && item?.id) ? item.id : rawUrl,
      type: isVideo ? 'video' : 'image',
      url: getMediaUrl(rawUrl),
      poster: (typeof item === 'object' && item?.poster_url) ? getMediaUrl(item.poster_url) : '',
      alt: (typeof item === 'object' && (item.alt_text || item.label)) || pkg?.name || 'Package media',
      is_primary: typeof item === 'object' ? Boolean(item.is_primary) : false,
    };
  }).filter((item) => item.url);

  const galleryVideos = galleryItems.filter((item) => item.type === 'video');

  // Also check if pkg itself has a direct video field like pkg.video or pkg.video_url
  if (galleryVideos.length === 0 && (pkg?.video || pkg?.video_url || pkg?.main_video)) {
    const vUrl = getMediaUrl(pkg.video || pkg.video_url || pkg.main_video);
    if (vUrl) {
      galleryVideos.push({
        id: 'pkg-main-video',
        type: 'video',
        url: vUrl,
        poster: getMediaUrl(pkg?.main_image),
        alt: pkg?.name || 'Package video',
        is_primary: true,
      });
    }
  }

  const imageItems = [
    {
      id: 'main-image',
      type: 'image',
      url: getMediaUrl(pkg?.main_image),
      alt: pkg?.main_image_alt || pkg?.name || 'Package image',
    },
    ...sortByOrder(pkg?.destinations).map((item) => ({
      id: `destination-${item?.id || item?.destination?.slug}`,
      type: 'image',
      url: getMediaUrl(item?.destination?.feature_image),
      alt: item?.destination?.feature_image_alt || item?.destination?.name || 'Destination image',
    })),
    ...getActivityImages(pkg),
    ...galleryItems.filter((item) => item.type === 'image'),
  ].filter((item) => item.url);

  const destinationFallbacks = getDestinationFallbackMedia(pkg);
  const destinationFallbackItems = destinationFallbacks.map((f, i) => ({
    id: `dest-fallback-${i}`,
    type: 'image',
    url: f.url,
    alt: f.alt || pkg?.name || 'Tour photo',
  }));

  const combinedImages = [...imageItems];
  for (const fb of destinationFallbackItems) {
    if (combinedImages.length >= 8) break;
    if (!combinedImages.some((c) => c.url === fb.url)) {
      combinedImages.push(fb);
    }
  }

  const uniqueImages = combinedImages.filter((item, index, list) => (
    list.findIndex((candidate) => candidate.url === item.url) === index
  ));

  return {
    images: uniqueImages.length ? uniqueImages : [{ id: 'fallback', type: 'image', url: fallbackImage, alt: 'Travel package' }],
    videos: galleryVideos,
  };
};

const getDurationLabel = (days) => {
  const safeDays = Number(days) || 0;
  if (!safeDays) return 'Custom itinerary';
  const nights = Math.max(safeDays - 1, 0);
  return `${nights}N / ${safeDays}D`;
};

const clampTravellerCount = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.min(25, parsed));
};

const getPackageIdFromSlug = (slug) => {
  const match = String(slug || '').match(/^package-(\d+)$/i);
  return match ? Number(match[1]) : null;
};

const formatReviewDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Recently reviewed';

  return `Reviewed on: ${date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })}`;
};

const getStars = (rating) => {
  const safeRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return '★'.repeat(safeRating) || '★';
};

const formatTaxPercent = (value) => {
  const percent = Number(value) || 0;
  if (!percent) return '0';
  return Number.isInteger(percent) ? String(percent) : percent.toFixed(2).replace(/\.?0+$/, '');
};

const getDestinationHotels = (destinationItem) => {
  const list = destinationItem?.activities?._hotels || destinationItem?.hotels || [];
  return Array.isArray(list) ? list.filter((hotel) => hotel?.name) : [];
};

const PACKAGE_BOOKING_STORAGE_KEY = 'package_booking_draft';

const writePackageBookingDraft = (draft) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(PACKAGE_BOOKING_STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.warn('Unable to store package booking draft:', error);
  }
};

const readPackageBookingDraft = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(PACKAGE_BOOKING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Unable to read package booking draft:', error);
    return null;
  }
};

const clearPackageBookingDraft = () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(PACKAGE_BOOKING_STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to clear package booking draft:', error);
  }
};

const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
  if (typeof window === 'undefined') {
    reject(new Error('Razorpay checkout is available only in the browser.'));
    return;
  }

  if (window.Razorpay) {
    resolve(window.Razorpay);
    return;
  }

  const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
  if (existingScript) {
    existingScript.addEventListener('load', () => resolve(window.Razorpay), { once: true });
    existingScript.addEventListener('error', () => reject(new Error('Unable to load Razorpay checkout.')), { once: true });
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = () => resolve(window.Razorpay);
  script.onerror = () => reject(new Error('Unable to load Razorpay checkout.'));
  document.body.appendChild(script);
});

const hasLoggedInUser = () => Boolean(getStoredToken() && getStoredAuth());

function LoadingView() {
  return (
    <div className="itn-page">
      <main className="itn-container">
        <div className="itn-skeleton itn-skeleton-banner" />
        <div className="itn-skeleton itn-skeleton-title" />
        <div className="itn-skeleton itn-skeleton-tabs" />
      </main>
      <ItineraryStyles />
    </div>
  );
}

function Activity({ activity, destinationImage }) {
  const isLeisure = activity?.isLeisure;
  const time = activity?.duration || 'Activity';
  const activityImage = getMediaUrl(activity?.image) || destinationImage;

  return (
    <div className={`itn-activity ${isLeisure ? 'is-leisure' : ''}`}>
      {activityImage && !isLeisure ? (
        <span className="itn-activity-photo">
          <Image src={activityImage} alt="" width={32} height={32} />
        </span>
      ) : (
        <span className="itn-dot">{isLeisure ? '+' : 'i'}</span>
      )}
      <div>
        <small>{time}</small>
        <p>
          {isLeisure ? (
            <>At leisure.</>
          ) : (
            <>
              <strong>{activity?.name || 'Planned activity'}</strong>
              {activity?.description ? <em>{activity.description}</em> : null}
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function DayRow({ day, activities, destinationImage }) {
  const visibleActivities = activities?.length
    ? activities
    : [{ id: `leisure-${day}`, duration: 'Full day', isLeisure: true }];

  return (
    <div className="itn-day-row" id={`itinerary-day-${day}`}>
      <div className="itn-day">Day {String(day).padStart(2, '0')}</div>
      <div className="itn-day-activities" data-count={Math.min(visibleActivities.length, 3)}>
        {visibleActivities.map((activity, index) => (
          <Activity
            key={activity?.id || `${day}-${index}`}
            activity={activity}
            destinationImage={index === 1 ? destinationImage : ''}
          />
        ))}
      </div>
    </div>
  );
}

function DestinationCard({ item, startDay, showTemperature, remainingDays }) {
  const destinationName = item?.destination?.name || 'Destination';
  const destinationImage = getMediaUrl(item?.destination?.feature_image);
  const maxRowsForDestination = Math.max(1, Math.min(
    Number(remainingDays) || Number(item?.nights) || 1,
    Math.max(Number(item?.nights) || 1, getActivityEntries(item?.activities).filter((entry) => entry.activities.length).length || 1)
  ));
  const activityEntries = getRenderableActivityEntries(item?.activities, maxRowsForDestination);
  const rowCount = Math.max(Number(item?.nights) || 1, activityEntries.length || 1);

  return (
    <div className="itn-city-card">
      <div className="itn-city-head">
        <strong>{destinationName}</strong>
        <span>- {Number(item?.nights) || 0} {Number(item?.nights) === 1 ? 'Night' : 'Nights'}</span>
        {showTemperature ? (
          <>
            <span>- Temperature</span>
            <span className="itn-temp">High: 30&deg;C <i /> Low: 26&deg;C</span>
          </>
        ) : null}
      </div>
      {Array.from({ length: rowCount }).map((_, index) => {
        const entry = activityEntries.find((activityEntry) => activityEntry.day === index + 1);
        return (
          <DayRow
            key={`${item?.id || destinationName}-${index}`}
            day={startDay + index}
            activities={entry?.activities || []}
            destinationImage={destinationImage}
          />
        );
      })}
    </div>
  );
}

function TransferConnector({ destinationName }) {
  return (
    <div className="itn-transfer-bridge" aria-hidden="true">
      <svg viewBox="0 0 330 86" preserveAspectRatio="none">
        <path d="M70 0 C70 38 165 24 165 45 C165 66 260 48 260 86" />
      </svg>
      <span className="itn-transfer-dot itn-transfer-dot-start" />
      <span className="itn-transfer-dot itn-transfer-dot-end" />
      <span className="itn-transfer-icon" />
      <p>Get transferred to {destinationName}</p>
    </div>
  );
}

const CUSTOM_TRAVELLER_OPTIONS = [
  { name: 'Couple', emoji: '💑', desc: 'Romantic Getaway for 2' },
  { name: 'Family', emoji: '👨‍👩‍👧‍👦', desc: 'Fun & Comfort for All' },
  { name: 'Group', emoji: '👥', desc: '6+ Travellers / Friends' },
  { name: 'Solo', emoji: '🎒', desc: 'Freedom & Exploration' },
  { name: 'Honeymoon', emoji: '💍', desc: 'Romantic Luxury Suite' },
  { name: 'Corporate', emoji: '💼', desc: 'Business & Team Outing' },
  { name: 'NRI Package', emoji: '🏛️', desc: 'Root Experience Tour' },
  { name: 'Senior Citizen', emoji: '👴', desc: 'Relaxed & Gentle Pace' },
];

const NAV_HEADINGS = [
  { id: 'itinerary-overview', label: 'Overview', icon: 'overview' },
  { id: 'itinerary-tour-highlights', label: 'Tour highlights', icon: 'highlights' },
  { id: 'itinerary-day-wise', label: 'Itinerary', icon: 'itinerary' },
  { id: 'itinerary-excluded-items', label: 'Hotels & Transport', icon: 'excluded' },
  { id: 'itinerary-create-itinerary', label: 'Create your Itinerary', icon: 'create' },
  { id: 'itinerary-addons', label: "Add On's", icon: 'addons' },
  { id: 'itinerary-inclusions-exclusions', label: 'Inclusions & Exclusions', icon: 'inclusions' },
  { id: 'itinerary-cancellation-policy', label: 'Cancellation Policy', icon: 'cancellation' },
  { id: 'itinerary-blogs-articles', label: 'Blogs & Articles', icon: 'blogs' },
];

function renderNavIcon(icon) {
  switch (icon) {
    case 'overview':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    case 'highlights':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'itinerary':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case 'excluded':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    case 'create':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    case 'addons':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      );
    case 'inclusions':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case 'blogs':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'cancellation':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    default:
      return null;
  }
}

function ItineraryStyles() {
  return (
    <style jsx global>{`
      .itn-page {
        background: #ffffff;
        padding: 144px 0 130px;
        color: var(--color-text-primary, #0f172a);
        font-family: inherit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.6;
      }
      .itn-container {
        width: min(100%, 1240px);
        margin: 0 auto;
        padding: 0 20px;
      }

      /* Hero Panoramic Banner */
      .itn-hero-banner {
        position: relative;
        width: 100%;
        height: clamp(340px, 42vw, 560px);
        border-radius: 14px;
        overflow: hidden;
        margin-bottom: 24px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        background: #0f172a;
      }
      @media (max-width: 991px) {
        .itn-page {
          padding-top: 100px;
        }
        .itn-hero-banner {
          height: clamp(280px, 38vw, 420px);
        }
      }
      .itn-hero-video-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #0f172a;
      }
      .itn-hero-video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        cursor: pointer;
      }
      .itn-hero-video-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.15) 0%, rgba(15, 23, 42, 0) 45%, rgba(15, 23, 42, 0.45) 100%);
      }
      .itn-hero-video-controls {
        position: absolute;
        bottom: 16px;
        right: 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 5;
      }
      .itn-hero-ctrl-btn {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.25);
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        padding: 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      }
      .itn-hero-ctrl-btn:hover {
        background: rgba(15, 23, 42, 0.95);
        transform: scale(1.08);
        border-color: rgba(255, 255, 255, 0.5);
      }
      .itn-hero-video-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 9999px;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #ffffff;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.3px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        user-select: none;
      }
      .itn-hero-live-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ef4444;
        box-shadow: 0 0 8px #ef4444;
        animation: itnPulse 2s infinite ease-in-out;
      }
      @keyframes itnPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(0.85); }
      }

      /* Tour Map Top Bar & Breadcrumbs */
      .itn-tour-map-top-bar {
        display: flex;
        align-items: center;
        margin-bottom: 14px;
      }
      .itn-tour-map-top-btn {
        margin: 0;
      }
      .itn-title-row {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 16px;
        flex-wrap: wrap;
        width: 100%;
        margin-bottom: 12px;
      }
      .itn-tour-map-title-wrap {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }
      .itn-tour-map-title-btn {
        height: 34px;
        padding: 0 14px;
        font-size: 13px;
        font-weight: 700;
        border-radius: 8px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(170, 132, 83, 0.12);
        width: auto !important;
      }
      .itn-breadcrumbs {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #64748b;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      .itn-breadcrumbs a {
        color: #64748b;
        text-decoration: none;
        transition: color 0.15s ease;
      }
      .itn-breadcrumbs a:hover {
        color: var(--color-primary, #0f766e);
      }
      .itn-breadcrumbs span.sep {
        color: #94a3b8;
        font-size: 11px;
      }
      .itn-breadcrumb-active {
        color: var(--color-primary, #0f766e);
        font-weight: 600;
      }

      /* Title & Header Meta */
      .itn-header {
        margin-bottom: 28px;
      }
      .itn-page-title {
        margin: 0;
        font-size: clamp(26px, 3.4vw, 38px);
        font-weight: 800;
        color: var(--color-text-primary, #0f172a);
        line-height: 1.18;
        letter-spacing: -0.02em;
        display: inline-block;
        width: auto;
      }
      .itn-rating-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        margin-bottom: 12px;
      }
      .itn-star-icon {
        color: #f59e0b;
        font-size: 15px;
      }
      .itn-rating-val {
        font-weight: 700;
        color: #0f172a;
      }
      .itn-review-count {
        color: #64748b;
        font-weight: 500;
      }
      .itn-meta-chips {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 14px;
      }
      .itn-meta-chip {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: #475569;
        font-size: 13px;
        font-weight: 600;
      }
      .itn-meta-chip svg {
        color: var(--color-primary, #0f766e);
        flex-shrink: 0;
      }
      .itn-view-route-btn {
        background: #FAF7F0;
        border: 1.5px solid var(--color-primary, #AA8453);
        color: var(--color-primary, #AA8453);
        border-radius: 8px;
        padding: 5px 14px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        box-shadow: 0 2px 6px rgba(170, 132, 83, 0.1);
        transition: all 0.2s ease;
      }
      .itn-view-route-btn:hover {
        background: var(--color-primary, #AA8453);
        color: #ffffff;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(170, 132, 83, 0.25);
      }
      .itn-view-route-btn svg {
        stroke: currentColor;
      }
      .itn-description-wrap {
        width: 100%;
        max-width: 100%;
        margin-top: 6px;
      }
      .itn-description-text {
        margin: 0;
        width: 100%;
        color: #475569;
        font-size: 14px;
        line-height: 1.68;
        transition: max-height 0.3s ease;
      }
      .itn-description-text.is-clamped {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .itn-desc-read-more-btn {
        background: none;
        border: none;
        color: var(--color-primary, #0f766e);
        font-weight: 700;
        font-size: 13.5px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 0 0;
        margin-top: 4px;
        transition: opacity 0.2s ease;
      }
      .itn-desc-read-more-btn:hover {
        opacity: 0.82;
        text-decoration: underline;
      }

      /* Main Two-Column Layout */
      .itn-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 350px;
        gap: 36px;
        align-items: start;
        margin-top: 24px;
      }
      .itn-main-col {
        min-width: 0;
        width: 100%;
        max-width: 100%;
      }

      /* Section Common */
      .itn-content-block {
        margin-bottom: 44px;
      }
      .itn-block-title {
        margin: 0 0 18px;
        font-size: 21px;
        font-weight: 800;
        color: var(--color-text-primary, #0f172a);
        letter-spacing: -0.01em;
      }

      /* Preserved Day-wise Itinerary Styles */
      .itn-itinerary-wrap {
        position: relative;
        padding-left: 8px;
        margin-bottom: 8px;
      }
      .itn-itinerary-wrap::before {
        content: '';
        position: absolute;
        left: -18px;
        top: 20px;
        bottom: 18px;
        width: 3px;
        border-radius: 999px;
        background: linear-gradient(180deg, #b9dcf5, color-mix(in srgb, var(--color-primary, #0f766e) 14%, transparent));
        opacity: .7;
      }
      .itn-city-card {
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 0;
        background: #fff;
        box-shadow: 0 14px 36px rgba(15, 23, 42, .06);
      }
      .itn-city-head {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 5px;
        min-height: 58px;
        background: linear-gradient(90deg, #cfeeff 0%, #e9f6ff 100%);
        padding: 13px 18px;
        color: #334155;
        font-size: 14px;
      }
      .itn-city-head strong {
        font-size: 18px;
        font-weight: 800;
        color: #1e293b;
      }
      .itn-city-head span {
        color: #475569;
        font-size: 14px;
        font-weight: 700;
      }
      .itn-temp {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-left: 4px;
        padding: 2px 9px;
        border: 1px solid var(--color-primary, #0f766e);
        border-radius: 999px;
        background: #fff;
        color: #0f172a !important;
        font-size: 11px;
        font-weight: 800 !important;
        white-space: nowrap;
      }
      .itn-temp i { width: 3px; height: 3px; border-radius: 50%; background: #9ca3af; }
      .itn-day-row {
        display: grid;
        grid-template-columns: 80px 1fr;
        min-height: 84px;
        border-top: 1px solid #cbd5e1;
      }
      .itn-day {
        padding: 16px 12px;
        color: #475569;
        font-size: 14px;
        font-weight: 700;
        border-right: 1px solid #cbd5e1;
        background: #fff;
        white-space: nowrap;
      }
      .itn-day-activities {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .itn-day-activities[data-count="1"] { grid-template-columns: 1fr; }
      .itn-day-activities[data-count="3"] { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .itn-activity {
        display: grid;
        grid-template-columns: 34px 1fr;
        gap: 12px;
        min-height: 98px;
        padding: 16px 16px;
        border-right: 1px solid #cbd5e1;
        background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
        transition: background 0.15s ease;
      }
      .itn-activity:hover { background: #f5fbff; }
      .itn-activity:last-child { border-right: 0; }
      .itn-dot, .itn-activity-photo {
        width: 32px;
        height: 32px;
        margin-top: 1px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        overflow: hidden;
        background: #64748b;
        color: #fff;
        font-size: 11px;
        font-weight: 800;
        box-shadow: 0 1px 2px rgba(15, 23, 42, .08);
      }
      .itn-activity-photo img { width: 100%; height: 100%; object-fit: cover; }
      .itn-activity small {
        color: var(--color-primary, #0f766e);
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: .3px;
      }
      .itn-activity p { margin: 3px 0 0; color: #1e293b; font-size: 13px; line-height: 1.42; }
      .itn-activity strong { display: block; margin: 4px 0 0; color: #0f172a; font-size: 14px; font-weight: 700; }
      .itn-activity em { display: block; margin-top: 2px; color: #64748b; font-style: normal; font-size: 12px; }
      .itn-activity.is-leisure { grid-template-columns: 1fr; }
      .itn-activity.is-leisure .itn-dot { display: none; }
      .itn-transfer-bridge {
        position: relative;
        height: 84px;
        max-width: 340px;
        margin: -1px auto 0;
        color: #0f172a;
        text-align: center;
      }
      .itn-transfer-bridge svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
      .itn-transfer-bridge path { fill: none; stroke: #d1d5db; stroke-width: 3; stroke-linecap: round; }
      .itn-transfer-dot { position: absolute; width: 14px; height: 14px; border-radius: 50%; background: #9ca3af; transform: translate(-50%, -50%); }
      .itn-transfer-dot-start { left: 21%; top: 0; }
      .itn-transfer-dot-end { left: 79%; top: 100%; }
      .itn-transfer-icon {
        position: absolute;
        left: 50%;
        top: 34px;
        transform: translate(-50%, -50%);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: #475569;
        color: #fff;
      }
      .itn-transfer-icon::before { content: ''; width: 13px; height: 7px; border: 2px solid currentColor; border-radius: 4px 4px 2px 2px; }
      .itn-transfer-icon::after { content: ''; position: absolute; width: 16px; height: 2px; background: currentColor; border-radius: 999px; transform: translateY(6px); }
      .itn-transfer-bridge p {
        position: absolute;
        left: 50%;
        bottom: 10px;
        width: max-content;
        max-width: min(340px, 80vw);
        transform: translateX(-50%);
        margin: 0;
        color: #1e293b;
        font-size: 13px;
        font-weight: 600;
      }

      /* Gallery Section */
      .itn-gallery-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 16px;
      }
      .itn-gallery-thumb {
        position: relative;
        aspect-ratio: 16 / 10;
        border-radius: 8px;
        overflow: hidden;
        background: #f1f5f9;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .itn-gallery-thumb:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      }
      .itn-btn-outline {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 9px 24px;
        border: 1px solid var(--color-primary, #0f766e);
        color: var(--color-primary, #0f766e);
        background: #fff;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .itn-btn-outline:hover {
        background: var(--color-primary, #0f766e);
        color: #fff;
      }

      /* ============================================================ */
      /* Excluded Services Section (Hotels & Transport)                */
      /* ============================================================ */
      /* Hotels & Transport Section (Hotels & Transport)              */
      /* Styled with Dynamic Site Theme Color                         */
      /* ============================================================ */
      .itn-exc-header {
        margin-bottom: 16px;
      }
      .itn-exc-header-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 14px;
      }
      .itn-exc-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: color-mix(in srgb, var(--color-primary, #AA8453) 10%, #ffffff);
        color: var(--color-primary, #AA8453);
        border: 1px solid color-mix(in srgb, var(--color-primary, #AA8453) 28%, transparent);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.6px;
        padding: 4px 11px;
        border-radius: 999px;
        margin-bottom: 8px;
        text-transform: uppercase;
      }
      .itn-exc-title {
        font-size: 21px;
        font-weight: 800;
        color: var(--color-text-primary, #0f172a);
        margin: 0 0 6px !important;
        letter-spacing: -0.01em;
      }
      .itn-exc-subtitle {
        margin: 0;
        font-size: 13.5px;
        color: #64748b;
        line-height: 1.5;
        max-width: 620px;
      }
      .itn-exc-arrow-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        margin-top: 4px;
      }
      .itn-exc-arrow-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1.5px solid #cbd5e1;
        background: #ffffff;
        color: #0f172a;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        padding: 0;
      }
      .itn-exc-arrow-btn:hover {
        border-color: var(--color-primary, #AA8453);
        color: var(--color-primary, #AA8453);
        background: color-mix(in srgb, var(--color-primary, #AA8453) 10%, #ffffff);
        transform: scale(1.08);
      }

      /* Joined Segmented Toggle Bar: [Hotels] & [Transport] with Smooth Glider */
      .itn-exc-toggle-wrap {
        display: flex;
        align-items: center;
        margin-top: 14px;
        margin-bottom: 20px;
        width: 100%;
        max-width: 360px;
      }
      .itn-exc-toggle-bar {
        display: flex;
        align-items: stretch;
        position: relative;
        width: 100%;
        height: 48px;
        border-radius: 9999px;
        background: #ffffff;
        border: 1.5px solid color-mix(in srgb, var(--color-primary, #AA8453) 28%, #cbd5e1);
        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
        overflow: hidden;
        user-select: none;
      }
      /* Sliding Active Indicator Pill (Hardware-accelerated) */
      .itn-exc-toggle-glider {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 50%;
        height: 100%;
        border-radius: 9999px;
        background: var(--color-primary, #AA8453);
        box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary, #AA8453) 38%, transparent);
        transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
        z-index: 1;
        pointer-events: none;
        will-change: transform;
      }
      .itn-exc-toggle-bar.is-hotels-active .itn-exc-toggle-glider {
        transform: translate3d(0%, 0, 0);
      }
      .itn-exc-toggle-bar.is-transport-active .itn-exc-toggle-glider {
        transform: translate3d(100%, 0, 0);
      }

      .itn-exc-toggle-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        flex: 1 1 50%;
        width: 50%;
        height: 100%;
        font-size: 14.5px;
        font-weight: 750;
        cursor: pointer;
        border: none;
        outline: none;
        background: transparent;
        white-space: nowrap;
        position: relative;
        z-index: 2;
        font-family: inherit;
        color: #1e293b;
        transition: color 0.28s ease;
        padding: 0 16px;
      }
      .itn-exc-toggle-btn.active {
        color: #ffffff;
      }
      .itn-exc-toggle-btn svg {
        flex-shrink: 0;
        transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.28s ease;
      }
      .itn-exc-toggle-btn.active svg {
        transform: scale(1.1);
      }
      .itn-exc-toggle-btn:not(.active):hover {
        color: var(--color-primary, #AA8453);
      }

      /* Container with Dynamic Theme Tint */
      .itn-exc-mint-container {
        background: color-mix(in srgb, var(--color-primary, #AA8453) 5%, #fcfbf9);
        border: 1px solid color-mix(in srgb, var(--color-primary, #AA8453) 20%, #e2e8f0);
        border-radius: 20px;
        padding: 20px 18px 22px;
        position: relative;
        overflow: hidden;
      }
      .itn-exc-dest-badge-wrap {
        display: flex;
        justify-content: center;
        margin-bottom: 14px;
      }
      .itn-exc-dest-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        color: var(--color-primary, #AA8453);
        border: 1px solid color-mix(in srgb, var(--color-primary, #AA8453) 30%, #e2e8f0);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1.8px;
        padding: 4px 16px;
        border-radius: 999px;
        text-transform: uppercase;
        box-shadow: 0 1px 4px color-mix(in srgb, var(--color-primary, #AA8453) 10%, transparent);
      }

      /* Slider & Grid */
      .itn-exc-slider-wrapper {
        position: relative;
        width: 100%;
      }
      .itn-exc-grid {
        display: flex;
        gap: 16px;
        overflow-x: auto;
        overflow-y: hidden;
        scroll-snap-type: x mandatory;
        padding: 4px 2px 14px;
        scrollbar-width: thin;
        scrollbar-color: #cbd5e1 transparent;
      }
      .itn-exc-grid::-webkit-scrollbar {
        height: 5px;
      }
      .itn-exc-grid::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }

      /* Cards */
      /* Cards */
      .itn-exc-card {
        flex: 0 0 240px;
        width: 240px;
        scroll-snap-align: start;
        background: #ffffff;
        border-radius: 14px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      }
      .itn-exc-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        border-color: color-mix(in srgb, var(--color-primary, #AA8453) 35%, #cbd5e1);
      }
      .itn-exc-card.is-added {
        border-color: var(--color-primary, #AA8453);
        box-shadow: 0 5px 16px color-mix(in srgb, var(--color-primary, #AA8453) 18%, transparent);
      }

      .itn-exc-card-img-wrap {
        position: relative;
        width: 100%;
        height: 125px;
        background: #f8fafc;
        overflow: hidden;
      }
      .itn-exc-card-img-wrap--vehicle {
        background: #ffffff;
        padding: 6px;
        height: 125px;
      }
      .itn-exc-card-img-wrap--hotel {
        background: #0f172a;
        height: 125px;
      }
      .itn-exc-card-img-badge {
        position: absolute;
        top: 7px;
        left: 7px;
        background: rgba(15, 23, 42, 0.82);
        backdrop-filter: blur(6px);
        color: #ffffff;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.2px;
        padding: 2.5px 7px;
        border-radius: 5px;
        z-index: 2;
      }

      .itn-exc-card-body {
        padding: 11px 13px 13px;
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .itn-exc-date-pill {
        display: inline-block;
        align-self: flex-start;
        background: color-mix(in srgb, var(--color-primary, #AA8453) 10%, #ffffff);
        color: var(--color-primary, #AA8453);
        border: 1px solid color-mix(in srgb, var(--color-primary, #AA8453) 24%, transparent);
        font-size: 10px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 5px;
        margin-bottom: 5px;
        letter-spacing: 0.2px;
      }
      .itn-exc-card-title {
        font-size: 13.5px;
        font-weight: 750;
        color: #0f172a;
        margin: 0 0 2px;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .itn-exc-card-route {
        font-size: 11px;
        color: #64748b;
        margin: 0 0 7px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .itn-exc-meta-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 6px 0;
        border-top: 1px solid #f1f5f9;
        border-bottom: 1px solid #f1f5f9;
        margin-bottom: 8px;
      }
      .itn-exc-meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: #475569;
        font-weight: 500;
      }
      .itn-exc-meta-item svg {
        color: #64748b;
        flex-shrink: 0;
      }
      .itn-exc-meta-dot {
        color: #cbd5e1;
        font-weight: 800;
        margin: 0 2px;
      }
      .itn-exc-refundable {
        color: #16a34a !important;
        font-weight: 600;
      }
      .itn-exc-refundable svg {
        color: #16a34a !important;
      }
      .itn-exc-non-refundable {
        color: #dc2626 !important;
        font-weight: 600;
      }
      .itn-exc-non-refundable svg {
        color: #dc2626 !important;
      }

      .itn-exc-card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: auto;
        padding-top: 2px;
      }
      .itn-exc-price-col {
        display: flex;
        flex-direction: column;
      }
      .itn-exc-price {
        font-size: 15px;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.1;
      }
      .itn-exc-per-night {
        font-size: 10px;
        color: #64748b;
        font-weight: 600;
        margin-top: 1px;
      }

      .itn-exc-actions {
        display: flex;
        align-items: center;
      }
      .itn-exc-btn-add {
        background: #ffffff;
        border: 1.5px solid var(--color-primary, #AA8453);
        color: var(--color-primary, #AA8453);
        font-size: 11.5px;
        font-weight: 750;
        padding: 5px 11px;
        border-radius: 7px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        white-space: nowrap;
      }
      .itn-exc-btn-add:hover {
        background: var(--color-primary, #AA8453);
        color: #ffffff;
        box-shadow: 0 3px 10px color-mix(in srgb, var(--color-primary, #AA8453) 30%, transparent);
      }
      .itn-exc-added-row {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .itn-exc-added-label {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11.5px;
        font-weight: 750;
        color: var(--color-primary, #AA8453);
        background: color-mix(in srgb, var(--color-primary, #AA8453) 12%, #ffffff);
        padding: 5px 9px;
        border-radius: 6px;
        border: 1px solid color-mix(in srgb, var(--color-primary, #AA8453) 35%, transparent);
      }
      .itn-exc-trash-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid #fee2e2;
        background: #fef2f2;
        color: #ef4444;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.18s ease;
        padding: 0;
      }
      .itn-exc-trash-btn:hover {
        background: #dc2626;
        color: #ffffff;
        border-color: #dc2626;
      }

      /* Stay Included / Add On's Section */
      .itn-addons-header {
        margin-bottom: 18px;
      }
      .itn-addons-header-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .itn-addons-arrow-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .itn-addons-arrow-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1.5px solid #cbd5e1;
        background: #ffffff;
        color: #0f172a;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        padding: 0;
      }
      .itn-addons-arrow-btn:hover {
        border-color: var(--color-primary, #0f766e);
        color: var(--color-primary, #0f766e);
        background: color-mix(in srgb, var(--color-primary, #0f766e) 8%, #ffffff);
        transform: scale(1.08);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      .itn-addons-title {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 6px !important;
        font-size: 22px;
        font-weight: 800;
        color: var(--color-text-primary, #0f172a);
        letter-spacing: -0.01em;
      }
      .itn-addons-sparkle {
        font-size: 20px;
        line-height: 1;
        display: inline-block;
      }
      .itn-addons-swipe-hint {
        display: none;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 700;
        color: var(--color-primary, #0f766e);
        letter-spacing: 0.5px;
        text-transform: uppercase;
        background: color-mix(in srgb, var(--color-primary, #0f766e) 10%, transparent);
        padding: 3px 10px;
        border-radius: 999px;
      }
      .itn-addons-slider-wrapper {
        position: relative;
        width: 100%;
        margin-top: 14px;
      }
      .itn-addons-grid {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        scroll-snap-type: x mandatory !important;
        scroll-behavior: smooth !important;
        gap: 18px !important;
        padding: 4px 4px 16px !important;
        margin: 0 !important;
        scrollbar-width: thin;
        scrollbar-color: rgba(15, 118, 110, 0.25) transparent;
        outline: none;
      }
      .itn-addons-grid::-webkit-scrollbar {
        height: 6px;
      }
      .itn-addons-grid::-webkit-scrollbar-track {
        background: transparent;
      }
      .itn-addons-grid::-webkit-scrollbar-thumb {
        background: rgba(15, 118, 110, 0.25);
        border-radius: 999px;
      }
      .itn-addons-grid::-webkit-scrollbar-thumb:hover {
        background: rgba(15, 118, 110, 0.5);
      }
      .itn-addons-side-btn {
        position: absolute;
        top: 48%;
        transform: translateY(-50%);
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 1.5px solid #e2e8f0;
        background: #ffffff;
        color: #0f172a;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        padding: 0;
      }
      .itn-addons-side-btn:hover {
        border-color: var(--color-primary, #0f766e);
        color: var(--color-primary, #0f766e);
        background: #ffffff;
        transform: translateY(-50%) scale(1.08);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
      }
      .itn-addons-side-btn--left {
        left: -16px;
      }
      .itn-addons-side-btn--right {
        right: -16px;
      }
      @media (max-width: 991px) {
        .itn-addons-side-btn {
          display: none !important;
        }
      }
      .itn-addon-card {
        flex: 0 0 310px !important;
        width: 310px !important;
        min-width: 310px !important;
        scroll-snap-align: start !important;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        transition: all 0.25s ease;
      }
      .itn-addon-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }
      .itn-addon-card.is-added {
        border-color: var(--color-primary, #0f766e);
        box-shadow: 0 4px 20px color-mix(in srgb, var(--color-primary, #0f766e) 22%, transparent);
      }
      .itn-addon-img-wrap {
        position: relative;
        width: 100%;
        height: 185px;
        background: #f1f5f9;
        overflow: hidden;
      }
      .itn-addon-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        background: var(--color-primary, #0f766e);
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        padding: 5px 12px;
        border-radius: 6px;
        z-index: 2;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.22);
        letter-spacing: 0.02em;
      }
      .itn-addon-body {
        padding: 16px 18px 18px;
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .itn-addon-tag {
        font-size: 11px;
        font-weight: 800;
        color: var(--color-primary, #0f766e);
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-bottom: 6px;
      }
      .itn-addon-name {
        margin: 0 0 6px;
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.35;
      }
      .itn-addon-meta {
        font-size: 12.5px;
        color: #64748b;
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
      }
      .itn-addon-dot {
        color: #cbd5e1;
      }
      .itn-addon-notes {
        margin: 0 0 12px;
        font-size: 12px;
        color: #64748b;
        line-height: 1.45;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .itn-addon-footer {
        margin-top: auto;
        padding-top: 14px;
        border-top: 1px solid #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .itn-addon-price-col {
        display: flex;
        flex-direction: column;
      }
      .itn-addon-price {
        font-size: 18px;
        font-weight: 800;
        color: #0f172a;
      }
      .itn-addon-per-night {
        font-size: 11px;
        color: #94a3b8;
        font-weight: 500;
      }
      .itn-addon-btn-add {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 7px 15px;
        background: #ffffff;
        border: 1.5px solid var(--color-primary, #0f766e);
        color: var(--color-primary, #0f766e);
        border-radius: 8px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .itn-addon-btn-add:hover {
        background: var(--color-primary, #0f766e);
        border-color: var(--color-primary, #0f766e);
        color: #ffffff;
      }
      .itn-addon-added-row {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .itn-addon-added-label {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        font-weight: 700;
        color: var(--color-primary, #0f766e);
      }
      .itn-addon-trash-btn {
        width: 32px;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .itn-addon-trash-btn:hover {
        background: #fee2e2;
        border-color: #fca5a5;
        color: #dc2626;
      }
      .itn-side-addon-pill {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: color-mix(in srgb, var(--color-primary, #0f766e) 10%, #ffffff);
        border: 1px solid color-mix(in srgb, var(--color-primary, #0f766e) 28%, transparent);
        border-radius: 8px;
        padding: 9px 12px;
        margin-bottom: 14px;
        font-size: 12px;
      }
      .itn-side-addon-pill-left {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .itn-side-addon-badge {
        font-size: 10px;
        font-weight: 800;
        color: var(--color-primary, #0f766e);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .itn-side-addon-name {
        color: var(--color-primary, #0f766e);
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 170px;
      }
      .itn-side-addon-val {
        font-size: 13px;
        font-weight: 800;
        color: var(--color-primary, #0f766e);
      }
      .itn-stay-card {
        display: grid;
        grid-template-columns: 320px 1fr;
        border: 1px solid var(--color-border, #e2e8f0);
        border-radius: 10px;
        overflow: hidden;
        background: #fff;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      }
      .itn-stay-images {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3px;
        background: #f1f5f9;
        min-height: 170px;
      }
      .itn-stay-img-wrap {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 170px;
      }
      .itn-stay-info {
        padding: 22px 24px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 12px;
      }
      .itn-stay-tier {
        margin: 0;
        font-size: 16px;
        font-weight: 800;
        color: var(--color-text-primary, #0f172a);
      }
      .itn-stay-amenities {
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
        color: #334155;
        font-size: 12px;
        font-weight: 600;
      }
      .itn-stay-amenity {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .itn-stay-amenity svg {
        color: var(--color-primary, #0f766e);
      }
      .itn-stay-note {
        margin: 0;
        color: #64748b;
        font-size: 13px;
        line-height: 1.5;
      }

      /* Inclusions & Exclusions Section */
      .itn-inc-exc-header {
        margin-bottom: 20px;
      }
      .itn-inc-exc-subtitle {
        margin: 0;
        font-size: 13.5px;
        color: #64748b;
      }
      .itn-inc-exc-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        align-items: stretch;
      }
      .itn-inc-card,
      .itn-exclusions-card {
        border-radius: 16px;
        padding: 22px 24px;
        display: flex;
        flex-direction: column;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .itn-inc-card {
        background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
        border: 1px solid #bbf7d0;
        box-shadow: 0 4px 18px rgba(22, 101, 52, 0.04);
      }
      .itn-inc-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(22, 101, 52, 0.08);
      }
      .itn-exclusions-card {
        background: linear-gradient(180deg, #fff1f2 0%, #ffffff 100%);
        border: 1px solid #fecdd3;
        box-shadow: 0 4px 18px rgba(225, 29, 72, 0.04);
      }
      .itn-exclusions-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(225, 29, 72, 0.08);
      }
      .itn-inc-card-head,
      .itn-exclusions-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 16px;
        margin-bottom: 16px;
        border-bottom: 1px dashed;
      }
      .itn-inc-card-head {
        border-bottom-color: #bbf7d0;
      }
      .itn-exclusions-card-head {
        border-bottom-color: #fecdd3;
      }
      .itn-inc-head-badge,
      .itn-exc-head-badge {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .itn-inc-head-badge h3 {
        margin: 0;
        font-size: 16.5px;
        font-weight: 700;
        color: #14532d;
      }
      .itn-exc-head-badge h3 {
        margin: 0;
        font-size: 16.5px;
        font-weight: 700;
        color: #881337;
      }
      .itn-inc-head-icon {
        width: 32px;
        height: 32px;
        border-radius: 9px;
        background: #dcfce7;
        color: #15803d;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .itn-exc-head-icon {
        width: 32px;
        height: 32px;
        border-radius: 9px;
        background: #ffe4e6;
        color: #e11d48;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .itn-inc-count-pill {
        font-size: 12px;
        font-weight: 600;
        background: #dcfce7;
        color: #15803d;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid #bbf7d0;
      }
      .itn-exc-count-pill {
        font-size: 12px;
        font-weight: 600;
        background: #ffe4e6;
        color: #e11d48;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid #fecdd3;
      }
      .itn-inc-list,
      .itn-exc-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex-grow: 1;
      }
      .itn-inc-item,
      .itn-exc-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 13.5px;
        line-height: 1.5;
      }
      .itn-inc-bullet {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #dcfce7;
        color: #16a34a;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .itn-exc-bullet {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #ffe4e6;
        color: #e11d48;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .itn-inc-text {
        color: #1e293b;
        font-weight: 500;
      }
      .itn-exc-text {
        color: #475569;
        font-weight: 500;
      }
      .itn-inc-empty,
      .itn-exc-empty {
        font-size: 13px;
        color: #94a3b8;
        font-style: italic;
        padding: 12px 0;
      }

      /* Cancellation Policy Card on Package Page */
      #itinerary-cancellation-policy {
        margin-top: 10px;
        margin-bottom: 44px;
      }
      .itn-cancellation-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 24px 28px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
        transition: all 0.25s ease;
      }
      .itn-cancellation-card:hover {
        border-color: color-mix(in srgb, var(--color-primary, #AA8453) 35%, #e2e8f0);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
      }
      .itn-cancellation-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f1f5f9;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }
      .itn-cancellation-head-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .itn-cancellation-icon-badge {
        width: 42px;
        height: 42px;
        border-radius: 11px;
        background: color-mix(in srgb, var(--color-primary, #AA8453) 14%, transparent);
        color: var(--color-primary, #AA8453);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .itn-cancellation-subtitle {
        display: block;
        font-size: 13px;
        color: #64748b;
        margin-top: 2px;
      }
      .itn-cancellation-updated-pill {
        font-size: 11.5px;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: 999px;
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #e2e8f0;
        white-space: nowrap;
      }
      .itn-cancellation-three-lines {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14.5px;
        line-height: 1.65;
        color: #475569;
        margin: 0 0 18px;
      }
      .itn-cancellation-readmore-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: transparent;
        border: 1.5px solid var(--color-primary, #AA8453);
        color: var(--color-primary, #AA8453);
        padding: 8px 20px;
        border-radius: 999px;
        font-size: 13.5px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary, #AA8453) 12%, transparent);
      }
      .itn-cancellation-readmore-btn:hover {
        background: var(--color-primary, #AA8453);
        color: #ffffff;
        transform: translateY(-1px);
        box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary, #AA8453) 28%, transparent);
      }
      .itn-cancellation-readmore-btn:active {
        transform: translateY(0);
      }
      @media (max-width: 640px) {
        .itn-cancellation-card {
          padding: 18px 18px;
        }
        .itn-cancellation-card-head {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        .itn-cancellation-readmore-btn {
          width: 100%;
          justify-content: center;
        }
      }

      /* Blogs & Articles Section (Dynamic Itinerary Content Block) */
      #itinerary-blogs-articles {
        margin-top: 10px;
        margin-bottom: 48px;
      }
      .itn-blogs-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 22px;
        flex-wrap: wrap;
      }
      .itn-blogs-subtitle {
        margin: 0;
        font-size: 14px;
        color: #64748b;
        line-height: 1.5;
      }
      .itn-blogs-view-all-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13.5px;
        font-weight: 700;
        color: var(--color-primary, #0f766e);
        text-decoration: none;
        transition: all 0.2s ease;
        padding: 6px 14px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--color-primary, #0f766e) 8%, transparent);
      }
      .itn-blogs-view-all-link:hover {
        background: color-mix(in srgb, var(--color-primary, #0f766e) 15%, transparent);
        transform: translateX(2px);
      }
      .itn-blogs-header-actions {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .itn-blogs-header-arrows {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .itn-blogs-arrow-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1.5px solid #e2e8f0;
        background: #ffffff;
        color: #0f172a;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05);
      }
      .itn-blogs-arrow-btn:hover {
        border-color: var(--color-primary, #0f766e);
        color: var(--color-primary, #0f766e);
        background: color-mix(in srgb, var(--color-primary, #0f766e) 8%, #ffffff);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
      }
      .itn-blogs-arrow-btn:active {
        transform: translateY(0);
      }
      .itn-blogs-carousel-wrapper {
        position: relative;
        width: 100%;
      }
      .itn-blogs-row,
      .itn-blogs-grid {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        gap: 20px;
        overflow-x: auto;
        overflow-y: hidden;
        scroll-snap-type: x proximity;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        -ms-overflow-style: none;
        padding: 6px 4px 18px;
        align-items: stretch;
        outline: none;
        width: 100%;
        box-sizing: border-box;
      }
      .itn-blogs-row::-webkit-scrollbar,
      .itn-blogs-grid::-webkit-scrollbar {
        display: none;
      }
      .itn-blog-card {
        flex: 0 0 310px;
        width: 310px;
        min-width: 310px;
        max-width: 340px;
        scroll-snap-align: start;
        display: flex;
        flex-direction: column;
        background: #ffffff;
        border-radius: 14px;
        border: 1px solid #e2e8f0;
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
        box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
      }
      .itn-blog-card:hover {
        transform: translateY(-4px);
        border-color: #cbd5e1;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.09);
      }
      .itn-blog-img-wrap {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 10;
        overflow: hidden;
        background: #f1f5f9;
      }
      .itn-blog-img {
        object-fit: cover;
        transition: transform 0.4s ease;
      }
      .itn-blog-card:hover .itn-blog-img {
        transform: scale(1.05);
      }
      .itn-blog-category-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.3px;
        text-transform: uppercase;
        color: #ffffff;
        background: rgba(15, 23, 42, 0.78);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        border-radius: 999px;
        z-index: 2;
      }
      .itn-blog-card-body {
        padding: 16px 18px 18px;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      .itn-blog-meta-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #94a3b8;
        margin-bottom: 8px;
      }
      .itn-blog-dot {
        opacity: 0.5;
      }
      .itn-blog-card-title {
        margin: 0 0 8px;
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        transition: color 0.2s ease;
      }
      .itn-blog-card:hover .itn-blog-card-title {
        color: var(--color-primary, #0f766e);
      }
      .itn-blog-card-excerpt {
        margin: 0 0 14px;
        font-size: 13px;
        color: #64748b;
        line-height: 1.55;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .itn-blog-card-footer {
        margin-top: auto;
        padding-top: 12px;
        border-top: 1px solid #f1f5f9;
      }
      .itn-blog-read-more {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 13px;
        font-weight: 700;
        color: var(--color-primary, #0f766e);
        transition: gap 0.2s ease;
      }
      .itn-blog-card:hover .itn-blog-read-more {
        gap: 8px;
      }
      .itn-blogs-side-btn {
        position: absolute;
        top: 48%;
        transform: translateY(-50%);
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 1.5px solid #e2e8f0;
        background: #ffffff;
        color: #0f172a;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        padding: 0;
      }
      .itn-blogs-side-btn:hover {
        border-color: var(--color-primary, #0f766e);
        color: var(--color-primary, #0f766e);
        background: #ffffff;
        transform: translateY(-50%) scale(1.08);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
      }
      .itn-blogs-side-btn--left {
        left: -16px;
      }
      .itn-blogs-side-btn--right {
        right: -16px;
      }
      @media (max-width: 991px) {
        .itn-blogs-side-btn {
          display: none !important;
        }
      }
      @media (max-width: 640px) {
        .itn-blogs-row .itn-blog-card,
        .itn-blogs-grid .itn-blog-card {
          flex: 0 0 280px;
          width: 280px;
          min-width: 280px;
          max-width: 85vw;
        }
        .itn-blogs-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .itn-blogs-header-actions {
          width: 100%;
          justify-content: space-between;
        }
      }

      /* Floating Pill Sticky Navigation Bar (Shifted to Top for Desktop & Mobile) */
      .itn-floating-pill-nav {
        position: fixed;
        top: 80px;
        bottom: auto;
        left: 50%;
        transform: translateX(-50%) translateY(-25px);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        z-index: 999;
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 7px 10px 7px 18px;
        background: rgba(26, 32, 44, 0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 9999px;
        box-shadow: 0 10px 32px rgba(0, 0, 0, 0.35), 0 2px 10px rgba(0, 0, 0, 0.2);
        max-width: min(96vw, 1220px);
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, visibility 0.3s ease;
      }
      .itn-floating-pill-nav.is-visible {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }
      .itn-floating-nav-items {
        display: flex;
        align-items: center;
        gap: 4px;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
        scrollbar-width: none;
        -ms-overflow-style: none;
        padding: 2px 0;
        flex: 1 1 auto;
        min-width: 0;
        touch-action: pan-x;
        cursor: grab;
      }
      .itn-floating-nav-items:active {
        cursor: grabbing;
      }
      .itn-floating-nav-items::-webkit-scrollbar {
        display: none;
      }
      .itn-floating-nav-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        border-radius: 999px;
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.68);
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
        user-select: none;
        -webkit-user-select: none;
        transition: color 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                    background-color 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                    box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                    transform 0.18s ease;
        text-decoration: none;
        position: relative;
        will-change: transform, background-color, color;
      }
      .itn-floating-nav-btn:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.09);
      }
      .itn-floating-nav-btn:active {
        transform: scale(0.96);
      }
      .itn-floating-nav-btn.is-active {
        color: #ffffff !important;
        font-weight: 700;
        background: color-mix(in srgb, var(--color-primary, #0f766e) 28%, rgba(255, 255, 255, 0.1)) !important;
        box-shadow: inset 0 -2.5px 0 var(--color-primary, #0f766e), 0 2px 12px color-mix(in srgb, var(--color-primary, #0f766e) 30%, transparent) !important;
      }
      .itn-floating-nav-btn.is-active .itn-floating-nav-icon {
        color: var(--color-primary, #0f766e);
        transform: scale(1.08);
      }
      .itn-floating-nav-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.55);
        transition: color 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .itn-floating-divider {
        width: 1px;
        height: 32px;
        background: rgba(255, 255, 255, 0.16);
        flex-shrink: 0;
      }
      .itn-floating-right {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-shrink: 0;
      }
      .itn-floating-price-box {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        line-height: 1.2;
      }
      .itn-floating-price-row {
        color: #ffffff;
        font-size: 15.5px;
        font-weight: 800;
        letter-spacing: -0.01em;
        white-space: nowrap;
      }
      .itn-floating-price-row span {
        font-size: 12px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.7);
      }
      .itn-floating-price-sub {
        font-size: 10.5px;
        color: rgba(255, 255, 255, 0.55);
        white-space: nowrap;
        margin-top: 1px;
      }
      .itn-floating-cta-btn {
        background: var(--color-primary, #0f766e);
        color: #ffffff;
        font-size: 13.5px;
        font-weight: 800;
        padding: 10px 22px;
        border-radius: 9999px;
        border: none;
        cursor: pointer;
        white-space: nowrap;
        box-shadow: 0 4px 18px color-mix(in srgb, var(--color-primary, #0f766e) 45%, transparent);
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        letter-spacing: 0.01em;
      }
      .itn-floating-cta-btn:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
        box-shadow: 0 6px 22px color-mix(in srgb, var(--color-primary, #0f766e) 55%, transparent);
      }
      .itn-floating-cta-btn:active {
        transform: translateY(0);
      }
      .itn-floating-cta-btn.is-active {
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.85), 0 6px 22px color-mix(in srgb, var(--color-primary, #0f766e) 65%, transparent);
        filter: brightness(1.15);
      }

      /* Desktop screens: Hide price & 'Create Your Itinerary' CTA in floating navbar */
      @media (min-width: 769px) {
        .itn-floating-divider {
          display: none !important;
        }
        .itn-floating-right {
          display: none !important;
        }
        .itn-floating-pill-nav {
          padding: 6px 12px;
          gap: 6px;
          max-width: fit-content;
        }
        .itn-floating-nav-items {
          justify-content: center;
          flex: 0 1 auto;
        }
      }

      @media (max-width: 1024px) {
        .itn-floating-pill-nav {
          top: 76px;
          bottom: auto;
          padding: 6px 8px 6px 12px;
          gap: 10px;
        }
        .itn-floating-nav-btn {
          padding: 7px 11px;
          font-size: 12.5px;
          gap: 5px;
        }
        .itn-floating-cta-btn {
          padding: 9px 18px;
          font-size: 12.5px;
        }
      }

      @media (max-width: 768px) {
        .itn-mobile-sticky-bar {
          display: none !important;
        }
        #itn-pill-itinerary-create-itinerary {
          display: none !important;
        }
        .itn-floating-pill-nav {
          top: 74px;
          bottom: auto;
          left: 8px;
          right: 8px;
          transform: translateY(-25px);
          max-width: none;
          width: calc(100% - 16px);
          border-radius: 9999px;
          padding: 6px 8px 6px 12px;
          gap: 8px;
          justify-content: space-between;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        .itn-floating-pill-nav.is-visible {
          transform: translateY(0);
        }
        .itn-floating-nav-items {
          flex: 1 1 auto;
          min-width: 0;
          gap: 4px;
          padding: 2px 2px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          touch-action: pan-x;
        }
        .itn-floating-nav-btn {
          padding: 7px 11px;
          font-size: 12px;
          gap: 5px;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .itn-floating-nav-icon svg {
          width: 14px;
          height: 14px;
        }
        .itn-floating-divider {
          height: 22px;
          margin: 0 1px;
          flex-shrink: 0;
          opacity: 0.45;
        }
        .itn-floating-right {
          flex-shrink: 0;
          gap: 8px;
        }
        .itn-floating-price-sub {
          display: none;
        }
        .itn-floating-price-row {
          font-size: 13px;
        }
        .itn-floating-cta-btn {
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          flex-shrink: 0;
          border-radius: 9999px;
        }
      }
      @media (max-width: 480px) {
        .itn-floating-pill-nav {
          top: 74px;
          bottom: auto;
          left: 6px;
          right: 6px;
          width: calc(100% - 12px);
          padding: 5px 6px 5px 10px;
          gap: 6px;
        }
        .itn-floating-price-box {
          display: none;
        }
        .itn-floating-divider {
          display: none;
        }
        .itn-floating-nav-items {
          gap: 3px;
        }
        .itn-floating-nav-btn {
          padding: 6px 10px;
          font-size: 11.5px;
          gap: 4px;
        }
        .itn-floating-cta-btn {
          padding: 7px 12px;
          font-size: 11.5px;
        }
      }

      /* Similar Packages: Matches Hot Deals Section Card Style Exactly */
      .itn-similar-deals-section {
        position: relative;
        margin-bottom: 60px;
        padding-left: 0;
        padding-right: 0;
      }
      .itn-deals-cards-wrap {
        display: flex;
        gap: 24px;
        overflow-x: auto;
        padding: 8px 4px 24px;
        scrollbar-width: none;
        -ms-overflow-style: none;
        transition: opacity 0.18s ease;
        scroll-snap-type: x proximity;
        align-items: stretch;
        width: 100%;
        box-sizing: border-box;
      }
      .itn-deals-cards-wrap::-webkit-scrollbar {
        display: none;
      }
      .itn-deals-card,
      .itn-similar-deals-section .recent-booking-card {
        flex-shrink: 0;
        width: 300px;
        overflow: hidden;
        border: 1px solid var(--color-bg-soft, #f1f5f9);
        border-radius: 8px;
        background: var(--color-card, #ffffff);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        scroll-snap-align: start;
        display: flex;
        flex-direction: column;
        align-self: stretch;
        height: auto;
      }
      .itn-deals-card:hover,
      .itn-similar-deals-section .recent-booking-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 35px rgba(255, 96, 0, 0.25), 0 4px 15px rgba(255, 96, 0, 0.15);
        border-color: var(--color-secondary, #FF6000);
      }
      .itn-deals-scroll-btn {
        position: absolute;
        top: 38%;
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 1.5px solid var(--color-border, #E5E5E5);
        background: var(--color-card, #ffffff);
        color: var(--color-text-primary, #0f172a);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
      }
      .itn-deals-scroll-btn:hover {
        border-color: var(--color-primary, #AA8453);
        color: var(--color-primary, #AA8453);
        transform: translateY(-50%) translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      .th-scroll-btn-pos--left { left: -20px; }
      .th-scroll-btn-pos--right { right: -20px; }
      @media (max-width: 991px) {
        .th-scroll-btn-pos--left { left: 4px; }
        .th-scroll-btn-pos--right { right: 4px; }
      }
      @media (max-width: 768px) {
        .itn-deals-card,
        .itn-similar-deals-section .recent-booking-card {
          width: calc((100vw - 40px) / 0.85);
          zoom: 0.85;
        }
      }
      @media (max-width: 480px) {
        .itn-deals-card,
        .itn-similar-deals-section .recent-booking-card {
          width: calc((100vw - 32px) / 0.85);
        }
      }

      /* What Our Travelers Say Section */
      .itn-reviews-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 16px;
      }
      .itn-review-card {
        border: 1px solid var(--color-border, #e2e8f0);
        border-radius: 12px;
        padding: 18px;
        background: #fff;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      }
      .itn-review-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
        border-color: var(--color-primary, #0f766e);
      }
      .itn-review-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .itn-review-user-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .itn-review-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--color-primary, #0f766e) 15%, #f1f5f9);
        color: var(--color-primary, #0f766e);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 14px;
        overflow: hidden;
        flex-shrink: 0;
      }
      .itn-review-name {
        font-size: 13px;
        font-weight: 700;
        color: var(--color-text-primary, #0f172a);
      }
      .itn-review-rating {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 12px;
        font-weight: 700;
        color: #f59e0b;
      }
      .itn-review-comment {
        margin: 0 0 12px;
        color: #475569;
        font-size: 12px;
        line-height: 1.55;
        flex-grow: 1;
      }
      .itn-review-date {
        font-size: 11px;
        color: #94a3b8;
        font-weight: 500;
      }

      /* Full-Width Centered Sections (Outside 2-Column Layout) */
      .itn-full-sections {
        margin-top: 56px;
        width: 100%;
      }
      .itn-full-block {
        margin-bottom: 60px;
      }
      .itn-full-block .itn-block-title {
        margin: 0 0 24px;
        font-size: 24px;
        font-weight: 800;
        color: var(--color-text-primary, #0f172a);
        letter-spacing: -0.01em;
      }

      .itn-reviews-grid-full {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 22px;
        margin-bottom: 20px;
      }
      .itn-reviews-grid-full .itn-review-card {
        padding: 22px;
        border-radius: 12px;
      }
      .itn-reviews-grid-full .itn-review-comment {
        font-size: 13px;
        line-height: 1.6;
      }
      @media (max-width: 991px) {
        .itn-similar-grid-full {
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .itn-reviews-grid-full {
          grid-template-columns: 1fr;
          gap: 16px;
        }
      }
      @media (max-width: 600px) {
        .itn-similar-grid-full {
          grid-template-columns: 1fr;
        }
      }

      /* Sidebar Cards */
      .itn-sidebar {
        position: sticky;
        top: max(130px, calc((100vh + 120px - 520px) / 2));
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 24px;
      }
      .itn-sidebar-card {
        border: 1px solid var(--color-border, #e2e8f0);
        border-radius: 10px;
        padding: 20px;
        background: #fff;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      }
      .itn-sidebar-title {
        margin: 0 0 14px;
        font-size: 15px;
        font-weight: 800;
        color: var(--color-text-primary, #0f172a);
      }

      /* Price Card */
      .itn-side-price-row {
        display: flex;
        align-items: baseline;
        gap: 6px;
        margin-bottom: 2px;
      }
      .itn-side-price-row strong {
        font-size: 26px;
        font-weight: 800;
        color: var(--color-primary, #0f766e);
        line-height: 1.1;
      }
      .itn-side-price-row span {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
      }
      .itn-side-guarantee {
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        margin-bottom: 14px;
      }
      .itn-side-travellers-wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin-bottom: 10px;
        background: #f8fafc;
      }
      .itn-side-label {
        font-size: 12px;
        font-weight: 700;
        color: #334155;
      }
      .itn-side-stepper {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .itn-side-stepper button {
        width: 28px;
        height: 28px;
        border: 1px solid #cbd5e1;
        background: #fff;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 700;
        color: var(--color-primary, #0f766e);
        cursor: pointer;
      }
      .itn-side-stepper input {
        width: 36px;
        height: 28px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        text-align: center;
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
      }
      .itn-side-partial-choice {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 12px;
      }
      .itn-side-partial-choice label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        font-weight: 600;
        color: #334155;
        padding: 6px 8px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        cursor: pointer;
      }
      .itn-side-partial-choice label.is-selected {
        border-color: var(--color-primary, #0f766e);
        background: color-mix(in srgb, var(--color-primary, #0f766e) 6%, #fff);
      }
      .itn-side-book-btn {
        width: 100%;
        height: 44px;
        border-radius: 8px;
        background: var(--color-primary, #0f766e);
        color: #fff;
        font-size: 15px;
        font-weight: 800;
        border: none;
        cursor: pointer;
        transition: transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease;
        box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary, #0f766e) 32%, transparent);
      }
      .itn-side-book-btn:hover {
        filter: brightness(1.08);
        transform: translateY(-1px);
        box-shadow: 0 8px 20px color-mix(in srgb, var(--color-primary, #0f766e) 40%, transparent);
      }
      .itn-side-inclusions-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 16px;
        border-top: 1px solid #f1f5f9;
        padding-top: 14px;
      }
      .itn-side-inc-item {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #475569;
        font-size: 13px;
        font-weight: 600;
      }
      .itn-side-inc-item svg {
        color: var(--color-primary, #0f766e);
        flex-shrink: 0;
      }

      /* Highlights Card */
      .itn-tour-highlights-card {
        background: #ffffff;
        border-radius: 12px;
        padding: 24px 28px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        margin-bottom: 32px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }
      .itn-tour-highlights-head {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
      }
      .itn-tour-highlights-title {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        color: #1f2937;
        letter-spacing: -0.01em;
      }
      .itn-tour-highlights-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 0;
        margin: 0;
        list-style: none;
        width: 100%;
      }
      .itn-tour-highlight-item {
        display: grid;
        grid-template-columns: 18px minmax(0, 1fr);
        align-items: flex-start;
        gap: 12px;
        font-size: 15px;
        line-height: 1.55;
        color: #374151;
        font-weight: 500;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        box-sizing: border-box;
      }
      .itn-tour-highlight-item span {
        display: block;
        min-width: 0;
        width: 100%;
        white-space: normal;
        word-break: break-word;
        overflow-wrap: break-word;
      }
      .itn-tour-highlight-bullseye {
        flex-shrink: 0;
        margin-top: 3px;
      }
      .itn-highlights-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .itn-highlight-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        color: #334155;
        font-size: 13px;
        font-weight: 600;
        line-height: 1.4;
      }
      .itn-check-icon {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--color-primary, #0f766e) 14%, transparent);
        color: var(--color-primary, #0f766e);
        display: grid;
        place-items: center;
        flex-shrink: 0;
        margin-top: 1px;
      }

      /* Need Help Card */
      .itn-help-text {
        margin: 0 0 14px;
        color: #64748b;
        font-size: 12px;
        line-height: 1.5;
      }
      .itn-help-link {
        display: flex;
        align-items: center;
        gap: 9px;
        color: var(--color-primary, #0f766e);
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
        margin-bottom: 10px;
        transition: opacity 0.15s ease;
      }
      .itn-help-link:hover {
        opacity: 0.8;
      }
      .itn-whatsapp-quick-btn {
        width: 100%;
        margin-top: 6px;
        padding: 9px 12px;
        border-radius: 8px;
        background: #25d366;
        color: #fff;
        font-size: 13px;
        font-weight: 800;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: transform 0.15s ease, filter 0.15s ease;
      }
      .itn-whatsapp-quick-btn:hover {
        filter: brightness(1.06);
        transform: translateY(-1px);
      }

      /* Modals: Media & Booking */
      .itn-media-modal {
        position: fixed;
        inset: 0;
        z-index: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(8, 14, 25, .82);
        backdrop-filter: blur(8px);
      }
      .itn-media-panel {
        width: min(94vw, 1200px);
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        border-radius: 16px;
        background: #fff;
        box-shadow: 0 25px 60px rgba(0,0,0,0.35);
        overflow: hidden;
      }
      .itn-media-head {
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 20px 28px;
        background: #fff;
        border-bottom: 1px solid #e2e8f0;
      }
      .itn-media-head-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .itn-media-head h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 800;
        color: #0f172a;
      }
      .itn-media-count-badge {
        padding: 3px 10px;
        background: #f1f5f9;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 700;
        color: #475569;
      }
      .itn-media-close-btn {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #f1f5f9;
        color: #0f172a;
        font-size: 16px;
        font-weight: 700;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      .itn-media-close-btn:hover {
        background: #e2e8f0;
        transform: scale(1.05);
      }
      .itn-media-body {
        overflow-y: auto;
        padding: 24px 28px;
        flex: 1;
      }
      .itn-media-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 18px;
      }
      .itn-media-item {
        position: relative;
        overflow: hidden;
        border-radius: 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        transition: transform 0.25s ease, box-shadow 0.25s ease;
      }
      .itn-media-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(0,0,0,0.1);
      }
      .itn-media-img-wrap {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 10;
        overflow: hidden;
      }
      .itn-media-item img, .itn-media-item video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.35s ease;
      }
      .itn-media-item:hover img {
        transform: scale(1.04);
      }
      .itn-media-caption {
        padding: 8px 12px;
        background: #ffffff;
        font-size: 12.5px;
        font-weight: 600;
        color: #334155;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        border-top: 1px solid #f1f5f9;
      }
      @media (max-width: 900px) {
        .itn-media-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .itn-media-panel { width: 95vw; }
        .itn-media-head, .itn-media-body { padding: 16px 20px; }
      }
      @media (max-width: 540px) {
        .itn-media-grid { grid-template-columns: 1fr; gap: 12px; }
      }

      .itn-booking-modal {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px 16px;
        overflow-y: auto;
        overflow-x: hidden;
        background: rgba(5, 12, 26, .78);
        backdrop-filter: blur(10px);
        overscroll-behavior: contain;
        touch-action: pan-y;
        -webkit-overflow-scrolling: touch;
      }
      .itn-booking-panel {
        position: relative;
        width: min(100%, 780px);
        max-height: min(92vh, 92dvh);
        overflow-y: auto;
        overflow-x: hidden;
        margin: auto;
        border: 1px solid rgba(255,255,255,.42);
        border-radius: 14px;
        background: #fff;
        box-shadow: 0 28px 80px rgba(2, 8, 23, .4);
        overscroll-behavior: contain;
        touch-action: pan-y;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
        scrollbar-color: #94a3b8 #f1f5f9;
      }
      .itn-booking-panel::-webkit-scrollbar {
        width: 8px;
      }
      .itn-booking-panel::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 8px;
      }
      .itn-booking-panel::-webkit-scrollbar-thumb {
        background: #94a3b8;
        border-radius: 8px;
      }
      .itn-booking-panel::-webkit-scrollbar-thumb:hover {
        background: var(--color-primary, #0f766e);
      }
      .itn-booking-close {
        position: absolute;
        top: 14px;
        right: 14px;
        z-index: 10;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255,255,255,.2);
        color: #fff;
        font-size: 18px;
        font-weight: 900;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s, transform 0.2s;
      }
      .itn-booking-close:hover {
        background: rgba(255,255,255,.38);
        transform: scale(1.08);
      }
      .itn-booking-hero {
        position: relative;
        overflow: hidden;
        padding: 26px 28px 30px;
        background: linear-gradient(135deg, #07142a 0%, var(--color-primary, #0f766e) 76%);
        color: #fff;
      }
      .itn-booking-hero span { color: #bfdbfe; font-size: 11px; font-weight: 900; letter-spacing: .9px; text-transform: uppercase; }
      .itn-booking-hero h2 { margin: 8px 0 6px; color: #fff; font-size: clamp(22px, 3.5vw, 30px); font-weight: 900; }
      .itn-booking-hero p { margin: 0; color: rgba(255,255,255,.82); font-size: 13px; font-weight: 600; }
      .itn-booking-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 18px 20px 0; }
      .itn-booking-summary > div { padding: 14px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
      .itn-booking-summary span { display: block; margin-bottom: 4px; color: var(--color-primary, #0f766e); font-size: 10px; font-weight: 900; letter-spacing: .55px; text-transform: uppercase; }
      .itn-booking-summary strong { display: block; color: #0f172a; font-size: 20px; font-weight: 900; }
      .itn-booking-summary p { grid-column: 1 / -1; margin: 0; color: #64748b; font-size: 12px; font-weight: 600; line-height: 1.5; }
      .itn-booking-payment-choice { margin: 16px 20px 0; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }
      .itn-payment-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .itn-payment-options label { position: relative; display: grid; grid-template-columns: 18px 1fr auto; align-items: center; gap: 8px 10px; padding: 11px 12px; border: 1px solid #d6e4f0; border-radius: 8px; background: #fff; cursor: pointer; }
      .itn-payment-options label.is-selected { border-color: var(--color-primary, #0f766e); background: #f0fdf4; }
      .itn-payment-options input { accent-color: var(--color-primary, #0f766e); }
      .itn-payment-options span { color: #334155; font-size: 12px; font-weight: 800; }
      .itn-payment-options strong { color: var(--color-primary, #0f766e); font-size: 14px; font-weight: 900; text-align: right; }
      .itn-payment-options small { grid-column: 2 / -1; color: #64748b; font-size: 11px; font-weight: 700; }
      .itn-booking-section-title { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
      .itn-booking-section-title span { color: var(--color-primary, #0f766e); font-size: 11px; font-weight: 900; letter-spacing: .75px; text-transform: uppercase; }
      .itn-booking-section-title strong { color: #0f172a; font-size: 13px; font-weight: 900; }
      .itn-booking-travellers { margin: 16px 20px 0; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
      .itn-traveller-count-row { display: grid; grid-template-columns: minmax(0, 1fr) 168px; align-items: center; gap: 14px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }
      .itn-traveller-count-row span { display: block; color: var(--color-primary, #0f766e); font-size: 10px; font-weight: 900; letter-spacing: .55px; text-transform: uppercase; }
      .itn-traveller-count-row strong { display: block; margin-top: 4px; color: #0f172a; font-size: 18px; font-weight: 900; }
      .itn-traveller-count-row small { display: block; margin-top: 4px; color: #64748b; font-size: 12px; font-weight: 700; }
      .itn-traveller-stepper { display: grid; grid-template-columns: 42px 1fr 42px; gap: 8px; }
      .itn-traveller-stepper button { width: 42px; height: 42px; border: 1px solid #c9dbea; border-radius: 8px; background: #fff; color: var(--color-primary, #0f766e); font-size: 20px; font-weight: 900; cursor: pointer; }
      .itn-traveller-stepper input { width: 100%; height: 42px; border: 1px solid #c9dbea; border-radius: 8px; color: #0f172a; font-size: 15px; font-weight: 900; text-align: center; outline: none; }
      .itn-guest-list { display: grid; gap: 10px; margin-top: 12px; }
      .itn-guest-card { display: grid; grid-template-columns: 1fr 86px 1fr 1fr; gap: 10px; align-items: end; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }
      .itn-guest-card > strong { grid-column: 1 / -1; margin-bottom: -2px; font-size: 11px; color: var(--color-primary, #0f766e); text-transform: uppercase; }
      .itn-guest-card label { display: grid; gap: 6px; color: #334155; font-size: 11px; font-weight: 800; letter-spacing: .35px; text-transform: uppercase; }
      .itn-guest-card input { width: 100%; height: 40px; border: 1px solid #d8e2ee; border-radius: 8px; padding: 0 12px; color: #0f172a; font-size: 13px; font-weight: 700; outline: none; }
      .itn-booking-breakdown { display: grid; gap: 0; margin: 16px 20px 0; overflow: hidden; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }
      .itn-booking-breakdown div { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 11px 14px; border-bottom: 1px solid #f1f5f9; }
      .itn-booking-breakdown div:last-child { border-bottom: 0; background: #f8fafc; font-weight: 800; }
      .itn-booking-breakdown span { color: #64748b; font-size: 12px; font-weight: 700; }
      .itn-booking-breakdown strong { color: #0f172a; font-size: 13px; font-weight: 800; text-align: right; }
      .itn-booking-form { display: grid; gap: 12px; padding: 18px 20px 0; }
      .itn-booking-form label { display: grid; gap: 6px; color: #334155; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .45px; }
      .itn-booking-form input, .itn-booking-form textarea { width: 100%; border: 1px solid #d8e2ee; border-radius: 8px; color: #0f172a; font-size: 14px; font-weight: 600; outline: none; }
      .itn-booking-form input { height: 44px; padding: 0 14px; }
      .itn-booking-form textarea { min-height: 80px; resize: vertical; padding: 10px 14px; line-height: 1.45; text-transform: none; }
      .itn-coupon-field { display: grid; gap: 8px; }
      .itn-coupon-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; }
      .itn-coupon-row input { text-transform: uppercase; }
      .itn-coupon-row button { height: 44px; min-width: 82px; padding: 0 14px; border: 1px solid var(--color-primary, #0f766e); border-radius: 8px; background: var(--color-primary, #0f766e); color: #fff; font-size: 12px; font-weight: 800; text-transform: uppercase; cursor: pointer; }
      .itn-coupon-row button:disabled { border-color: #d8e2ee; background: #eef4f9; color: #94a3b8; cursor: not-allowed; }
      .itn-coupon-note { color: #0f8a4b; font-size: 12px; font-weight: 800; }
      .itn-coupon-error { color: #b91c1c; font-size: 12px; font-weight: 800; }
      .itn-booking-error, .itn-booking-message { margin: 14px 20px 0; padding: 12px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; line-height: 1.45; }
      .itn-booking-error { border: 1px solid #fecaca; background: #fff1f2; color: #b91c1c; }
      .itn-booking-message { border: 1px solid #bbf7d0; background: #f0fdf4; color: #15803d; }
      .itn-booking-result { margin: 14px 20px 0; padding: 16px; border: 1px solid #bfe7d9; border-radius: 8px; background: #f8fffb; }
      .itn-booking-result-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid #d8f3e7; }
      .itn-booking-result-head span, .itn-booking-result-grid span { display: block; color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; }
      .itn-booking-result-head strong { color: #14532d; font-size: 15px; font-weight: 900; }
      .itn-booking-result-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; padding-top: 12px; }
      .itn-booking-result-grid strong { display: block; margin-top: 3px; color: #0f172a; font-size: 13px; font-weight: 800; }
      .itn-booking-actions { display: grid; grid-template-columns: 120px 1fr; gap: 12px; padding: 20px; }
      .itn-booking-actions button, .itn-booking-actions a { height: 46px; border-radius: 8px; font-size: 14px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; border: none; cursor: pointer; }
      .itn-booking-actions button:first-child { border: 1px solid #d8e2ee; background: #fff; color: #475569; }
      .itn-booking-actions button:last-child, .itn-booking-actions a { background: var(--color-primary, #0f766e); color: #fff; }
      .itn-booking-actions button:disabled { cursor: not-allowed; opacity: .64; }

      .itn-booking-recovery-card { margin: 14px 20px 0; padding: 16px; border: 1px solid #fed7aa; border-radius: 8px; background: #fffbf5; text-align: left; }
      .itn-recovery-status { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
      .itn-recovery-tag { display: inline-block; padding: 3px 8px; border-radius: 4px; background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 800; text-transform: uppercase; }
      .itn-recovery-pid { color: #64748b; font-size: 12px; font-weight: 700; }
      .itn-booking-recovery-card h4 { margin: 0 0 4px; color: #9a3412; font-size: 14px; font-weight: 800; }
      .itn-booking-recovery-card p { margin: 0 0 12px; color: #7c2d12; font-size: 12px; line-height: 1.45; }
      .itn-recovery-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
      .itn-recovery-row label { display: flex; flex-direction: column; gap: 4px; color: #475569; font-size: 12px; font-weight: 700; text-align: left; }
      .itn-recovery-row input { height: 38px; padding: 0 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; color: #0f172a; }
      .itn-recovery-submit-btn { width: 100%; height: 42px; border: none; border-radius: 6px; background: #0f766e; color: #fff; font-size: 13px; font-weight: 800; cursor: pointer; }
      .itn-recovery-submit-btn:disabled { opacity: .6; cursor: not-allowed; }
      .itn-recovery-alt-links { margin-top: 10px; font-size: 12px; color: #64748b; text-align: center; }
      .itn-recovery-alt-links a { color: #0f766e; font-weight: 700; text-decoration: underline; }

      .itn-login-panel {
        position: relative;
        width: min(100%, 440px);
        overflow: hidden;
        border-radius: 10px;
        background: #fff;
        box-shadow: 0 28px 80px rgba(2, 8, 23, .34);
      }
      .itn-login-copy { display: grid; gap: 4px; padding: 20px; text-align: center; }
      .itn-login-copy strong { color: #0f172a; font-size: 26px; font-weight: 900; }
      .itn-login-copy span { color: var(--color-primary, #0f766e); font-size: 12px; font-weight: 800; text-transform: uppercase; }
      .itn-login-copy p { margin: 10px auto 0; max-width: 340px; color: #64748b; font-size: 13px; font-weight: 600; line-height: 1.5; }

      /* Skeletons */
      .itn-skeleton { border-radius: 8px; background: linear-gradient(90deg, #e2e8f0, #f1f5f9, #e2e8f0); background-size: 300% 100%; animation: itnPulse 1.4s infinite; }
      .itn-skeleton-banner { width: 100%; height: 320px; margin-bottom: 24px; border-radius: 12px; }
      .itn-skeleton-title { width: min(100%, 540px); height: 38px; margin-bottom: 16px; }
      .itn-skeleton-tabs { width: 320px; height: 32px; margin-bottom: 24px; }
      @keyframes itnPulse { to { background-position: -300% 0; } }

      /* Dynamic Gold Underline for Package Detail Page */
      .theme-underline-heading::after {
        background-color: var(--color-primary, #AA8453) !important;
      }
      .theme-underline-heading::before {
        border-bottom-color: var(--color-primary, #AA8453) !important;
      }

      .itn-mobile-sticky-bar {
        display: none;
      }

      /* Responsive Media Queries */
      @media (max-width: 991px) {
        .itn-layout { grid-template-columns: 1fr; gap: 32px; }
        .itn-sidebar { position: static; margin-top: 16px; }
        .itn-similar-grid { grid-template-columns: repeat(2, 1fr); }
        .itn-stay-card { grid-template-columns: 1fr; }
        .itn-stay-images { min-height: 200px; }
      }

      /* Comprehensive Mobile Polish (Up to 768px: Mobile Phones & Phablets) */
      @media (max-width: 768px) {
        /* Page spacing & container */
        .itn-page {
          padding-top: 84px !important;
          padding-bottom: 96px !important;
        }
        .itn-container {
          padding: 0 16px !important;
        }

        /* Hero Banner */
        .itn-hero-banner {
          height: 220px !important;
          border-radius: 10px !important;
          margin-bottom: 14px !important;
        }
        .itn-hero-video-controls {
          bottom: 10px !important;
          right: 10px !important;
          gap: 6px !important;
        }
        .itn-hero-ctrl-btn {
          width: 32px !important;
          height: 32px !important;
        }
        .itn-hero-video-badge {
          font-size: 11px !important;
          padding: 4px 9px !important;
        }

        /* Breadcrumbs: clean single scrollable row */
        .itn-breadcrumbs {
          font-size: 11.5px !important;
          gap: 5px !important;
          margin-bottom: 8px !important;
          flex-wrap: nowrap !important;
          overflow-x: auto !important;
          white-space: nowrap !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .itn-breadcrumbs::-webkit-scrollbar {
          display: none;
        }

        /* Header, Title & Meta */
        .itn-header {
          margin-bottom: 18px !important;
        }
        .itn-page-title {
          font-size: 21px !important;
          line-height: 1.25 !important;
          margin-bottom: 6px !important;
        }
        .itn-rating-row {
          font-size: 12px !important;
          margin-bottom: 10px !important;
        }
        .itn-meta-chips {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 6px !important;
          margin-bottom: 12px !important;
        }
        .itn-meta-chip {
          padding: 4px 9px !important;
          font-size: 11.5px !important;
          border-radius: 6px !important;
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
        }
        .itn-tour-map-title-wrap {
          display: flex !important;
          flex-shrink: 0 !important;
        }
        .itn-title-row {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 12px !important;
          width: 100% !important;
          margin-bottom: 8px !important;
        }
        .itn-page-title {
          font-size: 21px !important;
          line-height: 1.25 !important;
          margin: 0 !important;
          flex: 1 !important;
          min-width: 0 !important;
          text-align: left !important;
        }
        .itn-tour-map-title-btn {
          height: 32px !important;
          padding: 0 12px !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          border-radius: 6px !important;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
          margin: 0 !important;
          width: auto !important;
          box-shadow: 0 2px 6px rgba(170, 132, 83, 0.12) !important;
        }
        .itn-view-route-btn {
          width: 100% !important;
          justify-content: center !important;
          height: 38px !important;
          font-size: 13px !important;
          border-radius: 8px !important;
          margin-top: 4px !important;
          box-shadow: 0 2px 8px rgba(170, 132, 83, 0.15) !important;
        }
        .itn-description-wrap {
          margin-top: 6px !important;
        }
        .itn-description-text {
          font-size: 13.5px !important;
          line-height: 1.58 !important;
        }

        /* Tour Highlights Card */
        .itn-tour-highlights-card {
          padding: 16px 14px !important;
          border-radius: 10px !important;
          margin-bottom: 24px !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow: visible !important;
        }
        .itn-tour-highlights-head {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          margin-bottom: 12px !important;
          gap: 8px !important;
        }
        .itn-tour-highlights-title {
          font-size: 17px !important;
          text-align: center !important;
        }
        .itn-tour-highlights-list {
          gap: 12px !important;
          width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          list-style: none !important;
        }
        .itn-tour-highlight-item {
          display: grid !important;
          grid-template-columns: 16px minmax(0, 1fr) !important;
          align-items: flex-start !important;
          font-size: 13.5px !important;
          line-height: 1.5 !important;
          gap: 10px !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }
        .itn-tour-highlight-item span {
          display: block !important;
          min-width: 0 !important;
          width: 100% !important;
          white-space: normal !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          color: #374151 !important;
        }
        .itn-tour-highlight-bullseye {
          width: 16px !important;
          height: 16px !important;
          margin-top: 2.5px !important;
          flex-shrink: 0 !important;
        }

        /* Day-wise Itinerary: Beautiful Modern Card Flow */
        .itn-itinerary-wrap {
          padding-left: 0 !important;
        }
        .itn-itinerary-wrap::before {
          display: none !important;
        }
        .itn-city-card {
          border-radius: 10px !important;
          margin-bottom: 16px !important;
        }
        .itn-city-head {
          padding: 11px 14px !important;
          min-height: auto !important;
          gap: 6px !important;
        }
        .itn-city-head strong {
          font-size: 15.5px !important;
        }
        .itn-city-head span {
          font-size: 12.5px !important;
        }
        .itn-day-row {
          display: flex !important;
          flex-direction: column !important;
          min-height: auto !important;
          border-top: 1px solid #e2e8f0 !important;
        }
        .itn-day {
          width: 100% !important;
          padding: 8px 14px !important;
          background: #f8fafc !important;
          color: var(--color-primary, #0f766e) !important;
          font-size: 12px !important;
          font-weight: 800 !important;
          border-right: 0 !important;
          border-bottom: 1px solid #edf2f7 !important;
          letter-spacing: 0.3px !important;
          text-transform: uppercase !important;
        }
        .itn-day-activities,
        .itn-day-activities[data-count="1"],
        .itn-day-activities[data-count="3"] {
          display: grid !important;
          grid-template-columns: 1fr !important;
        }
        .itn-activity {
          display: grid !important;
          grid-template-columns: 32px 1fr !important;
          gap: 10px !important;
          padding: 11px 14px !important;
          min-height: auto !important;
          border-right: 0 !important;
          border-top: 0 !important;
          border-bottom: 1px solid #f1f5f9 !important;
          background: #ffffff !important;
        }
        .itn-activity:last-child {
          border-bottom: 0 !important;
        }
        .itn-dot,
        .itn-activity-photo {
          width: 28px !important;
          height: 28px !important;
          font-size: 10px !important;
        }
        .itn-activity small {
          font-size: 9.5px !important;
        }
        .itn-activity strong {
          font-size: 13.5px !important;
          margin-top: 2px !important;
        }
        .itn-activity em {
          font-size: 11.5px !important;
          line-height: 1.4 !important;
        }
        .itn-transfer-bridge {
          height: 60px !important;
          max-width: 100% !important;
        }
        .itn-transfer-bridge p {
          font-size: 11.5px !important;
        }

        /* Gallery: Clean 2x2 Grid */
        .itn-gallery-grid {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 8px !important;
          margin-bottom: 14px !important;
        }
        .itn-gallery-thumb {
          aspect-ratio: 16 / 11 !important;
          border-radius: 8px !important;
        }

        /* Centered Section Headings on Mobile (Excluding Main Page Title) */
        .itn-content-block > .itn-block-title,
        .itn-full-block > .itn-block-title {
          text-align: center !important;
        }

        /* Excluded Services Section Mobile - 20% Smaller & Compact */
        #itinerary-excluded-items {
          margin-top: 10px !important;
          margin-bottom: 20px !important;
        }
        .itn-exc-header {
          text-align: center !important;
          margin-bottom: 6px !important;
        }
        .itn-exc-header-top {
          display: flex !important;
          justify-content: center !important;
          text-align: center !important;
        }
        .itn-exc-title {
          font-size: 21px !important;
          text-align: center !important;
          margin-bottom: 4px !important;
        }
        .itn-exc-subtitle {
          font-size: 13.5px !important;
          line-height: 1.5 !important;
          text-align: center !important;
          margin-left: auto !important;
          margin-right: auto !important;
          max-width: 92% !important;
          margin-bottom: 6px !important;
        }
        .itn-exc-toggle-wrap {
          width: 100% !important;
          max-width: 250px !important;
          margin: 6px auto 14px !important;
        }
        .itn-exc-toggle-bar {
          width: 100% !important;
          height: 36px !important;
          display: flex !important;
          padding: 3px !important;
        }
        .itn-exc-toggle-btn {
          flex: 1 1 50% !important;
          width: 50% !important;
          padding: 0 8px !important;
          font-size: 12px !important;
          gap: 5px !important;
        }
        .itn-exc-toggle-btn svg {
          width: 14px !important;
          height: 14px !important;
        }
        .itn-exc-grid {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          -webkit-overflow-scrolling: touch !important;
          scroll-snap-type: x mandatory !important;
          gap: 12px !important;
          margin-top: 6px !important;
          padding: 10px 4px 14px !important;
          scrollbar-width: none !important;
        }
        .itn-exc-grid::-webkit-scrollbar {
          display: none !important;
        }
        .itn-exc-grid:has(> .itn-exc-card:only-child) {
          justify-content: center !important;
        }
        .itn-exc-card {
          flex: 0 0 264px !important;
          width: 264px !important;
          max-width: 78vw !important;
          scroll-snap-align: start !important;
          margin-top: 4px !important;
          border-radius: 14px !important;
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 3px 14px rgba(0, 0, 0, 0.05) !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
        }
        .itn-exc-card:hover {
          transform: translateY(-2px) !important;
        }
        .itn-exc-card-img-wrap,
        .itn-exc-card-img-wrap--hotel {
          height: 138px !important;
          position: relative !important;
          width: 100% !important;
          background: #0f172a !important;
          overflow: hidden !important;
        }
        .itn-exc-card-img-wrap--vehicle {
          height: 138px !important;
          position: relative !important;
          width: 100% !important;
          background: #f8fafc !important;
          padding: 6px !important;
          overflow: hidden !important;
        }
        .itn-exc-card-img-badge {
          top: 8px !important;
          left: 8px !important;
          font-size: 9.5px !important;
          font-weight: 750 !important;
          padding: 3px 8px !important;
          border-radius: 5px !important;
          background: rgba(15, 23, 42, 0.82) !important;
          backdrop-filter: blur(6px) !important;
          color: #ffffff !important;
          letter-spacing: 0.2px !important;
        }
        .itn-exc-card-body {
          padding: 10px 12px 11px !important;
          display: flex !important;
          flex-direction: column !important;
          flex: 1 !important;
        }
        .itn-exc-date-pill {
          display: inline-block !important;
          align-self: flex-start !important;
          font-size: 9.5px !important;
          font-weight: 700 !important;
          padding: 2px 7px !important;
          border-radius: 4px !important;
          margin-bottom: 4px !important;
          background: color-mix(in srgb, var(--color-primary, #AA8453) 10%, #ffffff) !important;
          color: var(--color-primary, #AA8453) !important;
          border: 1px solid color-mix(in srgb, var(--color-primary, #AA8453) 26%, transparent) !important;
          letter-spacing: 0.2px !important;
        }
        .itn-exc-card-title {
          font-size: 14.5px !important;
          font-weight: 750 !important;
          color: #0f172a !important;
          margin: 0 0 2px !important;
          line-height: 1.25 !important;
          white-space: normal !important;
          word-break: break-word !important;
        }
        .itn-exc-card-route {
          font-size: 11px !important;
          color: #64748b !important;
          margin: 0 0 7px !important;
          font-weight: 500 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        .itn-exc-meta-list {
          display: flex !important;
          flex-direction: column !important;
          gap: 4px !important;
          padding: 5px 0 !important;
          border-top: 1px solid #f1f5f9 !important;
          border-bottom: 1px solid #f1f5f9 !important;
          margin-bottom: 8px !important;
        }
        .itn-exc-meta-item {
          display: flex !important;
          align-items: center !important;
          gap: 5px !important;
          font-size: 11px !important;
          color: #475569 !important;
          font-weight: 500 !important;
          white-space: nowrap !important;
        }
        .itn-exc-meta-item svg {
          color: #64748b !important;
          flex-shrink: 0 !important;
          width: 13px !important;
          height: 13px !important;
        }
        .itn-exc-meta-dot {
          color: #cbd5e1 !important;
          font-weight: 800 !important;
          margin: 0 2px !important;
        }
        .itn-exc-refundable {
          color: #16a34a !important;
          font-weight: 600 !important;
        }
        .itn-exc-refundable svg {
          color: #16a34a !important;
        }
        .itn-exc-non-refundable {
          color: #dc2626 !important;
          font-weight: 600 !important;
        }
        .itn-exc-non-refundable svg {
          color: #dc2626 !important;
        }
        .itn-exc-card-footer {
          display: flex !important;
          align-items: flex-end !important;
          justify-content: space-between !important;
          gap: 8px !important;
          margin-top: auto !important;
          padding-top: 2px !important;
        }
        .itn-exc-price-col {
          display: flex !important;
          flex-direction: column !important;
        }
        .itn-exc-price {
          font-size: 16px !important;
          font-weight: 800 !important;
          color: #0f172a !important;
          line-height: 1.1 !important;
        }
        .itn-exc-per-night {
          font-size: 10px !important;
          color: #64748b !important;
          font-weight: 500 !important;
          margin-top: 1px !important;
          white-space: nowrap !important;
        }
        .itn-exc-btn-add {
          background: #ffffff !important;
          border: 1.5px solid var(--color-primary, #AA8453) !important;
          color: var(--color-primary, #AA8453) !important;
          font-size: 11px !important;
          font-weight: 750 !important;
          padding: 5px 11px !important;
          border-radius: 6px !important;
          white-space: nowrap !important;
          cursor: pointer !important;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .itn-exc-added-label {
          font-size: 11px !important;
          font-weight: 750 !important;
          color: var(--color-primary, #AA8453) !important;
          background: color-mix(in srgb, var(--color-primary, #AA8453) 12%, #ffffff) !important;
          padding: 4px 8px !important;
          border-radius: 6px !important;
          border: 1px solid color-mix(in srgb, var(--color-primary, #AA8453) 35%, transparent) !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 4px !important;
        }
        .itn-exc-trash-btn {
          width: 28px !important;
          height: 28px !important;
          border-radius: 6px !important;
        }

        /* Add On's: Scrollable Single Row */
        .itn-addons-header {
          text-align: center !important;
        }
        .itn-addons-header-top {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          gap: 6px !important;
        }
        .itn-addons-header-top > div:first-child {
          width: 100% !important;
          text-align: center !important;
        }
        .itn-addons-title {
          text-align: center !important;
        }
        #itinerary-addons .itn-addons-header-top p {
          text-align: center !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
        .itn-addons-arrow-controls {
          display: none !important;
        }
        .itn-addons-swipe-hint {
          display: inline-flex !important;
        }
        .itn-addons-grid {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          -webkit-overflow-scrolling: touch !important;
          scroll-snap-type: x mandatory !important;
          gap: 14px !important;
          margin-top: 14px !important;
          margin-left: -16px !important;
          margin-right: -16px !important;
          padding: 4px 16px 16px !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .itn-addons-grid::-webkit-scrollbar {
          display: none !important;
        }
        .itn-addon-card {
          flex: 0 0 275px !important;
          width: 275px !important;
          max-width: 82vw !important;
          scroll-snap-align: start !important;
          box-shadow: 0 3px 14px rgba(0, 0, 0, 0.06) !important;
        }
        .itn-addon-img-wrap {
          height: 155px !important;
        }
        .itn-addon-body {
          padding: 13px 15px 15px !important;
        }
        .itn-addon-name {
          font-size: 15px !important;
        }
        .itn-addon-price {
          font-size: 17px !important;
        }
        .itn-addon-btn-add {
          padding: 6px 12px !important;
          font-size: 12px !important;
        }

        /* Inclusions & Exclusions: 1-Column Stack */
        .itn-inc-exc-header {
          text-align: center !important;
        }
        #itinerary-inclusions-exclusions .itn-block-title {
          text-align: center !important;
        }
        .itn-inc-exc-subtitle {
          text-align: center !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
        .itn-inc-exc-grid {
          display: flex !important;
          flex-direction: column !important;
          gap: 14px !important;
        }
        .itn-inc-card,
        .itn-exc-card {
          padding: 16px 16px !important;
          border-radius: 12px !important;
        }
        .itn-inc-head-badge h3,
        .itn-exc-head-badge h3 {
          font-size: 15px !important;
        }
        .itn-inc-head-badge,
        .itn-exc-head-badge {
          justify-content: center !important;
        }
        .itn-inc-item,
        .itn-exc-item {
          font-size: 13px !important;
          gap: 8px !important;
        }

        /* Cancellation Policy Header Centering on Mobile */
        .itn-cancellation-card-head {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;
          gap: 8px !important;
        }
        .itn-cancellation-head-left {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;
          gap: 6px !important;
        }
        #itinerary-cancellation-policy .itn-block-title {
          text-align: center !important;
        }
        .itn-cancellation-subtitle {
          text-align: center !important;
          display: block !important;
        }

        /* Blogs & Articles Header Centering on Mobile */
        .itn-blogs-header {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;
          gap: 10px !important;
        }
        .itn-blogs-header-left {
          text-align: center !important;
          width: 100% !important;
        }
        #itinerary-blogs-articles .itn-block-title {
          text-align: center !important;
        }
        .itn-blogs-subtitle {
          text-align: center !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
        .itn-blogs-header-actions {
          justify-content: center !important;
          width: 100% !important;
        }

        /* Similar Packages: Matches Hot Deals Section on Mobile */
        .itn-similar-deals-section {
          position: relative !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          margin-bottom: 40px !important;
        }
        .itn-deals-cards-wrap {
          display: flex !important;
          gap: 16px !important;
          overflow-x: auto !important;
          padding: 8px 4px 20px !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
          scroll-snap-type: x proximity !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .itn-deals-card,
        .itn-similar-deals-section .recent-booking-card {
          flex-shrink: 0 !important;
          width: calc((100vw - 40px) / 0.85) !important;
          zoom: 0.85 !important;
          margin: 0 !important;
        }
        .itn-deals-scroll-btn {
          top: 38% !important;
          width: 40px !important;
          height: 40px !important;
        }
        .th-scroll-btn-pos--left {
          left: 4px !important;
        }
        .th-scroll-btn-pos--right {
          right: 4px !important;
        }
        .itn-deals-mobile-controls {
          display: none !important;
        }

        /* Reviews & Booking Card */
        .itn-reviews-grid,
        .itn-reviews-grid-full {
          grid-template-columns: 1fr !important;
          gap: 14px !important;
        }
        .itn-sidebar-card {
          padding: 16px !important;
          border-radius: 12px !important;
        }
        .itn-booking-summary,
        .itn-booking-actions,
        .itn-payment-options,
        .itn-traveller-count-row,
        .itn-guest-card {
          grid-template-columns: 1fr !important;
        }

        /* Sticky Mobile Bottom Booking Bar */
        .itn-mobile-sticky-bar {
          display: flex !important;
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 99 !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 12px !important;
          background: rgba(255, 255, 255, 0.98) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border-top: 1px solid #e2e8f0 !important;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08) !important;
          padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px)) !important;
        }
        .itn-mobile-sticky-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .itn-mobile-sticky-price {
          font-size: 19px;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .itn-mobile-sticky-sub {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
        }
        .itn-mobile-sticky-dot {
          color: #cbd5e1;
        }
        .itn-mobile-sticky-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .itn-mobile-sticky-wa {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          background: #25d366;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }
        .itn-mobile-sticky-wa:hover {
          transform: scale(1.05);
        }
        .itn-mobile-sticky-book-btn {
          height: 42px;
          padding: 0 20px;
          background: var(--color-primary, #0f766e);
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 3px 12px color-mix(in srgb, var(--color-primary, #0f766e) 30%, transparent);
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .itn-mobile-sticky-book-btn:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }

        /* Mobile Screen: Make popup modal responsive with contained scrolling */
        .itn-booking-modal {
          padding: 16px 10px !important;
          align-items: center !important;
          justify-content: center !important;
          overflow-y: auto !important;
          touch-action: pan-y !important;
        }
        .itn-booking-panel {
          width: min(94vw, 560px) !important;
          max-height: min(90vh, 90dvh) !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          border-radius: 14px !important;
          box-shadow: 0 20px 60px rgba(2, 8, 23, .45) !important;
          touch-action: pan-y !important;
          -webkit-overflow-scrolling: touch !important;
        }
        .itn-booking-hero {
          padding: 18px 18px 20px !important;
        }
        .itn-booking-hero span {
          font-size: 9.5px !important;
          letter-spacing: .7px !important;
        }
        .itn-booking-hero h2 {
          font-size: 19px !important;
          margin: 6px 0 4px !important;
        }
        .itn-booking-hero p {
          font-size: 11.5px !important;
        }
        .itn-booking-close {
          top: 10px !important;
          right: 10px !important;
          width: 28px !important;
          height: 28px !important;
          font-size: 14px !important;
        }
        .itn-booking-summary,
        .itn-booking-payment-choice,
        .itn-booking-travellers,
        .itn-booking-breakdown,
        .itn-booking-form,
        .itn-booking-actions,
        .itn-booking-result,
        .itn-booking-recovery-card {
          margin-left: 14px !important;
          margin-right: 14px !important;
        }
        .itn-booking-summary {
          padding: 14px 14px 0 !important;
          gap: 10px !important;
        }
        .itn-booking-summary > div {
          padding: 10px !important;
        }
        .itn-booking-summary strong {
          font-size: 16px !important;
        }
        .itn-booking-payment-choice {
          margin-top: 12px !important;
          padding: 12px !important;
        }
        .itn-booking-travellers {
          margin-top: 12px !important;
          padding: 12px !important;
        }
        .itn-booking-section-title {
          margin-bottom: 8px !important;
        }
        .itn-booking-section-title span {
          font-size: 9.5px !important;
        }
        .itn-booking-section-title strong {
          font-size: 11.5px !important;
        }
        .itn-traveller-count-row {
          padding: 10px !important;
          gap: 10px !important;
          grid-template-columns: minmax(0, 1fr) 130px !important;
        }
        .itn-traveller-count-row strong {
          font-size: 15px !important;
        }
        .itn-traveller-count-row small {
          font-size: 10.5px !important;
        }
        .itn-traveller-stepper {
          grid-template-columns: 34px 1fr 34px !important;
          gap: 6px !important;
        }
        .itn-traveller-stepper button {
          width: 34px !important;
          height: 34px !important;
          font-size: 16px !important;
        }
        .itn-traveller-stepper input {
          height: 34px !important;
          font-size: 13px !important;
        }
        .itn-guest-card {
          grid-template-columns: 1fr 1fr !important;
          padding: 10px !important;
          gap: 8px !important;
        }
        .itn-guest-card input {
          height: 34px !important;
          font-size: 12px !important;
        }
        .itn-booking-breakdown {
          margin-top: 12px !important;
        }
        .itn-booking-breakdown div {
          padding: 8px 12px !important;
        }
        .itn-booking-breakdown span {
          font-size: 11px !important;
        }
        .itn-booking-breakdown strong {
          font-size: 12px !important;
        }
        .itn-booking-form {
          padding: 14px 14px 0 !important;
          gap: 10px !important;
        }
        .itn-booking-form label {
          font-size: 10.5px !important;
          gap: 4px !important;
        }
        .itn-booking-form input {
          height: 36px !important;
          font-size: 12.5px !important;
          padding: 0 12px !important;
        }
        .itn-booking-form textarea {
          min-height: 60px !important;
          font-size: 12.5px !important;
          padding: 8px 12px !important;
        }
        .itn-coupon-row button {
          height: 36px !important;
          font-size: 11px !important;
        }
        .itn-booking-actions {
          padding: 14px !important;
          gap: 8px !important;
          grid-template-columns: 90px 1fr !important;
        }
        .itn-booking-actions button,
        .itn-booking-actions a {
          height: 38px !important;
          font-size: 12.5px !important;
        }
      }

      /* =========================================================
         Create Our Itinerary Section Styles
         ========================================================= */
      .itn-create-itinerary-section {
        background: #ffffff !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 16px !important;
        padding: 28px !important;
        margin-bottom: 32px !important;
        box-shadow: 0 4px 24px rgba(15, 23, 42, 0.04) !important;
      }
      .itn-create-itn-header {
        margin-bottom: 24px;
      }
      .itn-create-itn-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #f0fdf4;
        color: #166534;
        border: 1px solid #bbf7d0;
        font-weight: 800;
        font-size: 11px;
        padding: 4px 10px;
        border-radius: 999px;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }
      .itn-create-itn-title {
        font-size: 24px !important;
        font-weight: 800 !important;
        color: #0f172a !important;
        margin: 0 0 6px !important;
      }
      .itn-create-itn-subtitle {
        font-size: 13.5px;
        color: #64748b;
        margin: 0;
        line-height: 1.5;
      }
      .itn-create-step-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 22px;
        margin-bottom: 20px;
      }
      .itn-create-step-head {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        margin-bottom: 18px;
      }
      .itn-create-step-num {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--color-primary, #0f766e);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 14px;
        flex-shrink: 0;
        box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary, #0f766e) 35%, transparent);
      }
      .itn-create-step-title {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
      }
      .itn-create-step-desc {
        margin: 2px 0 0;
        font-size: 12.5px;
        color: #64748b;
      }
      /* Single Selected Package Card Styles */
      .itn-custom-single-pkg-card {
        background: #ffffff;
        border: 2px solid var(--color-primary, #0f766e);
        border-radius: 16px;
        overflow: hidden;
        display: flex;
        flex-direction: row;
        box-shadow: 0 8px 28px color-mix(in srgb, var(--color-primary, #0f766e) 14%, transparent);
        transition: all 0.25s ease;
      }
      .itn-custom-single-pkg-card:hover {
        box-shadow: 0 12px 36px color-mix(in srgb, var(--color-primary, #0f766e) 22%, transparent);
      }
      .itn-custom-single-pkg-media {
        position: relative;
        flex: 0 0 280px;
        min-height: 200px;
        background: #0f172a;
      }
      .itn-custom-single-dur-badge {
        position: absolute;
        bottom: 12px;
        left: 12px;
        background: rgba(15, 23, 42, 0.88);
        color: #ffffff;
        font-size: 11.5px;
        font-weight: 700;
        padding: 4px 9px;
        border-radius: 6px;
        backdrop-filter: blur(4px);
        letter-spacing: 0.3px;
        z-index: 2;
      }
      .itn-custom-single-selected-pill {
        position: absolute;
        top: 12px;
        left: 12px;
        background: #166534;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        letter-spacing: 0.4px;
        z-index: 2;
      }
      .itn-custom-single-pkg-info {
        padding: 22px 24px;
        display: flex;
        flex-direction: column;
        flex: 1;
        justify-content: space-between;
      }
      .itn-custom-single-pkg-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 6px;
      }
      .itn-custom-single-pkg-dest {
        font-size: 11.5px;
        font-weight: 800;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.8px;
      }
      .itn-custom-single-check-status {
        font-size: 11.5px;
        font-weight: 800;
        color: #16a34a;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        padding: 2px 8px;
        border-radius: 999px;
      }
      .itn-custom-single-pkg-name {
        font-size: 20px;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 10px;
        line-height: 1.3;
      }
      .itn-custom-single-features {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
      }
      .itn-custom-feat-pill {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #334155;
        font-size: 11.5px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
      }
      .itn-custom-single-pkg-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding-top: 14px;
        border-top: 1px solid #f1f5f9;
        margin-top: auto;
      }
      .itn-custom-single-price-lbl {
        font-size: 11.5px;
        font-weight: 600;
        color: #64748b;
        display: block;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .itn-custom-single-price-val {
        font-size: 20px;
        font-weight: 900;
        color: var(--color-primary, #0f766e);
        display: flex;
        align-items: baseline;
        gap: 4px;
      }
      .itn-custom-single-price-val small {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
      }
      .itn-custom-single-cta-btn {
        background: linear-gradient(135deg, var(--color-primary, #0f766e) 0%, #115e59 100%);
        color: #ffffff;
        border: none;
        padding: 12px 22px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary, #0f766e) 30%, transparent);
        white-space: nowrap;
      }
      .itn-custom-single-cta-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 22px color-mix(in srgb, var(--color-primary, #0f766e) 40%, transparent);
      }
      .itn-custom-field-block {
        margin-bottom: 18px;
      }
      .itn-custom-field-block:last-child {
        margin-bottom: 0;
      }
      .itn-custom-field-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 8px;
      }
      .itn-custom-selected-hint {
        font-size: 12px;
        font-weight: 500;
        color: #64748b;
      }
      .itn-custom-selected-hint strong {
        color: var(--color-primary, #0f766e);
      }
      .itn-custom-traveller-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 10px;
      }
      .itn-custom-traveller-card {
        position: relative;
        background: #ffffff;
        border: 1.5px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        cursor: pointer;
        transition: all 0.18s ease;
        outline: none;
      }
      .itn-custom-traveller-card:hover {
        border-color: #cbd5e1;
        transform: translateY(-2px);
      }
      .itn-custom-traveller-card.is-picked {
        border-color: var(--color-primary, #0f766e);
        background: #f0fdfa;
        box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary, #0f766e) 15%, transparent);
        transform: translateY(-2px);
      }
      .itn-custom-traveller-icon-wrap {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 6px;
      }
      .itn-custom-traveller-emoji {
        font-size: 20px;
      }
      .itn-custom-traveller-card.is-picked .itn-custom-traveller-icon-wrap {
        background: #ccfbf1;
      }
      .itn-custom-traveller-title {
        font-size: 12px;
        font-weight: 700;
        color: #0f172a;
      }
      .itn-custom-traveller-sub {
        font-size: 10px;
        color: #64748b;
        margin-top: 2px;
        line-height: 1.2;
      }
      .itn-custom-traveller-check-indicator {
        position: absolute;
        top: 6px;
        right: 6px;
        font-size: 9px;
        font-weight: 900;
        color: #ffffff;
        background: var(--color-primary, #0f766e);
        width: 16px;
        height: 16px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .itn-custom-rooms-box {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .itn-custom-room-row {
        background: #f8fafc;
        border: 1px solid #edf2f7;
        border-radius: 10px;
        padding: 12px;
      }
      .itn-custom-room-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .itn-custom-room-badge {
        font-size: 11px;
        font-weight: 800;
        color: #475569;
        letter-spacing: 0.5px;
      }
      .itn-custom-room-del {
        border: none;
        background: transparent;
        color: #e11d48;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
      }
      .itn-custom-guest-steppers {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .itn-custom-guest-col {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #ffffff;
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }
      .itn-custom-guest-label {
        font-size: 12px;
        font-weight: 600;
        color: #334155;
      }
      .itn-custom-counter {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .itn-custom-counter button {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: 1px solid #cbd5e1;
        background: #f8fafc;
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s;
      }
      .itn-custom-counter button:hover {
        background: #e2e8f0;
      }
      .itn-custom-counter span {
        font-size: 13.5px;
        font-weight: 800;
        min-width: 16px;
        text-align: center;
        color: #0f172a;
      }
      .itn-custom-child-ages-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px dashed #cbd5e1;
      }
      .itn-custom-child-age-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11.5px;
        color: #475569;
      }
      .itn-custom-child-age-item select {
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid #cbd5e1;
        font-size: 12px;
        background: #ffffff;
        outline: none;
      }
      .itn-custom-add-room-btn {
        align-self: flex-start;
        padding: 8px 14px;
        border-radius: 8px;
        border: 1.5px dashed var(--color-primary, #0f766e);
        background: #f0fdfa;
        color: var(--color-primary, #0f766e);
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s;
      }
      .itn-custom-add-room-btn:hover {
        background: #ccfbf1;
      }
      .itn-custom-grid-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 18px;
      }
      .itn-custom-dur-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }
      .itn-custom-dur-pill {
        padding: 10px 6px;
        border-radius: 8px;
        border: 1.5px solid #e2e8f0;
        background: #ffffff;
        font-size: 12px;
        font-weight: 700;
        color: #334155;
        cursor: pointer;
        transition: all 0.15s ease;
        text-align: center;
      }
      .itn-custom-dur-pill:hover {
        border-color: #cbd5e1;
      }
      .itn-custom-dur-pill.active {
        border-color: var(--color-primary, #0f766e);
        background: var(--color-primary, #0f766e);
        color: #ffffff;
      }
      .itn-custom-text-input {
        width: 100%;
        height: 42px;
        border-radius: 8px;
        border: 1.5px solid #e2e8f0;
        padding: 0 14px;
        font-size: 13.5px;
        outline: none;
        background: #ffffff;
        transition: border-color 0.2s;
        box-sizing: border-box;
        color: #0f172a;
      }
      .itn-custom-text-input:focus {
        border-color: var(--color-primary, #0f766e);
      }
      .itn-custom-city-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 10px;
      }
      .itn-custom-city-chip {
        padding: 6px 12px;
        border-radius: 20px;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        font-size: 12px;
        font-weight: 600;
        color: #475569;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .itn-custom-city-chip:hover {
        border-color: #cbd5e1;
      }
      .itn-custom-city-chip.active {
        background: #0f172a;
        color: #ffffff;
        border-color: #0f172a;
      }
      .itn-custom-city-other {
        margin-top: 4px;
      }
      .itn-custom-city-search-wrap {
        position: relative;
        margin-top: 6px;
        width: 100%;
      }
      .itn-custom-city-input-inner {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
      }
      .itn-custom-city-search-icon {
        position: absolute;
        left: 12px;
        pointer-events: none;
        color: #94a3b8;
        flex-shrink: 0;
      }
      .itn-custom-city-input-inner .itn-custom-city-other {
        padding-left: 38px;
        padding-right: 38px;
        margin-top: 0;
        width: 100%;
      }
      .itn-custom-city-spinner {
        position: absolute;
        right: 12px;
        width: 16px;
        height: 16px;
        border: 2px solid #e2e8f0;
        border-top-color: var(--color-primary, #0f766e);
        border-radius: 50%;
        animation: itnCitySpin 0.6s linear infinite;
      }
      @keyframes itnCitySpin {
        to { transform: rotate(360deg); }
      }
      .itn-custom-city-clear-btn {
        position: absolute;
        right: 10px;
        background: #f1f5f9;
        border: none;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        font-size: 11px;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .itn-custom-city-clear-btn:hover {
        background: #e2e8f0;
        color: #0f172a;
      }
      .itn-custom-city-dropdown {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        z-index: 1000;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 14px 35px -8px rgba(15, 23, 42, 0.18);
        max-height: 250px;
        overflow-y: auto;
        animation: itnDropdownFade 0.15s ease-out;
      }
      @keyframes itnDropdownFade {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .itn-custom-city-list {
        display: flex;
        flex-direction: column;
        padding: 6px;
      }
      .itn-custom-city-item {
        background: none;
        border: none;
        padding: 9px 12px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        text-align: left;
        width: 100%;
        font-family: inherit;
        transition: background 0.15s ease;
      }
      .itn-custom-city-item:hover,
      .itn-custom-city-item:focus {
        background: #f1f5f9;
        outline: none;
      }
      .itn-custom-city-item-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        flex: 1;
      }
      .itn-custom-city-pin {
        color: var(--color-primary, #0f766e);
        flex-shrink: 0;
      }
      .itn-custom-city-item-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .itn-custom-city-name {
        font-size: 13px;
        font-weight: 600;
        color: #0f172a;
      }
      .itn-custom-city-country {
        font-size: 12px;
        color: #64748b;
      }
      .itn-custom-city-type-pill {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 3px 7px;
        border-radius: 6px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #64748b;
        flex-shrink: 0;
      }
      .itn-custom-city-item:hover .itn-custom-city-type-pill {
        background: #e2e8f0;
        color: #334155;
      }
      .itn-custom-city-empty-state,
      .itn-custom-city-loading-state {
        padding: 16px;
        font-size: 13px;
        color: #64748b;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .itn-custom-pref-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }
      .itn-custom-pref-col {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .itn-custom-pref-title {
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 2px;
      }
      .itn-custom-radio-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .itn-custom-radio-card {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        background: #ffffff;
        border: 1.5px solid #e2e8f0;
        border-radius: 10px;
        padding: 10px 12px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .itn-custom-radio-card:hover {
        border-color: #cbd5e1;
      }
      .itn-custom-radio-card.active {
        border-color: var(--color-primary, #0f766e);
        background: #f0fdfa;
      }
      .itn-custom-radio-card input {
        margin-top: 3px;
        accent-color: var(--color-primary, #0f766e);
      }
      .itn-custom-radio-card strong {
        display: block;
        font-size: 12.5px;
        color: #0f172a;
      }
      .itn-custom-radio-card small {
        display: block;
        font-size: 10.5px;
        color: #64748b;
        margin-top: 1px;
      }
      .itn-custom-contact-form {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 18px;
      }
      .itn-custom-form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .itn-custom-input-wrap {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        color: #334155;
      }
      .itn-custom-input-full {
        grid-column: 1 / -1;
      }
      .itn-custom-textarea {
        width: 100%;
        border-radius: 8px;
        border: 1.5px solid #e2e8f0;
        padding: 10px 14px;
        font-size: 13px;
        outline: none;
        background: #ffffff;
        resize: vertical;
        box-sizing: border-box;
        color: #0f172a;
        font-family: inherit;
      }
      .itn-custom-textarea:focus {
        border-color: var(--color-primary, #0f766e);
      }
      .itn-custom-error-box {
        margin-top: 14px;
        padding: 10px 14px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #b91c1c;
        border-radius: 8px;
        font-size: 12.5px;
        font-weight: 600;
      }
      .itn-custom-summary-bar {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .itn-custom-summary-content {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
      }
      .itn-custom-summary-label {
        font-size: 11px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .itn-custom-summary-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .itn-custom-sum-pill {
        background: #f1f5f9;
        color: #334155;
        font-size: 11.5px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 6px;
      }
      .itn-custom-sum-pill-pkg {
        background: #fef3c7;
        color: #92400e;
        font-weight: 700;
      }
      .itn-custom-submit-btn {
        padding: 12px 28px;
        background: linear-gradient(135deg, var(--color-primary, #0f766e) 0%, #0d5f59 100%);
        color: #ffffff;
        font-size: 14px;
        font-weight: 800;
        border-radius: 10px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 16px color-mix(in srgb, var(--color-primary, #0f766e) 30%, transparent);
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      .itn-custom-submit-btn:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
      }
      .itn-custom-submit-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      .itn-custom-spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.35);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: itnSpin 0.7s linear infinite;
      }
      @keyframes itnSpin {
        to { transform: rotate(360deg); }
      }
      .itn-custom-success-card {
        background: #f0fdf4;
        border: 2px solid #86efac;
        border-radius: 16px;
        padding: 32px 24px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .itn-custom-success-icon {
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background: #22c55e;
        color: #ffffff;
        font-size: 28px;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(34, 197, 94, 0.35);
      }
      .itn-custom-success-badge {
        font-size: 11px;
        font-weight: 800;
        color: #166534;
        background: #dcfce7;
        padding: 4px 12px;
        border-radius: 999px;
        letter-spacing: 0.5px;
      }
      .itn-custom-success-title {
        font-size: 22px;
        font-weight: 800;
        color: #14532d;
        margin: 4px 0 0;
      }
      .itn-custom-success-desc {
        font-size: 13.5px;
        color: #166534;
        max-width: 600px;
        margin: 0;
        line-height: 1.5;
      }
      .itn-custom-ref-box {
        background: #ffffff;
        border: 1px dashed #86efac;
        padding: 8px 18px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #14532d;
      }
      .itn-custom-ref-box strong {
        font-size: 16px;
        font-weight: 900;
        letter-spacing: 1px;
        color: #15803d;
      }
      .itn-custom-summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
        width: 100%;
        max-width: 760px;
        background: #ffffff;
        border: 1px solid #bbf7d0;
        border-radius: 12px;
        padding: 16px;
        text-align: left;
        margin: 10px 0;
      }
      .itn-custom-summary-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .itn-custom-summary-item span {
        font-size: 11px;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
      }
      .itn-custom-summary-item strong {
        font-size: 12.5px;
        color: #0f172a;
      }
      .itn-custom-reset-btn {
        padding: 10px 22px;
        border-radius: 8px;
        border: 1.5px solid #166534;
        background: #ffffff;
        color: #166534;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .itn-custom-reset-btn:hover {
        background: #dcfce7;
      }
      .itn-custom-step1-action-bar {
        margin-top: 18px;
        padding-top: 16px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .itn-custom-step1-summary {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .itn-custom-step1-lbl {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #64748b;
      }
      .itn-custom-step1-pkgname {
        font-size: 15px;
        font-weight: 800;
        color: #0f172a;
      }
      .itn-custom-step1-pkgmeta {
        font-size: 12.5px;
        font-weight: 600;
        color: var(--color-primary, #0f766e);
      }
      .itn-custom-step1-cta-btn {
        padding: 12px 24px;
        border-radius: 10px;
        background: linear-gradient(135deg, var(--color-primary, #0f766e) 0%, #0d5f59 100%);
        color: #ffffff;
        border: none;
        font-size: 13.5px;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary, #0f766e) 30%, transparent);
        transition: all 0.2s ease;
      }
      .itn-custom-step1-cta-btn:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
      }
      .itn-custom-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(15, 23, 42, 0.72);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: itnModalFadeIn 0.25s ease-out;
      }
      @keyframes itnModalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .itn-custom-modal-panel {
        background: #ffffff;
        border-radius: 20px;
        width: 100%;
        max-width: 860px;
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35);
        overflow: hidden;
        border: 1px solid rgba(226, 232, 240, 0.9);
        animation: itnModalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes itnModalSlideUp {
        from { opacity: 0; transform: translateY(24px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .itn-custom-modal-header {
        padding: 18px 24px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        background: #fafaf9;
        flex-shrink: 0;
      }
      .itn-custom-modal-head-left {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .itn-custom-modal-title {
        font-size: 20px;
        font-weight: 800;
        color: #0f172a;
        margin: 4px 0 2px;
      }
      .itn-custom-modal-subtitle {
        font-size: 13px;
        color: #64748b;
        margin: 0;
      }
      .itn-custom-modal-subtitle strong {
        color: var(--color-primary, #0f766e);
      }
      .itn-custom-modal-close {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1.5px solid #e2e8f0;
        background: #ffffff;
        color: #475569;
        font-size: 15px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
        flex-shrink: 0;
      }
      .itn-custom-modal-close:hover {
        background: #f1f5f9;
        color: #0f172a;
        border-color: #cbd5e1;
      }
      .itn-custom-modal-body {
        padding: 22px 24px;
        overflow-y: auto;
        flex: 1;
        scrollbar-width: thin;
      }
      .itn-custom-modal-steps {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .itn-custom-success-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 12px;
        flex-wrap: wrap;
        justify-content: center;
      }

      @media (max-width: 768px) {
        .itn-create-itinerary-section {
          padding: 16px !important;
        }
        .itn-create-step-card {
          padding: 14px !important;
        }
        .itn-custom-pref-grid {
          grid-template-columns: 1fr !important;
        }
        .itn-custom-grid-row {
          grid-template-columns: 1fr !important;
        }
        .itn-custom-dur-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        .itn-custom-form-grid {
          grid-template-columns: 1fr !important;
        }
        .itn-custom-guest-steppers {
          grid-template-columns: 1fr !important;
        }
        .itn-custom-summary-bar {
          flex-direction: column !important;
          align-items: stretch !important;
        }
        .itn-custom-submit-btn {
          width: 100% !important;
          justify-content: center !important;
        }
        .itn-custom-single-pkg-card {
          flex-direction: column !important;
        }
        .itn-custom-single-pkg-media {
          flex: none !important;
          width: 100% !important;
          height: 180px !important;
        }
        .itn-custom-single-pkg-info {
          padding: 16px 14px !important;
        }
        .itn-custom-single-pkg-name {
          font-size: 17px !important;
          margin-bottom: 8px !important;
        }
        .itn-custom-single-pkg-footer {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 12px !important;
        }
        .itn-custom-single-cta-btn {
          width: 100% !important;
          justify-content: center !important;
          padding: 13px 18px !important;
        }
        .itn-custom-modal-overlay {
          padding: 8px !important;
          align-items: flex-end !important;
        }
        .itn-custom-modal-panel {
          max-height: 94vh !important;
          border-radius: 18px 18px 0 0 !important;
        }
        .itn-custom-modal-header {
          padding: 14px 16px !important;
        }
        .itn-custom-modal-body {
          padding: 14px 12px !important;
        }
      }
    `}</style>
  );
}

export default function TourItineraryView({ destination, packageSlug }) {
  const router = useRouter();
  const resolvedSlug = getPackageSlug(destination, packageSlug);
  const packageIdFromQuery = getPackageIdFromSlug(packageSlug);

  const [pkg, setPkg] = useState(null);
  const [company, setCompany] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ count: 0, average_rating: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [similarPackages, setSimilarPackages] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mediaOpen, setMediaOpen] = useState(false);
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [cancellationPolicyData, setCancellationPolicyData] = useState(FALLBACK_CANCELLATION_DATA);
  const videoRef = useRef(null);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [cmsMapData, setCmsMapData] = useState(null);
  const [cmsPageData, setCmsPageData] = useState(null);
  const [allReviewsModalOpen, setAllReviewsModalOpen] = useState(false);
  const [cmsReviews, setCmsReviews] = useState([]);
  const [selectedReviewIndex, setSelectedReviewIndex] = useState(0);
  const [partialBooking, setPartialBooking] = useState(null);
  const [paymentMode, setPaymentMode] = useState('partial');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', couponCode: '', notes: '' });
  const [travellerCount, setTravellerCount] = useState(1);
  const [guestTravellers, setGuestTravellers] = useState([]);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [verifiedBooking, setVerifiedBooking] = useState(null);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [couponValidation, setCouponValidation] = useState(null);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponError, setCouponError] = useState('');
  const [similarActiveIndex, setSimilarActiveIndex] = useState(0);
  const similarScrollRef = useRef(null);
  const addonsScrollRef = useRef(null);
  const excludedScrollRef = useRef(null);
  const blogsScrollRef = useRef(null);

  // "Create your Itinerary" Custom Package Section State
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customSelectedPkgId, setCustomSelectedPkgId] = useState(null);
  const [customTravelWith, setCustomTravelWith] = useState('Couple');
  const [customRooms, setCustomRooms] = useState([{ id: 1, adults: 2, children: 0, childAges: [] }]);
  const [customDuration, setCustomDuration] = useState('5-6 Days');
  const [customDepartureCity, setCustomDepartureCity] = useState('Delhi');
  const [customCustomCityInput, setCustomCustomCityInput] = useState('');
  const [customCitySuggestions, setCustomCitySuggestions] = useState([]);
  const [customCityLoading, setCustomCityLoading] = useState(false);
  const [customCityDropdownOpen, setCustomCityDropdownOpen] = useState(false);
  const customCityDropdownRef = useRef(null);

  // Dynamic City Search via /api/v1/locations/country-city with slug & text matching
  useEffect(() => {
    const rawQuery = customCustomCityInput.trim();
    if (!rawQuery || rawQuery.length < 2) {
      setCustomCitySuggestions([]);
      setCustomCityLoading(false);
      return;
    }

    let active = true;
    setCustomCityLoading(true);

    const timer = setTimeout(async () => {
      try {
        const querySlug = rawQuery.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const cleanQuery = rawQuery.replace(/[-_]+/g, ' ').trim();

        // 1. Fetch suggestions from API
        const res = await searchCountryCityLocations({ search: cleanQuery, limit: 30 });
        if (!active) return;

        let items = Array.isArray(res?.cities) && res.cities.length > 0
          ? res.cities
          : (Array.isArray(res?.suggestions) ? res.suggestions : []);

        // Filter / rank with slug logic & text matching
        const enriched = items.map((item) => {
          const name = item.name || item.label || '';
          const slug = item.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          const label = item.label || (item.country_name ? `${name}, ${item.country_name}` : name);
          return {
            ...item,
            name,
            slug,
            label,
          };
        });

        // Prioritize exact slug match or startsWith
        enriched.sort((a, b) => {
          const aExact = a.slug === querySlug || a.name.toLowerCase() === rawQuery.toLowerCase();
          const bExact = b.slug === querySlug || b.name.toLowerCase() === rawQuery.toLowerCase();
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          const aStarts = a.slug.startsWith(querySlug) || a.name.toLowerCase().startsWith(rawQuery.toLowerCase());
          const bStarts = b.slug.startsWith(querySlug) || b.name.toLowerCase().startsWith(rawQuery.toLowerCase());
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;

          return 0;
        });

        setCustomCitySuggestions(enriched);
        setCustomCityDropdownOpen(enriched.length > 0);
      } catch (err) {
        console.warn('City search failed:', err);
        if (active) setCustomCitySuggestions([]);
      } finally {
        if (active) setCustomCityLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [customCustomCityInput]);

  // Click outside to close city suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (customCityDropdownRef.current && !customCityDropdownRef.current.contains(e.target)) {
        setCustomCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectCitySuggestion = (cityItem) => {
    const selectedName = cityItem.name || cityItem.label || '';
    const selectedLabel = cityItem.label || selectedName;
    setCustomCustomCityInput(selectedLabel);
    setCustomDepartureCity(selectedName);
    setCustomCityDropdownOpen(false);
  };
  const [customDepartureDate, setCustomDepartureDate] = useState('');
  const [customHotelCategory, setCustomHotelCategory] = useState('4 Star Deluxe');
  const [customMealPlan, setCustomMealPlan] = useState('Breakfast & Dinner (MAP)');
  const [customVehicleType, setCustomVehicleType] = useState('Private AC Sedan (Dzire / Etios)');
  const [customContactName, setCustomContactName] = useState('');
  const [customContactPhone, setCustomContactPhone] = useState('');
  const [customContactEmail, setCustomContactEmail] = useState('');
  const [customSpecialNotes, setCustomSpecialNotes] = useState('');
  const [customItinerarySubmitting, setCustomItinerarySubmitting] = useState(false);
  const [customItinerarySubmitted, setCustomItinerarySubmitted] = useState(false);
  const [customItineraryRefId, setCustomItineraryRefId] = useState('');
  const [customItineraryError, setCustomItineraryError] = useState('');

  // Auto-fill customer contact from stored auth
  useEffect(() => {
    const auth = getStoredAuth();
    if (auth) {
      if (auth.name || auth.fullName) setCustomContactName(auth.name || auth.fullName || '');
      if (auth.phone || auth.mobile) setCustomContactPhone(auth.phone || auth.mobile || '');
      if (auth.email) setCustomContactEmail(auth.email || '');
    }
  }, []);

  // Handle ESC key to close custom modal
  useEffect(() => {
    if (!customModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !customItinerarySubmitting) {
        setCustomModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [customModalOpen, customItinerarySubmitting]);

  // Handle ESC key to close booking modal
  useEffect(() => {
    if (!bookingModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !paymentProcessing) {
        setBookingModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bookingModalOpen, paymentProcessing]);

  const addCustomRoom = () => {
    setCustomRooms(prev => [...prev, { id: Date.now(), adults: 2, children: 0, childAges: [] }]);
  };

  const removeCustomRoom = (roomId) => {
    setCustomRooms(prev => prev.filter(r => r.id !== roomId));
  };

  const updateCustomRoom = (roomId, field, value) => {
    setCustomRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r;
      if (field === 'children') {
        const nextCount = Number(value) || 0;
        let newAges = Array.isArray(r.childAges) ? [...r.childAges] : [];
        if (nextCount > newAges.length) {
          while (newAges.length < nextCount) newAges.push(5);
        } else if (nextCount < newAges.length) {
          newAges = newAges.slice(0, nextCount);
        }
        return { ...r, children: nextCount, childAges: newAges };
      }
      return { ...r, [field]: value };
    }));
  };

  const customTotalTravellers = useMemo(() => {
    return customRooms.reduce((acc, r) => acc + (Number(r.adults) || 0) + (Number(r.children) || 0), 0);
  }, [customRooms]);

  const currentPkgOption = useMemo(() => {
    const days = Number(pkg?.duration_days) || Number(pkg?.duration) || 6;
    const nights = Math.max(days - 1, 1);
    const durationStr = `${nights}N / ${days}D`;
    const priceVal = Number(pkg?.price) > 0 ? Number(pkg?.price) : 24999;
    const destStr = pkg?.destinations?.[0]?.destination?.name || pkg?.location || destination || 'Holiday Tour';
    const pkgName = pkg?.name || pkg?.title || 'Tour Package';
    return {
      id: pkg?.id || 'current-pkg',
      slug: pkg?.slug || resolvedSlug,
      name: pkgName,
      duration: durationStr,
      price: priceVal,
      image: getMediaUrl(pkg?.main_image) || fallbackImage,
      destination: destStr,
      isCurrent: true,
    };
  }, [pkg, resolvedSlug, destination]);

  const activeCustomPkg = currentPkgOption;

  const handleCreateCustomItinerary = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!customContactName.trim()) {
      setCustomItineraryError('Please enter your full name so our team can address you properly.');
      return;
    }
    if (!customContactPhone.trim()) {
      setCustomItineraryError('Please enter your mobile or WhatsApp number to receive your quote.');
      return;
    }

    setCustomItinerarySubmitting(true);
    setCustomItineraryError('');

    const effectiveCity = customCustomCityInput.trim() || customDepartureCity;
    const generatedRefId = `RF-ITN-${Date.now().toString().slice(-6)}`;

    const payload = {
      customer: {
        name: customContactName.trim(),
        phone: customContactPhone.trim(),
        email: customContactEmail.trim() || `${customContactPhone.trim()}@guest.ratnamforex.com`,
      },
      trip: {
        destination: activeCustomPkg?.destination || pkg?.name || destination || 'Custom Tour',
        destination_slug: activeCustomPkg?.slug || pkg?.slug || resolvedSlug || '',
        package_name: activeCustomPkg?.name || pkg?.name || 'Tour Package',
        package_id: activeCustomPkg?.id || pkg?.id || null,
        travel_with: customTravelWith,
        duration: customDuration,
        departure_city: effectiveCity,
        departure_date: customDepartureDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        total_travellers: customTotalTravellers,
        rooms: customRooms.map(r => ({
          adults: Number(r.adults) || 0,
          children: Number(r.children) || 0,
          child_ages: r.childAges || [],
        })),
        hotel_category: customHotelCategory,
        meal_plan: customMealPlan,
        vehicle_type: customVehicleType,
        special_requests: customSpecialNotes.trim(),
      },
      source: 'create_our_itinerary_section',
      custom_booking_id: generatedRefId,
      created_at: new Date().toISOString(),
    };

    try {
      // 1. Submit to customizeBooking endpoint (syncs to CRM Pipeline 6 + backend customize)
      await customizeBooking(payload).catch((err) => {
        console.warn('customizeBooking warning:', err);
      });

      // 2. Also submit to trip-inquiries for direct appearance in Admin Panel Trip Inquiries
      try {
        await axios.post('/api/trip-inquiries', {
          customer: payload.customer,
          trip: {
            ...payload.trip,
            notes: `Package: ${payload.trip.package_name} | Stay: ${customHotelCategory} | Meals: ${customMealPlan} | Cab: ${customVehicleType}${customSpecialNotes ? ` | Notes: ${customSpecialNotes}` : ''}`,
          },
          source: 'Create Our Itinerary Flow',
        }, {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (inqErr) {
        console.warn('Trip inquiry submission warning:', inqErr);
      }

      setCustomItineraryRefId(generatedRefId);
      setCustomItinerarySubmitted(true);
      setCustomItinerarySubmitting(false);
    } catch (err) {
      console.error('Error creating custom itinerary:', err);
      setCustomItineraryRefId(generatedRefId);
      setCustomItinerarySubmitted(true);
      setCustomItinerarySubmitting(false);
    }
  };

  const scrollExcluded = (dir) => {
    if (!excludedScrollRef.current) return;
    const el = excludedScrollRef.current;
    const card = el.querySelector('.itn-exc-card');
    const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
    const scrollAmount = card ? (card.offsetWidth + (isMobileView ? 14 : 18)) : (isMobileView ? 284 : 328);
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (dir > 0 && el.scrollLeft >= maxScroll - 10) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (dir < 0 && el.scrollLeft <= 10) {
      el.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollBlogs = (dir) => {
    if (!blogsScrollRef.current) return;
    const el = blogsScrollRef.current;
    const card = el.querySelector('.itn-blog-card');
    const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
    const scrollAmount = card ? (card.offsetWidth + (isMobileView ? 14 : 20)) : (isMobileView ? 290 : 330);
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (dir > 0 && el.scrollLeft >= maxScroll - 10) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (dir < 0 && el.scrollLeft <= 10) {
      el.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollAddons = (dir) => {
    if (!addonsScrollRef.current) return;
    const el = addonsScrollRef.current;
    const card = el.querySelector('.itn-addon-card');
    const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
    const scrollAmount = card ? (card.offsetWidth + (isMobileView ? 14 : 18)) : (isMobileView ? 284 : 328);
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (dir > 0 && el.scrollLeft >= maxScroll - 10) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (dir < 0 && el.scrollLeft <= 10) {
      el.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollSimilar = (dir) => {
    if (!similarScrollRef.current) return;
    const el = similarScrollRef.current;
    const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
    const scrollAmount = isMobileView ? (el.offsetWidth - 20) : 324;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (dir > 0 && el.scrollLeft >= maxScroll - 10) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (dir < 0 && el.scrollLeft <= 10) {
      el.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };
  const handleSimilarScroll = () => {
    if (!similarScrollRef.current) return;
    const el = similarScrollRef.current;
    const slide = el.querySelector('.itn-deals-slide') || el.querySelector('.itn-deals-card');
    const width = slide ? slide.offsetWidth : (el.clientWidth || 1);
    if (width > 0) {
      const idx = Math.round(el.scrollLeft / width);
      setSimilarActiveIndex(Math.max(0, Math.min(displaySimilarPackages.length - 1, idx)));
    }
  };
  const descRef = useRef(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [canExpandDesc, setCanExpandDesc] = useState(false);
  const [selectedAddonHotelIds, setSelectedAddonHotelIds] = useState([]);
  const [excludedActiveTab, setExcludedActiveTab] = useState('hotels');
  const [selectedAddonTransportIds, setSelectedAddonTransportIds] = useState([]);
  const [selectedAddonActivityIds, setSelectedAddonActivityIds] = useState([]);
  const [videoReviewsData, setVideoReviewsData] = useState(null);

  useEffect(() => {
    let mounted = true;
    getHomePage()
      .then((data) => {
        if (!mounted || !data?.details) return;
        const vr = data.details.find((d) => d.key === 'video_reviews' || d.key === 'social_media');
        if (vr) setVideoReviewsData(vr);
      })
      .catch(() => { });
    return () => {
      mounted = false;
    };
  }, []);

  const [activeNavSection, setActiveNavSection] = useState('itinerary-overview');
  const [isNavVisible, setIsNavVisible] = useState(false);
  const floatingNavItemsRef = useRef(null);
  const isNavUserInteractingRef = useRef(false);
  const navInteractionTimeoutRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticScrollTimerRef = useRef(null);

  // Auto-scroll the navbar horizontally to center/bring into view the active section button
  useEffect(() => {
    if (!floatingNavItemsRef.current) return;
    if (isNavUserInteractingRef.current) return;
    const container = floatingNavItemsRef.current;
    const activeBtn = container.querySelector(`[data-nav-id="${activeNavSection}"]`)
      || document.getElementById(`itn-pill-${activeNavSection}`);
    if (activeBtn) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      const relativeLeft = btnRect.left - containerRect.left + container.scrollLeft;
      const targetScrollLeft = relativeLeft - (container.clientWidth / 2) + (activeBtn.offsetWidth / 2);
      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth',
      });
    }
  }, [activeNavSection]);

  // Mouse drag-to-scroll on desktop & touch emulation for floating nav items
  useEffect(() => {
    const el = floatingNavItemsRef.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    const onMouseDown = (e) => {
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollStart = el.scrollLeft;
      isNavUserInteractingRef.current = true;
      if (navInteractionTimeoutRef.current) clearTimeout(navInteractionTimeoutRef.current);
    };
    const onMouseLeave = () => {
      if (isDown) {
        isDown = false;
        navInteractionTimeoutRef.current = setTimeout(() => {
          isNavUserInteractingRef.current = false;
        }, 800);
      }
    };
    const onMouseUp = () => {
      if (isDown) {
        isDown = false;
        navInteractionTimeoutRef.current = setTimeout(() => {
          isNavUserInteractingRef.current = false;
        }, 800);
      }
    };
    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollStart - walk;
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const scrollToNavSection = (sectionId) => {
    setActiveNavSection(sectionId);
    isProgrammaticScrollRef.current = true;
    if (programmaticScrollTimerRef.current) {
      clearTimeout(programmaticScrollTimerRef.current);
    }

    let target = document.getElementById(sectionId);
    if (!target) {
      if (sectionId === 'itinerary-tour-highlights') target = document.getElementById('itinerary-day-wise');
      else if (sectionId === 'itinerary-excluded-items') target = document.getElementById('itinerary-excluded-items') || document.getElementById('itinerary-day-wise');
      else if (sectionId === 'itinerary-create-itinerary') target = document.getElementById('itinerary-create-itinerary') || document.getElementById('itinerary-addons');
      else if (sectionId === 'itinerary-addons') target = document.getElementById('itinerary-inclusions-exclusions') || document.getElementById('itinerary-cancellation-policy') || document.getElementById('itinerary-day-wise');
      else if (sectionId === 'itinerary-inclusions-exclusions') target = document.getElementById('itinerary-cancellation-policy') || document.getElementById('itinerary-blogs-articles') || document.getElementById('itinerary-day-wise');
      else if (sectionId === 'itinerary-cancellation-policy') target = document.getElementById('itinerary-inclusions-exclusions') || document.getElementById('itinerary-day-wise');
      else if (sectionId === 'itinerary-blogs-articles') target = document.getElementById('itinerary-cancellation-policy') || document.getElementById('itinerary-inclusions-exclusions') || document.getElementById('itinerary-day-wise');
    }
    if (target) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      const topOffset = isMobile ? 142 : 140;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }

    // Keep active selection locked on the clicked section during smooth scroll animation
    programmaticScrollTimerRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 850);
  };

  useEffect(() => {
    const handleScrollSpyAndVisibility = () => {
      const headerEl = document.getElementById('itinerary-overview');
      const blogsEl = document.getElementById('itinerary-blogs-articles')
        || document.getElementById('itinerary-inclusions-exclusions')
        || document.querySelector('.itn-main-col');

      // 1. Visibility window:
      if (headerEl) {
        const headerRect = headerEl.getBoundingClientRect();
        const hasReachedHeader = headerRect.top <= 140;

        const similarHeadingEl = document.getElementById('itinerary-similar-heading')
          || document.getElementById('itinerary-similar-packages')
          || document.querySelector('.itn-similar-deals-section h2')
          || document.querySelector('.itn-similar-deals-section');

        let hasReachedSimilar = false;
        if (similarHeadingEl) {
          const similarRect = similarHeadingEl.getBoundingClientRect();
          const threshold = Math.min(420, window.innerHeight * 0.5);
          hasReachedSimilar = similarRect.top <= threshold;
        } else {
          const fallbackEl = document.getElementById('itinerary-gram-section')
            || document.querySelector('.itn-reviews-grid')
            || blogsEl;
          if (fallbackEl) {
            const fallbackRect = fallbackEl.getBoundingClientRect();
            const threshold = Math.min(420, window.innerHeight * 0.5);
            hasReachedSimilar = fallbackEl.id === 'itinerary-blogs-articles'
              ? fallbackRect.bottom <= 120
              : fallbackRect.top <= threshold;
          }
        }

        setIsNavVisible(hasReachedHeader && !hasReachedSimilar);
      } else {
        setIsNavVisible(false);
      }

      // 2. Active Section ScrollSpy: only update activeNavSection if user is manually scrolling
      if (!isProgrammaticScrollRef.current) {
        const checkPosition = window.scrollY + Math.min(220, window.innerHeight * 0.35);
        const sectionIds = [
          'itinerary-overview',
          'itinerary-tour-highlights',
          'itinerary-day-wise',
          'itinerary-excluded-items',
          'itinerary-create-itinerary',
          'itinerary-addons',
          'itinerary-inclusions-exclusions',
          'itinerary-cancellation-policy',
          'itinerary-blogs-articles',
        ];

        for (let i = sectionIds.length - 1; i >= 0; i--) {
          const id = sectionIds[i];
          const el = document.getElementById(id);
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY;
            if (checkPosition >= top) {
              setActiveNavSection(id);
              break;
            }
          }
        }
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScrollSpyAndVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleUserInterrupt = () => {
      if (isProgrammaticScrollRef.current) {
        isProgrammaticScrollRef.current = false;
        if (programmaticScrollTimerRef.current) {
          clearTimeout(programmaticScrollTimerRef.current);
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('wheel', handleUserInterrupt, { passive: true });
    window.addEventListener('touchmove', handleUserInterrupt, { passive: true });
    handleScrollSpyAndVisibility();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', handleUserInterrupt);
      window.removeEventListener('touchmove', handleUserInterrupt);
      if (programmaticScrollTimerRef.current) {
        clearTimeout(programmaticScrollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsDescExpanded(false);
    setSelectedAddonHotelIds([]);
  }, [resolvedSlug]);

  useEffect(() => {
    if (descRef.current) {
      const el = descRef.current;
      const hasOverflow = el.scrollHeight > el.clientHeight + 4;
      setCanExpandDesc(hasOverflow || (pkg?.description && pkg.description.length > 250));
    } else if (pkg?.description && pkg.description.length > 250) {
      setCanExpandDesc(true);
    }
  }, [pkg?.description]);

  useEffect(() => {
    let mounted = true;

    const loadPackage = async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
      }
      setError('');

      const packageData = await getPackageBySlug(resolvedSlug);

      if (!mounted) return;

      if (!packageData) {
        setError('Unable to load this itinerary right now.');
        setPkg(null);
      } else {
        setPkg(packageData);
      }

      setLoading(false);
    };

    loadPackage();

    const refetchFreshPackage = () => {
      if (document.visibilityState === 'visible') {
        loadPackage({ silent: true });
      }
    };

    window.addEventListener('focus', refetchFreshPackage);
    window.addEventListener('pageshow', refetchFreshPackage);
    document.addEventListener('visibilitychange', refetchFreshPackage);

    return () => {
      mounted = false;
      window.removeEventListener('focus', refetchFreshPackage);
      window.removeEventListener('pageshow', refetchFreshPackage);
      document.removeEventListener('visibilitychange', refetchFreshPackage);
    };
  }, [resolvedSlug]);

  useEffect(() => {
    let mounted = true;

    const loadPartialBookingSettings = async () => {
      const settings = await getPartialBookingSettings();

      if (mounted) {
        setPartialBooking(settings);
      }
    };

    loadPartialBookingSettings();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadCompanyInfo = async () => {
      try {
        const response = await fetch('/api/company-info', {
          headers: { accept: 'application/json' },
          cache: 'no-store',
        });
        const payload = await response.json();

        if (mounted && payload?.success) {
          setCompany(payload.data);
        }
      } catch (err) {
        console.warn('Company info unavailable:', err);
      }
    };

    loadCompanyInfo();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const packageId = packageIdFromQuery || pkg?.id;
    const packageReviewSlug = pkg?.slug || (!packageIdFromQuery ? resolvedSlug : '');

    if (!packageId && !packageReviewSlug) {
      return undefined;
    }

    let mounted = true;

    const loadPackageReviews = async () => {
      setReviewsLoading(true);

      const result = await getPackageReviews({
        packageId,
        packageSlug: packageId ? undefined : packageReviewSlug,
        status: 'approved',
      });

      if (!mounted) return;

      setReviews(result.reviews || []);
      setReviewSummary(result.summary || { count: 0, average_rating: 0 });
      setReviewsLoading(false);
    };

    loadPackageReviews();

    return () => {
      mounted = false;
    };
  }, [pkg?.id, pkg?.slug, packageIdFromQuery, resolvedSlug]);

  // Load Dynamic Reviews from CMS (/api/v1/pages/slug/reviews)
  useEffect(() => {
    let mounted = true;
    const loadCmsReviews = async () => {
      try {
        const res = await getCmsReviews();
        if (mounted && Array.isArray(res) && res.length > 0) {
          setCmsReviews(res);
          return;
        }
        const reviewsPage = await getPageBySlug('reviews');
        const details = Array.isArray(reviewsPage?.details) ? reviewsPage.details : [];
        const tabsSec = details.find(
          (item) => item.section === 'tabs_section' || item.key === 'hero_key' || item.json_data?.tabs
        );
        let tabs = tabsSec?.json_data?.tabs;
        if (typeof tabsSec?.json_data === 'string') {
          try {
            tabs = JSON.parse(tabsSec.json_data)?.tabs;
          } catch {}
        }
        if (mounted && Array.isArray(tabs) && tabs.length > 0) {
          setCmsReviews(tabs);
        }
      } catch (err) {
        console.warn('Failed to load CMS reviews in TourItineraryView:', err);
      }
    };
    loadCmsReviews();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadBlogsData = async () => {
      try {
        setBlogsLoading(true);
        const res = await getBlogs({ page: 1, limit: 100 });
        if (!mounted) return;
        const items = Array.isArray(res?.data) ? res.data : [];
        setAllBlogs(items);
      } catch (err) {
        console.error('Error fetching blogs for package itinerary:', err);
      } finally {
        if (mounted) setBlogsLoading(false);
      }
    };

    loadBlogsData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!pkg) return;
    const draft = readPackageBookingDraft();
    if (!draft) return;

    const matchesPackage =
      String(draft.package_id || '') === String(pkg?.id || '') ||
      draft.package_slug === pkg?.slug ||
      draft.package_slug === resolvedSlug;

    if (!matchesPackage) return;

    if (draft.status === 'payment_verified' && draft.razorpay_payment_id) {
      setVerifiedBooking(draft);
      setBookingModalOpen(true);
      setPaymentMessage(`Payment verified (ID: ${draft.razorpay_payment_id}). Please sign in to finalize booking.`);
      setPaymentError('Your login session expired. Please sign in below to finish creating your booking confirmation.');
      if (draft.customer?.email) {
        setRecoveryEmail(draft.customer.email);
      }
      return;
    }

    if (draft.status === 'login_required' && hasLoggedInUser()) {
      if (draft.customer) {
        setBookingForm((prev) => ({
          ...prev,
          name: draft.customer.name || prev.name,
          email: draft.customer.email || prev.email,
          phone: draft.customer.phone || prev.phone,
          notes: draft.notes || prev.notes,
          couponCode: draft.coupon_code || prev.couponCode,
        }));
      }
      if (draft.traveller_count) {
        setTravellerCount(draft.traveller_count);
      }
      setBookingModalOpen(true);
      clearPackageBookingDraft();
    }
  }, [pkg, resolvedSlug]);

  // Load and match CMS Page data by same slug or package heading name for Route Map
  useEffect(() => {
    let mounted = true;

    const loadCmsMap = async () => {
      try {
        const targetSlug = String(pkg?.slug || resolvedSlug || '').trim();
        const targetTitle = String(pkg?.name || pkg?.title || '').trim().toLowerCase();
        if (!targetSlug && !targetTitle) return;

        // 1. Fetch CMS page by package slug
        let pageData = null;
        if (targetSlug) {
          pageData = await getPageBySlug(targetSlug);
        }

        // 2. If not found by slug, try slugified package heading name
        if (!pageData && targetTitle) {
          const titleSlug = targetTitle.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          if (titleSlug && titleSlug !== targetSlug.toLowerCase()) {
            pageData = await getPageBySlug(titleSlug);
          }
        }

        if (!mounted || !pageData) {
          if (mounted) {
            setCmsMapData(null);
            setCmsPageData(null);
          }
          return;
        }

        // Validate match: same slug OR same heading name of package
        const pageSlug = String(pageData.slug || '').trim().toLowerCase();
        const pageTitle = String(pageData.title || '').trim().toLowerCase();
        const slugClean = targetSlug.toLowerCase();
        const isSlugMatch = Boolean(slugClean && (pageSlug === slugClean || pageSlug.includes(slugClean) || slugClean.includes(pageSlug)));
        const isTitleMatch = Boolean(targetTitle && (pageTitle === targetTitle || pageTitle.includes(targetTitle) || targetTitle.includes(pageTitle)));

        if (!isSlugMatch && !isTitleMatch) {
          if (mounted) {
            setCmsMapData(null);
            setCmsPageData(null);
          }
          return;
        }

        // Extract package_map section from page details
        const details = Array.isArray(pageData.details) ? pageData.details : [];
        const mapDetail = details.find(
          (d) => d.key === 'package_map' || d.section === 'image_text' || d.key?.includes('map')
        );

        if (mapDetail) {
          let jsonData = mapDetail.json_data;
          if (typeof jsonData === 'string') {
            try {
              jsonData = JSON.parse(jsonData);
            } catch {
              jsonData = {};
            }
          }

          const rawMedia = jsonData?.media_url || mapDetail.image || mapDetail.media_url || pageData.feature_image;
          const mediaUrl = rawMedia ? getMediaUrl(rawMedia) : null;
          const rawPoints = Array.isArray(jsonData?.points) ? jsonData.points : [];
          const parsedStops = rawPoints.map(parseCmsMapPoint).filter(Boolean);

          const rawTitle = String(mapDetail.title || jsonData?.heading_content || '').trim();
          const isTripItinerary = /^trip\s*itin/i.test(rawTitle);
          const dynamicMapTitle = (rawTitle && !isTripItinerary) ? rawTitle : 'Tour Map';

          if (mounted) {
            setCmsPageData(pageData);
            setCmsMapData({
              pageId: pageData.id,
              pageTitle: pageData.title,
              destinationName: pageData.title?.split(/—|-|\|/)[0]?.trim() || null,
              title: dynamicMapTitle,
              mapTitle: dynamicMapTitle,
              mediaUrl,
              stops: parsedStops.length > 0 ? parsedStops : null,
              rawDetail: mapDetail,
            });
          }
        } else if (mounted) {
          setCmsPageData(pageData);
          setCmsMapData(null);
        }
      } catch (err) {
        console.warn('Unable to load CMS map data:', err);
        if (mounted) {
          setCmsMapData(null);
          setCmsPageData(null);
        }
      }
    };

    loadCmsMap();

    return () => {
      mounted = false;
    };
  }, [pkg, resolvedSlug]);

  useEffect(() => {
    let mounted = true;
    getCancellationPolicy().then((data) => {
      if (mounted && data) {
        setCancellationPolicyData(data);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Disable background scrolling whenever any popup modal is open, and restore cleanly on close
  useEffect(() => {
    const isAnyModalOpen = Boolean(
      bookingModalOpen ||
      routeModalOpen ||
      mediaOpen ||
      allReviewsModalOpen ||
      cancellationModalOpen ||
      customModalOpen
    );

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      if (typeof document !== 'undefined') {
        if (document.body) {
          document.body.style.overflow = '';
          document.body.style.touchAction = '';
        }
        if (document.documentElement) {
          document.documentElement.style.overflow = '';
        }
      }
    }

    return () => {
      if (typeof document !== 'undefined') {
        if (document.body) {
          document.body.style.overflow = '';
          document.body.style.touchAction = '';
        }
        if (document.documentElement) {
          document.documentElement.style.overflow = '';
        }
      }
    };
  }, [bookingModalOpen, routeModalOpen, mediaOpen, allReviewsModalOpen, cancellationModalOpen, customModalOpen]);

  useEffect(() => {
    let mounted = true;

    const loadSimilar = async () => {
      try {
        const res = await getPackages({ limit: 12 });
        if (!mounted) return;
        if (Array.isArray(res) && res.length > 0) {
          const filtered = res
            .filter((p) => p.slug !== resolvedSlug && p.id !== pkg?.id)
            .map((p) => {
              const tour = normalizePackageToTour(p);
              const duration = Number(tour.duration_days || tour.duration) || (tour.nights ? tour.nights + 1 : 6);
              const nights = Number(tour.nights) || (duration > 1 ? duration - 1 : 1);
              const price = Number(tour.price) > 0 ? Number(tour.price) : (duration * 4500 || 28500);
              const originalPrice = tour.originalPrice || Math.round(price * 1.25);
              const loc = tour.location || p.destinations?.[0]?.destination?.name || p.country || 'India';
              return {
                ...tour,
                duration,
                nights,
                price,
                originalPrice,
                location: loc,
                rating: Number(tour.rating) || 4.8,
                reviews: Number(tour.reviews) || 48,
                type: tour.type && tour.type !== 'package' ? tour.type : 'Hot Deal',
                highlights: Array.isArray(tour.highlights) && tour.highlights.length > 0
                  ? tour.highlights
                  : ['Scenic Sightseeing', 'Comfortable Transfers', 'Premium Stays'],
                icons: Array.isArray(tour.icons) && tour.icons.length > 0
                  ? tour.icons
                  : [{ icon: 'airplane' }, { icon: 'building' }, { icon: 'car-front' }, { icon: 'camera' }],
              };
            });
          setSimilarPackages(filtered);
        }
      } catch (e) {
        console.warn('Similar packages load failed', e);
      }
    };

    loadSimilar();

    return () => {
      mounted = false;
    };
  }, [resolvedSlug, pkg?.id]);

  useEffect(() => {
    if (!bookingResult?.success) return undefined;

    const redirectTimer = window.setTimeout(() => {
      router.replace('/');
    }, 4500);

    return () => window.clearTimeout(redirectTimer);
  }, [bookingResult, router]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#booking-sidebar' && pkg) {
      const timer = setTimeout(() => {
        setBookingModalOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [pkg]);

  const media = useMemo(() => getPackageMedia(pkg), [pkg]);
  const mediaItems = useMemo(() => [...media.images, ...media.videos], [media]);
  const destinations = useMemo(() => sortByOrder(pkg?.destinations), [pkg]);

  const heroVideo = useMemo(() => {
    if (!media.videos || media.videos.length === 0) return null;
    return media.videos.find((v) => v.is_primary) || media.videos[0];
  }, [media.videos]);

  const toggleVideoMute = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsVideoMuted(nextMuted);
    }
  };

  const toggleVideoPlay = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
          .then(() => setIsVideoPlaying(true))
          .catch(() => { });
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (heroVideo && videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = isVideoMuted;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsVideoPlaying(true))
          .catch(() => {
            setIsVideoPlaying(false);
          });
      }
    }
  }, [heroVideo]);

  const itinerarySections = useMemo(() => destinations.map((item, index) => {
    const startDay = destinations.slice(0, index).reduce((total, previousItem) => {
      const entries = getActivityEntries(previousItem?.activities).filter((entry) => entry.activities.length);
      return total + Math.max(Number(previousItem?.nights) || 1, entries.length || 1);
    }, 1);
    const remainingDays = Math.max((Number(pkg?.duration_days) || 0) - startDay + 1, 1);

    return { item, startDay, remainingDays };
  }), [destinations, pkg?.duration_days]);

  const packageHotels = useMemo(() => destinations.flatMap((item, destinationIndex) => (
    getDestinationHotels(item).map((hotel, hotelIndex) => ({
      ...hotel,
      destinationName: item?.destination?.name || `Stay ${destinationIndex + 1}`,
      key: hotel?.id || `${item?.id || destinationIndex}-${hotelIndex}`,
    }))
  )), [destinations]);

  const destinationNames = destinations.map((item) => item?.destination?.name).filter(Boolean);
  const routeStart = destinationNames[0] || titleCase(destination || pkg?.name || 'Destination');
  const routeEnd = destinationNames[destinationNames.length - 1] || titleCase(destination || pkg?.name || 'Destination');
  const countryName = destinations[0]?.destination?.country || 'India';

  const routeDestinationTitle = useMemo(() => {
    if (cmsMapData?.destinationName) return cmsMapData.destinationName;
    const slugStr = String(pkg?.slug || '').toLowerCase();
    const nameStr = String(pkg?.name || '').toLowerCase();
    if (slugStr.includes('kashmir') || nameStr.includes('kashmir')) return 'Kashmir';
    if (destinationNames[0]) return destinationNames[0];
    const cleaned = String(pkg?.name || '').split(/—|-|\|/)[0].trim();
    return cleaned || countryName || 'Tour';
  }, [cmsMapData, pkg?.slug, pkg?.name, destinationNames, countryName]);

  const routeButtonLabel = useMemo(() => {
    const dynamicTitle = String(cmsMapData?.mapTitle || cmsMapData?.title || '').trim();
    if (dynamicTitle && !/^trip\s*itin/i.test(dynamicTitle)) return dynamicTitle;
    return 'Tour Map';
  }, [cmsMapData]);

  const hasRouteMap = useMemo(() => {
    const slugStr = String(pkg?.slug || '').toLowerCase();
    const nameStr = String(pkg?.name || '').toLowerCase();
    return Boolean(
      cmsMapData ||
      slugStr.includes('kashmir') ||
      nameStr.includes('kashmir') ||
      (destinations && destinations.length > 0)
    );
  }, [cmsMapData, pkg?.slug, pkg?.name, destinations]);

  const daysCount = Number(pkg?.duration_days) || 6;
  const nightsCount = Math.max(daysCount - 1, 1);

  // Dynamic Hero Section Data from CMS page (Hotels & Transport hero_key)
  const cmsHeroData = useMemo(() => {
    if (!cmsPageData?.details || !Array.isArray(cmsPageData.details)) return null;
    const heroDetail = cmsPageData.details.find(
      (d) => d.key === 'hero_key' || (d.section === 'tabs_section' && (d.key === 'hero_key' || /hotel.*transport/i.test(d.title || '')))
    );
    if (!heroDetail) return null;

    let jsonData = heroDetail.json_data;
    if (typeof jsonData === 'string') {
      try {
        jsonData = JSON.parse(jsonData);
      } catch {
        jsonData = {};
      }
    }

    return {
      title: heroDetail.title || jsonData?.heading_content || 'Hotels & Transport',
      blockDesc: jsonData?.block_desc || '',
      tabs: Array.isArray(jsonData?.tabs) ? jsonData.tabs : [],
    };
  }, [cmsPageData]);

  // Show only dynamic hotels from backend data. If none, do not show any hotels.
  const displayHotels = useMemo(() => {
    return Array.isArray(packageHotels) ? packageHotels : [];
  }, [packageHotels]);

  // Dynamic Transfers mapped from CMS hero_key. If none, returns empty array to show graceful empty state.
  const displayTransfers = useMemo(() => {
    const rawTabs = cmsHeroData?.tabs;
    if (!Array.isArray(rawTabs) || rawTabs.length === 0) return [];

    return rawTabs
      .map((tab, idx) => parseCmsTransferTab(tab, idx, pkg?.id))
      .filter(Boolean);
  }, [cmsHeroData, pkg?.id]);

  // Default active tab handling based on dynamic data availability
  useEffect(() => {
    if (displayHotels.length === 0 && displayTransfers.length > 0) {
      setExcludedActiveTab('transport');
    } else if (displayTransfers.length === 0 && displayHotels.length > 0) {
      setExcludedActiveTab('hotels');
    }
  }, [displayHotels.length, displayTransfers.length]);

  const toggleHotelAddon = (hotelId) => {
    setSelectedAddonHotelIds((prev) => {
      if (prev.includes(hotelId)) {
        return prev.filter((id) => id !== hotelId);
      }
      return [...prev, hotelId];
    });
  };

  const selectedHotels = useMemo(() => {
    return displayHotels.filter((hotel) => selectedAddonHotelIds.includes(hotel.id || hotel.key));
  }, [displayHotels, selectedAddonHotelIds]);

  const totalHotelAddonPrice = useMemo(() => {
    return selectedHotels.reduce((sum, hotel) => {
      const perNight = Number(hotel?.pricePerNight) || Number(hotel?.price) || 0;
      const nights = Number(hotel?.nights) || 1;
      const rooms = Number(hotel?.rooms) || 1;
      return sum + (perNight * nights * rooms);
    }, 0);
  }, [selectedHotels]);

  const toggleTransportAddon = (transferId) => {
    setSelectedAddonTransportIds((prev) => {
      if (prev.includes(transferId)) {
        return prev.filter((id) => id !== transferId);
      }
      return [...prev, transferId];
    });
  };

  const selectedTransfers = useMemo(() => {
    return displayTransfers.filter((t) => selectedAddonTransportIds.includes(t.id));
  }, [displayTransfers, selectedAddonTransportIds]);

  const totalTransportAddonPrice = useMemo(() => {
    return selectedTransfers.reduce((sum, t) => sum + (Number(t?.price) || 0), 0);
  }, [selectedTransfers]);

  // Dynamic Addon Section Data from CMS page (Add On's & Activities addon_key)
  const cmsAddonData = useMemo(() => {
    if (!cmsPageData?.details || !Array.isArray(cmsPageData.details)) return null;
    const addonDetail = cmsPageData.details.find(
      (d) => d.key === 'addon_key' || (d.section === 'tabs_section' && (d.key === 'addon_key' || /add\s*on|activit/i.test(d.title || '')))
    );
    if (!addonDetail) return null;

    let jsonData = addonDetail.json_data;
    if (typeof jsonData === 'string') {
      try {
        jsonData = JSON.parse(jsonData);
      } catch {
        jsonData = {};
      }
    }

    return {
      title: addonDetail.title || jsonData?.heading_content || "Add On's & Activities ✨",
      blockDesc: jsonData?.block_desc || '',
      tabs: Array.isArray(jsonData?.tabs) ? jsonData.tabs : [],
    };
  }, [cmsPageData]);

  // Dynamic Addons / Activities mapped from CMS addon_key. If none, returns empty array.
  const displayActivities = useMemo(() => {
    const rawTabs = cmsAddonData?.tabs;
    if (!Array.isArray(rawTabs) || rawTabs.length === 0) return [];

    return rawTabs
      .map((tab, idx) => parseCmsActivityTab(tab, idx, pkg?.id))
      .filter(Boolean);
  }, [cmsAddonData, pkg?.id]);

  const addonSectionTitle = useMemo(() => {
    if (displayActivities.length === 0) {
      return "Add On's & Activities ✨";
    }
    if (cmsAddonData?.title) {
      return cmsAddonData.title.replace(/\(\d+\)/, `(${displayActivities.length})`);
    }
    return `Add On's & Activities (${displayActivities.length}) ✨`;
  }, [cmsAddonData?.title, displayActivities.length]);

  const toggleActivityAddon = (actId) => {
    setSelectedAddonActivityIds((prev) => {
      if (prev.includes(actId)) {
        return prev.filter((id) => id !== actId);
      }
      return [...prev, actId];
    });
  };

  const selectedActivities = useMemo(() => {
    return displayActivities.filter((a) => selectedAddonActivityIds.includes(a.id));
  }, [displayActivities, selectedAddonActivityIds]);

  const totalActivityAddonPrice = useMemo(() => {
    return selectedActivities.reduce((sum, a) => sum + (Number(a?.price) || 0), 0);
  }, [selectedActivities]);

  const totalAllAddonsPrice = totalHotelAddonPrice + totalTransportAddonPrice + totalActivityAddonPrice;

  const packageSpecificReviews = useMemo(() => {
    const raw = (Array.isArray(pkg?.reviews) && pkg.reviews.length > 0)
      ? pkg.reviews
      : (Array.isArray(reviews) && reviews.length > 0 ? reviews : []);
    return raw.filter((r) => !r.status || r.status === 'approved' || r.status === 'published');
  }, [pkg?.reviews, reviews]);

  const reviewCount = packageSpecificReviews.length > 0
    ? packageSpecificReviews.length
    : (Number(reviewSummary?.count) || (cmsReviews.length ? cmsReviews.length : 325));
  const averageRating = packageSpecificReviews.length > 0
    ? (packageSpecificReviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / packageSpecificReviews.length)
    : (Number(reviewSummary?.average_rating) || (reviews.length ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / reviews.length : 4.8));
  const ratingLabel = averageRating ? averageRating.toFixed(1) : '4.8';

  const packageUnitAmount = Number(pkg?.price) > 0 ? Number(pkg?.price) : 19999;
  const packageBaseAmount = packageUnitAmount * travellerCount;
  const taxType = String(pkg?.tax_type || '').trim();
  const taxPercent = Math.max(0, Number(pkg?.tax_percent) || 0);

  const couponCode = bookingForm.couponCode.trim().toUpperCase();
  const validatedCouponCode = String(couponValidation?.data?.coupon?.code || '').trim().toUpperCase();
  const activeCouponData = couponValidation?.success && couponCode && validatedCouponCode === couponCode ? couponValidation.data : null;
  const activeCouponAmounts = activeCouponData?.amounts || null;
  const couponDiscountAmount = Math.max(0, Number(activeCouponAmounts?.coupon_discount_amount) || 0);
  const packageBaseAmountVal = activeCouponAmounts ? Number(activeCouponAmounts.package_base_amount) || 0 : packageBaseAmount;
  const packageBaseLabel = packageBaseAmountVal > 0 ? `₹ ${packageBaseAmountVal.toLocaleString('en-IN')}` : 'On req';
  const priceLabel = packageBaseLabel;
  const baseForTax = packageBaseAmountVal + totalAllAddonsPrice;
  const taxAmount = activeCouponAmounts
    ? Number(activeCouponAmounts.tax_amount) || 0
    : baseForTax > 0 && taxPercent > 0
      ? Math.round((baseForTax * taxPercent) / 100)
      : 0;
  const packageTotal = (activeCouponAmounts ? Number(activeCouponAmounts.package_total) || 0 : baseForTax + taxAmount) - couponDiscountAmount;
  const originalPriceLabel = (packageBaseAmount + totalAllAddonsPrice) > 0 ? `₹ ${(packageBaseAmount + totalAllAddonsPrice).toLocaleString('en-IN')}` : 'On req';
  const unitPriceLabel = `₹ ${packageUnitAmount.toLocaleString('en-IN')}`;
  const travellerLabel = `${travellerCount} ${travellerCount === 1 ? 'traveller' : 'travellers'}`;
  const taxLabel = taxPercent > 0 ? `${taxType || 'Tax'} ${formatTaxPercent(taxPercent)}%` : taxType || 'Tax';
  const taxAmountLabel = taxAmount > 0 ? `₹ ${taxAmount.toLocaleString('en-IN')}` : '₹ 0';
  const couponDiscountLabel = couponDiscountAmount > 0 ? `- ₹ ${couponDiscountAmount.toLocaleString('en-IN')}` : '₹ 0';
  const packageTotalLabel = packageTotal > 0 ? `₹ ${packageTotal.toLocaleString('en-IN')}` : 'On request';

  const partialBookingPercentage = Math.max(0, Math.min(100, Number(partialBooking?.partial_booking_percentage) || 0));
  const partialBookingEnabled = Boolean(partialBooking?.partial_booking_enabled) && partialBookingPercentage > 0 && packageTotal > 0;
  const bookingAmount = partialBookingEnabled ? Math.round((packageTotal * partialBookingPercentage) / 100) : 0;
  const bookingAmountLabel = bookingAmount > 0 ? `₹ ${bookingAmount.toLocaleString('en-IN')}` : '';
  const partialRemainingAmount = partialBookingEnabled ? Math.max(packageTotal - bookingAmount, 0) : 0;
  const partialRemainingAmountLabel = partialRemainingAmount > 0 ? `₹ ${partialRemainingAmount.toLocaleString('en-IN')}` : '₹ 0';
  const selectedPaymentMode = partialBookingEnabled && paymentMode === 'partial' ? 'partial' : 'full';
  const isPartialPayment = selectedPaymentMode === 'partial';
  const amountToPay = activeCouponAmounts?.paid_amount != null ? Number(activeCouponAmounts.paid_amount) || 0 : isPartialPayment ? bookingAmount : packageTotal;
  const amountToPayLabel = amountToPay > 0 ? `₹ ${amountToPay.toLocaleString('en-IN')}` : unitPriceLabel;
  const remainingAmount = activeCouponAmounts?.remaining_amount != null ? Math.max(Number(activeCouponAmounts.remaining_amount) || 0, 0) : Math.max(packageTotal - amountToPay, 0);
  const remainingAmountLabel = remainingAmount > 0 ? `₹ ${remainingAmount.toLocaleString('en-IN')}` : '₹ 0';
  const duePercentLabel = isPartialPayment ? `${partialBookingPercentage}%` : '100%';
  const remainingPercent = isPartialPayment ? Math.max(0, 100 - partialBookingPercentage) : 0;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const loginRedirectUrl = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/tours';
  const companyName = company?.companyName || company?.legalName || company?.brandName || 'Travel Holiday';
  const contactPhone = company?.contact?.phone || company?.contact?.whatsapp || '+91 98765 43210';
  const contactPhoneClean = contactPhone.replace(/[^\d+]/g, '');
  const contactEmail = company?.contact?.email || 'hello@travelholiday.com';
  const whatsappNumber = String(company?.contact?.whatsapp || company?.contact?.phone || '').replace(/[^\d]/g, '');
  const whatsappUrl = whatsappNumber
    ? `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(`I want help with ${pkg?.name || 'tour package'}: ${currentUrl}`)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(`I want help with ${pkg?.name || 'tour package'}: ${currentUrl}`)}`;



  // Stay Included Images
  const stayImages = useMemo(() => {
    const img1 = packageHotels[0]?.image || (media.images[1] ? media.images[1].url : null) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
    const img2 = packageHotels[1]?.image || (media.images[2] ? media.images[2].url : null) || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80';
    return [img1, img2];
  }, [packageHotels, media.images]);

  const stayTierTitle = useMemo(() => {
    if (packageHotels[0]?.starRating) {
      return `${packageHotels[0].starRating}★ Hotel / Resort Stay`;
    }
    return '3★ Hotel / Resort Stay';
  }, [packageHotels]);

  // Package Icons (only if explicitly provided with non-empty icon in API)
  const packageIcons = useMemo(() => {
    let highlightsObj = pkg?.highlights;
    if (typeof highlightsObj === 'string') {
      try { highlightsObj = JSON.parse(highlightsObj); } catch { highlightsObj = null; }
    }
    const content = highlightsObj?.content;
    let list = Array.isArray(content) ? content : [];
    if (typeof content === 'string') {
      try { list = JSON.parse(content); } catch { list = []; }
    }
    const valid = list.filter((item) => {
      const raw = typeof item === 'string' ? item : item?.icon;
      return typeof raw === 'string' && raw.trim().length > 0;
    });
    if (valid.length > 0) {
      return valid.map((item) => (typeof item === 'string' ? { icon: item.trim() } : { ...item, icon: item.icon.trim() }));
    }
    const tripHl = highlightsObj?.trip_highlights;
    let tripList = Array.isArray(tripHl) ? tripHl : [];
    if (typeof tripHl === 'string') {
      try { tripList = JSON.parse(tripHl); } catch { tripList = []; }
    }
    const validTrip = tripList.filter((item) => {
      const raw = typeof item === 'string' ? item : item?.icon;
      return typeof raw === 'string' && raw.trim().length > 0;
    });
    if (validTrip.length > 0) {
      return validTrip.map((item) => (typeof item === 'string' ? { icon: item.trim() } : { ...item, icon: item.icon.trim() }));
    }
    if (Array.isArray(pkg?.icons)) {
      return pkg.icons.filter((item) => {
        const raw = typeof item === 'string' ? item : item?.icon;
        return typeof raw === 'string' && raw.trim().length > 0;
      }).map((item) => (typeof item === 'string' ? { icon: item.trim() } : { ...item, icon: item.icon.trim() }));
    }
    return [];
  }, [pkg]);

  // Tour Highlights (Image 1 format)
  const tourHighlightsList = useMemo(() => {
    let highlightsObj = pkg?.highlights;
    if (typeof highlightsObj === 'string') {
      try { highlightsObj = JSON.parse(highlightsObj); } catch { highlightsObj = null; }
    }
    // 1. Check highlights.content first (where descriptions are stored)
    if (Array.isArray(highlightsObj?.content) && highlightsObj.content.length > 0) {
      const list = highlightsObj.content
        .map((c) => (typeof c === 'string' ? c : c.description || c.title || ''))
        .map((t) => t.trim())
        .filter((t) => t.length > 0 && !/^([a-z0-9_-]{20,})$/i.test(t));
      if (list.length > 0) return list;
    }
    // 2. Check highlights.trip_highlights
    if (Array.isArray(highlightsObj?.trip_highlights) && highlightsObj.trip_highlights.length > 0) {
      const list = highlightsObj.trip_highlights
        .map((h) => (typeof h === 'string' ? h : h.description || h.title || ''))
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      if (list.length > 0) return list;
    }
    // 3. Check inclusions
    if (Array.isArray(pkg?.inclusions) && pkg.inclusions.length > 0) {
      const list = pkg.inclusions
        .map((i) => (typeof i === 'string' ? i : i.text || ''))
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      if (list.length > 0) return list;
    }
    return [];
  }, [pkg]);

  // Dynamic Package Inclusions & Exclusions (from API response only)
  const packageInclusions = useMemo(
    () => extractInclusionExclusionItems(pkg?.inclusions || pkg?.inclusive),
    [pkg?.inclusions, pkg?.inclusive]
  );
  const packageExclusions = useMemo(
    () => extractInclusionExclusionItems(pkg?.exclusions || pkg?.exclusive),
    [pkg?.exclusions, pkg?.exclusive]
  );
  const hasInclusionsOrExclusions = packageInclusions.length > 0 || packageExclusions.length > 0;

  // Dynamic Blogs & Articles matching current package context
  const relatedBlogs = useMemo(() => {
    if (!pkg) return [];

    const pkgName = String(pkg?.name || '').toLowerCase();
    const pkgDesc = stripBlogHtml(pkg?.description || '').toLowerCase();
    const destNames = (destinations || [])
      .map((d) => String(d?.name || d?.destination?.name || '').toLowerCase().trim())
      .filter((n) => n.length >= 3);
    const country = String(destinations[0]?.destination?.country || pkg?.country || '').toLowerCase().trim();

    // Pool from API and local fallback catalog
    const pool = [...allBlogs, ...blogsData];
    const seenSlugs = new Set();
    const candidateBlogs = [];
    for (const item of pool) {
      if (!item?.slug || seenSlugs.has(item.slug)) continue;
      seenSlugs.add(item.slug);
      candidateBlogs.push(item);
    }

    // Extract significant keywords from package title & description
    const rawTokens = (pkgName + ' ' + pkgDesc)
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 4);

    const stopWords = new Set([
      'this', 'that', 'with', 'from', 'tour', 'package', 'days', 'nights',
      'will', 'have', 'experience', 'discover', 'explore', 'visit', 'combo',
      'trip', 'best', 'more', 'about', 'included', 'stay', 'hotel', 'city',
      'special', 'exclusive', 'holiday', 'travel', 'travels', 'view'
    ]);
    const pkgTokens = Array.from(new Set(rawTokens.filter((t) => !stopWords.has(t))));

    // Distinct foreign countries to avoid false positive cross-country leakage
    const KNOWN_COUNTRIES = [
      'india', 'thailand', 'japan', 'italy', 'france', 'tanzania',
      'iceland', 'peru', 'australia', 'indonesia', 'spain', 'vietnam',
      'dubai', 'switzerland', 'norway', 'maldives'
    ];

    // Landscape & theme flags from package content
    const isBeachPkg = /beach|island|tropical|coastal|sea|ocean|coral|scuba|snorkeling|phuket|krabi|pattaya|bali|maldives/i.test(`${pkgName} ${pkgDesc}`);
    const isMountainPkg = /mountain|snow|himalaya|valley|hill|trek|altitude|glacier|kashmir|ladakh|manali|srinagar|gulmarg/i.test(`${pkgName} ${pkgDesc}`);
    const isDesertPkg = /desert|safari|dune|dubai|abu dhabi/i.test(`${pkgName} ${pkgDesc}`);
    const isHoneymoonPkg = /honeymoon|romantic|couple/i.test(`${pkgName} ${pkgDesc}`);

    const scoredList = candidateBlogs.map((b) => {
      let score = 0;
      const title = String(b.title || '').toLowerCase();
      const excerpt = String(b.summary || b.excerpt || stripBlogHtml(b.content || '')).toLowerCase();
      const cat = String(typeof b.category === 'object' ? b.category?.name : b.category || '').toLowerCase();
      const metaTags = String(Array.isArray(b.meta_keywords) ? b.meta_keywords.join(' ') : b.meta_keywords || '').toLowerCase();
      const fullText = `${title} ${excerpt} ${cat} ${metaTags}`;

      // Conflict guard: Discard blog if its title focuses specifically on another distinct country
      const conflictingCountry = KNOWN_COUNTRIES.find((c) => c !== country && title.includes(c));
      if (conflictingCountry) {
        return { blog: b, score: 0 };
      }

      // 1. Destination / City matches (highest relevance)
      destNames.forEach((dest) => {
        if (title.includes(dest)) score += 40;
        else if (fullText.includes(dest)) score += 20;
      });

      // 2. Country matches
      if (country && country.length >= 3) {
        if (title.includes(country)) score += 30;
        else if (fullText.includes(country)) score += 15;
      }

      // 3. Thematic / Landscape synergy
      if (isBeachPkg && /beach|island|tropical|coastal|sea|ocean|coral|tropic/i.test(fullText)) {
        score += 15;
      }
      if (isMountainPkg) {
        if (/himalaya|kashmir|srinagar|gulmarg|pahalgam|ladakh/i.test(fullText)) {
          score += 20;
        } else if (/mountain|snow|valley|hill|trek|glacier/i.test(fullText)) {
          score += 8;
        }
      }
      if (isDesertPkg && /desert|safari|dune/i.test(fullText)) {
        score += 15;
      }
      if (isHoneymoonPkg && /honeymoon|romantic/i.test(`${title} ${cat}`)) {
        score += 15;
      }

      // 4. Token overlap from package title & description
      pkgTokens.forEach((token) => {
        if (token.length >= 4) {
          if (title.includes(token)) score += 8;
          else if (excerpt.includes(token)) score += 3;
        }
      });

      return {
        blog: b,
        score,
      };
    });

    // Filter only genuinely relevant blogs (score >= 15) and take top matching blogs
    const matched = scoredList
      .filter((item) => item.score >= 15)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ blog: b }) => ({
        id: b.id || b.slug,
        title: b.title,
        slug: b.slug,
        excerpt: b.summary || b.excerpt || stripBlogHtml(b.content || '').slice(0, 130),
        category: (typeof b.category === 'object' ? b.category?.name : b.category) || 'Travel',
        date: formatBlogDate(b.published_at || b.created_at || b.date),
        author: (typeof b.author === 'object' ? b.author?.name : b.author) || 'Travel Expert',
        image: resolveBlogImage(b),
      }));

    return matched;
  }, [allBlogs, pkg, destinations, countryName]);

  // Similar Packages (Hot Deals Style)
  const displaySimilarPackages = useMemo(() => {
    if (similarPackages.length >= 4) {
      return similarPackages.slice(0, 8);
    }
    const merged = [...similarPackages];
    for (const fb of FALLBACK_SIMILAR_PACKAGES) {
      if (merged.length >= 4) break;
      if (!merged.some((m) => m.slug === fb.slug || m.id === fb.id)) {
        merged.push(fb);
      }
    }
    return merged.slice(0, 8);
  }, [similarPackages]);

  // Dynamic Reviews list for cards and popup modal
  const displayReviews = useMemo(() => {
    // 1. First priority: Real package reviews from GET /api/v1/packages/{slug} or /api/v1/package-review
    const pkgReviews = (Array.isArray(pkg?.reviews) && pkg.reviews.length > 0)
      ? pkg.reviews
      : (Array.isArray(reviews) && reviews.length > 0 ? reviews : []);

    const validPkgReviews = pkgReviews.filter(
      (r) => !r.status || r.status === 'approved' || r.status === 'published'
    );

    if (validPkgReviews.length > 0) {
      return validPkgReviews.map((r, idx) => {
        const name = (r.reviewer_name || r.name || r.customer?.name || 'Happy Traveler').trim();
        const numRating = Number(r.rating) || parseStarRating(r.badge, r.rating) || 5.0;
        const comment = cleanReviewContent(r.comment || r.content || r.title || 'An unforgettable experience with wonderful memories.');
        const avatar = r.media?.[0]?.url
          ? getMediaUrl(r.media[0].url)
          : (r.img ? getMediaUrl(r.img) : (r.avatar || null));
        return {
          ...r,
          id: r.id || `pkg-rev-${idx}`,
          name,
          title: r.title ? r.title.trim() : name,
          reviewer_name: name,
          rating: numRating,
          comment,
          content: r.comment || r.content || comment,
          badge: r.badge || '⭐'.repeat(Math.min(5, Math.max(1, Math.round(numRating)))),
          date: r.created_at ? formatReviewDate(r.created_at).replace('Reviewed on: ', '') : (r.date || 'Verified traveler'),
          avatar,
          img: r.media?.[0]?.url || r.img || null,
        };
      });
    }

    // 2. Second priority: CMS reviews from /api/v1/pages/slug/reviews if package has no reviews yet
    if (cmsReviews && cmsReviews.length > 0) {
      return cmsReviews.map((r, idx) => {
        const name = (r.title || r.name || r.reviewer_name || 'Happy Traveler').trim();
        const numRating = parseStarRating(r.badge, r.rating);
        const comment = cleanReviewContent(r.content || r.comment || 'An unforgettable experience with wonderful memories.');
        const avatar = r.img ? getMediaUrl(r.img) : null;
        return {
          ...r,
          id: r.id || `cms-rev-${idx}`,
          name,
          title: name,
          reviewer_name: name,
          rating: numRating,
          comment,
          content: r.content || comment,
          badge: r.badge || '⭐'.repeat(numRating),
          date: r.date || (idx === 0 ? '2 weeks ago' : idx === 1 ? '3 weeks ago' : '1 month ago'),
          avatar,
          img: r.img || null,
        };
      });
    }

    // 3. Fallback reviews for when both are unavailable
    return FALLBACK_REVIEWS.map((fb, i) => ({
      ...fb,
      id: `fb-rev-${i}`,
      title: fb.name,
      reviewer_name: fb.name,
      content: fb.comment,
      avatar: null,
      badge: '⭐'.repeat(Math.round(fb.rating || 5)),
    }));
  }, [pkg?.reviews, reviews, cmsReviews]);

  const packageCategoriesList = useMemo(() => {
    if (Array.isArray(pkg?.package_categories) && pkg.package_categories.length > 0) {
      return pkg.package_categories.map((c) => c.title).filter(Boolean);
    }
    return ['Family', 'Couple', 'Group'];
  }, [pkg]);

  // Booking Draft
  const bookingTravellers = [
    {
      type: 'lead',
      sequence: 1,
      name: bookingForm.name,
      email: bookingForm.email,
      phone: bookingForm.phone,
    },
    ...guestTravellers.slice(0, Math.max(travellerCount - 1, 0)).map((traveller, index) => ({
      type: 'guest',
      sequence: index + 2,
      name: traveller.name || '',
      age: traveller.age || '',
      email: traveller.email || '',
      phone: traveller.phone || '',
    })),
  ];

  const buildBookingDraft = (overrides = {}) => {
    const auth = getStoredAuth() || {};
    const finalBaseAmount = packageBaseAmountVal + totalAllAddonsPrice;

    return {
      package_id: pkg?.id || null,
      package_slug: pkg?.slug || resolvedSlug,
      package_name: pkg?.name,
      package_price: finalBaseAmount,
      package_unit_price: packageUnitAmount,
      original_package_base_amount: packageBaseAmount,
      package_base_amount: finalBaseAmount,
      hotel_addons: selectedHotels.map((h) => ({
        id: h.id || h.key,
        name: h.name,
        rooms: h.rooms || 1,
        nights: h.nights || 1,
        pricePerNight: Number(h.pricePerNight) || Number(h.price) || 0,
        totalPrice: (Number(h.pricePerNight) || Number(h.price) || 0) * (Number(h.nights) || 1) * (Number(h.rooms) || 1),
      })),
      hotel_addons_total: totalHotelAddonPrice,
      transport_addons: selectedTransfers.map((t) => ({
        id: t.id,
        title: t.title,
        route: t.route,
        price: t.price,
      })),
      transport_addons_total: totalTransportAddonPrice,
      activity_addons: selectedActivities.map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price,
      })),
      activity_addons_total: totalActivityAddonPrice,
      tax_type: taxType || null,
      tax_percent: taxPercent,
      tax_amount: taxAmount,
      package_total: packageTotal,
      duration: getDurationLabel(pkg?.duration_days),
      route: destinationNames,
      traveller_count: travellerCount,
      travelers_count: travellerCount,
      total_travellers: travellerCount,
      travelers: bookingTravellers,
      travellers: bookingTravellers,
      guest_travellers: bookingTravellers.slice(1),
      partial_booking_enabled: isPartialPayment,
      partial_booking_percentage: isPartialPayment ? partialBookingPercentage : 100,
      payable_now: amountToPay,
      remaining_amount: remainingAmount,
      remaining_percentage: remainingPercent,
      coupon_code: couponCode,
      promo_code: couponCode,
      coupon_discount_amount: couponDiscountAmount,
      coupon_validation: activeCouponData,
      notes: bookingForm.notes || '',
      customer_notes: bookingForm.notes || '',
      customer: {
        id: auth.id || auth.customer_id || auth.user_id || auth.customerId || null,
        name: bookingForm.name || auth.name || auth.full_name || '',
        email: bookingForm.email || auth.email || '',
        phone: bookingForm.phone || auth.mobile || auth.phone || '',
      },
      status: 'draft',
      page_url: currentUrl,
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  };

  const openBookingModal = () => {
    if (!hasLoggedInUser()) {
      writePackageBookingDraft(buildBookingDraft({ status: 'login_required' }));
      setLoginPromptOpen(true);
      return;
    }

    const auth = getStoredAuth() || {};
    const nextForm = {
      name: bookingForm.name || auth.name || auth.full_name || auth.firstName || '',
      email: bookingForm.email || auth.email || '',
      phone: bookingForm.phone || auth.phone || auth.mobile || '',
      couponCode: bookingForm.couponCode || '',
      notes: bookingForm.notes || '',
    };
    setBookingForm((current) => ({
      name: current.name || nextForm.name,
      email: current.email || nextForm.email,
      phone: current.phone || nextForm.phone,
      couponCode: current.couponCode || nextForm.couponCode,
      notes: current.notes || nextForm.notes,
    }));
    setPaymentMessage('');
    setPaymentError('');
    setBookingResult(null);
    setBookingModalOpen(true);
  };

  const updateBookingField = (field, value) => {
    const nextForm = { ...bookingForm, [field]: value };
    setBookingForm(nextForm);
    if (field === 'couponCode') {
      setCouponValidation(null);
      setCouponMessage('');
      setCouponError('');
    }
  };

  const updateTravellerCount = (value) => {
    const nextCount = clampTravellerCount(value);
    setCouponValidation(null);
    setCouponMessage('');
    setCouponError('');
    setTravellerCount(nextCount);
    setGuestTravellers((current) => {
      const guestCount = Math.max(nextCount - 1, 0);
      return Array.from({ length: guestCount }, (_, index) => (
        current[index] || { name: '', age: '', email: '', phone: '' }
      ));
    });
  };

  const updateGuestTraveller = (index, field, value) => {
    setGuestTravellers((current) => {
      const nextGuests = Array.from({ length: Math.max(travellerCount - 1, 0) }, (_, guestIndex) => (
        current[guestIndex] || { name: '', age: '', email: '', phone: '' }
      ));
      nextGuests[index] = {
        ...nextGuests[index],
        [field]: value,
      };
      return nextGuests;
    });
  };

  const updatePaymentMode = (mode) => {
    setPaymentMode(mode);
    setCouponValidation(null);
    setCouponMessage('');
    setCouponError('');
  };

  const validateCouponCode = async () => {
    const code = couponCode;
    if (!code) {
      setCouponValidation(null);
      setCouponMessage('');
      setCouponError('Please enter a coupon code.');
      return;
    }

    setCouponValidating(true);
    setCouponMessage('');
    setCouponError('');

    const auth = getStoredAuth() || {};
    const customerId = auth.id || auth.customer_id || auth.user_id || '';
    const payload = {
      package_id: pkg?.id || packageIdFromQuery || null,
      package_slug: pkg?.slug || resolvedSlug,
      coupon_code: code,
      coupon: { code },
      package_base_amount: packageBaseAmount,
      tax_percent: taxPercent,
      payable_now: amountToPay,
      customer: {
        id: customerId,
        email: bookingForm.email || auth.email || '',
      },
    };

    const response = await validateBookingCoupon(payload);
    setCouponValidating(false);

    if (response.success) {
      setCouponValidation(response);
      setCouponMessage(response.message || 'Coupon is valid.');
      setCouponError('');
    } else {
      setCouponValidation(null);
      setCouponMessage('');
      setCouponError(response.message || 'Coupon is not valid for this booking.');
    }
  };

  const startRazorpayPayment = async () => {
    if (!hasLoggedInUser()) {
      writePackageBookingDraft(buildBookingDraft({ status: 'login_required' }));
      setBookingModalOpen(false);
      setLoginPromptOpen(true);
      return;
    }

    if (!amountToPay || amountToPay <= 0) {
      setPaymentError('This package does not have an online payable amount. Please contact us.');
      return;
    }

    if (!bookingForm.name.trim() || !bookingForm.phone.trim()) {
      setPaymentError('Please enter your name and phone number before payment.');
      return;
    }

    setPaymentProcessing(true);
    setPaymentError('');
    setPaymentMessage('Creating payment order...');

    const auth = getStoredAuth() || {};
    const customerId = auth.id || auth.customer_id || auth.user_id || '';
    const orderResponse = await createRazorpayOrder({
      amount: amountToPay,
      currency: 'INR',
      notes: {
        package_id: String(pkg?.id || ''),
        package_name: pkg?.name,
        booking_type: selectedPaymentMode,
        booking_percentage: isPartialPayment ? String(partialBookingPercentage) : '100',
        traveller_count: String(travellerCount),
        package_total: String(packageTotal),
        hotel_addons_total: String(totalHotelAddonPrice),
        payable_now: String(amountToPay),
        coupon_code: couponCode,
        customer_name: bookingForm.name,
        customer_phone: bookingForm.phone,
        customer_id: String(customerId),
      },
    });

    if (!orderResponse.success) {
      setPaymentProcessing(false);
      setPaymentMessage('');
      setPaymentError(orderResponse.message || 'Unable to create payment order.');
      return;
    }

    try {
      const Razorpay = await loadRazorpayCheckout();
      const { order, key_id: keyId } = orderResponse.data || {};

      setPaymentMessage('Opening checkout...');

      const checkout = new Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: companyName,
        description: `${pkg?.name} booking`,
        order_id: order.id,
        prefill: {
          name: bookingForm.name,
          email: bookingForm.email,
          contact: bookingForm.phone,
        },
        notes: order.notes,
        theme: { color: '#0f766e' },
        handler: async (response) => {
          setPaymentMessage('Verifying payment...');
          const verifyResponse = await verifyRazorpayPayment(response);

          if (verifyResponse.success) {
            const verifiedPayload = buildBookingDraft({
              status: 'payment_verified',
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              payment_verified_at: new Date().toISOString(),
            });

            setVerifiedBooking(verifiedPayload);
            writePackageBookingDraft(verifiedPayload);

            setPaymentMessage('Payment verified. Creating booking record...');
            const bookingResponse = await createPackageBooking(verifiedPayload);

            if (bookingResponse.success) {
              setBookingResult(bookingResponse);
              setPaymentMessage('Booking created successfully! Redirecting...');
              setVerifiedBooking(null);
              clearPackageBookingDraft();
            } else if (bookingResponse.isAuthError || String(bookingResponse.message || '').toLowerCase().includes('token')) {
              setPaymentMessage(`Payment verified (ID: ${response.razorpay_payment_id}).`);
              setPaymentError('Your login session expired. Please sign in below to finish creating your booking confirmation without paying again.');
              setRecoveryEmail(bookingForm.email || verifiedPayload.customer?.email || '');
            } else {
              setPaymentError(bookingResponse.message || 'Booking creation failed. Please contact support.');
            }
          } else {
            setPaymentError(verifyResponse.message || 'Payment verification failed.');
          }
          setPaymentProcessing(false);
        },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
            setPaymentMessage('');
          },
        },
      });

      checkout.open();
    } catch (err) {
      setPaymentProcessing(false);
      setPaymentMessage('');
      setPaymentError(err?.message || 'Unable to open checkout.');
    }
  };

  const handleRetryFinalizeBooking = async () => {
    if (!verifiedBooking) return;
    setRecoveryLoading(true);
    setRecoveryError('');
    setPaymentMessage('Finalizing booking with verified payment...');
    setPaymentError('');

    try {
      const auth = getStoredAuth() || {};
      const total = Number(verifiedBooking.package_total) || 0;
      const tax = Number(verifiedBooking.tax_amount) || 0;
      const hotelTotal = Number(verifiedBooking.hotel_addons_total) || 0;
      let base = Number(verifiedBooking.package_base_amount) || 0;
      if (base + tax !== total) {
        if (base + hotelTotal + tax === total) {
          base = base + hotelTotal;
        } else if (total > tax) {
          base = total - tax;
        }
      }
      const payableNow = Number(verifiedBooking.payable_now) || 0;
      const remaining = Math.max(0, total - payableNow);

      const updatedPayload = {
        ...verifiedBooking,
        package_base_amount: base,
        remaining_amount: remaining,
        customer: {
          ...verifiedBooking.customer,
          id: auth.id || auth.customer_id || auth.user_id || verifiedBooking.customer?.id,
          name: verifiedBooking.customer?.name || auth.name || bookingForm.name,
          email: verifiedBooking.customer?.email || auth.email || bookingForm.email,
          phone: verifiedBooking.customer?.phone || auth.phone || bookingForm.phone,
        },
      };

      const bookingResponse = await createPackageBooking(updatedPayload);

      if (bookingResponse.success) {
        setBookingResult(bookingResponse);
        setPaymentMessage('Booking created successfully! Redirecting...');
        setVerifiedBooking(null);
        clearPackageBookingDraft();
      } else if (bookingResponse.isAuthError || String(bookingResponse.message || '').toLowerCase().includes('token')) {
        setPaymentError('Your login session is still expired. Please enter your password above to sign in.');
      } else {
        setPaymentError(bookingResponse.message || 'Unable to finalize booking. Please contact support.');
      }
    } catch (err) {
      setPaymentError(err.message || 'Unable to finalize booking.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleInlineRecoveryLogin = async () => {
    if (!recoveryPassword) {
      setRecoveryError('Please enter your account password.');
      return;
    }

    setRecoveryLoading(true);
    setRecoveryError('');
    setPaymentMessage('Signing in...');

    try {
      const res = await loginCustomer({
        email: recoveryEmail.trim(),
        password: recoveryPassword,
      });

      const token = res?.data?.token || res?.data?.user?.token;
      if (!token) {
        throw new Error(res?.message || 'Login failed. Please check credentials.');
      }

      setPaymentMessage('Login successful! Finalizing booking...');
      setPaymentError('');

      const user = res.data?.user || {};
      const total = Number(verifiedBooking.package_total) || 0;
      const tax = Number(verifiedBooking.tax_amount) || 0;
      const hotelTotal = Number(verifiedBooking.hotel_addons_total) || 0;
      let base = Number(verifiedBooking.package_base_amount) || 0;
      if (base + tax !== total) {
        if (base + hotelTotal + tax === total) {
          base = base + hotelTotal;
        } else if (total > tax) {
          base = total - tax;
        }
      }
      const payableNow = Number(verifiedBooking.payable_now) || 0;
      const remaining = Math.max(0, total - payableNow);

      const updatedPayload = {
        ...verifiedBooking,
        package_base_amount: base,
        remaining_amount: remaining,
        customer: {
          ...verifiedBooking.customer,
          id: user.id || verifiedBooking.customer?.id,
          name: verifiedBooking.customer?.name || user.name || bookingForm.name,
          email: recoveryEmail.trim() || user.email || verifiedBooking.customer?.email,
          phone: verifiedBooking.customer?.phone || user.phone || bookingForm.phone,
        },
      };

      const bookingResponse = await createPackageBooking(updatedPayload);

      if (bookingResponse.success) {
        setBookingResult(bookingResponse);
        setPaymentMessage('Booking created successfully! Redirecting...');
        setVerifiedBooking(null);
        clearPackageBookingDraft();
      } else {
        setPaymentError(bookingResponse.message || 'Booking creation failed after login. Please contact support.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your email and password.';
      setRecoveryError(msg);
      setPaymentMessage('');
    } finally {
      setRecoveryLoading(false);
    }
  };

  if (loading) {
    return <LoadingView />;
  }

  if (error || !pkg) {
    return (
      <div className="itn-page">
        <div style={{ textAlign: 'center', padding: '120px 20px' }}>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Itinerary unavailable</h1>
          <p style={{ color: '#64748b', marginBottom: 24 }}>{error || 'We could not find this package.'}</p>
          <Link href="/packages" style={{ padding: '10px 24px', background: 'var(--color-primary, #0f766e)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>
            Browse Packages
          </Link>
        </div>
        <ItineraryStyles />
      </div>
    );
  }

  const bookingResultData = bookingResult?.data || bookingResult?.booking || null;

  return (
    <div className="itn-page">
      <main className="itn-container">
        {/* Panoramic Hero Banner */}
        <div className="itn-hero-banner">
          {heroVideo ? (
            <div className="itn-hero-video-wrapper">
              <video
                ref={videoRef}
                src={heroVideo.url}
                poster={heroVideo.poster || media.images[0]?.url || fallbackImage}
                autoPlay
                muted={isVideoMuted}
                loop
                playsInline
                preload="auto"
                className="itn-hero-video"
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                onClick={toggleVideoPlay}
              />
              <div className="itn-hero-video-overlay" />
              <div className="itn-hero-video-controls">
                <button
                  type="button"
                  className="itn-hero-ctrl-btn"
                  onClick={toggleVideoPlay}
                  aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
                  title={isVideoPlaying ? 'Pause video' : 'Play video'}
                >
                  {isVideoPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1.5" />
                      <rect x="14" y="4" width="4" height="16" rx="1.5" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  className="itn-hero-ctrl-btn"
                  onClick={toggleVideoMute}
                  aria-label={isVideoMuted ? 'Unmute audio' : 'Mute audio'}
                  title={isVideoMuted ? 'Unmute audio' : 'Mute audio'}
                >
                  {isVideoMuted ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  )}
                </button>
                <div className="itn-hero-video-badge">
                  <span className="itn-hero-live-dot" />
                  <span>Featured Video</span>
                </div>
              </div>
            </div>
          ) : (
            <Image
              src={media.images[0]?.url || fallbackImage}
              alt={media.images[0]?.alt || pkg.name}
              fill
              sizes="100vw"
              priority
              style={{ objectFit: 'cover' }}
            />
          )}
        </div>

        {/* Title, Rating, Meta & Description */}
        <header className="itn-header" id="itinerary-overview">
          <div className="itn-title-row">
            <h1 className="itn-page-title">{pkg.name}</h1>

            {/* Tour Map Button (In the same row just after heading) */}
            {hasRouteMap ? (
              <div className="itn-tour-map-title-wrap">
                <button
                  type="button"
                  className="itn-view-route-btn itn-tour-map-title-btn"
                  onClick={() => setRouteModalOpen(true)}
                  aria-label={routeButtonLabel}
                  title={routeButtonLabel}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                    <line x1="9" y1="3" x2="9" y2="18" />
                    <line x1="15" y1="6" x2="15" y2="21" />
                  </svg>
                  <span>{routeButtonLabel}</span>
                </button>
              </div>
            ) : null}
          </div>
          <div
            className="itn-rating-row"
            onClick={() => {
              const el = document.getElementById('itinerary-reviews');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else if (displayReviews.length > 0) {
                setSelectedReviewIndex(0);
                setAllReviewsModalOpen(true);
              }
            }}
            style={{ cursor: 'pointer' }}
            title="Click to view traveler reviews"
          >
            <span className="itn-star-icon">★</span>
            <strong className="itn-rating-val">{ratingLabel}</strong>
            <span className="itn-review-count">({reviewCount} Reviews)</span>
          </div>
          <div className="itn-meta-chips">
            <div className="itn-meta-chip">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <span>{destinationNames.join(', ') || countryName}</span>
            </div>
            <div className="itn-meta-chip">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              <span>{nightsCount} Nights / {daysCount} Days</span>
            </div>
            <div className="itn-meta-chip">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              <span>{packageCategoriesList.join(', ')}</span>
            </div>


          </div>
          {pkg.description ? (
            <div className="itn-description-wrap">
              <p
                ref={descRef}
                className={`itn-description-text ${!isDescExpanded ? 'is-clamped' : ''}`}
              >
                {pkg.description}
              </p>
              {canExpandDesc ? (
                <button
                  type="button"
                  id="btn-read-more-description"
                  className="itn-desc-read-more-btn"
                  onClick={() => setIsDescExpanded((prev) => !prev)}
                  aria-expanded={isDescExpanded}
                >
                  <span>{isDescExpanded ? 'Read less' : 'Read more'}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: isDescExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              ) : null}
            </div>
          ) : null}
        </header>

        {/* Two-Column Layout */}
        <div className="itn-layout">
          {/* Left Column: Itinerary, Gallery, Stay, Similar Packages, Reviews */}
          <div className="itn-main-col">
            {/* Tour Highlights Section (Matches Image 1) */}
            {tourHighlightsList.length > 0 ? (
              <section className="itn-content-block" id="itinerary-tour-highlights" style={{ marginBottom: '32px', width: '100%', maxWidth: '100%' }}>
                <div className="itn-tour-highlights-card" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  <div className="itn-tour-highlights-head" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <h2 className="itn-tour-highlights-title" style={{ margin: 0 }}>Tour highlights</h2>
                  </div>
                  <ul className="itn-tour-highlights-list" style={{ width: '100%', padding: 0, margin: 0, listStyle: 'none' }}>
                    {tourHighlightsList.map((item, idx) => (
                      <li
                        key={idx}
                        className="itn-tour-highlight-item"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '18px minmax(0, 1fr)',
                          gap: '10px',
                          alignItems: 'flex-start',
                          width: '100%',
                          maxWidth: '100%',
                          minWidth: 0,
                          boxSizing: 'border-box',
                          marginBottom: idx === tourHighlightsList.length - 1 ? 0 : '12px',
                        }}
                      >
                        <svg className="itn-tour-highlight-bullseye" width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '2.5px' }}>
                          <circle cx="12" cy="12" r="8.5" stroke="#e11d48" strokeWidth="2" fill="none" />
                          <circle cx="12" cy="12" r="3" fill="#e11d48" />
                        </svg>
                        <span
                          style={{
                            display: 'block',
                            minWidth: 0,
                            width: '100%',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                          }}
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}

            {/* 1. Preserved Day-wise Itinerary */}
            <section className="itn-content-block" id="itinerary-day-wise">
              <h2 className="itn-block-title">Itinerary</h2>
              <div className="itn-itinerary-wrap">
                {itinerarySections.map(({ item, startDay, remainingDays }, index) => (
                  <div key={item?.id || item?.destination?.slug || index}>
                    <DestinationCard item={item} startDay={startDay} showTemperature={index > 0} remainingDays={remainingDays} />
                    {index < itinerarySections.length - 1 ? (
                      <TransferConnector destinationName={itinerarySections[index + 1]?.item?.destination?.name || 'next destination'} />
                    ) : null}
                  </div>
                ))}
              </div>
            </section>



            {/* 2.5 Excluded Services: [Hotels] & [Transport] */}
            <section className="itn-content-block" id="itinerary-excluded-items">
              <div className="itn-exc-header">
                <div className="itn-exc-header-top">
                  <div>
                    <h2 className="itn-block-title itn-exc-title">
                      {cmsHeroData?.title || 'Hotels & Transport'}
                    </h2>
                    <p className="itn-exc-subtitle">
                      {cmsHeroData?.blockDesc || 'Explore your stay arrangements and transfer details. Review included features or customize with verified hotels and private transport below.'}
                    </p>
                  </div>
                </div>

                {/* Segmented Toggle Bar: [Hotels] & [Transport] with Smooth Glider Animation */}
                <div className="itn-exc-toggle-wrap">
                  <div
                    className={`itn-exc-toggle-bar ${excludedActiveTab === 'transport' ? 'is-transport-active' : 'is-hotels-active'}`}
                    role="tablist"
                    aria-label="Category tabs"
                  >
                    {/* Animated Sliding Glider Pill */}
                    <span className="itn-exc-toggle-glider" aria-hidden="true" />

                    <button
                      type="button"
                      role="tab"
                      id="tab-btn-hotels"
                      aria-selected={excludedActiveTab === 'hotels'}
                      className={`itn-exc-toggle-btn itn-exc-btn-hotels ${excludedActiveTab === 'hotels' ? 'active' : ''}`}
                      onClick={() => setExcludedActiveTab('hotels')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M3 5a1 1 0 0 0-1 1v12a1 1 0 1 0 2 0v-2h16v2a1 1 0 1 0 2 0V10a3 3 0 0 0-3-3h-7V6a1 1 0 0 0-1-1H3zm3 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0h5a1 1 0 0 1 1 1v3h-6V9z" />
                      </svg>
                      <span>Hotels</span>
                    </button>

                    <button
                      type="button"
                      role="tab"
                      id="tab-btn-transport"
                      aria-selected={excludedActiveTab === 'transport'}
                      className={`itn-exc-toggle-btn itn-exc-btn-transport ${excludedActiveTab === 'transport' ? 'active' : ''}`}
                      onClick={() => setExcludedActiveTab('transport')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM7.5 16c-.83 0-1.5-.67-1.5-1.5S6.67 13 7.5 13s1.5.67 1.5 1.5S8.33 16 7.5 16zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                      </svg>
                      <span>Transport</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="itn-exc-slider-wrapper">
                <div
                  ref={excludedScrollRef}
                  className="itn-exc-grid"
                  tabIndex={0}
                  role="region"
                  aria-label="Excluded items carousel"
                >
                    {excludedActiveTab === 'hotels' ? (
                      /* Transferred Hotels Content - Dynamic Hotels Only */
                      displayHotels.length > 0 ? (
                        displayHotels.map((hotel) => {
                          const hotelId = hotel.id || hotel.key;
                          const isAdded = selectedAddonHotelIds.includes(hotelId);
                          const perNight = Number(hotel.pricePerNight) || Number(hotel.price) || 0;
                          const nights = Number(hotel.nights) || 1;
                          const rooms = Number(hotel.rooms) || 1;
                          const totalCost = perNight * nights * rooms;
                          const hotelImg = getMediaUrl(hotel.image) || (media.images[1] ? media.images[1].url : fallbackImage);
                          const badgeText = hotel.starRating ? `${hotel.starRating}★ Hotel Stay` : (hotel.roomType || 'Verified Stay');

                          return (
                            <div key={hotelId} className={`itn-exc-card ${isAdded ? 'is-added' : ''}`}>
                              <div className="itn-exc-card-img-wrap itn-exc-card-img-wrap--hotel">
                                <Image
                                  src={hotelImg}
                                  alt={hotel.name || 'Hotel'}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                  style={{ objectFit: 'cover' }}
                                  unoptimized={hotelImg.startsWith('http')}
                                />
                                <div className="itn-exc-card-img-badge">{badgeText}</div>
                              </div>

                              <div className="itn-exc-card-body">
                                <div className="itn-exc-date-pill">
                                  {nights ? `${nights} ${nights === 1 ? 'Night' : 'Nights'} Stay` : 'Verified Stay'}
                                </div>
                                <h3 className="itn-exc-card-title">{hotel.name}</h3>
                                <p className="itn-exc-card-route">
                                  {hotel.destinationName || routeDestinationTitle} • {hotel.roomType || (hotel.starRating ? `${hotel.starRating}★ Deluxe Stay` : 'Superior Room')}
                                </p>

                                <div className="itn-exc-meta-list">
                                  <div className="itn-exc-meta-item">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
                                    </svg>
                                    <span>Room: {hotel.roomType || 'Deluxe Room'}</span>
                                    <span className="itn-exc-meta-dot">•</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="10" />
                                      <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <span>{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                                  </div>

                                  {hotel.refundable ? (
                                    <div className="itn-exc-meta-item itn-exc-refundable">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="8 12 11 15 16 9" />
                                      </svg>
                                      <span>Refundable</span>
                                    </div>
                                  ) : (
                                    <div className="itn-exc-meta-item itn-exc-non-refundable">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                      </svg>
                                      <span>Non Refundable</span>
                                    </div>
                                  )}

                                  <div className="itn-exc-meta-item">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                      <circle cx="9" cy="7" r="4" />
                                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    <span>{travellerCount || 2} Guests in {rooms} {rooms === 1 ? 'Room' : 'Rooms'}</span>
                                  </div>
                                </div>

                                <div className="itn-exc-card-footer">
                                  <div className="itn-exc-price-col">
                                    <strong className="itn-exc-price">
                                      ₹ {totalCost.toLocaleString('en-IN')}
                                    </strong>
                                    {perNight && nights > 1 ? (
                                      <span className="itn-exc-per-night">₹ {perNight.toLocaleString('en-IN')} / night</span>
                                    ) : null}
                                  </div>

                                  <div className="itn-exc-actions">
                                    {isAdded ? (
                                      <div className="itn-exc-added-row">
                                        <span className="itn-exc-added-label">
                                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                          </svg>
                                          Added
                                        </span>
                                        <button
                                          type="button"
                                          className="itn-exc-trash-btn"
                                          onClick={() => toggleHotelAddon(hotelId)}
                                          title="Remove from itinerary"
                                          aria-label={`Remove ${hotel.name}`}
                                        >
                                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            <line x1="10" y1="11" x2="10" y2="17" />
                                            <line x1="14" y1="11" x2="14" y2="17" />
                                          </svg>
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        className="itn-exc-btn-add"
                                        onClick={() => toggleHotelAddon(hotelId)}
                                      >
                                        + Add to itinerary
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div
                          className="itn-exc-empty-state"
                          style={{
                            padding: '36px 20px',
                            textAlign: 'center',
                            width: '100%',
                            color: '#64748b',
                            background: '#f8fafc',
                            borderRadius: '16px',
                            border: '1px dashed #cbd5e1',
                          }}
                        >
                          <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="1.8"
                            style={{ margin: '0 auto 8px', display: 'block' }}
                          >
                            <path d="M3 5a1 1 0 0 0-1 1v12a1 1 0 1 0 2 0v-2h16v2a1 1 0 1 0 2 0V10a3 3 0 0 0-3-3h-7V6a1 1 0 0 0-1-1H3zm3 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0h5a1 1 0 0 1 1 1v3h-6V9z" />
                          </svg>
                          <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 500 }}>
                            No hotel accommodations listed for this package.
                          </p>
                        </div>
                      )
                    ) : (
                      /* Transport Content - Dynamic from hero_key */
                      displayTransfers.length > 0 ? (
                        displayTransfers.map((transfer) => {
                          const isAdded = selectedAddonTransportIds.includes(transfer.id);

                          return (
                            <div key={transfer.id} className={`itn-exc-card ${isAdded ? 'is-added' : ''}`}>
                              <div className="itn-exc-card-img-wrap itn-exc-card-img-wrap--vehicle">
                                <Image
                                  src={transfer.vehicleImg}
                                  alt={transfer.vehicleName}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                  style={{ objectFit: 'contain' }}
                                  onError={(e) => {
                                    if (e?.currentTarget) {
                                      e.currentTarget.src = '/images/transfers/ertiga_cab.jpg';
                                    }
                                  }}
                                />
                                <div className="itn-exc-card-img-badge">{transfer.vehicleName}</div>
                              </div>

                              <div className="itn-exc-card-body">
                                <div className="itn-exc-date-pill">
                                  {transfer.dateTag}
                                </div>
                                <h3 className="itn-exc-card-title">{transfer.title}</h3>
                                <p className="itn-exc-card-route">
                                  {transfer.route}
                                </p>

                                <div className="itn-exc-meta-list">
                                  <div className="itn-exc-meta-item">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <rect x="1" y="3" width="15" height="13" rx="2" />
                                      <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                                      <circle cx="5.5" cy="18.5" r="2.5" />
                                      <circle cx="18.5" cy="18.5" r="2.5" />
                                    </svg>
                                    <span>{transfer.vehicleType}</span>
                                    <span className="itn-exc-meta-dot">•</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="10" />
                                      <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <span>{transfer.duration}</span>
                                  </div>

                                  {transfer.refundable ? (
                                    <div className="itn-exc-meta-item itn-exc-refundable">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="8 12 11 15 16 9" />
                                      </svg>
                                      <span>Refundable</span>
                                    </div>
                                  ) : (
                                    <div className="itn-exc-meta-item itn-exc-non-refundable">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                      </svg>
                                      <span>Non Refundable</span>
                                    </div>
                                  )}

                                  <div className="itn-exc-meta-item">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                      <circle cx="9" cy="7" r="4" />
                                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    <span>{transfer.passengers}</span>
                                  </div>
                                </div>

                                <div className="itn-exc-card-footer">
                                  <div className="itn-exc-price-col">
                                    <strong className="itn-exc-price">
                                      ₹ {transfer.price.toLocaleString('en-IN')}
                                    </strong>
                                    <span className="itn-exc-per-night">Per vehicle</span>
                                  </div>

                                  <div className="itn-exc-actions">
                                    {isAdded ? (
                                      <div className="itn-exc-added-row">
                                        <span className="itn-exc-added-label">
                                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                          </svg>
                                          Added
                                        </span>
                                        <button
                                          type="button"
                                          className="itn-exc-trash-btn"
                                          onClick={() => toggleTransportAddon(transfer.id)}
                                          title="Remove from itinerary"
                                          aria-label={`Remove ${transfer.title}`}
                                        >
                                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            <line x1="10" y1="11" x2="10" y2="17" />
                                            <line x1="14" y1="11" x2="14" y2="17" />
                                          </svg>
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        className="itn-exc-btn-add"
                                        onClick={() => toggleTransportAddon(transfer.id)}
                                      >
                                        + Add to itinerary
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div
                          className="itn-exc-empty-state"
                          style={{
                            padding: '36px 20px',
                            textAlign: 'center',
                            width: '100%',
                            color: '#64748b',
                            background: '#f8fafc',
                            borderRadius: '16px',
                            border: '1px dashed #cbd5e1',
                          }}
                        >
                          <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="1.8"
                            style={{ margin: '0 auto 8px', display: 'block' }}
                          >
                            <rect x="1" y="3" width="15" height="13" rx="2" />
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                            <circle cx="5.5" cy="18.5" r="2.5" />
                            <circle cx="18.5" cy="18.5" r="2.5" />
                          </svg>
                          <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 500 }}>
                            No transport transfers listed for this package.
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
            </section>

            {/* Create your Itinerary Section */}
            <section className="itn-content-block itn-create-itinerary-section" id="itinerary-create-itinerary">
              <div className="itn-create-itn-header">
                <h2 className="itn-block-title itn-create-itn-title">
                  Create your Itinerary <span className="itn-addons-sparkle">✨</span>
                </h2>
                <p className="itn-create-itn-subtitle">
                  Tailor travel style, room setup, meal plans &amp; private cabs for this holiday package.
                </p>
              </div>

              <div className="itn-create-itn-body">
                <div className="itn-custom-single-pkg-card">
                  <div className="itn-custom-single-pkg-media">
                    <Image
                      src={activeCustomPkg?.image || fallbackImage}
                      alt={activeCustomPkg?.name || pkg?.name || 'Tour Package'}
                      fill
                      sizes="(max-width: 768px) 100vw, 320px"
                      style={{ objectFit: 'cover' }}
                      unoptimized={typeof activeCustomPkg?.image === 'string' && activeCustomPkg.image.startsWith('http')}
                    />
                    <div className="itn-custom-single-dur-badge">
                      {activeCustomPkg?.duration || '5N / 6D'}
                    </div>
                    <div className="itn-custom-single-selected-pill">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Selected Base Package</span>
                    </div>
                  </div>

                  <div className="itn-custom-single-pkg-info">
                    <div>
                      <div className="itn-custom-single-pkg-top">
                        <span className="itn-custom-single-pkg-dest">
                          {activeCustomPkg?.destination || destination || 'Holiday Destination'}
                        </span>
                        <span className="itn-custom-single-check-status">
                          ✓ Selected
                        </span>
                      </div>

                      <h3 className="itn-custom-single-pkg-name">
                        {activeCustomPkg?.name || pkg?.name || 'Tour Package'}
                      </h3>

                      <div className="itn-custom-single-features">
                        <span className="itn-custom-feat-pill">🏨 Stays &amp; Hotels</span>
                        <span className="itn-custom-feat-pill">🍽️ Meal Plans</span>
                        <span className="itn-custom-feat-pill">🚗 Private Transfers</span>
                        <span className="itn-custom-feat-pill">👥 Room Customization</span>
                      </div>
                    </div>

                    <div className="itn-custom-single-pkg-footer">
                      <div className="itn-custom-single-price-box">
                        <span className="itn-custom-single-price-lbl">Starting Price</span>
                        <div className="itn-custom-single-price-val">
                          <strong>₹ {(activeCustomPkg?.price || pkg?.price || 24999).toLocaleString('en-IN')}</strong>
                          <small>/ person</small>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="itn-custom-single-cta-btn"
                        onClick={() => setCustomModalOpen(true)}
                        id="btn-customize-itinerary-open"
                      >
                        <span>Customize Your Itinerary ✨</span>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Add On's & Activities */}
            <section className="itn-content-block" id="itinerary-addons">
              <div className="itn-addons-header">
                <div className="itn-addons-header-top">
                  <div>
                    <h2 className="itn-block-title itn-addons-title">
                      {addonSectionTitle}
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                      {cmsAddonData?.blockDesc || 'Enhance your trip with unforgettable local experiences and activity passes.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Single row horizontal carousel */}
              <div className="itn-addons-slider-wrapper">
                <div
                  ref={addonsScrollRef}
                  className="itn-addons-grid"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      scrollAddons(-1);
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      scrollAddons(1);
                    }
                  }}
                  role="region"
                  aria-label="Add-ons horizontal carousel"
                >
                  {displayActivities.length > 0 ? (
                    displayActivities.map((activity) => {
                      const isAdded = selectedAddonActivityIds.includes(activity.id);

                      return (
                        <div key={activity.id} className={`itn-addon-card ${isAdded ? 'is-added' : ''}`}>
                          <div className="itn-addon-img-wrap">
                            <Image
                              src={activity.image}
                              alt={activity.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              style={{ objectFit: 'cover' }}
                              unoptimized={Boolean(activity.image?.startsWith('http'))}
                              onError={(e) => {
                                if (e?.currentTarget) {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80';
                                }
                              }}
                            />
                            <div className="itn-addon-badge">{activity.badge}</div>
                          </div>

                          <div className="itn-addon-body">
                            <div className="itn-addon-tag">{activity.tag}</div>
                            <h3 className="itn-addon-name">{activity.name}</h3>
                            <div className="itn-addon-meta">
                              <span>{activity.category}</span>
                              <span className="itn-addon-dot">•</span>
                              <span>{activity.duration}</span>
                            </div>
                            {activity.notes ? (
                              <p className="itn-addon-notes" title={activity.notes}>
                                {activity.notes}
                              </p>
                            ) : null}

                            <div className="itn-addon-footer">
                              <div className="itn-addon-price-col">
                                <strong className="itn-addon-price">
                                  ₹ {activity.price.toLocaleString('en-IN')}
                                </strong>
                                <span className="itn-addon-per-night">Per person</span>
                              </div>

                              <div className="itn-addon-actions">
                                {isAdded ? (
                                  <div className="itn-addon-added-row">
                                    <span className="itn-addon-added-label">
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                      Added
                                    </span>
                                    <button
                                      type="button"
                                      className="itn-addon-trash-btn"
                                      onClick={() => toggleActivityAddon(activity.id)}
                                      title="Remove from itinerary"
                                      aria-label={`Remove ${activity.name}`}
                                    >
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        <line x1="10" y1="11" x2="10" y2="17" />
                                        <line x1="14" y1="11" x2="14" y2="17" />
                                      </svg>
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    className="itn-addon-btn-add"
                                    onClick={() => toggleActivityAddon(activity.id)}
                                  >
                                    + Add to itinerary
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      className="itn-addons-empty-state"
                      style={{
                        padding: '36px 20px',
                        textAlign: 'center',
                        width: '100%',
                        color: '#64748b',
                        background: '#f8fafc',
                        borderRadius: '16px',
                        border: '1px dashed #cbd5e1',
                      }}
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1.8"
                        style={{ margin: '0 auto 8px', display: 'block' }}
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 500 }}>
                        No add-ons or activities listed for this package.
                      </p>
                    </div>
                  )}
                </div>

                {displayActivities.length > 2 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => scrollAddons(-1)}
                      aria-label="Previous add-on"
                      className="itn-addons-side-btn itn-addons-side-btn--left"
                      title="Previous add-on"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollAddons(1)}
                      aria-label="Next add-on"
                      className="itn-addons-side-btn itn-addons-side-btn--right"
                      title="Next add-on"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </>
                ) : null}
              </div>
            </section>

            {/* Dynamic Inclusions & Exclusions Section (from API response only) */}
            {hasInclusionsOrExclusions ? (
              <section className="itn-content-block" id="itinerary-inclusions-exclusions">
                <div className="itn-inc-exc-header">
                  <h2 className="itn-block-title" style={{ marginBottom: 6 }}>Inclusions &amp; Exclusions</h2>
                  <p className="itn-inc-exc-subtitle">
                    What is covered and what is not covered in your package.
                  </p>
                </div>

                <div className="itn-inc-exc-grid">
                  {/* Inclusions Card */}
                  <div className="itn-inc-card">
                    <div className="itn-inc-card-head">
                      <div className="itn-inc-head-badge">
                        <span className="itn-inc-head-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <h3>What&apos;s Included</h3>
                      </div>
                      <span className="itn-inc-count-pill">
                        {packageInclusions.length} {packageInclusions.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {packageInclusions.length > 0 ? (
                      <ul className="itn-inc-list">
                        {packageInclusions.map((item, idx) => (
                          <li key={`inc-${idx}`} className="itn-inc-item">
                            <span className="itn-inc-bullet">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>
                            <span className="itn-inc-text">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="itn-inc-empty">No specific inclusions listed for this package.</div>
                    )}
                  </div>

                  {/* Exclusions Card */}
                  <div className="itn-exclusions-card">
                    <div className="itn-exclusions-card-head">
                      <div className="itn-exc-head-badge">
                        <span className="itn-exc-head-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </span>
                        <h3>What&apos;s Excluded</h3>
                      </div>
                      <span className="itn-exc-count-pill">
                        {packageExclusions.length} {packageExclusions.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {packageExclusions.length > 0 ? (
                      <ul className="itn-exc-list">
                        {packageExclusions.map((item, idx) => (
                          <li key={`exc-${idx}`} className="itn-exc-item">
                            <span className="itn-exc-bullet">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </span>
                            <span className="itn-exc-text">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="itn-exc-empty">No specific exclusions listed for this package.</div>
                    )}
                  </div>
                </div>
              </section>
            ) : null}

            {/* Cancellation Policy Section (Dynamic CMS Data, 3-line preview with Read More popup modal) */}
            <section className="itn-content-block" id="itinerary-cancellation-policy">
              <div className="itn-cancellation-card">
                <div className="itn-cancellation-card-head">
                  <div className="itn-cancellation-head-left">
                    <span className="itn-cancellation-icon-badge">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </span>
                    <div>
                      <h2 className="itn-block-title" style={{ margin: 0, fontSize: '20px' }}>
                        {cancellationPolicyData?.title || 'Cancellation Policy'}
                      </h2>
                      <span className="itn-cancellation-subtitle">
                        {cancellationPolicyData?.subtitle || 'Transparent terms & standard refund schedule'}
                      </span>
                    </div>
                  </div>
                  <span className="itn-cancellation-updated-pill">
                    {cancellationPolicyData?.updatedPill || 'Updated Oct 2026'}
                  </span>
                </div>

                <div className="itn-cancellation-card-body">
                  <p className="itn-cancellation-three-lines">
                    {cancellationPolicyData?.previewText || FALLBACK_CANCELLATION_DATA.previewText}
                  </p>

                  <button
                    type="button"
                    className="itn-cancellation-readmore-btn"
                    onClick={() => setCancellationModalOpen(true)}
                    aria-label="Read full cancellation policy"
                  >
                    <span>Read More</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </section>

            {/* Blogs & Articles Section (Dynamically filtered by package content) */}
            {relatedBlogs.length > 0 ? (
              <section className="itn-content-block" id="itinerary-blogs-articles">
                <div className="itn-blogs-header">
                  <div className="itn-blogs-header-left">
                    <h2 className="itn-block-title" style={{ marginBottom: 6 }}>Blogs &amp; Articles</h2>
                    <p className="itn-blogs-subtitle">
                      Curated travel guides and inspiring stories for your trip.
                    </p>
                  </div>
                  <div className="itn-blogs-header-actions">
                    <Link href="/blog" className="itn-blogs-view-all-link">
                      <span>View all articles</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                    {relatedBlogs.length > 1 ? (
                      <div className="itn-blogs-header-arrows">
                        <button
                          type="button"
                          onClick={() => scrollBlogs(-1)}
                          className="itn-blogs-arrow-btn"
                          aria-label="Previous article"
                          title="Previous article"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollBlogs(1)}
                          className="itn-blogs-arrow-btn"
                          aria-label="Next article"
                          title="Next article"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="itn-blogs-carousel-wrapper">
                  <div
                    ref={blogsScrollRef}
                    className="itn-blogs-row"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        scrollBlogs(-1);
                      } else if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        scrollBlogs(1);
                      }
                    }}
                    role="region"
                    aria-label="Blogs and articles carousel"
                  >
                    {relatedBlogs.map((b) => (
                      <Link
                        key={b.slug || b.id}
                        href={`/blog/${b.slug}`}
                        className="itn-blog-card"
                      >
                        <div className="itn-blog-img-wrap">
                          <Image
                            src={b.image}
                            alt={b.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="itn-blog-img"
                          />
                          {b.category ? (
                            <span className="itn-blog-category-badge">{b.category}</span>
                          ) : null}
                        </div>
                        <div className="itn-blog-card-body">
                          <div className="itn-blog-meta-row">
                            <span className="itn-blog-date">{b.date}</span>
                            {b.author ? (
                              <>
                                <span className="itn-blog-dot">•</span>
                                <span className="itn-blog-author">{b.author}</span>
                              </>
                            ) : null}
                          </div>
                          <h3 className="itn-blog-card-title">{b.title}</h3>
                          {b.excerpt ? (
                            <p className="itn-blog-card-excerpt">{b.excerpt}</p>
                          ) : null}
                          <div className="itn-blog-card-footer">
                            <span className="itn-blog-read-more">
                              Read Article
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {relatedBlogs.length > 2 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => scrollBlogs(-1)}
                        aria-label="Previous article"
                        className="itn-blogs-side-btn itn-blogs-side-btn--left"
                        title="Previous article"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollBlogs(1)}
                        aria-label="Next article"
                        className="itn-blogs-side-btn itn-blogs-side-btn--right"
                        title="Next article"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </>
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>

          {/* Right Column: Sticky Sidebar (ends here, unlocks right after Inclusions & Exclusions) */}
          <aside className="itn-sidebar">
            {/* Card 1: Price & Book Now */}
            <div className="itn-sidebar-card">
              <div className="itn-side-price-row">
                <strong>{unitPriceLabel}</strong>
                <span>/ per person</span>
              </div>
              <div className="itn-side-guarantee">Best Price Guaranteed</div>

              {/* Travellers Stepper */}
              <div className="itn-side-travellers-wrap">
                <span className="itn-side-label">Travellers</span>
                <div className="itn-side-stepper">
                  <button type="button" onClick={() => updateTravellerCount(travellerCount - 1)} aria-label="Decrease">-</button>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    value={travellerCount}
                    onChange={(e) => updateTravellerCount(e.target.value)}
                    aria-label="Traveller count"
                  />
                  <button type="button" onClick={() => updateTravellerCount(travellerCount + 1)} aria-label="Increase">+</button>
                </div>
              </div>

              {partialBookingEnabled ? (
                <div className="itn-side-partial-choice">
                  <label className={isPartialPayment ? 'is-selected' : ''}>
                    <input
                      type="radio"
                      name="sidebar-payment"
                      checked={isPartialPayment}
                      onChange={() => updatePaymentMode('partial')}
                    />
                    <span>Pay {partialBookingPercentage}% now ({bookingAmountLabel})</span>
                  </label>
                  <label className={!isPartialPayment ? 'is-selected' : ''}>
                    <input
                      type="radio"
                      name="sidebar-payment"
                      checked={!isPartialPayment}
                      onChange={() => updatePaymentMode('full')}
                    />
                    <span>Pay full amount ({packageTotalLabel})</span>
                  </label>
                </div>
              ) : null}

              {totalHotelAddonPrice > 0 ? (
                <div className="itn-side-addon-pill">
                  <div className="itn-side-addon-pill-left">
                    <span className="itn-side-addon-badge">Hotel</span>
                    <span className="itn-side-addon-name">
                      {selectedHotels.map((h) => h.name).join(', ')}
                    </span>
                  </div>
                  <strong className="itn-side-addon-val">+ ₹ {totalHotelAddonPrice.toLocaleString('en-IN')}</strong>
                </div>
              ) : null}

              {totalTransportAddonPrice > 0 ? (
                <div className="itn-side-addon-pill">
                  <div className="itn-side-addon-pill-left">
                    <span className="itn-side-addon-badge">Transport</span>
                    <span className="itn-side-addon-name">
                      {selectedTransfers.map((t) => t.title).join(', ')}
                    </span>
                  </div>
                  <strong className="itn-side-addon-val">+ ₹ {totalTransportAddonPrice.toLocaleString('en-IN')}</strong>
                </div>
              ) : null}

              {totalActivityAddonPrice > 0 ? (
                <div className="itn-side-addon-pill">
                  <div className="itn-side-addon-pill-left">
                    <span className="itn-side-addon-badge">Activity</span>
                    <span className="itn-side-addon-name">
                      {selectedActivities.map((a) => a.name).join(', ')}
                    </span>
                  </div>
                  <strong className="itn-side-addon-val">+ ₹ {totalActivityAddonPrice.toLocaleString('en-IN')}</strong>
                </div>
              ) : null}

              <button
                type="button"
                className="itn-side-book-btn"
                onClick={openBookingModal}
              >
                Book Now
              </button>

              <div className="itn-side-inclusions-list">
                <div className="itn-side-inc-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <span>{nightsCount} Nights / {daysCount} Days</span>
                </div>
                <div className="itn-side-inc-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>
                  <span>Meals</span>
                </div>
                <div className="itn-side-inc-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /><line x1="9" y1="9" x2="9" y2="9.01" /><line x1="9" y1="13" x2="9" y2="13.01" /><line x1="9" y1="17" x2="9" y2="17.01" /></svg>
                  <span>Hotel</span>
                </div>
                <div className="itn-side-inc-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                  <span>Sightseeing</span>
                </div>
                <div className="itn-side-inc-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="7" cy="16" r="2" /><circle cx="17" cy="16" r="2" /><path d="M5 11l2-6h10l2 6" /></svg>
                  <span>Transport</span>
                </div>
              </div>
            </div>

            {/* Need Help? */}
            <div className="itn-sidebar-card">
              <h3 className="itn-sidebar-title">Need Help?</h3>
              <p className="itn-help-text">Our travel experts are here to help you 24x7.</p>
              <a href={`tel:${contactPhoneClean}`} className="itn-help-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                <span>{contactPhone}</span>
              </a>
              <a href={`mailto:${contactEmail}`} className="itn-help-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <span>{contactEmail}</span>
              </a>
              <button
                type="button"
                className="itn-whatsapp-quick-btn"
                onClick={() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}
              >
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </aside>
        </div>

        {/* Full-Width Centered Bottom Sections (Outside 2-Column Layout) */}
        <div className="itn-full-sections">
          {/* Similar Packages You Might Like (Hot Deals Card Style) */}
          {displaySimilarPackages.length > 0 ? (
            <section className="itn-full-block itn-similar-deals-section" id="itinerary-similar-packages">
              <div style={{ textAlign: 'center', marginBottom: 36 }}>
                <h2
                  id="itinerary-similar-heading"
                  className="theme-underline-heading"
                  style={{
                    fontFamily: '"Italiana", sans-serif',
                    fontSize: 'clamp(28px, 4vw, 36px)',
                    fontWeight: 900,
                    color: 'var(--color-text-primary, #0f172a)',
                    margin: '0 0 8px',
                  }}
                >
                  Similar Packages You Might Like
                </h2>
                <p style={{ color: 'var(--color-text-muted, #64748b)', fontSize: '15px', margin: '0 0 20px' }}>
                  Unbeatable prices for unforgettable places creates a nice, memorable rhythm!
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--color-primary-light, rgba(233, 130, 22, 0.08))',
                    border: '1px solid var(--color-secondary, #FF6000)',
                    padding: '4px 14px',
                    borderRadius: 999,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-secondary, #FF6000)' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#FF6000', letterSpacing: '0.5px' }}>
                    {displaySimilarPackages.length}+ tour packages
                  </span>
                </div>
              </div>

              {/* Cards horizontal scroll with arrow buttons matching Hot Deals */}
              <div style={{ position: 'relative' }}>
                <div
                  ref={similarScrollRef}
                  className="itn-deals-cards-wrap"
                  onScroll={handleSimilarScroll}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      scrollSimilar(-1);
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      scrollSimilar(1);
                    }
                  }}
                  style={{ outline: 'none' }}
                  role="region"
                  aria-label="Similar packages carousel"
                >
                  {displaySimilarPackages.map((simPkg) => (
                    <TourCard
                      key={simPkg.id || simPkg.slug}
                      tour={simPkg}
                      className="recent-booking-card itn-deals-card"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => scrollSimilar(-1)}
                  aria-label="Previous similar package"
                  className="th-scroll-btn-pos--left itn-deals-scroll-btn"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => scrollSimilar(1)}
                  aria-label="Next similar package"
                  className="th-scroll-btn-pos--right itn-deals-scroll-btn"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              {/* View All Packages button matching Hot Deals */}
              <div style={{ textAlign: 'center', marginTop: 36 }}>
                <Link
                  href="/packages?hideFilters=true"
                  className="btn-primary circle-btn-hover"
                  style={{ display: 'inline-flex', width: 'auto', minWidth: '160px' }}
                >
                  <svg className="circle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  View All Packages
                </Link>
              </div>
            </section>
          ) : null}

          {/* Dynamic Love From Gram Section */}
          <section className="itn-full-block" id="itinerary-gram-section" style={{ overflow: 'visible' }}>
            <GramSection videoReviewsData={videoReviewsData} inContainer={true} heading="Love From The Gram" />
          </section>

          {/* What Our Travelers Say */}
          {displayReviews.length > 0 ? (
            <section className="itn-full-block" id="itinerary-reviews">
              <h2 className="itn-block-title">What Our Travelers Say</h2>
              <div
                className="itn-reviews-grid itn-reviews-grid-full"
                style={displayReviews.length <= 2 ? { gridTemplateColumns: `repeat(${displayReviews.length}, minmax(0, 1fr))` } : undefined}
              >
                {displayReviews.slice(0, 3).map((rev, index) => (
                  <div
                    key={`review-card-${index}`}
                    className="itn-review-card"
                    onClick={() => {
                      setSelectedReviewIndex(index);
                      setAllReviewsModalOpen(true);
                    }}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
                    title="Click to view full review"
                  >
                    <div className="itn-review-header">
                      <div className="itn-review-user-info">
                        <div className="itn-review-avatar">
                          {rev.avatar || rev.img ? (
                            <img
                              src={rev.avatar || getMediaUrl(rev.img)}
                              alt={rev.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                  e.currentTarget.nextElementSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <span style={{ display: (rev.avatar || rev.img) ? 'none' : 'flex' }}>
                            {(rev.name || 'T').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <strong className="itn-review-name">{rev.name}</strong>
                      </div>
                      <div className="itn-review-rating">
                        <span>★</span>
                        <strong>{Number(rev.rating).toFixed(1)}</strong>
                      </div>
                    </div>
                    {rev.title && rev.title.trim() !== rev.name ? (
                      <h4
                        className="itn-review-card-title"
                        style={{
                          margin: '8px 0 4px 0',
                          fontSize: '15px',
                          fontWeight: 600,
                          color: '#1a1a1a',
                          lineHeight: 1.35,
                        }}
                      >
                        &ldquo;{rev.title.trim()}&rdquo;
                      </h4>
                    ) : null}
                    <p className="itn-review-comment">{rev.comment}</p>
                    <div className="itn-review-date">{rev.date || 'Verified traveler'}</div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button
                  type="button"
                  className="itn-btn-outline"
                  onClick={() => {
                    setSelectedReviewIndex(0);
                    setAllReviewsModalOpen(true);
                  }}
                >
                  {displayReviews.length > 3 ? `View All ${displayReviews.length} Reviews` : 'View All Reviews'}
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </main>

      {/* Floating Sticky Navigation Bar (Matching User Screenshot with Dynamic Primary Colors) */}
      <nav
        className={`itn-floating-pill-nav ${isNavVisible ? 'is-visible' : ''}`}
        aria-label="Package section navigation"
      >
        <div
          ref={floatingNavItemsRef}
          className="itn-floating-nav-items"
          onTouchStart={() => {
            isNavUserInteractingRef.current = true;
            if (navInteractionTimeoutRef.current) clearTimeout(navInteractionTimeoutRef.current);
          }}
          onTouchEnd={() => {
            if (navInteractionTimeoutRef.current) clearTimeout(navInteractionTimeoutRef.current);
            navInteractionTimeoutRef.current = setTimeout(() => {
              isNavUserInteractingRef.current = false;
            }, 1000);
          }}
        >
          {NAV_HEADINGS.map((nav) => {
            const isActive = activeNavSection === nav.id;
            const label = nav.id === 'itinerary-cancellation-policy'
              ? (cancellationPolicyData?.title || nav.label)
              : nav.label;
            return (
              <button
                key={nav.id}
                id={`itn-pill-${nav.id}`}
                data-nav-id={nav.id}
                type="button"
                onClick={() => scrollToNavSection(nav.id)}
                className={`itn-floating-nav-btn ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="itn-floating-nav-icon">
                  {renderNavIcon(nav.icon)}
                </span>
                <span className="itn-floating-nav-label">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="itn-floating-divider" />

        <div className="itn-floating-right">
          <div className="itn-floating-price-box">
            <div className="itn-floating-price-row">
              <strong>{unitPriceLabel}</strong>
              <span> / person</span>
            </div>
            <div className="itn-floating-price-sub">Excluding Applicable Taxes</div>
          </div>

          <button
            type="button"
            className={`itn-floating-cta-btn ${activeNavSection === 'itinerary-create-itinerary' ? 'is-active' : ''}`}
            onClick={() => scrollToNavSection('itinerary-create-itinerary')}
            aria-label="Create your Itinerary"
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Create your Itinerary</span>
            </span>
          </button>
        </div>
      </nav>

      {/* Sticky Mobile Bottom Booking Bar */}
      <div className="itn-mobile-sticky-bar">
        <div className="itn-mobile-sticky-info">
          <div className="itn-mobile-sticky-price">{unitPriceLabel}</div>
          <div className="itn-mobile-sticky-sub">
            <span>per person</span>
            <span className="itn-mobile-sticky-dot">•</span>
            <span>{nightsCount}N / {daysCount}D</span>
          </div>
        </div>
        <div className="itn-mobile-sticky-actions">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="itn-mobile-sticky-wa"
              aria-label="Chat on WhatsApp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </a>
          ) : null}
          <button
            type="button"
            className="itn-mobile-sticky-book-btn"
            onClick={openBookingModal}
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Route Map Popup Modal (Matches User Mockup & Dynamic CMS Map) */}
      <RouteMapModal
        isOpen={routeModalOpen}
        onClose={() => setRouteModalOpen(false)}
        pkg={pkg}
        cmsMapData={cmsMapData}
        destinations={destinations}
        destinationNames={destinationNames}
        daysCount={daysCount}
        nightsCount={nightsCount}
        countryName={countryName}
        onSelectDay={(dayNum) => {
          setRouteModalOpen(false);
          const el = document.getElementById(`itinerary-day-${dayNum}`) || document.querySelector('.itn-itinerary-wrap');
          if (el) {
            setTimeout(() => {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 250);
          }
        }}
      />

      {/* Cancellation Policy Popup Modal */}
      <CancellationPolicyModal
        isOpen={cancellationModalOpen}
        onClose={() => setCancellationModalOpen(false)}
        policyData={cancellationPolicyData}
      />

      {/* Media Modal */}
      {mediaOpen ? (
        <div
          className="itn-media-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Package media"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMediaOpen(false);
          }}
        >
          <div className="itn-media-panel">
            <div className="itn-media-head">
              <div className="itn-media-head-left">
                <h3>All Photos & Videos</h3>
                <span className="itn-media-count-badge">
                  {mediaItems.length} {mediaItems.length === 1 ? 'photo' : 'photos'}
                </span>
              </div>
              <button
                type="button"
                className="itn-media-close-btn"
                onClick={() => setMediaOpen(false)}
                aria-label="Close media"
              >
                ✕
              </button>
            </div>
            <div className="itn-media-body">
              <div className="itn-media-grid">
                {mediaItems.map((item, idx) => (
                  <div className="itn-media-item" key={`${item.type}-${item.id || item.url}-${idx}`}>
                    <div className="itn-media-img-wrap">
                      {item.type === 'video' ? (
                        <video src={item.url} poster={item.poster || undefined} controls playsInline />
                      ) : (
                        <Image
                          src={item.url}
                          alt={item.alt || `${pkg.name} photo ${idx + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    {item.alt && item.alt !== pkg?.name ? (
                      <div className="itn-media-caption" title={item.alt}>
                        {item.alt}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Individual Review Popup Modal (Matching Home Page) */}
      <ReviewDetailModal
        isOpen={allReviewsModalOpen}
        onClose={() => setAllReviewsModalOpen(false)}
        reviews={displayReviews}
        currentIndex={selectedReviewIndex}
        onNavigate={(newIdx) => setSelectedReviewIndex(newIdx)}
      />

      {/* Create your Itinerary Custom Modal Popup */}
      {customModalOpen ? (
        <div
          className="itn-custom-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Create your Itinerary"
          onClick={(e) => {
            if (e.target === e.currentTarget && !customItinerarySubmitting) {
              setCustomModalOpen(false);
            }
          }}
        >
          <div
            className="itn-custom-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="itn-custom-modal-header">
              <div className="itn-custom-modal-head-left">
                <h3 className="itn-custom-modal-title">
                  Create your Itinerary <span className="itn-addons-sparkle">✨</span>
                </h3>
                <p className="itn-custom-modal-subtitle">
                  Package: <strong>{activeCustomPkg?.name || pkg?.name}</strong> · {activeCustomPkg?.duration || '5N / 6D'} · ₹ {(activeCustomPkg?.price || pkg?.price || 24999).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                type="button"
                className="itn-custom-modal-close"
                onClick={() => {
                  if (!customItinerarySubmitting) setCustomModalOpen(false);
                }}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="itn-custom-modal-body">
              {customItinerarySubmitted ? (
                /* Success celebration card */
                <div className="itn-custom-success-card">
                  <div className="itn-custom-success-icon">✓</div>
                  <span className="itn-custom-success-badge">INQUIRY SAVED TO ADMIN PANEL</span>
                  <h3 className="itn-custom-success-title">Your Custom Itinerary Has Been Created!</h3>
                  <p className="itn-custom-success-desc">
                    Thank you! We have received your custom package request in our admin panel. Our tour specialists are reviewing your selections and will reach out with the finalized itinerary and custom quote.
                  </p>
                  <div className="itn-custom-ref-box">
                    <span>Reference ID:</span>
                    <strong>{customItineraryRefId}</strong>
                  </div>
                  <div className="itn-custom-summary-grid">
                    <div className="itn-custom-summary-item">
                      <span>Selected Package</span>
                      <strong>{activeCustomPkg?.name || pkg?.name}</strong>
                    </div>
                    <div className="itn-custom-summary-item">
                      <span>Travel With</span>
                      <strong>{customTravelWith} ({customTotalTravellers} Pax, {customRooms.length} Room{customRooms.length > 1 ? 's' : ''})</strong>
                    </div>
                    <div className="itn-custom-summary-item">
                      <span>Duration</span>
                      <strong>{customDuration}</strong>
                    </div>
                    <div className="itn-custom-summary-item">
                      <span>Departure</span>
                      <strong>{customCustomCityInput.trim() || customDepartureCity} {customDepartureDate ? `· ${customDepartureDate}` : ''}</strong>
                    </div>
                    <div className="itn-custom-summary-item">
                      <span>Stay Category</span>
                      <strong>{customHotelCategory}</strong>
                    </div>
                    <div className="itn-custom-summary-item">
                      <span>Meal Plan</span>
                      <strong>{customMealPlan}</strong>
                    </div>
                    <div className="itn-custom-summary-item">
                      <span>Vehicle</span>
                      <strong>{customVehicleType}</strong>
                    </div>
                    <div className="itn-custom-summary-item">
                      <span>Lead Contact</span>
                      <strong>{customContactName} ({customContactPhone})</strong>
                    </div>
                  </div>
                  <div className="itn-custom-success-actions">
                    <button
                      type="button"
                      className="itn-custom-submit-btn"
                      onClick={() => setCustomModalOpen(false)}
                    >
                      Done &amp; Close
                    </button>
                    <button
                      type="button"
                      className="itn-custom-reset-btn"
                      onClick={() => {
                        setCustomItinerarySubmitted(false);
                        setCustomItineraryRefId('');
                      }}
                    >
                      Customize Another Itinerary
                    </button>
                  </div>
                </div>
              ) : (
                <div className="itn-custom-modal-steps">
                  {/* Step 1: Custom Package Style Preferences */}
                  <div className="itn-create-step-card">
                    <div className="itn-create-step-head">
                      <span className="itn-create-step-num">1</span>
                      <div>
                        <h3 className="itn-create-step-title">Customize Holiday Style &amp; Configuration</h3>
                        <p className="itn-create-step-desc">Pick who is travelling, room setup, duration, and departure.</p>
                      </div>
                    </div>

                    {/* A. Who are you travelling with? (Arched custom style) */}
                    <div className="itn-custom-field-block">
                      <label className="itn-custom-field-label">
                        <span>Who are you travelling with?</span>
                        <small className="itn-custom-selected-hint">Selected: <strong>{customTravelWith}</strong></small>
                      </label>
                      <div className="itn-custom-traveller-grid">
                        {CUSTOM_TRAVELLER_OPTIONS.map((t) => {
                          const isPicked = customTravelWith === t.name;
                          return (
                            <button
                              key={t.name}
                              type="button"
                              className={`itn-custom-traveller-card ${isPicked ? 'is-picked' : ''}`}
                              onClick={() => setCustomTravelWith(t.name)}
                            >
                              <div className="itn-custom-traveller-icon-wrap">
                                <span className="itn-custom-traveller-emoji">{t.emoji}</span>
                              </div>
                              <span className="itn-custom-traveller-title">{t.name}</span>
                              <span className="itn-custom-traveller-sub">{t.desc}</span>
                              {isPicked ? (
                                <span className="itn-custom-traveller-check-indicator">✓</span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* B. Room & Guest Setup */}
                    <div className="itn-custom-field-block">
                      <label className="itn-custom-field-label">
                        <span>Room &amp; Guest Setup</span>
                        <small className="itn-custom-selected-hint">
                          {customRooms.length} {customRooms.length === 1 ? 'Room' : 'Rooms'} · {customTotalTravellers} {customTotalTravellers === 1 ? 'Guest' : 'Guests'}
                        </small>
                      </label>
                      <div className="itn-custom-rooms-box">
                        {customRooms.map((room, rIdx) => (
                          <div key={room.id} className="itn-custom-room-row">
                            <div className="itn-custom-room-top">
                              <span className="itn-custom-room-badge">ROOM {rIdx + 1}</span>
                              {customRooms.length > 1 ? (
                                <button
                                  type="button"
                                  className="itn-custom-room-del"
                                  onClick={() => removeCustomRoom(room.id)}
                                >
                                  Remove Room
                                </button>
                              ) : null}
                            </div>
                            <div className="itn-custom-guest-steppers">
                              <div className="itn-custom-guest-col">
                                <span className="itn-custom-guest-label">Adults (12+ yrs)</span>
                                <div className="itn-custom-counter">
                                  <button
                                    type="button"
                                    onClick={() => updateCustomRoom(room.id, 'adults', Math.max(1, room.adults - 1))}
                                  >
                                    -
                                  </button>
                                  <span>{room.adults}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateCustomRoom(room.id, 'adults', room.adults + 1)}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <div className="itn-custom-guest-col">
                                <span className="itn-custom-guest-label">Children (0-11 yrs)</span>
                                <div className="itn-custom-counter">
                                  <button
                                    type="button"
                                    onClick={() => updateCustomRoom(room.id, 'children', Math.max(0, room.children - 1))}
                                  >
                                    -
                                  </button>
                                  <span>{room.children}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateCustomRoom(room.id, 'children', room.children + 1)}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                            {room.children > 0 ? (
                              <div className="itn-custom-child-ages-wrap">
                                {room.childAges.map((age, aIdx) => (
                                  <div key={aIdx} className="itn-custom-child-age-item">
                                    <span>Age of Child {aIdx + 1}:</span>
                                    <select
                                      value={age}
                                      onChange={(e) => {
                                        const newAges = [...room.childAges];
                                        newAges[aIdx] = Number(e.target.value);
                                        updateCustomRoom(room.id, 'childAges', newAges);
                                      }}
                                    >
                                      {[...Array(12)].map((_, idx) => (
                                        <option key={idx} value={idx}>{idx} {idx <= 1 ? 'yr' : 'yrs'}</option>
                                      ))}
                                    </select>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                        {customRooms.length < 4 ? (
                          <button
                            type="button"
                            className="itn-custom-add-room-btn"
                            onClick={addCustomRoom}
                          >
                            + Add Another Room
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* C. Duration & Departure Date */}
                    <div className="itn-custom-grid-row">
                      <div className="itn-custom-field-block">
                        <label className="itn-custom-field-label">Holiday Duration</label>
                        <div className="itn-custom-dur-grid">
                          {['3-4 Days', '5-6 Days', '7-8 Days', '9-15 Days'].map((d) => (
                            <button
                              key={d}
                              type="button"
                              className={`itn-custom-dur-pill ${customDuration === d ? 'active' : ''}`}
                              onClick={() => setCustomDuration(d)}
                            >
                              <span>{d}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="itn-custom-field-block">
                        <label className="itn-custom-field-label">Departure Date</label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={customDepartureDate}
                          onChange={(e) => setCustomDepartureDate(e.target.value)}
                          className="itn-custom-text-input"
                        />
                      </div>
                    </div>

                    {/* Departure City Quick Chips + Custom Input */}
                    <div className="itn-custom-field-block">
                      <label className="itn-custom-field-label">
                        <span>Departure City</span>
                        <small className="itn-custom-selected-hint">Selected: <strong>{customCustomCityInput.trim() || customDepartureCity}</strong></small>
                      </label>
                      <div className="itn-custom-city-chips">
                        {['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Hyderabad', 'Chennai', 'Ahmedabad', 'Pune'].map((city) => (
                          <button
                            key={city}
                            type="button"
                            className={`itn-custom-city-chip ${customDepartureCity === city && !customCustomCityInput ? 'active' : ''}`}
                            onClick={() => {
                              setCustomDepartureCity(city);
                              setCustomCustomCityInput('');
                              setCustomCityDropdownOpen(false);
                              setCustomCitySuggestions([]);
                            }}
                          >
                            {city}
                          </button>
                        ))}
                      </div>

                      {/* Dynamic Search Input with API Suggestions & Slug Matching */}
                      <div className="itn-custom-city-search-wrap" ref={customCityDropdownRef}>
                        <div className="itn-custom-city-input-inner">
                          <svg className="itn-custom-city-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Or search departure city (e.g. Delhi, Paris, 10 de Abril)..."
                            value={customCustomCityInput}
                            onChange={(e) => {
                              setCustomCustomCityInput(e.target.value);
                              if (e.target.value.trim().length >= 2) {
                                setCustomCityDropdownOpen(true);
                              }
                            }}
                            onFocus={() => {
                              if (customCitySuggestions.length > 0) {
                                setCustomCityDropdownOpen(true);
                              }
                            }}
                            className="itn-custom-text-input itn-custom-city-other"
                          />
                          {customCityLoading && (
                            <span className="itn-custom-city-spinner" />
                          )}
                          {!customCityLoading && customCustomCityInput && (
                            <button
                              type="button"
                              className="itn-custom-city-clear-btn"
                              onClick={() => {
                                setCustomCustomCityInput('');
                                setCustomCitySuggestions([]);
                                setCustomCityDropdownOpen(false);
                              }}
                              title="Clear search"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Suggestions Dropdown */}
                        {customCityDropdownOpen && (
                          <div className="itn-custom-city-dropdown">
                            {customCityLoading && customCitySuggestions.length === 0 ? (
                              <div className="itn-custom-city-loading-state">
                                <span className="itn-custom-city-spinner" />
                                <span>Searching cities...</span>
                              </div>
                            ) : customCitySuggestions.length > 0 ? (
                              <div className="itn-custom-city-list">
                                {customCitySuggestions.map((item) => (
                                  <button
                                    key={`${item.id || item.name}-${item.country_id || ''}`}
                                    type="button"
                                    className="itn-custom-city-item"
                                    onClick={() => handleSelectCitySuggestion(item)}
                                  >
                                    <div className="itn-custom-city-item-left">
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="itn-custom-city-pin">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                      </svg>
                                      <div className="itn-custom-city-item-text">
                                        <span className="itn-custom-city-name">{item.name}</span>
                                        {item.country_name && (
                                          <span className="itn-custom-city-country">, {item.country_name}</span>
                                        )}
                                      </div>
                                    </div>
                                    <span className="itn-custom-city-type-pill">City</span>
                                  </button>
                                ))}
                              </div>
                            ) : customCustomCityInput.trim().length >= 2 ? (
                              <div className="itn-custom-city-empty-state">
                                No cities found matching &quot;{customCustomCityInput}&quot;
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Package Style Inclusions */}
                  <div className="itn-create-step-card">
                    <div className="itn-create-step-head">
                      <span className="itn-create-step-num">2</span>
                      <div>
                        <h3 className="itn-create-step-title">Package Style &amp; Inclusions</h3>
                        <p className="itn-create-step-desc">Select hotel standard, meal plan, and transport as in the package creation form.</p>
                      </div>
                    </div>

                    <div className="itn-custom-pref-grid">
                      {/* Stay Category */}
                      <div className="itn-custom-pref-col">
                        <span className="itn-custom-pref-title">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /></svg>
                          Hotel Category
                        </span>
                        <div className="itn-custom-radio-list">
                          {[
                            { id: '3 Star Standard', label: '3★ Standard Comfort', badge: 'Budget Friendly' },
                            { id: '4 Star Deluxe', label: '4★ Deluxe Luxury', badge: 'Most Popular' },
                            { id: '5 Star Luxury', label: '5★ Premium Resort & Heritage', badge: 'VIP Experience' },
                          ].map((opt) => (
                            <label
                              key={opt.id}
                              className={`itn-custom-radio-card ${customHotelCategory === opt.id ? 'active' : ''}`}
                            >
                              <input
                                type="radio"
                                name="hotelCategory"
                                value={opt.id}
                                checked={customHotelCategory === opt.id}
                                onChange={() => setCustomHotelCategory(opt.id)}
                              />
                              <div>
                                <strong>{opt.label}</strong>
                                <small>{opt.badge}</small>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Meal Plan */}
                      <div className="itn-custom-pref-col">
                        <span className="itn-custom-pref-title">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /></svg>
                          Meal Plan
                        </span>
                        <div className="itn-custom-radio-list">
                          {[
                            { id: 'Breakfast Only (CP)', label: 'Breakfast Included (CP)', badge: 'Continental Plan' },
                            { id: 'Breakfast & Dinner (MAP)', label: 'Breakfast & Dinner (MAP)', badge: 'Recommended' },
                            { id: 'All Meals (AP)', label: 'All Meals Included (AP)', badge: 'Breakfast, Lunch & Dinner' },
                          ].map((opt) => (
                            <label
                              key={opt.id}
                              className={`itn-custom-radio-card ${customMealPlan === opt.id ? 'active' : ''}`}
                            >
                              <input
                                type="radio"
                                name="mealPlan"
                                value={opt.id}
                                checked={customMealPlan === opt.id}
                                onChange={() => setCustomMealPlan(opt.id)}
                              />
                              <div>
                                <strong>{opt.label}</strong>
                                <small>{opt.badge}</small>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Vehicle / Cab */}
                      <div className="itn-custom-pref-col">
                        <span className="itn-custom-pref-title">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="7" cy="16" r="2" /><circle cx="17" cy="16" r="2" /></svg>
                          Transport / Private Cab
                        </span>
                        <div className="itn-custom-radio-list">
                          {[
                            { id: 'Private AC Sedan (Dzire / Etios)', label: 'Private Sedan (Dzire / Etios)', badge: '1-4 Passengers' },
                            { id: 'Private AC SUV (Innova / Ertiga)', label: 'Private SUV (Innova / Ertiga)', badge: '4-6 Passengers' },
                            { id: 'Tempo Traveller (12-16 Seater)', label: 'Tempo Traveller (12-16 Seater)', badge: 'Group Travel' },
                            { id: 'No Cab / Self Drive', label: 'No Cab / Self Transfer', badge: 'Only Stays & Passes' },
                          ].map((opt) => (
                            <label
                              key={opt.id}
                              className={`itn-custom-radio-card ${customVehicleType === opt.id ? 'active' : ''}`}
                            >
                              <input
                                type="radio"
                                name="vehicleType"
                                value={opt.id}
                                checked={customVehicleType === opt.id}
                                onChange={() => setCustomVehicleType(opt.id)}
                              />
                              <div>
                                <strong>{opt.label}</strong>
                                <small>{opt.badge}</small>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Contact & Submission */}
                  <div className="itn-create-step-card">
                    <div className="itn-create-step-head">
                      <span className="itn-create-step-num">3</span>
                      <div>
                        <h3 className="itn-create-step-title">Your Details &amp; Custom Requests</h3>
                        <p className="itn-create-step-desc">Enter your contact info so the admin panel can record and send your customized quote.</p>
                      </div>
                    </div>

                    <div className="itn-custom-contact-form">
                      <div className="itn-custom-form-grid">
                        <label className="itn-custom-input-wrap">
                          <span>Full Name *</span>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rahul Sharma"
                            value={customContactName}
                            onChange={(e) => setCustomContactName(e.target.value)}
                            className="itn-custom-text-input"
                          />
                        </label>
                        <label className="itn-custom-input-wrap">
                          <span>WhatsApp / Phone Number *</span>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +91 98765 43210"
                            value={customContactPhone}
                            onChange={(e) => setCustomContactPhone(e.target.value)}
                            className="itn-custom-text-input"
                          />
                        </label>
                        <label className="itn-custom-input-wrap itn-custom-input-full">
                          <span>Email Address</span>
                          <input
                            type="email"
                            placeholder="e.g. rahul@example.com"
                            value={customContactEmail}
                            onChange={(e) => setCustomContactEmail(e.target.value)}
                            className="itn-custom-text-input"
                          />
                        </label>
                        <label className="itn-custom-input-wrap itn-custom-input-full">
                          <span>Special Requests &amp; Notes (Optional)</span>
                          <textarea
                            rows={3}
                            placeholder="e.g. Shikara boat ride timing, candlelight dinner on anniversary, river view room preference..."
                            value={customSpecialNotes}
                            onChange={(e) => setCustomSpecialNotes(e.target.value)}
                            className="itn-custom-textarea"
                          />
                        </label>
                      </div>

                      {customItineraryError ? (
                        <div className="itn-custom-error-box">
                          {customItineraryError}
                        </div>
                      ) : null}

                      {/* Live Summary Bar */}
                      <div className="itn-custom-summary-bar">
                        <div className="itn-custom-summary-content">
                          <span className="itn-custom-summary-label">Itinerary Overview:</span>
                          <div className="itn-custom-summary-pills">
                            <span className="itn-custom-sum-pill itn-custom-sum-pill-pkg">📦 {activeCustomPkg?.name || pkg?.name}</span>
                            <span className="itn-custom-sum-pill">👥 {customTravelWith}</span>
                            <span className="itn-custom-sum-pill">⏱️ {customDuration}</span>
                            <span className="itn-custom-sum-pill">🏨 {customHotelCategory}</span>
                            <span className="itn-custom-sum-pill">📍 From {customCustomCityInput.trim() || customDepartureCity}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="itn-custom-submit-btn"
                          disabled={customItinerarySubmitting}
                          onClick={handleCreateCustomItinerary}
                        >
                          {customItinerarySubmitting ? (
                            <>
                              <span className="itn-custom-spinner" />
                              <span>Sending to Admin...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit &amp; Create Itinerary ✨</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Booking Modal with Razorpay Checkout */}
      {bookingModalOpen ? (
        <div
          className="itn-booking-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Complete package booking"
          onClick={(e) => {
            if (e.target === e.currentTarget && !paymentProcessing) {
              setBookingModalOpen(false);
            }
          }}
        >
          <div
            className="itn-booking-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="itn-booking-close"
              onClick={() => {
                if (!paymentProcessing) setBookingModalOpen(false);
              }}
              aria-label="Close booking popup"
            >
              ✕
            </button>
            <div className="itn-booking-hero">
              <span>Secure package booking</span>
              <h2>{pkg.name}</h2>
              <p>{nightsCount} Nights / {daysCount} Days - {destinationNames.join(' + ') || 'Curated itinerary'}</p>
            </div>
            <section className="itn-booking-travellers">
              <div className="itn-booking-section-title">
                <span>Travellers</span>
                <strong>Book this package for yourself and friends</strong>
              </div>
              <div className="itn-traveller-count-row">
                <div>
                  <span>Total travellers</span>
                  <strong>{travellerLabel}</strong>
                  <small>{unitPriceLabel} per traveller before taxes</small>
                </div>
                <div className="itn-traveller-stepper">
                  <button type="button" onClick={() => updateTravellerCount(travellerCount - 1)} aria-label="Reduce travellers">-</button>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    value={travellerCount}
                    onChange={(event) => updateTravellerCount(event.target.value)}
                    aria-label="Total travellers"
                  />
                  <button type="button" onClick={() => updateTravellerCount(travellerCount + 1)} aria-label="Add traveller">+</button>
                </div>
              </div>
              {guestTravellers.length ? (
                <div className="itn-guest-list">
                  {guestTravellers.map((traveller, index) => (
                    <div className="itn-guest-card" key={`guest-traveller-${index}`}>
                      <strong>Traveller {index + 2}</strong>
                      <label>
                        Name
                        <input
                          type="text"
                          value={traveller.name}
                          onChange={(event) => updateGuestTraveller(index, 'name', event.target.value)}
                          placeholder="Friend name"
                        />
                      </label>
                      <label>
                        Age
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={traveller.age}
                          onChange={(event) => updateGuestTraveller(index, 'age', event.target.value)}
                          placeholder="Age"
                        />
                      </label>
                      <label>
                        Phone
                        <input
                          type="tel"
                          value={traveller.phone}
                          onChange={(event) => updateGuestTraveller(index, 'phone', event.target.value)}
                          placeholder="Optional"
                        />
                      </label>
                      <label>
                        Email
                        <input
                          type="email"
                          value={traveller.email}
                          onChange={(event) => updateGuestTraveller(index, 'email', event.target.value)}
                          placeholder="Optional"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <div className="itn-booking-summary">
              <div>
                <span>Package base</span>
                <strong>{packageBaseLabel}</strong>
              </div>
              <div>
                <span>Travellers</span>
                <strong>{travellerLabel}</strong>
              </div>
              {totalHotelAddonPrice > 0 ? (
                <div style={{ color: '#0f766e' }}>
                  <span>Hotel ({selectedHotels.map((h) => h.name).join(', ')})</span>
                  <strong>+ ₹ {totalHotelAddonPrice.toLocaleString('en-IN')}</strong>
                </div>
              ) : null}
              {totalTransportAddonPrice > 0 ? (
                <div style={{ color: '#0f766e' }}>
                  <span>Transport ({selectedTransfers.map((t) => t.title).join(', ')})</span>
                  <strong>+ ₹ {totalTransportAddonPrice.toLocaleString('en-IN')}</strong>
                </div>
              ) : null}
              {totalActivityAddonPrice > 0 ? (
                <div style={{ color: '#0f766e' }}>
                  <span>Activity ({selectedActivities.map((a) => a.name).join(', ')})</span>
                  <strong>+ ₹ {totalActivityAddonPrice.toLocaleString('en-IN')}</strong>
                </div>
              ) : null}
              <div>
                <span>{taxLabel}</span>
                <strong>{taxAmountLabel}</strong>
              </div>
              <div>
                <span>Booking total</span>
                <strong>{packageTotalLabel}</strong>
              </div>
              <div>
                <span>{partialBookingEnabled ? `${duePercentLabel} due now` : 'Amount due now'}</span>
                <strong>{amountToPayLabel}</strong>
              </div>
              <div>
                <span>Remaining balance</span>
                <strong>{remainingAmountLabel}</strong>
              </div>
              <div>
                <span>Payment mode</span>
                <strong>{isPartialPayment ? 'Partial booking' : 'Full payment'}</strong>
              </div>
              {isPartialPayment ? (
                <p>{duePercentLabel} is collected now. The remaining {remainingPercent}% ({remainingAmountLabel}) can be collected after confirmation.</p>
              ) : (
                <p>Full package amount is payable now. There will be no remaining balance after verification.</p>
              )}
            </div>

            {partialBookingEnabled ? (
              <section className="itn-booking-payment-choice" aria-label="Payment amount">
                <div className="itn-booking-section-title">
                  <span>Payment option</span>
                  <strong>Choose how much to pay now</strong>
                </div>
                <div className="itn-payment-options" role="radiogroup" aria-label="Choose booking payment amount">
                  <label className={isPartialPayment ? 'is-selected' : ''}>
                    <input
                      type="radio"
                      name="modal-payment-mode"
                      value="partial"
                      checked={isPartialPayment}
                      onChange={() => updatePaymentMode('partial')}
                    />
                    <span>Partial payment</span>
                    <strong>{bookingAmountLabel}</strong>
                    <small>{partialBookingPercentage}% now, {partialRemainingAmountLabel} later</small>
                  </label>
                  <label className={!isPartialPayment ? 'is-selected' : ''}>
                    <input
                      type="radio"
                      name="modal-payment-mode"
                      value="full"
                      checked={!isPartialPayment}
                      onChange={() => updatePaymentMode('full')}
                    />
                    <span>Full payment</span>
                    <strong>{packageTotalLabel}</strong>
                    <small>Pay 100% and keep zero balance</small>
                  </label>
                </div>
              </section>
            ) : null}

            <div className="itn-booking-breakdown">
              <div><span>Per traveller price</span><strong>{unitPriceLabel}</strong></div>
              <div><span>Travellers</span><strong>{travellerLabel}</strong></div>
              <div><span>Base package</span><strong>{packageBaseLabel}</strong></div>
              {totalHotelAddonPrice > 0 ? (
                <div style={{ color: '#0f766e', fontWeight: 600 }}>
                  <span>Hotel ({selectedHotels.map((h) => h.name).join(', ')})</span>
                  <strong>+ ₹ {totalHotelAddonPrice.toLocaleString('en-IN')}</strong>
                </div>
              ) : null}
              {totalTransportAddonPrice > 0 ? (
                <div style={{ color: '#0f766e', fontWeight: 600 }}>
                  <span>Transport ({selectedTransfers.map((t) => t.title).join(', ')})</span>
                  <strong>+ ₹ {totalTransportAddonPrice.toLocaleString('en-IN')}</strong>
                </div>
              ) : null}
              {totalActivityAddonPrice > 0 ? (
                <div style={{ color: '#0f766e', fontWeight: 600 }}>
                  <span>Activity ({selectedActivities.map((a) => a.name).join(', ')})</span>
                  <strong>+ ₹ {totalActivityAddonPrice.toLocaleString('en-IN')}</strong>
                </div>
              ) : null}
              {couponDiscountAmount > 0 ? <div><span>Original package</span><strong>{originalPriceLabel}</strong></div> : null}
              {couponDiscountAmount > 0 ? <div><span>Coupon discount</span><strong>{couponDiscountLabel}</strong></div> : null}
              <div><span>{taxLabel}</span><strong>{taxAmountLabel}</strong></div>
              <div><span>Booking total</span><strong>{packageTotalLabel}</strong></div>
              {couponCode ? <div><span>Coupon code</span><strong>{couponCode}</strong></div> : null}
              <div><span>Payable now</span><strong>{amountToPayLabel}</strong></div>
              <div><span>Balance later</span><strong>{remainingAmountLabel}</strong></div>
            </div>

            <div className="itn-booking-form">
              <label>
                Lead traveller name
                <input
                  type="text"
                  value={bookingForm.name}
                  onChange={(event) => updateBookingField('name', event.target.value)}
                  placeholder="Your name"
                />
              </label>
              <label>
                Lead traveller email
                <input
                  type="email"
                  value={bookingForm.email}
                  onChange={(event) => updateBookingField('email', event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Lead traveller phone
                <input
                  type="tel"
                  value={bookingForm.phone}
                  onChange={(event) => updateBookingField('phone', event.target.value)}
                  placeholder="Phone number"
                />
              </label>
              <label>
                Coupon code (optional)
                <span className="itn-coupon-field">
                  <span className="itn-coupon-row">
                    <input
                      type="text"
                      value={bookingForm.couponCode}
                      onChange={(event) => updateBookingField('couponCode', event.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      disabled={!couponCode || couponValidating}
                      onClick={validateCouponCode}
                    >
                      {couponValidating ? 'Checking' : 'Apply'}
                    </button>
                  </span>
                  {couponMessage ? <span className="itn-coupon-note">{couponMessage}</span> : null}
                  {couponError ? <span className="itn-coupon-error">{couponError}</span> : null}
                </span>
              </label>
              <label>
                Notes (optional)
                <textarea
                  value={bookingForm.notes}
                  onChange={(event) => updateBookingField('notes', event.target.value)}
                  placeholder="Meal preference, pickup request, or anything we should know"
                />
              </label>
            </div>

            {paymentError ? <div className="itn-booking-error">{paymentError}</div> : null}
            {paymentMessage ? <div className="itn-booking-message">{paymentMessage}</div> : null}

            {verifiedBooking && !bookingResult ? (
              <div className="itn-booking-recovery-card">
                <div className="itn-recovery-status">
                  <span className="itn-recovery-tag">✓ Payment Verified</span>
                  <span className="itn-recovery-pid">Payment ID: {verifiedBooking.razorpay_payment_id}</span>
                </div>
                <h4>Session Expired — Sign In to Complete Booking</h4>
                <p>
                  Your payment of ₹ {Number(verifiedBooking.payable_now || amountToPay).toLocaleString('en-IN')} was received!
                  Enter your account password below to finish creating your booking confirmation without paying again.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleInlineRecoveryLogin();
                  }}
                >
                  <div className="itn-recovery-row">
                    <label>
                      Account Email
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                      />
                    </label>
                    <label>
                      Password
                      <input
                        type="password"
                        value={recoveryPassword}
                        onChange={(e) => setRecoveryPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                    </label>
                  </div>

                  {recoveryError ? <div className="itn-booking-error" style={{ margin: '8px 0' }}>{recoveryError}</div> : null}

                  <button
                    type="submit"
                    className="itn-recovery-submit-btn"
                    disabled={recoveryLoading || !recoveryPassword}
                  >
                    {recoveryLoading ? 'Signing in & Finalizing...' : 'Sign In & Finalize Booking'}
                  </button>

                  <div className="itn-recovery-alt-links">
                    <span>Don&apos;t have an account? </span>
                    <Link href={`/auth/register?redirect=${encodeURIComponent(loginRedirectUrl)}`}>
                      Register
                    </Link>
                    <span> or </span>
                    <Link href={`/auth/login?redirect=${encodeURIComponent(loginRedirectUrl)}`}>
                      Login Page
                    </Link>
                  </div>
                </form>
              </div>
            ) : null}

            {bookingResultData ? (
              <div className="itn-booking-result">
                <div className="itn-booking-result-head">
                  <span>Booking response</span>
                  <strong>{bookingResultData.booking_reference || bookingResultData.id || 'Booking recorded'}</strong>
                </div>
                <div className="itn-booking-result-grid">
                  <div>
                    <span>Package</span>
                    <strong>{bookingResultData.package_name || pkg.name}</strong>
                  </div>
                  <div>
                    <span>Payment status</span>
                    <strong>{bookingResultData.payment_status || 'payment_verified'}</strong>
                  </div>
                  <div>
                    <span>Paid amount</span>
                    <strong>₹ {Number(bookingResultData.amounts?.paid_amount || amountToPay).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span>Remaining</span>
                    <strong>₹ {Number(bookingResultData.amounts?.remaining_amount || remainingAmount).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
                <p style={{ marginTop: 12, color: '#166534', fontWeight: 600 }}>Booking confirmed! Redirecting shortly...</p>
              </div>
            ) : null}

            <div className="itn-booking-actions">
              <button
                type="button"
                onClick={() => {
                  if (verifiedBooking && !bookingResult) {
                    if (window.confirm('Your payment was already verified with Razorpay! You can finish linking your booking whenever you sign in. Close for now?')) {
                      setBookingModalOpen(false);
                    }
                  } else {
                    setBookingModalOpen(false);
                  }
                }}
                disabled={paymentProcessing || recoveryLoading}
              >
                {verifiedBooking ? 'Close' : 'Cancel'}
              </button>

              {verifiedBooking && !bookingResult ? (
                <button
                  type="button"
                  onClick={handleRetryFinalizeBooking}
                  disabled={paymentProcessing || recoveryLoading}
                  style={{ background: '#0f766e', color: '#fff' }}
                >
                  {recoveryLoading ? 'Finalizing...' : 'Retry Finalizing Booking'}
                </button>
              ) : (
                <button type="button" onClick={startRazorpayPayment} disabled={paymentProcessing || !amountToPay}>
                  {paymentProcessing ? 'Please wait...' : `Pay ${amountToPayLabel}`}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Login Prompt Modal */}
      {loginPromptOpen ? (
        <div className="itn-booking-modal" role="dialog" aria-modal="true" aria-label="Login required">
          <div className="itn-login-panel">
            <button type="button" className="itn-booking-close" onClick={() => setLoginPromptOpen(false)} aria-label="Close login prompt">
              ✕
            </button>
            <div className="itn-booking-hero">
              <span>Login required</span>
              <h2>Sign in to book this package</h2>
              <p>Your booking details will be safely attached to your customer account.</p>
            </div>
            <div className="itn-login-copy">
              <strong>{amountToPayLabel}</strong>
              <span>{isPartialPayment ? `${duePercentLabel} due now` : 'Full amount due now'}</span>
              <p>After logging in, you will be able to proceed directly to payment.</p>
            </div>
            <div className="itn-booking-actions">
              <button type="button" onClick={() => setLoginPromptOpen(false)}>Not now</button>
              <Link href={`/auth/login?redirect=${encodeURIComponent(loginRedirectUrl)}`}>
                Login to continue
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <ItineraryStyles />
    </div>
  );
}

