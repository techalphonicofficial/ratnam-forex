'use client';

import { useState, useEffect, useRef } from 'react';

// 6 Dynamic Slides
const carouselSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&q=80&w=1200',
    badge: 'HOT DEAL • VIP TOUR',
    title: 'Incredible india',
    desc: 'Dynamic cities, rich heritage, premium stays, and stylish contemporary escapes.'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1200',
    badge: 'HOT DEAL • HONEYMOON',
    title: 'International',
    desc: 'Romantic overwater villas, crystal clear waters, and private beach dinners.'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1200',
    badge: 'HOT DEAL • VIP TOUR',
    title: 'Dubai Luxury',
    desc: 'Experience world-class luxury, stunning skylines, and exclusive desert safaris.'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200',
    badge: 'HOT DEAL • COUPLES',
    title: 'India Unlimited',
    desc: 'Tropical paradise with lush terraces, sacred temples, and serene beaches.'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1498307833015-e7b400441eb8?auto=format&fit=crop&q=80&w=1200',
    badge: 'HOT DEAL • GROUP PKG',
    title: 'Trans India',
    desc: 'Explore multiple cultures, iconic landmarks, and historic cities together.'
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&q=80&w=1200',
    badge: 'HOT DEAL • FAMILY',
    title: 'Amazing Thailand',
    desc: 'Vibrant street life, ornate shrines, and stunning tropical beaches at best prices.'
  }
];

const countries = [
  { code: '+91', iso: 'IN', name: 'India' },
  { code: '+1', iso: 'US', name: 'USA/Canada' },
  { code: '+44', iso: 'UK', name: 'United Kingdom' },
  { code: '+61', iso: 'AU', name: 'Australia' },
  { code: '+971', iso: 'AE', name: 'UAE' },
  { code: '+65', iso: 'SG', name: 'Singapore' },
  { code: '+60', iso: 'MY', name: 'Malaysia' },
  { code: '+64', iso: 'NZ', name: 'New Zealand' },
  { code: '+49', iso: 'DE', name: 'Germany' },
  { code: '+33', iso: 'FR', name: 'France' },
  { code: '+39', iso: 'IT', name: 'Italy' },
  { code: '+34', iso: 'ES', name: 'Spain' },
  { code: '+41', iso: 'CH', name: 'Switzerland' },
  { code: '+66', iso: 'TH', name: 'Thailand' },
  { code: '+62', iso: 'ID', name: 'Indonesia' },
  { code: '+27', iso: 'ZA', name: 'South Africa' },
];

const getLogoUrl = (logo) => {
  if (!logo) return '';
  if (/^(https?:|data:|blob:)/i.test(logo)) return logo;
  if (!String(logo).startsWith('/uploads')) return logo;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_IMAGE_URL || 'https://ratnamforex.yber.in';
  return `${baseUrl.replace(/\/$/, '')}/${String(logo).replace(/^\//, '')}`;
};

export default function GlobalInquiryModal({ brand, companyInfo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const dropdownRef = useRef(null);

  const brandLogo = getLogoUrl(companyInfo?.company_logo_url) || brand?.logo || '/logooo.png';
  const brandName = 'Travel Holiday';

  useEffect(() => {
    let isClosed = false;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        isClosed = sessionStorage.getItem('inquiryModalClosed');
      }
    } catch (e) {}

    if (!isClosed) {
      const timer = setTimeout(() => setIsOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 3500);
    return () => clearInterval(slideInterval);
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('inquiryModalClosed', 'true');
      }
    } catch (e) {}
  };

  if (!isOpen) return null;

  const activeSlide = carouselSlides[currentSlide];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease'
        }}
      />

      {/* Main Modal Container */}
      <div className="modal-container">
        
        {/* Left Panel (Visual Content) */}
        <div className="left-panel d-none d-md-flex">
          {carouselSlides.map((slide, index) => (
            <div
              key={slide.id}
              style={{
                position: 'absolute', inset: 0,
                background: `url('${slide.image}') center/cover no-repeat`,
                opacity: currentSlide === index ? 1 : 0,
                transform: currentSlide === index ? 'scale(1)' : 'scale(1.05)',
                transition: 'opacity 0.8s ease-in-out, transform 4s linear',
                zIndex: 0
              }}
            />
          ))}

          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.9) 100%)', zIndex: 1 }} />

          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <img src={brandLogo} alt={`${brandName} Logo`} style={{ maxWidth: '180px', height: 'auto', objectFit: 'contain' }} />
          </div>

          <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto', textAlign: 'left' }}>
            <h4 style={{ color: 'var(--color-secondary)', fontWeight: 700, fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
              {activeSlide.badge}
            </h4>
            <h2 style={{ color: 'var(--color-card)', fontWeight: 800, fontSize: '2.5rem', lineHeight: 1.1, marginBottom: '10px', textShadow: '0 4px 8px rgba(0,0,0,0.4)' }}>
              {activeSlide.title}
            </h2>
            <p style={{ color: 'var(--color-bg-soft)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px', minHeight: '48px', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              {activeSlide.desc}
            </p>
            
            <div className="d-flex gap-2">
              {carouselSlides.map((_, index) => (
                <div 
                  key={index} 
                  onClick={() => setCurrentSlide(index)}
                  style={{ 
                    width: currentSlide === index ? '24px' : '8px', 
                    height: '8px', 
                    borderRadius: '10px', 
                    background: currentSlide === index ? 'var(--color-card)' : 'rgba(255,255,255,0.3)',
                    transition: 'all 0.4s ease',
                    cursor: 'pointer'
                  }} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel (Form Content) */}
        <div className="right-panel">
          
          <button onClick={handleClose} className="close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div style={{ maxWidth: '100%', margin: 'auto 0' }}>
            <div className="mb-4">
              <h2 style={{ fontFamily: '"Italiana", sans-serif', fontWeight: 'bold', fontSize: '26px', color: 'var(--color-text-primary)', marginBottom: '8px', lineHeight: '1.2' }}>
                Plan your next journey with <br/>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{brandName}</span>
              </h2>
              <p style={{ fontFamily: '"Gilda Display", serif', fontWeight: 400, color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '10px' }}>
                Share your details and preferred destination. Our experts will curate the perfect package for you.
              </p>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleClose(); }} className="d-flex flex-column gap-3">
              
              <div>
                <input type="text" className="form-control px-4" placeholder="Full Name" style={formInputStyle} required />
              </div>

              <div className="d-flex gap-2 position-relative align-items-center">
                
                {/* Fixed Custom Dropdown Trigger */}
                <div ref={dropdownRef} style={{ width: '110px', minWidth: '110px', flexShrink: 0, position: 'relative' }}>
                  <div 
                    className="form-control px-2 d-flex align-items-center justify-content-between"
                    style={{ ...formInputStyle, cursor: 'pointer', userSelect: 'none', background: isDropdownOpen ? 'var(--color-bg-soft)' : 'var(--color-card)' }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="d-flex align-items-center gap-1" style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{selectedCountry.iso}</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-muted)' }}>{selectedCountry.code}</span>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>

                  {isDropdownOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 4px)', left: 0, width: '220px',
                      maxHeight: '220px', overflowY: 'auto', background: 'var(--color-card)',
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)',
                      boxShadow: 'var(--shadow-md)', zIndex: 50,
                      animation: 'dropdownFade 0.2s ease'
                    }}>
                      {countries.map((c, i) => (
                        <div 
                          key={i}
                          className="country-option"
                          onClick={() => { setSelectedCountry(c); setIsDropdownOpen(false); }}
                          style={{
                            padding: 'var(--space-2) var(--space-4)', display: 'flex', alignItems: 'center', gap: '10px',
                            cursor: 'pointer', borderBottom: i !== countries.length - 1 ? '1px solid var(--color-bg-soft)' : 'none'
                          }}
                        >
                          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-muted)', width: '24px' }}>{c.iso}</span>
                          <span style={{ fontSize: '13px', flex: 1, color: 'var(--color-text-primary)' }}>{c.name}</span>
                          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '500' }}>{c.code}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <input type="tel" className="form-control px-4 flex-grow-1" placeholder="Mobile Number" style={formInputStyle} required />
              </div>

              <div>
                <input type="email" className="form-control px-4" placeholder="Email Address" style={formInputStyle} required />
              </div>

              {/* Fixed Checkbox Group */}
              <div className="d-flex justify-content-between align-items-center mt-2 mb-1" style={{ flexWrap: 'wrap', gap: '10px' }}>
                {['COUPLE', 'FAMILY', 'GROUP', 'NRI /FOREIGN'].map((type) => (
                  <div className="form-check form-check-inline m-0 custom-checkbox" key={type}>
                    <input className="form-check-input" type="checkbox" id={`chk-${type}`} value={type} style={{ cursor: 'pointer' }} />
                    <label className="form-check-label" htmlFor={`chk-${type}`} style={{ fontSize: '12px', color: 'var(--color-text-primary)', fontWeight: 600, cursor: 'pointer', paddingLeft: '4px' }}>
                      {type}
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <textarea className="form-control px-4 py-2" placeholder="Text / Requirement" style={{ ...formInputStyle, height: '80px', resize: 'none' }}></textarea>
              </div>

              <button type="submit" className="btn-primary mt-3 w-100" style={{ justifyContent: 'center' }}>
                Enquiry Now
              </button>
            </form>

            <div className="mt-4 text-center pt-3 border-top">
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: 0, fontWeight: 500 }}>
                15+ Yrs Experiences &nbsp;|&nbsp; 400+ Travel Experts &nbsp;|&nbsp; 1000+ Destinations
              </p>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes modalEntrance { 
            from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); } 
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); } 
          }
          @keyframes dropdownFade {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .modal-container { 
            font-family: 'Inter', system-ui, -apple-system, sans-serif; 
            position: fixed; 
            top: 50%; 
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90vw;
            max-width: 950px;
            height: 85vh;
            max-height: 650px;
            min-height: 500px;
            background: white; 
            border-radius: var(--radius-2xl);
            box-shadow: var(--shadow-xl);
            z-index: 10000;
            display: flex;
            flex-direction: row;
            overflow: hidden;
            animation: modalEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .left-panel {
            flex: 0 0 45%;
            position: relative;
            flex-direction: column;
            padding: var(--space-8) var(--space-7);
            overflow: hidden;
          }

          .right-panel {
            flex: 1;
            padding: var(--space-8) var(--space-8);
            position: relative;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            background: var(--color-card);
          }

          .form-control::placeholder { color: var(--color-text-muted); }
          .form-control:focus {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary) 10%, transparent);
          }
          .country-option:hover { background-color: var(--color-bg-soft); }

          .close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background: var(--color-bg-soft);
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-text-muted);
            z-index: 10;
            transition: all 0.3s ease;
          }
          .close-btn:hover {
            background: var(--color-border);
            color: var(--color-text-primary);
            transform: rotate(90deg);
          }

          .custom-checkbox .form-check-input:checked {
            background-color: var(--color-primary);
            border-color: var(--color-primary);
          }

          @media (max-width: 992px) {
            .modal-container { width: 95vw; height: 90vh; max-height: none; }
            .right-panel { padding: var(--space-8) var(--space-7); }
          }

          /* Mobile CSS Updated */
          @media (max-width: 768px) {
            .modal-container { 
              flex-direction: column; 
              width: 95vw; 
              height: auto; /* Hugs form content, removes dead space */
              min-height: auto;
              max-height: 95vh; 
            }
            .left-panel { 
              display: none !important; /* Strictly respects bootstrap classes */
            }
            .right-panel { 
              flex: 1; 
              padding: var(--space-8) var(--space-6) var(--space-7) var(--space-6); 
            }
            .close-btn { top: 12px; right: 12px; background: var(--color-bg-soft); }
          }
        `}</style>
      </div>
    </>
  );
}

const formInputStyle = {
  borderRadius: 'var(--radius-xl)',
  background: 'var(--color-card)',
  border: '1.5px solid var(--color-border)',
  fontSize: '14.5px',
  height: '52px',
  boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.02)',
  transition: 'all 0.2s ease',
  outline: 'none'
};