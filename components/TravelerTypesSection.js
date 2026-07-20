'use client';
import { useState, useEffect, useRef } from 'react';
import { getHomeCategories, getMediaUrl } from '@/utils/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import Link from 'next/link';
import CategoryCard, { getFallbackCategoryImage } from './CategoryCard';

export default function TravelerTypesSection() {
  const travellerRowRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTraveler, setActiveTraveler] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    // Initialize on mount
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadCategories() {
      try {
        const data = await getHomeCategories();
        if (!mounted) return;
        if (data?.length) {
          setCategories(
            data
              .slice()
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              .map((cat, idx) => ({
                id: cat.id || cat.slug || cat.name?.toLowerCase(),
                label: cat.name,
                image: getMediaUrl(cat.feature_image) || getFallbackCategoryImage(cat.name),
                alt: cat.feature_image_alt || cat.name,
              }))
          );
        }
      } catch (err) {
        console.error('Error loading traveler types:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return null;
  if (categories.length === 0) return null;

  return (
    <section
      style={{
        position: 'relative',
        padding: '80px 0 84px',
        background: 'var(--color-bg)',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .sec-traveller-marquee-wrapper {
          width: 100%;
          position: relative;
        }
        .sec-traveller-swiper {
          overflow: visible !important;
          padding-bottom: 20px !important;
        }
      `}</style>

      <div className="container" style={{ margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2.2,
            textTransform: 'uppercase',
            color: "var(--color-primary)",
            display: 'block',
            marginBottom: 8
          }}>
            Design Your Dream Trip
          </span>
          <h2 style={{
            fontFamily: '"Italiana", sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(24px, 3vw, 36px)',
            color: 'var(--color-text-primary)',
            margin: '0 0 12px',
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            Who is traveling with you?
          </h2>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: 15,
            maxWidth: 580,
            margin: '0 auto'
          }}>
            Select your travel companionship to view itineraries custom-crafted for your vibe.
          </p>
        </div>

        {/* Scroll row wrapper */}
        <div className="sec-traveller-marquee-wrapper">
          <Swiper
            modules={[Autoplay]}
            loop={isMobile}
            speed={500}
            autoplay={isMobile ? { delay: 2000, disableOnInteraction: false } : false}
            breakpoints={{
              320: { slidesPerView: 2, spaceBetween: 16 },
              768: { slidesPerView: 3, spaceBetween: 24 },
              1024: { slidesPerView: 5, spaceBetween: 28 },
            }}
            centerInsufficientSlides={true}
            className="sec-traveller-swiper"
          >
            {categories.map(({ id, label, image, alt }, index) => (
              <SwiperSlide key={id} style={{ display: 'flex', justifyContent: 'center', height: 'auto' }}>
                <CategoryCard
                  id={id}
                  label={label}
                  image={image}
                  alt={alt}
                  isActive={activeTraveler === id}
                  onMouseEnter={() => setActiveTraveler(id)}
                  onFocus={() => setActiveTraveler(id)}
                  onMouseLeave={() => setActiveTraveler(null)}
                  onBlur={() => setActiveTraveler(null)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        
        {/* View More Button */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/categories" className="btn-primary" style={{ display: 'inline-block', width: 'auto', minWidth: '160px', padding: '12px 32px' }}>
            View More
          </Link>
        </div>
      </div>
    </section>
  );
}
