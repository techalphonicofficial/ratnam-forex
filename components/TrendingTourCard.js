'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMediaUrl } from '@/utils/api';

const formatPriceNumber = (value) => Number(value || 0).toLocaleString('en-IN');

const getTourViewHref = (tour, view = 'itinerary') => {
  if (tour.slug) {
    return `/package/${tour.slug}`;
  }
  const fallback = tour.title ? tour.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'package';
  return `/package/${fallback}`;
};

export default function TrendingTourCard({ tour, className = '', isCorporate = false, isFamily = false, isGroup = false, isNri = false, isPilgrim = false, isBudget = false, isTrending = false }) {
  const router = useRouter();
  const primaryColor = isCorporate ? '#1E5AA8' : (isNri ? '#1759A6' : (isGroup ? '#9D4A93' : (isFamily ? '#2F7F7B' : (isPilgrim ? '#E98216' : (isBudget ? '#2E7D32' : (isTrending ? '#D32F2F' : '#D9466F'))))));
  const btnViewColor = '#C19A6B'; // The brown-ish color from image
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Mock data for display based on screenshot
  const days = tour.duration || '6D';
  const maxPeople = tour.groupSize ? `${tour.groupSize} max` : '12 max';
  const rating = tour.rating || 4.8;
  const reviewsCount = tour.reviews || 0;
  
  const tripHighlights = Array.isArray(tour?.highlights) ? tour.highlights : [];
  const tourIcons = Array.isArray(tour?.icons) ? tour.icons : [];

  return (
    <div 
      className={`ttc-card ${className}`} 
    >
      <style>{`
        .ttc-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid #eaeaea;
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
        }
        .ttc-card:hover {
          border-color: ${primaryColor};
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .ttc-img-wrap {
          position: relative;
          height: 200px;
          width: 100%;
        }
        .ttc-content {
          padding: 20px 16px 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .ttc-loc {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #777;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .ttc-title {
          font-family: Georgia, serif;
          font-size: 18px;
          font-weight: 600;
          color: #222;
          margin: 0 0 10px 0;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .ttc-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          color: #555;
          margin-bottom: 12px;
        }
        .ttc-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ttc-stars {
          display: flex;
          align-items: center;
          gap: 2px;
          color: ${primaryColor};
        }
        .ttc-icons {
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 20px;
          color: ${primaryColor};
        }
        .ttc-icons svg {
          width: 16px;
          height: 16px;
        }
        .ttc-price-label {
          font-size: 9px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .ttc-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .ttc-price {
          font-size: 20px;
          font-weight: 700;
          color: ${primaryColor};
        }
        .popover-container { position: relative; }
        .ttc-price-btn {
          font-size: 10px;
          color: #555;
          border: 1px solid #ddd;
          padding: 4px 8px;
          border-radius: 4px;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .popover-container:hover .ttc-price-btn, .popover-container.popover-open .ttc-price-btn { 
          background: ${primaryColor}; color: white; border-color: ${primaryColor}; 
        }
        .popover-box { 
          position: absolute; bottom: calc(100% + 8px); right: -10px;
          background: white; border-radius: 8px; padding: 16px; 
          box-shadow: 0 10px 25px rgba(0,0,0,0.15); width: max-content; 
          min-width: 220px; max-width: 280px; opacity: 0; visibility: hidden; 
          transition: all 0.2s ease; z-index: 100; pointer-events: none; 
          border: 1px solid #eaeaea; transform: translateY(10px); 
        }
        .popover-container:hover .popover-box, .popover-container.popover-open .popover-box { 
          opacity: 1; visibility: visible; transform: translateY(0); pointer-events: auto; 
        }
        .popover-box::after { 
          content: ''; position: absolute; top: 100%; right: 30px;
          border-width: 8px; border-style: solid; border-color: white transparent transparent transparent; 
        }
        .ttc-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .ttc-btn-action {
          flex: 1;
          padding: 10px;
          border-radius: 6px;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s;
        }
        .ttc-btn-action:hover {
          opacity: 0.9;
        }
        .ttc-btn-view { background: ${btnViewColor}; }
        .ttc-btn-book { background: ${primaryColor}; }
        .ttc-links {
          display: flex;
          justify-content: space-between;
          border-top: 1px dashed #eee;
          padding-top: 12px;
        }
        .ttc-link {
          font-size: 11px;
          color: #555;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s;
        }
        .ttc-link:hover {
          color: ${primaryColor};
        }
      `}</style>

      {/* Image Section */}
      <div className="ttc-img-wrap" onClick={() => router.push(getTourViewHref(tour, 'itinerary'))} style={{ cursor: 'pointer' }}>
        <Image
          src={tour.image ? getMediaUrl(tour.image) : '/images/placeholder.jpg'}
          alt={tour.title || 'Tour'}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* Body Section */}
      <div className="ttc-content">
        <div className="ttc-loc">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {tour.location || tour.country || 'Location'}
        </div>
        
        <h3 className="ttc-title" onClick={() => router.push(getTourViewHref(tour, 'itinerary'))} style={{ cursor: 'pointer' }}>
          {tour.title}
        </h3>
        
        <div className="ttc-meta">
          <div className="ttc-meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            {days}
          </div>
          <div className="ttc-meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            {maxPeople}
          </div>
          <div className="ttc-meta-item">
            <div className="ttc-stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              ))}
            </div>
            <span style={{ marginLeft: '4px' }}>{rating} ({reviewsCount})</span>
          </div>
        </div>

        <div className="ttc-icons" style={{ minHeight: '20px' }}>
          {tourIcons.length > 0 && (
            tourIcons.slice(0, 5).map((iconObj, i) => (
              <i key={i} className={`bi ${iconObj.icon}`} title={iconObj.title || iconObj.description} style={{ fontSize: '16px' }}></i>
            ))
          )}
        </div>

        <div className="ttc-price-label">ALL INCLUSIVE PRICE</div>
        <div className="ttc-price-row">
          <div className="ttc-price">₹{formatPriceNumber(tour.price)}<span style={{ fontSize: '14px' }}> -</span></div>
          <div
            className={`popover-container ${isPopoverOpen ? 'popover-open' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsPopoverOpen(!isPopoverOpen);
            }}
          >
            <button className="ttc-price-btn">Trip Highlights</button>
            <div className="popover-box">
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#333', fontSize: 12 }}>Trip Highlights</div>
              <ul style={{ margin: 0, paddingLeft: 16, color: '#666', fontSize: 12, lineHeight: 1.5, whiteSpace: 'normal', textAlign: 'left', fontWeight: 500 }}>
                {tripHighlights.length > 0 ? (
                  tripHighlights.slice(0, 5).map((hl, i) => <li key={i} style={{ marginBottom: 4 }}>{hl}</li>)
                ) : (
                  <li style={{ listStyle: 'none', marginLeft: -16 }}>No highlights specified yet.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="ttc-actions">
          <button className="ttc-btn-action ttc-btn-view" onClick={() => router.push(getTourViewHref(tour, 'itinerary'))}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            View Tour
          </button>
          <button className="ttc-btn-action ttc-btn-book" onClick={() => router.push(getTourViewHref(tour, 'book'))}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Book Now
          </button>
        </div>

        <div className="ttc-links">
          <a href="#" className="ttc-link" onClick={e => e.preventDefault()}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            Request Callback
          </a>
          <a href="#" className="ttc-link" onClick={e => e.preventDefault()}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Get Itinerary
          </a>
        </div>
      </div>
    </div>
  );
}
