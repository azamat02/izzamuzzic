import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', '..', 'data.db');

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Auto-migrate: create tables and columns that may not exist yet
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS hero_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_url TEXT NOT NULL DEFAULT ''
  );
`);

// Add hover_color column to release_links if missing
try {
  sqlite.exec(`ALTER TABLE release_links ADD COLUMN hover_color TEXT`);
} catch {
  // Column already exists
}

export const db = drizzle(sqlite, { schema });
export { schema };
