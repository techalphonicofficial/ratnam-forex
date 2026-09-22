'use client';

import React, { useState, useEffect, useMemo } from 'react';
import TrendingTourCard from './TrendingTourCard';
import { getPackages, getPackageFilters, normalizePackageToTour } from '@/utils/api';

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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#dc2626',
            border: '2px solid #dc2626',
            padding: '8px 24px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            margin: 0
          }}>
            Trending Tours
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          {/* Sidebar */}
          <div style={{
            width: '260px',
            flexShrink: 0,
            background: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            padding: '24px',
            position: 'sticky',
            top: '80px'
          }}>

            {/* Search */}
            <div style={{ marginBottom: '30px' }}>
              <div className="trending-search-heading" style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                Search
              </div>
              <div style={{ position: 'relative' }}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888' }}>
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                <input
                  type="text"
                  placeholder="Destination, country..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 10px 10px 36px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '24px',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#fdfdfd'
                  }}
                />
              </div>
            </div>

            <div className="mobile-filters-row">
              <select 
                value={filters.type} 
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="trending-mobile-select"
              >
                {filterOptions.tourTypes.map(t => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>

              <select className="trending-mobile-select">
                <option value="all">Duration</option>
                {filterOptions.durations.map(d => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </select>

              <select 
                value={filters.maxPrice === (filterOptions.priceRange.max || 500000) ? 'Any' : filters.maxPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilters(prev => ({ ...prev, maxPrice: val === 'Any' ? (filterOptions.priceRange.max || 500000) : Number(val) }));
                }}
                className="trending-mobile-select"
              >
                <option value="Any">Budget</option>
                <option value="50000">Under ₹50k</option>
                <option value="100000">₹50k - ₹1L</option>
                <option value="500000">Above ₹1L</option>
              </select>
            </div>

            <div className="desktop-filters">
              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0 0 24px 0' }} />

              {/* Tour Type */}
              <div style={{ marginBottom: '30px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                  Tour Type
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                  {filterOptions.tourTypes.map((type) => (
                    <label key={type.key} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '13px', color: '#555', width: '100%' }}>
                      <input
                        type="radio"
                        name="trendingTourType"
                        value={type.key}
                        checked={filters.type === type.key}
                        onChange={() => setFilters(prev => ({ ...prev, type: type.key }))}
                        style={{ accentColor: '#b98c56', marginRight: '10px', width: '16px', height: '16px', flexShrink: 0 }}
                      />
                      <span>{type.label}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#f5f5f5', padding: '2px 8px', borderRadius: '12px', color: '#888', fontWeight: 600 }}>
                        {type.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>


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
              <>
                <div className="trending-grid">
                  {displayedTours.map((tour) => (
                    <TrendingTourCard key={tour.id || tour.slug} tour={tour} />
                  ))}
                </div>
                {filteredTours.length > 6 && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                    <button
                      onClick={() => setShowAllTours(!showAllTours)}
                      style={{
                        background: 'transparent',
                        color: 'var(--color-primary)',
                        border: '2px solid var(--color-primary)',
                        padding: '10px 32px',
                        borderRadius: '24px',
                        fontSize: '14px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'var(--color-primary)';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-primary)';
                      }}
                    >
                      {showAllTours ? 'View Less' : 'View More'}
                    </button>
                  </div>
                )}
              </>
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
        @media (max-width: 991px) {
          .desktop-filters {
            display: none !important;
          }
          .mobile-filters-row {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
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
          .trending-wrapper > div > div:first-child {
            width: 100% !important;
            position: static !important;
            margin-bottom: 24px;
            padding: 16px !important;
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
        }
      `}</style>
    </section>
  );
}
