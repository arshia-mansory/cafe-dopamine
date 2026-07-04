import { createClient, type Client } from '@libsql/client';

let _client: Client | undefined;

export function getDb(): Client {
  if (!_client) {
    const url = process.env.DATABASE_URL || 'file:db/custom.db';
    const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;
    _client = createClient({ url, ...(authToken ? { authToken } : {}) });
  }
  return _client;
}

export const db = getDb();