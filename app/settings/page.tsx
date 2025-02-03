"use client";

import SyncButton from "./components/SyncButton";
import ThumbnailSyncButton from "./components/ThumbnailSyncButton";
import YtDlpUpdater from "./components/YtDlpUpdater";
import UsbFileCopy from "./components/UsbFileCopy";
import VideoConverter from "./components/VideoConverter";
import AptUpdater from "./components/AptUpdater";
export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">⚙️ 환경설정</h1>

      <div className="flex flex-col gap-4">
        <AptUpdater /> {/* 🔄 패키지 업데이트 */}
        <YtDlpUpdater /> {/* 🔄 yt-dlp 업데이트 */}
        <UsbFileCopy /> {/* 🔌 USB 파일 복사 */}
        <VideoConverter /> {/* 🎥 동영상 변환 */}
        <SyncButton /> {/* 🔄 데이터 동기화 */}
        <ThumbnailSyncButton /> {/* 📸 썸네일 동기화 */}
      </div>
    </div>
  );
}