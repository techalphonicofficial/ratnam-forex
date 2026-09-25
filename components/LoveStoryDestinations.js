'use client';
import React, { useState } from 'react';

const destinations = [
  { name: 'Bali', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80' },
  { name: 'Thailand', img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80' },
  { name: 'Vietnam', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80' },
  { name: 'Europe', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80' },
  { name: 'Sri Lanka', img: 'https://images.unsplash.com/photo-1539214384055-33c9429737f2?w=400&q=80' },
  { name: 'Bhutan', img: 'https://images.unsplash.com/photo-1582650570535-64d8dbcfb993?w=400&q=80' },
  { name: 'Rajasthan', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=80' },
  { name: 'Andaman', img: 'https://images.unsplash.com/photo-1589552179854-325d762016cd?w=400&q=80' },
  { name: 'Kashmir', img: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=400&q=80' },
  { name: 'Kerala', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80' },
  { name: 'Meghalaya', img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=400&q=80' },
  { name: 'Leh Ladakh', img: 'https://images.unsplash.com/photo-1583506979247-f05256eb918b?w=400&q=80' }
];

export default function LoveStoryDestinations() {
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="love-story-section">
      <div className="container" style={{ maxWidth: '1200px', position: 'relative' }}>
        
        {/* Header */}
        <div className="love-story-header">
          <h2 className="love-story-title">Destinations : Love story to relish</h2>
          <div className="love-story-line"></div>
        </div>

        {/* Grid */}
        <div className={`love-story-grid ${showAll ? 'show-all' : ''}`}>
          {destinations.map((dest, i) => (
            <div className="love-story-item" key={i}>
              <div className="love-story-img-wrap">
                <img src={dest.img} alt={dest.name} />
                <div className="love-story-img-overlay">
                  <span className="love-story-img-text">{dest.name}</span>
                </div>
              </div>
              <h3 className="love-story-name">{dest.name}</h3>
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="love-story-btn-wrapper">
          <button 
            className="love-story-view-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'View Less' : 'View All Tours'}
          </button>
        </div>


        {/* Decorative Graphic placeholder (right side) */}
        <div className="love-story-graphic">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="#D9466F" strokeWidth="1">
            <path d="M10 90 C 40 90, 40 10, 90 10" />
            <circle cx="90" cy="10" r="5" fill="#D9466F" />
            <circle cx="10" cy="90" r="3" fill="#D9466F" />
          </svg>
        </div>
      </div>

      <style>{`
        .love-story-section {
          background-color: #FFF9FA;
          padding: 60px 20px;
          position: relative;
          overflow: hidden;
        }
        .love-story-header {
          margin-bottom: 40px;
          text-align: center;
        }
        .love-story-title {
          color: #D9466F;
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          text-transform: uppercase;
        }
        .love-story-line {
          height: 2px;
          background-color: #D9466F;
          width: 100%;
          margin-top: 8px;
          opacity: 0.6;
        }
        .love-story-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
          row-gap: 40px;
          justify-items: center;
          position: relative;
          z-index: 2;
        }
        .love-story-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .love-story-item:hover {
          transform: translateY(-5px);
        }
        .love-story-img-wrap {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          overflow: hidden;
          position: relative;
          box-shadow: 0 8px 24px rgba(217, 70, 111, 0.15);
          border: 4px solid #fff;
        }
        .love-story-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .love-story-item:hover .love-story-img-wrap img {
          transform: scale(1.1);
        }
        .love-story-img-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .love-story-img-text {
          color: #fff;
          font-family: 'Italiana', serif;
          font-size: 24px;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          letter-spacing: 1px;
        }
        .love-story-name {
          margin-top: 16px;
          font-size: 18px;
          color: #333;
          font-weight: 500;
        }
        .love-story-footer {
          margin-top: 50px;
          text-align: left;
        }
        .love-story-deals {
          color: #D9466F;
          font-size: 22px;
          font-weight: 700;
          margin: 0;
          text-transform: uppercase;
        }
        .love-story-graphic {
          position: absolute;
          bottom: -20px;
          right: -20px;
          opacity: 0.5;
          z-index: 1;
        }
        .love-story-btn-wrapper {
          display: none;
          text-align: center;
          margin-top: 30px;
        }
        .love-story-view-btn {
          background-color: transparent;
          color: #D9466F;
          border: 2px solid #D9466F;
          border-radius: 50px;
          padding: 10px 32px;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
        }
        .love-story-view-btn:hover {
          background-color: #D9466F;
          color: white;
        }
        
        /* Mobile Responsiveness */
        @media (max-width: 991px) {
          .love-story-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .love-story-img-wrap {
            width: 140px;
            height: 140px;
          }
          .love-story-img-text {
            font-size: 20px;
          }
        }
        @media (max-width: 768px) {
          .love-story-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          .love-story-grid:not(.show-all) .love-story-item:nth-child(n+7) {
            display: none;
          }
          .love-story-btn-wrapper {
            display: block;
          }
          .love-story-title {
            font-size: 22px;
          }
          .love-story-deals {
            font-size: 18px;
          }
          .love-story-img-wrap {
            width: 130px;
            height: 130px;
          }
          .love-story-img-text {
            font-size: 18px;
          }
        }
        @media (max-width: 480px) {
          .love-story-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          .love-story-img-wrap {
            width: 110px;
            height: 110px;
          }
          .love-story-name {
            font-size: 15px;
            margin-top: 10px;
          }
          .love-story-img-text {
            font-size: 16px;
          }
        }
      `}</style>
    </section>
  );
}
