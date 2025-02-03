import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

// 📌 데이터 폴더 및 스크립트 경로 설정
const DATA_DIR = path.join(process.cwd(), "public", "data");
const SCRIPT_PATH = path.join(process.cwd(), "scripts", "generate_thumbnail.py");

// 📌 썸네일 생성 라우터
export async function POST() {
  try {
    // 📌 MP4 파일 목록 가져오기
    const files = fs.readdirSync(DATA_DIR);
    const mp4Files = files.filter(file => file.endsWith(".mp4"));

    if (mp4Files.length === 0) {
      return NextResponse.json({ message: "No MP4 files found" });
    }

    // 📌 누락된 썸네일 생성
    for (const file of mp4Files) {
      const fileNameWithoutExt = path.parse(file).name;
      const thumbnailPath = path.join(DATA_DIR, `${fileNameWithoutExt}.png`);

      if (!fs.existsSync(thumbnailPath)) {
        console.log(`📸 생성 중: ${thumbnailPath}`);
        exec(`python3 "${SCRIPT_PATH}" "${path.join(DATA_DIR, file)}" "${thumbnailPath}"`, (err, stdout, stderr) => {
          if (err) console.error("❌ 썸네일 생성 오류:", err);
          else console.log(`✅ 썸네일 생성 완료: ${thumbnailPath}`);
        });
      }
    }

    return NextResponse.json({ success: true, message: "Thumbnails generated" });
  } catch (error) {
    console.error("❌ Thumbnail Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}