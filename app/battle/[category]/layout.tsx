import { mockCategories } from '@/lib/mockData';

export async function generateStaticParams() {
  return mockCategories.map((category) => ({
    category: category.name.toLowerCase(),
  }));
}

export default function BattleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
