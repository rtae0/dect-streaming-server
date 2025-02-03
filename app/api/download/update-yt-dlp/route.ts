import { NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST() {
  return new Promise((resolve) => {
    exec("pip install --upgrade yt-dlp", (error, stdout, stderr) => {
      if (error || stderr) {
        console.error("❌ yt-dlp 업데이트 오류:", error || stderr);
        resolve(NextResponse.json({ error: "Failed to update yt-dlp" }, { status: 500 }));
      }
      resolve(NextResponse.json({ success: true, message: "yt-dlp updated successfully" }));
    });
  });
}