import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { PATHS } from "@/config/paths";

// 📌 DB 연결 함수
async function getDB() {
  return open({
    filename: PATHS.DB_FILE,
    driver: sqlite3.Database,
  });
}

// 📌 🎯 즐겨찾기 상태 변경 API
export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params; // 🔥 params를 await으로 처리
    const { favorite } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing video ID" }, { status: 400 });
    }

    const db = await getDB();
    await db.run(`UPDATE videos SET favorite = ? WHERE id = ?`, [favorite ? 1 : 0, id]);
    await db.close();

    return NextResponse.json({ success: true, favorite });
  } catch (error) {
    console.error("❌ DB Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}