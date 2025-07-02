import { NextResponse } from "next/server";
import { spawn, exec } from "child_process";
import path from "path";
import { PATHS } from "@/config/paths";
import fs from "fs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// 📌 다운로드 폴더 및 스크립트 경로 설정
const DATA_DIR = PATHS.DATA_DIR;
const SCRIPT_PATH = path.join(process.cwd(), "scripts", "generate_thumbnail.py");

// 📌 DB 연결 함수
async function getDB() {
  return open({ filename: PATHS.DB_FILE, driver: sqlite3.Database });
}

// 📌 현재 날짜 및 시간 기반 파일명 생성 (YYMMDD_HHMMSS)
function getTimestampFilename() {
  const now = new Date();
  const YY = now.getFullYear().toString().slice(2);
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const DD = String(now.getDate()).padStart(2, "0");
  const HH = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const SS = String(now.getSeconds()).padStart(2, "0");

  return `${YY}${MM}${DD}_${HH}${mm}${SS}`;
}

// 📌 FFprobe로 영상 길이 가져오기
async function getVideoDuration(videoPath: string): Promise<number | null> {
  return new Promise((resolve) => {
    exec(
      `ffprobe -v error -select_streams v:0 -show_entries format=duration -of csv=p=0 "${videoPath}"`,
      (error, stdout, stderr) => {
        if (error || stderr) {
          console.error("❌ FFprobe 실행 오류:", error || stderr);
          return resolve(null);
        }
        const duration = parseFloat(stdout.trim());
        resolve(isNaN(duration) ? null : duration);
      }
    );
  });
}

// 📌 ✅ 썸네일 생성 함수 (Python 스크립트 실행)
async function generateThumbnail(videoPath: string, thumbnailPath: string) {
  return new Promise((resolve, reject) => {
    exec(`python3 "${SCRIPT_PATH}" "${videoPath}" "${thumbnailPath}"`, (error, stdout, stderr) => {
      if (error || stderr) {
        console.error("❌ 썸네일 생성 오류:", error || stderr);
        reject(error);
      } else {
        console.log("✅ 썸네일 생성 완료:", thumbnailPath);
        resolve(thumbnailPath);
      }
    });
  });
}

// 📌 다운로드 API
export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const db = await getDB();

    // 🔥 yt-dlp에서 원본 제목 가져오기
    const titleProcess = spawn("yt-dlp", ["--print", "%(title)s", "--skip-download", url]);
    let videoTitle = "";

    for await (const chunk of titleProcess.stdout) {
      videoTitle += chunk.toString().trim();
    }

    if (!videoTitle) {
      throw new Error("비디오 제목을 가져오지 못했습니다.");
    }

    // 🔥 현재 날짜 및 시간 기반 파일명 생성
    const timestampFileName = getTimestampFilename();
    const outputPath = path.join(DATA_DIR, `${timestampFileName}.mp4`);

    // 🔥 yt-dlp로 영상 다운로드 (MP4 포맷)
    await new Promise((resolve, reject) => {
      const process = spawn("yt-dlp", [
        "-f", "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]",
        "--no-mtime",
        "-o", outputPath, // ✅ 날짜 기반 파일명 사용
        url,
      ]);

      process.stdout.on("data", (data) => console.log(`yt-dlp: ${data}`));
      process.stderr.on("data", (data) => console.error(`yt-dlp Error: ${data}`));

      process.on("close", (code) => {
        if (code === 0) {
          console.log(`✅ 다운로드 완료: ${timestampFileName}.mp4`);
          resolve(true);
        } else {
          reject(new Error("❌ 다운로드 실패"));
        }
      });
    });

    // 🔥 썸네일 생성
    const thumbnailPath = path.join(DATA_DIR, `${timestampFileName}.png`);
    console.log(`🎥 썸네일 생성 중: ${thumbnailPath}`);

    try {
      await generateThumbnail(outputPath, thumbnailPath);
    } catch (err) {
      console.error("⚠️ 썸네일 생성 실패");
    }

    // 📌 파일 정보 가져오기
    const fileStat = fs.statSync(outputPath);
    const modifiedDate = new Date(fileStat.mtimeMs).toISOString();
    const duration = await getVideoDuration(outputPath);

    // 📌 DB에 정보 저장 (파일명은 `YYMMDD_HHMMSS`, 제목은 원본 유지)
    await db.run(
      `INSERT INTO videos (file_name, title, file_size, duration, date) VALUES (?, ?, ?, ?, ?)`,
      [timestampFileName, videoTitle, fileStat.size, duration, modifiedDate] // ✅ 파일명은 날짜, 제목은 원본
    );

    console.log(`✅ DB 저장 완료: ${timestampFileName}.mp4 | 제목: ${videoTitle} | 수정일: ${modifiedDate} | 길이: ${duration}`);

    await db.close();

    // ✅ 모든 과정이 끝난 후에 새로고침 신호 보내기
    return NextResponse.json({ success: true, message: "Download completed", refresh: true });

  } catch (error) {
    console.error("❌ Download Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}