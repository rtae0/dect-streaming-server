import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

// 📌 USB 마운트 디렉토리 (라즈베리파이에서 자동 마운트되는 경로 확인 필요)
const USB_MOUNT_DIR = "/media/pi";  // ⚠️ 실제 USB 마운트 경로로 변경 필요
const DATA_DIR = path.join(process.cwd(), "public", "data"); // 데이터 저장 폴더

// 🔥 USB에서 파일 복사하는 함수
async function copyFilesFromUSB() {
  return new Promise((resolve, reject) => {
    // USB에서 /data 폴더로 파일 복사 (mp4만 필터 가능)
    const command = `cp -r ${USB_MOUNT_DIR}/* ${DATA_DIR}/`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ USB 복사 오류:", error);
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

// 📌 API 엔드포인트
export async function POST() {
  try {
    if (!fs.existsSync(USB_MOUNT_DIR)) {
      throw new Error("USB가 감지되지 않았습니다.");
    }

    await copyFilesFromUSB();
    return NextResponse.json({ success: true, message: "USB 파일 복사 완료!" });

  } catch (error) {
    console.error("❌ USB 복사 API 오류:", error);
    return NextResponse.json({ error: "USB 파일 복사 실패" }, { status: 500 });
  }
}