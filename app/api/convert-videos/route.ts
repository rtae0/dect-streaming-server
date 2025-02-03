import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

// 📌 변환 스크립트 경로
const SCRIPT_PATH = path.join(process.cwd(), "scripts", "convert_to_mp4.py");

export async function POST() {
  try {
    // FFmpeg 변환 실행
    exec(`python3 "${SCRIPT_PATH}"`, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ 변환 오류:", error);
        return;
      }
      console.log("✅ 변환 완료:\n", stdout);
    });

    return NextResponse.json({ success: true, message: "MP4 변환 시작됨" });
  } catch (error) {
    console.error("❌ API 오류:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}