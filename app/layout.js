import './globals.css';

// Fonts imported globally in globals.css
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BootstrapClient from '@/components/BootstrapClient';
import GlobalInquiryModal from '@/components/GlobalInquiryModal';
import ThemeColoursClient from '@/components/ThemeColoursClient';
import ToastProvider from '@/components/ToastProvider';
import { WishlistProvider } from '@/components/WishlistProvider';
import { getCompanyInfo } from '@/utils/companyInfo';
import { getProjectConfig } from '@/utils/projectConfig';
import { getThemeColours } from '@/utils/themeColours';

const projectConfig = getProjectConfig();

export const dynamic = 'force-dynamic';

export const metadata = {
  metadataBase: new URL('https://wanderlust-tours.com'),
  title: {
    default: `${projectConfig.displayName} - Premium Travel Booking`,
    template: `%s | ${projectConfig.displayName}`,
  },
  description:
    `Discover handcrafted travel experiences. Book luxury tours to the world's most breathtaking destinations with ${projectConfig.legalName}.`,
  keywords: ['travel', 'tours', 'vacation', 'holiday packages', 'adventure travel', 'luxury travel'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://wanderlust-tours.com',
    siteName: projectConfig.displayName,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=75',
        width: 1200,
        height: 630,
        alt: projectConfig.displayName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@wanderlusttours',
  },
};

export default async function RootLayout({ children }) {
  const [companyInfo, themeColours] = await Promise.all([
    getCompanyInfo(),
    getThemeColours(),
  ]);
  const projectTheme = {
    '--brand-primary': projectConfig.primary,
    '--brand-primary-hover': projectConfig.primaryHover,
    '--brand-primary-light': projectConfig.primaryLight,
    '--brand-primary-border': projectConfig.primaryBorder,
    '--brand-secondary': projectConfig.secondary,
    '--brand-secondary-hover': projectConfig.secondaryHover,
    '--color-primary': 'var(--brand-primary)',
    '--color-primary-hover': 'var(--brand-primary-hover)',
    '--color-primary-light': 'var(--brand-primary-light)',
    '--color-secondary': 'var(--brand-secondary)',
    '--color-secondary-hover': 'var(--brand-secondary-hover)',
    '--bs-primary': 'var(--color-primary)',
    '--bs-secondary': 'var(--color-secondary)',
    '--bs-link-color': 'var(--color-primary)',
    '--bs-link-hover-color': 'var(--color-primary-hover)',
    '--gradient-primary': 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
    '--gradient-warm': 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-hover) 100%)',

    // Extended Dashboard Variables (Fallbacks)
    '--color-background': '#F3EFE6',
    '--color-surface': '#F3EFE6',
    '--color-card': '#ffffff',
    '--color-text': '#1F2A44',
    '--color-text-secondary': '#2A3859',
    '--color-border': '#D1B464',
    '--shadow-sm': '0 2px 5px rgba(0,0,0,0.06)',
    '--shadow-md': '0 10px 30px rgba(0,0,0,0.10)',
    '--shadow-lg': '0 20px 45px rgba(0,0,0,0.14)',
    '--radius-sm': '8px',
    '--radius-md': '12px',
    '--radius-lg': '16px',
    '--space-1': '4px',
    '--space-2': '8px',
    '--space-3': '12px',
    '--transition-fast': '150ms ease',
    '--transition-base': '250ms cubic-bezier(0.4,0,0.2,1)',
    '--gradient-card': 'linear-gradient(180deg, transparent 35%, rgba(11,60,93,.92) 100%)',
    '--gradient-hero': 'linear-gradient(180deg, rgba(11,60,93,0) 0%, rgba(11,60,93,.90) 100%)',
  };
  const activeTheme = { ...projectTheme, ...themeColours };

  return (
    <html lang="en" data-theme="light" data-project={projectConfig.key} data-scroll-behavior="smooth">
      <body style={activeTheme}>
        <BootstrapClient />
        <ThemeColoursClient initialVariables={activeTheme} />
        <WishlistProvider>
          <Navbar brand={projectConfig} companyInfo={companyInfo} />
          <GlobalInquiryModal brand={projectConfig} companyInfo={companyInfo} />
          <main>{children}</main>
          <Footer brand={projectConfig} companyInfo={companyInfo} />
          <ToastProvider />
        </WishlistProvider>
      </body>
    </html>
  );
}
