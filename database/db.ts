import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

let db: Database | null = null;

export async function getDB() {
  if (!db) {
    db = await open({
      filename: "./database/db.sqlite",
      driver: sqlite3.Database,
    });
  }
  return db;
}