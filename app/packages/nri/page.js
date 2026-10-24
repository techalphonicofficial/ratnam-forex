import { redirect } from 'next/navigation';

export const metadata = {
  title: 'NRI Tour Packages | Travel Holiday',
  description: 'Special NRI tour packages crafted to reconnect you with your roots across India.',
};

export default function NriPackagesPage() {
  redirect('/customize?step=0&subStep=room-config&traveller=NRI');
}
