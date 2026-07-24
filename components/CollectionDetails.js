'use client';

import React, { useEffect, useState } from 'react';
import { getPageBySlug, getMediaUrl } from '@/utils/api';

const FALLBACK_DATA = {
  'international': {
    title: 'Global Escapes',
    json_data: {
      story_desc: `<p>Venture beyond borders and explore the wonders of the world with our International collection. From the romantic streets of Paris to the pristine beaches of Maldives and the futuristic skyline of Dubai, we craft unforgettable global adventures tailored to your dreams.</p><h4><strong>Iconic Landmarks</strong></h4><p>Visit world-renowned wonders and immerse yourself in breathtaking global history.</p><h4><strong>Cultural Immersion</strong></h4><p>Experience diverse cultures, taste authentic cuisines, and live like a local.</p><h4><strong>Luxury & Leisure</strong></h4><p>Unwind in premium resorts, cruise along beautiful coasts, and enjoy VIP treatments.</p>`,
      gallery: [{ img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80' }]
    }
  },
  'india-unlimited': {
    title: 'India Unlimited',
    json_data: {
      story_desc: `<p>Experience the vast, colorful, and limitless beauty of India. Our India Unlimited collection takes you on an exhaustive journey through the hidden gems, bustling metropolises, and serene landscapes of a country where every mile tells a different story.</p><h4><strong>Hidden Gems</strong></h4><p>Discover untouched valleys, secluded beaches, and quaint villages off the beaten path.</p><h4><strong>Vibrant Festivals</strong></h4><p>Be part of India’s grand celebrations, full of colors, music, and immense joy.</p><h4><strong>Culinary Trails</strong></h4><p>Savor the explosive and diverse flavors of authentic regional Indian cuisines.</p>`,
      gallery: [{ img: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80' }]
    }
  },
  'trans-india': {
    title: 'Crossing Landscapes',
    json_data: {
      story_desc: `<h2><strong>Trans India</strong></h2><p>Embark on the ultimate cross-country expedition. The Trans India collection is designed for the bold traveler looking to traverse the subcontinent from the majestic Himalayas to the tropical tip of Kanyakumari, experiencing the ultimate road and rail adventures.</p><h4><strong>Epic Train Journeys</strong></h4><p>Travel aboard luxury and scenic trains cutting through the heart of India's landscapes.</p><h4><strong>Cross-Country Roadtrips</strong></h4><p>Drive along scenic highways connecting diverse states, languages, and cultures.</p><h4><strong>Diverse Landscapes</strong></h4><p>From deserts to rainforests, witness the dramatic geographical shifts of the subcontinent.</p><p>Journey across the vast and varied landscapes of the Indian subcontinent.</p>`,
      gallery: [{ img: '/uploads/media/med-1784870125355-82181972.jpg' }]
    }
  },
  'incredible-india': {
    title: 'Discover the Soul of India',
    json_data: {
      story_desc: `<p>From the snow-capped peaks of the Himalayas in the north to the sun-kissed beaches of the south, India is a land of unparalleled diversity. Our <strong>Incredible India</strong> collection brings you curated experiences that dive deep into the country's rich heritage, vibrant festivals, ancient temples, and modern marvels.</p><h4><strong>Heritage & Culture</strong></h4><p>Explore majestic forts, royal palaces, and ancient ruins that tell centuries of history.</p><h4><strong>Spiritual Journeys</strong></h4><p>Find peace in the sacred cities and ashrams scattered along the holy rivers.</p><h4><strong>Wildlife & Nature</strong></h4><p>Witness majestic tigers and diverse wildlife in India's renowned national parks.</p>`,
      gallery: [{ img: '/uploads/pages/page-1784789212423-225953463.jpg' }]
    }
  }
};
export default function CollectionDetails({ slug }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const pageData = await getPageBySlug(`collections/${slug}`);
      console.log('FETCHED PAGE DATA FOR SLUG', `collections/${slug}`, pageData);
      if (pageData && pageData.details) {
        const storyGrid = pageData.details.find(d => d.section === 'story_grid');
        console.log('FOUND STORY GRID:', storyGrid);
        setData(storyGrid);
      } else {
        console.log('NO DETAILS OR NO PAGE DATA');
        setData(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading collection details...</div>;
  }
  
  const mainSlug = slug.split('/')[0];
  const displayData = (data && data.json_data) ? data : FALLBACK_DATA[mainSlug];
  
  if (!displayData || !displayData.json_data) return null;

  const title = displayData.title;
  let json_data = displayData.json_data;
  if (typeof json_data === 'string') {
    try {
      json_data = JSON.parse(json_data);
    } catch (e) {
      console.warn('Failed to parse json_data:', e);
    }
  }

  const { story_desc, gallery } = json_data || {};
  
  // Parse HTML: split by <h4> to separate intro paragraph from feature blocks
  const parts = (story_desc || '').split('<h4>');
  let introHtml = parts[0];
  // Strip any duplicate h2 headings coming from the API (like <h2><strong>Trans India</strong></h2>)
  introHtml = introHtml.replace(/<h2[^>]*>.*?<\/h2>/gi, '');
  
  const featuresHtml = parts.slice(1).map(p => '<h4>' + p);
  
  const imageUrl = gallery && gallery.length > 0 ? getMediaUrl(gallery[0].img) : '';
  const isReverse = mainSlug === 'international' || mainSlug === 'trans-india' || mainSlug === 'incredible-india';

  return (
    <section className="collection-details-wrapper">
      <style>{`
        .collection-details-wrapper {
          padding: 20px 0 60px;
          border-bottom: 1px solid #f3f4f6;
          margin-bottom: 40px;
        }
        .collection-detail-container {
          display: flex;
          align-items: center;
          gap: 60px;
          background: #fafafa;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
        }
        .collection-detail-container.reverse {
          flex-direction: row-reverse;
        }
        .collection-detail-content {
          flex: 1;
          padding: 40px 60px;
        }
        .collection-detail-image {
          flex: 1;
          height: 500px;
          position: relative;
        }
        .collection-detail-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .collection-detail-title {
          font-family: "Italiana", sans-serif;
          font-size: 42px;
          color: #013567;
          margin-bottom: 20px;
          font-weight: 700;
        }
        .collection-detail-text {
          font-size: 16px;
          color: #4b5563;
          line-height: 1.8;
          margin-bottom: 40px;
        }
        .collection-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .feature-item h4 {
          font-size: 15px;
          color: #111827;
          margin-bottom: 8px;
          font-weight: 700;
        }
        .feature-item p {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.5;
          margin-bottom: 0;
        }
        .feature-item strong {
          color: #111827;
        }

        @media (max-width: 1024px) {
          .collection-detail-container, .collection-detail-container.reverse {
            flex-direction: column;
            gap: 0;
          }
          .collection-detail-image {
            width: 100%;
            height: 350px;
          }
          .collection-detail-content {
            padding: 40px 30px;
          }
          .collection-features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className={`collection-detail-container ${isReverse ? 'reverse' : ''}`}>
        <div className="collection-detail-content">
          <h2 className="collection-detail-title">{title}</h2>
          <div 
            className="collection-detail-text"
            dangerouslySetInnerHTML={{ __html: introHtml }}
          />
          <div className="collection-features">
            {featuresHtml.map((html, idx) => (
              <div 
                key={idx} 
                className="feature-item" 
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ))}
          </div>
        </div>
        {imageUrl && (
          <div className="collection-detail-image">
            <img src={imageUrl} alt={title || 'Collection Image'} />
          </div>
        )}
      </div>
    </section>
  );
}
