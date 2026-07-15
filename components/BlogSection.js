'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { blogsData } from '@/data/blogs';

export default function BlogSection() {
  // Get first 3 blogs for the homepage widget
  const featuredBlogs = blogsData.slice(0, 3);

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
          font-family: var(--font-poppins), Poppins, sans-serif;
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
          font-family: var(--font-poppins), Poppins, sans-serif;
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

        /* ── Banner Column ─────────────── */
        .home-blog-banner-container {
          position: relative;
          border-radius: var(--radius-lg, 16px);
          overflow: hidden;
          box-shadow: var(--shadow-sm, 0 6px 20px rgba(0,0,0,0.08));
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          min-height: 480px;
          background: var(--color-text-primary);
          transition: transform var(--transition-base, 250ms), box-shadow var(--transition-base, 250ms);
        }

        .home-blog-banner-container:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md, 0 10px 30px rgba(0,0,0,0.1));
        }

        .home-blog-banner-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(180deg, rgba(31, 42, 68, 0) 40%, rgba(31, 42, 68, 0.95) 100%);
        }

        .home-blog-banner-img {
          object-fit: cover;
          transition: transform var(--transition-slow, 400ms);
        }

        .home-blog-banner-container:hover .home-blog-banner-img {
          transform: scale(1.04);
        }

        .home-blog-banner-content {
          position: relative;
          z-index: 2;
          padding: var(--space-6, 24px);
          color: #ffffff;
        }

        .home-blog-banner-content h3 {
          font-family: var(--font-poppins), Poppins, sans-serif;
          font-size: 20px;
          font-weight: 800;
          margin-bottom: var(--space-2, 8px);
          line-height: 1.3;
          text-transform: uppercase;
        }

        .home-blog-banner-content p {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: var(--space-4, 16px);
          line-height: 1.5;
        }

        .home-blog-banner-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 15px 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #3C7A57 0%, #2C6245 100%);
          color: #FFFFFF;
          border: none;
          font-size: 15px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          text-decoration: none;
          transition: all 0.35s ease;
          box-shadow: 0 10px 25px rgba(44,98,69,0.28);
          cursor: pointer;
        }

        .home-blog-banner-btn:hover {
          background: linear-gradient(135deg, #2C6245 0%, #214C35 100%);
          transform: translateY(-3px);
          box-shadow: 0 16px 35px rgba(44,98,69,0.38);
          color: #FFFFFF;
        }

        .home-blog-banner-btn:active {
          transform: translateY(1px) scale(0.98);
        }

        /* ── Cards Column ──────────────── */
        .home-blog-cards-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-5, 20px);
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
          font-family: var(--font-poppins), Poppins, sans-serif;
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

        /* ── Responsive ───────────────── */
        @media (max-width: 991px) {
          .home-blog-grid {
            grid-template-columns: 1fr;
            gap: var(--space-6, 24px);
          }
          .home-blog-banner-container {
            min-height: 300px;
          }
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
          {/* Left Column: Banner */}
          <div className="home-blog-banner-container">
            <Image
              src="/blog-banner.webp"
              alt="Travel Blog Banner"
              fill
              sizes="(max-width: 991px) 100vw, 350px"
              priority={false}
              className="home-blog-banner-img"
            />
            <div className="home-blog-banner-bg" />
            <div className="home-blog-banner-content">
              <h3>Explore Stories</h3>
              <p>Get the latest city insights, expert travel guides, and incredible stories from our global explorers.</p>
              <Link href="/blog" className="home-blog-banner-btn">
                Read Blog
              </Link>
            </div>
          </div>

          {/* Right Column: Blog Cards List */}
          <div className="home-blog-cards-container">
            {featuredBlogs.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`} className="home-blog-card">
                <div className="home-blog-card-media">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 200px"
                    loading="lazy"
                  />
                </div>
                <div className="home-blog-card-body">
                  <span className="home-blog-card-tag">{blog.category}</span>
                  <h4 className="home-blog-card-title">{blog.title}</h4>
                  <p className="home-blog-card-excerpt">{blog.excerpt}</p>
                  <div className="home-blog-card-footer">
                    <span className="home-blog-card-author">By {blog.author}</span>
                    <span>{blog.date} • {blog.readTime || '5 min read'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
