'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { getPackages, normalizePackageToTour } from '@/utils/api';

const MAX_PRICE = 1000000;
const formatPriceNumber = (value) => Number(value || 0).toLocaleString('en-IN');

// Simple heuristic to detect if a location is in India
const INDIAN_LOCATIONS = ['india', 'kashmir', 'kerala', 'goa', 'andaman', 'himachal', 'sikkim', 'rajasthan', 'ladakh', 'manali', 'shimla', 'mumbai', 'delhi', 'bangalore', 'chennai', 'uttarakhand', 'darjeeling', 'meghalaya', 'assam'];

const isIndianDestination = (tour) => {
  const loc = (tour.location || tour.country || '').toLowerCase();
  const title = (tour.title || '').toLowerCase();

  if (loc.includes('india')) return true;
  for (const city of INDIAN_LOCATIONS) {
    if (loc.includes(city) || title.includes(city)) return true;
  }
  return false;
};

export default function HoneymoonToursSection({ themeClass = '' }) {
  const isFamily = themeClass.includes('teal');
  const isGroup = themeClass.includes('purple');
  const isNri = themeClass.includes('nri');
  const isPilgrim = themeClass.includes('pilgrim') || themeClass.includes('saffron');
  const isBudget = themeClass.includes('budget');
  const isTrending = themeClass.includes('trending');
  const [loading, setLoading] = useState(true);
  const [apiTours, setApiTours] = useState([]);

  // Filters
  const [regionFilter, setRegionFilter] = useState('International'); // 'Indian', 'International'
  
  const [activeTourIndex, setActiveTourIndex] = useState(0);

  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const scrollAmount = 156; // width of thumbnail + gap
    scrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const packages = await getPackages({ limit: 200 });
        if (isMounted) {
          const formattedTours = packages.map(normalizePackageToTour);
          const themeTours = formattedTours.filter(t => {
            const str = `${t.title} ${t.category} ${t.type} ${t.description}`.toLowerCase();
            if (isFamily || isGroup) {
               return str.includes('family') || str.includes('group') || str.includes('kids') || str.includes('summer');
            }
            if (isNri) {
               return str.includes('india') || str.includes('heritage') || str.includes('roots') || str.includes('culture') || str.includes('kerala') || str.includes('rajasthan') || t.country?.toLowerCase() === 'india' || str.includes('dubai') || str.includes('bali');
            }
            if (isPilgrim) {
               return str.includes('pilgrim') || str.includes('temple') || str.includes('spiritual') || str.includes('darshan') || str.includes('varanasi') || str.includes('kashi') || str.includes('chardham') || str.includes('kedarnath') || str.includes('badrinath') || str.includes('india') || str.includes('bali');
            }
            if (isBudget) {
               return str.includes('budget') || str.includes('value') || str.includes('economy') || str.includes('affordable') || str.includes('backpack') || str.includes('india') || str.includes('thailand') || str.includes('vietnam');
            }
            if (isTrending) {
               return str.includes('trending') || str.includes('popular') || str.includes('hot') || str.includes('dubai') || str.includes('europe') || str.includes('thailand') || str.includes('bali');
            }
            return str.includes('honeymoon') || str.includes('romantic') || str.includes('maldives') || str.includes('bali');
          });
          setApiTours(themeTours);
        }
      } catch (err) {
        console.error("Error fetching tours:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [isFamily, isGroup, isNri, isPilgrim, isBudget, isTrending]);

  const filteredTours = useMemo(() => {
    let result = [...apiTours];
    if (regionFilter === 'Indian') {
      result = result.filter(t => isIndianDestination(t));
    } else if (regionFilter === 'International') {
      result = result.filter(t => !isIndianDestination(t));
    }
    return result;
  }, [apiTours, regionFilter]);

  useEffect(() => {
    setActiveTourIndex(0); // Reset when filter changes
  }, [regionFilter]);

  if (!loading && apiTours.length === 0) return null;

  const activeTour = filteredTours[activeTourIndex] || filteredTours[0];
  const primaryColor = isNri ? '#1759A6' : (isGroup ? '#9D4A93' : (isFamily ? '#2F7F7B' : (isPilgrim ? '#E98216' : (isBudget ? '#2E7D32' : (isTrending ? '#D32F2F' : '#D9466F')))));

  return (
    <section className={`honeymoon-section ${themeClass}`} style={{ background: 'transparent', fontFamily: 'var(--font-primary, sans-serif)' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header */}
        <div className="hm-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <h2 className="section-title theme-underline-heading" style={{ margin: 0 }}>
            {isNri ? 'NRI' : (isGroup ? 'Group' : (isFamily ? 'Family' : (isPilgrim ? 'Pilgrim' : (isBudget ? 'Budget' : (isTrending ? 'Trending' : 'Honeymoon')))))} <span style={{ color: primaryColor }}>Tour Destinations</span>
          </h2>
          
          <div className="hm-tabs" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {['Domestic', 'International'].map((tab) => {
              const filterValue = tab === 'Domestic' ? 'Indian' : 'International';
              const isActive = regionFilter === filterValue;
              
              const count = apiTours.filter(t => filterValue === 'Indian' ? isIndianDestination(t) : !isIndianDestination(t)).length;

              return (
                <button
                  key={tab}
                  onClick={() => setRegionFilter(filterValue)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isActive ? `2px solid ${primaryColor}` : '2px solid transparent',
                    color: isActive ? primaryColor : '#666',
                    padding: '0 0 4px 0',
                    fontSize: '15px',
                    fontWeight: isActive ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {tab} <span style={{ fontSize: '11px', color: '#999', marginLeft: '4px' }}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {loading ? (
          <div style={{ height: '500px', background: '#f5f5f5', borderRadius: '16px', animation: 'pulse 1.5s infinite' }}></div>
        ) : filteredTours.length > 0 && activeTour ? (
          <div className="hm-layout" style={{ display: 'flex', gap: '30px', alignItems: 'stretch' }}>
            
            {/* Left Featured Card */}
            <div className="hm-featured" style={{ flex: '0 0 52%', position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '500px' }}>
              <img 
                src={activeTour.image || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2000&q=80'} 
                alt={activeTour.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 40%)' }}></div>
              
              <div style={{ position: 'absolute', bottom: '30px', left: '30px', color: '#fff', zIndex: 2 }}>
                <h3 className="hm-featured-title" style={{ fontWeight: '500', textShadow: '0 2px 4px rgba(0,0,0,0.4)', fontFamily: 'Georgia, serif' }}>
                  {activeTour.location || activeTour.title.split(' ')[0]}
                </h3>
                <div className="hm-featured-price-box" style={{ 
                  background: '#fff', 
                  color: '#000', 
                  borderRadius: '6px', 
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <span style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>Starting from</span>
                  <span className="hm-featured-price" style={{ fontWeight: '700', color: primaryColor }}>₹{formatPriceNumber(activeTour.price)}*</span>
                </div>
              </div>
            </div>

            {/* Right Details */}
            <div className="hm-details" style={{ flex: '1', display: 'flex', flexDirection: 'column', padding: '10px 0 0 10px' }}>
              <h3 className="hm-details-title" style={{ color: '#000', fontWeight: '400', fontFamily: 'Georgia, serif', lineHeight: '1.2' }}>
                <span style={{ color: primaryColor, fontStyle: 'italic', marginRight: '8px', fontWeight: '600' }}>
                  {isNri ? 'Journey back' : (isGroup ? 'Share moments' : (isFamily ? 'Make memories' : (isPilgrim ? 'Spiritual journeys' : (isBudget ? 'Travel smart' : (isTrending ? 'Experience the' : 'Fall in Love')))))} 
                </span> 
                <span style={{ color: '#4a8bb3', fontStyle: 'italic', fontSize: '28px' }}>{isPilgrim || isNri || isBudget ? 'to' : (isTrending ? 'best of' : 'with')}</span><br/>
                <span className="hm-details-loc" style={{ fontWeight: '500', display: 'block' }}>{activeTour.location || activeTour.title.split(' ')[0]}</span>
              </h3>
              
              <p className="hm-details-desc" style={{ color: '#444', fontWeight: '500' }}>
                {activeTour.description || `Temple trails, sunlit shores and slow island mornings. Find your own rhythm in ${activeTour.location || 'this beautiful destination'}.`}
              </p>
              
              <div style={{ marginTop: '24px', marginBottom: '32px' }}>
                <Link href={activeTour.slug ? `/package/${activeTour.slug}` : `/package?search=${activeTour.location || activeTour.title}`} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: primaryColor,
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  boxShadow: `0 4px 12px ${primaryColor}40`,
                  transition: 'transform 0.2s'
                }}>
                  Explore Package
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '8px' }}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
              {/* Thumbnails */}
              <div className="hm-thumbnails-container" style={{ position: 'relative', zIndex: 10, maxWidth: '596px' }}>
                <div className="hm-explore-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    EXPLORE MORE DESTINATIONS
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => scroll(-1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: primaryColor, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button onClick={() => scroll(1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: primaryColor, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                  </div>
                </div>

                <div 
                  ref={scrollRef}
                  style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    overflowX: 'auto', 
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                  className="hm-thumbnails"
                >
                  {filteredTours.map((t, idx) => {
                    const isActive = idx === activeTourIndex;
                    return (
                      <button
                        key={t.id || t.slug || idx}
                        onClick={() => setActiveTourIndex(idx)}
                        className="hm-thumbnail-card"
                        style={{
                          borderRadius: '12px',
                          overflow: 'hidden',
                          position: 'relative',
                          cursor: 'pointer',
                          border: isActive ? `2px solid ${primaryColor}` : '2px solid #fff',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                          transition: 'all 0.2s ease',
                          opacity: isActive ? 1 : 0.9,
                          transform: isActive ? 'scale(1.02)' : 'scale(1)',
                          flexShrink: 0,
                          width: '140px',
                          height: '140px',
                          display: 'block',
                          padding: 0,
                          background: 'none',
                          textAlign: 'left'
                        }}
                      >
                        <img 
                          src={t.image || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&q=80'} 
                          alt={t.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%)' }}></div>
                        <div style={{ position: 'absolute', bottom: '12px', left: '12px', color: '#fff', zIndex: 2 }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '2px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{t.location || t.title.split(' ')[0]}</div>
                          <div style={{ fontSize: '10px', color: '#ddd' }}>From ₹{formatPriceNumber(t.price)}*</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center" style={{ padding: '60px 0', color: '#777' }}>
            <p style={{ fontSize: '18px' }}>No {isNri ? 'NRI' : (isGroup ? 'group' : (isFamily ? 'family' : (isTrending ? 'trending' : 'honeymoon')))} tours found for these filters.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .honeymoon-section { padding: 60px 0; }
        .hm-header { margin-bottom: 40px; }
        .hm-featured-title { font-size: 42px; margin-bottom: 16px; }
        .hm-featured-price-box { padding: 10px 16px; }
        .hm-featured-price { font-size: 22px; }
        .hm-details-title { font-size: 36px; margin-bottom: 16px; }
        .hm-details-loc { font-size: 46px; margin-top: 4px; }
        .hm-details-desc { font-size: 15px; margin-bottom: 24px; line-height: 1.6; }
        .hm-thumbnails-container { margin-top: auto; padding-top: 30px; }
        .hm-thumbnails { padding-bottom: 10px; margin-left: -80px; }
        .hm-thumbnail-card { flex: 0 0 calc(28.75% - 9px); height: 175px; }
        .hm-thumbnails::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 992px) {
          .honeymoon-section { padding: 20px 0 10px; }
          .hm-header { margin-bottom: 12px; }
          .hm-layout { flex-direction: column; }
          .hm-featured { height: 180px !important; flex: none !important; border-radius: 16px !important; }
          .hm-featured-title { font-size: 24px; margin-bottom: 6px; }
          .hm-featured-price-box { padding: 6px 12px !important; }
          .hm-featured-price { font-size: 16px; }
          
          .hm-details { padding: 12px 0 0 0 !important; }
          .hm-details-title { font-size: 20px; margin-bottom: 6px; }
          .hm-details-loc { font-size: 24px; margin-top: 2px; }
          .hm-details-desc { font-size: 13px; margin-bottom: 12px; line-height: 1.4; }
          
          .hm-thumbnails-container { margin-top: 0; padding-top: 8px; }
          .hm-explore-header { margin-bottom: 10px !important; }
          .hm-thumbnails { margin-left: 0; padding-bottom: 6px; }
          .hm-thumbnail-card { height: 100px !important; flex: 0 0 140px !important; }
          
          .hm-header { align-items: center !important; text-align: center; }
          .hm-tabs { width: 100%; overflow-x: auto; padding-bottom: 8px; justify-content: center; }
          .hm-tabs button { white-space: nowrap; }
        }
      `}</style>
    </section>
  );
}
