'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getHomePage, getMediaUrl } from '@/utils/api';

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
  const [content, setContent] = useState({
    title: "Why Choose ITS TRAVEL HOLIDAY'S ?",
    stats: fallbackStats,
    features: fallbackFeatures,
    gallery: fallbackGallery,
  });

  useEffect(() => {
    let mounted = true;

    const loadContent = async () => {
      const page = await getHomePage();
      const section = page?.details?.find((item) => item.key === 'why-choose-us-home' || item.section === 'why_choose_us');
      const data = section?.json_data || {};

      if (!mounted || !section) return;

      setContent({
        title: section.title || "Why Choose ITS TRAVEL HOLIDAY'S",
        stats: data.stats?.length
          ? data.stats.map((item, index) => ({
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
    };

    loadContent();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section style={{ background: 'var(--color-bg)', padding: '52px 0 56px' }}>
      <style>{`
        .why-choose-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .stats-grid {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 32px;
        }
        .image-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 1024px) {
          .why-choose-grid {
            grid-template-columns: 1fr;
            gap: 48px;
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
        }
      `}</style>

      <div className="container">
        <div className="why-choose-grid">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--color-accent)', margin: '0 0 8px' }}>OUR TRACK RECORD</p>
              <h2 className="section-title" style={{ fontFamily: '"Italiana", sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--color-text-primary)', lineHeight: 1.2, margin: '0 0 28px' }}>
                {content.title}
              </h2>
            </div>

            <div className="stats-grid">
              {content.stats.map(({ number, label, icon }) => (
                <div key={`${number}-${label}`} style={{ textAlign: 'center', padding: '18px 24px', background: 'var(--color-primary-light)', borderRadius: 14, border: '1px solid var(--brand-primary-border)', minWidth: '180px' }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontFamily: '"Italiana", sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--color-primary)', lineHeight: 1 }}>{number}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 5, whiteSpace: 'pre-line', lineHeight: 1.4 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 32, maxWidth: '300px' }}>
              {content.features.map(({ icon, title, desc }) => (
                <div key={title} style={{ display: 'flex', gap: 14, textAlign: 'left', alignItems: 'center' }}>
                  <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, background: 'var(--color-primary-light)', border: '1px solid var(--brand-primary-border)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/tours"
              className="btn-primary"
              style={{ width: 'fit-content' }}
            >
              Plan Your Holiday Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
          </div>

          <div className="image-grid">
            {content.gallery.map(({ src, span, label }, i) => (
              <div
                key={`${src}-${i}`}
                style={{ gridColumn: span ? '1 / -1' : undefined, height: span ? 195 : 150, borderRadius: 14, overflow: 'hidden', position: 'relative', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}
              >
                <img src={src} alt={label || 'Travel gallery'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                {label && (
                  <div style={{ position: 'absolute', bottom: 8, left: 10, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', color: 'white', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                    {label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
