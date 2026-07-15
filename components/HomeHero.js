'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getHomePage, getMediaUrl, searchCountryCityLocations } from '@/utils/api';

/*
  CORS-safe video sources from Google's public CDN
  With beautiful travel poster images shown instantly while video loads
*/
const VIDEO_SOURCES = [
  {
    src: 'https://res.cloudinary.com/demo/video/upload/q_auto,f_auto/elephants.mp4',
    poster: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&q=85',
  },
  {
    src: 'https://res.cloudinary.com/demo/video/upload/q_auto,f_auto/sea_turtle.mp4',
    poster: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=85',
  },
  {
    src: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    poster: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=85',
  },
  {
    src: 'https://www.w3schools.com/html/mov_bbb.mp4',
    poster: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1920&q=85',
  },
];

const getHomeSection = (page, key, section) => {
  return page?.details?.find((item) => item.key === key || item.section === section);
};

const getVideoType = (src) => {
  return src?.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4';
};

const getLocationLabel = (location) => {
  return location?.label || [location?.name, location?.country_name].filter(Boolean).join(', ') || '';
};

const getLocationMeta = (location) => {
  if (location?.type === 'country') return 'Country';
  return location?.country_name || 'City';
};

export default function HomeHero() {
  const router = useRouter();
  const videoRef = useRef(null);
  const searchWrapRef = useRef(null);
  const [vidIdx, setVidIdx] = useState(0);
  const [destination, setDestination] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [heroHeight, setHeroHeight] = useState('100vh');
  const [isMobile, setIsMobile] = useState(false);
  const [headline, setHeadline] = useState('CREATE YOUR SOOPER HIT HOLIDAY');
  const [videos, setVideos] = useState(VIDEO_SOURCES);

  /* Handle dynamic hero height for responsive devices */
  useEffect(() => {
    const updateHeight = () => {
      const w = window.innerWidth;
      setIsMobile(w <= 767);
      if (w <= 767) {         // Mobile
        setHeroHeight('100svh');
      } else if (w <= 1024) {  // Tablet
        setHeroHeight('100vh');
      } else {                // Desktop
        setHeroHeight('100vh');
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadHomeHero = async () => {
      try {
        const page = await getHomePage();
        if (!mounted) return;

        const header = getHomeSection(page, 'header_key', 'image_text');
        const mediaUrl = getMediaUrl(header?.json_data?.media_url || header?.image);

        if (header?.title) {
          setHeadline(header.title);
        }

        if (mediaUrl) {
          setVideos([{ src: mediaUrl, poster: getMediaUrl(page?.feature_image) || VIDEO_SOURCES[0].poster }]);
          setVidIdx(0);
        }
      } catch (error) {
        console.warn('Home hero API load failed:', error);
      }
    };

    loadHomeHero();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!searchWrapRef.current?.contains(event.target)) {
        setLocationOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    const query = destination.trim();

    if (selectedLocation && query === getLocationLabel(selectedLocation)) {
      return;
    }

    if (query.length < 2) {
      return;
    }

    let active = true;
    const debounceTimer = setTimeout(async () => {
      const result = await searchCountryCityLocations({ search: query, limit: 20 });

      if (!active) return;

      setLocationSuggestions(result.suggestions || []);
      setLocationLoading(false);
      setLocationOpen(true);
    }, 350);

    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [destination, selectedLocation]);

  /* When video ends → advance to next */
  const handleEnded = useCallback(() => {
    setVidIdx(i => (i + 1) % videos.length);
  }, [videos.length]);

  /* Reload video element when source changes */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    const p = v.play();
    if (p) p.catch(() => { });
  }, [vidIdx, videos]);

  const getSearchValue = (location = selectedLocation) => {
    return (location?.name || destination).trim();
  };

  const handleSearch = (location) => {
    const searchValue = getSearchValue(location);

    if (searchValue) {
      router.push(`/tour?search=${encodeURIComponent(searchValue)}`);
    } else {
      router.push('/tours');
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setDestination(getLocationLabel(location));
    setLocationSuggestions([]);
    setLocationLoading(false);
    setLocationOpen(false);
  };

  const { src, poster } = videos[vidIdx] || VIDEO_SOURCES[0];

  return (
    <section>
      {/* FULL-SCREEN VIDEO HERO */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: heroHeight,
          minHeight: 620,
          overflow: 'hidden',
          background: '#041a0c',
        }}
      >
        {/* VIDEO background */}
        <video
          ref={videoRef}
          key={src}
          autoPlay
          loop
          muted={isVideoMuted}
          playsInline
          onEnded={handleEnded}
          poster={poster}
          preload="auto"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', zIndex: 0,
          }}
        >
          <source src={src} type={getVideoType(src)} />
        </video>

        {/* Dark gradient overlay */}
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.32) 48%, rgba(4,26,12,0.92) 100%)',
          }}
        />

        {/* Skip video button */}
        <button
          onClick={() => setVidIdx(i => (i + 1) % videos.length)}
          title="Next video"
          aria-label="Switch to next video"
          style={{
            position: 'absolute', bottom: 30, right: 20, zIndex: 5,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.22)', borderRadius: '50%',
            width: 38, height: 38, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: 'white',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--brand-primary)';
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(46,74,59,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>

        {/* Mute/Unmute video button */}
        <button
          type="button"
          onClick={() => setIsVideoMuted((muted) => !muted)}
          title={isVideoMuted ? 'Unmute video' : 'Mute video'}
          aria-label={isVideoMuted ? 'Unmute video' : 'Mute video'}
          aria-pressed={!isVideoMuted}
          style={{
            position: 'absolute',
            bottom: 30,
            left: 20,
            zIndex: 5,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: '50%',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
        >
          {isVideoMuted ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              <path d="m22 9-6 6" />
              <path d="m16 9 6 6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              <path d="M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
          )}
        </button>

        {/* Centered hero content */}
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 4,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '0 16px',
          }}
        >
          {/* Google review badge */}
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999,
              padding: '7px 20px', marginBottom: 22,
            }}
          >
            <svg viewBox="0 0 48 48" width="16" height="16">
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.2 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" />
              <path fill="#FBBC05" d="M24 46c5.4 0 10.5-1.8 14.4-4.9l-6.7-5.5C29.6 37.6 26.9 38.5 24 38.5c-6 0-10.5-3.8-12.2-8.9l-7.1 5.5C8.8 42.2 15.8 46 24 46z" />
              <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.6 2.8-2.2 5.2-4.5 6.8l6.7 5.5C42.4 37.2 45 31 45 24c0-1.3-.2-2.7-.5-4z" />
            </svg>
            <span style={{ color: '#fbbf24', fontSize: 14, fontWeight: 700 }}>★ 4.6</span>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>From 8,250 reviews</span>
          </div>

          {/* Main headline */}
          <h1
            style={{
              fontFamily: 'Poppins, sans-serif', fontWeight: 900,
              fontSize: 'clamp(24px, 3.8vw, 52px)', color: 'white',
              margin: '0 0 30px', lineHeight: 1.1,
              textTransform: 'uppercase', letterSpacing: 2,
              textShadow: '0 3px 28px rgba(0,0,0,0.55)',
              maxWidth: '860px'
            }}
          >
            {headline}
          </h1>

          {/* Green-border search bar */}
          <div ref={searchWrapRef} style={{ width: '100%', maxWidth: isMobile ? 340 : 600, position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'stretch',
                background: 'rgba(255,255,255,0.97)',
                border: '2.5px solid var(--color-secondary)',
                borderRadius: 999,
                overflow: 'hidden',
                boxShadow: '0 0 0 5px rgba(253, 206, 46, 0.18), 0 12px 40px rgba(0,0,0,0.45)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, padding: isMobile ? '0 8px 0 16px' : '0 10px 0 20px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" width="20" height="20">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search countries, cities"
                value={destination}
                onChange={(event) => {
                  const nextDestination = event.target.value;
                  setDestination(nextDestination);
                  setSelectedLocation(null);

                  if (nextDestination.trim().length < 2) {
                    setLocationSuggestions([]);
                    setLocationLoading(false);
                    setLocationOpen(false);
                  } else {
                    setLocationLoading(true);
                    setLocationOpen(true);
                  }
                }}
                onFocus={() => {
                  if (destination.trim().length >= 2) {
                    setLocationOpen(true);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    if (locationOpen && locationSuggestions[0]) {
                      handleSearch(locationSuggestions[0]);
                      return;
                    }
                    handleSearch();
                  }
                }}
                style={{
                  flex: '1 1 auto', minWidth: 0,
                  border: 'none', outline: 'none',
                  fontSize: isMobile ? 15 : 16, color: '#111827',
                  padding: isMobile ? '14px 6px' : '12px 8px',
                  background: 'transparent',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  background: 'var(--color-primary)', color: 'white',
                  border: 'none', padding: isMobile ? '0 18px' : '0 28px',
                  flex: '0 0 auto', minWidth: isMobile ? 84 : 106,
                  whiteSpace: 'nowrap',
                  fontWeight: 700, fontSize: isMobile ? 14 : 15, cursor: 'pointer',
                  letterSpacing: 0.3, transition: 'all 0.2s ease',
                  fontFamily: 'Poppins, sans-serif',
                  borderRadius: '0 999px 999px 0',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--color-primary-hover)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,74,59,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--color-primary)';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Search
              </button>
            </div>
            {locationOpen && (locationLoading || locationSuggestions.length > 0) && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  overflow: 'hidden',
                  borderRadius: 18,
                  background: 'rgba(255,255,255,0.98)',
                  border: '1px solid rgba(15,23,42,0.12)',
                  boxShadow: '0 18px 44px rgba(15,23,42,0.28)',
                  textAlign: 'left',
                }}
              >
                {locationLoading ? (
                  <div
                    style={{
                      padding: '16px 18px',
                      color: '#64748b',
                      fontSize: 14,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Searching destinations...
                  </div>
                ) : (
                  <div
                    style={{
                      maxHeight: isMobile ? 272 : 310,
                      overflowY: 'auto',
                      overscrollBehavior: 'contain',
                    }}
                  >
                    {locationSuggestions.map((location, index) => (
                      <button
                        key={`${location.type || 'location'}-${location.id}-${getLocationLabel(location)}`}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleLocationSelect(location)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          border: 'none',
                          borderBottom: index === locationSuggestions.length - 1 ? 'none' : '1px solid rgba(226,232,240,0.9)',
                          background: 'transparent',
                          minHeight: isMobile ? 54 : 62,
                          padding: isMobile ? '13px 14px' : '14px 18px',
                          cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span style={{ minWidth: 0 }}>
                          <span
                            style={{
                              display: 'block',
                              color: '#0f172a',
                              fontSize: isMobile ? 14 : 15,
                              fontWeight: 800,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {getLocationLabel(location)}
                          </span>
                          <span style={{ color: '#64748b', fontSize: 12, fontWeight: 600 }}>
                            {getLocationMeta(location)}
                          </span>
                        </span>
                        <span
                          style={{
                            flex: '0 0 auto',
                            borderRadius: 999,
                            padding: '5px 10px',
                            background: location.type === 'country' ? '#e0f2fe' : '#dcfce7',
                            color: location.type === 'country' ? '#0369a1' : '#15803d',
                            fontSize: 11,
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: 0.4,
                          }}
                        >
                          {location.type || 'city'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
