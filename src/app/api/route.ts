import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import sharp from 'sharp';

const ADMIN_PASSWORD = 'dopamine1403';

function checkAuth(request: NextRequest): boolean {
  return request.headers.get('x-admin-password') === ADMIN_PASSWORD;
}

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function ok(data: unknown) {
  return NextResponse.json(data);
}

async function imageToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const resized = await sharp(buffer)
    .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  return `data:image/jpeg;base64,${resized.toString('base64')}`;
}

// Helper to build category objects from raw rows
function buildCategory(rows: any[]) {
  const map = new Map<string, any>();
  for (const r of rows) {
    if (!map.has(r.catId)) {
      map.set(r.catId, {
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
      map.get(r.catId).items.push({
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
  return Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'menu': {
        const result = await db.execute(`
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
        `);
        return ok(buildCategory(result.rows));
      }
      case 'settings': {
        const [s, t] = await Promise.all([
          db.execute(`SELECT * FROM "SiteSettings" WHERE id = 'main'`),
          db.execute(`SELECT * FROM "ThemeSettings" WHERE id = 'main'`),
        ]);
        return ok({
          settings: s.rows[0] || null,
          theme: t.rows[0] || null,
        });
      }
      case 'featured': {
        const result = await db.execute(`
          SELECT i.*, c.name as categoryName, c.icon as categoryIcon
          FROM "MenuItem" i
          JOIN "MenuCategory" c ON c.id = i."categoryId"
          WHERE i.featured = 1 AND i.available = 1
          ORDER BY i."sortOrder" ASC
        `);
        return ok(result.rows);
      }
      default:
        return error('Unknown action', 400);
    }
  } catch (e) {
    console.error('GET error:', e);
    return error('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'login': {
        const body = await request.json();
        if (body.password === ADMIN_PASSWORD) {
          return ok({ success: true, admin: true });
        }
        return error('Invalid password', 401);
      }
      case 'category': {
        if (!checkAuth(request)) return error('Unauthorized', 401);
        const body = await request.json();
        const id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        const now = new Date().toISOString();
        await db.execute({
          sql: `INSERT INTO "MenuCategory" (id, name, icon, "sortOrder", image, "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [id, body.name, body.icon || '☕', body.sortOrder ?? 0, body.image || '', now, now],
        });
        return ok({ id, name: body.name });
      }
      case 'item': {
        if (!checkAuth(request)) return error('Unauthorized', 401);
        const body = await request.json();
        const id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        const now = new Date().toISOString();
        await db.execute({
          sql: `INSERT INTO "MenuItem" (id, name, description, price, "categoryId", "sortOrder", available, featured, image, "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [id, body.name, body.description || '', body.price ?? 0, body.categoryId, body.sortOrder ?? 0, body.available ? 1 : 0, body.featured ? 1 : 0, body.image || '', now, now],
        });
        return ok({ id, name: body.name });
      }
      case 'upload': {
        if (!checkAuth(request)) return error('Unauthorized', 401);
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        if (!file) return error('File is required');
        const base64 = await imageToBase64(file);
        return ok({ path: base64 });
      }
      default:
        return error('Unknown action', 400);
    }
  } catch (e) {
    console.error('POST error:', e);
    return error('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'item': {
        if (!checkAuth(request)) return error('Unauthorized', 401);
        const body = await request.json();
        if (!body.id) return error('Item id is required');
        const { id, ...data } = body;
        const now = new Date().toISOString();
        const sets: string[] = ['"updatedAt" = ?'];
        const args: any[] = [now];
        for (const [key, val] of Object.entries(data)) {
          sets.push(`"${key}" = ?`);
          if (typeof val === 'boolean') args.push(val ? 1 : 0);
          else args.push(val);
        }
        args.push(id);
        await db.execute({ sql: `UPDATE "MenuItem" SET ${sets.join(', ')} WHERE id = ?`, args });
        return ok({ success: true });
      }
      case 'category': {
        if (!checkAuth(request)) return error('Unauthorized', 401);
        const body = await request.json();
        if (!body.id) return error('Category id is required');
        const { id, ...data } = body;
        const now = new Date().toISOString();
        const sets: string[] = ['"updatedAt" = ?'];
        const args: any[] = [now];
        for (const [key, val] of Object.entries(data)) {
          sets.push(`"${key}" = ?`);
          args.push(val);
        }
        args.push(id);
        await db.execute({ sql: `UPDATE "MenuCategory" SET ${sets.join(', ')} WHERE id = ?`, args });
        return ok({ success: true });
      }
      case 'settings': {
        if (!checkAuth(request)) return error('Unauthorized', 401);
        const body = await request.json();
        const now = new Date().toISOString();
        const sets: string[] = ['"updatedAt" = ?'];
        const args: any[] = [now];
        for (const [key, val] of Object.entries(body)) {
          sets.push(`"${key}" = ?`);
          args.push(val);
        }
        args.push('main');
        await db.execute({ sql: `UPDATE "SiteSettings" SET ${sets.join(', ')} WHERE id = ?`, args });
        return ok({ success: true });
      }
      case 'theme': {
        if (!checkAuth(request)) return error('Unauthorized', 401);
        const body = await request.json();
        const now = new Date().toISOString();
        const sets: string[] = ['"updatedAt" = ?'];
        const args: any[] = [now];
        for (const [key, val] of Object.entries(body)) {
          sets.push(`"${key}" = ?`);
          args.push(val);
        }
        args.push('main');
        await db.execute({ sql: `UPDATE "ThemeSettings" SET ${sets.join(', ')} WHERE id = ?`, args });
        return ok({ success: true });
      }
      case 'reorder': {
        if (!checkAuth(request)) return error('Unauthorized', 401);
        const body = await request.json();
        if (!Array.isArray(body.items)) return error('items array is required');
        for (const item of body.items) {
          await db.execute({
            sql: `UPDATE "MenuItem" SET "sortOrder" = ? WHERE id = ?`,
            args: [item.sortOrder, item.id],
          });
        }
        return ok({ success: true });
      }
      default:
        return error('Unknown action', 400);
    }
  } catch (e) {
    console.error('PUT error:', e);
    return error('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const id = searchParams.get('id');

  try {
    if (!checkAuth(request)) return error('Unauthorized', 401);
    if (!id) return error('ID is required');

    switch (action) {
      case 'item': {
        await db.execute({ sql: `DELETE FROM "MenuItem" WHERE id = ?`, args: [id] });
        return ok({ success: true });
      }
      case 'category': {
        await db.execute({ sql: `DELETE FROM "MenuCategory" WHERE id = ?`, args: [id] });
        return ok({ success: true });
      }
      default:
        return error('Unknown action', 400);
    }
  } catch (e) {
    console.error('DELETE error:', e);
    return error('Internal server error', 500);
  }
}