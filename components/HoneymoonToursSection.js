'use client';

import React, { useState, useEffect, useMemo } from 'react';
import TrendingTourCard from './TrendingTourCard';
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
  const [loading, setLoading] = useState(true);
  const [apiTours, setApiTours] = useState([]);
  
  // Filters
  const [regionFilter, setRegionFilter] = useState('All'); // 'All', 'Indian', 'International'
  const [budgetFilter, setBudgetFilter] = useState('Any'); // 'Any', 'Under ₹50k', '₹50k - ₹1L', 'Above ₹1L'

  const [showAllTours, setShowAllTours] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const packages = await getPackages({ limit: 200 }); // fetch more to ensure we get enough honeymoons
        
        if (isMounted) {
          const formattedTours = packages.map(normalizePackageToTour);
          
          // Only keep Honeymoon tours (or ones that mention it)
          const honeymoonTours = formattedTours.filter(t => {
            const str = `${t.title} ${t.category} ${t.type} ${t.description}`.toLowerCase();
            return str.includes('honeymoon') || str.includes('romantic') || str.includes('maldives') || str.includes('bali');
          });
          
          setApiTours(honeymoonTours);
        }
      } catch (err) {
        console.error("Error fetching honeymoon tours:", err);
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

    // Region Filter
    if (regionFilter === 'Indian') {
      result = result.filter(t => isIndianDestination(t));
    } else if (regionFilter === 'International') {
      result = result.filter(t => !isIndianDestination(t));
    }

    // Budget Filter
    if (budgetFilter === 'Under ₹50k') {
      result = result.filter(t => t.price < 50000);
    } else if (budgetFilter === '₹50k - ₹1L') {
      result = result.filter(t => t.price >= 50000 && t.price <= 100000);
    } else if (budgetFilter === 'Above ₹1L') {
      result = result.filter(t => t.price > 100000);
    }

    return result;
  }, [apiTours, regionFilter, budgetFilter]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    handleResize(); // Initialize on client
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const limit = isMobile ? 6 : 4;
  const displayedTours = showAllTours ? filteredTours : filteredTours.slice(0, limit);

  // Don't render section if no honeymoon tours exist at all (after loading)
  if (!loading && apiTours.length === 0) return null;

  return (
    <section className={themeClass} style={{
      padding: '0 0 20px',
      background: themeClass.includes('blush') ? 'transparent' : 'var(--color-bg)',
      position: 'relative',
      width: '100%',
    }}>
      {/* Hero Banner Background */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: `url('/images/honeymoon_hero_bg.jpg') center/cover no-repeat`,
        marginBottom: '60px',
      }}>
        {/* Dark overlay for better text contrast */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}></div>
        
        {/* Heading */}
        <div className="text-center" style={{ position: 'relative', zIndex: 1, padding: '0 20px', marginTop: '40px' }}>
          <h2 style={{ fontSize: '42px', fontWeight: 800, color: '#fff', fontFamily: '"Italiana", sans-serif', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            Honeymoon <span style={{ color: themeClass.includes('blush') ? '#ffb6c1' : '#fff', fontStyle: 'italic', fontWeight: 500 }}> Tour </span> Destinations
          </h2>
        </div>
      </div>
      
      <div className="container" style={{ maxWidth: '1400px', marginTop: '-100px', position: 'relative', zIndex: 2 }}>

        {/* Horizontal Filter Bar */}
        <div className="honeymoon-filter-bar">
          
          {/* Region Toggle */}
          <div className="honeymoon-region-group">
            <span className="filter-label">Region:</span>
            {['All', 'Indian', 'International'].map(region => (
              <button
                key={region}
                onClick={() => setRegionFilter(region)}
                className={`filter-btn ${regionFilter === region ? 'active' : ''}`}
              >
                {region}
              </button>
            ))}
          </div>

          <div className="honeymoon-filter-divider" />

          {/* Budget Dropdown */}
          <div className="honeymoon-budget-group">
             <span className="filter-label">Budget:</span>
             <select 
               value={budgetFilter}
               onChange={(e) => setBudgetFilter(e.target.value)}
               className="filter-select"
             >
               {['Any', 'Under ₹50k', '₹50k - ₹1L', 'Above ₹1L'].map(budget => (
                 <option key={budget} value={budget}>{budget}</option>
               ))}
             </select>
          </div>

        </div>

        {/* Main Grid */}
        <div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} style={{ height: '360px', background: '#f5f5f5', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : filteredTours.length > 0 ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {displayedTours.map((tour) => (
                  <TrendingTourCard key={tour.id || tour.slug} tour={tour} />
                ))}
              </div>
              
              {/* Show All Toggle Button */}
              {filteredTours.length > limit && (
                <div className="text-center" style={{ marginTop: '40px' }}>
                  <button 
                    onClick={() => setShowAllTours(!showAllTours)}
                    style={{
                      background: 'transparent',
                      border: '2px solid var(--color-primary)',
                      color: 'var(--color-primary)',
                      padding: '12px 32px',
                      borderRadius: '100px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
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
                    {showAllTours ? 'Show Less' : `View All ${filteredTours.length} Tours`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center" style={{ padding: '60px 0', color: '#777' }}>
              <p style={{ fontSize: '18px' }}>No honeymoon tours found for these filters.</p>
              <button 
                onClick={() => { setRegionFilter('All'); setBudgetFilter('Any'); }}
                style={{ marginTop: '16px', background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .honeymoon-filter-bar {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 24px;
          margin: 0 auto 40px auto;
          background: #fff;
          padding: 16px 32px;
          border-radius: 100px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          width: fit-content;
        }
        .honeymoon-region-group, .honeymoon-budget-group {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .filter-label {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          color: #888;
          margin-right: 8px;
        }
        .filter-btn {
          padding: 8px 24px;
          border-radius: 24px;
          font-size: 14px;
          font-weight: 600;
          border: 1.5px solid transparent;
          background: #f5f5f5;
          color: #555;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .filter-btn.active {
          border-color: var(--color-primary);
          background: var(--color-primary);
          color: #fff;
        }
        .honeymoon-filter-divider {
          width: 1px;
          height: 30px;
          background: #e0e0e0;
          margin: 0 8px;
        }
        .filter-select {
          padding: 8px 36px 8px 20px;
          border-radius: 24px;
          border: 1.5px solid #e0e0e0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          background: transparent;
          outline: none;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23333%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
        }
        
        @media (max-width: 768px) {
          .honeymoon-filter-bar {
            flex-direction: column;
            border-radius: 32px;
            padding: 12px 16px;
            width: 85%;
            max-width: 300px;
            gap: 8px;
            margin: 0 auto 30px auto;
          }
          .honeymoon-region-group {
            flex-wrap: wrap;
            justify-content: center;
            gap: 6px;
          }
          .filter-label {
            width: 100%;
            text-align: center;
            margin-right: 0;
            margin-bottom: 2px;
            font-size: 10px;
          }
          .filter-btn {
            padding: 4px 10px;
            font-size: 11px;
          }
          .honeymoon-filter-divider {
            width: 80%;
            height: 1px;
            margin: 2px 0;
          }
          .honeymoon-budget-group {
            width: 100%;
            flex-direction: column;
          }
          .filter-select {
            width: 100%;
            max-width: 200px;
            padding: 4px 24px 4px 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </section>
  );
}
