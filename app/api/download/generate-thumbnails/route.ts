import { NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";
import { PATHS } from "@/config/paths";
import fs from "fs";

// 📌 데이터 폴더 및 스크립트 경로 설정
const DATA_DIR = PATHS.DATA_DIR;
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

    // 📌 누락된 썸네일 생성 (순차 실행)
    for (const file of mp4Files) {
      const fileNameWithoutExt = path.parse(file).name;
      const thumbnailPath = path.join(DATA_DIR, `${fileNameWithoutExt}.png`);

      if (!fs.existsSync(thumbnailPath)) {
        const inputVideoPath = path.join(DATA_DIR, file);
        console.log(`📸 썸네일 생성 시작: ${inputVideoPath}`);

        try {
          execSync(`python3 "${SCRIPT_PATH}" "${inputVideoPath}" "${thumbnailPath}"`, {
            stdio: "inherit", // Python 출력 콘솔에 바로 표시
          });
          console.log(`✅ 썸네일 생성 완료: ${thumbnailPath}`);
        } catch (err) {
          console.error(`❌ 오류 발생 (${file}):`, err);
        }
      } else {
        console.log(`🟡 이미 존재: ${thumbnailPath}`);
      }
    }

    return NextResponse.json({ success: true, message: "Thumbnails generated sequentially" });
  } catch (error) {
    console.error("❌ Thumbnail Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}