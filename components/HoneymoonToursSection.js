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
  const isCorporate = themeClass.includes('corporate');
  const [loading, setLoading] = useState(true);
  const [apiTours, setApiTours] = useState([]);

  // Filters
  const [regionFilter, setRegionFilter] = useState('International'); // 'Indian', 'International'

  const [activeTourIndex, setActiveTourIndex] = useState(0);

  const scrollRefDesktop = useRef(null);
  const scrollRefMobile = useRef(null);

  const scroll = (dir, isMobile) => {
    const ref = isMobile ? scrollRefMobile : scrollRefDesktop;
    if (!ref.current) return;
    const scrollAmount = isMobile ? 117 : 152; // width of thumbnail + gap
    ref.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
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
  const primaryColor = isCorporate ? '#1E5AA8' : (isNri ? '#1759A6' : (isGroup ? '#9D4A93' : (isFamily ? '#2F7F7B' : (isPilgrim ? '#E98216' : (isBudget ? '#2E7D32' : (isTrending ? '#D32F2F' : '#D9466F'))))));

  const getThemeIcon = (color, size=24) => {
    if (!themeClass.includes('honeymoon') && !themeClass.includes('blush') && themeClass !== '') {
      return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
    }
    return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
  };

  const renderThumbnails = (isMobile) => (
    <div className={`hm-thumbnails-container ${isMobile ? 'hm-mobile-thumbnails-section' : ''}`} style={{ position: 'relative', zIndex: 10, maxWidth: '596px', width: '100%' }}>
      <div className="hm-explore-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span className="hm-explore-title" style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
          EXPLORE MORE DESTINATIONS
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => scroll(-1, isMobile)} style={{ width: isMobile ? '24px' : '28px', height: isMobile ? '24px' : '28px', borderRadius: '50%', border: 'none', background: primaryColor, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button onClick={() => scroll(1, isMobile)} style={{ width: isMobile ? '24px' : '28px', height: isMobile ? '24px' : '28px', borderRadius: '50%', border: 'none', background: primaryColor, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>

      <div
        ref={isMobile ? scrollRefMobile : scrollRefDesktop}
        className={isMobile ? "hm-thumbnails-mobile" : "hm-thumbnails"}
        style={{ display: 'flex', gap: '12px', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {filteredTours.map((t, idx) => {
          const isActive = idx === activeTourIndex;
          return (
            <button
              key={t.id || t.slug || idx}
              onClick={() => setActiveTourIndex(idx)}
              className={isMobile ? "hm-thumbnail-card-mob" : "hm-thumbnail-card"}
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                border: isActive ? `2px solid ${primaryColor}` : '2px solid transparent',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease',
                opacity: isActive ? 1 : 0.9,
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                flex: isMobile ? '0 0 105px' : '0 0 140px',
                width: isMobile ? '105px' : '140px',
                height: isMobile ? '85px' : '140px',
                display: 'block',
                padding: 0,
                background: 'none',
                textAlign: 'left'
              }}
            >
              <img src={t.image || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&q=80'} alt={t.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%)' }}></div>
              <div style={{ position: 'absolute', bottom: isMobile ? '8px' : '12px', left: isMobile ? '8px' : '12px', color: '#fff', zIndex: 2 }}>
                <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '700', marginBottom: '2px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{t.location || t.title.split(' ')[0]}</div>
                <div style={{ fontSize: '10px', color: '#ddd' }}>From ₹{formatPriceNumber(t.price)}*</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );

  return (
    <section className={`honeymoon-section ${themeClass}`} style={{ background: 'transparent', fontFamily: 'var(--font-primary, sans-serif)' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>

        {/* --- DESKTOP HEADER --- */}
        <div className="hm-header hm-desktop-only" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <h2 className="section-title theme-underline-heading" style={{ margin: 0 }}>
            {isCorporate ? 'Corporate' : (isNri ? 'NRI' : (isGroup ? 'Group' : (isFamily ? 'Family' : (isPilgrim ? 'Pilgrim' : (isBudget ? 'Budget' : (isTrending ? 'Trending' : 'Honeymoon'))))))} <span style={{ color: primaryColor }}>Tour Destinations</span>
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

        {/* --- MOBILE HEADER --- */}
        <div className="hm-header-mobile hm-mobile-only">
          <h2 className="hm-mobile-main-title">
            <div style={{ color: '#333' }}>{isCorporate ? 'Corporate' : (isNri ? 'NRI' : (isGroup ? 'Group' : (isFamily ? 'Family' : (isPilgrim ? 'Pilgrim' : (isBudget ? 'Budget' : (isTrending ? 'Trending' : 'Honeymoon'))))))} Tour</div>
            <div style={{ color: primaryColor }}>Destinations</div>
          </h2>
          <div className="hm-mobile-divider">
            <div className="hm-line"></div>
            {getThemeIcon(primaryColor, 16)}
            <div className="hm-line"></div>
          </div>
          <div className="hm-tabs-mobile">
            {['Domestic', 'International'].map((tab) => {
              const filterValue = tab === 'Domestic' ? 'Indian' : 'International';
              const isActive = regionFilter === filterValue;
              return (
                <button
                  key={tab}
                  onClick={() => setRegionFilter(filterValue)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isActive ? `2px solid ${primaryColor}` : '2px solid transparent',
                    color: isActive ? primaryColor : '#999',
                    padding: '0 0 6px 0',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {tab}
                </button>
              )
            })}
          </div>
        </div>

        {loading ? (
          <div style={{ height: '500px', background: '#f5f5f5', borderRadius: '16px', animation: 'pulse 1.5s infinite' }}></div>
        ) : filteredTours.length > 0 && activeTour ? (
          <>
            {/* --- DESKTOP LAYOUT --- */}
            <div className="hm-layout hm-desktop-only" style={{ display: 'flex', gap: '30px', alignItems: 'stretch' }}>
              <div className="hm-featured" style={{ flex: '0 0 52%', position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '500px' }}>
                <img
                  src={activeTour.image || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2000&q=80'}
                  alt={activeTour.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 40%)' }}></div>
                <div className="hm-featured-content">
                  <h3 className="hm-featured-title" style={{ fontWeight: '500', textShadow: '0 2px 4px rgba(0,0,0,0.4)', fontFamily: 'Georgia, serif' }}>
                    {activeTour.location || activeTour.title.split(' ')[0]}
                  </h3>
                  <div className="hm-featured-action-row">
                    <div className="hm-featured-price-box" style={{ background: '#fff', color: '#000', borderRadius: '6px', display: 'inline-flex', alignItems: 'baseline', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                      <span className="hm-featured-price-label" style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>Starting from</span>
                      <span className="hm-featured-price" style={{ fontWeight: '700', color: primaryColor }}>₹{formatPriceNumber(activeTour.price)}*</span>
                    </div>
                    <Link className="hm-banner-btn" href={activeTour.slug ? `/package/${activeTour.slug}` : `/package?search=${activeTour.location || activeTour.title}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '10px 20px', background: primaryColor, color: '#fff', borderRadius: '25px', textDecoration: 'none', fontWeight: '600', fontSize: '14px', lineHeight: '1.2', boxShadow: `0 4px 12px ${primaryColor}40`, transition: 'transform 0.2s', whiteSpace: 'nowrap' }}>
                      Explore Package
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '8px' }}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="hm-details" style={{ flex: '1', display: 'flex', flexDirection: 'column', padding: '10px 0 0 10px' }}>
                <h3 className="hm-details-title" style={{ color: '#000', fontWeight: '400', fontFamily: 'Georgia, serif', lineHeight: '1.2' }}>
                  <span style={{ color: primaryColor, fontStyle: 'italic', marginRight: '8px', fontWeight: '600' }}>
                    {isCorporate ? 'Seamless business' : (isNri ? 'Journey back' : (isGroup ? 'Share moments' : (isFamily ? 'Make memories' : (isPilgrim ? 'Spiritual journeys' : (isBudget ? 'Travel smart' : (isTrending ? 'Experience the' : 'Fall in Love'))))))}
                  </span>
                  <span style={{ color: '#4a8bb3', fontStyle: 'italic', fontSize: '28px' }}>{isCorporate ? 'in' : (isPilgrim || isNri || isBudget ? 'to' : (isTrending ? 'best of' : 'with'))}</span><br />
                  <span className="hm-details-loc" style={{ fontWeight: '500', display: 'block' }}>{activeTour.location || activeTour.title.split(' ')[0]}</span>
                </h3>
                <p className="hm-details-desc" style={{ color: '#444', fontWeight: '500' }}>
                  {activeTour.description || `Temple trails, sunlit shores and slow island mornings. Find your own rhythm in ${activeTour.location || 'this beautiful destination'}.`}
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '30px', marginLeft: '-80px' }}>
                  {renderThumbnails(false)}
                </div>
              </div>
            </div>

            {/* --- MOBILE UNIFIED CARD LAYOUT --- */}
            <div className="hm-mobile-only">
              <div className="hm-mobile-unified-card">
                <div className="hm-mobile-card-heart">
                  {getThemeIcon(primaryColor, 24)}
                </div>
                <h3 className="hm-mobile-card-title">
                  <div style={{ color: primaryColor, fontStyle: 'italic', fontSize: '20px', fontFamily: 'Georgia, serif' }}>
                    {isCorporate ? 'Seamless business' : (isNri ? 'Journey back' : (isGroup ? 'Share moments' : (isFamily ? 'Make memories' : (isPilgrim ? 'Spiritual journeys' : (isBudget ? 'Travel smart' : (isTrending ? 'Experience the' : 'Fall in Love'))))))}
                  </div>
                  <div style={{ color: '#222', fontSize: '25px', fontWeight: '600', fontFamily: 'Georgia, serif', marginTop: '6px' }}>
                    {isCorporate ? 'in' : (isPilgrim || isNri || isBudget ? 'to' : (isTrending ? 'best of' : 'with'))} {activeTour.location || activeTour.title.split(' ')[0]}
                  </div>
                </h3>
                <p className="hm-mobile-card-desc">
                  {activeTour.description || 'Affordable Maldives package on a beautiful local island.'}
                </p>

                <div className="hm-mobile-img-box">
                  <img src={activeTour.image || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'} alt={activeTour.title} />
                  <div className="hm-mobile-img-gradient"></div>
                  <div className="hm-mobile-img-content">
                    <div className="hm-mobile-img-loc">{activeTour.location || activeTour.title.split(' ')[0]}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                      <div style={{ background: '#fff', color: '#666', padding: '6px 12px', borderRadius: '25px', fontSize: '10px', display: 'inline-flex', alignItems: 'baseline', gap: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', whiteSpace: 'nowrap', fontWeight: '600' }}>
                        Starting from <span style={{ color: primaryColor, fontWeight: '700', fontSize: '14px' }}>₹{formatPriceNumber(activeTour.price)}*</span>
                      </div>
                      <Link href={activeTour.slug ? `/package/${activeTour.slug}` : `/package?search=${activeTour.location || activeTour.title}`} style={{ background: primaryColor, color: '#fff', padding: '6px 14px', borderRadius: '25px', fontSize: '12px', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', border: '1px solid #fff', boxShadow: '0 4px 12px rgba(183, 33, 115, 0.4)', whiteSpace: 'nowrap', lineHeight: '1.2' }}>
                        Explore Package <span style={{ marginLeft: '4px', fontSize: '14px', lineHeight: '1', display: 'inline-block', transform: 'translateY(1px)' }}>&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {renderThumbnails(true)}
            </div>
          </>
        ) : (
          <div className="text-center" style={{ padding: '60px 0', color: '#777' }}>
            <p style={{ fontSize: '18px' }}>No {isNri ? 'NRI' : (isGroup ? 'group' : (isFamily ? 'family' : (isTrending ? 'trending' : 'honeymoon')))} tours found for these filters.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .hm-desktop-only { display: flex; }
        .hm-mobile-only { display: none; }

        .honeymoon-section { padding: 60px 0; }
        .hm-header { margin-bottom: 40px; }
        .hm-featured-title { font-size: 42px; margin-bottom: 16px; }
        .hm-featured-price-box { padding: 10px 16px; }
        .hm-featured-price { font-size: 22px; }
        .hm-details-title { font-size: 36px; margin-bottom: 16px; }
        .hm-details-loc { font-size: 46px; margin-top: 4px; }
        .hm-details-desc { font-size: 15px; margin-bottom: 24px; line-height: 1.6; }
        .hm-featured-content { position: absolute; bottom: 30px; left: 30px; right: 30px; color: #fff; z-index: 2; }
        .hm-featured-action-row { display: flex; align-items: center; gap: 12px; }

        .hm-thumbnail-card { width: 140px; height: 140px; }
        .hm-thumbnails::-webkit-scrollbar { display: none; }
        .hm-thumbnails-mobile::-webkit-scrollbar { display: none; }

        @media (max-width: 992px) {
          .hm-desktop-only { display: none !important; }
          .hm-mobile-only { display: block; }
          .honeymoon-section { background: #FFF9FA !important; padding: 32px 0 !important; }
          
          /* Mobile Header */
          .hm-header-mobile { text-align: center; margin-bottom: 24px; }
          .hm-mobile-main-title { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; line-height: 1.2; margin: 0; font-weight: 400; }
          .hm-mobile-divider { display: flex; align-items: center; justify-content: center; gap: 16px; margin: 16px 0 20px; }
          .hm-line { height: 1px; width: 60px; background: rgba(217, 70, 111, 0.25); }
          .hm-tabs-mobile { display: flex; justify-content: center; gap: 32px; }
          .hm-tabs-mobile button { background: none; border: none; padding: 0 0 6px 0; font-size: 15px; transition: all 0.2s; }
          
          /* Unified Card */
          .hm-mobile-unified-card { background: #FFF0F3; border-radius: 20px; padding: 16px; text-align: center; margin-bottom: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
          .hm-mobile-card-heart { margin-bottom: 12px; opacity: 0.9; }
          .hm-mobile-card-title { margin: 0 0 10px 0; }
          .hm-mobile-card-desc { font-size: 13px; color: #555; line-height: 1.5; margin: 0 0 18px 0; padding: 0 10px; }
          
          .hm-mobile-img-box { position: relative; border-radius: 15px; overflow: hidden; height: 165px; width: 100%; }
          .hm-mobile-img-box img { width: 100%; height: 100%; object-fit: cover; }
          .hm-mobile-img-gradient { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%); }
          .hm-mobile-img-content { position: absolute; bottom: 12px; left: 12px; right: 12px; text-align: left; }
          .hm-mobile-img-loc { color: #fff; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; margin-bottom: 8px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
          
          .hm-mobile-img-controls { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
          .hm-mobile-price-pill { background: #fff; color: #666; padding: 6px 12px; border-radius: 25px; font-size: 10px; display: inline-flex; align-items: baseline; gap: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); white-space: nowrap; font-weight: 600; }
          .hm-mobile-price-pill span { font-size: 14px; }
          .hm-mobile-explore-btn { color: #fff; padding: 6px 14px; height: auto; border-radius: 25px; font-size: 12px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; border: 1px solid #fff; box-shadow: 0 4px 12px rgba(183, 33, 115, 0.4); white-space: nowrap; line-height: 1.2; }
          
          /* Mobile Thumbnails */
          .hm-mobile-thumbnails-section { margin-top: 10px; }
          .hm-thumbnail-card-mob { width: 105px !important; height: 85px !important; }
        }
      `}</style>
    </section>
  );
}
