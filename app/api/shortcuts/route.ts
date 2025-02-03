import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite"; // 🔥 `Database` 명확하게 지정

// 📌 SQLite3 인스턴스를 싱글톤으로 유지
let dbInstance: Database | null = null;

async function getDB(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await open({
      filename: "./database/db.sqlite",
      driver: sqlite3.Database,
    });
  }
  return dbInstance;
}

// 📌 🎯 Shortcut 목록 조회 API
export async function GET() {
  try {
    const db = await getDB();
    const shortcuts = await db.all("SELECT * FROM shortcuts ORDER BY id ASC");
    return NextResponse.json(shortcuts);
  } catch (error) {
    console.error("❌ DB Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 📌 🎯 Shortcut 추가 API
export async function POST(req: Request) {
  try {
    const { name, url, plugin_type, vpn_required } = await req.json();
    const db = await getDB();

    const result = await db.run(
      "INSERT INTO shortcuts (name, url, plugin_type, vpn_required) VALUES (?, ?, ?, ?)",
      [name, url, plugin_type || null, vpn_required ? 1 : 0]
    );
    const newShortcut = { id: result.lastID, name, url, plugin_type, vpn_required };

    return NextResponse.json(newShortcut);
  } catch (error) {
    console.error("❌ Shortcut 추가 오류:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 📌 🎯 Shortcut 삭제 API
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const db = await getDB();

    await db.run("DELETE FROM shortcuts WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Shortcut 삭제 오류:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}