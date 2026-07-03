import { db } from '@/lib/db';
import CafeApp from '@/components/CafeApp';

export default async function Home() {
  const categories = await db.menuCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  });
  const settings = await db.siteSettings.findUnique({ where: { id: 'main' } });
  const theme = await db.themeSettings.findUnique({ where: { id: 'main' } });

  return (
    <CafeApp
      categories={categories}
      settings={settings}
      theme={theme}
    />
  );
}