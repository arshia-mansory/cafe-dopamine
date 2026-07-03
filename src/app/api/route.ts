import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'menu': {
        const categories = await db.menuCategory.findMany({
          orderBy: { sortOrder: 'asc' },
          include: { items: { orderBy: { sortOrder: 'asc' } } },
        });
        return ok(categories);
      }
      case 'settings': {
        const [settings, theme] = await Promise.all([
          db.siteSettings.findUnique({ where: { id: 'main' } }),
          db.themeSettings.findUnique({ where: { id: 'main' } }),
        ]);
        return ok({ settings, theme });
      }
      case 'featured': {
        const items = await db.menuItem.findMany({
          where: { featured: true, available: true },
          include: { category: true },
          orderBy: { sortOrder: 'asc' },
        });
        return ok(items);
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
        const category = await db.menuCategory.create({
          data: {
            name: body.name,
            icon: body.icon || '☕',
            sortOrder: body.sortOrder ?? 0,
            image: body.image || '',
          },
        });
        return ok(category);
      }
      case 'item': {
        if (!checkAuth(request)) return error('Unauthorized', 401);
        const body = await request.json();
        const item = await db.menuItem.create({
          data: {
            name: body.name,
            description: body.description || '',
            price: body.price ?? 0,
            categoryId: body.categoryId,
            sortOrder: body.sortOrder ?? 0,
            image: body.image || '',
            available: body.available ?? true,
            featured: body.featured ?? false,
          },
        });
        return ok(item);
      }
      case 'upload': {
        if (!checkAuth(request)) return error('Unauthorized', 401);
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const type = formData.get('type') as string | null;

        if (!file || !type) return error('File and type are required');
        if (!['hero', 'about', 'item'].includes(type)) {
          return error('Invalid type. Must be hero, about, or item');
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);
        await mkdir(uploadDir, { recursive: true });

        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        return ok({ path: `/uploads/${type}/${filename}` });
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
        const item = await db.menuItem.update({ where: { id }, data });
        return ok(item);
      }
      case 'category': {
        if (!checkAuth(request)) return error('Unauthorized', 401);
        const body = await request.json();
        if (!body.id) return error('Category id is required');
        const { id, ...data } = body;
        const category = await db.menuCategory.update({ where: { id }, data });
        return ok(category);
      }
      case 'settings': {
        if (!checkAuth(request)) return error('Unauthorized', 401);
        const body = await request.json();
        const settings = await db.siteSettings.update({
          where: { id: 'main' },
          data: body,
        });
        return ok(settings);
      }
      case 'theme': {
        if (!checkAuth(request)) return error('Unauthorized', 401);
        const body = await request.json();
        const theme = await db.themeSettings.update({
          where: { id: 'main' },
          data: body,
        });
        return ok(theme);
      }
      case 'reorder': {
        if (!checkAuth(request)) return error('Unauthorized', 401);
        const body = await request.json();
        if (!Array.isArray(body.items)) return error('items array is required');
        await Promise.all(
          body.items.map((item: { id: string; sortOrder: number }) =>
            db.menuItem.update({
              where: { id: item.id },
              data: { sortOrder: item.sortOrder },
            })
          )
        );
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
        await db.menuItem.delete({ where: { id } });
        return ok({ success: true });
      }
      case 'category': {
        await db.menuCategory.delete({ where: { id } });
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