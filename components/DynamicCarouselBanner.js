'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import { getHomePage, getMediaUrl } from '@/utils/api';

export default function DynamicCarouselBanner() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchSection = async () => {
      const page = await getHomePage();
      if (!page || !mounted) return;
      
      const section = page?.details?.find((item) => item.key === 'carousel_key' || item.section === 'team_grid');
      if (section && section.json_data) {
        setData(section);
      }
    };
    fetchSection();
    return () => { mounted = false; };
  }, []);

  if (!data || !data.json_data || !data.json_data.team || data.json_data.team.length === 0) {
    return null; // Don't render anything if no data
  }

  const { json_data } = data;
  const team = json_data.team.filter(t => t.img); // Only items with images
  
  if (team.length === 0) return null;

  return (
    <section style={{ padding: '16px 0 32px', background: 'white' }}>
      <div className="container" style={{ margin: '0 auto', padding: '0 24px' }}>
        <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', height: 'clamp(180px, 28vw, 300px)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <Swiper
            modules={[Autoplay, EffectFade, Pagination]}
            effect="fade"
            loop={team.length > 1}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true, bulletClass: 'swiper-pagination-bullet bg-white' }}
            style={{ width: '100%', height: '100%' }}
          >
            {team.map((slide, index) => (
              <SwiperSlide key={index} style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image
                  src={getMediaUrl(slide.img)}
                  alt={slide.name || 'Banner image'}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority={index === 0}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)',
                  pointerEvents: 'none'
                }}></div>
                
                {/* Content Overlay */}
                <div style={{ position: 'absolute', inset: 0, padding: 'clamp(20px, 4vw, 40px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 10 }}>
                  
                  {/* Top Left Heading */}
                  <div>
                    {json_data.heading_content && (
                      <span style={{
                        display: 'inline-block',
                        background: 'transparent',
                        color: 'var(--color-primary, #e11d48)',
                        padding: '0',
                        fontWeight: 700,
                        fontSize: 18,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        textShadow: '0 2px 8px rgba(255,255,255,0.3)',
                      }}>
                        {json_data.heading_content}
                      </span>
                    )}
                  </div>

                  {/* Bottom Left Text */}
                  {(slide.name || slide.role || slide.bio) && (
                    <div style={{
                      background: 'rgba(0,0,0,0.55)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      padding: '10px 24px',
                      borderRadius: 999,
                      display: 'inline-block',
                      maxWidth: 'max-content',
                    }}>
                      <span style={{ fontWeight: 600, fontSize: 'clamp(14px, 2vw, 15px)' }}>
                        {slide.bio || slide.role || slide.name || "Your dedicated travel expert is always reachable."}
                      </span>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
