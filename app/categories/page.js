import CategoriesClient from './CategoriesClient';

export const metadata = {
  title: 'Travel Categories | Travel Holiday',
  description: 'Explore our comprehensive list of travel categories and find itineraries custom-crafted for your vibe. Perfect for couples, families, friends, luxury travelers, and more.',
  alternates: {
    canonical: '/categories',
  },
};

export default function CategoriesPage() {
  return <CategoriesClient />;
}
