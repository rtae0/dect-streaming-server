import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// 📌 yt-dlp 현재 버전 가져오기
async function getCurrentVersion() {
  try {
    const { stdout } = await execAsync("yt-dlp --version");
    return stdout.trim(); // 🔥 공백 제거 후 반환
  } catch (error) {
    console.error("❌ yt-dlp 현재 버전 가져오기 실패:", error);
    return "Unknown";
  }
}

// 📌 GitHub API에서 최신 버전 가져오기
async function getLatestVersion() {
  try {
    const res = await fetch("https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest");
    const data = await res.json();

    if (!data || !data.tag_name) {
      console.error("❌ GitHub API 응답 오류:", data);
      return "Unknown";
    }

    return data.tag_name; // 🔥 최신 버전 태그만 반환
  } catch (error) {
    console.error("❌ yt-dlp 최신 버전 가져오기 실패:", error);
    return "Unknown";
  }
}

// 📌 API 응답 핸들러
export async function GET() {
  const currentVersion = await getCurrentVersion();
  const latestVersion = await getLatestVersion();

  return NextResponse.json({ currentVersion, latestVersion });
}