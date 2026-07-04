import { createClient, type Client } from '@libsql/client';

let _client: Client | undefined;

export function getDb(): Client {
  if (!_client) {
    const url = process.env.DATABASE_URL || 'file:db/custom.db';
    const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;
    try {
      _client = createClient({ url, ...(authToken ? { authToken } : {}) });
    } catch {
      throw new Error('DB client creation failed');
    }
  }
  return _client;
}

let _db: Client | null = null;

export const db = new Proxy({} as Client, {
  get(_target, prop) {
    if (!_db) {
      try {
        _db = getDb();
      } catch {
        return () => {
          throw new Error('Database not available');
        };
      }
    }
    const value = (_db as any)[prop];
    if (typeof value === 'function') {
      return value.bind(_db);
    }
    return value;
  },
});