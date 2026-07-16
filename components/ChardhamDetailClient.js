'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BookingSidebar from './BookingSidebar';
import StarRating from './StarRating';

export default function ChardhamDetailClient({ tour }) {
  const [activeDay, setActiveDay] = useState(1);
  const [openFaqs, setOpenFaqs] = useState([]);
  
  const toggleFaq = (idx) => {
    setOpenFaqs(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  return (
    <div style={{ background: '#f8fafc', paddingBottom: 80 }}>
      {/* FULL WIDTH BANNER */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: 500, 
        backgroundColor: '#0f172a',
        backgroundImage: 'url("/images/kedarnath_banner.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)' }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '30px 15px 80px' }}>
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/packages" style={{ color: 'white', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Packages
            </Link>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => alert('Added to favorites!')} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </button>
              <button onClick={() => alert('Sharing options coming soon!')} style={{ height: 40, padding: '0 16px', borderRadius: 20, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: 'none', display: 'flex', alignItems: 'center', gap: 8, color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                Share
              </button>
            </div>
          </div>
          
          {/* Hero Content */}
          <div style={{ maxWidth: 800 }}>
            <span style={{ background: 'var(--color-secondary)', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'inline-block', marginBottom: 12 }}>
              Spiritual Journey
            </span>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: 'white', marginBottom: 16, lineHeight: 1.1 }}>
              Char Dham Yatra – Kedarnath & Badrinath
            </h1>
            <div style={{ display: 'flex', gap: 24, color: 'rgba(255,255,255,0.9)', fontSize: 15, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Uttarakhand, India
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                10 Days / 9 Nights
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StarRating rating={4.8} size={16} color="var(--color-secondary)" />
                <span style={{ fontWeight: 700, color: 'white' }}>4.8</span> (324 Reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 10, marginTop: -40 }}>
        
        {/* STATS STRIP (FULL WIDTH) */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px 32px', display: 'flex', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: 32, flexWrap: 'wrap', gap: 24 }}>
          {[
            { label: 'Duration', value: '10 Days / 9 Nights', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
            { label: 'Best Time', value: 'Apr – Jun, Sep – Oct', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg> },
            { label: 'Difficulty', value: 'Moderate', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> },
            { label: 'Pickup', value: 'Dehradun', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> },
            { label: 'Drop', value: 'Dehradun / Haridwar', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> },
            { label: 'Accommodation', value: 'Hotels / Camps', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
            { label: 'Meals', value: 'Breakfast & Dinner', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg> },
            { label: 'Group Size', value: '2 – 20 People', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> }
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: 100, flex: 1 }}>
              <div style={{ background: '#f1f5f9', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                {stat.icon}
              </div>
              <strong style={{ color: '#0f172a', fontSize: 13, marginBottom: 4 }}>{stat.label}</strong>
              <span style={{ color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>{stat.value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40 }}>
          
          {/* LEFT CONTENT */}
          <div style={{ flex: '1 1 60%', minWidth: 320, maxWidth: '100%' }}>
            {/* Media Row */}
            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <div style={{ background: '#0f172a', borderRadius: 16, overflow: 'hidden', height: 260, position: 'relative' }}>
                  <Image src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Kedarnath Video" fill style={{ objectFit: 'cover', opacity: 0.6 }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                  </div>
                  <div style={{ position: 'absolute', top: 16, left: 16, color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                    TOUR VIDEO
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div style={{ background: '#e2f5e9', borderRadius: 16, overflow: 'hidden', height: 260, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', top: 16, left: 16, color: 'var(--color-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, zIndex: 2 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                    TOUR ROUTE MAP
                  </div>
                  <div style={{ padding: 40, width: '100%', height: '100%', position: 'relative' }}>
                    {/* Placeholder map illustration matching image */}
                    <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="none">
                      <path d="M 20 160 C 80 160, 100 80, 140 80 S 180 120, 240 100" fill="none" stroke="var(--color-secondary)" strokeWidth="2" strokeDasharray="4 4" />
                      <circle cx="20" cy="160" r="4" fill="var(--color-secondary)" />
                      <text x="20" y="180" fontSize="12" fill="#0f172a" fontWeight="bold">Dehradun</text>
                      
                      <circle cx="100" cy="80" r="4" fill="var(--color-secondary)" />
                      <text x="100" y="70" fontSize="12" fill="#0f172a" fontWeight="bold" textAnchor="middle">Yamunotri</text>
                      
                      <circle cx="160" cy="50" r="4" fill="var(--color-secondary)" />
                      <text x="160" y="40" fontSize="12" fill="#0f172a" fontWeight="bold" textAnchor="middle">Gangotri</text>

                      <circle cx="200" cy="120" r="4" fill="var(--color-secondary)" />
                      <text x="200" y="140" fontSize="12" fill="#0f172a" fontWeight="bold" textAnchor="middle">Kedarnath</text>

                      <circle cx="260" cy="100" r="4" fill="var(--color-secondary)" />
                      <text x="260" y="90" fontSize="12" fill="#0f172a" fontWeight="bold" textAnchor="middle">Badrinath</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Day Wise Itinerary */}
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 24 }}>Day Wise Itinerary</h2>
            
            <div style={{ position: 'relative', paddingLeft: 24, borderLeft: '2px solid #e2e8f0', marginLeft: 16, marginBottom: 48 }}>
              {tour.itinerary.map((day, idx) => (
                <div key={idx} style={{ marginBottom: 24, position: 'relative' }}>
                  <div 
                    style={{ 
                      position: 'absolute', 
                      left: -50, 
                      top: 0, 
                      width: 48, 
                      height: 48, 
                      borderRadius: '50%', 
                      background: activeDay === day.day ? 'var(--color-primary)' : '#fff',
                      border: '2px solid var(--color-primary)',
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: activeDay === day.day ? '#fff' : 'var(--color-primary)',
                      lineHeight: 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}
                    onClick={() => setActiveDay(activeDay === day.day ? null : day.day)}
                  >
                    <span style={{ fontSize: 11, fontWeight: 600 }}>Day</span>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>{String(day.day).padStart(2, '0')}</span>
                  </div>
                  
                  <div 
                    style={{ 
                      background: activeDay === day.day ? '#f8fafc' : '#fff', 
                      border: '1px solid #f1f5f9', 
                      borderRadius: 12, 
                      padding: '20px 24px',
                      cursor: 'pointer',
                      boxShadow: activeDay === day.day ? '0 10px 30px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setActiveDay(activeDay === day.day ? null : day.day)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>{day.title}</h3>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: activeDay === day.day ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#94a3b8' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                    
                    {activeDay === day.day && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                          <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.7, flex: '1 1 300px', margin: 0 }}>
                            {day.description}
                          </p>
                          <div style={{ flex: '1 1 200px', background: '#f1f5f9', padding: 16, borderRadius: 12 }}>
                            <strong style={{ display: 'block', fontSize: 14, color: 'var(--color-primary)', marginBottom: 12 }}>Highlights:</strong>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                              {tour.highlights.slice(0, 4).map((hl, i) => (
                                <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#334155', marginBottom: 8, alignItems: 'center' }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                  {hl}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                          {day.meals?.includes('Breakfast') && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path></svg> Breakfast
                            </span>
                          )}
                          {day.meals?.includes('Dinner') && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ffedd5', color: '#c2410c', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path></svg> Dinner
                            </span>
                          )}
                          {!day.meals?.length && (
                             <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fee2e2', color: '#b91c1c', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg> No Meals
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Attractions */}
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 24 }}>Attractions</h2>
            <div className="row g-4 mb-5">
              {[
                { img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", title: "Kedarnath Temple" },
                { img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", title: "Badrinath Temple" },
                { img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", title: "Gangotri" },
                { img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", title: "Yamunotri" },
                { img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", title: "Mana Village" },
                { img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", title: "Rudraprayag" }
              ].map((item, i) => (
                <div key={i} className="col-6 col-md-4">
                  <div style={{ borderRadius: 12, overflow: 'hidden', height: 120, position: 'relative', marginBottom: 8 }}>
                    <Image src={item.img} alt={item.title} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <strong style={{ fontSize: 13, color: 'var(--color-primary)' }}>{item.title}</strong>
                </div>
              ))}
            </div>

            {/* Gallery */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>Gallery</h2>
              <Link href="#" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>View All →</Link>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16, marginBottom: 48, scrollbarWidth: 'none' }}>
              {[1,2,3,4,5].map((_, i) => (
                <div key={i} style={{ width: 160, height: 120, borderRadius: 12, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  <Image src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Gallery" fill style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>

            {/* Inclusions & Exclusions */}
            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #f1f5f9', height: '100%' }}>
                  <h3 style={{ color: '#16a34a', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Inclusions</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {tour.included.map((inc, i) => (
                      <li key={i} style={{ display: 'flex', gap: 12, fontSize: 14, color: '#334155', marginBottom: 12 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#16a34a" stroke="white" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"></circle><polyline points="8 12 11 15 16 9"></polyline></svg>
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="col-md-6">
                <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #f1f5f9', height: '100%' }}>
                  <h3 style={{ color: '#dc2626', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Exclusions</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {tour.excluded.map((exc, i) => (
                      <li key={i} style={{ display: 'flex', gap: 12, fontSize: 14, color: '#334155', marginBottom: 12 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#dc2626" stroke="white" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                        {exc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ flex: '1 1 30%', minWidth: 320, maxWidth: '100%' }}>

            <BookingSidebar tour={tour} />
            
            {/* Policies Accordion */}
            <div style={{ marginTop: 24, background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: 12 }}>
              {[
                { id: 'payment', title: 'Payment Policy', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg> },
                { id: 'cancellation', title: 'Cancellation Policy', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> },
                { id: 'faq', title: 'Frequently Asked Questions', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> }
              ].map((policy, idx) => (
                <div key={policy.id} style={{ borderBottom: idx < 2 ? '1px solid #f1f5f9' : 'none' }}>
                  <button 
                    onClick={() => toggleFaq(idx)}
                    style={{ width: '100%', padding: '16px 12px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 700, color: 'var(--color-primary)', cursor: 'pointer', textAlign: 'left' }}
                  >
                    {policy.icon}
                    <span style={{ flex: 1 }}>{policy.title}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openFaqs.includes(idx) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>
                  {openFaqs.includes(idx) && (
                    <div style={{ padding: '0 12px 16px 44px', color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                      Contact our team for detailed {policy.title.toLowerCase()}.
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Related Tours */}
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>Related Tours</h3>
                <Link href="/packages" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>View All →</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { title: 'Do Dham Yatra', duration: '6 Days / 5 Nights', price: 16999 },
                  { title: 'Kedarnath Yatra', duration: '5 Days / 4 Nights', price: 14999 }
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, background: '#fff', borderRadius: 12, padding: 12, border: '1px solid #f1f5f9' }}>
                    <div style={{ width: 100, height: 75, borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                      <Image src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt={t.title} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: 'var(--color-primary)' }}>{t.title}</h4>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{t.duration}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>₹{t.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM STICKY BAR */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--color-primary)', padding: '16px 0', zIndex: 99, boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
        <div className="container d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div style={{ color: 'white' }}>
            <strong style={{ display: 'block', fontSize: 18, marginBottom: 2 }}>Begin Your Spiritual Journey Today</strong>
            <span style={{ opacity: 0.8, fontSize: 14 }}>Experience the divine Char Dham Yatra with our trusted travel partner</span>
          </div>
          <button style={{ background: 'var(--color-secondary)', color: 'white', border: 'none', padding: '12px 32px', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            Book Your Package <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
