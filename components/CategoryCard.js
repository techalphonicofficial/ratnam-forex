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
          flex: 0 0 186px;
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          color: var(--color-text-primary);
          font-family: Poppins, sans-serif;
          text-align: center;
          transition: transform 0.35s ease-out, z-index 0s;
          scroll-snap-align: start;
          position: relative;
          z-index: 1;
        }
        .sec-traveller-option:hover,
        .sec-traveller-option.is-active {
          transform: translateY(-8px) scale(1.06);
          z-index: 20;
        }
        .sec-traveller-visual {
          position: relative;
          display: flex;
          justify-content: center;
          height: 250px;
          margin-bottom: 44px;
        }
        .sec-traveller-photo-wrap {
          position: relative;
          width: 170px;
          height: 250px;
          border-radius: 120px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.12);
          border: 3px solid transparent;
          transition: border-color 0.35s ease-out, transform 0.35s ease-out, box-shadow 0.35s ease-out;
          will-change: transform, box-shadow;
        }
        .sec-traveller-option:hover .sec-traveller-photo-wrap,
        .sec-traveller-option.is-active .sec-traveller-photo-wrap {
          border-color: var(--color-primary);
          box-shadow: 0 18px 36px rgba(0,0,0,0.18);
        }
        .sec-traveller-photo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 120px;
        }
        .sec-traveller-badge {
          position: absolute;
          bottom: -22px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 50px;
          background: #FFFFFF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(0,0,0,0.25);
          z-index: 2;
          color: #A3C644;
          transition: transform 0.25s ease, background 0.25s ease;
        }
        .sec-traveller-option:hover .sec-traveller-badge,
        .sec-traveller-option.is-active .sec-traveller-badge {
          transform: translateX(-50%) scale(1.1);
          background: #F2F8D9;
        }
        .sec-traveller-badge svg {
          width: 24px;
          height: 24px;
        }
        .sec-traveller-label {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          font-size: 17.5px;
          line-height: 1.2;
          font-weight: 900;
          text-transform: uppercase;
          white-space: nowrap;
          transition: color 0.22s ease;
        }
        .sec-traveller-option:hover .sec-traveller-label,
        .sec-traveller-option.is-active .sec-traveller-label {
          color: var(--color-accent);
        }
        .sec-traveller-label svg {
          width: 14px;
          height: 14px;
          stroke-width: 3.5;
          flex: 0 0 auto;
        }
        @media (max-width: 768px) {
          .sec-traveller-option { 
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .sec-traveller-photo-wrap {
            width: 130px;
            height: 195px;
            border-radius: 80px;
          }
          .sec-traveller-visual { height: 195px; margin-bottom: 36px; }
          .sec-traveller-photo-wrap img { border-radius: 80px; }
          .sec-traveller-label { font-size: 15px; }
          .sec-traveller-badge { width: 44px; height: 44px; bottom: -18px; }
          .sec-traveller-badge svg { width: 20px; height: 20px; }
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
        <span className="sec-traveller-visual">
          <span className="sec-traveller-photo-wrap">
            <img src={image} alt={alt || label} loading="lazy" />
            <span className="sec-traveller-badge">
              {getCategoryIcon(label)}
            </span>
          </span>
        </span>
        <span className="sec-traveller-label">
          {label}
        </span>
      </button>
    </>
  );
}
