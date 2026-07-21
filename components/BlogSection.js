'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { blogsData } from '@/data/blogs';

export default function BlogSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const blog = blogsData[currentIndex];
  const featuredBlogs = blogsData.slice(0, 3);

  const nextBlog = () => setCurrentIndex((prev) => (prev + 1) % blogsData.length);
  const prevBlog = () => setCurrentIndex((prev) => (prev - 1 + blogsData.length) % blogsData.length);

  return (
    <section className="home-blog-section" aria-labelledby="home-blog-title">
      <style>{`
        .home-blog-section {
          background: var(--color-bg);
          padding: var(--space-12, 48px) 0 var(--space-16, 64px);
        }

        .home-blog-inner {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .home-blog-header {
          margin-bottom: var(--space-8, 32px);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .home-blog-title {
          margin: 0;
          color: var(--color-text-primary, #323232);
          font-family: "Italiana", sans-serif;
          font-size: clamp(18px, 2.2vw, 24px);
          font-weight: 800;
          line-height: 1.2;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .home-blog-view-all {
          color: var(--color-primary, #0B3C5D);
          font-family: "Italiana", sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          transition: color var(--transition-fast, 150ms);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .home-blog-view-all:hover {
          color: var(--color-primary-hover, #082F49);
          text-decoration: underline;
        }

        /* ── Layout Grid ──────────────── */
        .home-blog-grid {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: var(--space-8, 32px);
          align-items: stretch;
        }

        /* ── Desktop Banner ─────────────── */
        .desktop-banner {
          position: relative;
          border-radius: var(--radius-lg, 16px);
          overflow: hidden;
          box-shadow: var(--shadow-sm, 0 6px 20px rgba(0,0,0,0.08));
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 40px 24px;
          min-height: 480px;
          background: #ffffff;
          transition: transform var(--transition-base, 250ms), box-shadow var(--transition-base, 250ms);
        }
        .desktop-banner:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md, 0 10px 30px rgba(0,0,0,0.1));
        }
        .desktop-banner-bg {
          display: none;
        }
        .desktop-banner-img {
          object-fit: contain;
          margin-bottom: 32px;
          transition: transform var(--transition-slow, 400ms);
        }
        .desktop-banner:hover .desktop-banner-img {
          transform: scale(1.04);
        }
        .desktop-banner-content {
          position: relative;
          z-index: 2;
          color: var(--color-primary, #0B3C5D);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .desktop-banner-content h3 {
          font-family: "Italiana", sans-serif;
          font-size: 20px;
          font-weight: 800;
          margin-bottom: var(--space-2, 8px);
          line-height: 1.3;
          text-transform: uppercase;
        }
        .desktop-banner-content p {
          font-size: 13px;
          color: var(--color-text-secondary, #555555);
          margin-bottom: var(--space-4, 16px);
          line-height: 1.5;
        }

        /* ── Mobile Banner ─────────────── */
        .mobile-banner {
          position: relative;
          border-radius: var(--radius-lg, 16px);
          overflow: hidden;
          box-shadow: var(--shadow-sm, 0 6px 20px rgba(0,0,0,0.08));
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 200px;
          background: #ffffff;
          align-items: center;
          text-align: center;
          padding: 32px 24px;
        }
        .mobile-banner-img {
          object-fit: contain;
          margin-bottom: 24px;
        }
        .mobile-banner-content {
          position: relative;
          z-index: 2;
          color: var(--color-primary, #0B3C5D);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .mobile-banner-content h3 {
          font-family: "Italiana", sans-serif;
          font-size: 20px;
          font-weight: 800;
          margin-bottom: var(--space-2, 8px);
          line-height: 1.3;
          text-transform: uppercase;
        }
        .mobile-banner-content p {
          font-size: 13px;
          color: var(--color-text-secondary, #555555);
          margin-bottom: var(--space-4, 16px);
          line-height: 1.5;
        }
        .home-blog-banner-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 20px;
          background: var(--color-primary, #0B3C5D);
          color: #ffffff;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .home-blog-banner-btn:hover {
          background: var(--color-primary-hover, #082F49);
          transform: translateY(-2px);
        }



        /* ── Cards Column ──────────────── */
        .home-blog-cards-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-5, 20px);
          position: relative;
        }

        .home-blog-card {
          display: grid;
          grid-template-columns: 200px 1fr;
          background: var(--color-bg-card, #FFFFFF);
          border: 1px solid var(--color-border, #E5E5E5);
          border-radius: var(--radius-md, 12px);
          overflow: hidden;
          box-shadow: var(--shadow-xs, 0 2px 5px rgba(0,0,0,0.06));
          text-decoration: none;
          color: inherit;
          transition: transform var(--transition-base, 250ms), box-shadow var(--transition-base, 250ms), border-color var(--transition-base, 250ms);
        }

        .home-blog-card:hover {
          transform: translateY(-3px);
          border-color: var(--brand-primary-border, #7A9EB7);
          box-shadow: var(--shadow-md, 0 10px 30px rgba(0,0,0,0.1));
        }

        .home-blog-card-media {
          position: relative;
          height: 100%;
          min-height: 140px;
          background: #e2e8f0;
          overflow: hidden;
        }

        .home-blog-card-media img {
          object-fit: cover;
          transition: transform var(--transition-slow, 400ms);
        }

        .home-blog-card:hover .home-blog-card-media img {
          transform: scale(1.05);
        }

        .home-blog-card-body {
          padding: var(--space-5, 20px);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .home-blog-card-tag {
          align-self: flex-start;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-primary, #0B3C5D);
          margin-bottom: var(--space-2, 8px);
          background: var(--brand-primary-light, #EAF2F8);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .home-blog-card-title {
          font-family: "Italiana", sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: var(--color-text-primary, #323232);
          margin: 0 0 var(--space-2, 8px);
          line-height: 1.35;
          transition: color var(--transition-fast, 150ms);
        }

        .home-blog-card:hover .home-blog-card-title {
          color: var(--color-primary, #0B3C5D);
        }

        .home-blog-card-excerpt {
          font-size: 13.5px;
          color: var(--color-text-secondary, #555555);
          line-height: 1.5;
          margin: 0 0 var(--space-3, 12px);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .home-blog-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: var(--color-text-muted, #777777);
          border-top: 1px solid #f1f5f9;
          padding-top: var(--space-2, 8px);
        }

        .home-blog-card-author {
          font-weight: 600;
        }

        /* ── Controls ─────────────────── */
        .home-blog-controls {
          position: absolute;
          top: 120px;
          left: 12px;
          right: 12px;
          transform: translateY(-50%);
          display: flex;
          justify-content: space-between;
          z-index: 10;
          pointer-events: none;
        }

        .home-blog-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1.5px solid var(--color-border, #E5E5E5);
          background: #ffffff;
          color: var(--color-text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          pointer-events: auto;
        }

        .home-blog-arrow:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        /* ── Responsive ───────────────── */
        @media (max-width: 991px) {
          .desktop-only { display: none !important; }
          .home-blog-grid {
            grid-template-columns: 1fr;
            gap: var(--space-6, 24px);
          }
        }
        @media (min-width: 992px) {
          .mobile-only { display: none !important; }
        }

        @media (max-width: 640px) {
          .home-blog-section {
            padding: var(--space-8, 32px) 0 var(--space-12, 48px);
          }
          .home-blog-inner {
            padding: 0 16px;
          }
          .home-blog-card {
            grid-template-columns: 1fr;
          }
          .home-blog-card-media {
            height: 160px;
          }
        }
      `}</style>

      <div className="home-blog-inner">
        <div className="home-blog-header">
          <h2 className="home-blog-title" id="home-blog-title">
            BLOG : CITY INFO, TRAVEL TIPS : STORIES &amp; ARTICLES
          </h2>
          <Link href="/blog" className="home-blog-view-all">
            View All
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        <div className="home-blog-grid">
          {/* Desktop Banner */}
          <div className="desktop-banner desktop-only">
            <Image
              src="/logooo.png"
              alt="Travel & Holiday Logo"
              width={260}
              height={100}
              priority={false}
              className="desktop-banner-img"
            />
            <div className="desktop-banner-bg" />
            <div className="desktop-banner-content">
              <h3>Explore Stories</h3>
              <p>Get the latest city insights, expert travel guides, and incredible stories from our global explorers.</p>
              <Link href="/blog" className="btn-primary">
                Read Blog
              </Link>
            </div>
          </div>

          {/* Mobile Banner */}
          <div className="mobile-banner mobile-only">
            <Image
              src="/logooo.png"
              alt="Travel & Holiday Logo"
              width={200}
              height={80}
              priority={false}
              className="mobile-banner-img"
            />
            <div className="mobile-banner-content">
              <h3>Explore Stories</h3>
              <p>Get the latest city insights, expert travel guides, and incredible stories from our global explorers.</p>
              <Link href="/blog" className="home-blog-banner-btn">
                Read Blog
              </Link>
            </div>
          </div>

          {/* Desktop Cards (3 Stacked) */}
          <div className="home-blog-cards-container desktop-only">
            {featuredBlogs.map((b) => (
              <Link key={b.id} href={`/blog/${b.slug}`} className="home-blog-card">
                <div className="home-blog-card-media">
                  <Image
                    src={b.image}
                    alt={b.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 200px"
                    loading="lazy"
                  />
                </div>
                <div className="home-blog-card-body">
                  <span className="home-blog-card-tag">{b.category}</span>
                  <h4 className="home-blog-card-title">{b.title}</h4>
                  <p className="home-blog-card-excerpt">{b.excerpt}</p>
                  <div className="home-blog-card-footer">
                    <span className="home-blog-card-author">By {b.author}</span>
                    <span>{b.date} • {b.readTime || '5 min read'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Cards (1 with Arrows) */}
          <div className="home-blog-cards-container mobile-only">
            <div className="home-blog-controls">
              <button onClick={prevBlog} className="home-blog-arrow" aria-label="Previous blog">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button onClick={nextBlog} className="home-blog-arrow" aria-label="Next blog">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <Link key={blog.id} href={`/blog/${blog.slug}`} className="home-blog-card" style={{ flex: 1, gridTemplateColumns: '1fr', gridTemplateRows: 'auto 1fr' }}>
              <div className="home-blog-card-media" style={{ height: '240px' }}>
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 400px"
                  loading="lazy"
                />
              </div>
              <div className="home-blog-card-body">
                <span className="home-blog-card-tag">{blog.category}</span>
                <h4 className="home-blog-card-title" style={{ fontSize: '18px', marginBottom: '12px' }}>{blog.title}</h4>
                <p className="home-blog-card-excerpt" style={{ fontSize: '15px', marginBottom: 'auto' }}>{blog.excerpt}</p>
                <div className="home-blog-card-footer" style={{ marginTop: '20px' }}>
                  <span className="home-blog-card-author">By {blog.author}</span>
                  <span>{blog.date} • {blog.readTime || '5 min read'}</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
