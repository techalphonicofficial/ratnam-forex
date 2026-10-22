'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TourCard from '@/components/TourCard';
import { TourCardSkeleton } from '@/components/SkeletonLoader';
import { getMediaUrl, getPackageFilters, getPackages, normalizePackageToTour } from '@/utils/api';
import TourItineraryView from './TourItineraryView';

const DEFAULT_TOUR_TYPES = [
  { key: 'all', label: 'All', count: 0 },
  { key: 'resorts', label: 'Resorts', count: 0 },
  { key: 'honeymoon', label: 'Honeymoon', count: 0 },
  { key: 'family', label: 'Family', count: 0 },
  { key: 'adventure', label: 'Adventure', count: 0 },
  { key: 'group', label: 'Group', count: 0 },
  { key: 'luxury', label: 'Luxury', count: 0 },
  { key: 'budget', label: 'Budget', count: 0 },
];

const DEFAULT_DURATIONS = [
  { key: 'any', label: 'Any', min: null, max: null, count: 0 },
  { key: '1-3', label: '1-3 days', min: 1, max: 3, count: 0 },
  { key: '4-7', label: '4-7 days', min: 4, max: 7, count: 0 },
  { key: '8-14', label: '8-14 days', min: 8, max: 14, count: 0 },
  { key: '15-plus', label: '15+ days', min: 15, max: null, count: 0 },
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'duration-asc', label: 'Shortest First' },
];

const MAX_PRICE = 1000000;
const formatPriceNumber = (value) => Number(value || 0).toLocaleString('en-IN');

/* ── Regional Destinations Data ── */
const REGION_DESTINATIONS = {
  'North India': {
    featured: {
      name: 'Uttarakhand',
      packagesCount: '60+ PACKAGES',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&q=80',
      description: 'Land of Gods with Himalayan meadows, Kedarnath & Valley of Flowers.',
    },
    grid: [
      { name: 'Rajasthan', packagesCount: '105+ PACKAGES', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80' },
      { name: 'Himachal', packagesCount: '50+ PACKAGES', image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=600&q=80' },
      { name: 'Jammu & Kashmir', packagesCount: '20+ PACKAGES', image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=600&q=80' },
      { name: 'Uttar Pradesh', packagesCount: '25+ PACKAGES', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&q=80' },
      { name: 'Delhi', packagesCount: '20+ PACKAGES', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80' },
      { name: 'Ladakh', packagesCount: '20+ PACKAGES', image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=600&q=80' },
    ],
  },
  'South India': {
    featured: {
      name: 'Kerala',
      packagesCount: '75+ PACKAGES',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900&q=80',
      description: "God's Own Country with serene backwaters, palm trees & Ayurveda.",
    },
    grid: [
      { name: 'Tamil Nadu', packagesCount: '45+ PACKAGES', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80' },
      { name: 'Karnataka', packagesCount: '40+ PACKAGES', image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600&q=80' },
      { name: 'Andhra Pradesh', packagesCount: '20+ PACKAGES', image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=600&q=80' },
      { name: 'Pondicherry', packagesCount: '25+ PACKAGES', image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=600&q=80' },
      { name: 'Ooty', packagesCount: '30+ PACKAGES', image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&q=80' },
      { name: 'Munnar', packagesCount: '35+ PACKAGES', image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=600&q=80' },
    ],
  },
  'East India': {
    featured: {
      name: 'Sikkim',
      packagesCount: '50+ PACKAGES',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=900&q=80',
      description: 'Majestic Kanchenjunga, serene monasteries, and alpine lakes.',
    },
    grid: [
      { name: 'West Bengal', packagesCount: '40+ PACKAGES', image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=600&q=80' },
      { name: 'Assam', packagesCount: '30+ PACKAGES', image: 'https://images.unsplash.com/photo-1622396481304-4b53e8a2d5c7?w=600&q=80' },
      { name: 'Meghalaya', packagesCount: '35+ PACKAGES', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80' },
      { name: 'Arunachal Pradesh', packagesCount: '20+ PACKAGES', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80' },
      { name: 'Darjeeling', packagesCount: '30+ PACKAGES', image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&q=80' },
      { name: 'Odisha', packagesCount: '25+ PACKAGES', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80' },
    ],
  },
  'West India': {
    featured: {
      name: 'Goa',
      packagesCount: '80+ PACKAGES',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900&q=80',
      description: 'Sun-kissed beaches, vibrant nightlife, Portuguese heritage and shacks.',
    },
    grid: [
      { name: 'Maharashtra', packagesCount: '65+ PACKAGES', image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80' },
      { name: 'Gujarat', packagesCount: '40+ PACKAGES', image: 'https://images.unsplash.com/photo-1609137144822-26d9539366df?w=600&q=80' },
      { name: 'Mumbai', packagesCount: '30+ PACKAGES', image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=600&q=80' },
      { name: 'Udaipur', packagesCount: '45+ PACKAGES', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80' },
      { name: 'Mahabaleshwar', packagesCount: '20+ PACKAGES', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80' },
      { name: 'Kutch', packagesCount: '25+ PACKAGES', image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&q=80' },
    ],
  },
  'Central India': {
    featured: {
      name: 'Madhya Pradesh',
      packagesCount: '45+ PACKAGES',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=900&q=80',
      description: 'The heart of incredible India with tiger safaris, temples and heritage.',
    },
    grid: [
      { name: 'Kanha', packagesCount: '20+ PACKAGES', image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600&q=80' },
      { name: 'Khajuraho', packagesCount: '25+ PACKAGES', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80' },
      { name: 'Bhopal', packagesCount: '20+ PACKAGES', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80' },
      { name: 'Bandhavgarh', packagesCount: '20+ PACKAGES', image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600&q=80' },
      { name: 'Pachmarhi', packagesCount: '15+ PACKAGES', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80' },
      { name: 'Orchha', packagesCount: '18+ PACKAGES', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80' },
    ],
  },
};

/* ── International Regional Destinations Data ── */
const INTERNATIONAL_REGION_DESTINATIONS = {
  'Southeast Asia': {
    featured: {
      name: 'Bali',
      packagesCount: '65+ PACKAGES',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=80',
      description: 'Lush tropical paradise with cliffside temples, sacred monkey forests & private pool villas.',
    },
    grid: [
      { name: 'Thailand', packagesCount: '70+ PACKAGES', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80' },
      { name: 'Singapore', packagesCount: '45+ PACKAGES', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80' },
      { name: 'Vietnam', packagesCount: '40+ PACKAGES', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80' },
      { name: 'Malaysia', packagesCount: '35+ PACKAGES', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80' },
      { name: 'Bangkok', packagesCount: '30+ PACKAGES', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80' },
      { name: 'Phuket', packagesCount: '38+ PACKAGES', image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80' },
    ],
  },
  'Middle East': {
    featured: {
      name: 'Dubai',
      packagesCount: '80+ PACKAGES',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=80',
      description: 'Futuristic metropolis of world records, Burj Khalifa, thrilling desert safaris & luxury shopping.',
    },
    grid: [
      { name: 'Abu Dhabi', packagesCount: '35+ PACKAGES', image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&q=80' },
      { name: 'Oman', packagesCount: '20+ PACKAGES', image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&q=80' },
      { name: 'Qatar', packagesCount: '25+ PACKAGES', image: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=600&q=80' },
      { name: 'Turkey', packagesCount: '50+ PACKAGES', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80' },
      { name: 'Baku', packagesCount: '30+ PACKAGES', image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=600&q=80' },
      { name: 'Egypt', packagesCount: '35+ PACKAGES', image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=600&q=80' },
    ],
  },
  'Europe': {
    featured: {
      name: 'Switzerland',
      packagesCount: '65+ PACKAGES',
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=900&q=80',
      description: 'Snow-capped alpine peaks, scenic glacier express trains, pristine lakes & wooden chalets.',
    },
    grid: [
      { name: 'Paris', packagesCount: '55+ PACKAGES', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80' },
      { name: 'Italy', packagesCount: '60+ PACKAGES', image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&q=80' },
      { name: 'London', packagesCount: '45+ PACKAGES', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80' },
      { name: 'Greece', packagesCount: '40+ PACKAGES', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80' },
      { name: 'Spain', packagesCount: '42+ PACKAGES', image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600&q=80' },
      { name: 'Austria', packagesCount: '30+ PACKAGES', image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600&q=80' },
    ],
  },
  'Island Escapes': {
    featured: {
      name: 'Maldives',
      packagesCount: '55+ PACKAGES',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=900&q=80',
      description: 'Iconic overwater pool villas, private atoll islands, vibrant marine reefs & sunset cruises.',
    },
    grid: [
      { name: 'Mauritius', packagesCount: '35+ PACKAGES', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80' },
      { name: 'Seychelles', packagesCount: '25+ PACKAGES', image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=600&q=80' },
      { name: 'Sri Lanka', packagesCount: '30+ PACKAGES', image: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=600&q=80' },
      { name: 'Fiji', packagesCount: '15+ PACKAGES', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' },
      { name: 'Bali', packagesCount: '65+ PACKAGES', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80' },
      { name: 'Phuket', packagesCount: '38+ PACKAGES', image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80' },
    ],
  },
  'East Asia & Pacific': {
    featured: {
      name: 'Japan',
      packagesCount: '50+ PACKAGES',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=900&q=80',
      description: 'Ancient shrines, bullet trains, cherry blossoms & hyper-modern neon skylines of Tokyo & Kyoto.',
    },
    grid: [
      { name: 'Australia', packagesCount: '45+ PACKAGES', image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&q=80' },
      { name: 'New Zealand', packagesCount: '35+ PACKAGES', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80' },
      { name: 'South Korea', packagesCount: '30+ PACKAGES', image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600&q=80' },
      { name: 'Hong Kong', packagesCount: '28+ PACKAGES', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80' },
      { name: 'Singapore', packagesCount: '45+ PACKAGES', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80' },
      { name: 'Vietnam', packagesCount: '40+ PACKAGES', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80' },
    ],
  },
};

/* ── Featured Indian Destinations Showcase ── */
const FEATURED_INDIAN_DESTINATIONS = [
  {
    name: 'Kashmir',
    country: 'Jammu & Kashmir',
    packagesCount: '60+ PACKAGES',
    price: '₹18,999',
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80',
    tags: ['Dal Lake', 'Gulmarg Snow', 'Shikara'],
    desc: 'Paradise on Earth with ornate cedar houseboats, Gulmarg gondolas & saffron valleys.',
  },
  {
    name: 'Kerala',
    country: 'South India',
    packagesCount: '75+ PACKAGES',
    price: '₹16,999',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80',
    tags: ['Backwaters', 'Ayurveda', 'Munnar'],
    desc: "God's Own Country with serene Alleppey houseboats, emerald tea hills & palm shores.",
  },
  {
    name: 'Goa',
    country: 'West Coast',
    packagesCount: '80+ PACKAGES',
    price: '₹12,999',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
    tags: ['Beaches', 'Nightlife', 'Water Sports'],
    desc: 'Sun-kissed Arabian beaches, vibrant nightlife, Portuguese churches & water sports.',
  },
  {
    name: 'Rajasthan',
    country: 'Royal Heritage',
    packagesCount: '105+ PACKAGES',
    price: '₹19,999',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
    tags: ['Jaipur Palaces', 'Udaipur Lakes', 'Thar Desert'],
    desc: 'Land of Kings with Jaipur pink palaces, Udaipur lakeside forts & camel safaris.',
  },
  {
    name: 'Himachal',
    country: 'Hill Escapes',
    packagesCount: '50+ PACKAGES',
    price: '₹14,999',
    image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&q=80',
    tags: ['Manali', 'Shimla', 'Snow Treks'],
    desc: 'Snow-capped Himalayan peaks, pine-forested river valleys & mountain adventures.',
  },
  {
    name: 'Ladakh',
    country: 'Land of High Passes',
    packagesCount: '40+ PACKAGES',
    price: '₹28,999',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&q=80',
    tags: ['Pangong Lake', 'Nubra Dunes', 'Monasteries'],
    desc: 'Land of High Passes with sapphire Pangong Tso, Nubra sand dunes & cliffside gompas.',
  },
  {
    name: 'Andaman',
    country: 'Tropical Islands',
    packagesCount: '45+ PACKAGES',
    price: '₹22,999',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    tags: ['Havelock', 'Radhanagar', 'Scuba Diving'],
    desc: 'Tropical turquoise lagoons, pristine white coral beaches, scuba diving & ocean cruises.',
  },
  {
    name: 'Uttarakhand',
    country: 'Land of Gods',
    packagesCount: '60+ PACKAGES',
    price: '₹15,999',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    tags: ['Rishikesh', 'Nainital', 'Kedarnath'],
    desc: 'Land of Gods with holy Ganges river rafting, serene hill lakes & Himalayan trails.',
  },
];

/* ── Featured International Destinations Showcase ── */
const FEATURED_INTERNATIONAL_DESTINATIONS = [
  {
    name: 'Bali',
    country: 'Indonesia',
    packagesCount: '45+ PACKAGES',
    price: '₹24,999',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    tags: ['Beaches', 'Temples', 'Villas'],
    desc: 'Island of Gods with sacred sea temples, lush Ubud rice terraces & beach clubs.',
  },
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    packagesCount: '60+ PACKAGES',
    price: '₹38,999',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    tags: ['Skyscrapers', 'Desert Safari', 'Luxury'],
    desc: 'Futuristic Burj Khalifa, world-class malls, Arabian desert safaris & marina yachts.',
  },
  {
    name: 'Thailand',
    country: 'Southeast Asia',
    packagesCount: '55+ PACKAGES',
    price: '₹21,999',
    image: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800&q=80',
    tags: ['Islands', 'Nightlife', 'Street Food'],
    desc: 'Bangkok golden temples, Phi Phi island hopping, and vibrant night markets.',
  },
  {
    name: 'Maldives',
    country: 'Indian Ocean',
    packagesCount: '40+ PACKAGES',
    price: '₹48,999',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
    tags: ['Overwater Villas', 'Coral Reefs', 'Honeymoon'],
    desc: 'Turquoise lagoons, private overwater pool villas, manta rays & coral reefs.',
  },
  {
    name: 'Singapore',
    country: 'Southeast Asia',
    packagesCount: '35+ PACKAGES',
    price: '₹34,999',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
    tags: ['Futuristic', 'Gardens', 'Theme Parks'],
    desc: 'Gardens by the Bay Supertrees, Marina Bay Sands, Sentosa & Universal Studios.',
  },
  {
    name: 'Switzerland',
    country: 'Europe',
    packagesCount: '30+ PACKAGES',
    price: '₹89,999',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80',
    tags: ['Alps', 'Glacier Trains', 'Lakes'],
    desc: 'Snowy Matterhorn peaks, Jungfraujoch Top of Europe, and emerald alpine lakes.',
  },
  {
    name: 'Vietnam',
    country: 'Southeast Asia',
    packagesCount: '25+ PACKAGES',
    price: '₹27,999',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
    tags: ['Ha Long Bay', 'Ancient Towns', 'Cuisine'],
    desc: 'Ha Long Bay emerald waters, Hoi An lantern alleys & scenic Ba Na Hills bridge.',
  },
  {
    name: 'Paris',
    country: 'France',
    packagesCount: '28+ PACKAGES',
    price: '₹75,999',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    tags: ['Eiffel Tower', 'Art & Romance', 'Cafes'],
    desc: 'Eiffel Tower lights, romantic Seine cruises, Louvre Museum & Parisian cafes.',
  },
];


/* ── City Explorer Pills ── */
const INDIAN_MAJOR_CITIES_LIST = [
  'All',
  'Goa',
  'Kashmir',
  'Kerala',
  'Rajasthan',
  'Himachal',
  'Ladakh',
  'Andaman',
  'Uttarakhand',
  'Delhi',
  'Mumbai',
  'Jaipur',
  'Agra',
  'Varanasi',
  'Munnar',
  'Ooty',
  'Udaipur',
  'Sikkim',
  'Darjeeling',
  'Rishikesh',
];

const MAJOR_CITIES_LIST = [
  'All',
  'Vietnam',
  'Bangkok',
  'Dubai',
  'Los Angeles',
  'Abu Dhabi',
  'Amsterdam',
  'Goa',
  'New York',
  'Switzerland',
  'Bali',
  'Thailand',
  'Europe',
  'Singapore',
  'Malaysia',
  'Azerbaijan',
  'Philippines',
  'Seychelles',
  'New Zealand',
  'South Africa',
  'Paris',
  'Maldives',
  'Kashmir',
];

/* ── Create Your Own Package Archetypes ── */
const PACKAGE_ARCHETYPES = [
  {
    title: 'COUPLE',
    image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&q=80',
    traveller: 'Couple',
  },
  {
    title: 'FAMILY',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80',
    traveller: 'Family',
  },
  {
    title: 'SMALL GROUP',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
    traveller: 'Group',
  },
  {
    title: 'NRI',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80',
    traveller: 'NRI',
  },
  {
    title: 'BUDGET',
    image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&q=80',
    traveller: 'Budget',
  },
];

/* ── Trending Travel Articles ── */
const TRAVEL_ARTICLES = [
  {
    title: 'China Visa Requirements for Indian Citizens: Complete Guide for 2026',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80',
    summary: "China doesn't offer visa on arrival to avoid, or any short-stay exemption for Indian passport holders. Here is the full guide to getting your L tourist visa...",
    date: 'Aug 25, 2024',
    author: 'Vyoma Dandwala',
    link: '/blog',
  },
  {
    title: 'Europe Visa Requirements for Indian Citizens: Schengen Visa...',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&q=80',
    summary: 'Planning a Europe trip from India? This blog covers the key Europe visa requirements, documents, flight bookings, and processing timelines...',
    date: 'Aug 19, 2024',
    author: 'Siddharh Shah',
    link: '/blog',
  },
  {
    title: '7 Budget-Friendly Weekend Getaways From Mumbai - A...',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    summary: 'This weekend travel guide has all that a traveller needs to know. It covers 7 scenic destinations from Lonavala to Alibaug and Matheran with cost estimates...',
    date: 'Aug 14, 2024',
    author: 'Nikita Baria',
    link: '/blog',
  },
  {
    title: 'A Complete Guide to Food in Sri Lanka: What to Eat & Where to Fin...',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    summary: 'This quick, complex, and practical guide to food in Sri Lanka covers famous hoppers, kottu roti, crab curries, and top street food spots across Colombo and Galle...',
    date: 'Aug 10, 2024',
    author: 'Mohit Saha',
    link: '/blog',
  },
];

/* ── Dynamic Destination Guide Content Function ── */
const getDestinationGuideContent = (destName) => {
  const norm = String(destName || '').toLowerCase().trim();
  const titleFormatted = destName ? formatHeadingValue(destName) : 'Holiday Destinations';

  if (norm.includes('maldives')) {
    return {
      mainHeading: 'Maldives: Destination Guide, Tips & Tricks',
      cityGuide: {
        title: '1. Overview & Highlights',
        summary: [
          'The Maldives is an idyllic tropical archipelago in the Indian Ocean comprising 26 ring-shaped atolls and over 1,000 coral islands.',
          'Famed for its turquoise lagoons, vibrant coral reefs, and luxurious overwater pool villas, it is the premier choice for romantic honeymoons, private family escapes, and world-class marine safaris.',
        ],
        whyVisit: 'Unrivaled tropical seclusion where "one island equals one luxury resort", 30+ meters of underwater visibility, warm turquoise lagoons, and romantic sunset cruises.',
        highlights: [
          { title: 'North & South Malé Atolls', desc: 'Home to Velana International Airport, renowned surf breaks, vibrant coral passes, and fast speedboat connections.' },
          { title: 'Ari Atoll', desc: 'The world-famous marine playground for swimming alongside giant manta rays and gentle whale sharks.' },
          { title: 'Baa Atoll (UNESCO Biosphere)', desc: 'Home to the protected Hanifaru Bay, where hundreds of manta rays gather to feed in feeding frenzies.' },
          { title: 'Inhabited Local Islands', desc: 'Islands like Maafushi and Dhigurah provide affordable boutique guesthouses, local cafes, and authentic island culture.' },
        ],
      },
      knowBeforeYouGo: {
        title: '2. Know Before You Go',
        tips: [
          { icon: '🛂', label: 'Visa Requirements', text: 'Free 30-day tourist visa granted upon arrival for all tourists, including Indian citizens. You need a passport valid for 6+ months and confirmed resort booking.' },
          { icon: '🗓️', label: 'Best Time to Visit', text: 'November to April is the dry northeast monsoon season with calm seas and sunny skies. May to October offers warm tropical weather with occasional rains and maximum resort savings.' },
          { icon: '💱', label: 'Currency & Payments', text: 'US Dollars (USD) and major credit cards are accepted everywhere at resorts. The local currency is Maldivian Rufiyaa (MVR) for local shops.' },
          { icon: '🚤', label: 'Island Transfers', text: 'Transfers are operated via Speedboat (close atolls) or scenic Seaplane (farther atolls). Note that seaplanes only fly in daylight hours (6:00 AM - 4:30 PM).' },
          { icon: '🕌', label: 'Local Culture & Customs', text: 'Modest dress is required when visiting local inhabited islands. Alcohol is freely available on private resort islands but prohibited on local public islands.' },
        ],
      },
      placesToVisit: {
        title: '3. Must-Visit Places & Atolls',
        points: [
          { city: 'Malé City', text: 'The capital island featuring the 17th-century coral stone Old Friday Mosque (Hukuru Miskiy), National Museum, and bustling local fish market.' },
          { city: 'Banana Reef', text: 'The Maldives’ very first discovered dive spot, famous for dramatic overhangs, caves, and vibrant schools of bannerfish, moray eels, and sharks.' },
          { city: 'Ari Atoll & Sun Island', text: 'Pristine emerald lagoons, luxurious stilt-water walkways, and the best year-round whale shark snorkeling safaris.' },
          { city: 'Hanifaru Bay (Baa Atoll)', text: 'World-renowned UNESCO Biosphere Reserve where massive schools of manta rays and whale sharks aggregate during the southwest monsoon.' },
          { city: 'Maafushi Island', text: 'A lively inhabited island known for bikini beach, affordable water sports, dive centers, and local cultural cafes.' },
          { city: 'Vaadhoo Island', text: 'Famous for its glowing neon-blue bioluminescent phytoplankton shores that light up the night waves like starry skies.' },
        ],
      },
      thingsToDo: {
        title: '4. Things to Do',
        activities: [
          { icon: '🤿', title: 'Snorkeling & Scuba Diving', desc: 'Explore pristine house reefs teeming with sea turtles, harmless reef sharks, stingrays, and vibrant coral formations.' },
          { icon: '🐬', title: 'Sunset Dolphin Cruise', desc: 'Cruise the deep atoll channels in a traditional wooden Dhoni boat while pods of playful spinner dolphins leap around you.' },
          { icon: '🍽️', title: 'Underwater Dining Experience', desc: 'Savor gourmet dishes submerged 5 meters beneath the surface surrounded by living coral and tropical marine life.' },
          { icon: '🏄', title: 'Water Sports & Jet Skiing', desc: 'Glide over calm turquoise lagoons with parasailing, jet ski safaris, wakeboarding, and stand-up paddleboarding.' },
          { icon: '🏖️', title: 'Castaway Sandbank Picnic', desc: 'Be dropped off on an uninhabited pure white sandbank in the middle of the Indian Ocean for a private tropical picnic.' },
          { icon: '✨', title: 'Bioluminescent Beach Walk', desc: 'Witness the breathtaking glowing "Sea of Stars" caused by bioluminescent plankton lighting up shorelines at night.' },
        ],
      },
      stayAndFood: {
        title: '5. Stay, Food & Shopping',
        stays: [
          { icon: '🏡', title: 'Overwater Pool Villas', desc: 'Iconic thatched villas built over crystal lagoon waters with private sundecks, direct water stairways, and private infinity pools.' },
          { icon: '🌴', title: 'Beachfront Pool Suites', desc: 'Hidden amidst tropical palm greenery steps away from the soft white sand beach, ideal for families and privacy.' },
          { icon: '🏨', title: 'Local Island Boutique Hotels', desc: 'Comfortable, modern island guesthouses on Maafushi or Fulhadhoo offering cozy hospitality at budget-friendly rates.' },
        ],
        dining: [
          { icon: '🥥', title: 'Mas Huni & Roshi', desc: 'The national breakfast specialty made with finely chopped smoked tuna, fresh grated coconut, onion, and lime served with warm roshi flatbread.' },
          { icon: '🐟', title: 'Fresh Reef Seafood BBQ', desc: 'Grilled yellowfin tuna, red snapper, and rock lobster seasoned with aromatic island spices and fresh coconut milk.' },
          { icon: '🥞', title: 'Floating Pool Breakfast', desc: 'Indulge in a signature morning floating tray loaded with fresh tropical fruits, pastries, and smoothies in your private plunge pool.' },
        ],
        shopping: [
          { icon: '🐚', title: 'Lacquered Wooden Crafts', desc: 'Handcrafted wooden bowls, vases, and ornamental boxes made with traditional Thulhaadhoo lacquerwork.' },
          { icon: '🧵', title: 'Kunaa Mats', desc: 'Handwoven natural reed mats featuring geometric patterns traditional to the southern Gaafu Dhaalu atoll.' },
        ],
      },
    };
  }

  if (norm.includes('bali')) {
    return {
      mainHeading: 'Bali: Destination Guide, Tips & Tricks',
      cityGuide: {
        title: '1. Overview & Highlights',
        summary: [
          'Known as the "Island of the Gods", Bali enchants travellers with emerald rice terraces, sacred sea temples, surf-swept shores, and a deep-rooted spiritual culture.',
          'Plan your Bali getaway: visa on arrival, best time to visit, top regions, must-visit places, things to do, private pool villas, beach clubs, and best shopping markets.',
        ],
        whyVisit: 'Bali offers an unmatched tropical balance — spiritual temples in misty Ubud jungles, vibrant beach clubs along Seminyak and Canggu, thrilling surf breaks in Uluwatu, and dramatic volcanic peaks in Kintamani.',
        highlights: [
          { title: 'Ubud Cultural Heart', desc: 'Lush rainforest valleys, sacred monkey sanctuaries, art markets, and wellness yoga retreats.' },
          { title: 'Uluwatu Clifftop Temples', desc: 'Perched 70 meters above roaring Indian Ocean waves, famous for sunset Kecak fire dances.' },
          { title: 'Nusa Penida Offshore Island', desc: 'World-famous Kelingking T-Rex cliff, Angel’s Billabong, and crystal-clear manta ray dive sites.' },
          { title: 'Seminyak & Canggu Coast', desc: 'Chic beach clubs, world-class culinary hotspots, indie designer boutiques, and sunset bars.' },
          { title: 'Mount Batur Volcano', desc: 'Early morning caldera sunrise treks with panoramic views across Lake Batur.' },
          { title: 'Sacred Water Temples', desc: 'Ulun Danu Beratan floating temple on Lake Bratan and the holy water spring temple of Tirta Empul.' },
        ],
      },
      knowBeforeYouGo: {
        title: '2. Know Before You Go',
        tips: [
          { icon: '🛂', label: 'Visa Requirements', text: '30-day Visa on Arrival (VoA) is granted to Indian tourists and over 80 nationalities online (e-VoA) or on arrival at Denpasar Airport.' },
          { icon: '🗓️', label: 'Best Time to Visit', text: 'April to October brings the dry season with sunny skies and lower humidity. November to March has tropical showers with lush green landscapes and great villa deals.' },
          { icon: '💱', label: 'Currency & Payments', text: 'Indonesian Rupiah (IDR). ATMs are plentiful, cards accepted at resorts and beach clubs; carry cash for local Warungs and markets.' },
          { icon: '🛵', label: 'Getting Around', text: 'Hire a private car with driver for day tours, or rent scooters for short hops. Bluebird Taxi and Grab/Gojek ride apps operate in main towns.' },
          { icon: '🙏', label: 'Temple Etiquette & Customs', text: 'Wear a sarong and sash (usually rented at entrances) when visiting temples. Never step on Canang Sari floral daily street offerings.' },
        ],
      },
      placesToVisit: {
        title: '3. Must-Visit Cities & Places',
        points: [
          { city: 'Ubud', text: 'Sacred Monkey Forest sanctuary, Tegallalang rice terraces, traditional artisan markets, and royal palace dance shows.' },
          { city: 'Seminyak & Canggu', text: 'Trendy beachside towns with world-famous beach clubs (Potato Head, Finns), hipster cafes, surf breaks, and boutiques.' },
          { city: 'Uluwatu', text: 'Dramatic limestone sea cliffs, Uluwatu Temple, sunset Kecak fire dance performances, and secluded white-sand surf bays.' },
          { city: 'Nusa Penida', text: 'Iconic offshore island famed for Kelingking T-Rex cliff, Broken Beach, Angel’s Billabong, and swimming with manta rays.' },
          { city: 'Kintamani & Mount Batur', text: 'Active volcanic highland region with early-morning sunrise hikes, natural hot springs, and lakeside viewpoints.' },
          { city: 'Nusa Dua & Sanur', text: 'Calm turquoise swimming waters, manicured 5-star beachfront luxury resorts, and water sports hubs.' },
          { city: 'Tanah Lot & Bedugul', text: 'Ancient offshore sea temple perched on a rocky islet and the postcard-perfect Ulun Danu Beratan floating temple.' },
        ],
      },
      thingsToDo: {
        title: '4. Things to Do',
        activities: [
          { icon: '🌋', title: 'Mount Batur Sunrise Trek', desc: 'Hike to the summit of active Mount Batur before dawn to watch sunrise over a sea of clouds while enjoying volcanic steam-cooked breakfast.' },
          { icon: '🌴', title: 'Bali Swing over Rice Terraces', desc: 'Soar high above lush jungle palm canopies and cascading emerald rice terraces in Tegallalang for unforgettable photos.' },
          { icon: '🤿', title: 'Snorkel with Giant Manta Rays', desc: 'Take a speedboat to Nusa Penida and snorkel alongside gentle, majestic manta rays at Manta Point.' },
          { icon: '🔥', title: 'Kecak Fire Dance at Uluwatu', desc: 'Watch the mesmerizing sunset polyrhythmic chant and fire dance with the sun dipping below the Indian Ocean cliff edge.' },
          { icon: '🌺', title: 'Balinese Spa & Flower Bath', desc: 'Indulge in a traditional Balinese massage followed by an aromatic herbal floral bath overlooking lush jungle gorges.' },
          { icon: '🌊', title: 'Sunset at Jimbaran Bay', desc: 'Savor candlelit grilled seafood dinners right on the sand as dusk settles over Jimbaran Bay.' },
        ],
      },
      stayAndFood: {
        title: '5. Stay, Food & Shopping',
        stays: [
          { icon: '🏡', title: 'Private Jungle Pool Villas', desc: 'Secluded bamboo chalets and infinity pool villas nestled amidst Ubud’s tropical rainforest.' },
          { icon: '🏖️', title: 'Beachfront 5-Star Resorts', desc: 'World-renowned luxury brand resorts in Nusa Dua and Seminyak with private beach access.' },
          { icon: '🏄', title: 'Boutique Surf & Boho Stays', desc: 'Stylish eco-lodges and surf retreats across Canggu, Bingin, and Uluwatu cliffs.' },
        ],
        dining: [
          { icon: '🍚', title: 'Nasi Goreng & Mie Goreng', desc: 'Classic fragrant Indonesian fried rice and noodles served with fried egg, chicken satay, and prawn crackers.' },
          { icon: '🍢', title: 'Sate Lilit & Bebek Betutu', desc: 'Minced seafood lemongrass skewers and slow-cooked Balinese spiced roast duck wrapped in banana leaves.' },
          { icon: '🥞', title: 'Floating Pool Breakfast', desc: 'Signature morning floating tray served in your villa pool with fresh dragonfruit bowls, pastries, and Balinese coffee.' },
          { icon: '🐟', title: 'Jimbaran Seafood BBQ', desc: 'Charcoal-grilled red snapper, jumbo tiger prawns, and squid basted in sweet-spicy Balinese marinade.' },
        ],
        shopping: [
          { icon: '🧺', title: 'Handwoven Rattan Bags', desc: 'Famous round woven Ata grass and rattan bags handmade in Tenganan village.' },
          { icon: '💍', title: 'Celuk Silver Jewelry', desc: 'Intricate silver rings, necklaces, and filigree art crafted by master silversmiths in Celuk.' },
          { icon: '☕', title: 'Kopi Luwak & Spices', desc: 'Artisanal Bali coffee beans, vanilla pods, lemongrass essential oils, and organic wellness teas.' },
          { icon: '👗', title: 'Boutique Resort Wear', desc: 'Flowing linen dresses, batik sarongs, and designer swimwear along Seminyak shopping streets.' },
        ],
      },
    };
  }

  if (norm.includes('dubai') || norm.includes('uae')) {
    return {
      mainHeading: 'Dubai: Destination Guide, Tips & Tricks',
      cityGuide: {
        title: '1. Overview & Highlights',
        summary: [
          'Dubai is a glittering metropolis where futuristic architecture rises from golden Arabian sands, offering world-record landmarks, thrilling desert adventures, and lavish hospitality.',
          'Plan your Dubai trip: tourist visa rules, best season, top attractions, desert safaris, luxury hotels, authentic Arabic dining, and world-class shopping malls.',
        ],
        whyVisit: 'A global crossroads of ambition and luxury — home to the world’s tallest tower, largest shopping mall, man-made palm islands, and rich Bedouin heritage.',
        highlights: [
          { title: 'Burj Khalifa & Downtown', desc: 'The world’s tallest skyscraper standing at 828 meters, flanked by the Dubai Mall and musical fountains.' },
          { title: 'Palm Jumeirah Island', desc: 'Man-made palm archipelago featuring luxury Atlantis resorts, Aquaventure, and The View observatory.' },
          { title: 'Dubai Desert Conservation', desc: 'Vast golden dunes for thrilling 4x4 dune bashing, quad biking, and sunset Bedouin camps.' },
          { title: 'Dubai Marina & JBR', desc: 'Stunning waterfront promenade lined with superyachts, alfresco cafes, and beachfront attractions.' },
          { title: 'Historic Old Dubai', desc: 'Traditional Abra boat rides across Dubai Creek, Al Fahidi historic district, and dazzling Gold & Spice Souks.' },
          { title: 'Museum of the Future', desc: 'Architectural marvel celebrating future innovations with its iconic Arabic calligraphy facade.' },
        ],
      },
      knowBeforeYouGo: {
        title: '2. Know Before You Go',
        tips: [
          { icon: '🛂', label: 'Visa Requirements', text: 'Indian passport holders can obtain an easy 30-day or 60-day tourist e-Visa online prior to travel; US/UK visa holders qualify for Visa on Arrival.' },
          { icon: '🗓️', label: 'Best Time to Visit', text: 'November to March offers pleasant winter temperatures (22°C - 28°C), perfect for sightseeing, beach days, and outdoor dining.' },
          { icon: '💱', label: 'Currency & Payments', text: 'UAE Dirham (AED). Cards, Apple Pay, and digital payments are universally accepted everywhere.' },
          { icon: '🚇', label: 'Getting Around', text: 'Dubai Metro is ultra-clean, air-conditioned, and connects airport to major sights. Careem and Uber apps provide fast taxi rides.' },
          { icon: '🙏', label: 'Local Laws & Customs', text: 'Dress respectfully in public malls and government buildings. Alcohol is served in licensed hotels, restaurants, and lounges.' },
        ],
      },
      placesToVisit: {
        title: '3. Must-Visit Cities & Places',
        points: [
          { city: 'Downtown Dubai', text: 'Burj Khalifa observation decks (124th & 148th floors), the dancing Dubai Fountain, and Dubai Mall with indoor aquarium.' },
          { city: 'Palm Jumeirah', text: 'The iconic tree-shaped island, Atlantis The Palm, Aquaventure Waterpark, and The View at The Palm 360° deck.' },
          { city: 'Dubai Marina & JBR', text: 'Glistening yacht harbor, The Walk at JBR beachfront, Ain Dubai observation wheel, and skydiving drop zones.' },
          { city: 'Old Dubai & Deira', text: 'Historic Al Fahidi heritage neighborhood, Dubai Museum, traditional 1-Dirham Abra rides, and Gold & Spice Souks.' },
          { city: 'Dubai Desert Conservation Reserve', text: 'High red sand dunes for desert safaris, falconry shows, camel riding, and starry Bedouin dinners.' },
          { city: 'Abu Dhabi (Day Trip)', text: 'The magnificent Sheikh Zayed Grand Mosque, Louvre Abu Dhabi, and adrenaline thrills at Ferrari World Yas Island.' },
        ],
      },
      thingsToDo: {
        title: '4. Things to Do',
        activities: [
          { icon: '🏙️', title: 'At The Top Burj Khalifa', desc: 'Ascend the world’s fastest double-decker elevator to the 124th/125th or 148th floor for breathtaking 360-degree desert and gulf views.' },
          { icon: '🚙', title: 'Red Dune Desert Safari & BBQ', desc: 'Experience heart-pumping 4x4 dune bashing, sandboarding, camel treks, Tanoura dance, and open-air Arabian barbecue dinner.' },
          { icon: '🛥️', title: 'Dubai Marina Luxury Yacht Cruise', desc: 'Glide past futuristic skyscrapers and the illuminated Ain Dubai wheel on a scenic sunset or night yacht cruise.' },
          { icon: '🪂', title: 'Skydive Dubai over Palm Jumeirah', desc: 'Tandem freefall from 13,000 feet with the postcard-perfect Palm Jumeirah island unfolding beneath you.' },
          { icon: '🏛️', title: 'Museum of the Future & Miracle Garden', desc: 'Step 50 years into humanity’s future inside a gravity-defying ring, then wander 150 million blooming flowers at Miracle Garden.' },
          { icon: '🛍️', title: 'Bargain at the Gold & Spice Souks', desc: 'Wander glittering alleys of authentic 22K/24K gold jewelry and aromatic mounds of Iranian saffron, cardamom, and frankincense.' },
        ],
      },
      stayAndFood: {
        title: '5. Stay, Food & Shopping',
        stays: [
          { icon: '👑', title: 'Iconic Luxury Palaces', desc: 'Burj Al Arab 7-star sail suites, Atlantis The Royal, and Palace Downtown with front-row fountain views.' },
          { icon: '🏙️', title: 'Marina & Downtown Towers', desc: 'Sleek 5-star skyscraper suites in Dubai Marina and Business Bay with rooftop infinity pools.' },
          { icon: '🏜️', title: 'Desert Oasis Resorts', desc: 'Authentic luxury Bedouin pool villas at Bab Al Shams and Al Maha Desert Resort surrounded by sand dunes.' },
        ],
        dining: [
          { icon: '🥙', title: 'Shawarma, Falafel & Hummus', desc: 'Freshly carved tender lamb and chicken shawarma wrapped in warm pita with creamy garlic tahini.' },
          { icon: '🍖', title: 'Emirati Machboos & Harees', desc: 'Aromatic spiced basmati rice simmered with tender mutton or chicken, dried limes, and saffron.' },
          { icon: '🍮', title: 'Kunafa & Luqaimat', desc: 'Warm molten cheese pastry drenched in rosewater syrup, and golden crispy dough fritters drizzled with date syrup.' },
          { icon: '☕', title: 'Arabic Coffee (Gahwa) & Dates', desc: 'Traditional cardamom-infused light roast coffee served in handleless finjan cups with premium Medjool dates.' },
        ],
        shopping: [
          { icon: '✨', title: 'Gold Jewelry in Deira', desc: 'Government-certified gold ornaments, bridal sets, and bullion with transparent per-gram rates.' },
          { icon: '🛍️', title: 'The Dubai Mall & Mall of the Emirates', desc: 'Over 1,200 international designer flagships, tax-free electronics, and high fashion.' },
          { icon: '🧴', title: 'Oud & Arabian Perfumes', desc: 'Pure agarwood essential oils, bespoke incense burners (Bakhoor), and long-lasting oriental fragrances.' },
          { icon: '🌴', title: 'Bateel Gourmet Dates', desc: 'Luxury stuffed dates filled with caramelized pecans, candied orange peel, and roasted pistachios.' },
        ],
      },
    };
  }

  if (norm.includes('thailand') || norm.includes('bangkok') || norm.includes('phuket')) {
    return {
      mainHeading: 'Thailand: Destination Guide, Tips & Tricks',
      cityGuide: {
        title: '1. Overview & Highlights',
        summary: [
          'The "Land of Smiles", Thailand captivates travellers with golden Buddhist temples, turquoise island bays, buzzing floating markets, and world-famed culinary wonders.',
          'Plan your Thailand holiday: visa-free entry, best time to travel, Bangkok street food, Phuket beach resorts, Krabi island hopping, and night market shopping.',
        ],
        whyVisit: 'From bustling metropolis skylines and revered ancient temples to limestone sea karsts and palm-lined tropical shores, Thailand is vibrant, welcoming, and affordable.',
        highlights: [
          { title: 'Bangkok Megacity & Temples', desc: 'Grand Palace, Wat Pho Reclining Buddha, Wat Arun Dawn Temple, and lively Chao Phraya river life.' },
          { title: 'Phuket & Andaman Sea', desc: 'Patong nightlife, Kata and Karon beaches, Big Buddha, and luxury sea-view cliffside pool villas.' },
          { title: 'Krabi & Railay Beach', desc: 'Towering limestone karst cliffs, emerald lagoons, rock climbing, and Four Islands boat tours.' },
          { title: 'Phi Phi Islands', desc: 'World-famous Maya Bay, emerald lagoon snorkeling, Viking Cave, and viewpoint panoramas.' },
          { title: 'Chiang Mai Cultural Capital', desc: 'Misty northern mountains, 300+ ancient Lanna temples, ethical elephant sanctuaries, and night bazaars.' },
          { title: 'Pattaya & Coral Island', desc: 'Coral Island water sports, Sanctuary of Truth all-wood temple, and lively entertainment.' },
        ],
      },
      knowBeforeYouGo: {
        title: '2. Know Before You Go',
        tips: [
          { icon: '🛂', label: 'Visa Requirements', text: 'Visa Exemption / Visa on Arrival is available for Indian tourists with simple passport entry requirements.' },
          { icon: '🗓️', label: 'Best Time to Visit', text: 'November to April offers sunny dry weather, calm turquoise seas, and ideal beach-hopping conditions.' },
          { icon: '💱', label: 'Currency & Payments', text: 'Thai Baht (THB). Cash is king at night markets, street food stalls, and tuk-tuks; cards accepted in malls and hotels.' },
          { icon: '🛺', label: 'Getting Around', text: 'Bangkok BTS Skytrain and MRT are fast and air-conditioned. Use Grab app for rides, and speedboat ferries between islands.' },
          { icon: '🙏', label: 'Temple Etiquette & Customs', text: 'Cover shoulders and knees when visiting temples. Remove shoes before entering shrines, and never disrespect Buddha images.' },
        ],
      },
      placesToVisit: {
        title: '3. Must-Visit Cities & Places',
        points: [
          { city: 'Bangkok', text: 'Grand Palace, Wat Pho (Reclining Buddha), Wat Arun, Chao Phraya dinner cruises, and Chatuchak Weekend Market.' },
          { city: 'Phuket', text: 'Patong Beach, Old Phuket Town Sino-Portuguese architecture, Promthep Cape sunset point, and Big Buddha.' },
          { city: 'Krabi & Railay', text: 'Railay Beach accessible only by boat, Phra Nang Cave Beach, emerald swimming lagoons, and limestone rock towers.' },
          { city: 'Phi Phi Islands', text: 'Maya Bay lagoon made famous by movies, Pileh Lagoon cliff jumping, and colorful coral snorkel reefs.' },
          { city: 'Chiang Mai', text: 'Wat Phra That Doi Suthep mountain temple, ethical elephant rescue sanctuaries, and famous Sunday Walking Street.' },
          { city: 'Pattaya & Koh Larn', text: 'The Sanctuary of Truth wooden sanctuary, Coral Island parasailing, and vibrant Walking Street.' },
          { city: 'Koh Samui', text: 'Coconut palm groves, luxury wellness retreats, Chaweng Beach, and Ang Thong National Marine Park.' },
        ],
      },
      thingsToDo: {
        title: '4. Things to Do',
        activities: [
          { icon: '🚤', title: 'Speedboat Island Hopping', desc: 'Cruise across turquoise waters to Phi Phi Leh, Maya Bay, Bamboo Island, and James Bond Island in Phang Nga Bay.' },
          { icon: '🚢', title: 'Chao Phraya River Dinner Cruise', desc: 'Dine on a luxury river cruiser with live music as illuminated temples and bridges glide past in Bangkok.' },
          { icon: '🐘', title: 'Ethical Elephant Sanctuary Day', desc: 'Feed, bathe, and walk alongside rescued Asian elephants in their natural forest habitat in Chiang Mai or Phuket.' },
          { icon: '💆', title: 'Traditional Thai Massage', desc: 'Rejuvenate body and mind with authentic centuries-old Thai acupressure and herbal compress massages.' },
          { icon: '🍜', title: 'Night Market Street Food Tour', desc: 'Savor steaming Pad Thai, mango sticky rice, grilled skewers, and coconut ice cream at bustling local night markets.' },
          { icon: '🤿', title: 'Snorkel in Coral Lagoons', desc: 'Discover vibrant underwater worlds with sea turtles, clownfish, and coral gardens at Shark Point and Hin Daeng.' },
        ],
      },
      stayAndFood: {
        title: '5. Stay, Food & Shopping',
        stays: [
          { icon: '🏖️', title: 'Beachfront Pool Villas', desc: 'Cliff-edge and oceanfront villas with private plunge pools in Phuket, Krabi, and Koh Samui.' },
          { icon: '🏙️', title: 'Skyline Hotels with Infinity Pools', desc: 'Modern skyscrapers in Bangkok with rooftop infinity pools overlooking the city lights.' },
          { icon: '🌿', title: 'Eco Jungle Lodges', desc: 'Riverside wooden chalets and boutique eco-retreats in northern Chiang Mai forests.' },
        ],
        dining: [
          { icon: '🍜', title: 'Pad Thai & Tom Yum Goong', desc: 'Wok-tossed rice noodles with tamarind sauce, and the iconic spicy, sour shrimp soup with lemongrass and galangal.' },
          { icon: '🍲', title: 'Green Curry & Massaman Curry', desc: 'Fragrant coconut-milk curries with tender chicken, Thai eggplants, kaffir lime leaves, and roasted peanuts.' },
          { icon: '🥭', title: 'Mango Sticky Rice (Khao Niew Mamuang)', desc: 'Sweet ripe yellow mango slices served over warm glutinous rice drenched in sweet coconut cream.' },
          { icon: '🥗', title: 'Som Tum (Green Papaya Salad)', desc: 'Crisp shredded green papaya pounded with lime juice, chili, peanuts, and palm sugar.' },
        ],
        shopping: [
          { icon: '🧣', title: 'Thai Silk & Sarongs', desc: 'World-famous Jim Thompson silk scarves, handmade shirts, and colorful beach sarongs.' },
          { icon: '🐘', title: 'Elephant Pants & Handicrafts', desc: 'Breezy printed elephant pants, teak wood carvings, and handmade coconut shell bowls.' },
          { icon: '🥥', title: 'Dried Tropical Fruits & Spices', desc: 'Dried durian, mango slices, green curry paste packets, and lemongrass essential oils.' },
        ],
      },
    };
  }

  if (norm.includes('singapore')) {
    return {
      mainHeading: 'Singapore: Destination Guide, Tips & Tricks',
      cityGuide: {
        title: '1. Overview & Highlights',
        summary: [
          'Singapore is a futuristic global garden city where ultra-modern architecture seamlessly coexists with lush tropical greenery, rich heritage enclaves, and Michelin-starred street food.',
          'Plan your Singapore getaway: visa information, MRT travel card, top spots, Gardens by the Bay, Universal Studios, luxury hotels, hawker centers, and Orchard Road shopping.',
        ],
        whyVisit: 'The safest, cleanest, and most futuristic city-state in Asia — featuring iconic Supertree structures, world-class theme parks, and vibrant multicultural districts.',
        highlights: [
          { title: 'Marina Bay Sands & SkyPark', desc: 'Iconic triple-tower hotel with world’s highest rooftop infinity pool and 360-degree observation deck.' },
          { title: 'Gardens by the Bay', desc: 'Spectacular futuristic Supertree Grove, Flower Dome, Cloud Forest waterfall, and OCBC Skyway.' },
          { title: 'Sentosa Island Resort', desc: 'Universal Studios Singapore, S.E.A. Aquarium, Siloso Beach, and scenic cable car rides.' },
          { title: 'Chinatown & Little India', desc: 'Heritage shophouses, colorful Hindu & Buddhist temples, and bustling hawker centers.' },
          { title: 'Jewel Changi Airport', desc: 'The world-famous 40-meter indoor Rain Vortex waterfall nestled inside a lush four-story indoor forest.' },
          { title: 'Orchard Road Shopping', desc: 'Asia’s premier 2.2-km shopping belt lined with mega-malls, department stores, and luxury flagships.' },
        ],
      },
      knowBeforeYouGo: {
        title: '2. Know Before You Go',
        tips: [
          { icon: '🛂', label: 'Visa Requirements', text: 'Tourist e-Visa is required for Indian passport holders prior to arrival; simple online application through authorized agents.' },
          { icon: '🗓️', label: 'Best Time to Visit', text: 'Year-round tropical destination with pleasant warm weather; November to January features grand festive light displays.' },
          { icon: '💱', label: 'Currency & Payments', text: 'Singapore Dollar (SGD). Contactless credit/debit cards and mobile payments are accepted everywhere, even on MRT and buses.' },
          { icon: '🚇', label: 'Getting Around', text: 'The MRT subway is exceptionally clean, fast, and covers the entire island. Simply tap your credit card at fare gates.' },
          { icon: '⚖️', label: 'Cleanliness Laws & Etiquette', text: 'Strict cleanliness regulations: no chewing gum, no littering, no eating or drinking inside MRT stations and trains.' },
        ],
      },
      placesToVisit: {
        title: '3. Must-Visit Cities & Places',
        points: [
          { city: 'Marina Bay', text: 'Marina Bay Sands SkyPark deck, Spectra water and light show, the iconic Merlion statue, and Helix Bridge.' },
          { city: 'Gardens by the Bay', text: 'Supertree Grove light show, Cloud Forest indoor waterfall, Flower Dome, and Floral Fantasy.' },
          { city: 'Sentosa Island', text: 'Universal Studios Singapore, S.E.A. Aquarium, Skyline Luge, and Siloso Beach sunset clubs.' },
          { city: 'Chinatown & Little India', text: 'Buddha Tooth Relic Temple, Sri Veeramakaliamman Temple, Mustafa Centre 24/7 shopping, and heritage lanes.' },
          { city: 'Kampong Glam & Haji Lane', text: 'Sultan Mosque, bohemian Haji Lane filled with indie street art, quirky boutiques, and Middle Eastern cafes.' },
          { city: 'Jewel Changi Airport', text: 'The HSBC Rain Vortex indoor waterfall, Shiseido Forest Valley, and Canopy Park bouncing nets.' },
        ],
      },
      thingsToDo: {
        title: '4. Things to Do',
        activities: [
          { icon: '🌳', title: 'Garden Rhapsody Light Show', desc: 'Lie beneath the giant Supertrees as they come alive in a synchronized musical light display every evening.' },
          { icon: '🎢', title: 'Universal Studios Singapore', desc: 'Experience 24 rides and shows across 6 themed zones, including Battlestar Galactica and Transformers 3D.' },
          { icon: '🦁', title: 'Night Safari at Mandai', desc: 'Explore the world’s first nocturnal zoo on an open-air tram ride through 6 geographical zones under moonlight.' },
          { icon: '🛥️', title: 'Singapore River Cruise', desc: 'Board a traditional bumboat from Clarke Quay past historic bridges, colonial buildings, and modern Marina Bay skyline.' },
          { icon: '🍹', title: 'Sip a Singapore Sling at Raffles', desc: 'Visit the historic Long Bar at the legendary Raffles Hotel and enjoy the iconic gin-based cocktail invented here in 1915.' },
          { icon: '🚠', title: 'Singapore Cable Car to Sentosa', desc: 'Soar across the harbor from Mount Faber to Sentosa Island with 360-degree aerial views of the coastline.' },
        ],
      },
      stayAndFood: {
        title: '5. Stay, Food & Shopping',
        stays: [
          { icon: '🏨', title: 'Marina Bay Sands', desc: 'World’s most photographed hotel with exclusive access to the 57th-floor rooftop infinity pool.' },
          { icon: '🏰', title: 'Raffles Hotel Singapore', desc: 'Colonial 5-star grandeur featuring palm courtyards, antique verandahs, and butler service.' },
          { icon: '🏮', title: 'Heritage Shophouse Boutiques', desc: 'Restored Peranakan boutique hotels in Chinatown, Tanjong Pagar, and Katong.' },
        ],
        dining: [
          { icon: '🦀', title: 'Chili Crab with Fried Mantou', desc: 'Fresh mud crab drenched in sweet, savory, and spicy egg-ribbon chili gravy with crisp mantou buns.' },
          { icon: '🍗', title: 'Hainanese Chicken Rice', desc: 'Poached tender chicken served over fragrant rice cooked in chicken broth and pandan, with ginger-chili dip.' },
          { icon: '🍜', title: 'Laksa & Char Kway Teow', desc: 'Spicy coconut noodle soup with prawns, and smoky wok-charred flat rice noodles with cockles and sausage.' },
          { icon: '☕', title: 'Kaya Toast & Kopi', desc: 'Charcoal-toasted bread with coconut pandan jam and cold butter, paired with soft-boiled eggs and dark coffee.' },
        ],
        shopping: [
          { icon: '🏬', title: 'Orchard Road Malls', desc: 'ION Orchard, Takashimaya, Paragon, and 313@Somerset offering world fashion and electronics.' },
          { icon: '🛒', title: 'Mustafa Centre (Little India)', desc: 'Legendary 24/7 department store with 300,000+ items from perfumes and watches to gold and spices.' },
          { icon: '🎨', title: 'Haji Lane Boutiques', desc: 'Handmade local jewelry, retro clothing, indie fashion labels, and quirky souvenirs.' },
        ],
      },
    };
  }

  if (norm.includes('switzerland') || norm.includes('europe') || norm.includes('swiss')) {
    return {
      mainHeading: 'Switzerland: Destination Guide, Tips & Tricks',
      cityGuide: {
        title: '1. Overview & Highlights',
        summary: [
          'Switzerland is the crown jewel of Europe, renowned for dramatic snow-capped Alpine peaks, pristine turquoise glacial lakes, scenic panoramic trains, and storybook chalets.',
          'Plan your Swiss holiday: Schengen visa tips, Swiss Travel Pass, Jungfraujoch Top of Europe, Mount Titlis, Zermatt Matterhorn, fondue dining, and Swiss chocolates.',
        ],
        whyVisit: 'The world capital of natural beauty and precision — where you can ride trains through mountain glaciers, cruise pristine lakes, and walk atop Europe’s highest peaks.',
        highlights: [
          { title: 'Jungfraujoch Top of Europe', desc: 'Highest railway station in Europe at 3,454m, featuring the Ice Palace, Sphinx Observatory, and eternal snow.' },
          { title: 'Zermatt & The Matterhorn', desc: 'Car-free mountain resort village boasting postcard vistas of the world-famous pyramid-shaped Matterhorn peak.' },
          { title: 'Mount Titlis & Rotair', desc: 'World’s first revolving cable car, Titlis Cliff Walk suspension bridge, and glacier ice cave.' },
          { title: 'Lucerne & Lake Lucerne', desc: '14th-century wooden Chapel Bridge, Lion Monument, and steamboat cruises across fjord-like waters.' },
          { title: 'Interlaken Adventure Hub', desc: 'Picturesque alpine valley flanked by Lake Thun and Lake Brienz, backed by Eiger and Mönch peaks.' },
          { title: 'Scenic Panoramic Trains', desc: 'Glacier Express and GoldenPass Line offering breathtaking journeys through alpine tunnels and viaducts.' },
        ],
      },
      knowBeforeYouGo: {
        title: '2. Know Before You Go',
        tips: [
          { icon: '🛂', label: 'Visa Requirements', text: 'Schengen Visa is required for Indian passport holders; apply 2 to 3 months before travel at VFS Switzerland.' },
          { icon: '🗓️', label: 'Best Time to Visit', text: 'May to September brings lush green meadows, wildflowers, and lake cruises; December to March offers magical winter snow.' },
          { icon: '💱', label: 'Currency & Payments', text: 'Swiss Franc (CHF). Cards are universally accepted everywhere; tap-and-pay works seamlessly.' },
          { icon: '🚆', label: 'Swiss Travel Pass', text: 'All-in-one pass providing unlimited travel on Swiss trains, buses, boats, free entry to 500+ museums, and mountain discounts.' },
          { icon: '💧', label: 'Pure Alpine Tap Water', text: 'Tap water across Switzerland and in all public fountains is pure, crystal-clear alpine drinking water.' },
        ],
      },
      placesToVisit: {
        title: '3. Must-Visit Cities & Places',
        points: [
          { city: 'Zurich', text: 'Switzerland’s financial and cultural heart, featuring Lake Zurich, historic Altstadt, and Bahnhofstrasse luxury street.' },
          { city: 'Lucerne', text: 'The postcard wooden Chapel Bridge (Kapellbrücke), Lion Monument, and panoramic steamboat cruises on Lake Lucerne.' },
          { city: 'Interlaken', text: 'Adventure capital nestled between Lake Thun and Lake Brienz, gateway to Grindelwald, Lauterbrunnen, and Jungfraujoch.' },
          { city: 'Jungfraujoch', text: 'The "Top of Europe" at 3,454 meters, featuring the Ice Palace, Sphinx Observatory, and year-round eternal snow.' },
          { city: 'Zermatt', text: 'Car-free alpine village with dramatic vistas of the iconic pyramid-shaped Matterhorn and Gornergrat cogwheel train.' },
          { city: 'Mount Titlis', text: 'World-first revolving cable car (Rotair), glacier cave, and 500-meter-high Cliff Walk suspension bridge in Engelberg.' },
          { city: 'Geneva & Montreux', text: 'Lake Geneva’s Jet d’Eau fountain, UN headquarters, and the romantic medieval Château de Chillon on the lake.' },
        ],
      },
      thingsToDo: {
        title: '4. Things to Do',
        activities: [
          { icon: '🚂', title: 'Ride Jungfraujoch Cogwheel Train', desc: 'Ascend through the Eiger mountain tunnel to Europe’s highest railway station and step out onto eternal Aletsch Glacier snow.' },
          { icon: '🚡', title: 'Revolving Cable Car & Titlis Cliff Walk', desc: 'Spin 360 degrees on the Rotair cable car and cross Europe’s highest suspension bridge over a 500-meter abyss.' },
          { icon: '🚢', title: 'Lake Lucerne Steamboat Cruise', desc: 'Cruise turquoise waters framed by Mount Rigi and Mount Pilatus on a historic paddle steamer.' },
          { icon: '🪂', title: 'Tandem Paragliding in Interlaken', desc: 'Launch from mountain meadows and glide high over Interlaken with turquoise lakes and Alpine peaks below.' },
          { icon: '🍫', title: 'Swiss Chocolate Workshop', desc: 'Visit the Lindt Home of Chocolate or Maison Cailler to taste unlimited pralines and create your own chocolate bar.' },
          { icon: '🌲', title: 'Lauterbrunnen Valley of 72 Waterfalls', desc: 'Walk through the fairy-tale valley that inspired Tolkien’s Rivendell, with Staubbach Falls tumbling off sheer cliffs.' },
        ],
      },
      stayAndFood: {
        title: '5. Stay, Food & Shopping',
        stays: [
          { icon: '🏡', title: 'Traditional Alpine Chalets', desc: 'Cozy wooden chalets with flower-draped balconies and fireplace lounges in Grindelwald and Zermatt.' },
          { icon: '🏰', title: 'Grand Lakefront Palace Hotels', desc: 'Historic 5-star properties in Lucerne, Zurich, and Montreux with sweeping lake and mountain vistas.' },
          { icon: '🏨', title: 'Mountain Resort Hotels', desc: 'Heated outdoor infinity pool spas facing snow-draped alpine summits in Engelberg and St. Moritz.' },
        ],
        dining: [
          { icon: '🫕', title: 'Traditional Swiss Cheese Fondue', desc: 'Melted Gruyère and Emmental cheeses simmered with white wine and garlic, eaten by dipping crusty bread cubes.' },
          { icon: '🧀', title: 'Raclette & Baby Potatoes', desc: 'Broiled aromatic Swiss cheese scraped over steamed new potatoes, gherkins, and pickled pearl onions.' },
          { icon: '🥔', title: 'Crispy Potato Rösti', desc: 'Golden skillet-fried grated potato pancake topped with melted cheese, fried egg, or bacon.' },
          { icon: '🍫', title: 'Swiss Chocolate & Pastries', desc: 'Handcrafted truffles from Läderach, Lindt, and Sprüngli, plus crispy nut tarts and Apfelküchlein.' },
        ],
        shopping: [
          { icon: '⌚', title: 'Swiss Luxury Watches', desc: 'World-renowned timepieces from Rolex, Omega, Tissot, and TAG Heuer with VAT refund at departure.' },
          { icon: '🍫', title: 'Artisan Swiss Chocolates', desc: 'Fresh bark chocolates from Läderach and artisan boxes from historic Swiss chocolatiers.' },
          { icon: '🔪', title: 'Victorinox Swiss Army Knives', desc: 'Genuine multi-tool pocket knives with custom laser name engraving at flagship boutiques.' },
          { icon: '🔔', title: 'Swiss Cowbells & Music Boxes', desc: 'Hand-painted decorative brass cowbells with embroidered straps and wooden Swiss music boxes.' },
        ],
      },
    };
  }

  if (norm.includes('vietnam')) {
    return {
      mainHeading: 'Vietnam: Destination Guide, Tips & Tricks',
      cityGuide: {
        title: '1. Overview & Highlights',
        summary: [
          'Vietnam is a captivating Southeast Asian gem renowned for dramatic emerald karst seamounts in Ha Long Bay, lantern-lit ancient streets, terraced rice valleys, and vibrant culinary culture.',
          'Plan your Vietnam trip: quick e-visa, best travel months, Hanoi street life, Ha Long Bay luxury cruises, Hoi An tailor shops, Ba Na Hills, and Saigon landmarks.',
        ],
        whyVisit: 'Incredible natural landscapes, rich historic heritage, deeply hospitable people, and one of the world’s freshest, most flavorful street food cultures.',
        highlights: [
          { title: 'Ha Long Bay (UNESCO Heritage)', desc: 'Thousands of towering limestone karsts and islets rising dramatically from jade-green gulf waters.' },
          { title: 'Hoi An Ancient Lantern Town', desc: 'UNESCO-preserved port town illuminated every evening by thousands of colorful silk lanterns.' },
          { title: 'Hanoi 1,000-Year Capital', desc: 'Historic 36 Guild Streets in the Old Quarter, Hoan Kiem Lake, and French colonial architecture.' },
          { title: 'Da Nang & Golden Bridge', desc: 'The famous Golden Bridge held aloft by colossal stone hands in the misty Ba Na Hills.' },
          { title: 'Sapa Mist-Covered Terraces', desc: 'Cascading emerald rice terraces, Fansipan mountain peak, and vibrant ethnic hill tribe villages.' },
          { title: 'Ho Chi Minh City (Saigon)', desc: 'Dynamic southern metropolis featuring Cu Chi Tunnels, War Remnants Museum, and rooftop bars.' },
        ],
      },
      knowBeforeYouGo: {
        title: '2. Know Before You Go',
        tips: [
          { icon: '🛂', label: 'Visa Requirements', text: 'Vietnam e-Visa is available online for Indian citizens within 3-4 working days for 30 or 90 days stay.' },
          { icon: '🗓️', label: 'Best Time to Visit', text: 'November to April brings dry, pleasant weather across northern and southern regions with minimal rainfall.' },
          { icon: '💱', label: 'Currency & Payments', text: 'Vietnamese Dong (VND). Cash is essential for street vendors and small cafes; cards accepted in hotels and malls.' },
          { icon: '🛵', label: 'Getting Around', text: 'Grab app (car or bike) is ultra-cheap and reliable in cities. Luxury sleeper buses and trains connect regions.' },
          { icon: '🚦', label: 'Street Crossing Advice', text: 'When crossing scooter-filled streets, step forward smoothly at a steady pace; drivers will calculate and steer around you.' },
        ],
      },
      placesToVisit: {
        title: '3. Must-Visit Cities & Places',
        points: [
          { city: 'Hanoi', text: 'The Old Quarter with its 36 Guild Streets, Hoan Kiem Lake, Temple of Literature, and train street cafes.' },
          { city: 'Ha Long Bay & Lan Ha Bay', text: 'Limestone sea towers, Sung Sot (Surprise) Cave, Ti Top Island viewpoint, and kayaking through dark-and-bright sea grottos.' },
          { city: 'Hoi An Ancient Town', text: 'Lantern-lit riverside promenades, 400-year-old Japanese Covered Bridge, night street markets, and custom tailor studios.' },
          { city: 'Da Nang', text: 'The Golden Bridge held by stone hands in Ba Na Hills, Marble Mountains, Dragon Bridge fire show, and My Khe Beach.' },
          { city: 'Sapa', text: 'High mountain valley with tiered rice terraces, Muong Hoa Valley treks, and the cable car up Fansipan peak.' },
          { city: 'Ho Chi Minh City', text: 'Notre-Dame Cathedral Basilica of Saigon, Ben Thanh Market, the historic Cu Chi Tunnels, and Mekong Delta river day trips.' },
        ],
      },
      thingsToDo: {
        title: '4. Things to Do',
        activities: [
          { icon: '🚢', title: 'Overnight Ha Long Bay Cruise', desc: 'Board a luxury wooden junk or modern cruise ship for overnight sailing through limestone towers, cave kayaking, and sunset deck cocktails.' },
          { icon: '🌉', title: 'Walk the Ba Na Hills Golden Bridge', desc: 'Stroll across the shimmering 150-meter curved pedestrian bridge held aloft by two giant mossy stone hands high above the clouds.' },
          { icon: '🏮', title: 'Release River Lanterns in Hoi An', desc: 'Take a wooden boat along the Thu Bon River at twilight and release glowing candlelit paper flower lanterns onto the water for good fortune.' },
          { icon: '☕', title: 'Sip Vietnamese Egg Coffee in Hanoi', desc: 'Visit a hidden historic alley cafe in Hanoi and taste creamy, frothy Cà Phê Trứng whipped with egg yolks, condensed milk, and robusta coffee.' },
          { icon: '🪖', title: 'Crawl Through Cu Chi Tunnels', desc: 'Explore the legendary 250-kilometer underground network of tunnels used during the Vietnam War.' },
          { icon: '🛶', title: 'Paddle Through Mekong Delta Canals', desc: 'Ride a wooden sampan through narrow palm-fringed jungle waterways, visiting floating markets and fruit orchards.' },
        ],
      },
      stayAndFood: {
        title: '5. Stay, Food & Shopping',
        stays: [
          { icon: '🚢', title: 'Luxury Ha Long Bay Cruise Ships', desc: 'Private balcony staterooms with standalone bathtubs and top-deck jacuzzis floating amidst limestone pillars.' },
          { icon: '🏮', title: 'Riverside Boutique Resorts', desc: 'Tranquil French-Indochine heritage villas nestled along rivers and rice paddies in Hoi An.' },
          { icon: '🏨', title: 'Colonial City Hotels', desc: 'French colonial grand hotels in Hanoi and Ho Chi Minh City with rooftop skyline cocktail lounges.' },
        ],
        dining: [
          { icon: '🍜', title: 'Phở Bò (Beef Noodle Soup)', desc: 'The world-famous aromatic clear beef bone broth simmered for 12 hours with star anise, fresh rice noodles, and tender beef slices.' },
          { icon: '🥖', title: 'Bánh Mì', desc: 'Crispy French baguette filled with savory pâté, roasted pork, pickled daikon and carrot, fresh cilantro, and chili mayonnaise.' },
          { icon: '🥟', title: 'Bún Chả & Fresh Spring Rolls', desc: 'Grilled pork patties in sweet-sour dipping broth with rice noodles, and fresh translucent rice paper shrimp rolls.' },
          { icon: '☕', title: 'Cà Phê Sữa Đá & Egg Coffee', desc: 'Intense drip-brewed Vietnamese dark roast coffee poured over sweet condensed milk and crushed ice.' },
        ],
        shopping: [
          { icon: '🧵', title: '24-Hour Custom Tailored Suits & Dresses', desc: 'Hoi An’s master tailors create bespoke suits, dresses, and coats made to your exact measurements in under 24 hours.' },
          { icon: '🏮', title: 'Silk Lanterns', desc: 'Handcrafted foldable silk lanterns in vibrant jewel tones from Hoi An’s artisan workshops.' },
          { icon: '☕', title: 'Robusta Coffee & Phin Drip Filters', desc: 'Rich chocolatey Vietnamese coffee beans with traditional stainless-steel Phin single-cup drip filters.' },
          { icon: '🎨', title: 'Lacquerware & Bamboo Bowls', desc: 'Traditional high-gloss lacquer paintings, pearl-inlaid jewelry boxes, and spun bamboo tableware.' },
        ],
      },
    };
  }

  if (norm.includes('kashmir')) {
    return {
      mainHeading: 'Kashmir: Destination Guide, Tips & Tricks',
      cityGuide: {
        title: '1. Overview & Highlights',
        summary: [
          'Revered as "Paradise on Earth", Kashmir captivates travelers with majestic snow-clad Himalayan ranges, emerald alpine meadows, serene freshwater lakes, and charming cedarwood houseboats floating on Dal Lake.',
          'Plan your Kashmir holiday: travel essentials, best season, top valleys, Gulmarg gondola booking, houseboats, authentic Wazwan cuisine, and shopping for pure Pashmina.',
        ],
        whyVisit: 'Mesmerizing beauty across every season — tulip festivals in spring, pleasant cool summers, golden chinar leaves in autumn, and a snow-draped winter wonderland.',
        highlights: [
          { title: 'Srinagar & Dal Lake', desc: 'Mughal terraced gardens, floating artisan markets, and scenic Shikara rides.' },
          { title: 'Gulmarg Gondola', desc: 'Premier skiing destination and home to the world-famous Gulmarg Gondola rising up to 13,780 feet.' },
          { title: 'Pahalgam Valley', desc: 'The Valley of Shepherds along the Lidder River, gateway to Betaab Valley, Aru, and Baisaran meadow.' },
          { title: 'Sonamarg & Glaciers', desc: 'The Meadow of Gold, gateway to the Thajiwas Glacier and roaring Sindh River streams.' },
        ],
      },
      knowBeforeYouGo: {
        title: '2. Know Before You Go',
        tips: [
          { icon: '📱', label: 'Mobile Network', text: 'Prepaid SIM cards from outside Jammu & Kashmir do not work. Postpaid SIMs (Jio, Airtel, BSNL) work reliably across all major hubs.' },
          { icon: '🧥', label: 'Clothing Advice', text: 'Even in summer, Gulmarg and Pahalgam get chilly in the evenings. Pack light woolens; in winter, thermals and heavy parkas are essential.' },
          { icon: '🚡', label: 'Gondola Bookings', text: 'Book Gulmarg Gondola Phase 1 & Phase 2 passes well in advance online to secure your preferred morning time slot.' },
          { icon: '🚕', label: 'Local Transport', text: 'Internal sightseeing in Pahalgam (Aru, Betaab Valley) uses local association taxis, and ponies for Baisaran meadow.' },
          { icon: '🛍️', label: 'Authentic Souvenirs', text: 'Buy authentic GI-certified Pashmina shawls, Pampore saffron, walnut wood carvings, and crisp Kashmiri dry fruits.' },
        ],
      },
      placesToVisit: {
        title: '3. Must-Visit Cities & Places',
        points: [
          { city: 'Dal Lake & Nigeen Lake', text: 'World-famous tranquil lakes famed for ornate wooden houseboats, floating flower markets, and serene sunset Shikara rides.' },
          { city: 'Gulmarg & Apharwat Peak', text: 'Premier hill resort famous for lush pine forests, world-highest green golf course, and the iconic two-tier Gulmarg Gondola cable car.' },
          { city: 'Betaab Valley & Aru Valley', text: 'Spectacular verdant valleys in Pahalgam framed by snow-clad peaks, roaring Lidder river streams, and rolling pine meadows.' },
          { city: 'Sonamarg & Thajiwas Glacier', text: 'The Meadow of Gold, gateway to Ladakh with glacier viewpoints and roaring Sindh River streams.' },
          { city: 'Mughal Gardens of Srinagar', text: 'Terraced Persian-style water gardens including Shalimar Bagh, Nishat Bagh, and Chashme Shahi blooming with roses and chinars.' },
          { city: 'Doodhpathri', text: 'An undiscovered emerald bowl surrounded by dense pine forests and the foaming white waters of the Shaliganga River.' },
        ],
      },
      thingsToDo: {
        title: '4. Things to Do',
        activities: [
          { icon: '🛶', title: 'Shikara Ride on Dal Lake', desc: 'Glide past floating lotus beds, historic wooden bridges, and lakeside bazaars at golden sunrise or sunset.' },
          { icon: '🚡', title: 'Gulmarg Gondola Ride', desc: 'Ascend Apharwat Peak for breathtaking views of snow-draped Himalayan ranges and thrilling snow sports.' },
          { icon: '🐎', title: 'Pony Trek to Baisaran', desc: 'Trek through pine-scented forests to the rolling green meadows known as "Mini Switzerland".' },
          { icon: '❄️', title: 'Thajiwas Glacier Sledging', desc: 'Enjoy snow sledging and river walks in Sonamarg against backdrop of sheer granite peaks.' },
          { icon: '🌺', title: 'Explore Mughal Gardens', desc: 'Walk terraced water fountains at Shalimar Bagh, Nishat Bagh, and Chashme Shahi.' },
        ],
      },
      stayAndFood: {
        title: '5. Stay, Food & Shopping',
        stays: [
          { icon: '🚢', title: 'Heritage Dal Lake Houseboats', desc: 'Handcrafted floating wooden palaces with intricate walnut paneling, plush carpets, and private balconies overlooking the water.' },
          { icon: '🌲', title: 'Pine View Mountain Resorts', desc: 'Heated luxury chalets nestled amidst fir forests in Gulmarg and riverfront retreats in Pahalgam.' },
        ],
        dining: [
          { icon: '🍲', title: 'Royal Kashmiri Wazwan', desc: 'A celebrated 36-course banquet featuring Rogan Josh, Rista, Gushtaba, Tabak Maaz, and aromatic saffron rice.' },
          { icon: '☕', title: 'Saffron Kahwa', desc: 'Traditional warming green tea brewed with saffron strands, crushed almonds, cardamom, and cinnamon.' },
          { icon: '🥖', title: 'Traditional Kandur Breads', desc: 'Fresh local bakery specialties like crisp Girda, flaky Sheermal, and sesame-topped Tsot with pink Noon Chai.' },
        ],
        shopping: [
          { icon: '🧣', title: 'GI-Certified Pashmina Shawls', desc: 'Hand-spun cashmere wool shawls with intricate Sozni needle embroidery.' },
          { icon: '🌸', title: 'Pampore Saffron', desc: 'Pure grade-1 Kashmiri Mongra saffron threads from the purple flower fields of Pampore.' },
          { icon: '🪵', title: 'Walnut Wood Carvings', desc: 'Hand-carved walnut wood furniture, jewelry boxes, and decorative screens.' },
        ],
      },
    };
  }

  if (norm.includes('international')) {
    return {
      mainHeading: 'International Destinations: Travel Guide, Tips & Tricks',
      cityGuide: {
        title: '1. Overview & Highlights',
        summary: [
          'The world awaits with boundless wonders: from the turquoise lagoons of Maldives and vibrant beach clubs of Bali, to futuristic skylines of Dubai and Singapore, and the snow-crested alpine wonderlands of Switzerland and Europe.',
          'Plan your dream international trip: visa-free & visa-on-arrival entry, best seasons, top world cities, signature activities, luxury overwater & skyscraper stays, global gastronomy, and best shopping avenues across continents.',
        ],
        whyVisit: 'Expand your horizons across diverse cultures, world-record landmarks, thrilling desert & marine safaris, alpine glacier trains, and rich historical heritage.',
        highlights: [
          { title: 'Southeast Asia Wonders', desc: 'Bali, Thailand, Vietnam, and Singapore offering tropical beaches, street food, and lush rainforests.' },
          { title: 'Middle East & Dubai', desc: 'World’s tallest towers, sprawling luxury shopping malls, dune bashing, and futuristic attractions.' },
          { title: 'Tropical Island Archipelagos', desc: 'Maldives, Mauritius, and Seychelles with luxury overwater villas and pristine coral reefs.' },
          { title: 'European Alpine Landscapes', desc: 'Switzerland, France, and Italy featuring snow-capped peaks, scenic trains, and rich art.' },
        ],
      },
      knowBeforeYouGo: {
        title: '2. Know Before You Go',
        tips: [
          { icon: '🛂', label: 'Visa & Entry Requirements', text: 'Many top destinations (Thailand, Bali/Indonesia, Maldives, Sri Lanka, Malaysia) offer Visa on Arrival or e-Visa for Indian passport holders with quick processing.' },
          { icon: '🗓️', label: 'Best Time to Travel', text: 'November to April is ideal for Dubai, Maldives, and Southeast Asia; May to September offers perfect alpine summer weather in Europe and Switzerland.' },
          { icon: '💳', label: 'Forex & Multi-Currency Cards', text: 'Carry a multi-currency Forex card with zero markup for seamless tap-and-pay transactions worldwide; keep small local cash for street stalls.' },
          { icon: '✈️', label: 'Flights & Transit', text: 'Major metros (Delhi, Mumbai, Bengaluru) offer frequent direct flights to Dubai, Singapore, Bangkok, and Bali, and one-stop European connections.' },
          { icon: '📶', label: 'Connectivity & Insurance', text: 'Activate an international eSIM before departure for instant data, and always ensure comprehensive overseas travel health and baggage insurance.' },
        ],
      },
      placesToVisit: {
        title: '3. Must-Visit Cities & Places',
        points: [
          { city: 'Dubai & UAE', text: 'Burj Khalifa, Palm Jumeirah, desert conservation safaris, and Abu Dhabi’s Sheikh Zayed Grand Mosque.' },
          { city: 'Bali, Indonesia', text: 'Ubud cultural jungle, Tegallalang rice terraces, Uluwatu sunset clifftop temples, and Nusa Penida’s Kelingking cliff.' },
          { city: 'Thailand (Bangkok & Phuket)', text: 'The Grand Palace, Chao Phraya riverfront, Phi Phi islands, and Phuket white-sand beaches.' },
          { city: 'Singapore', text: 'Marina Bay Sands infinity pool, Gardens by the Bay Supertrees, Universal Studios Sentosa, and Jewel Changi.' },
          { city: 'Switzerland & Central Europe', text: 'Jungfraujoch Top of Europe, Interlaken lakes, scenic Glacier Express trains, and Lucerne wooden chapel bridges.' },
          { city: 'Maldives', text: 'Overwater stilt villas, turquoise lagoons, Manta ray marine reserves at Baa Atoll, and sunset dolphin cruises.' },
          { city: 'Vietnam (Hanoi & Da Nang)', text: 'Ha Long Bay limestone karsts, Hoi An ancient lantern town, and Ba Na Hills Golden Bridge held by giant hands.' },
          { city: 'Paris & Western Europe', text: 'The Eiffel Tower, Louvre Museum, Seine River dinner cruises, and historic Gothic cathedrals.' },
        ],
      },
      thingsToDo: {
        title: '4. Things to Do',
        activities: [
          { icon: '🏙️', title: 'Iconic Skyline & High-Rise Views', desc: 'Stand atop the Burj Khalifa or Marina Bay Sands observation decks overlooking dazzling city skylines.' },
          { icon: '🤿', title: 'World-Class Marine Safaris & Diving', desc: 'Snorkel alongside manta rays, sea turtles, and coral reefs in the Maldives, Bali, and Andaman Sea.' },
          { icon: '🚡', title: 'Alpine Cable Cars & Glacier Excursions', desc: 'Ride cable cars up snow-crowned Swiss peaks and traverse pristine mountain passes on panoramic trains.' },
          { icon: '🚙', title: 'Desert Safari & Bedouin BBQ', desc: 'Tackle golden Arabian sand dunes in 4x4s, ride camels, and enjoy stargazing dinner shows in Dubai.' },
          { icon: '🛥️', title: 'Emerald Bay & Island Hopping Cruises', desc: 'Sail past dramatic limestone karsts in Ha Long Bay or cruise between tropical Thai islands.' },
          { icon: '🛍️', title: 'Global Souks & Megamalls', desc: 'Shop duty-free luxury in Singapore and Dubai, and explore bustling night markets in Bangkok and Bali.' },
        ],
      },
      stayAndFood: {
        title: '5. Stay, Food & Shopping',
        stays: [
          { icon: '🏡', title: 'Iconic Overwater & Cliffside Villas', desc: 'Luxury stilt villas over turquoise lagoons in Maldives and jungle infinity pool chalets in Bali.' },
          { icon: '👑', title: '5-Star Skyscraper City Suites', desc: 'Opulent landmark hotels with skyline rooftop pools in Downtown Dubai, Singapore, and Bangkok.' },
          { icon: '🏔️', title: 'Swiss Alpine Chalets & Resorts', desc: 'Cozy wooden chalets with roaring fireplaces and panoramic mountain views in Interlaken and Zermatt.' },
        ],
        dining: [
          { icon: '🍜', title: 'Pan-Asian Delicacies', desc: 'Authentic Thai Pad Thai, Indonesian Nasi Goreng, Vietnamese Phở, and Singaporean chili crab.' },
          { icon: '🥙', title: 'Middle Eastern Shawarma & Mezze', desc: 'Fresh hummus, falafel, grilled kebabs, kunafa, and fragrant saffron Machboos in Dubai.' },
          { icon: '🧀', title: 'European Fondue & Bakeries', desc: 'Traditional Swiss melted cheese fondue, authentic Parisian croissants, and Italian wood-fired pizza.' },
        ],
        shopping: [
          { icon: '💎', title: 'Tax-Free & Duty-Free Megamalls', desc: 'World-class luxury shopping at Dubai Mall, Singapore Changi Jewel, and IconSIAM Bangkok.' },
          { icon: '🏮', title: 'Traditional Artisan Night Markets', desc: 'Handcrafted ceramics, silk textiles, spices, and unique souvenirs at Chatuchak and Ubud markets.' },
        ],
      },
    };
  }

  const isPureIndia = !norm || norm === 'india' || norm === 'indian';

  if (!isPureIndia) {
    return {
      mainHeading: `${titleFormatted}: Destination Guide, Tips & Tricks`,
      cityGuide: {
        title: '1. Overview & Highlights',
        summary: [
          `Discover the wonders of ${titleFormatted} with our curated travel guide, insider advice, and handpicked holiday packages.`,
          `Plan your ${titleFormatted} getaway: best time to visit, visa and travel tips, top cities and attractions, things to do, where to stay, eat, and best shopping avenues.`,
        ],
        whyVisit: `From iconic landmarks and breathtaking landscapes to rich cultural heritage and unforgettable cuisine, ${titleFormatted} offers a premier travel experience.`,
        highlights: [
          { title: 'Iconic Landmarks', desc: `World-famous monuments, architectural marvels, and panoramic viewpoints across ${titleFormatted}.` },
          { title: 'Cultural Heritage', desc: `Rich traditions, historical quarters, artisan markets, and authentic celebrations.` },
          { title: 'Natural Beauty', desc: `Pristine coastlines, emerald valleys, scenic peaks, and picturesque sunsets.` },
          { title: 'World-Class Dining', desc: `Celebrated local gastronomy, vibrant street food scenes, and culinary delights.` },
        ],
      },
      knowBeforeYouGo: {
        title: '2. Know Before You Go',
        tips: [
          { icon: '🛂', label: 'Visa Requirements', text: `Check tourist visa / e-visa eligibility for ${titleFormatted} prior to travel.` },
          { icon: '🗓️', label: 'Best Time to Visit', text: `Plan your trip during the pleasant dry season for sunny skies and comfortable sightseeing.` },
          { icon: '💱', label: 'Currency & Payments', text: `Credit and debit cards are widely accepted at hotels and malls; keep local currency for smaller shops.` },
          { icon: '🚕', label: 'Getting Around', text: `Use licensed city taxis, ride-hailing apps, or local transit networks for efficient travel.` },
          { icon: '🙏', label: 'Local Etiquette', text: `Respect local cultural customs, dress codes at religious sites, and customary courtesies.` },
        ],
      },
      placesToVisit: {
        title: '3. Must-Visit Cities & Places',
        points: [
          { city: 'Historic City Center', text: `Ancient quarters, bustling market squares, artisan boutiques, and traditional cafes.` },
          { city: 'Modern Downtown', text: `Skylines, premier shopping avenues, museums, and panoramic observation decks.` },
          { city: 'Coastal & Waterfront Promenade', text: `Harbor viewpoints, boat cruises, beach clubs, and sunset spots.` },
          { city: 'Heritage Enclave', text: `Historic temples, art galleries, local performance theaters, and artisanal crafts.` },
          { city: 'Scenic Highlands & Nature', text: `Emerald nature trails, panoramic viewpoints, botanical reserves, and outdoor adventures.` },
        ],
      },
      thingsToDo: {
        title: '4. Things to Do',
        activities: [
          { icon: '🏛️', title: 'Iconic Sightseeing Tour', desc: `Explore world-famous monuments, historic quarters, and signature architectural sights.` },
          { icon: '🚢', title: 'Scenic Cruise Experience', desc: `Enjoy scenic boat or harbor cruises offering panoramic shoreline and city skyline views.` },
          { icon: '🍜', title: 'Local Food Tasting Tour', desc: `Sample authentic local specialties, bustling food markets, and award-winning dishes.` },
          { icon: '🛍️', title: 'Shopping at Artisan Markets', desc: `Browse authentic handicrafts, local designer fashion, and unique holiday souvenirs.` },
          { icon: '🌅', title: 'Sunset Viewpoint Visit', desc: `Watch breathtaking golden sunsets from iconic hilltops or rooftop lounges.` },
          { icon: '💆', title: 'Wellness & Spa Relaxation', desc: `Unwind with traditional therapeutic massages and luxury resort wellness treatments.` },
        ],
      },
      stayAndFood: {
        title: '5. Stay, Food & Shopping',
        stays: [
          { icon: '👑', title: '5-Star Luxury Resorts', desc: `World-class international luxury resorts with infinity pools, ocean views, and premium amenities.` },
          { icon: '🏡', title: 'Boutique Heritage Stays', desc: `Charming local boutique hotels offering personalized hospitality and authentic character.` },
          { icon: '🏙️', title: 'Central City Hotels', desc: `Modern, connected hotels situated close to top shopping districts and transit hubs.` },
        ],
        dining: [
          { icon: '🍽️', title: 'Signature Regional Dishes', desc: `Must-try authentic delicacies celebrating local flavors, fresh ingredients, and culinary traditions.` },
          { icon: '🍢', title: 'Street Food Specialties', desc: `Vibrant street market eats, freshly prepared skewers, noodles, and savory bites.` },
          { icon: '🍰', title: 'Artisan Desserts & Beverages', desc: `Traditional sweets, specialty local coffees, and refreshing tropical drinks.` },
        ],
        shopping: [
          { icon: '🛍️', title: 'Premier Shopping Avenues', desc: `Flagship designer boutiques, luxury malls, and tax-free shopping centers.` },
          { icon: '🎨', title: 'Artisan Crafts & Souvenirs', desc: `Handmade textiles, local artwork, spices, and unique memorable souvenirs.` },
        ],
      },
    };
  }

  // India & Default Destination Guide (India: destination guide, tips & tricks)
  return {
    mainHeading: 'India: Destination Guide, Tips & Tricks',
    cityGuide: {
      title: '1. Overview & Highlights',
      summary: [
        'Yes, India is not a country but a continent. Its Ancient wonders, vibrant cultures and flavours that change every few hundred kilometres.',
        'Plan your India trip: best time to visit, visa and travel tips, top cities and places, things to do, and where to stay, eat, night life and best shopping streets, we covered everything here.',
      ],
      whyVisit:
        'India is a land of contrasts: snow-capped Himalayan peaks and palm-fringed beaches, bustling megacities and silent desert forts, ancient temples and glass-towered skylines. With 28 states, hundreds of languages and thousands of years of history, no two regions feel alike.',
      highlights: [
        {
          title: 'Mughal & Rajput Architecture',
          desc: "From the world-renowned Taj Mahal to Rajasthan's majestic desert forts and palaces.",
        },
        {
          title: 'Spiritual Centres',
          desc: 'Ancient spiritual sanctuaries such as Varanasi, Rishikesh, and Amritsar Golden Temple.',
        },
        {
          title: 'Wildlife Safaris',
          desc: 'Exotic wildlife, from Royal Bengal tigers in Ranthambore to one-horned rhinos in Kaziranga.',
        },
        {
          title: 'Backwaters, Beaches & Tea Hills',
          desc: 'Serene Kerala backwaters, sunny Goa beaches, and lush tea-covered hills of Munnar and Darjeeling.',
        },
        {
          title: 'Diverse Regional Cuisines',
          desc: 'Remarkable culinary traditions and flavorful recipes that vary richly from state to state.',
        },
        {
          title: 'Festivals All Year',
          desc: 'Vibrant celebrations all year round, including Diwali, Holi, and Durga Puja.',
        },
      ],
    },
    knowBeforeYouGo: {
      title: '2. Know Before You Go',
      tips: [
        {
          icon: '🗓️',
          label: 'Best Time to Visit',
          text: 'October to March suits most of the country. April to June is hot in the plains but ideal for the Himalayas. June to September is monsoon season, when Kerala and the Western Ghats turn lush and Ladakh opens up.',
        },
        {
          icon: '🛂',
          label: 'Visa Requirements',
          text: 'Most travellers need a visa, and many nationalities can apply online. Rules and fees change, so check the official Indian government visa portal before booking.',
        },
        {
          icon: '🚆',
          label: 'Getting Around — Trains',
          text: 'Scenic and affordable; book early on popular routes.',
        },
        {
          icon: '✈️',
          label: 'Getting Around — Domestic Flights',
          text: 'Best for long distances across the country.',
        },
        {
          icon: '🚕',
          label: 'Getting Around — Taxis & Ride Apps',
          text: 'Widely available in cities (Uber, Ola, and local prepaid taxis).',
        },
        {
          icon: '🚇',
          label: 'Getting Around — Metro Systems',
          text: 'Efficient, air-conditioned, and fast in Delhi, Mumbai, Bengaluru, and other major cities.',
        },
        {
          icon: '💱',
          label: 'Money & Currency',
          text: 'The currency is the Indian rupee (₹). UPI payments are common, but carry some cash for small vendors and rural areas.',
        },
        {
          icon: '🏥',
          label: 'Health & Safety',
          text: 'Drink bottled or filtered water, carry basic medicines and travel insurance, use licensed or app-based taxis, and watch your belongings in crowds.',
        },
        {
          icon: '🙏',
          label: 'Etiquette & Customs',
          text: 'Dress modestly at religious sites, remove shoes before entering temples, and use your right hand for eating and giving.',
        },
      ],
    },
    placesToVisit: {
      title: '3. Must-Visit Cities & Places',
      points: [
        { city: 'Delhi', text: "Mughal monuments such as the Red Fort and Humayun's Tomb, plus the lively lanes of Chandni Chowk." },
        { city: 'Agra', text: 'The Taj Mahal, Agra Fort and nearby Fatehpur Sikri.' },
        { city: 'Jaipur, Udaipur & Jodhpur', text: "Rajasthan's palaces, forts and bazaars: the Pink City, the lakeside city and the Blue City." },
        { city: 'Varanasi', text: "One of the world's oldest living cities, famed for Ganges boat rides and the evening aarti." },
        { city: 'Mumbai', text: 'The Gateway of India, Marine Drive, Art Deco buildings and Bollywood.' },
        { city: 'Kerala', text: 'Alleppey houseboats, Munnar tea estates and Ayurvedic retreats.' },
        { city: 'Goa', text: 'Beaches, Portuguese-era churches and a relaxed coastal pace.' },
        { city: 'The Himalayas', text: 'Leh-Ladakh for high-altitude landscapes, Manali and Shimla for mountain breaks, Rishikesh for yoga and adventure.' },
        { city: 'Hampi & Mysuru', text: 'Boulder-strewn ruins at Hampi and the grand Mysore Palace.' },
      ],
    },
    thingsToDo: {
      title: '4. Things to Do',
      activities: [
        {
          icon: '🌅',
          title: 'Watch sunrise at the Taj Mahal',
          desc: 'Watch sunrise at the Taj Mahal, when crowds are thinner and the morning mist catches the marble.',
        },
        {
          icon: '🐅',
          title: 'Wildlife Safari',
          desc: 'Go on a wildlife safari in Ranthambore, Jim Corbett or Kaziranga to witness Bengal tigers and rhinos.',
        },
        {
          icon: '🛥️',
          title: 'Cruise Kerala backwaters',
          desc: 'Cruise the Kerala backwaters on a traditional thatched houseboat through quiet canals.',
        },
        {
          icon: '🚂',
          title: 'Ride a scenic railway',
          desc: 'Ride a scenic railway such as the Kalka-Shimla toy train winding through mountain peaks.',
        },
        {
          icon: '🚶',
          title: 'Heritage walk in old-city bazaar',
          desc: 'Join a heritage walk through an old-city bazaar filled with historic arches, street food, and crafts.',
        },
        {
          icon: '🧘',
          title: 'Yoga & meditation in Rishikesh',
          desc: 'Practise yoga or meditation at an ashram in Rishikesh on the serene banks of the Holy Ganges.',
        },
        {
          icon: '🏔️',
          title: 'Trek or raft in the Himalayas',
          desc: 'Trek or raft in the Himalayas for stunning alpine vistas and thrilling river adventures.',
        },
        {
          icon: '🪔',
          title: 'Experience a local festival',
          desc: 'Experience a local festival like Diwali, Holi, or Durga Puja with vibrant music and celebrations.',
        },
        {
          icon: '👨‍🍳',
          title: 'Regional cooking class',
          desc: 'Take a regional cooking class to discover the authentic spices and recipes of traditional Indian cooking.',
        },
      ],
    },
    stayAndFood: {
      title: '5. Stay, Food & Shopping',
      stays: [
        {
          icon: '🏰',
          title: 'Heritage Hotels',
          desc: 'Former palaces and havelis, especially in Rajasthan with regal courtyards and antique suites.',
        },
        {
          icon: '🏡',
          title: 'Boutique Stays & Homestays',
          desc: 'Warm local hospitality, particularly in Kerala backwaters and scenic mountain hill stations.',
        },
        {
          icon: '🏨',
          title: 'Luxury & Business Hotels',
          desc: 'World-class 5-star properties and luxury amenities available in every major city.',
        },
        {
          icon: '🎒',
          title: 'Budget Guesthouses & Hostels',
          desc: 'Plentiful, social, and budget-friendly stays in backpacker and traveller hubs.',
        },
      ],
      dining: [
        {
          icon: '🍗',
          title: 'North India',
          desc: 'Butter chicken, chole bhature, parathas, kebabs, and aromatic biryanis.',
        },
        {
          icon: '🥘',
          title: 'West India',
          desc: 'Vada pav, Gujarati thali, Goan seafood curry, and Parsi delicacies.',
        },
        {
          icon: '🥞',
          title: 'South India',
          desc: 'Dosa, idli, filter coffee, Kerala fish curry, and appams.',
        },
        {
          icon: '🐟',
          title: 'East India',
          desc: 'Mishti doi, rasgulla, Bengali fish dishes, and savory kathi rolls.',
        },
        {
          icon: '🥟',
          title: 'Street Food',
          desc: 'Chaat, pani puri and samosas, best from busy and popular local stalls.',
        },
        {
          icon: '☕',
          title: 'Drinks',
          desc: 'Masala chai, lassi, fresh coconut water, and regional fruit sherbets.',
        },
      ],
      diningNote: 'Vegetarian and vegan options are easy to find across the country.',
      shopping: [
        {
          icon: '🧣',
          title: 'Textiles',
          desc: 'Silk sarees, pashmina shawls, block-printed fabrics, and artisanal weaves.',
        },
        {
          icon: '🏺',
          title: 'Handicrafts',
          desc: 'Rajasthani jewellery, blue pottery, wooden toys, and brass artifacts.',
        },
        {
          icon: '🌿',
          title: 'Spices, Tea & Ayurveda',
          desc: 'Fresh whole spices, Darjeeling & Assam teas, and Ayurvedic wellness products.',
        },
        {
          icon: '👞',
          title: 'Leather Goods & Footwear',
          desc: 'Leather goods and handmade footwear including Kolhapuris and embroidered juttis.',
        },
      ],
      shoppingTip:
        'Bargain in markets, but not in fixed-price shops. For authentic crafts, try government emporiums or cooperative stores.',
    },
  };
};

const buildApiQueryFromFilters = (filters) => {
  const query = {};
  if (filters.search) query.search = filters.search;
  if (filters.type && filters.type !== 'all') query.tour_type = filters.type;
  if (Number(filters.minPrice) > 0) query.minPrice = filters.minPrice;
  if (Number(filters.maxPrice) > 0 && Number(filters.maxPrice) < MAX_PRICE) query.maxPrice = filters.maxPrice;
  if (filters.duration && filters.duration !== 'any') query.duration = filters.duration;
  return query;
};

const fetchPackagesFromQuery = async (query) => {
  const packages = await getPackages(query);
  const search = query.search;
  const usedPlainSearch = search && Object.keys(query).length === 1 && query.search === search;

  if (packages.length || !usedPlainSearch) {
    return packages;
  }

  for (const key of ['country', 'city', 'continent', 'category']) {
    const fallbackPackages = await getPackages({ [key]: search });
    if (fallbackPackages.length) {
      return fallbackPackages;
    }
  }

  return packages;
};

const getUrlSearchValue = (searchParams) =>
  searchParams.get('search') ||
  searchParams.get('destination') ||
  searchParams.get('city') ||
  searchParams.get('country') ||
  searchParams.get('continent') ||
  searchParams.get('category') ||
  '';

const formatHeadingValue = (value) =>
  String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const normalizeFilterOptions = (data) => {
  const tourTypes = Array.isArray(data?.tour_types) && data.tour_types.length
    ? data.tour_types.map((item) => ({
        key: item.key || item.slug || item.name || String(item.id || ''),
        label: item.label || item.name || item.key || 'Type',
        count: Number(item.count) || 0,
      }))
    : DEFAULT_TOUR_TYPES;

  const durations = Array.isArray(data?.durations) && data.durations.length
    ? data.durations.map((item) => ({
        key: item.key || item.label,
        label: item.label || item.key,
        min: item.min,
        max: item.max,
        count: Number(item.count) || 0,
      }))
    : DEFAULT_DURATIONS;

  const priceRange = data?.price_range || {};
  const maxPrice = Number(priceRange.max ?? priceRange.selected_max ?? MAX_PRICE) || MAX_PRICE;

  return {
    search: data?.search || { query: '', placeholder: 'search destinations, cities, activities & travel tips' },
    total: Number(data?.total) || 0,
    tourTypes,
    durations,
    priceRange: {
      min: Number(priceRange.min ?? priceRange.selected_min ?? 0) || 0,
      max: maxPrice,
      selectedMin: Number(priceRange.selected_min ?? priceRange.min ?? 0) || 0,
      selectedMax: Number(priceRange.selected_max ?? priceRange.max ?? maxPrice) || maxPrice,
    },
  };
};

const getTourTypeLabel = (filterOptions, selectedKey) =>
  filterOptions.tourTypes.find((item) => item.key === selectedKey)?.label || 'All';

const getDurationMeta = (filterOptions, selectedKey) =>
  filterOptions.durations.find((item) => item.key === selectedKey) || DEFAULT_DURATIONS[0];

const PRIMARY_TOUR_TYPES = ['honeymoon', 'group', 'beach', 'family'];

const normalizeTypeName = (value) => String(value || '').toLowerCase().trim();

const isPrimaryTourType = (type, primaryName) =>
  normalizeTypeName(type.key) === primaryName || normalizeTypeName(type.label) === primaryName;

function FilterSidebar({
  filters,
  setFilters,
  resetFilters,
  filterOptions,
}) {
  const priceMax = filterOptions.priceRange.max || MAX_PRICE;
  const [showAllTypes, setShowAllTypes] = useState(false);

  const allTypes = filterOptions.tourTypes || [];
  const allOption = allTypes.find((t) => normalizeTypeName(t.key) === 'all');
  const primaryOptions = PRIMARY_TOUR_TYPES.map((name) => (
    allTypes.find((t) => isPrimaryTourType(t, name)) || {
      key: name.charAt(0).toUpperCase() + name.slice(1),
      label: name.charAt(0).toUpperCase() + name.slice(1),
      count: 0,
    }
  ));
  const otherOptions = allTypes.filter(
    (t) => normalizeTypeName(t.key) !== 'all' && !PRIMARY_TOUR_TYPES.some((name) => isPrimaryTourType(t, name))
  );
  const selectedIsOther = otherOptions.some((t) => t.key === filters.type);
  const isOthersVisible = showAllTypes || selectedIsOther;

  const renderTypeOption = (type) => {
    const isSelected = filters.type === type.key;
    return (
      <label
        key={type.key}
        className="d-flex align-items-center gap-2"
        style={{ cursor: 'pointer', fontSize: 13.5, color: isSelected ? '#111827' : '#4B5563', fontWeight: isSelected ? 700 : 500 }}
      >
        <input
          type="radio"
          name="tourType"
          value={type.key}
          checked={isSelected}
          onChange={() => setFilters({ ...filters, type: type.key })}
          style={{ accentColor: 'var(--color-primary, #E98216)', width: 16, height: 16 }}
        />
        {type.label}
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            background: isSelected ? 'rgba(233,130,22,0.1)' : '#f3f4f6',
            color: isSelected ? 'var(--color-primary, #E98216)' : '#6b7280',
            padding: '2px 8px',
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          {type.count || 0}
        </span>
      </label>
    );
  };

  return (
    <div className="filter-sidebar" style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
      <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          FILTER SECTION
        </h3>
        <button
          onClick={resetFilters}
          style={{ fontSize: 12, color: 'var(--color-primary, #E98216)', cursor: 'pointer', fontWeight: 700, border: 'none', background: 'none' }}
        >
          Reset All
        </button>
      </div>

      {/* Tour Type */}
      <div className="filter-group mb-4 pb-3 border-bottom">
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
          TOUR TYPE
        </div>
        <div className="d-flex flex-column gap-2">
          {allOption && renderTypeOption(allOption)}
          {primaryOptions.map(renderTypeOption)}

          {otherOptions.length > 0 && isOthersVisible && (
            <div
              className="d-flex flex-column gap-2"
              style={{
                marginTop: 4,
                paddingTop: 10,
                borderTop: '1px dashed #e5e7eb',
                maxHeight: 220,
                overflowY: 'auto',
                paddingRight: 4,
                animation: 'fadeUp 0.25s ease',
              }}
            >
              {otherOptions.map(renderTypeOption)}
            </div>
          )}
        </div>

        {otherOptions.length > 0 && !selectedIsOther && (
          <button
            type="button"
            onClick={() => setShowAllTypes((prev) => !prev)}
            style={{
              marginTop: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              fontWeight: 700,
              color: 'var(--color-primary, #E98216)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            {showAllTypes ? 'Show less' : `Show all (${otherOptions.length} more)`}
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ transform: showAllTypes ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="filter-group mb-4 pb-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            PRICE RANGE
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary, #E98216)' }}>
            ₹{formatPriceNumber(filters.maxPrice)}
          </span>
        </div>
        <input
          type="range"
          className="range-slider w-100"
          min={filterOptions.priceRange.min || 0}
          max={priceMax}
          step={5000}
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
          style={{
            '--value': `${Math.min(100, Math.max(0, ((Number(filters.maxPrice) - (filterOptions.priceRange.min || 0)) / Math.max(1, priceMax - (filterOptions.priceRange.min || 0))) * 100))}%`,
            height: 6,
            margin: '10px 0 4px',
            background: `linear-gradient(to right, var(--color-primary, #E98216) 0%, var(--color-primary, #E98216) var(--value), #e5e7eb var(--value), #e5e7eb 100%)`,
            cursor: 'pointer',
          }}
        />
        <div className="d-flex justify-content-between mt-1" style={{ fontSize: 11, color: '#9ca3af' }}>
          <span>₹{formatPriceNumber(filterOptions.priceRange.min || 0)}</span>
          <span>₹{formatPriceNumber(priceMax)}</span>
        </div>
      </div>

      {/* Duration */}
      <div className="filter-group">
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
          DURATION
        </div>
        <div className="d-flex flex-column gap-2">
          {filterOptions.durations.map((dur) => (
            <label
              key={dur.key}
              className="d-flex align-items-center gap-2"
              style={{ cursor: 'pointer', fontSize: 13.5, color: filters.duration === dur.key ? '#111827' : '#4B5563', fontWeight: filters.duration === dur.key ? 700 : 500 }}
            >
              <input
                type="radio"
                name="duration"
                value={dur.key}
                checked={filters.duration === dur.key}
                onChange={() => setFilters({ ...filters, duration: dur.key })}
                style={{ accentColor: 'var(--color-primary, #E98216)', width: 16, height: 16 }}
              />
              {dur.label}
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 11,
                  background: '#f3f4f6',
                  color: '#6b7280',
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontWeight: 600,
                }}
              >
                {dur.count || 0}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToursContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itineraryDestination = searchParams.get('destination');
  const isItineraryView = searchParams.get('view') === 'itinerary';
  const packageSlug = searchParams.get('package') || searchParams.get('slug');
  const initialSearch = getUrlSearchValue(searchParams);
  const overviewTitleRaw = searchParams.get('destination') || searchParams.get('search');
  const destinationHeading = overviewTitleRaw ? `${formatHeadingValue(overviewTitleRaw)} Tour Packages` : 'Holiday Tour Packages';

  const [activeRegion, setActiveRegion] = useState('North India');
  const [activeIntlRegion, setActiveIntlRegion] = useState('Southeast Asia');
  const [activeCityPill, setActiveCityPill] = useState(initialSearch || 'All');
  const [activeTab, setActiveTab] = useState('CITY GUIDE');
  const [activeGuideTab, setActiveGuideTab] = useState('CITY GUIDE');
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiTours, setApiTours] = useState([]);
  const [filterOptions, setFilterOptions] = useState(() => normalizeFilterOptions(null));
  const [filters, setFilters] = useState({
    type: searchParams.get('tour_type') || searchParams.get('type') || 'all',
    minPrice: 0,
    maxPrice: Number(searchParams.get('maxPrice')) || MAX_PRICE,
    duration: searchParams.get('duration') || 'any',
    minRating: 0,
    sort: 'featured',
    search: initialSearch,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
  const [searchInputVal, setSearchInputVal] = useState(initialSearch || '');
  const navTabsContainerRef = useRef(null);
  const createPackageTrackRef = useRef(null);
  const [activeArchIndex, setActiveArchIndex] = useState(0);

  const scrollArchCard = (direction) => {
    if (!createPackageTrackRef.current) return;
    const container = createPackageTrackRef.current;
    const total = PACKAGE_ARCHETYPES.length;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    if (isMobile) {
      let nextIndex;
      if (direction === 'next') {
        nextIndex = activeArchIndex < total - 1 ? activeArchIndex + 1 : 0;
      } else {
        nextIndex = activeArchIndex > 0 ? activeArchIndex - 1 : total - 1;
      }
      setActiveArchIndex(nextIndex);
      const cardWidth = container.clientWidth;
      container.scrollTo({
        left: nextIndex * cardWidth,
        behavior: 'smooth',
      });
    } else {
      const scrollStep = 250;
      container.scrollBy({
        left: direction === 'next' ? scrollStep : -scrollStep,
        behavior: 'smooth',
      });
    }
  };

  const handleArchScroll = () => {
    if (!createPackageTrackRef.current) return;
    const container = createPackageTrackRef.current;
    const cardWidth = container.clientWidth;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    if (isMobile && cardWidth > 0) {
      const idx = Math.round(container.scrollLeft / cardWidth);
      if (idx !== activeArchIndex && idx >= 0 && idx < PACKAGE_ARCHETYPES.length) {
        setActiveArchIndex(idx);
      }
    }
  };

  const { search, type, minPrice, maxPrice, duration } = filters;

  const activePackageQuery = useMemo(
    () => buildApiQueryFromFilters({ search, type, minPrice, maxPrice, duration }),
    [search, type, minPrice, maxPrice, duration]
  );

  const guideData = useMemo(() => {
    return getDestinationGuideContent(overviewTitleRaw || filters.search);
  }, [overviewTitleRaw, filters.search]);

  useEffect(() => {
    let isMounted = true;
    const loadPackages = async () => {
      setLoading(true);
      const packages = await fetchPackagesFromQuery(activePackageQuery);

      if (isMounted) {
        setApiTours(packages.map(normalizePackageToTour).filter(Boolean));
        setLoading(false);
      }
    };

    loadPackages();

    return () => {
      isMounted = false;
    };
  }, [activePackageQuery]);

  useEffect(() => {
    let isMounted = true;

    const loadFilterOptions = async () => {
      const data = await getPackageFilters(activePackageQuery);
      if (!isMounted) return;

      const nextOptions = normalizeFilterOptions(data);
      setFilterOptions(nextOptions);

      setFilters((current) => (
        current.maxPrice === MAX_PRICE && nextOptions.priceRange.max
          ? { ...current, maxPrice: nextOptions.priceRange.selectedMax || nextOptions.priceRange.max }
          : current
      ));
    };

    loadFilterOptions();

    return () => {
      isMounted = false;
    };
  }, [activePackageQuery]);

  const isIndianPage = useMemo(() => {
    const raw = String(overviewTitleRaw || filters.search || '').toLowerCase().trim();
    if (raw === 'international' || raw.includes('international')) return false;
    if (!raw || raw === 'india' || raw === 'indian') return true;
    const indianKeywords = [
      'kashmir', 'kerala', 'goa', 'rajasthan', 'himachal', 'uttarakhand',
      'ladakh', 'sikkim', 'delhi', 'mumbai', 'jaipur', 'agra', 'manali',
      'shimla', 'ooty', 'munnar', 'darjeeling', 'andaman', 'udaipur', 'jodhpur',
      'rishikesh', 'varanasi', 'mysore', 'hampi', 'khajuraho', 'bhopal', 'pachmarhi',
      'kutch', 'gujarat', 'maharashtra', 'tamil nadu', 'karnataka', 'assam', 'meghalaya',
      'north india', 'south india', 'east india', 'west india', 'central india'
    ];
    return indianKeywords.some((k) => raw.includes(k));
  }, [overviewTitleRaw, filters.search]);

  const filteredTours = useMemo(() => {
    let result = [...apiTours];

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      const indianKeys = [
        'india', 'kashmir', 'kerala', 'goa', 'rajasthan', 'himachal', 'uttarakhand',
        'ladakh', 'sikkim', 'delhi', 'mumbai', 'jaipur', 'agra', 'manali',
        'shimla', 'ooty', 'munnar', 'darjeeling', 'andaman'
      ];
      if (q === 'india' || q === 'indian') {
        const indianMatches = result.filter((t) => {
          const hay = `${t.title || ''} ${t.location || ''} ${t.country || ''} ${t.continent || ''} ${t.dest || ''}`.toLowerCase();
          return indianKeys.some((k) => hay.includes(k));
        });
        if (indianMatches.length > 0) {
          result = indianMatches;
        }
      } else if (q === 'international') {
        const intlKeys = [
          'bali', 'dubai', 'uae', 'thailand', 'bangkok', 'phuket', 'maldives',
          'singapore', 'switzerland', 'vietnam', 'paris', 'london', 'europe',
          'malaysia', 'sri lanka', 'mauritius', 'japan', 'turkey', 'georgia',
          'baku', 'egypt', 'almaty', 'tashkent', 'rome', 'greece', 'spain',
          'international'
        ];
        const intlMatches = result.filter((t) => {
          const hay = `${t.title || ''} ${t.location || ''} ${t.country || ''} ${t.continent || ''} ${t.dest || ''}`.toLowerCase();
          return intlKeys.some((k) => hay.includes(k));
        });
        if (intlMatches.length > 0) {
          result = intlMatches;
        }
      } else {
        result = result.filter(
          (t) =>
            (t.title || '').toLowerCase().includes(q) ||
            (t.location || '').toLowerCase().includes(q) ||
            (t.country || '').toLowerCase().includes(q) ||
            (t.continent || '').toLowerCase().includes(q) ||
            (t.dest || '').toLowerCase().includes(q)
        );
      }
    }

    result = result.filter(
      (t) => t.price >= filters.minPrice && t.price <= filters.maxPrice
    );

    if (filters.duration !== 'any') {
      const durationMeta = getDurationMeta(filterOptions, filters.duration);
      const min = Number(durationMeta.min) || 0;
      const max = durationMeta.max === null || durationMeta.max === undefined ? 999 : Number(durationMeta.max);
      result = result.filter((t) => t.duration >= min && t.duration <= max);
    }

    if (filters.minRating > 0) {
      result = result.filter((t) => (t.rating || 4.8) >= filters.minRating);
    }

    switch (filters.sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'duration-asc':
        result.sort((a, b) => (a.duration || 0) - (b.duration || 0));
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [apiTours, filters, filterOptions]);

  const resetFilters = () => {
    setFilters({
      type: 'all',
      minPrice: filterOptions.priceRange.min || 0,
      maxPrice: MAX_PRICE,
      duration: 'any',
      minRating: 0,
      sort: 'featured',
      search: '',
    });
    setSearchInputVal('');
    setActiveCityPill('All');
  };

  const handleSidebarDestSelect = (destKey) => {
    if (destKey === 'All' || destKey === 'All Indian') {
      setActiveCityPill('All');
      setFilters((prev) => ({ ...prev, search: '' }));
      setSearchInputVal('');
      router.push('/packages?destination=India', { scroll: false });
    } else if (destKey === 'All International') {
      setActiveCityPill('All');
      setFilters((prev) => ({ ...prev, search: 'international' }));
      setSearchInputVal('International');
      router.push('/packages?destination=International', { scroll: false });
    } else {
      setActiveCityPill(destKey);
      setFilters((prev) => ({ ...prev, search: destKey }));
      setSearchInputVal(destKey);
      router.push(`/packages?destination=${encodeURIComponent(destKey)}`, { scroll: false });
    }
  };

  const handleHeroSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInputVal }));
    const dealsElem = document.getElementById('package-deals');
    if (dealsElem) {
      dealsElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCityPillClick = (city) => {
    setActiveCityPill(city);
    if (city === 'All') {
      setFilters((prev) => ({ ...prev, search: '' }));
      setSearchInputVal('');
      router.push('/packages?destination=India', { scroll: false });
      const dealsElem = document.getElementById('package-deals');
      if (dealsElem) dealsElem.scrollIntoView({ behavior: 'smooth' });
    } else {
      setFilters((prev) => ({ ...prev, search: city }));
      setSearchInputVal(city);
      setIsOverviewExpanded(true);
      setActiveGuideTab('CITY GUIDE');
      setActiveTab('CITY GUIDE');
      router.push(`/packages?destination=${encodeURIComponent(city)}`, { scroll: false });
      const scrollToDetail = () => {
        const guideElem = document.getElementById('city-guide');
        if (guideElem) {
          guideElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
      scrollToDetail();
      setTimeout(scrollToDetail, 60);
    }
  };

  const handleRegionCardClick = (destName) => {
    setActiveCityPill(destName);
    setFilters((prev) => ({ ...prev, search: destName, type: 'all' }));
    setSearchInputVal(destName);
    setIsOverviewExpanded(true);
    setActiveGuideTab('CITY GUIDE');
    setActiveTab('CITY GUIDE');
    router.push(`/packages?destination=${encodeURIComponent(destName)}`, { scroll: false });

    const scrollToDetail = () => {
      const guideElem = document.getElementById('city-guide');
      if (guideElem) {
        guideElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    scrollToDetail();
    setTimeout(scrollToDetail, 60);
  };

  const handleFeaturedDestClick = (destName) => {
    setActiveCityPill(destName);
    setFilters((prev) => ({ ...prev, search: destName, type: 'all' }));
    setSearchInputVal(destName);
    setIsOverviewExpanded(true);
    setActiveGuideTab('CITY GUIDE');
    setActiveTab('CITY GUIDE');
    router.push(`/packages?destination=${encodeURIComponent(destName)}`, { scroll: false });

    const scrollToDetail = () => {
      const guideElem = document.getElementById('city-guide');
      if (guideElem) {
        guideElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    scrollToDetail();
    setTimeout(scrollToDetail, 60);
  };
  const handleInternationalDestClick = handleFeaturedDestClick;

  const centerTabInNav = (tabKey) => {
    if (typeof window === 'undefined') return;
    const tabId = `tab-btn-${String(tabKey || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const btn = document.getElementById(tabId);
    const container = navTabsContainerRef.current || document.getElementById('nav-tabs-ribbon-container');
    if (btn && container) {
      const containerWidth = container.offsetWidth;
      const btnLeft = btn.offsetLeft;
      const btnWidth = btn.offsetWidth;
      const targetScroll = btnLeft - (containerWidth / 2) + (btnWidth / 2);
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    centerTabInNav(activeTab);
  }, [activeTab]);

  const handleNavTabClick = (tab) => {
    setActiveTab(tab);

    const guideTabs = ['CITY GUIDE', 'Places to visit', 'KNOW BEFORE YOU GO', 'Things to do', 'STAY & FOOD'];

    if (guideTabs.includes(tab)) {
      setActiveGuideTab(tab);
      setIsOverviewExpanded(true);

      setTimeout(() => {
        centerTabInNav(tab);
      }, 40);

      const sectionIdMap = {
        'CITY GUIDE': 'guide-section-city-guide',
        'KNOW BEFORE YOU GO': 'guide-section-know-before-you-go',
        'Places to visit': 'guide-section-places-to-visit',
        'Things to do': 'guide-section-things-to-do',
        'STAY & FOOD': 'guide-section-stay-food',
      };

      setTimeout(() => {
        const targetId = sectionIdMap[tab] || 'city-guide';
        const elem = document.getElementById(targetId) || document.getElementById('city-guide');
        if (elem) {
          const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
          elem.scrollIntoView({
            behavior: 'smooth',
            block: isMobile ? 'center' : 'start',
          });
        }
      }, 70);

      return;
    }

    if (tab === 'Travel Articles') {
      setTimeout(() => {
        centerTabInNav(tab);
      }, 40);

      setTimeout(() => {
        const elem = document.getElementById('trending-articles');
        if (elem) {
          const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
          elem.scrollIntoView({
            behavior: 'smooth',
            block: isMobile ? 'center' : 'start',
          });
        }
      }, 70);

      return;
    }
  };

  if (packageSlug || (itineraryDestination && isItineraryView)) {
    return <TourItineraryView destination={itineraryDestination} packageSlug={packageSlug} />;
  }

  const currentRegionMap = isIndianPage ? REGION_DESTINATIONS : INTERNATIONAL_REGION_DESTINATIONS;
  const currentActiveRegion = isIndianPage ? activeRegion : activeIntlRegion;
  const setCurrentActiveRegion = isIndianPage ? setActiveRegion : setActiveIntlRegion;
  const regionData = currentRegionMap[currentActiveRegion] || Object.values(currentRegionMap)[0];

  const activeCityList = isIndianPage ? INDIAN_MAJOR_CITIES_LIST : MAJOR_CITIES_LIST;
  const activeDestScope = isIndianPage ? 'indian' : 'international';
  const activeFeaturedDestinations = isIndianPage ? FEATURED_INDIAN_DESTINATIONS : FEATURED_INTERNATIONAL_DESTINATIONS;

  return (
    <div style={{ background: '#fdfdfd', minHeight: '100vh', fontFamily: '"Inter", sans-serif', color: '#1f2937' }}>
      
      {/* ══════════════════════════════════════════════════════════
          1. HERO BANNER (Matches Image 1)
      ══════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        width: '100%',
        minHeight: 680,
        height: '84vh',
        maxHeight: 880,
        overflow: 'hidden',
        background: '#1a1008',
      }}>
        {/* Background Image with warm golden hour vibes */}
        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=85"
          alt="Holiday Tour Packages"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', zIndex: 0 }}
        />

        {/* Warm Golden Hour Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: 'linear-gradient(180deg, rgba(35, 18, 5, 0.45) 0%, rgba(25, 12, 4, 0.35) 45%, rgba(15, 7, 2, 0.75) 100%)',
        }} />

        {/* Centered Heading */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 24px 80px 24px',
        }}>
          <h1 style={{
            fontFamily: '"Italiana", serif',
            fontWeight: 800,
            fontSize: 'clamp(40px, 6.2vw, 76px)',
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.12,
            letterSpacing: 2.5,
            textTransform: 'uppercase',
            textShadow: '0 4px 30px rgba(0,0,0,0.55)',
          }}>
            {overviewTitleRaw ? `${formatHeadingValue(overviewTitleRaw).toUpperCase()} TOUR PACKAGES` : 'HOLIDAY TOUR PACKAGES'}
          </h1>
        </div>

        {/* Hero Search Bar Pill - Just Above Bottom Section */}
        <div style={{
          position: 'absolute',
          bottom: 54,
          left: 0,
          right: 0,
          zIndex: 3,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 20px',
        }}>
          <form
            onSubmit={handleHeroSearchSubmit}
            style={{
              width: '100%',
              maxWidth: 680,
              display: 'flex',
              alignItems: 'center',
              background: '#ffffff',
              borderRadius: 999,
              padding: '9px 12px 9px 28px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.28)',
              border: '1.5px solid rgba(255, 255, 255, 0.85)',
            }}
          >
            <input
              type="text"
              placeholder="search destinations, cities, activities & travel tips"
              value={searchInputVal}
              onChange={(e) => setSearchInputVal(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: 15.5,
                color: '#1f2937',
                fontStyle: 'italic',
                background: 'transparent',
              }}
            />
            <button
              type="submit"
              aria-label="Search"
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'transparent',
                border: 'none',
                color: '#4b5563',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2 & 3. DESTINATION GUIDE WRAPPER WITH STICKY FLOATING SUB-NAVBAR
          (Sticks/hovers while accessing read more section till read more button)
      ══════════════════════════════════════════════════════════ */}
      <div
        id="destination-guide-wrapper"
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        {/* Floating / Sticky Sub-Nav Tabs Ribbon (Matches Image 1) */}
        <div
          style={{
            position: 'sticky',
            top: 72,
            zIndex: 95,
            maxWidth: 1200,
            margin: '-24px auto 0 auto',
            padding: '0 16px',
            transition: 'all 0.25s ease',
          }}
        >
          <div
            ref={navTabsContainerRef}
            id="nav-tabs-ribbon-container"
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 14,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              padding: '2px 8px',
              scrollBehavior: 'smooth',
            }}
          >
            {[
              'CITY GUIDE',
              'Places to visit',
              'KNOW BEFORE YOU GO',
              'Things to do',
              'STAY & FOOD',
              'Travel Articles',
            ].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  id={`tab-btn-${tab.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  onClick={() => handleNavTabClick(tab)}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--color-primary, #E98216)';
                      e.currentTarget.style.background = 'rgba(233, 130, 22, 0.06)';
                      e.currentTarget.style.borderBottomColor = 'rgba(233, 130, 22, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#374151';
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.borderBottomColor = 'transparent';
                    }
                  }}
                  style={{
                    flex: '1 0 auto',
                    padding: '16px 20px',
                    background: isActive ? 'rgba(233, 130, 22, 0.06)' : 'none',
                    border: 'none',
                    borderBottom: isActive ? '3px solid var(--color-primary, #E98216)' : '3px solid transparent',
                    color: isActive ? 'var(--color-primary, #E98216)' : '#374151',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    fontStyle: 'normal',
                    letterSpacing: 0.5,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '8px 8px 0 0',
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <div className="container" style={{ maxWidth: 1240, margin: '0 auto', padding: '36px 16px 20px' }}>

          {/* ══════════════════════════════════════════════════════════
              3. CITY GUIDE / OVERVIEW SECTION (Navigated from Above Navbar)
          ══════════════════════════════════════════════════════════ */}
          <section id="city-guide" style={{ marginBottom: 20, paddingTop: 8, scrollMarginTop: 140 }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: '32px 36px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9',
              transition: 'all 0.3s ease',
            }}>
              {/* Main Header */}
              <h2 className="mobile-text-center" style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 10px 0' }}>
                {guideData.mainHeading || (overviewTitleRaw ? `${formatHeadingValue(overviewTitleRaw)} Travel Guide` : 'Holiday Tour Packages & Destinations Guide')}
              </h2>
              <div
                className={`city-guide-summary ${!isOverviewExpanded ? 'mobile-clamp-3' : ''}`}
                style={{ fontSize: 14.5, color: '#4b5563', lineHeight: 1.8, margin: '0 0 22px 0' }}
              >
                {Array.isArray(guideData.cityGuide.summary) ? (
                  guideData.cityGuide.summary.map((para, i) => (
                    <p key={i} style={{ margin: i === 0 ? '0 0 10px 0' : 0 }}>
                      {para}
                    </p>
                  ))
                ) : (
                  <p style={{ margin: 0 }}>{guideData.cityGuide.summary}</p>
                )}
              </div>

              {/* Expanded Content Section navigated from the above hovering navbar */}
              {isOverviewExpanded && (
                <div style={{ animation: 'fadeUp 0.3s ease' }}>

                  {/* 1. OVERVIEW & HIGHLIGHTS CONTENT */}
                  {(activeGuideTab === 'CITY GUIDE' || activeGuideTab === 'ALL') && (
                    <div id="guide-section-city-guide">
                      <div style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: 16.5, fontWeight: 800, color: '#111827', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>🏛️</span> {guideData.cityGuide.title}
                        </h3>
                        <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
                          {guideData.cityGuide.whyVisit}
                        </p>
                      </div>

                      <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--color-primary, #E98216)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        🌟 Key Highlights & Regions
                      </h4>
                      <div className="row g-3">
                        {guideData.cityGuide.highlights.map((item, idx) => (
                          <div key={idx} className="col-12 col-md-6">
                            <div style={{
                              background: '#f9fafb',
                              border: '1px solid #f3f4f6',
                              borderRadius: 14,
                              padding: '16px 18px',
                              height: '100%',
                            }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                                {item.title}
                              </div>
                              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                                {item.desc}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Section 1 Navigation Footer */}
                      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, padding: '12px 18px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Section 1 of 5: Overview & Highlights</span>
                        <button
                          onClick={() => handleNavTabClick('KNOW BEFORE YOU GO')}
                          style={{ background: 'none', border: 'none', color: 'var(--color-primary, #E98216)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                        >
                          Next: 2. Know Before You Go →
                        </button>
                      </div>
                    </div>
                  )}

                  {activeGuideTab === 'ALL' && <hr style={{ margin: '36px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />}

                  {/* 2. KNOW BEFORE YOU GO CONTENT */}
                  {(activeGuideTab === 'KNOW BEFORE YOU GO' || activeGuideTab === 'ALL') && (
                    <div id="guide-section-know-before-you-go">
                      <h3 style={{ fontSize: 16.5, fontWeight: 800, color: '#111827', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>🛂</span> {guideData.knowBeforeYouGo.title}
                      </h3>
                      <div className="d-flex flex-column gap-3">
                        {guideData.knowBeforeYouGo.tips.map((tip, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 14,
                            background: '#f9fafb',
                            border: '1px solid #f3f4f6',
                            borderRadius: 14,
                            padding: '16px 18px',
                          }}>
                            <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{tip.icon}</div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                                {tip.label}
                              </div>
                              <div style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.65 }}>
                                {tip.text}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Section 2 Navigation Footer */}
                      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, padding: '12px 18px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                        <button
                          onClick={() => handleNavTabClick('CITY GUIDE')}
                          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                        >
                          ← Previous: Overview
                        </button>
                        <button
                          onClick={() => handleNavTabClick('Places to visit')}
                          style={{ background: 'none', border: 'none', color: 'var(--color-primary, #E98216)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                        >
                          Next: 3. Must-Visit Places →
                        </button>
                      </div>
                    </div>
                  )}

                  {activeGuideTab === 'ALL' && <hr style={{ margin: '36px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />}

                  {/* 3. MUST-VISIT CITIES & PLACES CONTENT (Points Only) */}
                  {(activeGuideTab === 'Places to visit' || activeGuideTab === 'ALL') && guideData.placesToVisit && (
                    <div id="guide-section-places-to-visit">
                      <h3 style={{ fontSize: 16.5, fontWeight: 800, color: '#111827', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>📍</span> {guideData.placesToVisit.title}
                      </h3>

                      {guideData.placesToVisit.points ? (
                        <div className="d-flex flex-column gap-2.5">
                          {guideData.placesToVisit.points.map((pt, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 12,
                                background: '#f9fafb',
                                border: '1px solid #f3f4f6',
                                borderRadius: 12,
                                padding: '13px 18px',
                              }}
                            >
                              <span style={{ color: 'var(--color-primary, #E98216)', fontSize: 18, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>
                                •
                              </span>
                              <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.65 }}>
                                <strong style={{ color: '#111827', fontWeight: 700 }}>{pt.city}:</strong>{' '}
                                <span>{pt.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-2.5">
                          {guideData.placesToVisit.places?.map((place, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 12,
                                background: '#f9fafb',
                                border: '1px solid #f3f4f6',
                                borderRadius: 12,
                                padding: '13px 18px',
                              }}
                            >
                              <span style={{ color: 'var(--color-primary, #E98216)', fontSize: 18, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>
                                •
                              </span>
                              <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.65 }}>
                                <strong style={{ color: '#111827', fontWeight: 700 }}>{place.name}:</strong>{' '}
                                <span>{place.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Section 3 Navigation Footer */}
                      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, padding: '12px 18px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                        <button
                          onClick={() => handleNavTabClick('KNOW BEFORE YOU GO')}
                          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                        >
                          ← Previous: Know Before You Go
                        </button>
                        <button
                          onClick={() => handleNavTabClick('Things to do')}
                          style={{ background: 'none', border: 'none', color: 'var(--color-primary, #E98216)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                        >
                          Next: 4. Things to Do →
                        </button>
                      </div>
                    </div>
                  )}

                  {activeGuideTab === 'ALL' && <hr style={{ margin: '36px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />}

                  {/* 4. THINGS TO DO CONTENT */}
                  {(activeGuideTab === 'Things to do' || activeGuideTab === 'ALL') && (
                    <div id="guide-section-things-to-do">
                      <h3 style={{ fontSize: 16.5, fontWeight: 800, color: '#111827', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>🎯</span> {guideData.thingsToDo.title}
                      </h3>
                      <div className="row g-3">
                        {guideData.thingsToDo.activities.map((act, idx) => (
                          <div key={idx} className="col-12 col-md-6 col-lg-4">
                            <div style={{
                              background: '#f9fafb',
                              border: '1px solid #f3f4f6',
                              borderRadius: 14,
                              padding: '18px',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                            }}>
                              <div style={{ fontSize: 24, marginBottom: 8 }}>{act.icon}</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                                {act.title}
                              </div>
                              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, flex: 1 }}>
                                {act.desc}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Section 4 Navigation Footer */}
                      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, padding: '12px 18px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                        <button
                          onClick={() => handleNavTabClick('Places to visit')}
                          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                        >
                          ← Previous: Must-Visit Places
                        </button>
                        <button
                          onClick={() => handleNavTabClick('STAY & FOOD')}
                          style={{ background: 'none', border: 'none', color: 'var(--color-primary, #E98216)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                        >
                          Next: 5. Stay, Food & Shopping →
                        </button>
                      </div>
                    </div>
                  )}

                  {activeGuideTab === 'ALL' && <hr style={{ margin: '36px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />}

                  {/* 5. STAY, FOOD & SHOPPING CONTENT */}
                  {(activeGuideTab === 'STAY & FOOD' || activeGuideTab === 'ALL') && (
                    <div id="guide-section-stay-food">
                      <h3 style={{ fontSize: 16.5, fontWeight: 800, color: '#111827', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>🏨</span> {guideData.stayAndFood.title}
                      </h3>

                      {/* Stays Sub-Block */}
                      <div style={{ marginBottom: 24 }}>
                        <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--color-primary, #E98216)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          🛌 Where to Stay & Accommodations
                        </h4>
                        <div className="row g-3">
                          {guideData.stayAndFood.stays.map((st, idx) => (
                            <div key={idx} className="col-12 col-md-4">
                              <div style={{
                                background: '#f9fafb',
                                border: '1px solid #f3f4f6',
                                borderRadius: 14,
                                padding: '16px',
                                height: '100%',
                              }}>
                                <div style={{ fontSize: 20, marginBottom: 6 }}>{st.icon}</div>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                                  {st.title}
                                </div>
                                <div style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.6 }}>
                                  {st.desc}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dining Sub-Block */}
                      <div>
                        <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--color-primary, #E98216)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          🍽️ Food & Dining Highlights
                        </h4>
                        <div className="row g-3">
                          {guideData.stayAndFood.dining.map((di, idx) => (
                            <div key={idx} className="col-12 col-md-4">
                              <div style={{
                                background: '#f9fafb',
                                border: '1px solid #f3f4f6',
                                borderRadius: 14,
                                padding: '16px',
                                height: '100%',
                              }}>
                                <div style={{ fontSize: 20, marginBottom: 6 }}>{di.icon}</div>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                                  {di.title}
                                </div>
                                <div style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.6 }}>
                                  {di.desc}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Dining Dietary Note */}
                        {guideData.stayAndFood.diningNote && (
                          <div style={{ marginTop: 14, padding: '12px 16px', background: '#ecfdf5', borderRadius: 12, border: '1px solid #a7f3d0', fontSize: 13, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 16 }}>🥗</span>
                            <span>{guideData.stayAndFood.diningNote}</span>
                          </div>
                        )}
                      </div>

                      {/* Shopping Sub-Block */}
                      {guideData.stayAndFood.shopping && (
                        <div style={{ marginTop: 26 }}>
                          <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--color-primary, #E98216)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            🛍️ What to Buy & Shopping Highlights
                          </h4>
                          <div className="row g-3">
                            {guideData.stayAndFood.shopping.map((sh, idx) => (
                              <div key={idx} className="col-12 col-md-6 col-lg-3">
                                <div style={{
                                  background: '#f9fafb',
                                  border: '1px solid #f3f4f6',
                                  borderRadius: 14,
                                  padding: '16px',
                                  height: '100%',
                                }}>
                                  <div style={{ fontSize: 20, marginBottom: 6 }}>{sh.icon}</div>
                                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                                    {sh.title}
                                  </div>
                                  <div style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.6 }}>
                                    {sh.desc}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {guideData.stayAndFood.shoppingTip && (
                            <div style={{ marginTop: 14, padding: '12px 16px', background: '#fffbeb', borderRadius: 12, border: '1px solid #fef3c7', fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 16 }}>💡</span>
                              <span>{guideData.stayAndFood.shoppingTip}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Section 5 Navigation Footer */}
                      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, padding: '12px 18px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                        <button
                          onClick={() => handleNavTabClick('Things to do')}
                          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                        >
                          ← Previous: Things to Do
                        </button>
                        <button
                          onClick={() => handleNavTabClick('CITY GUIDE')}
                          style={{ background: 'none', border: 'none', color: 'var(--color-primary, #E98216)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                        >
                          ↺ Back to Overview
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Read More / Read Less Toggle */}
              <div style={{ marginTop: 20, paddingTop: 14, borderTop: isOverviewExpanded ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <button
                  id="btn-read-more-guide"
                  onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary, #E98216)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: 0,
                  }}
                >
                  {isOverviewExpanded ? 'Read Less ↑' : 'Read More / Expand Guide ↓'}
                </button>

                {isOverviewExpanded && (
                  <button
                    onClick={() => setActiveGuideTab(activeGuideTab === 'ALL' ? 'CITY GUIDE' : 'ALL')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontWeight: 600,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: 0,
                    }}
                  >
                    {activeGuideTab === 'ALL' ? '📑 Switch to Single Tab View' : '📖 View All Sections Together'}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Main container for remainder of page */}
      <div className="container" style={{ maxWidth: 1240, margin: '0 auto', padding: '16px 16px 80px' }}>

        {/* ══════════════════════════════════════════════════════════
            4. EXPLORE DESTINATION / CITY BY REGION (Indian & International)
        ══════════════════════════════════════════════════════════ */}
        <section id="explore-regions" style={{ marginBottom: 56, paddingTop: 10 }}>
          {/* Header */}
          <div className="mobile-text-center" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
              {isIndianPage ? 'EXPLORE DESTINATION / CITY BY REGION' : 'EXPLORE INTERNATIONAL DESTINATIONS BY REGION'}
            </div>
            
            {/* Region Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              borderBottom: '1px solid #e5e7eb',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              paddingBottom: 2,
            }}>
              {Object.keys(currentRegionMap).map((region) => {
                const isActive = currentActiveRegion === region;
                return (
                  <button
                    key={region}
                    onClick={() => setCurrentActiveRegion(region)}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: isActive ? '3px solid var(--color-primary, #E98216)' : '3px solid transparent',
                      color: isActive ? '#111827' : '#6b7280',
                      fontWeight: isActive ? 800 : 500,
                      fontSize: 14,
                      padding: '8px 0 10px 0',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {region}
                  </button>
                );
              })}
            </div>
          </div>

            {/* 7-Card Grid (1 Large Left + 6 Small Right) */}
            <div className="row g-3">
              {/* Large Card on Left */}
              <div className="col-12 col-lg-5">
                <div
                  onClick={() => handleRegionCardClick(regionData.featured.name)}
                  style={{
                    position: 'relative',
                    height: 480,
                    borderRadius: 18,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
                  }}
                >
                  <Image
                    src={regionData.featured.image}
                    alt={regionData.featured.name}
                    fill
                    sizes="(max-width: 992px) 100vw, 40vw"
                    style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    className="hover-scale"
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: 24,
                    left: 24,
                    right: 24,
                    zIndex: 2,
                    color: '#ffffff',
                  }}>
                    <h3 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px 0', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                      {regionData.featured.name}
                    </h3>
                    <div style={{
                      display: 'inline-block',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: 'rgba(255,255,255,0.9)',
                      textTransform: 'uppercase',
                    }}>
                      {regionData.featured.packagesCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* 6 Grid Cards on Right (2 rows x 3 cols) */}
              <div className="col-12 col-lg-7">
                <div className="row g-3">
                  {regionData.grid.map((item, idx) => (
                    <div key={idx} className="col-6 col-md-4">
                      <div
                        onClick={() => handleRegionCardClick(item.name)}
                        style={{
                          position: 'relative',
                          height: 232,
                          borderRadius: 16,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                        }}
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                          style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                          className="hover-scale"
                        />
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.8) 100%)',
                        }} />
                        <div style={{
                          position: 'absolute',
                          bottom: 14,
                          left: 14,
                          right: 14,
                          zIndex: 2,
                          color: '#ffffff',
                        }}>
                          <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 3px 0', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                            {item.name}
                          </h4>
                          <div style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: 0.8,
                            color: 'rgba(255,255,255,0.85)',
                            textTransform: 'uppercase',
                          }}>
                            {item.packagesCount}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

        {/* ══════════════════════════════════════════════════════════
            5. CITY EXPLORER SECTION (Matches Image 1)
        ══════════════════════════════════════════════════════════ */}
        <section id="city-explorer" style={{ marginBottom: 52 }}>
          <div className="mobile-text-center" style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 }}>
              CITY EXPLORER
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1.2, textTransform: 'uppercase' }}>
              DESTINATION / MAJOR CITIES
            </div>
          </div>

          {/* Filter Pills Cloud */}
          <div className="city-pills-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 10px', alignItems: 'center' }}>
            {activeCityList.map((city, index) => {
              const isSelected = activeCityPill.toLowerCase() === city.toLowerCase() || (city === 'All' && !filters.search);
              // On mobile, show 'All' + first 3 cities (indices 0, 1, 2, 3). Indices 4+ are hidden unless showAllCities is true or selected
              const isHiddenOnMobile = !showAllCities && index >= 4 && !isSelected;

              return (
                <button
                  key={city}
                  onClick={() => handleCityPillClick(city)}
                  className={isHiddenOnMobile ? 'city-explorer-mobile-hidden' : ''}
                  style={{
                    padding: '7px 18px',
                    borderRadius: 999,
                    fontSize: 12.5,
                    fontWeight: isSelected ? 700 : 500,
                    border: '1.2px solid',
                    borderColor: isSelected ? 'var(--color-primary, #E98216)' : '#e5e7eb',
                    background: isSelected ? 'var(--color-primary, #E98216)' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(233,130,22,0.25)' : 'none',
                  }}
                >
                  {city}
                </button>
              );
            })}
          </div>

          {activeCityList.length > 4 && (
            <div className="city-explorer-see-all-wrapper" style={{ marginTop: 14, display: 'none', justifyContent: 'center', width: '100%' }}>
              <button
                type="button"
                onClick={() => setShowAllCities((prev) => !prev)}
                className="city-explorer-see-all-btn"
                style={{
                  padding: '7px 22px',
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: '1.2px solid var(--color-primary, #E98216)',
                  background: showAllCities ? 'var(--color-primary, #E98216)' : 'rgba(233, 130, 22, 0.08)',
                  color: showAllCities ? '#ffffff' : 'var(--color-primary, #E98216)',
                  cursor: 'pointer',
                  display: 'none',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{showAllCities ? 'Show Less' : 'See All'}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: showAllCities ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════════════════════
            6. PACKAGE DEALS SECTION (Matches Image 1)
        ══════════════════════════════════════════════════════════ */}
        <section id="package-deals" style={{ marginBottom: 64, paddingTop: 10 }}>
          <div className="mobile-text-center" style={{ marginBottom: 20 }}>
            <h2 style={{
              fontFamily: '"Italiana", serif',
              fontSize: 26,
              fontWeight: 800,
              color: '#111827',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              margin: 0,
            }}>
              PACKAGE DEALS
            </h2>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="d-lg-none mb-3">
            <button
              className="btn-secondary w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ borderRadius: 12, padding: '10px 16px', fontWeight: 600 }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
              </svg>
              {sidebarOpen ? 'Hide Filters' : 'Show Filter Section'}
            </button>
            {sidebarOpen && (
              <div className="mt-3">
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  resetFilters={resetFilters}
                  filterOptions={filterOptions}
                />
              </div>
            )}
          </div>

          <div className="row g-4">
            {/* Left Filter Sidebar */}
            <div className="col-lg-3 d-none d-lg-block">
              <div style={{ position: 'sticky', top: 100 }}>
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  resetFilters={resetFilters}
                  filterOptions={filterOptions}
                />
              </div>
            </div>

            {/* Right Tour Cards Grid */}
            <div className="col-lg-9">
              {/* Header Sort & Counter */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4 pb-2 border-bottom">
                <div>
                  <span style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>
                    {filteredTours.length} Tours Found
                  </span>
                  {filters.type !== 'all' && (
                    <span style={{ color: '#6b7280', fontSize: 13, marginLeft: 8 }}>
                      in {getTourTypeLabel(filterOptions, filters.type)}
                    </span>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <label style={{ fontSize: 12.5, color: '#6b7280', whiteSpace: 'nowrap' }}>Sort by:</label>
                  <select
                    className="form-input"
                    style={{ width: 'auto', padding: '6px 14px', fontSize: 13, borderRadius: 8, borderColor: '#e5e7eb' }}
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                  >
                    {SORT_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filter Chips */}
              {(filters.type !== 'all' || filters.search || filters.minRating > 0 || filters.maxPrice < (filterOptions.priceRange.max || MAX_PRICE) || filters.duration !== 'any') && (
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {filters.type !== 'all' && (
                    <span className="badge" style={{ background: '#f3f4f6', color: '#1f2937', padding: '6px 12px', fontSize: 12, borderRadius: 999, border: '1px solid #e5e7eb' }}>
                      {getTourTypeLabel(filterOptions, filters.type)}
                      <button onClick={() => setFilters({ ...filters, type: 'all' })} style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: 6, fontWeight: 'bold' }}>×</button>
                    </span>
                  )}
                  {filters.search && (
                    <span className="badge" style={{ background: '#f3f4f6', color: '#1f2937', padding: '6px 12px', fontSize: 12, borderRadius: 999, border: '1px solid #e5e7eb' }}>
                      Search: {filters.search}
                      <button onClick={() => { setFilters({ ...filters, search: '' }); setSearchInputVal(''); setActiveCityPill('All'); }} style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: 6, fontWeight: 'bold' }}>×</button>
                    </span>
                  )}
                  {filters.maxPrice < (filterOptions.priceRange.max || MAX_PRICE) && (
                    <span className="badge" style={{ background: '#f3f4f6', color: '#1f2937', padding: '6px 12px', fontSize: 12, borderRadius: 999, border: '1px solid #e5e7eb' }}>
                      Max ₹{formatPriceNumber(filters.maxPrice)}
                      <button onClick={() => setFilters({ ...filters, maxPrice: filterOptions.priceRange.max || MAX_PRICE })} style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: 6, fontWeight: 'bold' }}>×</button>
                    </span>
                  )}
                  {filters.duration !== 'any' && (
                    <span className="badge" style={{ background: '#f3f4f6', color: '#1f2937', padding: '6px 12px', fontSize: 12, borderRadius: 999, border: '1px solid #e5e7eb' }}>
                      {getDurationMeta(filterOptions, filters.duration).label}
                      <button onClick={() => setFilters({ ...filters, duration: 'any' })} style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: 6, fontWeight: 'bold' }}>×</button>
                    </span>
                  )}
                  {filters.minRating > 0 && (
                    <span className="badge" style={{ background: '#f3f4f6', color: '#1f2937', padding: '6px 12px', fontSize: 12, borderRadius: 999, border: '1px solid #e5e7eb' }}>
                      Rating {filters.minRating}+
                      <button onClick={() => setFilters({ ...filters, minRating: 0 })} style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: 6, fontWeight: 'bold' }}>×</button>
                    </span>
                  )}
                </div>
              )}

              {/* Cards Grid */}
              <div className="row g-4">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="col-xl-4 col-lg-6 col-md-6 d-flex">
                      <TourCardSkeleton />
                    </div>
                  ))
                  : filteredTours.length > 0
                    ? filteredTours.map((tour) => (
                      <div key={tour.id} className="col-xl-4 col-lg-6 col-md-6 d-flex">
                        <TourCard tour={tour} />
                      </div>
                    ))
                    : (
                      <div className="col-12 text-center py-5">
                        <div style={{ fontSize: 42, marginBottom: 12 }}>🔍</div>
                        <h3 style={{ color: '#111827', fontWeight: 700, fontSize: 20 }}>No tours found</h3>
                        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
                          Try adjusting your search criteria or resetting filters
                        </p>
                        <button
                          className="btn-primary"
                          onClick={resetFilters}
                          style={{ borderRadius: 999, padding: '10px 24px' }}
                        >
                          Clear All Filters
                        </button>
                      </div>
                    )}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            POPULAR DESTINATIONS SHOWCASE (INDIAN & INTERNATIONAL)
            Shown After Filter Section (Package Deals)
        ══════════════════════════════════════════════════════════ */}
        <section id="popular-destinations" style={{ marginBottom: 64, paddingTop: 10 }}>
          <div className="mobile-text-center" style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
              {isIndianPage ? 'EXPLORE INCREDIBLE INDIA' : 'EXPLORE BEYOND BORDERS'}
            </div>
            <h2 style={{
              fontFamily: '"Italiana", serif',
              fontSize: 26,
              fontWeight: 800,
              color: '#111827',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              margin: 0,
            }}>
              {isIndianPage ? 'POPULAR INDIAN DESTINATIONS' : 'POPULAR INTERNATIONAL DESTINATIONS'}
            </h2>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 4 }}>
              {isIndianPage
                ? 'Handpicked domestic holidays with scenic landscapes, heritage stays & curated itineraries'
                : 'Handpicked world getaways with full destination guides, visa assistance & top deals'}
            </div>
          </div>

          <div className="row g-3">
            {activeFeaturedDestinations.map((item, idx) => (
              <div key={idx} className="col-12 col-sm-6 col-lg-3">
                <div
                  onClick={() => handleFeaturedDestClick(item.name)}
                  style={{
                    background: '#ffffff',
                    borderRadius: 18,
                    overflow: 'hidden',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  className="hover-lift"
                >
                  {/* Destination Image */}
                  <div style={{ position: 'relative', height: 185, width: '100%', overflow: 'hidden' }}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                      className="hover-scale"
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.68) 100%)',
                    }} />
                    
                    {/* Top Badges */}
                    <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                      <span style={{
                        background: 'rgba(0,0,0,0.65)',
                        backdropFilter: 'blur(8px)',
                        color: '#ffffff',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 999,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                      }}>
                        {item.packagesCount}
                      </span>
                      <span style={{
                        background: 'var(--color-primary, #E98216)',
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: 999,
                        boxShadow: '0 2px 8px rgba(233,130,22,0.4)',
                      }}>
                        From {item.price}
                      </span>
                    </div>

                    {/* Bottom Title on Image */}
                    <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14, zIndex: 2, color: '#ffffff' }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 2px 0', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                        {item.name}
                      </h3>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                        {item.country}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <p style={{
                      fontSize: 12.5,
                      color: '#4b5563',
                      lineHeight: 1.55,
                      margin: '0 0 12px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {item.desc}
                    </p>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {item.tags.map((tag, tIdx) => (
                        <span key={tIdx} style={{
                          fontSize: 10.5,
                          fontWeight: 600,
                          background: '#f8fafc',
                          color: '#475569',
                          padding: '3px 8px',
                          borderRadius: 6,
                          border: '1px solid #e2e8f0',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Action Button */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--color-primary, #E98216)',
                    }}>
                      <span>View Destination Guide & Tours</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            7. CREATE YOUR OWN PACKAGE (Matches Image 1)
        ══════════════════════════════════════════════════════════ */}
        <section id="create-package" style={{ marginBottom: 64, paddingTop: 10 }}>
          <div className="mobile-text-center" style={{ marginBottom: 20 }}>
            <h2 style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#111827',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              margin: 0,
            }}>
              CREATE YOUR OWN PACKAGE
            </h2>
          </div>

          <div style={{ position: 'relative' }}>
            {/* Left Prev Arrow Button */}
            <button
              type="button"
              aria-label="Previous card"
              onClick={() => scrollArchCard('prev')}
              className="create-package-arrow-btn create-package-arrow-prev"
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: '0 4px 15px rgba(0,0,0,0.18)',
                border: '1px solid #e5e7eb',
                display: 'none',
                placeItems: 'center',
                cursor: 'pointer',
                zIndex: 10,
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Track Container */}
            <div
              ref={createPackageTrackRef}
              onScroll={handleArchScroll}
              className="create-package-track"
              style={{
                display: 'flex',
                gap: 16,
                overflowX: 'auto',
                paddingTop: 24,
                paddingBottom: 24,
                scrollSnapType: 'x mandatory',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {PACKAGE_ARCHETYPES.map((arch, idx) => (
                <div key={idx} className="create-package-slide-wrap">
                  <Link
                    href={`/customize?step=0&subStep=room-config&traveller=${encodeURIComponent(arch.traveller)}`}
                    className="create-package-card hover-lift"
                    style={{
                      flex: '1 0 200px',
                      minWidth: 190,
                      maxWidth: 240,
                      height: 310,
                      position: 'relative',
                      borderRadius: '110px 110px 14px 14px',
                      overflow: 'hidden',
                      textDecoration: 'none',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      scrollSnapAlign: 'start',
                      display: 'block',
                    }}
                  >
                    <Image
                      src={arch.image}
                      alt={arch.title}
                      fill
                      sizes="240px"
                      style={{ objectFit: 'cover' }}
                    />
                    
                    {/* Heavy Bottom Dark Gradient Overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 35%, transparent 65%)',
                    }} />

                    {/* Bottom Info Overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: 20,
                      left: 0,
                      right: 0,
                      textAlign: 'center',
                      padding: '0 12px',
                      zIndex: 3,
                    }}>
                      <p style={{
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: 9.5,
                        fontWeight: 700,
                        letterSpacing: 1.5,
                        margin: '0 0 4px',
                        textTransform: 'uppercase',
                      }}>
                        {arch.traveller ? `${arch.traveller.toUpperCase()} TOUR PACKAGES` : 'CUSTOM TOUR PACKAGES'}
                      </p>
                      <h3 style={{
                        color: '#ffffff',
                        fontSize: 22,
                        fontWeight: 700,
                        margin: 0,
                        fontFamily: '"Italiana", "Playfair Display", serif',
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        textShadow: '0 2px 10px rgba(0,0,0,0.6)',
                      }}>
                        {arch.title}
                      </h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Right Next Arrow Button */}
            <button
              type="button"
              aria-label="Next card"
              onClick={() => scrollArchCard('next')}
              className="create-package-arrow-btn create-package-arrow-next"
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: '0 4px 15px rgba(0,0,0,0.18)',
                border: '1px solid #e5e7eb',
                display: 'none',
                placeItems: 'center',
                cursor: 'pointer',
                zIndex: 10,
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Dots Indicator for Mobile */}
          <div className="d-md-none" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 10 }}>
            {PACKAGE_ARCHETYPES.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === activeArchIndex ? 22 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: i === activeArchIndex ? 'var(--color-primary, #E98216)' : '#d1d5db',
                  transition: 'all 0.25s ease',
                }}
              />
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            8. TRENDING TRAVEL ARTICLES (Matches Image 1)
        ══════════════════════════════════════════════════════════ */}
        <section id="trending-articles" style={{ marginBottom: 40, paddingTop: 10 }}>
          <div className="mobile-text-center" style={{ marginBottom: 20 }}>
            <h2 style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#111827',
              margin: 0,
            }}>
              Trending travel articles
            </h2>
          </div>

          <div className="row g-4">
            {TRAVEL_ARTICLES.map((article, idx) => (
              <div key={idx} className="col-12 col-md-6 col-lg-3 d-flex">
                <Link
                  href={article.link}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    background: '#ffffff',
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                    textDecoration: 'none',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                  className="hover-lift"
                >
                  {/* Article Image */}
                  <div style={{ position: 'relative', height: 165, width: '100%' }}>
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>

                  {/* Article Body */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{
                      fontSize: 14.5,
                      fontWeight: 700,
                      color: '#111827',
                      lineHeight: 1.4,
                      marginBottom: 8,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {article.title}
                    </h3>

                    <p style={{
                      fontSize: 12.5,
                      color: '#6b7280',
                      lineHeight: 1.6,
                      marginBottom: 16,
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {article.summary}
                    </p>

                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
                      {article.date} • {article.author}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>


      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hover-scale:hover {
          transform: scale(1.05);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12) !important;
        }
        #nav-tabs-ribbon-container::-webkit-scrollbar {
          display: none;
        }
        #nav-tabs-ribbon-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        @media (min-width: 769px) {
          .create-package-track {
            padding-top: 24px !important;
            padding-bottom: 24px !important;
          }
          .create-package-slide-wrap {
            flex: 0 0 auto;
            padding: 8px 0 !important;
          }
          .create-package-card {
            width: 215px !important;
            min-width: 200px !important;
            max-width: 240px !important;
            height: 315px !important;
            border-radius: 110px 110px 14px 14px !important;
          }
          .create-package-arrow-prev,
          .create-package-arrow-next,
          .create-package-arrow-btn {
            display: none !important;
          }
          .city-explorer-see-all-wrapper,
          .city-explorer-see-all-btn {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .create-package-slide-wrap {
            flex: 0 0 100% !important;
            width: 100% !important;
            min-width: 100% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            scroll-snap-align: center !important;
            padding: 16px 0 !important;
          }
          .create-package-card {
            flex: 0 0 230px !important;
            width: 230px !important;
            min-width: 230px !important;
            max-width: 230px !important;
            height: 310px !important;
            border-radius: 115px 115px 14px 14px !important;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22) !important;
          }
          .create-package-arrow-btn {
            display: grid !important;
          }
          .create-package-arrow-prev {
            left: 14px !important;
            width: 42px !important;
            height: 42px !important;
            box-shadow: 0 4px 14px rgba(0,0,0,0.18) !important;
          }
          .create-package-arrow-next {
            right: 14px !important;
            width: 42px !important;
            height: 42px !important;
            box-shadow: 0 4px 14px rgba(0,0,0,0.18) !important;
          }
          .create-package-track {
            gap: 0 !important;
            padding-top: 16px !important;
            padding-bottom: 20px !important;
            scroll-snap-type: x mandatory !important;
            scroll-behavior: smooth !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
          }
          .create-package-track::-webkit-scrollbar {
            display: none !important;
          }
          .mobile-text-center {
            text-align: center !important;
          }
          .mobile-text-center h2,
          .mobile-text-center h3,
          .mobile-text-center div,
          .mobile-text-center p,
          .mobile-text-center span {
            text-align: center !important;
          }
          #city-explorer .city-pills-wrap {
            justify-content: center !important;
          }
          .city-explorer-mobile-hidden {
            display: none !important;
          }
          .city-explorer-see-all-wrapper {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
          }
          .city-explorer-see-all-btn {
            display: inline-flex !important;
          }
          .mobile-clamp-3 {
            display: -webkit-box !important;
            -webkit-line-clamp: 3 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          .mobile-clamp-3 p {
            display: inline !important;
            margin: 0 !important;
          }
          .mobile-clamp-3 p:not(:last-child)::after {
            content: " ";
          }
        }
      `}</style>
    </div>
  );
}

export default function ToursPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '80px 0', minHeight: '80vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✈️</div>
          <p style={{ color: '#6b7280', fontWeight: 600 }}>Loading destination packages...</p>
        </div>
      </div>
    }>
      <ToursContent />
    </Suspense>
  );
}
