'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function PremiumDestinationLayout({
  pkg,
  media,
  priceLabel,
  renderBookingCard,
  destinationNames,
  includedItems,
  excludedItems,
  renderBottom,
}) {
  const [activeSection, setActiveSection] = useState('overview');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'highlights', 'activities', 'tips', 'info', 'time'];
      for (const section of sections) {
        const el = document.getElementById(`section-${section}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    if (id !== 'overview' && !isExpanded) {
      setIsExpanded(true);
      // Wait for React to render the expanded content before scrolling
      setTimeout(() => {
        const el = document.getElementById(`section-${id}`);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
      return;
    }

    const el = document.getElementById(`section-${id}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const heroImage = media?.images?.[0]?.url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2000&q=80';
  const rating = pkg?.rating || 4.8;
  const reviews = pkg?.review_count || 8250;

  return (
    <div className="premium-layout">
      {/* Hero Section */}
      <section className="premium-hero">
        <Image src={heroImage} alt={pkg?.name || 'Package'} fill className="hero-img" priority />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">{pkg?.name || 'Tour Package'}</h1>
          <div className="hero-stats">
            <div className="stat-badge"><span>⭐</span> {rating}/5 Based on {reviews} reviews</div>
            <div className="stat-badge"><span>❤️</span> 98% Travellers Recommend</div>
            <div className="stat-badge"><span>🎁</span> Best Price Guarantee</div>
          </div>
        </div>
      </section>

      {/* Main Content 3-Column */}
      <section className="premium-main">
        {/* LEFT COLUMN */}
        <aside className="premium-sidebar">
          <div className="nav-card">
            <div className="nav-card-img">
              <Image src={media?.images?.[1]?.url || heroImage} alt="nav image" fill className="nav-img" />
            </div>
            <nav className="nav-links">
              {[
                { id: 'overview', label: 'Overview', icon: '🏠' },
                { id: 'highlights', label: 'Highlights', icon: '💎' },
                { id: 'activities', label: 'Must Do Activities', icon: '📸' },
                { id: 'tips', label: 'Travel Tips & Tricks', icon: '💡' },
                { id: 'info', label: 'Know Before You Go', icon: 'ℹ️' },
                { id: 'time', label: 'Best Time to Visit', icon: '📅' },
              ].map((link) => (
                <button
                  key={link.id}
                  className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
                  onClick={() => scrollTo(link.id)}
                >
                  <span className="nav-icon">{link.icon}</span>
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* CENTER COLUMN TOP (Overview) */}
        <div className="premium-center-top" style={{ paddingRight: renderBookingCard ? 32 : 0 }}>
          <div id="section-overview" className="content-section">
            <h2 className="section-heading serif">Romance, culture & unforgettable escapes</h2>
            <p className="section-text">
              {pkg?.description || 'A honeymoon is a journey of togetherness. Wander ancient towns, indulge in world-class cuisine, and craft memories that last a lifetime.'}
            </p>

            {!isExpanded && (
              <div style={{ textAlign: 'right', width: '100%' }}>
                <button className="read-more-btn" onClick={() => setIsExpanded(true)}>
                  Read More ↓
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN BOTTOM (Highlights, etc.) */}
        {isExpanded && (
          <div className="premium-center-bottom" style={{ paddingRight: renderBookingCard ? 32 : 0 }}>
            <>
              <div id="section-highlights" className="content-section">
                <h3 className="sub-heading serif">Highlights</h3>
                <div className="highlights-grid">
                  <div className="highlight-card">
                    <span className="icon">🚢</span>
                    <h4>Scenic Cruises</h4>
                    <p>Breathtaking bay cruises</p>
                  </div>
                  <div className="highlight-card">
                    <span className="icon">🏮</span>
                    <h4>Cultural Charm</h4>
                    <p>Ancient towns & local markets</p>
                  </div>
                  <div className="highlight-card">
                    <span className="icon">🍽️</span>
                    <h4>Culinary Delights</h4>
                    <p>Street food & fine dining</p>
                  </div>
                  <div className="highlight-card">
                    <span className="icon">📸</span>
                    <h4>Picture Perfect</h4>
                    <p>Iconic landscapes & experiences</p>
                  </div>
                </div>
              </div>

              <div className="timeline-section">
                <div id="section-activities" className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <h4>Must Do Activities</h4>
                    <p>Enjoy lantern releases, explore ancient tunnels, take a cyclo ride, and relax on pristine beaches.</p>
                  </div>
                </div>

                <div id="section-tips" className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <h4>Travel Tips & Tricks</h4>
                    <p>Carry light cottons, comfortable footwear, and sunscreen. Bargain politely in markets and try a local SIM for better connectivity.</p>
                  </div>
                </div>

                <div id="section-info" className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <h4>Know Before You Go</h4>
                    <p>Check visa requirements for your passport. Keep passport valid for 6 months. Respect local customs and dress modestly at temples.</p>
                  </div>
                </div>

                <div id="section-time" className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <h4>Best Time to Visit</h4>
                    <p>The best time to visit is from February to April when the weather is pleasant and ideal for sightseeing and beach holidays.</p>
                  </div>
                </div>
              </div>

              {includedItems?.length > 0 && (
                <div className="inclusions-section">
                  <h4>Inclusions</h4>
                  <ul>
                    {includedItems.slice(0, 5).map(inc => <li key={inc.id}>✅ {inc.text}</li>)}
                  </ul>
                </div>
              )}

              <div style={{ textAlign: 'right', width: '100%' }}>
                <button className="read-more-btn read-less" onClick={() => setIsExpanded(false)}>
                  Read Less ↑
                </button>
              </div>
            </>
          </div>
        )}

        {/* RIGHT COLUMN (Booking Card Wrapper) */}
        <aside className="premium-right">
          {renderBookingCard ? (
            <div className="sticky-booking-card">
              {renderBookingCard()}
            </div>
          ) : (
            <div className="right-image-grid">
              <div className="right-img-large">
                <Image 
                  src={media?.images?.[2]?.url || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80'} 
                  alt="destination" 
                  fill 
                  className="right-img" 
                />
              </div>
              <div className="right-image-row">
                <div className="right-img-small">
                  <Image 
                    src={media?.images?.[3]?.url || 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80'} 
                    alt="destination" 
                    fill 
                    className="right-img" 
                  />
                </div>
                <div className="right-img-small">
                  <Image 
                    src={media?.images?.[4]?.url || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80'} 
                    alt="destination" 
                    fill 
                    className="right-img" 
                  />
                </div>
              </div>
            </div>
          )}
        </aside>
      </section>

      {/* Bottom Content / Destination Picker */}
      {renderBottom ? renderBottom() : null}

      <style jsx>{`
        /* LUXURY BLUSH THEME CSS */
        .premium-layout {
          --pink-primary: #D9466F;
          --pink-dark: #B8325A;
          --pink-soft: #FCE7ED;
          --pink-bg: #FFF9FA;
          --text-main: #171717;
          --text-sec: #6B6670;
          
          background: var(--pink-bg);
          color: var(--text-main);
          font-family: var(--font-sans, system-ui, sans-serif);
          min-height: 100vh;
        }

        .serif {
          font-family: 'Playfair Display', serif;
        }

        /* HERO */
        .premium-hero {
          position: relative;
          height: 600px;
          display: flex;
          align-items: flex-end;
          padding: 60px 5%;
          overflow: hidden;
          border-radius: 0 0 32px 32px;
          margin-bottom: 64px;
        }
        .hero-img {
          object-fit: cover;
          z-index: 1;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%);
          z-index: 2;
        }
        .hero-content {
          position: relative;
          z-index: 3;
          color: white;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          text-align: center;
        }
        .breadcrumb {
          font-size: 13px;
          opacity: 0.8;
          margin-bottom: 24px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .hero-title {
          font-size: 56px;
          font-weight: 700;
          margin-bottom: 16px;
          line-height: 1.1;
        }
        .hero-subtitle {
          font-size: 18px;
          opacity: 0.9;
          max-width: 700px;
          margin-bottom: 32px;
          line-height: 1.5;
        }
        .hero-stats {
          display: flex;
          justify-content: space-between;
          width: 100%;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 32px;
        }
        .stat-badge {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(12px);
          padding: 12px 24px;
          border-radius: 100px;
          font-size: 15px;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.3);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .stat-badge:hover {
          transform: translateY(-6px) scale(1.05);
          background: rgba(255,255,255,0.25);
          border: 1px solid rgba(255,255,255,0.6);
          box-shadow: 0 12px 30px rgba(0,0,0,0.2);
        }
        .stat-badge span {
          display: inline-block;
          font-size: 18px;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .stat-badge:hover span {
          transform: scale(1.3) rotate(15deg);
        }

        /* MAIN 3-COLUMN */
        .premium-main {
          display: grid;
          grid-template-columns: 280px minmax(400px, 1fr) minmax(380px, 480px);
          grid-template-rows: max-content 1fr;
          gap: 0 40px;
          max-width: 100%;
          justify-content: space-between;
          padding: 0 32px 96px;
        }

        /* LEFT SIDEBAR */
        .premium-sidebar {
          position: sticky;
          top: 100px;
          align-self: start;
          grid-column: 1;
          grid-row: 1 / span 2;
        }
        .nav-card {
          background: #fff;
          border-radius: 24px;
          border: 1px solid var(--pink-soft);
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(217, 70, 111, 0.05);
        }
        .nav-card-img {
          position: relative;
          height: 160px;
          width: 100%;
        }
        .nav-img {
          object-fit: cover;
        }
        .nav-links {
          padding: 24px 0;
          display: flex;
          flex-direction: column;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          background: none;
          border: none;
          text-align: left;
          font-size: 15px;
          font-weight: 500;
          color: var(--text-sec);
          cursor: pointer;
          transition: all 0.3s ease;
          border-left: 4px solid transparent;
        }
        .nav-link:hover {
          background: var(--pink-soft);
          color: var(--pink-primary);
        }
        .nav-link.active {
          color: var(--pink-primary);
          border-left-color: var(--pink-primary);
          background: var(--pink-soft);
        }

        /* CENTER CONTENT */
        .premium-center-top {
          grid-column: 2;
          grid-row: 1;
        }
        .premium-center-bottom {
          grid-column: 2;
          grid-row: 2;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }
        .content-section {
          margin-bottom: 48px;
        }
        .section-heading {
          font-size: 36px;
          color: var(--pink-dark);
          margin-bottom: 16px;
          line-height: 1.2;
        }
        .sub-heading {
          font-size: 28px;
          color: var(--text-main);
          margin-bottom: 24px;
        }
        .section-text {
          font-size: 16px;
          color: var(--text-sec);
          line-height: 1.7;
        }

        /* HIGHLIGHTS GRID */
        .highlights-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .highlight-card {
          background: #fff;
          border: 1px solid var(--pink-soft);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          transition: transform 0.3s ease;
        }
        .highlight-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(217,70,111,0.08);
        }
        .highlight-card .icon {
          font-size: 32px;
          margin-bottom: 12px;
          display: block;
        }
        .highlight-card h4 {
          font-size: 15px;
          margin-bottom: 8px;
          color: var(--text-main);
        }
        .highlight-card p {
          font-size: 13px;
          color: var(--text-sec);
          line-height: 1.4;
        }

        /* TIMELINE */
        .timeline-section {
          display: flex;
          flex-direction: column;
          gap: 32px;
          padding-left: 12px;
          border-left: 2px dashed var(--pink-soft);
        }
        .timeline-item {
          position: relative;
          padding-left: 32px;
        }
        .timeline-dot {
          position: absolute;
          left: -17px;
          top: 4px;
          width: 32px;
          height: 32px;
          background: var(--pink-bg);
          border: 2px solid var(--pink-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .timeline-dot::after {
          content: "";
          width: 10px;
          height: 10px;
          background: var(--pink-primary);
          border-radius: 50%;
        }
        .timeline-content h4 {
          font-size: 18px;
          color: var(--text-main);
          margin-bottom: 8px;
        }
        .timeline-content p {
          font-size: 15px;
          color: var(--text-sec);
          line-height: 1.6;
        }

        /* INCLUSIONS */
        .inclusions-section h4 {
          font-size: 20px;
          margin-bottom: 16px;
        }
        .inclusions-section ul {
          list-style: none;
          padding: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .inclusions-section li {
          font-size: 15px;
          color: var(--text-sec);
          display: flex;
          gap: 8px;
        }

        /* READ MORE BUTTON */
        .read-more-btn {
          display: inline-flex;
          align-items: center;
          background: transparent;
          border: 1px solid var(--pink-primary);
          color: var(--pink-primary);
          padding: 10px 24px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          margin-top: 16px;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .read-more-btn:hover {
          background: var(--pink-primary);
          color: white;
        }
        .read-less {
          margin-top: 32px;
          margin-bottom: 24px;
        }

        /* RIGHT SIDEBAR */
        .premium-right {
          position: sticky;
          top: 100px;
          align-self: start;
          grid-column: 3;
          grid-row: 1 / span 2;
        }
        .sticky-booking-card {
        }

        .right-image-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .right-img-large {
          width: 100%;
          height: 320px;
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .right-image-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .right-img-small {
          width: 100%;
          height: 220px;
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .right-img {
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .right-img-large:hover .right-img,
        .right-img-small:hover .right-img {
          transform: scale(1.05);
        }

        .premium-picker-wrapper {
          background: #fff;
          border-top: 1px solid var(--pink-soft);
        }

        @media (max-width: 1100px) {
          .premium-main {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
            padding: 0 5% 64px;
            gap: 32px;
          }
          .premium-sidebar, .premium-center-top, .premium-center-bottom, .premium-right {
            grid-column: 1;
            grid-row: auto;
          }
          .premium-sidebar {
            display: block;
            position: sticky;
            top: 70px;
            z-index: 100;
            margin-bottom: 0;
          }
          .nav-card {
            position: relative;
            top: 0;
            z-index: auto;
            border-radius: 12px;
          }
          .nav-card-img {
            display: none; /* Hide image on mobile for space */
          }
          .nav-links {
            flex-direction: row;
            overflow-x: auto;
            padding: 8px 12px;
            white-space: nowrap;
            scrollbar-width: none;
          }
          .nav-links::-webkit-scrollbar {
            display: none;
          }
          .nav-link {
            padding: 8px 16px;
            border-left: none;
            border-bottom: 3px solid transparent;
          }
          .nav-link.active {
            border-left-color: transparent;
            border-bottom-color: var(--pink-primary);
          }
          .highlights-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 40px;
          }
          .hero-stats {
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          .stat-badge {
            width: 100%;
            max-width: 280px;
            justify-content: center;
          }
          .highlights-grid {
            grid-template-columns: 1fr;
          }
          .sticky-booking-card {
            position: relative;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
}
