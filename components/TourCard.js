'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import StarRating from './StarRating';
import { useWishlist } from './WishlistProvider';
import { getMediaUrl } from '@/utils/api';

const formatPriceNumber = (value) => Number(value || 0).toLocaleString('en-IN');

const getTourViewHref = (tour, view = 'itinerary') => {
  if (tour.slug) {
    return `/package/${tour.slug}`;
  }
  
  const fallback = tour.title ? tour.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'package';
  return `/package/${fallback}`;
};

export default function TourCard({ tour, className = '' }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlistItem = {
    id: tour.slug || tour.id || tour.title,
    type: 'tour',
    title: tour.title,
    location: tour.location,
    image: tour.image,
    price: tour.price,
    href: getTourViewHref(tour),
    slug: tour.slug,
    duration: tour.duration ? `${tour.duration}D` : '',
    badge: tour.type,
  };
  const wishlisted = isWishlisted(wishlistItem);
  const discount = tour.originalPrice
    ? Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)
    : 0;
  
  const tripHighlights = Array.isArray(tour?.highlights) ? tour.highlights : [];
  const tourIncludes = Array.isArray(tour?.inclusions) ? tour.inclusions : [];
  const router = useRouter();

  return (
    <div className={`tour-card ${className}`} onClick={() => router.push(getTourViewHref(tour, 'itinerary'))} style={{ cursor: 'pointer' }}>
      <style>{`
        .popover-container { position: relative; }
        .popover-trigger { cursor: pointer; color: #333; padding: 2px 8px; border-radius: 4px; transition: all 0.2s; }
        .popover-container:hover .popover-trigger { background: #e11d48; color: white; }
        .popover-box { position: absolute; bottom: calc(100% + 8px); background: white; border-radius: 8px; padding: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); width: max-content; min-width: 220px; max-width: 280px; opacity: 0; visibility: hidden; transition: all 0.2s ease; z-index: 100; pointer-events: none; border: 1px solid #eaeaea; }
        .popover-box.align-left { left: 0; transform: translateY(10px); }
        .popover-box.align-right { right: -10px; transform: translateY(10px); }
        .popover-container:hover .popover-box { opacity: 1; visibility: visible; transform: translateY(0); pointer-events: auto; }
        .popover-box::after { content: ''; position: absolute; top: 100%; border-width: 8px; border-style: solid; border-color: white transparent transparent transparent; }
        .popover-box.align-left::after { left: 24px; }
        .popover-box.align-right::after { right: 30px; }
      `}</style>
      {/* Image */}
      <div className="tour-card-image-wrap" style={{ position: 'relative' }}>
        <Image
          src={tour.image ? getMediaUrl(tour.image) : '/images/kedarnath_banner.png'}
          alt={tour.title || 'Tour'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoH7AQsBAsNCwsKCwsNCxAQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAApAFADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUH/8QAIRAAAQQCAgMBAAAAAAAAAAAAAQIDBAUREiExQWH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A0Tj2R2PaDRt9GpPk1kd8l2hq7c8JHEcTwqOiqCAioqCKqiKQB0fOdQiSmR2e0l2G7AAAAAAB/9k="
        />
        <div className="tour-card-overlay" />

        {/* Badges */}
        <div className="tour-card-badges">
          <span className="badge" style={{ background: 'var(--color-primary)', color: 'white', fontSize: 11 }}>
            {tour.type}
          </span>
          {discount > 0 && (
            <span className="badge" style={{ background: 'var(--color-secondary)', color: 'white', fontSize: 11 }}>
              -{discount}%
            </span>
          )}
          {tour.trending && (
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 11, backdropFilter: 'blur(8px)' }}>
              🔥 Hot
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          className="tour-card-wishlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(wishlistItem);
          }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wishlisted}
          style={{ color: 'white', background: wishlisted ? 'var(--color-secondary)' : 'rgba(255,255,255,0.2)' }}
        >
          <svg viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

      </div>

      {/* Body */}
      <div className="tour-card-body">
        <div className="tour-card-location">
          <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          {tour.location}
        </div>

        <h3 className="tour-card-title line-clamp-2 anonymous-pro-bold" style={{ fontSize: '14px', marginBottom: '8px' }}>{tour.title}</h3>

        {/* Meta */}
        <div className="tour-card-meta" style={{ gap: '8px', marginBottom: '8px' }}>
          <div className="tour-card-meta-item" style={{ fontSize: '11px' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12" style={{ color: 'var(--color-text-muted)' }}>
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
            </svg>
            {tour.duration}D
          </div>
          <div className="tour-card-meta-item" style={{ fontSize: '11px' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12" style={{ color: 'var(--color-text-muted)' }}>
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
            {tour.groupSize} max
          </div>
          <div className="tour-card-meta-item" style={{ fontSize: '11px' }}>
            <StarRating rating={tour.rating} size={11} />
            <span style={{ fontWeight: 600, fontSize: 11, color: 'var(--color-text-primary)' }}>{tour.rating}</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>({tour.reviews})</span>
          </div>
        </div>

        <div className="tour-card-footer" style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', flexDirection: 'column', gap: 12, alignItems: 'stretch' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '-4px' }}>
            <div style={{ display: 'flex', gap: '8px', color: '#333' }}>
              <span>{tour.duration}D</span>
              <span>{tour.groupSize} max</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 700, paddingBottom: '6px', borderBottom: '1px solid var(--color-border)', marginBottom: '-4px' }}>
            <div className="popover-container" onClick={(e) => e.stopPropagation()}>
              <span className="popover-trigger">Tour Includes</span>
              <div className="popover-box align-left">
                <div style={{ fontWeight: 700, marginBottom: 8, color: '#333', fontSize: 12 }}>Tour Includes</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', whiteSpace: 'normal', textAlign: 'left' }}>
                  {tourIncludes.length > 0 ? tourIncludes.slice(0, 6).map((inc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#013567" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      <span>{inc}</span>
                    </div>
                  )) : (
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 500 }}>No inclusions specified.</div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', color: '#013567' }}>
              {tourIncludes.slice(0, 4).map((inc, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', paddingBottom: 4 }}>
            <div>
              <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>All inclusive price</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#b98c56' }}>₹{formatPriceNumber(tour.price)}</span>
                <span style={{ fontSize: 12, color: '#b98c56', fontWeight: 600 }}>*</span>
              </div>
            </div>

            <div className="popover-container" style={{ paddingBottom: 2 }} onClick={(e) => e.stopPropagation()}>
              <span className="popover-trigger" style={{ border: '1px solid #b98c56', color: '#b98c56', borderRadius: 4, padding: '4px 8px', fontSize: 10, fontWeight: 700 }}>Trip Highlights</span>
              <div className="popover-box align-right">
                <div style={{ fontWeight: 700, marginBottom: 8, color: '#333', fontSize: 12 }}>Trip Highlights</div>
                <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--color-text-muted)', fontSize: 12, lineHeight: 1.5, whiteSpace: 'normal', textAlign: 'left', fontWeight: 500 }}>
                  {tripHighlights.length > 0 ? (
                    tripHighlights.slice(0, 5).map((hl, i) => <li key={i} style={{ marginBottom: 4 }}>{hl}</li>)
                  ) : (
                    <li style={{ listStyle: 'none', marginLeft: -16 }}>No highlights specified yet.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <Link href={getTourViewHref(tour, 'itinerary')} onClick={(e) => e.stopPropagation()} style={{ flex: 1, textAlign: 'center', padding: '8px 0', background: '#b98c56', color: 'white', borderRadius: 6, fontWeight: 600, fontSize: 12, textDecoration: 'none' }}>
              View Tour
            </Link>
            <Link href={getTourViewHref(tour, 'itinerary') + '#booking-sidebar'} onClick={(e) => e.stopPropagation()} style={{ flex: 1, textAlign: 'center', padding: '8px 0', background: '#ff6600', color: 'white', borderRadius: 6, fontWeight: 600, fontSize: 12, textDecoration: 'none' }}>
              Book Now
            </Link>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--color-border)', paddingTop: 10, width: '100%' }}>
            <a href={`https://wa.me/919876543210?text=${encodeURIComponent('I am interested in ' + tour.title)}`} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-primary)', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Request Callback
            </a>
            <Link href={getTourViewHref(tour, 'itinerary')} onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-primary)', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#888' }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              Get Itinerary
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
