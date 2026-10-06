'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import TrendingTourCard from './TrendingTourCard';
import { getPackages, getPackageFilters, getPackageReviews, normalizePackageToTour } from '@/utils/api';
import CustomSelect from './CustomSelect';

const MAX_PRICE = 1000000;
const formatPriceNumber = (value) => Number(value || 0).toLocaleString('en-IN');

const hasCategory = (pkg, categoryMatch) => {
  const categories = pkg?.package_categories || pkg?.categories || [];
  if (!categoryMatch) return true;
  return Array.isArray(categories) && categories.some((cat) =>
    String(cat?.slug || '').toLowerCase().includes(categoryMatch) ||
    String(cat?.title || cat?.name || '').trim().toLowerCase().includes(categoryMatch)
  );
};

const MIN_TRENDING_RATING = 4;
const MAX_TRENDING_RATING = 5;

export default function TrendingToursSection({ themeClass = '', cmsPage = null }) {
  const isFamily = themeClass.includes('teal');
  const isGroup = themeClass.includes('purple');
  const isNri = themeClass.includes('nri');
  const isBlush = themeClass.includes('blush');
  const isPilgrim = themeClass.includes('pilgrim') || themeClass.includes('saffron');
  const isBudget = themeClass.includes('budget');
  const isTrending = themeClass.includes('trending');
  const isCorporate = themeClass.includes('corporate');
  const primaryColor = isCorporate ? '#1E5AA8' : (isNri ? '#1759A6' : (isGroup ? '#9D4A93' : (isFamily ? '#2F7F7B' : (isPilgrim ? '#E98216' : (isBudget ? '#2E7D32' : (isTrending ? '#D32F2F' : '#D9466F'))))));
  const bgColor = isNri ? '#FFFCF5' : (isGroup ? '#FAF5FA' : (isFamily ? '#FFFDF7' : (isPilgrim ? '#FFF9EF' : (isBudget ? 'transparent' : (isTrending ? 'transparent' : (isBlush ? 'transparent' : 'var(--color-bg)'))))));
  const softColor = isNri ? '#E8F1FA' : (isGroup ? '#F5E6F5' : (isFamily ? '#F2F7F4' : (isPilgrim ? '#FFF5E5' : (isBudget ? '#F1F8EF' : (isTrending ? '#FFECEC' : '#FFF9FA')))));

  const headingText = useMemo(() => {
    if (cmsPage?.details) {
      const section = cmsPage.details.find(d => d.key === 'trending_tour');
      if (section) {
        const text = section.description?.trim() || section.title?.trim() || section.json_data?.heading_content?.trim();
        if (text) return text;
      }
    }
    return 'Trending Tours';
  }, [cmsPage]);
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
        const isHoneymoonTheme = !isFamily && !isGroup && !isNri && !isPilgrim && !isBudget && !isTrending && !isCorporate;

        // Fetch packages without strict limit to get accurate counts
        const packages = await getPackages({ limit: 200 });
        const filterData = await getPackageFilters({ featured: true });

        let formattedTours = packages.map(normalizePackageToTour).filter(Boolean);

        const currentCategory = isCorporate ? 'corporate' 
          : isFamily ? 'family'
          : isGroup ? 'group'
          : isNri ? 'nri'
          : isPilgrim ? 'pilgrim'
          : isBudget ? 'budget'
          : isTrending ? 'trending'
          : 'honeymoon';

        const seenIds = new Set();
        const themeTours = formattedTours.filter((t) => {
          if (!hasCategory(t, currentCategory) || seenIds.has(t.id)) return false;
          seenIds.add(t.id);
          return true;
        });

        // Even for family/group/etc., fetch reviews if it exists to keep UI identical
        const ratedTours = await Promise.all(
          themeTours.map(async (t) => {
            const { summary, total } = await getPackageReviews({
              packageId: t.id,
              packageSlug: t.slug,
              status: 'approved',
            });
            const averageRating = Number(summary?.average_rating) || 0;
            const reviewCount = Number(summary?.count) || Number(total) || 0;
            return { ...t, rating: averageRating, reviews: reviewCount };
          })
        );

        formattedTours = ratedTours;
        
        // Ensure ratings exist if it's Honeymoon or Family, to match old logic
        if (isHoneymoonTheme || isFamily) {
          formattedTours = formattedTours.filter(
            (t) => t.reviews > 0 && t.rating >= MIN_TRENDING_RATING && t.rating <= MAX_TRENDING_RATING
          );
        }

        if (isMounted) {
          setApiTours(formattedTours);

          const categoryCounts = { all: formattedTours.length };
          formattedTours.forEach(t => {
            if (Array.isArray(t.package_categories)) {
              t.package_categories.forEach(cat => {
                if (cat.slug) {
                  categoryCounts[cat.slug] = (categoryCounts[cat.slug] || 0) + 1;
                }
              });
            }
          });
          
          const dynamicTourTypes = [{ key: 'all', label: 'All', count: categoryCounts.all }];
          formattedTours.forEach(t => {
             if (Array.isArray(t.package_categories)) {
               t.package_categories.forEach(cat => {
                 if (cat.slug && !dynamicTourTypes.find(d => d.key === cat.slug)) {
                   dynamicTourTypes.push({ key: cat.slug, label: cat.title || cat.name || cat.slug, count: categoryCounts[cat.slug] });
                 }
               });
             }
          });
          dynamicTourTypes.sort((a, b) => {
            if (a.key === 'all') return -1;
            if (b.key === 'all') return 1;
            return b.count - a.count;
          });

          let c1_3 = 0, c4_7 = 0, c8_14 = 0;
          formattedTours.forEach(t => {
            if (t.duration >= 1 && t.duration <= 3) c1_3++;
            else if (t.duration >= 4 && t.duration <= 7) c4_7++;
            else if (t.duration >= 8 && t.duration <= 14) c8_14++;
          });

          if (filterData) {
            setFilterOptions(prev => ({
              ...prev,
              tourTypes: dynamicTourTypes,
              durations: filterData.durations?.length ? filterData.durations : [
                { key: 'any', label: 'Any', count: formattedTours.length },
                { key: '1-3', label: '1-3 days', min: 1, max: 3, count: c1_3 },
                { key: '4-7', label: '4-7 days', min: 4, max: 7, count: c4_7 },
                { key: '8-14', label: '8-14 days', min: 8, max: 14, count: c8_14 },
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
      result = result.filter(t => hasCategory(t, q));
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
      background: bgColor,
      position: 'relative',
      width: '100%',
    }}>
      <div className="container trending-wrapper" style={{ maxWidth: '1400px' }}>

        {/* Heading Header matched to screenshot */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', textAlign: 'center', width: '100%' }}>
          <h2 className={`trending-heading theme-underline-heading ${!isFamily && !isGroup && !isNri ? 'honeymoon-heading' : ''}`} style={{
            fontWeight: 600,
            color: primaryColor,
            textTransform: 'uppercase',
            margin: 0
          }}>
            {headingText}
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
                onChange={() => { }}
                placeholder="Duration"
                themeColor={primaryColor}
                themeBg={softColor}
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
                themeColor={primaryColor}
                themeBg={softColor}
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
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}
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
                        <input type="checkbox" style={{ marginRight: '8px', accentColor: primaryColor, flexShrink: 0 }} />
                        <span>{dur.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>


              {/* Budget Accordion */}
              <div style={{ marginBottom: '16px', marginTop: '20px' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  onClick={() => toggleSection('budget')}
                >
                  Budget
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: expandedSections.budget ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {expandedSections.budget && (
                  <div style={{ marginTop: '16px', paddingLeft: '8px', paddingRight: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: primaryColor, marginBottom: '8px' }}>
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
                      style={{ width: '100%', accentColor: primaryColor }}
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
                      <TrendingTourCard tour={tour} isCorporate={isCorporate} isFamily={isFamily} isGroup={isGroup} isNri={isNri} isPilgrim={isPilgrim} isBudget={isBudget} isTrending={isTrending} />
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

                {filteredTours.length > 6 && (
                  <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button
                      onClick={() => setShowAllTours(!showAllTours)}
                      style={{
                        background: 'transparent',
                        color: primaryColor,
                        border: `2px solid ${primaryColor}`,
                        borderRadius: '50px',
                        padding: '10px 32px',
                        fontSize: '14px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = primaryColor;
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = primaryColor;
                      }}
                    >
                      {showAllTours ? 'View Less' : 'View All Packages'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
                <h3 style={{ fontSize: '18px', color: '#555' }}>No trending tours match your filters.</h3>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, search: '', type: 'all', maxPrice: MAX_PRICE }))}
                  style={{ marginTop: '16px', padding: '8px 24px', background: primaryColor, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
        .trending-heading {
          font-size: 24px;
          padding: 10px 32px;
          letter-spacing: 2px;
          width: auto;
        }
        .honeymoon-heading {
          font-size: 28.8px;
        }
        .hm-scroll-btn {
          display: none;
        }
        @media (max-width: 991px) {
          .trending-heading {
            width: max-content !important;
            font-size: 16px !important;
            padding: 7px 20px !important;
            letter-spacing: 1.5px !important;
            border-width: 1.5px !important;
            white-space: nowrap !important;
            margin: 0 auto !important;
          }
          .honeymoon-heading {
            font-size: 19.2px !important;
          }
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
            margin-bottom: 16px !important;
            padding: 0 !important;
            border-radius: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
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
