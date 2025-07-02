import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import path from "path";
import { PATHS } from "@/config/paths";
import { exec } from "child_process";

// 📌 데이터 폴더 경로
const DATA_DIR = PATHS.DATA_DIR;

// 📌 DB 연결 함수
async function getDB() {
  return open({
    filename: PATHS.DB_FILE,
    driver: sqlite3.Database,
  });
}

// 📌 🎯 동기화 API (파일 추가 + 없는 파일 삭제)
export async function POST() {
  try {
    const db = await getDB();

    // 📌 현재 DB에 저장된 파일명 목록 가져오기
    const storedVideos = await db.all("SELECT id, file_name FROM videos");
    const storedFileNames = new Set(storedVideos.map((v) => v.file_name)); // 🔥 빠른 비교를 위한 Set 사용

    // 📌 "data" 폴더에서 파일 목록 가져오기
    const files = fs.readdirSync(DATA_DIR);
    const videoFiles = new Set(
      files.filter(file => file.endsWith(".mp4")).map(file => file.replace(/\.mp4$/, "")) // 🔥 확장자 제거
    );

    // ✅ 1️⃣ DB에는 없고 폴더에 있는 파일 추가
    const newVideos = [...videoFiles].filter(fileName => !storedFileNames.has(fileName));

    if (newVideos.length > 0) {
      console.log(`🔍 DB에 없는 ${newVideos.length}개 파일 추가 중...`);

      for (const fileName of newVideos) {
        const videoPath = path.join(DATA_DIR, `${fileName}.mp4`);
        const fileStat = fs.statSync(videoPath);
        const modifiedDate = new Date(fileStat.mtimeMs).toISOString(); // 📅 수정 날짜
        const fileSize = fileStat.size; // 파일 크기
        const duration = await getVideoDuration(videoPath); // ⏳ 영상 길이 가져오기

        await db.run(
          `INSERT INTO videos (file_name, title, file_size, duration, date) VALUES (?, ?, ?, ?, ?)`,
          [fileName, fileName, fileSize, duration, modifiedDate]
        );
        console.log(`✅ ${fileName} 추가 완료`);
      }
    }

    // ✅ 1️⃣ DB에는 있지만 폴더에 없는 파일 삭제
    let deletedCount = 0;
    for (const video of storedVideos) {
      const filePath = path.join(DATA_DIR, `${video.file_name}.mp4`);

      if (!videoFiles.has(video.file_name)) {
        console.log(`🗑️ 파일 없음 - DB에서 삭제: ${video.file_name}`);

        // 🔥 ✅ 비디오 태그 먼저 삭제
        await db.run("DELETE FROM video_tags WHERE video_id = ?", [video.id]);

        // 🔥 ✅ 비디오 삭제
        await db.run("DELETE FROM videos WHERE id = ?", [video.id]);

        deletedCount++;
      }
    }


    await db.close();
    return NextResponse.json({
      success: true,
      message: `${newVideos.length} new files added, ${deletedCount} missing files removed.`,
    });

  } catch (error) {
    console.error("❌ 동기화 오류:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 📌 🎯 FFprobe를 사용하여 영상 길이 가져오기
async function getVideoDuration(videoPath: string): Promise<number | null> {
  return new Promise((resolve) => {
    exec(
      `ffprobe -v error -select_streams v:0 -show_entries format=duration -of csv=p=0 "${videoPath}"`,
      (error, stdout, stderr) => {
        if (error || stderr) {
          console.error("❌ FFprobe 실행 오류:", error || stderr);
          return resolve(null); // 오류 발생 시 null 반환
        }
        const duration = parseFloat(stdout.trim());
        resolve(isNaN(duration) ? null : duration);
      }
    );
  });
}