import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { PATHS } from "@/config/paths";

let db: Database | null = null;

export async function getDB() {
  if (!db) {
    db = await open({
      filename: PATHS.DB_FILE,
      driver: sqlite3.Database,
    });
  }
  return db;
}