'use client';

import Image from 'next/image';
import Link from 'next/link';

const collections = [
  {
    id: 1,
    title: 'Incredible India',
    slug: 'incredible-india',
    description: "Handcrafted journeys across India's most iconic destinations designed especially for NRIs, international travellers and luxury explorers.",
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80',
    highlights: [
      'Luxury Hotels', 'Festival Experiences', 'Jungle Safari', 'Elephant Ride',
      'Local Culture', 'Yoga Retreats', 'Ganga Aarti',
      'Village Stay', 'Heritage Walks', 'Traditional Cuisine'
    ]
  },
  {
    id: 2,
    title: 'International',
    slug: 'international',
    description: "Discover breathtaking landscapes, world-class luxury, and immersive experiences across Europe, Asia, and beyond.",
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80',
    highlights: [
      'Premium Flights', 'Private Guides', 'Iconic Landmarks', 'Gourmet Dining',
      'Luxury Transfers', 'Exclusive Access', 'Wine Tasting', 'Cultural Shows',
      'Scenic Train Rides', 'Visa Assistance'
    ]
  },
  {
    id: 3,
    title: 'India Unlimited',
    slug: 'india-unlimited',
    description: "Uncover the hidden gems of India with deeply authentic itineraries that go beyond the usual tourist trails.",
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    highlights: [
      'Offbeat Trails', 'Boutique Stays', 'Wildlife Photography', 'Houseboat Cruise',
      'Tribal Village Tour', 'Desert Safari', 'Mountain Trekking', 'Spice Plantation'
    ]
  },
  {
    id: 4,
    title: 'Trans India',
    slug: 'trans-india',
    description: "Epic cross-country expeditions covering the diverse topography, climate, and traditions of the Indian subcontinent.",
    image: 'https://images.unsplash.com/photo-1517427677506-ade074eb1432?w=1200&q=80',
    highlights: [
      'Luxury Train Journeys', 'Multi-city Tours', 'Domestic Flights Included',
      'Seamless Logistics', 'Expert Escorts', 'Pan-India Cuisine', 'Historical Monuments',
      'Diverse Landscapes'
    ]
  }
];

export default function DescribeSection() {
  return (
    <section className="collections-section" aria-labelledby="collections-title">
      <style>{`
        .collections-section {
          position: relative;
          background: var(--color-bg);
          padding: 60px 0 80px;
        }

        .collections-inner {
          /* Removed max-width and padding to rely on Bootstrap container */
        }

        .collections-title {
          margin: 0 0 50px;
          color: var(--color-text-primary);
          font-family: "Italiana", sans-serif;
          font-size: clamp(28px, 3.5vw, 42px);
          font-weight: 800;
          text-align: center;
        }

        .collection-block {
          display: flex;
          align-items: stretch;
          margin-bottom: 60px;
          gap: 50px;
        }

        /* Alternate layout for even items. Use nth-of-type so the h2 doesn't mess up the count */
        .collection-block:nth-of-type(even) {
          flex-direction: row-reverse;
        }

        .collection-text {
          flex: 0 0 45%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .collection-heading {
          font-family: "Italiana", sans-serif;
          font-size: clamp(28px, 3.5vw, 40px);
          font-weight: 800;
          color: var(--color-text-primary);
          margin: auto 0 20px 0;
        }

        .collection-desc {
          font-size: 16px;
          color: var(--color-text-muted);
          line-height: 1.6;
          margin: 0 0 32px 0;
        }

        .collection-highlights {
          display: grid;
          grid-template-columns: repeat(2, max-content);
          justify-content: center;
          gap: 12px 20px;
        }

        .highlight-item {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 10px;
          font-size: 15px;
          color: var(--color-text-primary);
          font-weight: 500;
        }

        .highlight-icon {
          color: #FF6000;
          flex-shrink: 0;
        }

        .btn-explore {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 32px;
          background: var(--color-primary);
          color: var(--color-card);
          font-weight: 600;
          font-size: 15px;
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: background 0.3s ease, transform 0.3s ease;
          align-self: center;
          margin-top: auto;
        }

        .btn-explore:hover {
          background: color-mix(in srgb, var(--color-primary) 85%, black);
          transform: translateY(-2px);
        }

        .collection-image-wrapper {
          flex: 0 0 55%;
          position: relative;
          aspect-ratio: 16 / 10;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .collection-image {
          object-fit: cover;
          transition: transform 0.7s ease;
        }

        .collection-image-wrapper:hover .collection-image {
          transform: scale(1.03);
        }

        @media (max-width: 900px) {
          .collection-block, .collection-block:nth-of-type(even) {
            flex-direction: column-reverse; /* Stack with text on bottom, image on top */
            gap: 30px;
            margin-bottom: 50px;
          }
          .collection-image-wrapper {
            aspect-ratio: 4 / 3;
            width: 100%;
          }
          .collection-heading {
            margin-top: 0;
          }
          .btn-explore {
            margin-top: 30px;
          }
        }

        @media (max-width: 540px) {
          .collection-highlights {
            grid-template-columns: repeat(2, max-content);
            gap: 10px 15px; /* slightly smaller gap on mobile */
          }
          .collections-section {
            padding: 40px 0;
          }
        }
      `}</style>

      <div className="container">
        <h2 className="collections-title" id="collections-title">
          Distinct Journey Collections
        </h2>

        {collections.map((collection) => (
          <div key={collection.id} className="collection-block">
            <div className="collection-text">
              <h3 className="collection-heading">{collection.title}</h3>
              <p className="collection-desc">{collection.description}</p>
              
              <div className="collection-highlights">
                {collection.highlights?.map((highlight, idx) => (
                  <div key={idx} className="highlight-item">
                    <svg className="highlight-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {highlight}
                  </div>
                ))}
              </div>

              <Link href={`/collections/${collection.slug}`} className="btn-explore circle-btn-hover">
                <svg className="circle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                Explore Collection
              </Link>
            </div>

            <div className="collection-image-wrapper">
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                className="collection-image"
                sizes="(max-width: 900px) 100vw, 55vw"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}