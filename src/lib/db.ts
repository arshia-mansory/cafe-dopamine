import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || 'file:db/custom.db';
  const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

  const libsql = createClient({
    url: dbUrl,
    ...(authToken ? { authToken } : {}),
  });

  const adapter = new PrismaLibSQL(libsql);
  return new PrismaClient({ adapter });
}

// Lazy init - only connect when actually used, not during build
let _db: PrismaClient | undefined;

function getDb(): PrismaClient {
  if (!_db) {
    _db = createPrismaClient();
  }
  return _db;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

if (process.env.NODE_ENV !== 'production') {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = _db;
  }
}