/* GramSection Redesign */
'use client';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { gramReels } from '@/data/gramReels';
import { getReviews, getMediaUrl } from '@/utils/api';

const FALLBACK_VIDEO_SOURCES = [
  'https://res.cloudinary.com/demo/video/upload/q_auto,f_auto/elephants.mp4',
  'https://res.cloudinary.com/demo/video/upload/q_auto,f_auto/sea_turtle.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
];

const getVideoType = (src) => {
  if (!src) return undefined;
  return src.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4';
};

const getReviewVideoUrl = (review) => {
  const mediaUrl = review.media_url || review.mediaUrl || review.media?.url;
  const mediaType = review.media_type || review.mediaType || review.media?.type || '';
  const looksLikeVideo = /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(mediaUrl || ''));
  const directVideo =
    review.video ||
    review.video_url ||
    review.videoUrl ||
    review.reel ||
    review.reel_url ||
    review.media_video;

  const video = directVideo || (/video/i.test(mediaType) || looksLikeVideo ? mediaUrl : '');
  return video ? getMediaUrl(video) : '';
};

function GramCard({ photo, index }) {
  const [hovered, setHovered] = useState(false);
  const isVideo = photo.videoSrc ? /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(photo.videoSrc) : false;
  const videoSrc = isVideo ? photo.videoSrc : null;
  const posterSrc = photo.posterSrc || photo.src || (videoSrc ? null : FALLBACK_VIDEO_SOURCES[index % FALLBACK_VIDEO_SOURCES.length]);

  return (
    <Link
      href={`/reels?idx=${index}`}
      className="gram-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Play ${photo.title || photo.user || 'travel reel'}`}
      style={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        textDecoration: 'none',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.3s ease',
      }}
    >
      {/* Arched Image Container */}
      <div className="gram-card-img" style={{
        width: '100%',
        borderRadius: '200px 200px 16px 16px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: hovered ? '0 10px 30px rgba(255,255,255,0.05)' : 'none',
        transition: 'box-shadow 0.3s ease',
        transform: 'translateZ(0)',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)'
      }}>
        {videoSrc ? (
          <video
            key={`${videoSrc}-preview`}
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            poster={posterSrc}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.5s ease',
              background: 'var(--color-text-primary)',
            }}
          >
            <source src={videoSrc} type={getVideoType(videoSrc)} />
          </video>
        ) : (
          <img
            src={posterSrc}
            alt={photo.user}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.5s ease',
            }}
            loading="lazy"
          />
        )}
        {/* Play Icon overlay on hover */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0,
          pointerEvents: 'none',
          transition: 'opacity 0.3s'
        }}>
          <div style={{
            width: 50, height: 50, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: '2px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
          }}>
            <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <h4 style={{ color: 'var(--color-text-primary)', fontSize: 13, fontWeight: 700, margin: '0 0 8px', fontFamily: '"Italiana", sans-serif' }}>
          {photo.cardTitle || (photo.location ? `${photo.user} ${photo.location} Holiday` : (photo.title || photo.user))}
        </h4>
        {photo.location && (
          <div style={{
            background: 'var(--color-bg-overlay)', color: 'white', fontSize: 10, fontWeight: 600,
            padding: '4px 12px', borderRadius: 12, display: 'inline-block'
          }}>
            {photo.location}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function GramSection({ videoReviewsData, themeClass = '', cmsPage = null, inContainer = false, heading = null }) {
  const scrollRef = useRef(null);
  const [reels, setReels] = useState(gramReels);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const checkScrollable = () => {
      setCanScroll(el.scrollWidth > el.clientWidth + 10);
    };
    checkScrollable();
    const timer = setTimeout(checkScrollable, 300);
    window.addEventListener('resize', checkScrollable);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [reels, inContainer]);

  const activeData = useMemo(() => {
    return (cmsPage?.details?.find(d => d.key === 'social_media')) || videoReviewsData;
  }, [cmsPage, videoReviewsData]);

  useEffect(() => {
    let mounted = true;

    if (activeData?.json_data?.images?.length) {
      const mappedReels = activeData.json_data.images.map((item, index) => {
        const fallback = gramReels[index % gramReels.length];
        let user = fallback.user;
        let location = fallback.location;
        let cardTitle = '';

        if (item.lbl) {
          const lblMatch = item.lbl.match(/^(@\w+)\s+(.*?)(?:\s+Holiday\s+(.*))?$/i);
          if (lblMatch) {
            user = lblMatch[1];
            location = (lblMatch[3] || lblMatch[2]).trim();
            cardTitle = `${user} ${location} Holiday`;
          } else if (item.lbl.includes(',')) {
            const parts = item.lbl.split(',');
            user = parts[0].trim();
            location = parts.slice(1).join(', ').trim();
            cardTitle = `${user} ${location} Holiday`;
          } else {
            cardTitle = item.lbl.trim();
          }
        }

        const rawMedia = item.img || item.image || item.video || item.src;
        const fullMedia = rawMedia ? getMediaUrl(rawMedia) : '';
        const isVideo = /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(fullMedia);

        return {
          ...fallback,
          id: `cms-${index}`,
          posterSrc: isVideo ? (fallback.posterSrc || fallback.src) : fullMedia,
          src: isVideo ? fallback.src : fullMedia,
          videoSrc: isVideo ? fullMedia : '',
          user: user,
          location: location,
          title: item.lbl,
          cardTitle: cardTitle,
        };
      });
      setReels(mappedReels);
      return;
    }

    const loadReviews = async () => {
      const reviews = await getReviews();

      if (!mounted || !reviews.length) return;

      setReels(reviews.map((review, index) => {
        const fallback = gramReels[index % gramReels.length];
        const packageName = review.package?.name || review.title || fallback.tag;

        return {
          ...fallback,
          id: review.id ?? fallback.id,
          src: fallback.src,
          posterSrc: getMediaUrl(review.thumbnail || review.poster || review.image) || fallback.src,
          userAvatar: getMediaUrl(review.user_avatar),
          user: review.user_handle || review.user_name || fallback.user,
          likes: review.likes_count ? String(review.likes_count) : fallback.likes,
          caption: review.description || review.title || fallback.caption,
          location: review.location || fallback.location,
          title: review.title || packageName,
          description: review.description || fallback.description,
          videoSrc: getReviewVideoUrl(review) || fallback.videoSrc,
          tag: packageName,
          tour: review.package_id ? `/booking/${review.package_id}` : fallback.tour,
        };
      }));
    };

    loadReviews();

    return () => {
      mounted = false;
    };
  }, [activeData]);

  const scroll = useCallback((dir) => {
    if (!scrollRef.current) return;
    const scrollAmount = window.innerWidth <= 768 ? (scrollRef.current.clientWidth || window.innerWidth) : 500;
    scrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
  }, []);

  const headingText = heading || activeData?.json_data?.heading_content || activeData?.title || 'Love From The Gram';

  const descSource = activeData?.json_data?.block_desc || activeData?.description || videoReviewsData?.description || '';
  let googleRating = '4.6';
  let googleReviews = '8250';
  let fbRating = '4.8';
  let fbReviews = '1440';

  if (descSource) {
    const starMatches = [...descSource.matchAll(/([0-9.]+)\s*\/\s*5\s*★?\s*([0-9,]+)\s*reviews/gi)];
    if (starMatches.length >= 1) {
      googleRating = starMatches[0][1];
      googleReviews = starMatches[0][2];
    }
    if (starMatches.length >= 2) {
      fbRating = starMatches[1][1];
      fbReviews = starMatches[1][2];
    }

    const googleMatch = descSource.match(/Google:\s*([\d.]+)[^\d]*(\d+)/i);
    if (googleMatch) {
      googleRating = googleMatch[1];
      googleReviews = googleMatch[2];
    }
    const fbMatch = descSource.match(/Facebook:\s*([\d.]+)[^\d]*(\d+)/i);
    if (fbMatch) {
      fbRating = fbMatch[1];
      fbReviews = fbMatch[2];
    }
  }

  return (
    <section className={`${themeClass} ${inContainer ? 'gram-in-container' : 'gram-section-not-in-container'}`} style={{
      background: 'transparent',
      padding: inContainer ? '10px 0 20px' : '80px 0 100px',
      position: 'relative',
      overflow: 'visible',
    }}>
      <style>{`
        .gram-heading {
          font-family: "Italiana", sans-serif;
          font-size: 40px;
          color: var(--color-text-primary);
          margin: 0 0 16px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .theme-underline-heading::after {
          background-color: var(--color-primary, #AA8453) !important;
        }
        .theme-underline-heading::before {
          border-bottom-color: var(--color-primary, #AA8453) !important;
        }
        .gram-card {
          width: 220px;
        }
        .gram-card-img {
          height: 380px;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .gram-scroll-area {
          gap: 24px;
        }
        .gram-spacer {
          flex: 0 0 max(calc((100vw - 1200px) / 2), 24px);
        }
        .gram-card-wrapper {
          scroll-snap-align: start;
          flex: 0 0 auto;
        }
        .gram-in-container .gram-heading {
          font-size: 34px !important;
          margin: 0 0 14px !important;
        }
        .gram-in-container .gram-card {
          width: 220px !important;
        }
        .gram-in-container .gram-card-img {
          height: 380px !important;
        }
        .gram-in-container .gram-scroll-area {
          gap: 20px !important;
          padding: 20px 4px 28px !important;
          display: flex !important;
          justify-content: center !important;
        }
        .gram-arrow-btn {
          position: absolute;
          top: 45%;
          transform: translateY(-50%);
          z-index: 10;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.96);
          border: 1.5px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
          color: var(--color-text-primary, #0f172a);
          transition: all 0.2s ease;
          padding: 0;
        }
        .gram-arrow-btn:hover {
          background: var(--brand-primary, #0f766e);
          color: white;
          border-color: var(--brand-primary, #0f766e);
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
        }
        .gram-arrow-prev {
          left: -18px;
        }
        .gram-arrow-next {
          right: -18px;
        }
        .gram-section-not-in-container .gram-arrow-prev {
          left: 20px;
        }
        .gram-section-not-in-container .gram-arrow-next {
          right: 20px;
        }
        @media (max-width: 1220px) and (min-width: 769px) {
          .gram-in-container .gram-scroll-area {
            justify-content: center !important;
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
        }
        @media (max-width: 991px) {
          .gram-arrow-prev {
            left: 8px !important;
          }
          .gram-arrow-next {
            right: 8px !important;
          }
        }
        @media (max-width: 768px) {
          .gram-heading {
            font-size: 26px;
            padding: 0 16px;
          }
          .gram-spacer {
            display: none !important;
          }
          .gram-in-container .gram-card,
          .gram-card {
            width: 200px !important;
            margin: 0 auto !important;
          }
          .gram-in-container .gram-card-img,
          .gram-card-img {
            height: 340px !important;
          }
          .gram-in-container .gram-scroll-area,
          .gram-scroll-area {
            gap: 0 !important;
            justify-content: flex-start !important;
            padding: 14px 0 24px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .gram-card-wrapper {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            flex: 0 0 100% !important;
            scroll-snap-align: center !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .gram-arrow-btn {
            width: 36px;
            height: 36px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.16);
            background: rgba(255, 255, 255, 0.98);
          }
          .gram-arrow-prev {
            left: 10px !important;
          }
          .gram-arrow-next {
            right: 10px !important;
          }
        }
        @media (max-width: 480px) {
          .gram-arrow-prev {
            left: 8px !important;
          }
          .gram-arrow-next {
            right: 8px !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: inContainer ? '100%' : 1200, margin: '0 auto', position: 'relative' }}>

        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: inContainer ? 28 : 48 }}>
          <h2 className="theme-underline-heading gram-heading">
            {headingText}
          </h2>
          {activeData?.description && (
            <p style={{
              fontSize: '16px',
              color: 'var(--color-text-muted)',
              margin: '-8px 0 20px',
              fontFamily: '"Italiana", sans-serif',
              letterSpacing: '0.5px'
            }}>
              {activeData.description}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
            {/* Google Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Google SVG */}
              <svg width="24" height="24" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
              <div style={{ color: 'var(--color-text-primary)', fontSize: 13, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {googleRating}<span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginRight: 4 }}>/5</span>
                  <span style={{ color: 'var(--color-secondary)', fontSize: 14 }}>★</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500, letterSpacing: 0.5 }}>{googleReviews} reviews</div>
              </div>
            </div>

            {/* Facebook Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Facebook Logo via SVG */}
              <div style={{
                width: 24, height: 24, background: '#1877f2', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </div>
              <div style={{ color: 'var(--color-text-primary)', fontSize: 13, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {fbRating}<span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginRight: 4 }}>/5</span>
                  <span style={{ color: 'var(--color-secondary)', fontSize: 14 }}>★</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500, letterSpacing: 0.5 }}>{fbReviews} reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Section */}
        <div style={{ position: 'relative' }}>
          {/* Navigation Arrows */}
          {(!inContainer || canScroll) ? (
            <>
              <button
                type="button"
                onClick={() => scroll(-1)}
                className="gram-arrow-btn gram-arrow-prev"
                aria-label="Scroll left"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => scroll(1)}
                className="gram-arrow-btn gram-arrow-next"
                aria-label="Scroll right"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          ) : null}

          {/* Cards Wrapper */}
          <div
            ref={scrollRef}
            className="gram-scroll-area hide-scrollbar"
            style={{
              display: 'flex',
              overflowX: 'auto',
              overflowY: 'visible',
              width: '100%',
              maxWidth: '100vw',
              minWidth: 0,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              padding: '24px 0 40px',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
            }}
          >
            {!inContainer && <div className="gram-spacer" />}
            {reels.map((photo, i) => (
              <div key={photo.id ?? i} className="gram-card-wrapper">
                <GramCard photo={photo} index={i} />
              </div>
            ))}
            {!inContainer && <div className="gram-spacer" />}
          </div>
        </div>

      </div>
    </section>
  );
}
