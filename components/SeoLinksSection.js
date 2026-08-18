import Link from 'next/link';
import { getHomeDestinations, getPackageCategories } from '@/utils/api';

export default async function SeoLinksSection() {
  const trendingDestinations = (await getHomeDestinations('trending')) || [];
  const visaFreeDestinations = (await getHomeDestinations('visa-free')) || [];
  const categories = (await getPackageCategories()) || [];

  // Deduplicate destinations by name
  const allDestinationsMap = new Map();
  [...trendingDestinations, ...visaFreeDestinations].forEach(d => {
    if (d && d.name) allDestinationsMap.set(d.name, d);
  });
  const allDestinations = Array.from(allDestinationsMap.values());

  const destinationsList = allDestinations.slice(0, 16);
  const categoriesList = categories.filter(c => c && c.title).slice(0, 16);
  const honeymoonList = allDestinations.slice(0, 12);

  const indianDestinationsList = [
    'Kerala', 'Goa', 'Andaman', 'Himachal', 'Kashmir', 'Rajasthan',
    'Uttarakhand', 'Sikkim', 'Darjeeling', 'Meghalaya', 'Ladakh', 'Ooty'
  ];

  if (!destinationsList.length && !categoriesList.length) return null;

  return (
    <section className="seo-links-section">
      <style>{`
        .seo-links-section {
          background-image: linear-gradient(rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.03)), url('/images/seo-bg.png');
          background-size: 500px;
          background-repeat: repeat;
          background-position: center;
          background-color: #FAFAFA; /* Slightly off-white fallback */
          color: #E2E8F0;
          padding: 60px 40px 40px; /* Added left and right padding */
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          /* text-align removed for left alignment */
        }

        .seo-category-title {
          font-family: "Italiana", sans-serif;
          font-size: 22px;
          margin-bottom: 36px; /* Increased margin-bottom for laptop */
          color: var(--color-text-primary, #1F2A44); /* Dark dynamic text color */
          font-weight: 600;
          letter-spacing: 0.5px;
          text-align: center; /* Center align headings everywhere */
          position: relative;
        }

        .seo-links-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px 20px;
        }

        .seo-link {
          color: #1F2A44; /* Dark Navy text for light background */
          text-decoration: none;
          font-size: 14px;
          font-weight: 400;
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .seo-link:hover {
          color: var(--color-secondary, #FF6000); /* Brand Orange on hover */
          transform: translateX(4px); /* Changed back to translateX for left alignment */
        }

        .seo-divider {
          height: 1px;
          background-color: rgba(31, 42, 68, 0.1); /* Darker divider line */
          margin: 40px 0;
          width: 100%;
        }

        @media (max-width: 1024px) {
          .seo-links-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .seo-category-title {
            font-size: 20px;
            margin-bottom: 24px;
          }
          .seo-links-section {
            padding: 40px 30px 30px;
          }
          .seo-links-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .seo-links-section {
            padding: 30px 20px 20px;
          }
          .seo-links-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px 10px;
          }
          .seo-link {
            font-size: 12px;
          }
        }
      `}</style>

      <div className="container">

        {/* 1. International Holiday Destinations */}
        {destinationsList.length > 0 && (
          <div className="seo-block">
            <div style={{ textAlign: 'center' }}>
              <h3 className="theme-underline-heading seo-category-title">International Holiday Destinations</h3>
            </div>
            <div className="seo-links-grid">
              {destinationsList.map((d, i) => (
                <Link key={i} href={`/tours?search=${encodeURIComponent(d.name)}`} className="seo-link">
                  {d.name} Tour Packages
                </Link>
              ))}
            </div>
            <div className="seo-divider"></div>
          </div>
        )}

        {/* 1.5 Indian Holiday Packages */}
        {indianDestinationsList.length > 0 && (
          <div className="seo-block">
            <div style={{ textAlign: 'center' }}>
              <h3 className="theme-underline-heading seo-category-title">Indian Holiday Packages</h3>
            </div>
            <div className="seo-links-grid">
              {indianDestinationsList.map((name, i) => (
                <Link key={i} href={`/tours?search=${encodeURIComponent(name)}`} className="seo-link">
                  {name} Tour Packages
                </Link>
              ))}
            </div>
            {(categoriesList.length > 0 || honeymoonList.length > 0) && <div className="seo-divider"></div>}
          </div>
        )}

        {/* 2. Themed Destinations */}
        {categoriesList.length > 0 && (
          <div className="seo-block">
            <div style={{ textAlign: 'center' }}>
              <h3 className="theme-underline-heading seo-category-title">Themed Destinations</h3>
            </div>
            <div className="seo-links-grid">
              {categoriesList.map((c, i) => {
                const label = c.title.toLowerCase().includes('package') ? c.title : `${c.title} Packages`;
                return (
                  <Link key={i} href={`/collections/${c.slug}`} className="seo-link">
                    {label}
                  </Link>
                );
              })}
            </div>
            {honeymoonList.length > 0 && <div className="seo-divider"></div>}
          </div>
        )}

        {/* 3. Honeymoon Packages */}
        {honeymoonList.length > 0 && (
          <div className="seo-block">
            <div style={{ textAlign: 'center' }}>
              <h3 className="theme-underline-heading seo-category-title">Honeymoon Packages</h3>
            </div>
            <div className="seo-links-grid">
              {honeymoonList.map((d, i) => (
                <Link key={i} href={`/tours?search=${encodeURIComponent(d.name)}`} className="seo-link">
                  {d.name} Honeymoon Packages
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
