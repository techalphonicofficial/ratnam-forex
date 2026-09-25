'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import TrendingTourCard from './TrendingTourCard';
import { getPackages, getPackageFilters, normalizePackageToTour } from '@/utils/api';
import CustomSelect from './CustomSelect';

const MAX_PRICE = 1000000;
const formatPriceNumber = (value) => Number(value || 0).toLocaleString('en-IN');

export default function TrendingToursSection({ themeClass = '' }) {
  const [loading, setLoading] = useState(true);
  const [apiTours, setApiTours] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    tourTypes: [],
    themes: ['Adventure', 'Nature', 'Heritage', 'Wildlife', 'Pilgrimage'],
    durations: [],
    hotelCategories: ['3 Star', '4 Star', '5 Star', 'Premium'],
    priceRange: { min: 0, max: MAX_PRICE, selectedMin: 0, selectedMax: MAX_PRICE }
  });

  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    theme: '',
    duration: 'any',
    hotelCategory: '',
    minPrice: 0,
    maxPrice: MAX_PRICE,
  });

  const [expandedSections, setExpandedSections] = useState({
    theme: true,
    duration: true,
    hotel: true,
    budget: true
  });

  const [showAllTours, setShowAllTours] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const scrollRef = useRef(null);
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth;
      scrollRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch featured/trending packages without strict limit to get accurate counts
        const packages = await getPackages({ featured: true, limit: 100 });
        const filterData = await getPackageFilters({ featured: true });

        if (isMounted) {
          const formattedTours = packages.map(normalizePackageToTour);
          setApiTours(formattedTours);

          const staticTourTypes = [
            { key: 'all', label: 'All', count: 31 },
            { key: 'beach', label: 'Beach', count: 2 },
            { key: 'honeymoon', label: 'Honeymoon', count: 9 },
            { key: 'group', label: 'Group', count: 1 },
            { key: 'nri', label: 'Nri', count: 4 },
            { key: 'pilgrim', label: 'Pilgrim', count: 1 },
            { key: 'budget', label: 'Budget', count: 2 },
            { key: 'holiday-tour-packages', label: 'Holiday Tour Packages', count: 3 },
            { key: 'in-season', label: 'In Season', count: 2 },
            { key: 'trending', label: 'Trending', count: 2 }
          ];

          if (filterData) {
            setFilterOptions(prev => ({
              ...prev,
              tourTypes: staticTourTypes,
              durations: filterData.durations?.length ? filterData.durations : [
                { key: 'any', label: 'Any', count: packages.length },
                { key: '1-3', label: '1-3 days', min: 1, max: 3, count: 0 },
                { key: '4-7', label: '4-7 days', min: 4, max: 7, count: 0 },
                { key: '8-14', label: '8-14 days', min: 8, max: 14, count: 0 },
              ],
              priceRange: {
                min: Number(filterData.price_range?.min) || 0,
                max: Number(filterData.price_range?.max) || MAX_PRICE,
                selectedMin: Number(filterData.price_range?.min) || 0,
                selectedMax: Number(filterData.price_range?.max) || MAX_PRICE,
              }
            }));

            setFilters(prev => ({
              ...prev,
              minPrice: Number(filterData.price_range?.min) || 0,
              maxPrice: Number(filterData.price_range?.max) || MAX_PRICE,
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching trending tours:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTours = useMemo(() => {
    let result = [...apiTours];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          (t.title || '').toLowerCase().includes(q) ||
          (t.location || '').toLowerCase().includes(q) ||
          (t.country || '').toLowerCase().includes(q)
      );
    }

    if (filters.type && filters.type !== 'all') {
      const q = filters.type.toLowerCase();
      result = result.filter(t => (t.type || t.category || '').toLowerCase().includes(q));
    }

    result = result.filter(
      (t) => t.price >= filters.minPrice && t.price <= filters.maxPrice
    );

    return result;
  }, [apiTours, filters]);

  const displayedTours = showAllTours ? filteredTours : filteredTours.slice(0, 6);

  return (
    <section className={themeClass} style={{
      padding: '40px 0',
      background: themeClass.includes('blush') ? 'transparent' : 'var(--color-bg)',
      position: 'relative',
      width: '100%',
    }}>
      <div className="container trending-wrapper" style={{ maxWidth: '1400px' }}>

        {/* Heading Header matched to screenshot */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', textAlign: 'center', width: '100%' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#D9466F',
            border: '2px solid #D9466F',
            borderRadius: '50px',
            padding: '10px 32px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            margin: 0,
            backgroundColor: '#FFF9FA',
            boxShadow: '0 4px 12px rgba(217, 70, 111, 0.1)'
          }}>
            Trending Tours
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          {/* Sidebar */}
          <div className="trending-sidebar" style={{
            width: '260px',
            flexShrink: 0,
            background: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            padding: '24px',
            position: 'sticky',
            top: '80px',
            borderRadius: '50px'
          }}>



            <div className="mobile-filters-row">
              <CustomSelect 
                className="trending-mobile-select"
                value="all"
                onChange={() => {}}
                placeholder="Duration"
                options={[
                  { value: 'all', label: 'Duration' },
                  ...filterOptions.durations.map(d => ({ value: d.key, label: d.label }))
                ]}
              />

              <CustomSelect 
                className="trending-mobile-select"
                value={filters.maxPrice === (filterOptions.priceRange.max || 500000) ? 'Any' : filters.maxPrice}
                onChange={(val) => {
                  setFilters(prev => ({ ...prev, maxPrice: val === 'Any' ? (filterOptions.priceRange.max || 500000) : Number(val) }));
                }}
                placeholder="Budget"
                options={[
                  { value: 'Any', label: 'Budget' },
                  { value: '50000', label: 'Under ₹50k' },
                  { value: '100000', label: '₹50k - ₹1L' },
                  { value: '500000', label: 'Above ₹1L' }
                ]}
              />
            </div>

            <div className="desktop-filters">
              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0 0 24px 0' }} />

              {/* Tour Duration Accordion */}
              <div style={{ marginBottom: '16px', marginTop: '20px' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  onClick={() => toggleSection('duration')}
                >
                  TOUR duration
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: expandedSections.duration ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {expandedSections.duration && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '8px' }}>
                    {filterOptions.durations.map(dur => (
                      <label key={dur.key} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#666', cursor: 'pointer', width: '100%' }}>
                        <input type="checkbox" style={{ marginRight: '8px', accentColor: '#b98c56', flexShrink: 0 }} />
                        <span>{dur.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>


              {/* Budget Accordion */}
              <div style={{ marginBottom: '16px', marginTop: '20px' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  onClick={() => toggleSection('budget')}
                >
                  Budget
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: expandedSections.budget ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {expandedSections.budget && (
                  <div style={{ marginTop: '16px', paddingLeft: '8px', paddingRight: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#b98c56', marginBottom: '8px' }}>
                      <span>₹{formatPriceNumber(filters.minPrice)}</span>
                      <span>₹{formatPriceNumber(filters.maxPrice)}</span>
                    </div>
                    <input
                      type="range"
                      min={filterOptions.priceRange.min}
                      max={filterOptions.priceRange.max || MAX_PRICE}
                      step={5000}
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#b98c56' }}
                    />
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Main Grid */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div className="trending-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} style={{ height: '360px', background: '#f5f5f5', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : filteredTours.length > 0 ? (
              <div style={{ position: 'relative' }}>
                <div className="trending-grid" ref={scrollRef}>
                  {displayedTours.map((tour) => (
                    <div key={tour.id || tour.slug} className="trending-card-wrapper">
                      <TrendingTourCard tour={tour} />
                    </div>
                  ))}
                </div>

                {/* Mobile Slider Arrows */}
                <button
                  onClick={() => scroll(-1)}
                  className="hm-scroll-btn hm-scroll-left"
                  aria-label="Previous"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                </button>

                <button
                  onClick={() => scroll(1)}
                  className="hm-scroll-btn hm-scroll-right"
                  aria-label="Next"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>

              </div>
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
                <h3 style={{ fontSize: '18px', color: '#555' }}>No trending tours match your filters.</h3>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, search: '', type: 'all', maxPrice: MAX_PRICE }))}
                  style={{ marginTop: '16px', padding: '8px 24px', background: '#b98c56', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
      <style>{`
        .trending-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .mobile-filters-row {
          display: none;
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
        .hm-scroll-btn {
          display: none;
        }
        @media (max-width: 991px) {
          .desktop-filters {
            display: none !important;
          }
          .mobile-filters-row {
            display: flex;
            gap: 8px;
            margin-top: 8px;
            margin-bottom: 8px;
            width: 100%;
          }
          .trending-mobile-select {
            flex: 1;
            min-width: 0;
            padding: 8px 24px 8px 10px;
            border: 1px solid #e0e0e0;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            color: #444;
            background: #fff;
            outline: none;
            -webkit-appearance: none;
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 8px center;
            background-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .trending-wrapper > div {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .trending-search-heading {
            text-align: center;
          }
          .trending-sidebar {
            width: 100% !important;
            position: static !important;
            margin-bottom: 24px;
            padding: 16px !important;
            border-radius: 50px !important;
          }
          .trending-wrapper > div > div:last-child {
            width: 100% !important;
          }
          .tour-filter-list {
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            padding-bottom: 12px;
            max-height: none !important;
          }
          .tour-filter-list::-webkit-scrollbar {
            height: 4px;
          }
          .tour-filter-list::-webkit-scrollbar-thumb {
            background: #e0e0e0;
            border-radius: 4px;
          }
          .tour-filter-item {
            flex-shrink: 0;
            background: #fafafa;
            padding: 8px 16px !important;
            border-radius: 20px;
            border: 1px solid #eaeaea;
          }
          
          /* Carousel logic for mobile */
          .trending-grid {
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            gap: 16px;
            padding-bottom: 8px;
            scroll-behavior: smooth;
          }
          .trending-grid::-webkit-scrollbar {
            display: none;
          }
          .trending-card-wrapper {
            flex: 0 0 100%;
            width: 100%;
            scroll-snap-align: center;
          }
          
          .hm-scroll-btn {
            display: flex;
            position: absolute;
            top: 35%;
            transform: translateY(-50%);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 1.5px solid var(--color-border, #E5E5E5);
            background: var(--color-card, #fff);
            color: var(--color-text-primary, #333);
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .hm-scroll-left { left: -10px; }
          .hm-scroll-right { right: -10px; }
        }
      `}</style>
    </section>
  );
}
