'use client';

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

export default function TrendingTourCard({ tour, className = '' }) {
  const router = useRouter();
  

  return (
    <div 
      className={`trending-tour-card ${className}`} 
      onClick={() => router.push(getTourViewHref(tour, 'itinerary'))}
    >
      <style>{`
        .trending-tour-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #eaeaea;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .trending-tour-card:hover {
          box-shadow: 0 12px 24px rgba(0,0,0,0.08);
          transform: translateY(-4px);
        }
        .ttc-image-wrap {
          position: relative;
          height: 200px;
          width: 100%;
        }
        .ttc-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .ttc-title {
          font-size: 16px;
          font-weight: 700;
          color: #222;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }
        .ttc-location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #666;
          margin-bottom: 12px;
        }
        .ttc-badge {
          display: inline-block;
          background: #fdf2f8;
          color: #db2777;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 12px;
          text-transform: uppercase;
          margin-bottom: auto;
          align-self: flex-start;
        }
        .ttc-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 16px;
          border-top: 1px solid #f0f0f0;
          padding-top: 12px;
        }
        .ttc-price-wrap {
          display: flex;
          flex-direction: column;
        }
        .ttc-price {
          font-size: 20px;
          font-weight: 800;
          color: #111;
        }
        .ttc-price-meta {
          font-size: 11px;
          color: #888;
        }
        .ttc-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          transition: background 0.2s;
        }
        .trending-tour-card:hover .ttc-btn {
          background: #059669;
        }
      `}</style>

      {/* Image Section */}
      <div className="ttc-image-wrap">
        <Image
          src={tour.image ? getMediaUrl(tour.image) : '/images/kedarnath_banner.png'}
          alt={tour.title || 'Tour'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* Body Section */}
      <div className="ttc-body">
        <h3 className="ttc-title">{tour.title}</h3>
        
        <div className="ttc-location">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span className="line-clamp-1" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {tour.location || (tour.country || 'Multiple locations')}
          </span>
        </div>

        <span className="ttc-badge">
          {(tour.category || tour.type || 'PACKAGE').replace(/package/i, '').trim() || 'PACKAGE'}
        </span>

        <div className="ttc-footer">
          <div className="ttc-price-wrap">
            <span className="ttc-price">₹{formatPriceNumber(tour.price)}</span>
            <span className="ttc-price-meta">{tour.duration ? `${tour.duration} nights / person` : 'per person'}</span>
          </div>
          <button className="ttc-btn">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
