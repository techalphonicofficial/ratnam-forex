import Link from 'next/link';
import { getDestinations, getPackageCategories, getPackages } from '@/utils/api';

const formatName = (str) => {
  if (!str) return '';
  return str
    .trim()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const fallbackIndianDestinations = [
  { name: 'Andaman', slug: 'andaman' },
  { name: 'Himachal', slug: 'himachal' },
  { name: 'Rajasthan', slug: 'rajasthan' },
  { name: 'Uttarakhand', slug: 'uttarakhand' },
  { name: 'Sikkim', slug: 'sikkim' },
  { name: 'Darjeeling', slug: 'darjeeling' },
  { name: 'Meghalaya', slug: 'meghalaya' },
  { name: 'Ladakh', slug: 'ladakh' },
  { name: 'Ooty', slug: 'ooty' },
];

const fallbackHoneymoonPackages = [
  { name: 'Kashmir Paradise', slug: 'kashmir-paradise', package_type: 'domestic' },
  { name: 'Thailand Beach Combo — 7N8D', slug: 'thailand-beach-combo-7n8d', package_type: 'domestic' },
  { name: 'Bangkok Explorer', slug: 'bangkok-explorer-5n6d', package_type: 'international' },
  { name: 'Switzerland Alps Adventure — 7N8D', slug: 'switzerland-alps-adventure-7n8d', package_type: 'domestic' },
  { name: 'Paris Honeymoon Special — 6N7D', slug: 'paris-honeymoon-special-6n7d', package_type: 'international' },
  { name: 'Dubai Family Fun — 3N4D', slug: 'dubai-family-fun-3n4d', package_type: 'domestic' },
  { name: 'Maldives Overwater Bungalow — 5N6D', slug: 'maldives-overwater-bungalow-5n6d', package_type: 'domestic' },
  { name: 'Bali Adventure Rush — 4N5D', slug: 'bali-adventure-rush-4n5d', package_type: 'international' },
  { name: 'Bali Bliss — 5N6D Honeymoon', slug: 'bali-bliss-5n6d-honeymoon', package_type: 'domestic' },
];

export default async function SeoLinksSection() {
  const [allDestinationsRaw, categories, allPackagesRaw] = await Promise.all([
    getDestinations(),
    getPackageCategories(),
    getPackages({ limit: 200 }),
  ]);

  const allDestinations = Array.isArray(allDestinationsRaw) ? allDestinationsRaw : [];
  const allPackages = Array.isArray(allPackagesRaw) ? allPackagesRaw : [];

  // Filter out invalid/test entries
  const validDestinations = allDestinations.filter(
    (d) => d && d.name && d.name.trim() && d.slug && d.slug !== 'rajjjjj'
  );

  // 1. International Destinations: type === 'international'
  const internationalDestinations = validDestinations.filter(
    (d) => String(d.type || '').toLowerCase().trim() === 'international'
  );

  // 2. Domestic Destinations: type === 'domestic' or Kashmir
  const domesticApiDestinations = validDestinations.filter((d) => {
    const type = String(d.type || '').toLowerCase().trim();
    const slug = String(d.slug || '').toLowerCase().trim();
    return type === 'domestic' || slug === 'kashmir';
  });

  // Combine dynamic domestic destinations with fallback Indian destinations (no duplicates)
  const domesticNamesSet = new Set(
    domesticApiDestinations.map((d) => d.name.toLowerCase().trim())
  );
  const indianDestinationsList = [
    ...domesticApiDestinations,
    ...fallbackIndianDestinations.filter((f) => !domesticNamesSet.has(f.name.toLowerCase())),
  ];

  const categoriesList = Array.isArray(categories)
    ? categories.filter((c) => c && c.title).slice(0, 16)
    : [];

  // 3. Honeymoon Packages (using the exact same logic as HoneymoonToursSection.js):
  // Filter packages that belong to 'honeymoon' category or have honeymoon in name/slug
  const hasCategory = (pkg, categoryMatch) =>
    Array.isArray(pkg?.package_categories) &&
    pkg.package_categories.some(
      (cat) =>
        String(cat?.slug || '').toLowerCase().includes(categoryMatch) ||
        String(cat?.title || '').toLowerCase().includes(categoryMatch)
    );

  const isHoneymoonPackage = (pkg) =>
    hasCategory(pkg, 'honeymoon') ||
    /honeymoon|romantic/i.test(`${pkg?.name || ''} ${pkg?.slug || ''}`);

  const dynamicHoneymoonPackages = allPackages.filter(
    (p) => p && p.slug && p.name && isHoneymoonPackage(p)
  );

  const rawHoneymoonList = dynamicHoneymoonPackages.length > 0
    ? dynamicHoneymoonPackages
    : fallbackHoneymoonPackages;

  // Deduplicate by slug
  const honeymoonPackagesList = rawHoneymoonList.filter(
    (p, index, self) => index === self.findIndex((t) => t.slug === p.slug)
  );

  if (!internationalDestinations.length && !indianDestinationsList.length && !honeymoonPackagesList.length) return null;

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
          padding: 36px 40px 36px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .seo-category-title {
          font-family: "Italiana", sans-serif;
          font-size: 36px;
          margin-bottom: 24px;
          color: var(--color-text-primary, #1F2A44);
          font-weight: 600;
          letter-spacing: 0.5px;
          text-align: center;
          position: relative;
        }

        .seo-category-title.theme-underline-heading::after,
        .theme-underline-heading::after {
          background-color: var(--color-primary, #AA8453) !important;
        }
        .seo-category-title.theme-underline-heading::before,
        .theme-underline-heading::before {
          border-bottom-color: var(--color-primary, #AA8453) !important;
        }

        .seo-links-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px 20px;
        }

        .seo-link {
          color: #1F2A44;
          text-decoration: none;
          font-size: 18px;
          font-weight: 400;
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .seo-link:hover {
          color: var(--color-secondary, #FF6000);
          transform: translateX(4px);
        }

        .seo-divider {
          height: 1px;
          background-color: rgba(31, 42, 68, 0.1);
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
            font-size: 24px;
            margin-bottom: 16px;
          }
          .seo-links-section {
            padding: 24px 16px 20px;
          }
          .seo-links-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px 12px;
          }
          .seo-divider {
            margin: 20px 0;
          }
        }

        @media (max-width: 480px) {
          .seo-links-section {
            padding: 20px 14px 16px;
          }
          .seo-links-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px 10px;
          }
          .seo-link {
            font-size: 13px;
          }
          .seo-divider {
            margin: 16px 0;
          }
        }
      `}</style>

      <div className="container">
        {/* 1. International Holiday Destinations (type: 'international') */}
        {internationalDestinations.length > 0 && (
          <div className="seo-block">
            <div style={{ textAlign: 'center' }}>
              <h3 className="theme-underline-heading seo-category-title">
                International Holiday Destinations
              </h3>
            </div>
            <div className="seo-links-grid">
              {internationalDestinations.slice(0, 16).map((d, i) => (
                <Link
                  key={d.slug || i}
                  href={`/tours?search=${encodeURIComponent(d.name)}&destination=${encodeURIComponent(d.slug)}`}
                  className="seo-link"
                >
                  {formatName(d.name)} Tour Packages
                </Link>
              ))}
            </div>
            <div className="seo-divider"></div>
          </div>
        )}

        {/* 2. Indian Holiday Packages (type: 'domestic') */}
        {indianDestinationsList.length > 0 && (
          <div className="seo-block">
            <div style={{ textAlign: 'center' }}>
              <h3 className="theme-underline-heading seo-category-title">
                Indian Holiday Packages
              </h3>
            </div>
            <div className="seo-links-grid">
              {indianDestinationsList.slice(0, 16).map((d, i) => (
                <Link
                  key={d.slug || i}
                  href={`/tours?search=${encodeURIComponent(d.name)}&destination=${encodeURIComponent(d.slug || d.name.toLowerCase())}`}
                  className="seo-link"
                >
                  {formatName(d.name)} Tour Packages
                </Link>
              ))}
            </div>
            {(categoriesList.length > 0 || honeymoonPackagesList.length > 0) && (
              <div className="seo-divider"></div>
            )}
          </div>
        )}

        {/* Themed Destinations (Optional) */}
        {categoriesList.length > 0 && (
          <div className="seo-block">
            <div style={{ textAlign: 'center' }}>
              <h3 className="theme-underline-heading seo-category-title">
                Themed Destinations
              </h3>
            </div>
            <div className="seo-links-grid">
              {categoriesList.map((c, i) => {
                const label = c.title.toLowerCase().includes('package')
                  ? c.title
                  : `${c.title} Packages`;
                return (
                  <Link
                    key={i}
                    href={`/collections/${c.slug}`}
                    className="seo-link"
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
            {honeymoonPackagesList.length > 0 && <div className="seo-divider"></div>}
          </div>
        )}

        {/* 3. Honeymoon Packages (All Domestic and International packages) */}
        {honeymoonPackagesList.length > 0 && (
          <div className="seo-block">
            <div style={{ textAlign: 'center' }}>
              <h3 className="theme-underline-heading seo-category-title">
                Honeymoon Packages
              </h3>
            </div>
            <div className="seo-links-grid">
              {honeymoonPackagesList.map((p, i) => (
                <Link
                  key={p.slug || i}
                  href={`/package/${p.slug}`}
                  className="seo-link"
                >
                  {p.name?.trim()}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
