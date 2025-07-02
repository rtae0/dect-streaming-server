import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { PATHS } from "@/config/paths";

// 📌 DB 연결 함수
async function getDB() {
  return open({ filename: PATHS.DB_FILE, driver: sqlite3.Database });
}

// 📌 비디오 태그 업데이트 API
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: videoId } = await context.params; // ✅ `await` 추가하여 `Promise` 해제
    const { tags } = await req.json();

    if (!videoId || !Array.isArray(tags)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const db = await getDB();

    // 🔥 기존 태그 삭제
    await db.run("DELETE FROM video_tags WHERE video_id = ?", [videoId]);

    // ✅ 태그가 빈 배열이면 여기서 종료 (모든 태그 삭제만 수행)
    if (tags.length === 0) {
      await db.close();
      return NextResponse.json({ success: true, message: "All tags removed." });
    }

    // ✅ 유효한 태그만 필터링 (공백 제거 후 빈 문자열 제외)
    const filteredTags = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);

    for (const tag of filteredTags) {
      try {
        // 🔍 태그 ID 조회 (존재하지 않으면 NULL)
        const tagRow = await db.get("SELECT id FROM tags WHERE tag = ?", [tag]);

        if (!tagRow) {
          console.warn(`⚠️ 태그 '${tag}'이(가) 존재하지 않습니다. 추가하지 않습니다.`);
          continue; // 존재하지 않는 태그는 추가하지 않음
        }

        // 🎯 새 태그 연결 추가
        await db.run("INSERT INTO video_tags (video_id, tag_id) VALUES (?, ?)", [videoId, tagRow.id]);
      } catch (innerError) {
        console.error(`❌ 태그 '${tag}' 추가 중 오류 발생:`, innerError);
      }
    }

    await db.close();
    return NextResponse.json({ success: true, message: "Tags updated successfully." });
  } catch (error) {
    console.error("❌ 태그 업데이트 오류:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}