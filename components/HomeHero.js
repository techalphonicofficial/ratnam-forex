'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { getHomePage, getMediaUrl, searchCountryCityLocations } from '@/utils/api';

const getHomeSection = (page, key, section) => {
  return page?.details?.find((item) => item.key === key || item.section === section);
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
  const searchWrapRef = useRef(null);
  const [destination, setDestination] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [heroHeight, setHeroHeight] = useState('100vh');
  const [isMobile, setIsMobile] = useState(false);
  const [heroImages, setHeroImages] = useState([]);


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
        setHeroHeight('99vh');
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

        const sliderBlock = getHomeSection(page, 'hero-slider', 'hero-slider');
        const legacyHeader = getHomeSection(page, 'header_key', 'image_text') || getHomeSection(page, 'header_key', 'story_grid');

        let fetchedImages = [];
        if (sliderBlock?.json_data?.images && Array.isArray(sliderBlock.json_data.images)) {
          fetchedImages = sliderBlock.json_data.images;
        } else if (sliderBlock?.images && Array.isArray(sliderBlock.images)) {
          fetchedImages = sliderBlock.images;
        } else if (legacyHeader?.json_data?.images && Array.isArray(legacyHeader.json_data.images)) {
          fetchedImages = legacyHeader.json_data.images;
        } else if (legacyHeader?.json_data?.gallery && Array.isArray(legacyHeader.json_data.gallery)) {
          fetchedImages = legacyHeader.json_data.gallery;
        }

        // Map them to ensure they have the 'image' property
        fetchedImages = fetchedImages.map(item => ({
          image: item.image || item.img,
          alt: item.alt || 'Travel destination'
        })).filter(item => item.image);

        if (fetchedImages.length > 0) {
          setHeroImages(fetchedImages);
        } else {
          // Fallback image (if none available)
          const fallbackMediaUrl = getMediaUrl(legacyHeader?.image || page?.feature_image);
          if (fallbackMediaUrl) {
            setHeroImages([{ image: fallbackMediaUrl, alt: 'Travel destination' }]);
          } else {
            setHeroImages([{ image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=80', alt: 'Fallback Hero' }]);
          }
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

  return (
    <section>
      {/* FULL-SCREEN HERO */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: heroHeight,
          minHeight: 620,
          overflow: 'hidden',
          background: 'var(--color-text-primary)',
        }}
      >
        {/* CAROUSEL background */}
        {heroImages.length > 0 && (
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={heroImages.length > 1}
            speed={1000}
            slidesPerView={1}
            allowTouchMove={true}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
          >
            {heroImages.map((imgData, index) => (
              <SwiperSlide key={index}>
                <Image
                  src={getMediaUrl(imgData.image) || imgData.image}
                  alt={imgData.alt || 'Travel destination'}
                  fill
                  priority={index === 0}
                  style={{ objectFit: 'cover' }}
                  sizes="100vw"
                  onError={(e) => {
                    const fallbackUrls = [
                      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=80',
                      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1920&q=80',
                      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=80'
                    ];
                    e.currentTarget.src = fallbackUrls[index % fallbackUrls.length];
                    e.currentTarget.srcset = '';
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Dark gradient overlay */}
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.32) 48%, rgba(0, 0, 0,0.92) 100%)',
          }}
        />



        {/* Hero content - search bar shifted to bottom */}
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 4,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'flex-end',
            textAlign: 'center', padding: isMobile ? '0 16px 40px' : '0 16px 20px',
          }}
        >
          {/* Green-border search bar */}
          <div ref={searchWrapRef} style={{ width: '100%', maxWidth: isMobile ? 340 : 600, position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'stretch',
                background: 'rgba(255,255,255,0.97)',
                border: '2.5px solid white',
                borderRadius: 999,
                overflow: 'hidden',
                boxShadow: '0 0 0 5px rgba(255,255,255,0.18), 0 12px 40px rgba(0,0,0,0.45)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, padding: isMobile ? '0 8px 0 16px' : '0 10px 0 20px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" width="20" height="20">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search countries, cities, Tour Packages"
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
                  fontSize: isMobile ? 15 : 16, color: 'var(--color-text-primary)',
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
                  fontFamily: '"Italiana", sans-serif',
                  borderRadius: '0 999px 999px 0',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--color-primary-hover)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 6px 20px color-mix(in srgb, var(--color-primary) 30%, transparent)';
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
                  bottom: 'calc(100% + 10px)',
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-xl)',
                  background: 'rgba(255,255,255,0.98)',
                  border: '1px solid rgba(15,23,42,0.12)',
                  boxShadow: '0 18px 44px rgba(15,23,42,0.28)',
                  textAlign: 'left',
                }}
              >
                {locationLoading ? (
                  <div
                    style={{
                      padding: 'var(--space-4) var(--space-5)',
                      color: 'var(--color-text-muted)',
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
                          gap: 'var(--space-3)',
                          border: 'none',
                          borderBottom: index === locationSuggestions.length - 1 ? 'none' : '1px solid var(--color-border)',
                          background: 'transparent',
                          minHeight: isMobile ? 54 : 62,
                          padding: isMobile ? '13px 14px' : '14px 18px',
                          cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.background = 'var(--color-bg-soft)';
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span style={{ minWidth: 0 }}>
                          <span
                            style={{
                              display: 'block',
                              color: 'var(--color-text-primary)',
                              fontSize: isMobile ? 14 : 15,
                              fontWeight: 800,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {getLocationLabel(location)}
                          </span>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600 }}>
                            {getLocationMeta(location)}
                          </span>
                        </span>
                        <span
                          style={{
                            flex: '0 0 auto',
                            borderRadius: 999,
                            padding: 'var(--space-1) var(--space-3)',
                            background: location.type === 'country' ? 'var(--color-secondary-hover)' : 'var(--color-primary-light)',
                            color: location.type === 'country' ? 'var(--color-secondary)' : 'var(--color-primary)',
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
