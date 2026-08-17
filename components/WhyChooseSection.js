'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getHomePage, getMediaUrl, getPackageReviews } from '@/utils/api';

const statIcons = ['✈️', '😊', '⭐'];

const fallbackStats = [
  { number: '3400+', label: 'Holidays\nCustomized', icon: statIcons[0] },
  { number: '98%', label: 'Customer\nSatisfaction', icon: statIcons[1] },
  { number: '4.9★', label: 'Average App\nRating', icon: statIcons[2] },
];

const fallbackFeatures = [
  { icon: '1', title: '100% Customized', desc: 'Every holiday built from scratch - no templates.' },
  { icon: '2', title: 'Best Price Guarantee', desc: "We'll match any verified cheaper quote, plus 5% off." },
  { icon: '3', title: 'Zero Hidden Charges', desc: 'Pay exactly what we quote. No surprises, ever.' },
  { icon: '4', title: '24/7 Expert Support', desc: 'Your dedicated travel expert is always reachable.' },
];

const fallbackGallery = [
  { src: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=500&q=80', span: true, label: 'Swiss Alps' },
  { src: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=500&q=80', span: false, label: 'Thailand' },
  { src: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500&q=80', span: false, label: 'Maldives' },
  { src: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=500&q=80', span: false, label: 'Serengeti' },
  { src: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&q=80', span: false, label: 'Japan' },
];

export default function WhyChooseSection() {
  const [content, setContent] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [currentBlogIndex, setCurrentBlogIndex] = useState(0);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadContent = async () => {
      const page = await getHomePage();
      const section = page?.details?.find((item) => item.key === 'why-choose-us-home' || item.section === 'why_choose_us');
      const data = section?.json_data || {};

      if (!mounted || !section) return;

      let fetchedTitle = section.title || "Why Choose Travel & Holiday";
      if (fetchedTitle.includes("ITS TRAVEL") || fetchedTitle.includes("It's Travel")) {
        fetchedTitle = "Why Choose Travel & Holiday";
      }

      setContent({
        title: fetchedTitle,
        stats: data.stats?.length
          ? data.stats
              .filter(item => item.value?.trim() || item.label?.trim())
              .map((item, index) => ({
                number: item.value,
                label: item.label,
                icon: statIcons[index] || statIcons[0],
              }))
          : fallbackStats,
        features: data.features?.length
          ? data.features.map((item, index) => ({
            icon: String(index + 1),
            title: item.title,
            desc: item.desc || item.description,
          }))
          : fallbackFeatures,
        gallery: data.gallery?.length
          ? data.gallery.map((item, index) => ({
            src: getMediaUrl(item.img || item.image),
            span: index === 0,
            label: item.lbl || item.label || '',
          })).filter((item) => item.src)
          : fallbackGallery,
      });

      try {
        const reviewsRes = await getPackageReviews({ packageSlug: 'thailand-beach-combo-7n8d', status: 'approved' });
        if (reviewsRes?.reviews) {
          setBlogs(reviewsRes.reviews);
        }
      } catch (err) {
        console.error("Failed to fetch reviews for why choose section", err);
      }
    };

    loadContent();

    return () => {
      mounted = false;
    };
  }, []);

  const sliderItems = useMemo(() => {
    if (!content) return [];
    const items = [...(content.features || [])];
    const appRating = content.stats?.find(stat => stat.label.toLowerCase().includes('app rating'));
    if (appRating) {
      items.unshift({
        icon: appRating.icon || '⭐',
        title: appRating.label.replace('\n', ' '),
        desc: appRating.number,
        isStat: true
      });
    }
    return items;
  }, [content]);

  const renderItems = sliderItems.length > 0 ? [...sliderItems, sliderItems[0]] : [];

  useEffect(() => {
    if (!sliderItems || sliderItems.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentFeatureIndex((prev) => prev + 1);
    }, 2500); // 2.5s loop
    
    return () => clearInterval(interval);
  }, [sliderItems]);

  // Snap back effect to prevent visible rewind
  useEffect(() => {
    if (currentFeatureIndex === sliderItems.length && sliderItems.length > 0) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentFeatureIndex(0);
      }, 600); // Matches the 0.6s CSS transition
      return () => clearTimeout(timeout);
    }
  }, [currentFeatureIndex, sliderItems.length]);

  if (!content) {
    return null; // Don't render until dynamic content is loaded
  }

  return (
    <section style={{ background: 'var(--color-bg)', padding: '52px 0 56px' }}>
      <style>{`
        .why-choose-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .stats-grid {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 32px;
        }
        @media (max-width: 1024px) {
          .why-choose-grid {
            gap: 32px;
          }
        }

        @media (max-width: 640px) {
          .stats-grid {
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          .section-title {
            font-size: 24px !important;
          }
          .feature-scroller-container {
            width: 90% !important;
            max-width: 400px !important;
            margin: 0 auto 32px auto !important;
            border-radius: 12px !important;
          }
          .blog-slider-container {
            width: 90% !important;
            max-width: 320px !important;
            margin: 0 auto 32px auto !important;
          }
          .blog-card {
            flex-direction: row !important;
            align-items: center !important;
            gap: 12px !important;
            padding: 12px !important;
          }
          .blog-card-right {
            width: 80px !important;
          }
          .blog-card-img-wrapper {
            width: 80px !important;
            height: 80px !important;
          }
          .blog-card-excerpt {
            display: none !important;
          }
          .blog-card-date-badge {
            font-size: 9px !important;
            padding: 2px 6px !important;
            bottom: -6px !important;
          }
          .auto-scroll-item {
            padding: 8px 12px !important;
            gap: 12px !important;
          }
        }
        .feature-scroller-container {
          width: 100%;
          max-width: 480px;
          overflow: hidden;
          position: relative;
          margin-bottom: 40px;
          border-radius: 100px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          background: #fff;
          border: 1px solid rgba(0,0,0,0.04);
        }
        .auto-scroll-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 12px 24px;
        }
        
        /* ── Progress Bar Animation ── */
        .scroller-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: var(--color-primary);
          animation: progress 2.5s linear infinite;
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        /* ── Blog Slider ───────────────── */
        .blog-slider-container {
          width: 100%;
          max-width: 460px;
          margin: 0 auto 32px auto;
          position: relative;
        }
        .blog-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          gap: 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          border: 1px solid var(--color-border);
          position: relative;
        }
        .blog-card-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        .blog-card-right {
          width: 110px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .blog-card-img-wrapper {
          width: 110px;
          height: 110px;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }
        .blog-card-date-badge {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-primary);
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          white-space: nowrap;
        }
        .blog-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          color: var(--color-primary);
        }
        .blog-nav-btn:hover {
          background: var(--color-primary);
          color: #fff;
        }
        .blog-nav-left { left: -18px; }
        .blog-nav-right { right: -18px; }
        .feature-scroller-inner {
          display: flex;
          flex-direction: row;
          width: 100%;
        }
        .feature-scroll-item {
          width: 100%;
          height: 140px;
          background: var(--color-primary-light);
          border: 1px solid var(--brand-primary-border);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 16px 20px;
        }
      `}</style>

      <div className="container">
        <div className="why-choose-grid">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--color-accent)', margin: '0 0 8px' }}>OUR TRACK RECORD</p>
              <h2 className="section-title theme-underline-heading" style={{ fontFamily: "'Hoefler Text', 'Voga', serif", fontWeight: 800, fontSize: 'clamp(28px, 4vw, 36px)', textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--color-text-primary)', lineHeight: 1.2, margin: '0 0 28px' }}>
                {content.title}
              </h2>
            </div>

            {content.stats && content.stats.filter(stat => stat.label && !stat.label.toLowerCase().includes('app rating')).slice(0, 2).length > 0 && (
              <div className="stats-grid">
                {content.stats
                  .filter(stat => stat.label && !stat.label.toLowerCase().includes('app rating'))
                  .slice(0, 2)
                  .map(({ number, label, icon }, index) => (
                  <div key={`stat-${index}-${label}`} style={{ textAlign: 'center', padding: '18px 24px', background: 'var(--color-primary-light)', borderRadius: 14, border: '1px solid var(--brand-primary-border)', minWidth: '180px' }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontFamily: '"Italiana", sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--color-primary)', lineHeight: 1 }}>{number}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 5, whiteSpace: 'pre-line', lineHeight: 1.4 }}>{label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Auto Scrolling Features Container */}
            {sliderItems?.length > 0 && (
              <div className="feature-scroller-container">
                <div 
                  className="feature-scroller-inner"
                  style={{ 
                    transform: `translateX(-${currentFeatureIndex * 100}%)`,
                    transition: isTransitioning ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
                  }}
                >
                  {renderItems.map(({ icon, title, desc, isStat }, idx) => (
                    <div 
                      key={`${title}-${idx}`} 
                      className="auto-scroll-item"
                      style={{ 
                        width: '100%', 
                        flexShrink: 0, 
                        background: 'linear-gradient(135deg, #ffffff 0%, var(--color-primary-light) 200%)'
                      }}
                    >
                      {isStat ? (
                        <>
                          <div style={{ fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {icon}
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: '"Italiana", sans-serif', fontWeight: 800, fontSize: '20px', color: 'var(--color-primary)', lineHeight: 1.1 }}>
                              {desc}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                              {title}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            background: 'var(--color-primary)', 
                            color: '#fff', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '16px', 
                            fontWeight: 800,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            flexShrink: 0
                          }}>
                            {icon}
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                              {title}
                            </div>
                            {desc && (
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {desc}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <div className="scroller-progress"></div>
              </div>
            )}

            {/* Manual Blog Slider */}
            {blogs.length > 0 && (
              <div className="blog-slider-container">
                <button 
                  className="blog-nav-btn blog-nav-left"
                  onClick={() => setCurrentBlogIndex((prev) => (prev - 1 + blogs.length) % blogs.length)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                
                <div style={{ overflow: 'hidden', borderRadius: 12, padding: '10px 0' }}>
                  <div style={{ display: 'flex', transition: 'transform 0.4s ease', transform: `translateX(-${currentBlogIndex * 100}%)` }}>
                    {blogs.map((review) => {
                      const dateObj = new Date(review.created_at);
                      const month = dateObj.toLocaleString('en-US', { month: 'short' });
                      const rating = review.rating || 5;
                      const stars = '⭐'.repeat(rating);
                      
                      return (
                        <div key={review.id} style={{ width: '100%', flexShrink: 0, padding: '0 4px' }}>
                          <div className="blog-card">
                            <div className="blog-card-left">
                              <h4 style={{ fontSize: 15, fontWeight: 800, color: '#151922', marginBottom: 4, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {review.title}
                              </h4>
                              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8, fontWeight: 500 }}>
                                {review.reviewer_name}
                              </div>
                              <div className="blog-card-excerpt" style={{ fontSize: 12, fontStyle: 'italic', color: '#666', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                "{review.comment || ''}"
                              </div>
                              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 'auto' }}>
                                <div style={{ fontSize: 12, color: '#FFB800', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  {stars}
                                </div>
                              </div>
                            </div>
                            <div className="blog-card-right">
                              <div style={{ position: 'relative', width: '100%' }}>
                                <div className="blog-card-img-wrapper" style={{ background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                </div>
                                <div className="blog-card-date-badge">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                  {month}
                                </div>
                              </div>
                              </div>
                            </div>
                          </div>

                      );
                    })}
                  </div>
                </div>

                <button 
                  className="blog-nav-btn blog-nav-right"
                  onClick={() => setCurrentBlogIndex((prev) => (prev + 1) % blogs.length)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            )}

            <Link
              href="/tours"
              className="btn-primary circle-btn-hover"
            >
              <svg className="circle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              Plan Your Holiday Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
