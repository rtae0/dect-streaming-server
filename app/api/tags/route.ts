import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// DB 연결 함수
async function getDB() {
  return open({
    filename: "./database/db.sqlite",
    driver: sqlite3.Database,
  });
}

// 태그 목록 가져오기 API (카테고리별 그룹화)
export async function GET() {
  try {
    const db = await getDB();
    const tags = await db.all("SELECT tag, category FROM tags ORDER BY category, tag ASC");
    await db.close();

    // 카테고리별로 그룹화
    const groupedTags: Record<string, string[]> = {};
    tags.forEach(({ tag, category }) => {
      if (!groupedTags[category]) groupedTags[category] = [];
      groupedTags[category].push(tag);
    });

    return NextResponse.json(groupedTags);
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// 📌 🎯 태그 추가 API (카테고리 상관없이 중복 체크)
export async function POST(req: Request) {
  try {
    const { category, tag } = await req.json();

    if (!category || !tag) {
      return NextResponse.json(
        { error: "❌ 카테고리와 태그가 필요합니다." },
        { status: 400 }
      );
    }

    const db = await getDB();

    // 🔥 카테고리와 관계없이 동일한 태그가 있는지 확인
    const existingTag = await db.get("SELECT id FROM tags WHERE tag = ?", [tag]);

    if (existingTag) {
      await db.close();
      return NextResponse.json(
        { error: "⚠️ 이미 존재하는 태그입니다." },
        { status: 409 }
      );
    }

    // ✅ 태그 추가
    await db.run("INSERT INTO tags (category, tag) VALUES (?, ?)", [category, tag]);

    await db.close();
    return NextResponse.json({ success: true, message: `✅ 태그 "${tag}" 추가 완료` });
  } catch (error) {
    console.error("❌ 태그 추가 오류:", error);
    return NextResponse.json(
      { error: "❌ 서버 오류 발생" },
      { status: 500 }
    );
  }
}
// 📌 🎯 태그 삭제 API
export async function DELETE(req: Request) {
  try {
    const { category, tag } = await req.json();

    if (!category || !tag) {
      return NextResponse.json({ error: "카테고리와 태그가 필요합니다." }, { status: 400 });
    }

    const db = await getDB();

    // 🔥 태그가 존재하는지 확인
    const existingTag = await db.get(
      "SELECT * FROM tags WHERE category = ? AND tag = ?",
      [category, tag]
    );

    if (!existingTag) {
      await db.close();
      return NextResponse.json({ error: "존재하지 않는 태그입니다." }, { status: 404 });
    }

    // 🔥 태그 삭제 (연관된 video_tags 데이터도 삭제)
    await db.run("DELETE FROM video_tags WHERE tag_id = (SELECT id FROM tags WHERE category = ? AND tag = ?)", 
      [category, tag]);

    await db.run("DELETE FROM tags WHERE category = ? AND tag = ?", [category, tag]);

    await db.close();
    return NextResponse.json({ success: true, message: "태그 삭제 완료" });
  } catch (error) {
    console.error("❌ 태그 삭제 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
