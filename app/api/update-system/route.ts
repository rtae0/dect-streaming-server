import { NextResponse } from "next/server";
import { exec } from "child_process";

// 📌 APT 업데이트 & 업그레이드 실행
export async function POST() {
  try {
    return new Promise((resolve, reject) => {
      exec("sudo apt update && sudo apt upgrade -y", (error, stdout, stderr) => {
        if (error || stderr) {
          console.error("❌ 시스템 업데이트 오류:", error || stderr);
          reject(NextResponse.json({ error: "업데이트 실패" }, { status: 500 }));
        } else {
          console.log("✅ 시스템 업데이트 완료:", stdout);
          resolve(NextResponse.json({ success: true, message: "시스템 업데이트 완료" }));
        }
      });
    });
  } catch (error) {
    console.error("❌ 업데이트 API 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}