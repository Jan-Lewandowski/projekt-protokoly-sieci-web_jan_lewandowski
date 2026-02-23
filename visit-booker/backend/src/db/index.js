import fs from "fs/promises";
import path from "path";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

const dbPath = process.env.SQLITE_PATH
  ? path.resolve(process.env.SQLITE_PATH)
  : path.resolve("data", "visit_booker.sqlite");

const schemaPath = path.resolve("sql", "schema.sql");
const seedPath = path.resolve("sql", "seed.sql");

let dbInstance;

export async function getDb() {
  if (dbInstance) return dbInstance;

  await fs.mkdir(path.dirname(dbPath), { recursive: true });

  const dbExists = await fs
    .access(dbPath)
    .then(() => true)
    .catch(() => false);

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  if (!dbExists) {
    const schemaSql = await fs.readFile(schemaPath, "utf8");
    await db.exec(schemaSql);

    const seedSql = await fs.readFile(seedPath, "utf8");
    await db.exec(seedSql);
  }

  await ensureAppointmentEditColumns(db);

  dbInstance = db;
  return dbInstance;
}

async function ensureAppointmentEditColumns(db) {
  const columns = await db.all("PRAGMA table_info(appointments)");
  const names = new Set(columns.map((col) => col.name));
  const additions = [
    { name: "edit_requested_category_id", definition: "INTEGER" },
    { name: "edit_requested_service_id", definition: "INTEGER" },
    { name: "edit_requested_date", definition: "TEXT" },
    { name: "edit_requested_time", definition: "TEXT" },
    { name: "edit_request_status", definition: "TEXT" },
  ];

  for (const column of additions) {
    if (!names.has(column.name)) {
      await db.exec(
        `ALTER TABLE appointments ADD COLUMN ${column.name} ${column.definition}`,
      );
    }
  }
}

export async function all(sql, params = []) {
  const db = await getDb();
  return db.all(sql, params);
}

export async function get(sql, params = []) {
  const db = await getDb();
  return db.get(sql, params);
}

export async function run(sql, params = []) {
  const db = await getDb();
  return db.run(sql, params);
}
