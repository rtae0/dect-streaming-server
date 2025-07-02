import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import { PATHS } from "@/config/paths";

// 📌 DB 연결 함수
async function getDB() {
  return open({
    filename: PATHS.DB_FILE,
    driver: sqlite3.Database,
  });
}

// 📌 비디오 삭제 API
export async function DELETE(req: Request) {
  try {
    // 📌 요청 URL에서 ID 추출
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // 마지막 경로 부분이 ID
    if (!id) {
      return NextResponse.json({ error: "Missing video ID" }, { status: 400 });
    }

    const db = await getDB();

    // 📌 비디오 파일명 조회
    const video = await db.get("SELECT file_name FROM videos WHERE id = ?", id);
    if (!video) {
      await db.close();
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // 📌 비디오 데이터 삭제 (DB에서 제거)
    await db.run("DELETE FROM video_tags WHERE video_id = ?", id); // 태그 연결도 삭제
    await db.run("DELETE FROM videos WHERE id = ?", id);
    await db.close();

    // 📌 파일 경로 설정
    const videoPath = PATHS.getVideoPath(video.file_name);
    const thumbnailPath = PATHS.getThumbnailPath(video.file_name);
    // 📌 비디오 파일 삭제
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
      console.log(`🗑️ Deleted video file: ${videoPath}`);
    } else {
      console.log(`⚠️ Video file not found: ${videoPath}`);
    }

    // 📌 썸네일 파일 삭제
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
      console.log(`🗑️ Deleted thumbnail file: ${thumbnailPath}`);
    } else {
      console.log(`⚠️ Thumbnail file not found: ${thumbnailPath}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ 비디오 삭제 오류:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


// 📌 비디오 정보 업데이트 API
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // ✅ `params`를 `await`하여 비동기 처리
    const { title, description, rate } = await req.json();

    console.log("📌 Received PUT request body:", { title, description, rate });

    // 🔥 `title`이 비어 있으면 기본값 "제목 없음"으로 설정
    const finalTitle = title && title.trim() !== "" ? title.trim() : "제목없음";

    const db = await getDB();

    // 🎯 업데이트 실행 (`description`은 빈 값 허용)
    await db.run(
      "UPDATE videos SET title = ?, description = ?, rate = ? WHERE id = ?",
      [finalTitle, description || "", rate, id]
    );

    await db.close();
    return NextResponse.json({ success: true, title: finalTitle });
  } catch (error) {
    console.error("❌ 비디오 업데이트 오류:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}