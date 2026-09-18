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
          gap: 24px;
          max-width: 1000px;
          margin: 0 auto;
        }
        .stats-grid {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
        }
        
        /* ── Feature Ticket (Premium Style) ── */
        .feature-scroller-container {
          width: 100%;
          max-width: 945px;
          overflow: hidden;
          position: relative;
          margin-bottom: 32px;
          border-radius: 16px;
          box-shadow: 0 6px 24px rgba(0,0,0,0.08);
          background: #FDFBF7;
          border: 1px solid rgba(0,0,0,0.04);
        }
        .feature-scroller-inner {
          display: flex;
          flex-direction: row;
          width: 100%;
        }
        .auto-scroll-item {
          width: 100%;
          flex-shrink: 0;
          display: flex;
          align-items: stretch;
          position: relative;
        }
        .ticket-left {
          background: var(--color-primary, #b8860b);
          color: #fff;
          width: 105px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Italiana", serif;
          font-size: 42px;
          font-weight: 800;
          position: relative;
        }
        .ticket-left::after {
          content: '';
          position: absolute;
          right: -5px;
          top: 0;
          bottom: 0;
          width: 10px;
          background-image: radial-gradient(circle at 10px 50%, transparent 4px, #FDFBF7 4.5px);
          background-size: 10px 20px;
          background-position: -5px 0;
        }
        .ticket-center {
          flex: 1;
          padding: 24px 30px;
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .ticket-title {
          font-weight: 800;
          font-size: 22px;
          color: var(--color-text-primary, #151922);
          margin-bottom: 6px;
        }
        .ticket-desc {
          font-size: 16px;
          color: var(--color-text-muted, #666);
          line-height: 1.5;
        }
        .ticket-right {
          width: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-left: 2px dashed rgba(0,0,0,0.1);
          padding: 12px;
        }
        .ticket-barcode {
          width: 100%;
          height: 60%;
          background: repeating-linear-gradient(90deg, #151922, #151922 2px, transparent 2px, transparent 4px, #151922 4px, #151922 5px, transparent 5px, transparent 8px);
          opacity: 0.2;
        }
        .scroller-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: var(--color-primary, #b8860b);
          animation: progress 2.5s linear infinite;
          z-index: 2;
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        /* ── Wide Review Slider ── */
        .blog-slider-container {
          width: 100%;
          max-width: 520px;
          margin: 0 auto 32px auto;
          position: relative;
        }
        .premium-review-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 16px 32px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.08);
          border: 1px solid var(--color-border, #eee);
          display: flex;
          flex-direction: column;
          position: relative;
          text-align: left;
          height: 100%;
        }
        .review-eyebrow {
          position: absolute;
          top: 16px;
          right: 32px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: var(--color-text-muted, #666);
          text-transform: uppercase;
        }
        .review-quote-icon {
          font-family: serif;
          font-size: 48px;
          color: var(--color-primary, #b8860b);
          line-height: 1;
          height: 24px;
          margin-bottom: 8px;
          opacity: 0.8;
        }
        .review-comment {
          font-size: 16px;
          font-style: normal;
          color: var(--color-text-primary, #151922);
          line-height: 1.5;
          margin-bottom: 12px;
          font-weight: 500;
        }
        .review-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(0,0,0,0.05);
          padding-top: 12px;
          margin-top: auto;
        }
        .reviewer-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .reviewer-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text-primary, #151922);
        }
        .reviewer-stars {
          font-size: 12px;
          color: #FFB800;
          letter-spacing: 2px;
        }
        .reviewer-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--color-primary-light, #fdf8e7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary, #b8860b);
          font-weight: 700;
          font-size: 18px;
          border: 2px solid #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        /* ── Nav Buttons ── */
        .blog-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid var(--color-border, #eee);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          color: var(--color-primary, #b8860b);
          transition: all 0.2s ease;
        }
        .blog-nav-btn:hover {
          background: var(--color-primary, #b8860b);
          color: #fff;
          transform: translateY(-50%) scale(1.05);
        }
        .blog-nav-left { left: -20px; }
        .blog-nav-right { right: -20px; }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .feature-scroller-container {
            width: 90% !important;
            max-width: 340px !important;
          }
          .blog-slider-container {
            width: 85% !important;
            max-width: 380px !important;
          }
          .premium-review-card {
            padding: 12px 16px;
          }
          .review-eyebrow {
            right: 16px;
            top: 12px;
            font-size: 9px;
          }
          .review-quote-icon {
            font-size: 32px;
            height: 16px;
            margin-bottom: 4px;
          }
          .review-comment {
            font-size: 12px;
            margin-bottom: 8px;
          }
          .review-bottom {
            padding-top: 8px;
          }
          .reviewer-avatar {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }
          .ticket-left {
            width: 50px;
            font-size: 20px;
          }
          .ticket-center {
            padding: 12px 12px;
          }
          .ticket-title {
            font-size: 14px;
            margin-bottom: 2px;
          }
          .ticket-desc {
            font-size: 11px;
            line-height: 1.3;
          }
          .ticket-right {
            width: 30px;
            padding: 6px;
          }
          .blog-nav-left { left: -16px; width: 32px; height: 32px; }
          .blog-nav-right { right: -16px; width: 32px; height: 32px; }
          .blog-nav-btn svg { width: 16px; height: 16px; }
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
                    >
                      <div className="ticket-left">
                        {isStat ? icon : String(idx).padStart(2, '0')}
                      </div>
                      <div className="ticket-center">
                        <div className="ticket-title">{isStat ? desc : title}</div>
                        <div className="ticket-desc">{isStat ? title : desc}</div>
                      </div>
                      <div className="ticket-right">
                        <div className="ticket-barcode"></div>
                      </div>
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
                          <div className="premium-review-card">
                            <div className="review-eyebrow">Happy Traveler</div>
                            <div className="review-quote-icon">“</div>
                            <div className="review-comment">
                              {review.comment || 'Great experience from planning to the trip. Everything was seamless!'}
                            </div>
                            <div className="review-bottom">
                              <div className="reviewer-info">
                                <div className="reviewer-name">{review.reviewer_name}</div>
                                <div className="reviewer-stars">{stars}</div>
                              </div>
                              <div className="reviewer-avatar">
                                {review.reviewer_name ? review.reviewer_name.charAt(0).toUpperCase() : 'T'}
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
