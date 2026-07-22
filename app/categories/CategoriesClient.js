'use client';
import { useState, useEffect } from 'react';
import { getHomeCategories, getMediaUrl } from '@/utils/api';
import CategoryCard, { getFallbackCategoryImage } from '@/components/CategoryCard';

export default function CategoriesClient() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTraveler, setActiveTraveler] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadCategories() {
      try {
        const data = await getHomeCategories();
        if (!mounted) return;
        if (data?.length) {
          setCategories(
            data
              .slice()
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              .map((cat) => ({
                id: cat.id || cat.slug || (cat.name || cat.title)?.toLowerCase(),
                label: cat.name || cat.title,
                image: getMediaUrl(cat.feature_image || cat.image) || getFallbackCategoryImage(cat.name || cat.title),
                alt: cat.feature_image_alt || cat.name || cat.title,
              }))
          );
        }
      } catch (err) {
        console.error('Error loading traveler types:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main style={{ background: 'var(--color-bg)', minHeight: '100vh', padding: '140px 0 100px', overflow: 'hidden' }}>
      <div className="container" style={{ margin: '0 auto', padding: '0 24px', maxWidth: '1440px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2.2,
            textTransform: 'uppercase',
            color: "var(--color-primary)",
            display: 'block',
            marginBottom: 8
          }}>
            Design Your Dream Trip
          </span>
          <h1 style={{
            fontFamily: '"Italiana", sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(32px, 4vw, 48px)',
            color: 'var(--color-text-primary)',
            margin: '0 0 12px',
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            Who is traveling with you?
          </h1>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: 16,
            maxWidth: 600,
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Select your travel companionship to view itineraries custom-crafted for your vibe. We have a variety of categories to choose from.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '3px solid rgba(163, 198, 68, 0.3)',
              borderTopColor: 'var(--color-primary)',
              animation: 'spin 1s ease-in-out infinite'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map(({ id, label, image, alt }) => (
              <div key={id} className="category-grid-item">
                <CategoryCard
                  id={id}
                  label={label}
                  image={image}
                  alt={alt}
                  isActive={activeTraveler === id}
                  onMouseEnter={() => setActiveTraveler(id)}
                  onFocus={() => setActiveTraveler(id)}
                  onMouseLeave={() => setActiveTraveler(null)}
                  onBlur={() => setActiveTraveler(null)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style>{`
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 40px 24px;
          justify-items: center;
        }
        .category-grid-item {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        
        /* Responsive Layout */
        @media (max-width: 1440px) {
          .categories-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 1024px) {
          .categories-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .categories-grid { grid-template-columns: repeat(2, 1fr); gap: 32px 16px; }
        }
        @media (max-width: 480px) {
          .categories-grid { grid-template-columns: repeat(2, 1fr); gap: 24px 12px; }
        }
      `}</style>
    </main>
  );
}
