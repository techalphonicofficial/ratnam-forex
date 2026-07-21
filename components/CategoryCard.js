'use client';
import { useRouter } from 'next/navigation';

export const DEFAULT_CUSTOMIZE_ROOMS = [
  {
    id: 1,
    adults: 2,
    children: 0,
    childAges: [],
  },
];

export const fallbackImages = [
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&q=80',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=300&q=80',
  'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=300&q=80',
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=300&q=80',
];

export const getFallbackCategoryImage = (name) => {
  const normalized = String(name || '').toLowerCase();
  if (normalized.includes('couple')) return fallbackImages[0];
  if (normalized.includes('family')) return fallbackImages[1];
  if (normalized.includes('friends')) return fallbackImages[2];
  return fallbackImages[3];
};

export const getCategoryIcon = (label) => {
  const l = String(label || '').toLowerCase();
  if (l.includes('couple') || l.includes('friends')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="8" width="12" height="14" rx="2" ry="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <path d="M10 12v6" />
        <path d="M14 12v6" />
      </svg>
    );
  }
  if (l.includes('family')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.5l-1 2c-.2.5 0 1 .5 1.3L9 13l-4 4-2.5-.5c-.3-.1-.6 0-.8.2l-1 1c-.3.3-.3.8 0 1.1l3.5 1.5 1.5 3.5c.3.3.8.3 1.1 0l1-1c.2-.2.3-.5.2-.8L7.5 19l4-4 3 5.8c.3.5.8.7 1.3.5l2-1c.3-.2.6-.6.5-1.1z"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
};

export const getCategoryUSP = (label) => {
  const l = String(label || '').toLowerCase();
  if (l.includes('couple') || l.includes('honeymoon')) return '❤️ Romantic Escapes';
  if (l.includes('luxury')) return '✨ Premium Experiences';
  if (l.includes('trend')) return '🔥 Most Booked Packages';
  if (l.includes('budget')) return '💰 Affordable Trips';
  if (l.includes('family')) return '👨‍👩‍👧‍👦 Fun for Everyone';
  if (l.includes('friend')) return '🎉 Group Adventures';
  if (l.includes('adventure')) return '🧗‍♂️ Thrilling Journeys';
  if (l.includes('solo')) return '🎒 Independent Travel';
  if (l.includes('spiritual')) return '🕊️ Peaceful Retreats';
  return '🌟 Handpicked Journey';
};

export default function CategoryCard({ id, label, image, alt, isActive, onMouseEnter, onMouseLeave, onFocus, onBlur }) {
  const router = useRouter();

  const handleSelect = () => {
    const params = new URLSearchParams();
    params.set('step', '0');
    params.set('subStep', 'room-config');
    params.set('traveller', String(label || '').trim());
    params.set('rooms', JSON.stringify(DEFAULT_CUSTOMIZE_ROOMS));
    router.push(`/customize?${params.toString()}`);
  };

  return (
    <>
      <style jsx>{`
        .sec-traveller-option {
          width: 220px;
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          color: var(--color-text-primary);
          font-family: "Italiana", sans-serif;
          text-align: center;
          transition: transform var(--transition-slow);
          position: relative;
          z-index: 1;
        }
        
        .sec-traveller-option:hover,
        .sec-traveller-option.is-active {
          transform: translateY(-8px);
          z-index: 20;
        }

        .sec-traveller-visual {
          position: relative;
          display: flex;
          justify-content: center;
          height: 320px;
          margin-bottom: var(--space-8);
          width: 100%;
        }

        .sec-traveller-border-wrap {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 120px;
          padding: var(--space-2);
          border: 3px solid transparent;
          transition: border-color var(--transition-slow), box-shadow var(--transition-slow);
          box-shadow: var(--shadow-md);
        }

        .sec-traveller-option:hover .sec-traveller-border-wrap,
        .sec-traveller-option.is-active .sec-traveller-border-wrap {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-lg);
        }

        .sec-traveller-photo-wrap {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 112px;
          overflow: hidden;
          background: var(--color-text-primary);
        }

        .sec-traveller-photo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 112px;
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease;
        }

        .sec-traveller-option:hover img,
        .sec-traveller-option.is-active img {
          transform: scale(1.1);
          opacity: 0.8;
        }

        .overlay-content {
          position: absolute;
          inset: 0;
          border-radius: 112px;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 60%);
          opacity: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: var(--space-8);
          transition: opacity var(--transition-slow);
          pointer-events: none;
        }

        .sec-traveller-option:hover .overlay-content,
        .sec-traveller-option.is-active .overlay-content {
          opacity: 1;
        }

        .usp-text {
          color: var(--color-card);
          font-family: "Gilda Display", serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.5px;
          transform: translateY(10px);
          transition: transform var(--transition-slow);
          text-align: center;
          width: 100%;
          padding: 0 var(--space-3);
        }

        .sec-traveller-option:hover .usp-text,
        .sec-traveller-option.is-active .usp-text {
          transform: translateY(0);
        }

        .sec-traveller-badge {
          position: absolute;
          bottom: -22px;
          left: 50%;
          transform: translateX(-50%);
          width: 48px;
          height: 48px;
          background: var(--color-card);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
          z-index: 10;
          color: var(--color-primary);
          transition: all var(--transition-base);
        }

        .sec-traveller-option:hover .sec-traveller-badge,
        .sec-traveller-option.is-active .sec-traveller-badge {
          transform: translateX(-50%) scale(1.15);
          background: var(--color-primary-light);
        }

        .sec-traveller-badge svg {
          width: 22px;
          height: 22px;
        }

        .sec-traveller-label {
          display: inline-block;
          width: 100%;
          font-size: 18px;
          line-height: 1.2;
          font-weight: 900;
          text-transform: uppercase;
          white-space: nowrap;
          transition: color var(--transition-base);
        }

        .sec-traveller-option:hover .sec-traveller-label,
        .sec-traveller-option.is-active .sec-traveller-label {
          color: var(--color-accent);
        }

        @media (max-width: 1024px) {
           .sec-traveller-option { width: 200px; }
           .sec-traveller-visual { height: 280px; }
        }

        @media (max-width: 768px) {
          .sec-traveller-option { 
            width: 100%;
            max-width: 100%;
          }
          .sec-traveller-visual { height: 220px; margin-bottom: var(--space-6); }
          .sec-traveller-border-wrap { border-radius: 100px; padding: var(--space-1); border-width: 2px; }
          .sec-traveller-photo-wrap { border-radius: 96px; }
          .sec-traveller-photo-wrap img { border-radius: 96px; }
          .overlay-content { border-radius: 96px; padding-bottom: var(--space-6); }
          .usp-text { font-size: 12px; }
          .sec-traveller-label { font-size: 15px; }
          .sec-traveller-badge { width: 40px; height: 40px; bottom: -18px; }
          .sec-traveller-badge svg { width: 18px; height: 18px; }
        }
      `}</style>
      <button
        type="button"
        className={`sec-traveller-option${isActive ? ' is-active' : ''}`}
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
        onMouseLeave={onMouseLeave}
        onBlur={onBlur}
        onClick={handleSelect}
      >
        <div className="sec-traveller-visual">
          <div className="sec-traveller-border-wrap">
            <div className="sec-traveller-photo-wrap">
              <img src={image} alt={alt || label} loading="lazy" />
              <div className="overlay-content">
                <span className="usp-text">{getCategoryUSP(label)}</span>
              </div>
            </div>
          </div>
          <span className="sec-traveller-badge">
            {getCategoryIcon(label)}
          </span>
        </div>
        <span className="sec-traveller-label">
          {label}
        </span>
      </button>
    </>
  );
}
