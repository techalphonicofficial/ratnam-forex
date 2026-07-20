'use client';

import Image from 'next/image';

export default function FeelingSection() {
  return (
    <div className="feeling-section">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap');
        
        .feeling-section {
          display: flex;
          align-items: stretch;
          margin-top: 40px;
          gap: 60px;
        }

        .feeling-image-wrapper {
          flex: 1;
          position: relative;
          min-height: 450px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }

        .feeling-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 0;
        }

        .feeling-title {
          font-family: 'Oswald', sans-serif;
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #111827;
          margin: 0 0 24px 0;
          line-height: 1.1;
        }

        .feeling-desc {
          font-size: 16px;
          color: #4b5563;
          line-height: 1.8;
          margin: 0;
        }

        @media (max-width: 900px) {
          .feeling-section {
            flex-direction: column-reverse;
            gap: 40px;
          }
          .feeling-image-wrapper {
            min-height: 350px;
          }
          .feeling-text {
            padding: 0;
          }
        }
      `}</style>

      <div className="feeling-image-wrapper">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
          alt="Pursuit of feeling misty lake"
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 900px) 100vw, 50vw"
        />
      </div>
      
      <div className="feeling-text">
        <h3 className="feeling-title">PURSUIT OF FEELING</h3>
        <p className="feeling-desc">
          Travel has always been more than reaching a destination.<br /><br />
          It is about emotions, memories, people and stories that stay with you forever.
        </p>
      </div>
    </div>
  );
}
