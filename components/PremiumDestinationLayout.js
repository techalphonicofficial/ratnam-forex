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
  themeType = 'honeymoon',
}) {
  const [activeSection, setActiveSection] = useState('overview');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isNavSticky, setIsNavSticky] = useState(false);
  const navRef = useRef(null);
  const sentinelRef = useRef(null);
  const readLessRef = useRef(null);
  const bottomContentRef = useRef(null);

  // --- Typing Text Effect State ---
  const typingPhrases = useMemo(() => {
    if (themeType === 'nri') {
      return [
        pkg?.name || 'NRI Package',
        'Bringing you closer to your roots',
        'Your journey home, made seamless & special',
        'Reconnect with your loved ones'
      ];
    }
    if (themeType === 'group') {
      return [
        pkg?.name || 'Group Package',
        'Great journeys are better together',
        'Memories are meant to be shared',
        'Unforgettable group experiences'
      ];
    }
    if (themeType === 'family') {
      return [
        pkg?.name || 'Family Package',
        'Family journeys, made unforgettable',
        'Memorable Vacations',
        'Quality Time Together'
      ];
    }
    if (themeType === 'pilgrim') {
      return [
        pkg?.name || 'Pilgrim Package',
        'Path of faith, journey of peace',
        'Spiritual journeys, divine blessings',
        'Seek blessings, find peace'
      ];
    }
    if (themeType === 'budget') {
      return [
        pkg?.name || 'Budget Package',
        'Amazing trips, smart budgets',
        'Travel more, spend less!',
        'Great experiences, great value'
      ];
    }
    if (themeType === 'trending') {
      return [
        pkg?.name || 'Trending Package',
        'Trending Destinations',
        'Unforgettable Journeys'
      ];
    }
    return [
      pkg?.name || 'Tour Package',
      'Romantic Escapes',
      'Unforgettable Getaways',
      'Perfect Togetherness',
      'Dream Honeymoons'
    ];
  }, [pkg?.name, themeType]);

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
    const defaultImages = themeType === 'pilgrim' ? [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f7415e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600018596660-8438258e77c5?auto=format&fit=crop&w=800&q=80'
    ] : themeType === 'budget' ? [
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=800&q=80'
    ] : [
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80'
    ];
    return [
      media?.images?.[2]?.url || defaultImages[0],
      media?.images?.[3]?.url || defaultImages[1],
      media?.images?.[4]?.url || defaultImages[2]
    ];
  }, [media, themeType]);

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

  const heroImage = media?.images?.[0]?.url || (themeType === 'pilgrim' ? 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=2000&q=80' : (themeType === 'budget' ? 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80' : 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2000&q=80'));
  const rating = pkg?.rating || 4.9;
  const reviews = pkg?.review_count || 3200;

  return (
    <div className="premium-layout" style={{
      '--theme-bg': themeType === 'nri' ? '#FFFCF5' : (themeType === 'group' ? '#FAF5FA' : (themeType === 'family' ? '#FFFDF7' : (themeType === 'pilgrim' ? '#FFF9EF' : (themeType === 'budget' ? '#F8FFF6' : (themeType === 'trending' ? '#FFF9F7' : 'var(--pink-bg)'))))),
      '--theme-primary': themeType === 'nri' ? '#1759A6' : (themeType === 'group' ? '#9D4A93' : (themeType === 'family' ? '#2F7F7B' : (themeType === 'pilgrim' ? '#E98216' : (themeType === 'budget' ? '#2E7D32' : (themeType === 'trending' ? '#D32F2F' : 'var(--pink-primary)'))))),
      '--theme-dark': themeType === 'nri' ? '#0B2342' : (themeType === 'group' ? '#7D3A75' : (themeType === 'family' ? '#245C59' : (themeType === 'pilgrim' ? '#C9650A' : (themeType === 'budget' ? '#1F3B28' : (themeType === 'trending' ? '#B71C1C' : 'var(--pink-dark)'))))),
      '--theme-soft': themeType === 'nri' ? '#F4F7FA' : (themeType === 'group' ? '#F5E6F5' : (themeType === 'family' ? '#F2F7F4' : (themeType === 'pilgrim' ? '#F3D49A' : (themeType === 'budget' ? '#F1F8EF' : (themeType === 'trending' ? '#FFCEC0' : 'var(--pink-soft)'))))),
      '--theme-text-sec': themeType === 'nri' ? '#596575' : (themeType === 'group' ? '#6B5969' : (themeType === 'family' ? '#5E6870' : (themeType === 'pilgrim' ? '#64615D' : (themeType === 'budget' ? '#575F5A' : (themeType === 'trending' ? '#555555' : 'var(--text-sec)'))))),
      '--theme-text-main': themeType === 'nri' ? '#173A63' : (themeType === 'group' ? '#5A2A54' : (themeType === 'family' ? '#245C59' : (themeType === 'pilgrim' ? '#4A2A16' : (themeType === 'budget' ? '#1B5E20' : (themeType === 'trending' ? '#8B1E1E' : 'var(--text-main)'))))),
    }}>
      {(themeType === 'pilgrim' || themeType === 'budget' || themeType === 'trending') && (
        <style dangerouslySetInnerHTML={{ __html: `
          .seo-category-title::before {
            border-bottom-color: ${themeType === 'pilgrim' ? '#E98216' : (themeType === 'trending' ? '#D32F2F' : '#2E7D32')} !important;
          }
          .seo-category-title::after {
            background-color: ${themeType === 'pilgrim' ? '#E98216' : (themeType === 'trending' ? '#D32F2F' : '#2E7D32')} !important;
          }
        `}} />
      )}
      {/* Hero Section */}
      <section className="premium-hero">
        {themeType === 'nri' || themeType === 'family' || themeType === 'group' || themeType === 'pilgrim' || themeType === 'budget' || themeType === 'trending' ? (
          <img
            className="hero-img"
            src={heroImage}
            alt={themeType === 'nri' ? "NRI Package" : (themeType === 'group' ? "Group Adventure" : (themeType === 'pilgrim' ? "Pilgrim Package" : (themeType === 'trending' ? "Trending Destinations" : "Family Getaway")))}
          />
        ) : (
          <video
            className="hero-img"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/6401592-hd_1920_1080_24fps.mp4" type="video/mp4" />
          </video>
        )}
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="typed-text">
              {themeType === 'pilgrim' && typedText === 'Path of faith, journey of peace' ? (
                typedText.split(/(\bfaith\b|\bpeace\b)/gi).map((part, i) =>
                  (part.toLowerCase() === 'faith' || part.toLowerCase() === 'peace') ?
                    <span key={i} style={{ color: '#E98216' }}>{part}</span> : part
                )
              ) : themeType === 'budget' && typedText === 'Amazing trips, smart budgets' ? (
                typedText.split(/(\bsmart budgets\b)/gi).map((part, i) =>
                  (part.toLowerCase() === 'smart budgets') ?
                    <span key={i} style={{ color: '#2E7D32' }}>{part}</span> : part
                )
              ) : themeType === 'trending' && typedText === 'Trending Destinations' ? (
                typedText.split(/(\bTrending Destinations\b)/gi).map((part, i) =>
                  (part.toLowerCase() === 'trending destinations') ?
                    <span key={i} style={{ color: '#B71C1C' }}>{part}</span> : part
                )
              ) : typedText}
            </span>
            <span className="typing-cursor">|</span>
          </h1>
          <div className="hero-stats">
            <div className="stat-badge"><span>⭐</span> <span className="stat-text">{rating}/5 Based on {reviews} reviews</span></div>
            <div className="stat-badge"><span>❤️</span> <span className="stat-text">98% Travellers Recommend</span></div>
            <div className="stat-badge"><span>🎁</span> <span className="stat-text">Best Price Guarantee</span></div>
          </div>
        </div>

        {/* Decorative Multi-Layer Separator */}
        <div className="hero-curved-edge">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="edge-svg edge-layer edge-layer-1">
            <path d="M0,120 L0,50 C120,70 240,85 360,80 C480,75 600,55 720,45 C840,35 960,40 1080,55 C1200,70 1320,75 1440,60 L1440,120 Z" fill={themeType === 'nri' ? '#0B2342' : (themeType === 'group' ? '#84397B' : (themeType === 'family' ? '#245C59' : (themeType === 'pilgrim' ? '#E98216' : (themeType === 'budget' ? '#1B5E20' : (themeType === 'trending' ? '#B71C1C' : '#C23B6B')))))} />
          </svg>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="edge-svg edge-layer edge-layer-2">
            <path d="M0,120 L0,62 C180,80 360,90 540,82 C720,74 840,55 960,52 C1080,49 1260,65 1440,70 L1440,120 Z" fill={themeType === 'nri' ? '#1759A6' : (themeType === 'group' ? '#C27CBB' : (themeType === 'family' ? '#75AAA3' : (themeType === 'pilgrim' ? '#F3D49A' : (themeType === 'budget' ? '#8BC34A' : (themeType === 'trending' ? '#FFCEC0' : '#F2A5BC')))))} />
          </svg>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="edge-svg edge-layer edge-layer-3">
            <path d="M0,120 L0,72 C160,92 320,100 480,94 C640,88 760,68 900,62 C1040,56 1200,70 1440,80 L1440,120 Z" fill={themeType === 'nri' ? '#FFFCF5' : (themeType === 'group' ? '#FAF5FA' : (themeType === 'family' ? '#FFFDF7' : (themeType === 'pilgrim' ? '#FFF9EF' : (themeType === 'budget' ? '#F8FFF6' : (themeType === 'trending' ? '#FFF9F7' : 'var(--pink-bg)')))))} />
          </svg>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="edge-svg edge-layer edge-layer-accent">
            <path d="M0,72 C160,92 320,100 480,94 C640,88 760,68 900,62 C1040,56 1200,70 1440,80" fill="none" stroke={themeType === 'nri' ? '#1759A6' : (themeType === 'group' ? '#9D4A93' : (themeType === 'family' ? '#2F7F7B' : (themeType === 'pilgrim' ? '#E98216' : (themeType === 'budget' ? '#2E7D32' : (themeType === 'trending' ? '#D32F2F' : '#D9466F')))))} strokeWidth="1.5" opacity="0.45" />
          </svg>
          <div className="edge-flourish">
            <div className="flourish-ornament-group">
              <div className="flourish-dot-outer" style={themeType === 'nri' ? { background: '#1759A6', borderColor: '#1759A6' } : (themeType === 'group' ? { background: '#9D4A93', borderColor: '#9D4A93' } : (themeType === 'family' ? { background: '#2F7F7B', borderColor: '#2F7F7B' } : (themeType === 'pilgrim' ? { background: '#E98216', borderColor: '#E98216' } : (themeType === 'budget' ? { background: '#2E7D32', borderColor: '#2E7D32' } : (themeType === 'trending' ? { background: '#D32F2F', borderColor: '#D32F2F' } : {})))))}></div>
              <div className="flourish-line" style={themeType === 'nri' ? { background: 'linear-gradient(90deg, transparent, #1759A6, transparent)' } : (themeType === 'group' ? { background: 'linear-gradient(90deg, transparent, #9D4A93, transparent)' } : (themeType === 'family' ? { background: 'linear-gradient(90deg, transparent, #2F7F7B, transparent)' } : (themeType === 'pilgrim' ? { background: 'linear-gradient(90deg, transparent, #E98216, transparent)' } : (themeType === 'budget' ? { background: 'linear-gradient(90deg, transparent, #2E7D32, transparent)' } : (themeType === 'trending' ? { background: 'linear-gradient(90deg, transparent, #D32F2F, transparent)' } : {})))))}></div>
              <div className="flourish-dot-inner" style={themeType === 'nri' ? { background: '#1759A6' } : (themeType === 'group' ? { background: '#9D4A93' } : (themeType === 'family' ? { background: '#2F7F7B' } : (themeType === 'pilgrim' ? { background: '#E98216' } : (themeType === 'budget' ? { background: '#2E7D32' } : (themeType === 'trending' ? { background: '#D32F2F' } : {})))))}></div>
            </div>
            {themeType === 'nri' ? (
              <svg className="flourish-heart" style={{ filter: 'drop-shadow(0 1px 3px rgba(23, 89, 166, 0.25))' }} width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1759A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            ) : themeType === 'group' ? (
              <svg className="flourish-heart" style={{ filter: 'drop-shadow(0 1px 3px rgba(157, 74, 147, 0.25))' }} width="30" height="30" viewBox="0 0 24 24" fill="#9D4A93" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            ) : themeType === 'family' ? (
              <svg className="flourish-heart" style={{ filter: 'drop-shadow(0 1px 3px rgba(47, 127, 123, 0.25))' }} width="30" height="30" viewBox="0 0 24 24" fill="#2F7F7B" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            ) : themeType === 'pilgrim' ? (
              <svg className="flourish-heart" style={{ filter: 'drop-shadow(0 1px 3px rgba(233, 130, 22, 0.25))' }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E98216" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22c-4-4-4-10-4-10S8 5 12 2c4 3 4 10 4 10s0 6-4 10z"/>
                <path d="M12 22c-6-4-8-10-8-10s-1-4 3-7"/>
                <path d="M12 22c6-4 8-10 8-10s1-4-3-7"/>
              </svg>
            ) : themeType === 'budget' ? (
              <svg className="flourish-heart" style={{ filter: 'drop-shadow(0 1px 3px rgba(46, 125, 50, 0.25))' }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            ) : themeType === 'trending' ? (
              <svg className="flourish-heart" style={{ filter: 'drop-shadow(0 1px 3px rgba(211, 47, 47, 0.25))' }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            ) : (
              <svg className="flourish-heart" style={{ filter: 'drop-shadow(0 1px 3px rgba(217, 70, 111, 0.25))' }} width="26" height="26" viewBox="0 0 24 24" fill="#D9466F" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}
            <div className="flourish-ornament-group">
              <div className="flourish-dot-inner" style={themeType === 'nri' ? { background: '#1759A6' } : (themeType === 'group' ? { background: '#9D4A93' } : (themeType === 'family' ? { background: '#2F7F7B' } : (themeType === 'pilgrim' ? { background: '#E98216' } : (themeType === 'budget' ? { background: '#2E7D32' } : (themeType === 'trending' ? { background: '#D32F2F' } : {})))))}></div>
              <div className="flourish-line" style={themeType === 'nri' ? { background: 'linear-gradient(90deg, transparent, #1759A6, transparent)' } : (themeType === 'group' ? { background: 'linear-gradient(90deg, transparent, #9D4A93, transparent)' } : (themeType === 'family' ? { background: 'linear-gradient(90deg, transparent, #2F7F7B, transparent)' } : (themeType === 'pilgrim' ? { background: 'linear-gradient(90deg, transparent, #E98216, transparent)' } : (themeType === 'budget' ? { background: 'linear-gradient(90deg, transparent, #2E7D32, transparent)' } : (themeType === 'trending' ? { background: 'linear-gradient(90deg, transparent, #D32F2F, transparent)' } : {})))))}></div>
              <div className="flourish-dot-outer" style={themeType === 'nri' ? { background: '#1759A6', borderColor: '#1759A6' } : (themeType === 'group' ? { background: '#9D4A93', borderColor: '#9D4A93' } : (themeType === 'family' ? { background: '#2F7F7B', borderColor: '#2F7F7B' } : (themeType === 'pilgrim' ? { background: '#E98216', borderColor: '#E98216' } : (themeType === 'budget' ? { background: '#2E7D32', borderColor: '#2E7D32' } : (themeType === 'trending' ? { background: '#D32F2F', borderColor: '#D32F2F' } : {})))))}></div>
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
              { id: 'overview', label: themeType === 'trending' ? 'Trending Package' : 'Overview' },
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
              <h2 className="section-heading serif" style={themeType === 'nri' ? { color: '#173A63' } : (themeType === 'group' ? { color: '#9D4A93' } : (themeType === 'family' ? { color: '#245C59' } : (themeType === 'pilgrim' ? { color: '#C9650A' } : (themeType === 'budget' ? { color: '#2E7D32' } : (themeType === 'trending' ? { color: '#8B1E1E' } : {})))))}>
                {themeType === 'nri' ? 'Your journey home, made seamless & special' : (themeType === 'group' ? 'Memories are meant to be shared' : (themeType === 'family' ? 'Together, every journey becomes a memory' : (themeType === 'pilgrim' ? 'Spiritual journeys, divine blessings' : (themeType === 'budget' ? 'Great experiences, great value' : (themeType === 'trending' ? 'Explore the Most Popular Trending Packages' : 'Romance, culture & unforgettable escapes')))))}
              </h2>
              <div className={`section-text ${!isExpanded ? 'section-text-preview' : ''}`}>
                {themeType === 'nri' ? (
                  <>
                    <p>
                      {pkg?.description || 'Our NRI packages are thoughtfully designed to make your visit to India comfortable, stress-free, and truly memorable. Whether you\'re coming home to meet family, celebrate a special occasion, or simply reconnect with your roots, we take care of every detail so you can focus on what truly matters.'}
                    </p>
                    {!pkg?.description && (
                      <div className="extended-description">
                        <p style={{ marginTop: '16px' }}>From smooth travel arrangements and premium stays to local experiences and personalized services, we ensure a perfect blend of convenience, comfort, and authentic Indian hospitality.</p>
                        <p style={{ marginTop: '16px' }}>Rediscover your roots. Reconnect with your loved ones.</p>
                        <p style={{ marginTop: '16px' }}>Create memories that stay with you forever.</p>
                      </div>
                    )}
                  </>
                ) : themeType === 'group' ? (
                  <>
                    <p>
                      {pkg?.description || 'Whether it\'s a getaway with friends, a corporate offsite, a college trip, or a reunion with loved ones, our group packages are designed to bring people together for unforgettable experiences.'}
                    </p>
                    {!pkg?.description && (
                      <div className="extended-description">
                        <p style={{ marginTop: '16px' }}>From exciting adventures to relaxing escapes, we handle every detail—comfortable stays, seamless transport, fun activities, and delicious food—so your group can focus on making memories that last a lifetime.</p>
                        <p style={{ marginTop: '16px' }}>Travel becomes more fun, more affordable, and more meaningful when shared. Because the best stories are written together.</p>
                      </div>
                    )}
                  </>
                ) : themeType === 'family' ? (
                  <>
                    <p>
                      {pkg?.description || 'Family vacations are about so much more than visiting a new destination. They are about stepping away from everyday routines, spending uninterrupted time with the people who matter most, and creating moments that stay with you long after the journey ends. A family trip gives you the chance to laugh together, explore together, try something new together, and create stories that your family will remember for years to come.'}
                    </p>
                    {!pkg?.description && (
                      <div className="extended-description">
                        <p style={{ marginTop: '16px' }}>Whether it is watching the sunrise over the mountains, building sandcastles by the sea, enjoying a scenic road trip, exploring a historic city, or sharing a delicious local meal, the simplest moments often become the most treasured memories. That is what makes travelling with family so special. Every destination becomes more meaningful when experienced together.</p>

                        <p style={{ marginTop: '16px' }}>Our thoughtfully designed family holiday packages are created to bring together fun, comfort, adventure, and relaxation, making every journey enjoyable for both children and adults. We understand that travelling with family comes with different needs and preferences. Parents look for comfort, convenience, safety, and well-planned experiences, while children want excitement, exploration, and plenty of opportunities to have fun. Our family packages are designed to bring these elements together so everyone can enjoy the holiday.</p>

                        <p style={{ marginTop: '16px' }}>From breathtaking mountain escapes to peaceful beach destinations, exciting wildlife experiences to fascinating cultural journeys, there is something for every kind of family. Discover beautiful hill stations where you can enjoy cool weather and stunning landscapes, or head towards sunny beaches where the entire family can relax, play, and enjoy quality time together. Explore destinations filled with history and culture, where children can discover new places and learn about different traditions while having an unforgettable experience.</p>

                        <p style={{ marginTop: '16px' }}>For families who love adventure, our trips can bring exciting activities and outdoor experiences into the journey. From scenic nature walks and sightseeing tours to thrilling activities and family-friendly excursions, every experience can become another story to share when you return home. And for those who simply want to slow down and reconnect, relaxing stays, beautiful surroundings, and leisurely days provide the perfect opportunity to enjoy each other's company without the rush of everyday life.</p>

                        <p style={{ marginTop: '16px' }}>We believe that a great family holiday should also be comfortable and stress-free. Planning a trip for the whole family can involve choosing destinations, accommodations, transportation, activities, and sightseeing options that work for everyone. Our family packages are thoughtfully planned to make the experience easier, giving you more time to focus on your family rather than worrying about every small travel detail.</p>

                        <p style={{ marginTop: '16px' }}>Most importantly, family travel is about creating moments that cannot be recreated anywhere else. It is the excitement on a child's face when they see the mountains for the first time. It is the laughter shared during a long road trip. It is taking a family photograph at a beautiful viewpoint, enjoying an evening together by the beach, or simply sitting around a table and talking about the day's adventures.</p>

                        <p style={{ marginTop: '16px' }}>These are the moments that become part of your family's story.</p>

                        <p style={{ marginTop: '16px' }}>Every journey gives you an opportunity to discover something new—not just about the destination, but about each other. Travelling together brings families closer, creates shared experiences, and gives everyone memories they can look back on with a smile.</p>

                        <p style={{ marginTop: '16px' }}>So, pack your bags, bring your loved ones, and get ready to discover places that inspire, excite, and bring you closer together. Whether you are planning a short weekend escape, a relaxing holiday, an adventurous getaway, or a long-awaited family vacation, let every destination become a new chapter in your family's travel story.</p>

                        <p style={{ marginTop: '16px' }}>Because years from now, you may not remember every hotel, every route, or every sightseeing stop—but you will remember the laughter, the conversations, the adventures, the photographs, and the time you spent together.</p>

                        <p style={{ marginTop: '16px', fontWeight: 600 }}>Travel together. Explore together. Laugh together. Create memories together.</p>

                        <p style={{ marginTop: '16px', fontStyle: 'italic' }}>Because when you are with the people you love, every journey becomes a memory worth keeping.</p>
                      </div>
                    )}
                  </>
                ) : themeType === 'pilgrim' ? (
                  <>
                    <p>
                      {pkg?.description || 'Our pilgrim packages are designed to help you seek blessings, find peace, and experience the divine in the most comfortable way possible.'}
                    </p>
                    {!pkg?.description && (
                      <div className="extended-description">
                        <p style={{ marginTop: '16px' }}>
                          From sacred temples and holy shrines to serene ashrams and spiritual towns, we take care of every detail—sacred darshan, comfortable stays, hygienic food, and smooth transfers—so you can focus on your spiritual journey.
                        </p>
                        <p style={{ marginTop: '16px' }}>
                          Walk the path of devotion. Feel the divine energy. Return with peace, positivity, and blessings.
                        </p>
                      </div>
                    )}
                  </>
                ) : themeType === 'budget' ? (
                  <>
                    <p>
                      {pkg?.description || 'Travel more, spend less! Our budget packages are perfect for travellers who want to explore amazing destinations without stretching their budget.'}
                    </p>
                    {!pkg?.description && (
                      <div className="extended-description">
                        <p style={{ marginTop: '16px' }}>We take care of all the essentials—comfortable stays, reliable transport, sightseeing, and local experiences—so you get the best value for your money without compromising on quality.</p>
                        <p style={{ marginTop: '16px' }}>Smart choices. Happy journeys. Memories that last a lifetime.</p>
                      </div>
                    )}
                  </>
                ) : themeType === 'trending' ? (
                  <>
                    <p>
                      {pkg?.description || 'Discover handpicked trending travel packages designed for unforgettable journeys. From scenic getaways and beautiful beaches to vibrant cities and cultural experiences, explore destinations that travelers love.'}
                    </p>
                    {!pkg?.description && (
                      <div className="extended-description">
                        <p style={{ marginTop: '16px' }}>Whether you are planning a relaxing escape, an adventurous holiday, or a memorable trip with friends and family, our trending packages bring together exciting destinations, comfortable stays, convenient transportation, and memorable sightseeing experiences.</p>
                        <p style={{ marginTop: '16px' }}>Explore new places, experience different cultures, and create memories that last a lifetime.</p>
                        <p style={{ marginTop: '16px', fontWeight: 600 }}>Explore more. Experience more. Travel the trend.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
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
                  </>
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
                    {themeType === 'budget' ? (
                      <>
                        <div className="highlight-card"><span className="icon" style={{ filter: 'grayscale(1)', color: '#2E7D32' }}>🏷️</span><h4 style={{ fontSize: '15px' }}>Best Value for Money</h4></div>
                        <div className="highlight-card"><span className="icon" style={{ filter: 'grayscale(1)', color: '#2E7D32' }}>🛏️</span><h4 style={{ fontSize: '15px' }}>Comfortable Budget Stays</h4></div>
                        <div className="highlight-card"><span className="icon" style={{ filter: 'grayscale(1)', color: '#2E7D32' }}>🚌</span><h4 style={{ fontSize: '15px' }}>Economical Transport Options</h4></div>
                        <div className="highlight-card"><span className="icon" style={{ filter: 'grayscale(1)', color: '#2E7D32' }}>📸</span><h4 style={{ fontSize: '15px' }}>Exciting Sightseeing Included</h4></div>
                        <div className="highlight-card"><span className="icon" style={{ filter: 'grayscale(1)', color: '#2E7D32' }}>🎧</span><h4 style={{ fontSize: '15px' }}>24/7 Assistance During Your Trip</h4></div>
                      </>
                    ) : themeType === 'trending' ? (
                      <>
                        <div className="highlight-card"><span className="icon" style={{ filter: 'grayscale(1)', color: '#D32F2F' }}>📍</span><h4 style={{ fontSize: '15px' }}>Popular Trending Destinations</h4></div>
                        <div className="highlight-card"><span className="icon" style={{ filter: 'grayscale(1)', color: '#D32F2F' }}>🏨</span><h4 style={{ fontSize: '15px' }}>Handpicked Comfortable Stays</h4></div>
                        <div className="highlight-card"><span className="icon" style={{ filter: 'grayscale(1)', color: '#D32F2F' }}>🚌</span><h4 style={{ fontSize: '15px' }}>Convenient Transport Options</h4></div>
                        <div className="highlight-card"><span className="icon" style={{ filter: 'grayscale(1)', color: '#D32F2F' }}>📸</span><h4 style={{ fontSize: '15px' }}>Must-See Sightseeing Experiences</h4></div>
                        <div className="highlight-card"><span className="icon" style={{ filter: 'grayscale(1)', color: '#D32F2F' }}>🎧</span><h4 style={{ fontSize: '15px' }}>24/7 Assistance During Your Trip</h4></div>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
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

      {themeType === 'nri' && (
        <div className="nri-benefits-strip-container">
          <div className="nri-benefits-strip">
            <div className="nri-benefit">
              <span className="nri-benefit-icon">👨‍👩‍👧</span>
              <span className="nri-benefit-text">Specially Curated<br/>for NRIs</span>
            </div>
            <div className="nri-benefit">
              <span className="nri-benefit-icon">🏷️</span>
              <span className="nri-benefit-text">Best Deals on Flights,<br/>Hotels & Transfers</span>
            </div>
            <div className="nri-benefit">
              <span className="nri-benefit-icon">🎧</span>
              <span className="nri-benefit-text">24/7 Assistance<br/>During Your Stay</span>
            </div>
            <div className="nri-benefit">
              <span className="nri-benefit-icon">🛂</span>
              <span className="nri-benefit-text">Hassle-free Travel<br/>& Visa Guidance</span>
            </div>
            <div className="nri-benefit">
              <span className="nri-benefit-icon">🎁</span>
              <span className="nri-benefit-text">Warm Welcome,<br/>Every Time</span>
            </div>
          </div>
        </div>
      )}

      {themeType === 'pilgrim' && (
        <div className="pilgrim-benefits-strip-container">
          <div className="pilgrim-benefits-strip">
            <div className="pilgrim-benefit">
              <span className="pilgrim-benefit-icon">🪷</span>
              <span className="pilgrim-benefit-text">Handpicked Sacred<br/>Destinations</span>
            </div>
            <div className="pilgrim-benefit">
              <span className="pilgrim-benefit-icon">🛕</span>
              <span className="pilgrim-benefit-text">Comfortable Stays<br/>Near Temples</span>
            </div>
            <div className="pilgrim-benefit">
              <span className="pilgrim-benefit-icon">🥗</span>
              <span className="pilgrim-benefit-text">Pure Veg Meals<br/>& Satvik Food</span>
            </div>
            <div className="pilgrim-benefit">
              <span className="pilgrim-benefit-icon">🚌</span>
              <span className="pilgrim-benefit-text">Hassle-free Travel<br/>& Darshan Arrangements</span>
            </div>
            <div className="pilgrim-benefit">
              <span className="pilgrim-benefit-icon">🛡️</span>
              <span className="pilgrim-benefit-text">24/7 Support<br/>Throughout Your Journey</span>
            </div>
          </div>
        </div>
      )}

      {themeType === 'budget' && (
        <div className="budget-benefits-strip-container">
          <div className="budget-benefits-strip">
            <div className="budget-benefit">
              <span className="budget-benefit-icon" style={{ filter: 'grayscale(1)', color: '#2E7D32' }}>🏷️</span>
              <span className="budget-benefit-text">Best Value<br/>for Money</span>
            </div>
            <div className="budget-benefit">
              <span className="budget-benefit-icon" style={{ filter: 'grayscale(1)', color: '#2E7D32' }}>🛏️</span>
              <span className="budget-benefit-text">Comfortable<br/>Budget Stays</span>
            </div>
            <div className="budget-benefit">
              <span className="budget-benefit-icon" style={{ filter: 'grayscale(1)', color: '#2E7D32' }}>🚌</span>
              <span className="budget-benefit-text">Economical Transport<br/>Options</span>
            </div>
            <div className="budget-benefit">
              <span className="budget-benefit-icon" style={{ filter: 'grayscale(1)', color: '#2E7D32' }}>📸</span>
              <span className="budget-benefit-text">Exciting Sightseeing<br/>Included</span>
            </div>
            <div className="budget-benefit">
              <span className="budget-benefit-icon" style={{ filter: 'grayscale(1)', color: '#2E7D32' }}>🎧</span>
              <span className="budget-benefit-text">24/7 Assistance<br/>During Your Trip</span>
            </div>
          </div>
        </div>
      )}

      {themeType === 'trending' && (
        <div className="trending-benefits-strip-container">
          <div className="trending-benefits-strip">
            <div className="trending-benefit">
              <span className="trending-benefit-icon" style={{ filter: 'grayscale(1)', color: '#D32F2F' }}>📍</span>
              <span className="trending-benefit-text">Popular Trending<br/>Destinations</span>
            </div>
            <div className="trending-benefit">
              <span className="trending-benefit-icon" style={{ filter: 'grayscale(1)', color: '#D32F2F' }}>🏨</span>
              <span className="trending-benefit-text">Handpicked<br/>Comfortable Stays</span>
            </div>
            <div className="trending-benefit">
              <span className="trending-benefit-icon" style={{ filter: 'grayscale(1)', color: '#D32F2F' }}>🚌</span>
              <span className="trending-benefit-text">Convenient Transport<br/>Options</span>
            </div>
            <div className="trending-benefit">
              <span className="trending-benefit-icon" style={{ filter: 'grayscale(1)', color: '#D32F2F' }}>📸</span>
              <span className="trending-benefit-text">Must-See Sightseeing<br/>Experiences</span>
            </div>
            <div className="trending-benefit">
              <span className="trending-benefit-icon" style={{ filter: 'grayscale(1)', color: '#D32F2F' }}>🎧</span>
              <span className="trending-benefit-text">24/7 Assistance<br/>During Your Trip</span>
            </div>
          </div>
        </div>
      )}

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
          
          background: var(--theme-bg);
          color: var(--theme-text-main);
          font-family: var(--font-sans, system-ui, sans-serif);
          min-height: 100vh;
        }

        .nri-benefits-strip-container {
          background-color: #F4F7FA;
          padding: 30px 20px;
          margin-top: 40px;
          border-radius: 16px;
          max-width: 1300px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .nri-benefits-strip {
          display: flex;
          justify-content: space-around;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .nri-benefit {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nri-benefit-icon {
          font-size: 24px;
          background: #E8EEF4;
          padding: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
        }

        .nri-benefit-text {
          font-size: 14px;
          font-weight: 500;
          color: #596575;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .nri-benefits-strip {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        /* PILGRIM BENEFITS STRIP */
        .pilgrim-benefits-strip-container {
          background-color: #FFF5E5;
          padding: 30px 20px;
          margin-top: 40px;
          border-radius: 16px;
          max-width: 1300px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .pilgrim-benefits-strip {
          display: flex;
          justify-content: space-around;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .pilgrim-benefit {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pilgrim-benefit-icon {
          font-size: 24px;
          background: #F3D49A;
          color: #C9650A;
          padding: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
        }

        .pilgrim-benefit-text {
          font-size: 14px;
          font-weight: 500;
          color: #4A2A16;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .pilgrim-benefits-strip {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        /* BUDGET BENEFITS STRIP */
        .budget-benefits-strip-container {
          background-color: #F1F8EF;
          padding: 30px 20px;
          margin-top: 40px;
          border-radius: 16px;
          max-width: 1300px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .budget-benefits-strip {
          display: flex;
          justify-content: space-around;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .budget-benefit {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .budget-benefit-icon {
          font-size: 24px;
          background: #C8E6C9;
          color: #2E7D32;
          padding: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
        }

        .budget-benefit-text {
          font-size: 14px;
          font-weight: 500;
          color: #1F3B28;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .budget-benefits-strip {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        /* TRENDING BENEFITS STRIP */
        .trending-benefits-strip-container {
          background-color: #FFF2F2;
          padding: 30px 20px;
          margin-top: 40px;
          border-radius: 16px;
          max-width: 1300px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .trending-benefits-strip {
          display: flex;
          justify-content: space-around;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .trending-benefit {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .trending-benefit-icon {
          font-size: 24px;
          background: #FFCEC0;
          color: #D32F2F;
          padding: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
        }

        .trending-benefit-text {
          font-size: 14px;
          font-weight: 500;
          color: #8B1E1E;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .trending-benefits-strip {
            flex-direction: column;
            align-items: flex-start;
          }
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
          color: var(--theme-primary);
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
          background: linear-gradient(90deg, transparent, var(--theme-primary), transparent);
          opacity: 0.6;
        }
        .flourish-dot-outer {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: 1.5px solid var(--theme-primary);
          opacity: 0.55;
          flex-shrink: 0;
        }
        .flourish-dot-inner {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--theme-primary);
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
          background: var(--theme-light);
          color: var(--theme-primary);
        }
        /* Active tab: solid filled pill */
        .nav-link.active {
          background: var(--theme-primary);
          color: #ffffff;
          font-weight: 600;
        }
        .nav-link.active:hover {
          background: var(--theme-dark);
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
          background: linear-gradient(to bottom, transparent, var(--theme-bg));
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
          color: var(--theme-dark);
          margin-bottom: 16px;
          line-height: 1.2;
        }
        .sub-heading {
          font-size: 28px;
          color: var(--theme-text-main);
          margin-bottom: 24px;
        }
        .section-text {
          font-size: 16px;
          color: var(--theme-text-sec);
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
          border: 1px solid var(--theme-soft);
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
          color: var(--theme-text-main);
        }
        .highlight-card p {
          font-size: 13px;
          color: var(--theme-text-sec);
          line-height: 1.4;
        }

        /* TIMELINE */
        .timeline-section {
          display: flex;
          flex-direction: column;
          gap: 32px;
          padding-left: 12px;
          border-left: 2px dashed var(--theme-soft);
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
          background: var(--theme-bg);
          border: 2px solid var(--theme-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .timeline-dot::after {
          content: "";
          width: 10px;
          height: 10px;
          background: var(--theme-primary);
          border-radius: 50%;
        }
        .timeline-content h4 {
          font-size: 18px;
          color: var(--theme-text-main);
          margin-bottom: 8px;
        }
        .timeline-content p {
          font-size: 15px;
          color: var(--theme-text-sec);
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
          color: var(--theme-text-sec);
          display: flex;
          gap: 8px;
        }

        /* READ MORE BUTTON */
        .read-more-btn {
          display: inline-flex;
          align-items: center;
          background: transparent;
          border: 1px solid var(--theme-primary);
          color: var(--theme-primary);
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
          background: var(--theme-primary);
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
          border-top: 1px solid var(--theme-soft);
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
