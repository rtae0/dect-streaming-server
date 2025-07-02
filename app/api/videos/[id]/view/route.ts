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

// 📌 비디오 조회수 증가 API (하루에 한 번만 증가)
export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const { id: videoId } = await context.params; // ✅ `context.params`를 비동기적으로 처리

    if (!videoId) {
      return NextResponse.json({ error: "Missing video ID" }, { status: 400 });
    }

    // 🔥 쿠키 확인 (하루에 한 번 조회수 증가 제한)
    const cookies = req.headers.get("cookie") || "";
    const viewedVideos = new Set(
      cookies
        .split("; ")
        .find((cookie) => cookie.startsWith("viewedVideos="))
        ?.split("=")[1]
        ?.split(",") || []
    );

    if (viewedVideos.has(videoId)) {
      return NextResponse.json({ success: true, message: "오늘 이미 조회한 비디오" });
    }

    const db = await getDB();

    // 📌 조회수 증가
    await db.run("UPDATE videos SET views = views + 1 WHERE id = ?", [videoId]);

    await db.close();

    // 🔥 쿠키에 현재 비디오 ID 추가 (하루 유지)
    viewedVideos.add(videoId);
    const newCookie = `viewedVideos=${Array.from(viewedVideos).join(",")}; Path=/; Max-Age=86400`; // 1일 유지

    const response = NextResponse.json({ success: true, message: "조회수 증가 완료" });
    response.headers.set("Set-Cookie", newCookie);

    return response;
  } catch (error) {
    console.error("❌ 조회수 업데이트 오류:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}