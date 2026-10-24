import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Corporate Tour Packages | Travel Holiday',
  description: 'Professional corporate travel, team outings, and conferences planned to perfection.',
};

export default function CorporatePackagesPage() {
  redirect('/customize?step=0&subStep=room-config&traveller=Corporate');
}
