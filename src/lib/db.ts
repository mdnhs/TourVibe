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
