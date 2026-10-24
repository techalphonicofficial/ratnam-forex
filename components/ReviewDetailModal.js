'use client';

import { useEffect, useCallback } from 'react';
import { getMediaUrl } from '@/utils/api';

const cleanContent = (content) => {
  if (!content) return '';
  const text = String(content)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
  return text.replace(/^[\s"“'”]+|[\s"“'”]+$/g, '').trim();
};

const getStarCount = (badge, rating) => {
  if (typeof badge === 'string' && badge.trim()) {
    const trimmed = badge.trim();
    const starMatches = trimmed.match(/[⭐★]/g);
    if (starMatches && starMatches.length > 0) {
      return starMatches.length;
    }
    const num = parseFloat(trimmed);
    if (!isNaN(num) && num > 0) {
      return Math.min(5, Math.max(1, Math.round(num)));
    }
  }
  if (typeof rating === 'number' && rating > 0) {
    return Math.min(5, Math.max(1, Math.round(rating)));
  }
  return 5;
};

export default function ReviewDetailModal({
  isOpen,
  onClose,
  reviews = [],
  currentIndex = 0,
  onNavigate,
}) {
  const currentReview = reviews[currentIndex] || reviews[0] || null;

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && reviews.length > 1) {
        onNavigate((currentIndex - 1 + reviews.length) % reviews.length);
      } else if (e.key === 'ArrowRight' && reviews.length > 1) {
        onNavigate((currentIndex + 1) % reviews.length);
      }
    },
    [isOpen, onClose, reviews.length, currentIndex, onNavigate]
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // Prevent wheel/touch scrolling on the backdrop from scrolling background page
    const preventBackgroundScroll = (e) => {
      const popup = document.querySelector('.rvm-popup-box');
      if (!popup || !popup.contains(e.target)) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventBackgroundScroll, { passive: false });
    window.addEventListener('touchmove', preventBackgroundScroll, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', preventBackgroundScroll);
      window.removeEventListener('touchmove', preventBackgroundScroll);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.touchAction = prevBodyTouchAction;
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !currentReview) return null;

  const rawName = (
    currentReview.reviewer_name ||
    currentReview.name ||
    currentReview.title ||
    'Traveler'
  ).trim();

  // Create social handle like @SandraSimpsons
  const handle = `@${rawName.replace(/\s+/g, '')}`;
  const initial = rawName ? rawName.charAt(0).toUpperCase() : 'T';
  const avatarUrl = currentReview.img
    ? getMediaUrl(currentReview.img)
    : (currentReview.avatar ? (currentReview.avatar.startsWith('http') || currentReview.avatar.startsWith('/') ? getMediaUrl(currentReview.avatar) : currentReview.avatar) : null);
  const starsCount = getStarCount(currentReview.badge, currentReview.rating);
  const text = cleanContent(currentReview.content || currentReview.comment);

  return (
    <div
      className="rvm-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Customer Review Details"
    >
      <style>{`
        /* ── Dark Translucent Backdrop (Site remains visible underneath) ── */
        .rvm-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 16px;
          background: rgba(18, 14, 11, 0.65);
          backdrop-filter: blur(6px);
          animation: rvmFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          overflow-y: auto;
          overscroll-behavior: contain;
        }

        @keyframes rvmFadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(6px);
          }
        }

        /* ── Compact Modal Popup Box (Aesthetic Sand Canvas) ── */
        .rvm-popup-box {
          position: relative;
          width: 100%;
          max-width: 440px;
          margin: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          border-radius: 30px;
          padding: 34px 22px 24px 22px;
          background:
            radial-gradient(ellipse at 25% 20%, rgba(255, 255, 255, 0.32) 0%, transparent 50%),
            linear-gradient(135deg, rgba(60, 42, 28, 0.12) 0%, transparent 40%, rgba(60, 42, 28, 0.18) 70%, transparent 100%),
            radial-gradient(circle at 50% 40%, #DFCBB8 0%, #CBB39C 50%, #B89C82 100%);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.45);
          animation: rvmScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes rvmScaleUp {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* ── Corner Close Button on the Popup Box ── */
        .rvm-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.75);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #3E2F23;
          backdrop-filter: blur(4px);
          transition: all 0.2s ease;
          z-index: 10;
        }
        .rvm-close-btn:hover {
          background: #FFFFFF;
          color: #111;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
        }

        /* ── Header: CUSTOMER + Reviews Script Overlay ── */
        .rvm-header-wrap {
          position: relative;
          width: 100%;
          text-align: center;
          margin-bottom: 46px;
          user-select: none;
        }
        .rvm-header-bg {
          font-family: 'Italiana', 'Gilda Display', 'Cinzel', serif;
          font-size: clamp(32px, 7vw, 42px);
          font-weight: 600;
          letter-spacing: clamp(8px, 2vw, 12px);
          color: #8C7561;
          text-transform: uppercase;
          line-height: 1;
          display: inline-block;
          transform: translateX(4px);
        }
        .rvm-header-fg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -46%) rotate(-3deg);
          font-family: 'Alex Brush', 'Dancing Script', cursive;
          font-size: clamp(46px, 10vw, 62px);
          font-weight: 500;
          color: #FFFFFF;
          letter-spacing: 1px;
          white-space: nowrap;
          text-shadow: 0 3px 14px rgba(70, 50, 35, 0.22);
          pointer-events: none;
        }

        /* ── The Review Card Inside Popup ── */
        .rvm-card {
          position: relative;
          width: 100%;
          background: #FAF6F0;
          border-radius: 26px;
          padding: 0 24px 26px 24px;
          box-shadow: 0 16px 40px rgba(55, 38, 24, 0.2), 0 3px 10px rgba(55, 38, 24, 0.06);
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.7);
        }

        /* ── Floating Avatar ── */
        .rvm-avatar-container {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          margin: -50px auto 14px auto;
          border: 4px solid #FAF6F0;
          box-shadow: 0 8px 22px rgba(60, 42, 28, 0.16);
          overflow: hidden;
          position: relative;
          background: var(--color-primary-light, #fdf8e7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        .rvm-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .rvm-avatar-initial {
          font-family: 'Italiana', serif;
          font-size: 38px;
          font-weight: 700;
          color: var(--color-primary, #b8860b);
        }

        /* ── Reviewer Handle / Name ── */
        .rvm-handle {
          font-size: 19px;
          font-weight: 700;
          color: #27201A;
          margin: 0 0 6px 0;
          letter-spacing: -0.2px;
          font-family: inherit;
        }

        /* ── Gold Star Rating ── */
        .rvm-stars {
          display: flex;
          justify-content: center;
          gap: 3px;
          font-size: 19px;
          margin-bottom: 14px;
          user-select: none;
        }
        .rvm-star {
          color: #F5A623;
          line-height: 1;
        }
        .rvm-star-empty {
          color: #E2D6C8;
          line-height: 1;
        }

        /* ── Review Text ── */
        .rvm-content {
          font-size: 14px;
          line-height: 1.68;
          color: #6C5F54;
          font-weight: 400;
          margin: 0 auto;
          max-width: 330px;
        }

        /* ── Navigation Arrows ── */
        .rvm-nav-btn {
          position: absolute;
          top: 55%;
          transform: translateY(-50%);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #3E2F23;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
          transition: all 0.2s ease;
          z-index: 5;
        }
        .rvm-nav-btn:hover {
          background: #FFFFFF;
          color: #111;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
        }
        .rvm-nav-prev {
          left: -16px;
        }
        .rvm-nav-next {
          right: -16px;
        }

        /* ── Pagination Dots ── */
        .rvm-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          margin-top: 18px;
        }
        .rvm-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(140, 117, 97, 0.35);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .rvm-dot.active {
          width: 20px;
          border-radius: 10px;
          background: #8C7561;
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .rvm-popup-box {
            padding: 30px 16px 20px 16px;
            border-radius: 24px;
          }
          .rvm-card {
            padding: 0 16px 20px 16px;
            border-radius: 22px;
          }
          .rvm-header-wrap {
            margin-bottom: 38px;
          }
          .rvm-avatar-container {
            width: 86px;
            height: 86px;
            margin-top: -43px;
          }
          .rvm-avatar-initial {
            font-size: 32px;
          }
          .rvm-handle {
            font-size: 17px;
          }
          .rvm-stars {
            font-size: 17px;
            margin-bottom: 12px;
          }
          .rvm-content {
            font-size: 13.5px;
            line-height: 1.55;
          }
          .rvm-nav-prev {
            left: -10px;
            width: 32px;
            height: 32px;
          }
          .rvm-nav-next {
            right: -10px;
            width: 32px;
            height: 32px;
          }
        }
      `}</style>

      {/* Small Popup Box (Centrally positioned with warm sand luxury canvas) */}
      <div className="rvm-popup-box" onClick={(e) => e.stopPropagation()}>
        {/* Close Button on the Popup Box itself */}
        <button
          className="rvm-close-btn"
          onClick={onClose}
          aria-label="Close review popup"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Top Header: CUSTOMER with layered Reviews script */}
        <div className="rvm-header-wrap">
          <span className="rvm-header-bg">CUSTOMER</span>
          <span className="rvm-header-fg">Reviews</span>
        </div>

        {/* Card with Floating Avatar */}
        <div className="rvm-card">
          {/* Avatar Floating Above Card Edge */}
          <div className="rvm-avatar-container">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={rawName}
                className="rvm-avatar-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <span
              className="rvm-avatar-initial"
              style={{ display: avatarUrl ? 'none' : 'flex' }}
            >
              {initial}
            </span>
          </div>

          {/* Social Handle */}
          <div className="rvm-handle">{handle}</div>

          {/* Star Rating */}
          <div className="rvm-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= starsCount ? 'rvm-star' : 'rvm-star-empty'}
              >
                ★
              </span>
            ))}
          </div>

          {/* Review Title Headline */}
          {currentReview.title && currentReview.title.trim() !== rawName ? (
            <div style={{ fontWeight: 600, fontSize: '15.5px', color: '#27201A', marginBottom: '8px', lineHeight: 1.35, textAlign: 'center' }}>
              &ldquo;{currentReview.title.trim()}&rdquo;
            </div>
          ) : null}

          {/* Review Text */}
          <p className="rvm-content">
            {text ||
              'Great experience from planning to the trip. Everything was seamless!'}
          </p>

          {/* Navigation Arrows (if multiple reviews) */}
          {reviews.length > 1 && (
            <>
              <button
                className="rvm-nav-btn rvm-nav-prev"
                onClick={() =>
                  onNavigate((currentIndex - 1 + reviews.length) % reviews.length)
                }
                aria-label="Previous review"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button
                className="rvm-nav-btn rvm-nav-next"
                onClick={() =>
                  onNavigate((currentIndex + 1) % reviews.length)
                }
                aria-label="Next review"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </>
          )}

          {/* Pagination Dots */}
          {reviews.length > 1 && (
            <div className="rvm-dots">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  className={`rvm-dot ${i === currentIndex ? 'active' : ''}`}
                  onClick={() => onNavigate(i)}
                  aria-label={`View review ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
