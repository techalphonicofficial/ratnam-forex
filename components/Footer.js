import FooterClient from './FooterClient';
import SeoLinksSection from './SeoLinksSection';
import { getCompanyInfo } from '@/utils/companyInfo';

export default async function Footer({ brand, companyInfo: providedCompanyInfo }) {
  const companyInfo = providedCompanyInfo ?? await getCompanyInfo();
  return (
    <>
      <SeoLinksSection />
      <FooterClient brand={brand} companyInfo={companyInfo} />
    </>
  );
}
