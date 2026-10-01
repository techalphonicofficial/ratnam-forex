'use client';
import React, { useState } from 'react';
import Link from 'next/link';



export default function LoveStoryDestinations({ themeClass = '', destinationsData = [], onPick = null }) {
  const [showAll, setShowAll] = useState(false);
  const isFamily = themeClass.includes('teal');
  const isGroup = themeClass.includes('purple');
  const isNri = themeClass.includes('nri');
  const isPilgrim = themeClass.includes('pilgrim') || themeClass.includes('saffron');
  const isBudget = themeClass.includes('budget');
  const isTrending = themeClass.includes('trending');
  const isCorporate = themeClass.includes('corporate');
  const displayDestinations = destinationsData || [];
  const themeColor = isCorporate ? '#1E5AA8' : (isNri ? '#1759A6' : (isGroup ? '#9D4A93' : (isFamily ? '#2F7F7B' : (isPilgrim ? '#E98216' : (isBudget ? '#2E7D32' : (isTrending ? '#D32F2F' : '#D9466F'))))));
  const shadowColor = isCorporate ? 'rgba(30, 90, 168, 0.15)' : (isNri ? 'rgba(23, 89, 166, 0.15)' : (isGroup ? 'rgba(157, 74, 147, 0.15)' : (isFamily ? 'rgba(47, 127, 123, 0.15)' : (isPilgrim ? 'rgba(233, 130, 22, 0.15)' : (isBudget ? 'rgba(46, 125, 50, 0.15)' : (isTrending ? 'rgba(211, 47, 47, 0.15)' : 'rgba(217, 70, 111, 0.15)'))))));

  if (!displayDestinations || displayDestinations.length === 0) return null;

  return (
    <section className={`love-story-section ${isFamily ? 'is-family' : ''} ${themeClass}`}>
      <div className="container" style={{ maxWidth: '1200px', position: 'relative' }}>
        
        {/* Header */}
        <div className="love-story-header">
          <h2 className="love-story-title theme-underline-heading">{isNri ? 'Heritage & Roots' : (isGroup ? 'Group Dreams' : (isFamily ? 'Family Dreams' : (isPilgrim ? 'Spiritual Journeys' : (isBudget ? 'Budget Destinations' : (isTrending ? 'Trending Destinations' : 'Honeymoon Dreams')))))}</h2>
        </div>

        {/* Grid */}
        <div className={`love-story-grid ${showAll ? 'show-all' : ''}`}>
          {displayDestinations.map((dest, i) => {
            const destName = dest.name || dest.slug || '';
            const destImg = dest.image || dest.img || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80';
            
            const cardContent = (
              <div className="love-story-item">
                <div className="love-story-img-wrap">
                  <img src={destImg} alt={destName} />
                  <div className="love-story-img-overlay">
                    <span className="love-story-img-text">{destName}</span>
                  </div>
                </div>
                <h3 className="love-story-name">{destName}</h3>
              </div>
            );

            return (
              <React.Fragment key={i}>
                {onPick ? (
                  <button onClick={() => onPick(destName)} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'inherit' }}>
                    {cardContent}
                  </button>
                ) : (
                  <Link href={`/tour?search=${destName}`} style={{ textDecoration: 'none' }}>
                    {cardContent}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
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
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke={themeColor} strokeWidth="1">
            <path d="M10 90 C 40 90, 40 10, 90 10" />
            <circle cx="90" cy="10" r="5" fill={themeColor} />
            <circle cx="10" cy="90" r="3" fill={themeColor} />
          </svg>
        </div>
      </div>

      <style>{`
        .love-story-section {
          background-color: ${isNri ? '#FFFCF5' : (isGroup ? '#FAF5FA' : (isFamily ? '#FFFDF7' : (isPilgrim ? 'transparent' : (isBudget ? 'transparent' : '#FFF9FA'))))};
          padding: 60px 20px;
          position: relative;
          overflow: hidden;
        }
        .love-story-header {
          margin-bottom: 40px;
          text-align: center;
        }
        .love-story-title {
          color: ${themeColor};
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          text-transform: uppercase;
        }
        .love-story-line {
          height: 2px;
          background-color: ${themeColor};
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
        .love-story-grid:not(.show-all) > *:nth-child(n+9) {
          display: none;
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
          box-shadow: 0 8px 24px ${shadowColor};
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
          color: ${themeColor};
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
          text-align: center;
          margin-top: 30px;
        }
        .love-story-view-btn {
          background-color: transparent;
          color: ${themeColor};
          border: 2px solid ${themeColor};
          border-radius: 50px;
          padding: 10px 32px;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
        }
        .love-story-view-btn:hover {
          background-color: ${themeColor};
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
          .love-story-grid:not(.show-all) > *:nth-child(n+7) {
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
