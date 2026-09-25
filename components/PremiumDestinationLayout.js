'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  const [isNavSticky, setIsNavSticky] = useState(false);
  const navRef = useRef(null);
  const sentinelRef = useRef(null);
  const readLessRef = useRef(null);
  const bottomContentRef = useRef(null);

  // --- Typing Text Effect State ---
  const typingPhrases = useMemo(() => [
    pkg?.name || 'Tour Package',
    'Romantic Escapes',
    'Unforgettable Getaways',
    'Perfect Togetherness',
    'Dream Honeymoons'
  ], [pkg?.name]);

  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {
    let timeout;
    const i = loopNum % typingPhrases.length;
    const fullText = typingPhrases[i];

    if (isDeleting) {
      timeout = setTimeout(() => {
        setTypedText(fullText.substring(0, typedText.length - 1));
      }, 50); // Deletion speed
    } else {
      timeout = setTimeout(() => {
        setTypedText(fullText.substring(0, typedText.length + 1));
      }, 100); // Typing speed
    }

    if (!isDeleting && typedText === fullText) {
      // Wait before starting to delete
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && typedText === '') {
      // Move to next phrase and start typing
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
    }

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, loopNum, typingPhrases]);

  // --- Carousel State ---
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselImages = useMemo(() => {
    const defaultImages = [
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80'
    ];
    return [
      media?.images?.[2]?.url || defaultImages[0],
      media?.images?.[3]?.url || defaultImages[1],
      media?.images?.[4]?.url || defaultImages[2]
    ];
  }, [media]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  // (Observers removed; merged into handleScroll below for maximum reliability)

  useEffect(() => {
    const handleScroll = () => {
      // 1. Update active nav pill section
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

      // 2. Handle sticky nav state
      const sentinel = sentinelRef.current;
      const readLess = readLessRef.current;
      const bottomContent = bottomContentRef.current;

      if (sentinel) {
        const sentinelRect = sentinel.getBoundingClientRect();
        // Sticky activates when user scrolls past sentinel (top <= 0)
        if (sentinelRect.top <= 0) {
          let pastContent = false;

          // If the destination picker section is in view, stop hovering
          if (bottomContent) {
            const bottomRect = bottomContent.getBoundingClientRect();
            // 60px buffer (roughly height of the sticky nav)
            if (bottomRect.top <= 60) {
              pastContent = true;
            }
          }

          // Also check read less if expanded
          if (readLess && !pastContent) {
            const readLessRect = readLess.getBoundingClientRect();
            if (readLessRect.top <= 60) {
              pastContent = true;
            }
          }

          setIsNavSticky(!pastContent);
        } else {
          setIsNavSticky(false);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll the nav bar to keep the active item visible
  useEffect(() => {
    const activeBtn = document.querySelector(`[data-nav-id="${activeSection}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeSection]);

  const getNavHeight = () => navRef.current?.offsetHeight || 56;

  const scrollTo = (id) => {
    if (id !== 'overview' && !isExpanded) {
      setIsExpanded(true);
      setTimeout(() => {
        const el = document.getElementById(`section-${id}`);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - getNavHeight() - 16;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 80);
      return;
    }
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - getNavHeight() - 16;
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
        <video
          className="hero-img"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/6401592-hd_1920_1080_24fps.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="typed-text">{typedText}</span>
            <span className="typing-cursor">|</span>
          </h1>
          <div className="hero-stats">
            <div className="stat-badge"><span>⭐</span> <span className="stat-text">{rating}/5 Based on {reviews} reviews</span></div>
            <div className="stat-badge"><span>❤️</span> <span className="stat-text">98% Travellers Recommend</span></div>
            <div className="stat-badge"><span>🎁</span> <span className="stat-text">Best Price Guarantee</span></div>
          </div>
        </div>

        {/* Decorative Multi-Layer Romantic Wave Separator */}
        <div className="hero-curved-edge">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="edge-svg edge-layer edge-layer-1">
            <path d="M0,120 L0,50 C120,70 240,85 360,80 C480,75 600,55 720,45 C840,35 960,40 1080,55 C1200,70 1320,75 1440,60 L1440,120 Z" fill="#C23B6B" />
          </svg>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="edge-svg edge-layer edge-layer-2">
            <path d="M0,120 L0,62 C180,80 360,90 540,82 C720,74 840,55 960,52 C1080,49 1260,65 1440,70 L1440,120 Z" fill="#F2A5BC" />
          </svg>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="edge-svg edge-layer edge-layer-3">
            <path d="M0,120 L0,72 C160,92 320,100 480,94 C640,88 760,68 900,62 C1040,56 1200,70 1440,80 L1440,120 Z" fill="var(--pink-bg)" />
          </svg>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="edge-svg edge-layer edge-layer-accent">
            <path d="M0,72 C160,92 320,100 480,94 C640,88 760,68 900,62 C1040,56 1200,70 1440,80" fill="none" stroke="#D9466F" strokeWidth="1.5" opacity="0.45" />
          </svg>
          <div className="edge-flourish">
            <div className="flourish-ornament-group">
              <div className="flourish-dot-outer"></div>
              <div className="flourish-line"></div>
              <div className="flourish-dot-inner"></div>
            </div>
            <svg className="flourish-heart" width="26" height="26" viewBox="0 0 24 24" fill="#D9466F" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <div className="flourish-ornament-group">
              <div className="flourish-dot-inner"></div>
              <div className="flourish-line"></div>
              <div className="flourish-dot-outer"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Sentinel: sits at the bottom of the hero. When it scrolls out of view,
          the IntersectionObserver triggers the sticky nav class. */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* NAV BAR: in normal flow initially; becomes fixed after hero scrolls past */}
      <div
        ref={navRef}
        className={`premium-sidebar${isNavSticky ? ' is-sticky' : ''}`}
      >
        {/* Pill capsule nav — centered, compact, floating */}
        <div className="nav-pill-wrapper">
          <nav className="nav-links">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'highlights', label: 'Highlights' },
              { id: 'activities', label: 'Must Do Activities' },
              { id: 'tips', label: 'Travel Tips & Tricks' },
              { id: 'info', label: 'Know Before You Go' },
              { id: 'time', label: 'Best Time to Visit' },
            ].map((link) => (
              <button
                key={link.id}
                data-nav-id={link.id}
                className={`nav-link${activeSection === link.id ? ' active' : ''}`}
                onClick={() => scrollTo(link.id)}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/*
        Content wrapper. When nav is sticky (fixed), we add padding-top equal to
        the nav height so the content isn't hidden behind it.
      */}
      <div style={{ paddingTop: isNavSticky ? (navRef.current?.offsetHeight || 56) : 0 }}>
        {/* Main 2-Column Content (center + right) */}
        <section className="premium-main">

          {/* CENTER COLUMN TOP (Overview) */}
          <div className="premium-center-top" style={{ paddingRight: renderBookingCard ? 32 : 0 }}>
            <div id="section-overview" className={`content-section ${!isExpanded ? 'preview-mode' : ''}`}>
              <h2 className="section-heading serif">Romance, culture &amp; unforgettable escapes</h2>
              <div className={`section-text ${!isExpanded ? 'section-text-preview' : ''}`}>
                <p>
                  {pkg?.description || 'Your honeymoon is more than just a holiday—it is the beginning of a beautiful new chapter together. From romantic sunsets and candlelit dinners to breathtaking landscapes and intimate experiences, every moment deserves to feel special. Our honeymoon escapes are thoughtfully designed for couples who want to celebrate their love, discover beautiful destinations, and create memories that will last a lifetime.'}
                </p>
                {!pkg?.description && (
                  <p style={{ marginTop: '16px' }}>
                    Imagine waking up together to panoramic mountain views, enjoying a peaceful breakfast surrounded by nature, taking a romantic walk along a golden beach, or watching the sunset hand in hand in a destination you have always dreamed of visiting. Whether you picture your honeymoon in the serene valleys of the Himalayas, beside the turquoise waters of a tropical island, amid the royal charm of Rajasthan, or in an enchanting international destination, we help turn those dreams into unforgettable experiences.
                  </p>
                )}
                
                {!pkg?.description && (
                  <div className="extended-description">
                    <h3 className="sub-heading serif" style={{ fontSize: '22px', marginTop: '32px', marginBottom: '16px' }}>Celebrate Your Love in Beautiful Destinations</h3>
                    <p>
                      Every couple has their own idea of the perfect honeymoon. Some dream of peaceful beaches and luxurious resorts, while others want scenic mountains, charming cities, cultural discoveries, or exciting adventures. Our honeymoon experiences bring together romance, comfort, exploration, and relaxation so you can enjoy a journey that reflects your personality as a couple.
                    </p>
                    <p style={{ marginTop: '16px' }}>
                      Explore fascinating cultures together, discover historic landmarks, stroll through colourful local markets, taste authentic cuisine, and experience the traditions that make each destination unique. These shared experiences become more than photographs—they become stories you will continue telling each other for years to come.
                    </p>

                    <h3 className="sub-heading serif" style={{ fontSize: '22px', marginTop: '32px', marginBottom: '16px' }}>Moments Made Just for Two</h3>
                    <p>
                      A perfect honeymoon is about the little moments as much as the destination itself. Enjoy private dinners under the stars, beautiful sunset views, couple experiences, relaxing spa sessions, scenic excursions, romantic stays, and leisurely days where you can simply enjoy being together.
                    </p>
                    <p style={{ marginTop: '16px' }}>
                      For adventure-loving couples, add excitement to your honeymoon with activities such as trekking, scenic road trips, water adventures, wildlife experiences, or exploring hidden corners of your destination. And when you simply want to slow down, unwind in a beautiful resort, enjoy uninterrupted time together, and let the world fade away.
                    </p>

                    <h3 className="sub-heading serif" style={{ fontSize: '22px', marginTop: '32px', marginBottom: '16px' }}>Your First Journey Together</h3>
                    <p>
                      We understand that your honeymoon should feel personal, effortless, and memorable. From selecting the right destination and accommodation to planning experiences that make your journey special, every detail can be tailored around your preferences, travel style, and budget.
                    </p>
                    <p style={{ marginTop: '16px' }}>
                      Whether you are looking for a luxurious romantic retreat, a dreamy beach escape, a peaceful mountain honeymoon, a cultural adventure, or a perfect blend of romance and exploration, your ideal getaway is waiting.
                    </p>
                    <p style={{ marginTop: '16px' }}>
                      Start your journey together with a honeymoon filled with love, beautiful places, unforgettable experiences, and moments that belong only to the two of you.
                    </p>
                  </div>
                )}
              </div>

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
                      <p>Ancient towns &amp; local markets</p>
                    </div>
                    <div className="highlight-card">
                      <span className="icon">🍽️</span>
                      <h4>Culinary Delights</h4>
                      <p>Street food &amp; fine dining</p>
                    </div>
                    <div className="highlight-card">
                      <span className="icon">📸</span>
                      <h4>Picture Perfect</h4>
                      <p>Iconic landscapes &amp; experiences</p>
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
                      <h4>Travel Tips &amp; Tricks</h4>
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

                <div ref={readLessRef} style={{ textAlign: 'right', width: '100%' }}>
                  <button className="read-more-btn read-less" onClick={() => setIsExpanded(false)}>
                    Read Less ↑
                  </button>
                </div>
              </>
            </div>
          )}

          {/* RIGHT COLUMN (Booking Card / Image Grid) */}
          <aside className="premium-right">
            {renderBookingCard ? (
              <div className="sticky-booking-card">
                {renderBookingCard()}
              </div>
            ) : (
              <div className="right-image-carousel">
                {carouselImages.map((src, idx) => (
                  <div
                    key={idx}
                    className={`carousel-slide ${idx === carouselIndex ? 'active' : ''}`}
                  >
                    <Image
                      src={src}
                      alt={`destination slide ${idx}`}
                      fill
                      className="carousel-img"
                    />
                  </div>
                ))}
                <div className="carousel-indicators">
                  {carouselImages.map((_, idx) => (
                    <button
                      key={idx}
                      className={`carousel-dot ${idx === carouselIndex ? 'active' : ''}`}
                      onClick={() => setCarouselIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </section>

      </div>{/* end content wrapper */}

      {/* Bottom Content / Destination Picker */}
      <div ref={bottomContentRef}>
        {renderBottom ? renderBottom() : null}
      </div>

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
          align-items: stretch;
          padding: 100px 5% 60px 5%;
          overflow: visible;
          margin-bottom: 0;
        }
        .hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 1;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.05) 100%);
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
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
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
          font-family: 'Playfair Display', serif;
          margin-bottom: 16px;
          line-height: 1.1;
          min-height: 65px;
        }
        .typed-text {
          color: black;
        }
        .typing-cursor {
          display: inline-block;
          font-weight: 300;
          color: white;
          animation: blink 1s step-end infinite;
          margin-left: 2px;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
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
        .stat-badge span:not(.stat-text) {
          display: inline-block;
          font-size: 18px;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .stat-badge:hover span:not(.stat-text) {
          transform: scale(1.3) rotate(15deg);
        }

        /* HERO MULTI-LAYER WAVE SEPARATOR */
        .hero-curved-edge {
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 100px;
          z-index: 10;
          pointer-events: none;
        }
        .edge-layer {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .edge-layer-1 { z-index: 1; }
        .edge-layer-2 { z-index: 2; }
        .edge-layer-3 { z-index: 3; }
        .edge-layer-accent { z-index: 4; }
        .edge-svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        /* Centered Heart + Ornaments */
        .edge-flourish {
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 15;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          pointer-events: none;
        }
        .flourish-heart {
          display: block;
          filter: drop-shadow(0 1px 3px rgba(217, 70, 111, 0.25));
          flex-shrink: 0;
        }
        .flourish-ornament-group {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .flourish-line {
          width: 28px;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, #D9466F, transparent);
          opacity: 0.6;
        }
        .flourish-dot-outer {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: 1.5px solid #D9466F;
          opacity: 0.55;
          flex-shrink: 0;
        }
        .flourish-dot-inner {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #D9466F;
          opacity: 0.5;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .hero-curved-edge {
            height: 60px;
          }
          .edge-flourish {
            bottom: 2px;
            transform: translateX(-50%) scale(0.75);
          }
          .flourish-line {
            width: 18px;
          }
        }

        /* ── NAV BAR ─────────────────────────────────────────────── */

        /* Outer band: full-width, white background strip */
        .premium-sidebar {
          position: relative;
          width: 100%;
          z-index: 200;
          padding: 14px 20px;
          background: transparent;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        /* When sticky: band gets solid white bg + subtle shadow */
        .premium-sidebar.is-sticky {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 16px rgba(0,0,0,0.08);
          padding: 10px 20px;
        }

        /* Inner pill capsule */
        .nav-pill-wrapper {
          display: inline-flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 50px;
          box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.06);
          padding: 4px 6px;
          overflow-x: auto;
          scrollbar-width: none;
          max-width: calc(100vw - 40px);
          gap: 2px;
        }
        .nav-pill-wrapper::-webkit-scrollbar {
          display: none;
        }

        /* Nav flex row */
        .nav-links {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 2px;
          white-space: nowrap;
          flex-wrap: nowrap;
        }

        /* Individual tab button */
        .nav-link {
          display: inline-flex;
          align-items: center;
          padding: 8px 18px;
          border-radius: 30px;
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 500;
          color: #4A5568;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
          font-family: inherit;
          line-height: 1;
        }
        .nav-link:hover {
          background: rgba(217, 70, 111, 0.08);
          color: var(--pink-primary);
        }
        /* Active tab: solid filled pill */
        .nav-link.active {
          background: var(--pink-primary);
          color: #ffffff;
          font-weight: 600;
        }
        .nav-link.active:hover {
          background: var(--pink-dark);
          color: #ffffff;
        }

        /* MAIN 2-COLUMN CONTENT */
        .premium-main {
          display: grid;
          grid-template-columns: minmax(400px, 1fr) minmax(380px, 480px);
          grid-template-rows: max-content 1fr;
          gap: 0 40px;
          max-width: 100%;
          justify-content: space-between;
          padding: 40px 32px 96px;
        }

        /* CENTER CONTENT */
        .premium-center-top {
          grid-column: 1;
          grid-row: 1;
          display: flex;
          flex-direction: column;
        }
        #section-overview {
          display: flex;
          flex-direction: column;
          min-height: 564px;
        }
        #section-overview.preview-mode {
          height: 564px;
        }
        #section-overview .section-text {
          flex: 1;
        }
        .section-text-preview {
          overflow: hidden;
          position: relative;
        }
        .section-text-preview::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(to bottom, transparent, var(--pink-bg));
          pointer-events: none;
        }
        .premium-center-bottom {
          grid-column: 1;
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
          top: 60px; /* offset below the sticky nav bar */
          align-self: start;
          grid-column: 2;
          grid-row: 1 / span 2;
        }
        .sticky-booking-card {
        }

        .right-image-carousel {
          width: 100%;
          height: 564px;
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          background: #000;
        }
        .carousel-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1s ease-in-out;
        }
        .carousel-slide.active {
          opacity: 1;
          z-index: 1;
        }
        .carousel-img {
          object-fit: cover;
          transition: transform 5s ease-in-out;
        }
        .carousel-slide.active .carousel-img {
          transform: scale(1.05);
        }
        .carousel-indicators {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 2;
        }
        .carousel-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: background 0.3s ease;
          border: none;
          padding: 0;
        }
        .carousel-dot.active {
          background: #fff;
        }

        .premium-picker-wrapper {
          background: #fff;
          border-top: 1px solid var(--pink-soft);
        }

        @media (max-width: 1100px) {
          .premium-main {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
            padding: 24px 5% 64px;
            gap: 32px;
          }
          .premium-center-top, .premium-center-bottom, .premium-right {
            grid-column: 1;
            grid-row: auto;
          }
          .premium-right {
            position: relative;
            top: 0;
          }
          .nav-links {
            padding: 0 12px;
          }
          .nav-link {
            padding: 10px 16px;
            font-size: 13px;
          }
          .highlights-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .premium-hero {
            align-items: stretch;
          }
          .hero-content {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
            padding-top: 40px;
          }
          .hero-title {
            font-size: 28.8px;
            white-space: nowrap;
            min-height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
          }
          .hero-stats {
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: space-evenly;
            width: 100%;
          }
          .stat-badge {
            position: relative;
            flex: unset;
            padding: 12px;
            border-radius: 50%;
            width: 52px;
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .stat-badge span:not(.stat-text) {
            font-size: 22px;
            margin-bottom: 0;
            display: block;
          }
          .stat-text {
            position: absolute;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.85);
            color: #fff;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            line-height: 1.3;
            font-weight: 400;
            z-index: 10;
          }
          .stat-text::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-width: 6px;
            border-style: solid;
            border-color: rgba(0,0,0,0.85) transparent transparent transparent;
          }
          .stat-badge:hover .stat-text,
          .stat-badge:active .stat-text {
            opacity: 1;
            transform: translateX(-50%) translateY(-6px);
          }

          /* Prevent first/last tooltips from overflowing screen edges */
          .stat-badge:first-child .stat-text {
            left: -10px;
            transform: none;
          }
          .stat-badge:first-child:hover .stat-text,
          .stat-badge:first-child:active .stat-text {
            transform: translateY(-6px);
          }
          .stat-badge:first-child .stat-text::after {
            left: 36px;
            transform: translateX(-50%);
          }

          .stat-badge:last-child .stat-text {
            left: auto;
            right: -10px;
            transform: none;
          }
          .stat-badge:last-child:hover .stat-text,
          .stat-badge:last-child:active .stat-text {
            transform: translateY(-6px);
          }
          .stat-badge:last-child .stat-text::after {
            left: auto;
            right: 36px;
            transform: translateX(50%);
          }
          .highlights-grid {
            grid-template-columns: 1fr;
          }
          .sticky-booking-card {
            position: relative;
            top: 0;
          }
          .right-image-carousel {
            height: 320px;
          }
          #section-overview {
            min-height: auto;
          }
          #section-overview.preview-mode {
            height: auto;
          }

          /* Show exactly 3 lines of the first paragraph on mobile before clicking Read More */
          .section-text-preview > p:first-of-type {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .section-text-preview > *:not(:first-child) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
