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

db.exec(`
  CREATE TABLE IF NOT EXISTS tour_package (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    duration TEXT NOT NULL, -- e.g. "3 Days / 2 Nights"
    maxPersons INTEGER NOT NULL DEFAULT 1,
    thumbnail TEXT NOT NULL DEFAULT '',
    gallery TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tour_package_vehicle (
    tourPackageId TEXT NOT NULL,
    vehicleId TEXT NOT NULL,
    PRIMARY KEY (tourPackageId, vehicleId),
    FOREIGN KEY (tourPackageId) REFERENCES tour_package(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicleId) REFERENCES vehicle(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS review (
    id TEXT PRIMARY KEY,
    tourPackageId TEXT NOT NULL,
    userId TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    reviewerName TEXT,
    reviewerImage TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tourPackageId) REFERENCES tour_package(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS booking (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    tourPackageId TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
    stripeSessionId TEXT UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (tourPackageId) REFERENCES tour_package(id) ON DELETE CASCADE
  )
`);

// Migration to add columns if they don't exist (for existing databases)
try {
  db.exec("ALTER TABLE vehicle ADD COLUMN thumbnail TEXT NOT NULL DEFAULT ''");
} catch (e) {}
try {
  db.exec("ALTER TABLE vehicle ADD COLUMN gallery TEXT");
} catch (e) {}

try {
  db.exec("ALTER TABLE tour_package ADD COLUMN maxPersons INTEGER NOT NULL DEFAULT 1");
} catch (e) {}

try {
  db.exec("ALTER TABLE review ADD COLUMN reviewerName TEXT");
} catch (e) {}
try {
  db.exec("ALTER TABLE review ADD COLUMN reviewerImage TEXT");
} catch (e) {}
