'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

const KASHMIR_STOPS = [
  {
    num: 1,
    dayLabel: 'Day 1 - 2',
    name: 'Srinagar',
    targetDay: 1,
    badgeText: 'Dal Lake, Mughal Gardens & Shikara Rides',
    bullets: [
      { icon: 'pin', text: 'Dal Lake, Mughal Gardens' },
      { icon: 'home', text: 'Shikara Ride & Local Markets' },
    ],
    // Coordinates on landscape map
    left: '14%',
    top: '67%',
  },
  {
    num: 2,
    dayLabel: 'Day 3',
    name: 'Gulmarg',
    targetDay: 3,
    badgeText: 'Snowy Meadows & Gondola Views',
    bullets: [
      { icon: 'mountain', text: 'Gondola Ride (Phase I)' },
      { icon: 'snow', text: 'Snow Activities & Views' },
    ],
    left: '37%',
    top: '30%',
  },
  {
    num: 3,
    dayLabel: 'Day 4 - 5',
    name: 'Pahalgam',
    targetDay: 4,
    badgeText: 'Lush Valleys & Lidder River',
    bullets: [
      { icon: 'trees', text: 'Betaab Valley & Aru Valley' },
      { icon: 'water', text: 'Lidder River & Nature Walks' },
    ],
    left: '64%',
    top: '46%',
  },
  {
    num: 4,
    dayLabel: 'Day 6',
    name: 'Sonamarg',
    targetDay: 6,
    badgeText: 'The Meadow of Gold & Glacier Views',
    bullets: [
      { icon: 'glacier', text: 'Thajiwas Glacier' },
      { icon: 'camera', text: 'Scenic Views & Photography' },
    ],
    left: '75%',
    top: '16%',
  },
];

export default function RouteMapModal({
  isOpen,
  onClose,
  pkg,
  cmsMapData = null,
  destinations = [],
  destinationNames = [],
  daysCount = 7,
  nightsCount = 6,
  countryName = 'India',
  onSelectDay,
}) {
  const [activeStop, setActiveStop] = useState(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        if (typeof document !== 'undefined' && document.body) {
          document.body.style.overflow = (origOverflow && origOverflow !== 'hidden') ? origOverflow : '';
        }
      };
    } else {
      if (typeof document !== 'undefined' && document.body && document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
    }
  }, [isOpen]);

  const slug = String(pkg?.slug || '').toLowerCase();
  const name = String(pkg?.name || '').toLowerCase();
  const isKashmir = slug.includes('kashmir') || name.includes('kashmir');

  // Display destination title
  const destinationTitle = useMemo(() => {
    if (cmsMapData?.destinationName) return cmsMapData.destinationName;
    if (isKashmir) return 'Kashmir';
    if (destinationNames[0]) return destinationNames[0];
    const cleaned = String(pkg?.name || '').split(/—|-|\|/)[0].trim();
    return cleaned || countryName || 'Destination';
  }, [cmsMapData, isKashmir, destinationNames, pkg?.name, countryName]);

  const activeMapMedia = useMemo(() => {
    if (cmsMapData?.mediaUrl) return cmsMapData.mediaUrl;
    if (isKashmir) return '/images/route-maps/kashmir-map-landscape.png';
    return null;
  }, [cmsMapData, isKashmir]);

  // Derive dynamic stops for packages
  const stops = useMemo(() => {
    if (cmsMapData?.stops && Array.isArray(cmsMapData.stops) && cmsMapData.stops.length > 0) {
      return cmsMapData.stops;
    }

    if (isKashmir) return KASHMIR_STOPS;

    const uniqueNames = Array.from(new Set(destinationNames.filter(Boolean)));
    const totalDays = Number(daysCount) || 6;

    if (uniqueNames.length >= 2) {
      let curDay = 1;
      const daysPerStop = Math.max(1, Math.floor(totalDays / uniqueNames.length));

      return uniqueNames.slice(0, 5).map((destName, idx) => {
        const start = curDay;
        const end = idx === uniqueNames.length - 1 ? totalDays : Math.min(start + daysPerStop - 1, totalDays);
        curDay = end + 1;
        const dayLabel = start === end ? `Day ${start}` : `Day ${start} - ${end}`;
        const leftPercent = 18 + idx * (64 / Math.max(uniqueNames.length - 1, 1));
        const topPercent = 42 + (idx % 2 === 0 ? -14 : 14);

        return {
          num: idx + 1,
          dayLabel,
          name: destName,
          targetDay: start,
          badgeText: `${destName} Scenic Highlights & Sightseeing`,
          bullets: [
            { icon: 'pin', text: `Iconic ${destName} Sightseeing` },
            { icon: 'camera', text: 'Cultural Tours & Local Experiences' },
          ],
          left: `${Math.round(leftPercent)}%`,
          top: `${Math.round(topPercent)}%`,
        };
      });
    }

    if (destinations.length >= 1) {
      let currentDay = 1;
      return destinations.slice(0, 4).map((dItem, idx) => {
        const nights = Number(dItem?.nights) || 1;
        const dName = dItem?.destination?.name || destinationNames[idx] || `Stop ${idx + 1}`;
        const start = currentDay;
        const end = Math.min(start + Math.max(nights - 1, 0), totalDays);
        currentDay = end + 1;
        const dayLabel = start === end ? `Day ${start}` : `Day ${start} - ${end}`;
        const leftPercent = 20 + idx * (60 / Math.max(destinations.length - 1, 1));
        const topPercent = 38 + (idx % 2 === 0 ? -12 : 12);

        return {
          num: idx + 1,
          dayLabel,
          name: dName,
          targetDay: start,
          badgeText: `${dName} Exploration & Stays`,
          bullets: [
            { icon: 'pin', text: `${dName} City Highlights` },
            { icon: 'camera', text: 'Curated Sightseeing & Activities' },
          ],
          left: `${Math.round(leftPercent)}%`,
          top: `${Math.round(topPercent)}%`,
        };
      });
    }

    // Default 3 stops
    return [
      {
        num: 1,
        dayLabel: 'Day 1 - 2',
        name: destinationTitle,
        targetDay: 1,
        badgeText: `${destinationTitle} Arrival & Exploration`,
        bullets: [
          { icon: 'pin', text: `${destinationTitle} Scenic Sights` },
          { icon: 'home', text: 'Local Culture & Heritage' },
        ],
        left: '22%',
        top: '55%',
      },
      {
        num: 2,
        dayLabel: `Day 3 - ${Math.max(totalDays - 1, 3)}`,
        name: `${destinationTitle} Valley`,
        targetDay: 3,
        badgeText: 'Nature & Landmark Excursions',
        bullets: [
          { icon: 'mountain', text: 'Nature Walks & Panoramic Views' },
          { icon: 'camera', text: 'Photography & Outdoor Discovery' },
        ],
        left: '52%',
        top: '36%',
      },
      {
        num: 3,
        dayLabel: `Day ${totalDays}`,
        name: 'Departure & Leisure',
        targetDay: totalDays,
        badgeText: 'Shopping & Farewell Sights',
        bullets: [
          { icon: 'pin', text: 'Local Markets & Souvenirs' },
          { icon: 'camera', text: 'Memorable Farewell Journey' },
        ],
        left: '78%',
        top: '24%',
      },
    ];
  }, [isKashmir, destinationNames, destinations, daysCount, destinationTitle]);

  if (!isOpen) return null;

  return (
    <div
      className="rmm-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${destinationTitle} Route Map Popup`}
    >
      <div className="rmm-modal-card">
        {/* ============================================================ */}
        {/* LEFT COLUMN: CLEAN ROUTE MAP ILLUSTRATION                    */}
        {/* ============================================================ */}
        <div className="rmm-map-col">
          <div className="rmm-map-canvas">
            {activeMapMedia ? (
              /* High-Res Landscape Map / Dynamic CMS Route Media */
              <div className="rmm-kashmir-wrapper">
                <img
                  src={activeMapMedia}
                  alt={`${destinationTitle} Route Map`}
                  className="rmm-kashmir-img"
                />

                {/* Interactive Hotspot Pins if static Kashmir map and no custom media */}
                {isKashmir && !cmsMapData?.mediaUrl && KASHMIR_STOPS.map((st) => (
                  <button
                    key={`k-hotspot-${st.num}`}
                    type="button"
                    className={`rmm-pin-hotspot pin-${st.num} ${activeStop === st.num ? 'is-active' : ''}`}
                    style={{ left: st.left, top: st.top }}
                    onClick={() => {
                      setActiveStop(st.num);
                      if (onSelectDay) onSelectDay(st.targetDay);
                    }}
                    onMouseEnter={() => setActiveStop(st.num)}
                    title={`${st.name} (${st.dayLabel})`}
                    aria-label={`${st.name} - ${st.dayLabel}`}
                  />
                ))}
              </div>
            ) : (
              /* Dynamic SVG Landscape Map for all other packages */
              <div className="rmm-dynamic-wrapper">
                <svg
                  className="rmm-canvas-svg"
                  viewBox="0 0 690 460"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <defs>
                    {/* Sky Gradient */}
                    <linearGradient id="rmmSky" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#EAF1F8" />
                      <stop offset="100%" stopColor="#F9F6EE" />
                    </linearGradient>

                    {/* Mountain Ridge Gradients */}
                    <linearGradient id="rmmMtnBack" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#C4D1DF" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#DFE7ED" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="rmmMtnFront" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#A8BCCF" />
                      <stop offset="100%" stopColor="#CDDAC9" />
                    </linearGradient>

                    {/* River Gradient */}
                    <linearGradient id="rmmRiver" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7EABC2" />
                      <stop offset="100%" stopColor="#478AA5" />
                    </linearGradient>

                    {/* Route Line Arrowhead */}
                    <marker
                      id="rmmArrow"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#AA8453" />
                    </marker>
                  </defs>

                  {/* Sky background */}
                  <rect width="690" height="460" fill="url(#rmmSky)" />

                  {/* Distant Mountains */}
                  <polygon points="-20,240 80,120 180,240 260,110 380,250 490,90 610,240 720,130 720,320 -20,320" fill="url(#rmmMtnBack)" />
                  <polygon points="-20,260 110,160 210,270 310,150 430,260 540,140 680,270 720,200 720,360 -20,360" fill="url(#rmmMtnFront)" opacity="0.85" />

                  {/* Gentle Hills / Valleys */}
                  <path d="M-20,310 Q 150,260 320,300 T 710,280 L710,460 L-20,460 Z" fill="#DCE7D6" />
                  <path d="M-20,345 Q 180,310 420,355 T 710,330 L710,460 L-20,460 Z" fill="#CBDDC4" />

                  {/* Winding River Stream */}
                  <path
                    d="M 520,230 Q 480,280 430,320 T 360,370 Q 320,400 240,460 L 295,460 Q 365,405 405,375 T 475,320 Q 525,275 555,230 Z"
                    fill="url(#rmmRiver)"
                    opacity="0.78"
                  />

                  {/* Dotted Route Trajectory */}
                  <path
                    d="M 90,320 C 180,200 320,330 460,220 S 580,180 620,160"
                    fill="none"
                    stroke="#AA8453"
                    strokeWidth="3"
                    strokeDasharray="6 7"
                    strokeLinecap="round"
                    markerMid="url(#rmmArrow)"
                    markerEnd="url(#rmmArrow)"
                  />
                </svg>

                {/* Pins on Dynamic Canvas */}
                {stops.map((st) => (
                  <div
                    key={`dyn-pin-${st.num}`}
                    className={`rmm-pin-marker ${activeStop === st.num ? 'is-active' : ''}`}
                    style={{ left: st.left, top: st.top }}
                    onClick={() => {
                      setActiveStop(st.num);
                      if (onSelectDay) onSelectDay(st.targetDay);
                    }}
                    onMouseEnter={() => setActiveStop(st.num)}
                  >
                    <div className="rmm-dyn-pin-badge">{st.num}</div>
                    <div className="rmm-dyn-pin-card">
                      <strong className="rmm-dyn-pin-city">{st.name}</strong>
                      <span className="rmm-dyn-pin-sub">{st.badgeText}</span>
                    </div>
                  </div>
                ))}

                {/* Compass Rose */}
                <div className="rmm-compass-wrap">
                  <svg width="44" height="44" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="42" stroke="#AA8453" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
                    <polygon points="50,12 55,45 50,42 45,45" fill="#AA8453" />
                    <polygon points="50,88 55,55 50,58 45,55" fill="#AA8453" opacity="0.5" />
                    <polygon points="88,50 55,55 58,50 55,45" fill="#AA8453" opacity="0.7" />
                    <polygon points="12,50 45,55 42,50 45,45" fill="#AA8453" opacity="0.5" />
                    <circle cx="50" cy="50" r="3.5" fill="#AA8453" />
                    <text x="50" y="8" fill="#AA8453" fontSize="10" fontWeight="bold" textAnchor="middle">N</text>
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: "TOUR MAP" / ITINERARY PANEL MATCHING USER MOCKUP */}
        {/* ============================================================ */}
        <div className="rmm-itinerary-col">
          {/* Header with Route Icon, Title, and Close Button */}
          <div className="rmm-header">
            <div className="rmm-header-left">
              <svg className="rmm-itinerary-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C28B38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="6" r="3" />
                <circle cx="18" cy="18" r="3" />
                <path d="M6 9v3a3 3 0 0 0 3 3h6" />
              </svg>
              <h3 className="rmm-title">{cmsMapData?.title && !/^trip\s*itin/i.test(cmsMapData.title) ? cmsMapData.title : 'Tour Map'}</h3>
            </div>
            <button
              type="button"
              className="rmm-close-btn"
              onClick={onClose}
              aria-label="Close itinerary route popup"
            >
              ✕
            </button>
          </div>

          {/* Timeline List */}
          <div className="rmm-timeline">
            {stops.map((stop, idx) => (
              <div
                key={`stop-${stop.num}`}
                className={`rmm-timeline-item ${activeStop === stop.num ? 'is-active' : ''}`}
                onMouseEnter={() => setActiveStop(stop.num)}
                onClick={() => {
                  setActiveStop(stop.num);
                  if (onSelectDay) onSelectDay(stop.targetDay);
                }}
              >
                <div className="rmm-timeline-marker">
                  <span className="rmm-num-badge">{stop.num}</span>
                  {idx < stops.length - 1 ? <span className="rmm-timeline-line" /> : null}
                </div>

                <div className="rmm-timeline-body">
                  <div className="rmm-day-tag">{stop.dayLabel}</div>
                  <h4 className="rmm-stop-name">{stop.name}</h4>
                  <ul className="rmm-bullets">
                    {stop.bullets.map((b, bIdx) => (
                      <li key={`bullet-${bIdx}`} className="rmm-bullet-item">
                        <span className="rmm-bullet-icon">
                          {b.icon === 'pin' && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                          )}
                          {b.icon === 'home' && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                          )}
                          {b.icon === 'mountain' && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 20 9 8 13 14 17 8 21 20 3 20" /></svg>
                          )}
                          {b.icon === 'snow' && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /><line x1="19.07" y1="4.93" x2="4.93" y2="19.07" /></svg>
                          )}
                          {b.icon === 'trees' && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L7 10h3l-4 7h6v5h2v-5h6l-4-7h3L12 2z" /></svg>
                          )}
                          {b.icon === 'water' && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c2.5-2 5 2 7.5 0s5-2 7.5 0 5 2 7-1" /><path d="M2 17c2.5-2 5 2 7.5 0s5-2 7.5 0 5 2 7-1" /></svg>
                          )}
                          {b.icon === 'glacier' && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 22 22 22" /></svg>
                          )}
                          {b.icon === 'camera' && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                          )}
                        </span>
                        <span className="rmm-bullet-text">{b.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* COMPONENT STYLES                                             */}
      {/* ============================================================ */}
      <style jsx>{`
        .rmm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.72);
          backdrop-filter: blur(6px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: rmmFadeIn 0.25s ease-out;
        }

        .rmm-modal-card {
          width: min(100%, 1020px);
          max-height: 90vh;
          background: #FAF7F0;
          border: 1.5px solid #E6D7BD;
          border-radius: 20px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          overflow: hidden;
          animation: rmmScaleUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Left Column: Map */
        .rmm-map-col {
          padding: 16px;
          display: flex;
          align-items: stretch;
          background: #F4EFE6;
        }

        .rmm-map-canvas {
          position: relative;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #E2D5BE;
          background: #FAF7F0;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
          display: flex;
        }

        .rmm-kashmir-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          line-height: 0;
        }

        :global(.rmm-kashmir-img) {
          width: 100% !important;
          height: 100% !important;
          display: block;
          object-fit: cover;
        }

        /* Hotspots on Kashmir Map */
        .rmm-pin-hotspot {
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
          transform: translate(-50%, -50%);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .rmm-pin-hotspot:hover,
        .rmm-pin-hotspot.is-active {
          transform: translate(-50%, -50%) scale(1.22);
          box-shadow: 0 0 16px rgba(194, 139, 56, 0.65);
        }

        /* Dynamic Map Canvas */
        .rmm-dynamic-wrapper {
          position: relative;
          width: 100%;
          min-height: 420px;
        }

        .rmm-canvas-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .rmm-pin-marker {
          position: absolute;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          z-index: 5;
          transition: transform 0.2s ease;
        }

        .rmm-pin-marker:hover,
        .rmm-pin-marker.is-active {
          transform: translate(-50%, -50%) scale(1.08);
        }

        .rmm-dyn-pin-badge {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #C28B38;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 12px;
          border: 1.5px solid #FFFFFF;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          flex-shrink: 0;
        }

        .rmm-dyn-pin-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          border: 1px solid #E2D5BE;
          border-radius: 6px;
          padding: 4px 8px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
          max-width: 130px;
        }

        .rmm-dyn-pin-city {
          display: block;
          font-size: 11.5px;
          color: #0F172A;
          font-weight: 700;
          line-height: 1.2;
        }

        .rmm-dyn-pin-sub {
          display: block;
          font-size: 9.5px;
          color: #64748B;
          line-height: 1.2;
        }

        .rmm-compass-wrap {
          position: absolute;
          bottom: 12px;
          right: 14px;
          pointer-events: none;
        }

        /* Right Column: Tour Map / Itinerary */
        .rmm-itinerary-col {
          padding: 22px 24px 22px 20px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          max-height: 85vh;
        }

        .rmm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid #EADEC9;
          margin-bottom: 18px;
        }

        .rmm-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rmm-title {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          color: #1E293B;
          letter-spacing: -0.01em;
        }

        .rmm-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: #64748B;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .rmm-close-btn:hover {
          background: #F1F5F9;
          color: #0F172A;
          border-color: #94A3B8;
        }

        /* Timeline Items */
        .rmm-timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .rmm-timeline-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          cursor: pointer;
          padding: 6px 8px 16px;
          border-radius: 8px;
          transition: background 0.15s ease;
        }

        .rmm-timeline-item:hover,
        .rmm-timeline-item.is-active {
          background: rgba(194, 139, 56, 0.08);
        }

        .rmm-timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .rmm-num-badge {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #C28B38;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 12px;
          box-shadow: 0 2px 6px rgba(194, 139, 56, 0.25);
          flex-shrink: 0;
          z-index: 2;
        }

        .rmm-timeline-line {
          width: 2px;
          background: #D8C5A5;
          position: absolute;
          top: 28px;
          bottom: -16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1;
        }

        .rmm-timeline-body {
          flex: 1;
          min-width: 0;
        }

        .rmm-day-tag {
          font-size: 10.5px;
          font-weight: 700;
          color: #C28B38;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          line-height: 1.1;
        }

        .rmm-stop-name {
          margin: 2px 0 6px;
          font-size: 15px;
          font-weight: 800;
          color: #0F172A;
          line-height: 1.2;
        }

        .rmm-bullets {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rmm-bullet-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: #475569;
          line-height: 1.3;
        }

        .rmm-bullet-icon {
          color: #C28B38;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
        }

        .rmm-bullet-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @keyframes rmmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes rmmScaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Responsive */
        @media (max-width: 820px) {
          .rmm-modal-card {
            grid-template-columns: 1fr;
            max-height: 92vh;
            overflow-y: auto;
          }
          .rmm-map-col {
            padding: 12px;
          }
          .rmm-dynamic-wrapper {
            min-height: 280px;
          }
          .rmm-itinerary-col {
            padding: 16px;
            max-height: none;
          }
        }
      `}</style>
    </div>
  );
}
