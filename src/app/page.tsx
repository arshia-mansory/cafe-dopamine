import { db } from '@/lib/db';
import CafeApp from '@/components/CafeApp';

// Force dynamic rendering - data comes from Turso at request time
export const dynamic = 'force-dynamic';

export default async function Home() {
  const [catResult, sResult, tResult] = await Promise.all([
    db.execute(`
      SELECT
        c.id as catId, c.name as catName, c.icon as catIcon, c."sortOrder" as catSortOrder,
        c.image as catImage, c."createdAt" as catCreatedAt, c."updatedAt" as catUpdatedAt,
        i.id as itemId, i.name as itemName, i.description as itemDesc, i.price as itemPrice,
        i."sortOrder" as itemSortOrder, i.available as itemAvailable,
        i.featured as itemFeatured, i.image as itemImage,
        i."createdAt" as itemCreatedAt, i."updatedAt" as itemUpdatedAt
      FROM "MenuCategory" c
      LEFT JOIN "MenuItem" i ON i."categoryId" = c.id
      ORDER BY c."sortOrder" ASC, i."sortOrder" ASC
    `),
    db.execute(`SELECT * FROM "SiteSettings" WHERE id = 'main'`),
    db.execute(`SELECT * FROM "ThemeSettings" WHERE id = 'main'`),
  ]);

  // Build category tree from flat rows
  const catMap = new Map<string, any>();
  for (const r of catResult.rows) {
    if (!catMap.has(r.catId)) {
      catMap.set(r.catId, {
        id: r.catId,
        name: r.catName,
        icon: r.catIcon,
        sortOrder: r.catSortOrder,
        image: r.catImage,
        createdAt: r.catCreatedAt,
        updatedAt: r.catUpdatedAt,
        items: [],
      });
    }
    if (r.itemId) {
      catMap.get(r.catId).items.push({
        id: r.itemId,
        name: r.itemName,
        description: r.itemDesc,
        price: r.itemPrice,
        categoryId: r.catId,
        sortOrder: r.itemSortOrder,
        available: Boolean(r.itemAvailable),
        featured: Boolean(r.itemFeatured),
        image: r.itemImage,
        createdAt: r.itemCreatedAt,
        updatedAt: r.itemUpdatedAt,
      });
    }
  }
  const categories = Array.from(catMap.values());
  const settings = sResult.rows[0] || null;
  const theme = tResult.rows[0] || null;

  return (
    <CafeApp
      categories={categories}
      settings={settings}
      theme={theme}
    />
  );
}