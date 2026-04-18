import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

const dataDirectory = path.join(process.cwd(), "data");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

export const databasePath = path.join(dataDirectory, "tourvibe.sqlite");

export const db = new Database(databasePath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS vehicle (
    id TEXT PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    licensePlate TEXT NOT NULL UNIQUE,
    driverId TEXT,
    thumbnail TEXT NOT NULL DEFAULT '',
    gallery TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driverId) REFERENCES user(id) ON DELETE SET NULL
  )
`);

// Migration to add columns if they don't exist (for existing databases)
try {
  db.exec("ALTER TABLE vehicle ADD COLUMN thumbnail TEXT NOT NULL DEFAULT ''");
} catch (e) {}
try {
  db.exec("ALTER TABLE vehicle ADD COLUMN gallery TEXT");
} catch (e) {}
