"use client";

import { useState, useEffect } from "react";

export default function YtDlpUpdater() {
  const [ytDlpCurrent, setYtDlpCurrent] = useState<string | null>(null);
  const [ytDlpLatest, setYtDlpLatest] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch("/api/download/yt-dlp-version");
        const data = await response.json();
        setYtDlpCurrent(data.currentVersion || "Unknown");
        setYtDlpLatest(data.latestVersion || "Unknown");
      } catch (error) {
        console.error("❌ yt-dlp 버전 가져오기 실패:", error);
      }
    };
    fetchVersion();
  }, []);

  const updateYtDlp = async () => {
    setUpdating(true);
    try {
      const response = await fetch("/api/download/update-yt-dlp", { method: "POST" });
      if (!response.ok) throw new Error("Update failed");
      alert("✅ yt-dlp 업데이트 완료!");
      setYtDlpCurrent("업데이트 완료 (재시작 필요)");
    } catch (error) {
      console.error("❌ yt-dlp 업데이트 실패:", error);
    } finally {
      setUpdating(false);
    }
  };

  // ✅ 최신 버전인지 확인
  const isUpdateAvailable =
    ytDlpCurrent &&
    ytDlpLatest &&
    ytDlpCurrent !== "Unknown" &&
    ytDlpLatest !== "Unknown" &&
    ytDlpCurrent !== ytDlpLatest;

  return (
    <div className="border p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">🔄 yt-dlp 업데이트</h2>
      <p className="text-sm">현재 버전: {ytDlpCurrent || "확인 중..."}</p>
      <p className="text-sm">최신 버전: {ytDlpLatest || "확인 중..."}</p>
      <button
        onClick={updateYtDlp}
        className={`px-4 py-2 mt-2 rounded shadow transition ${
          isUpdateAvailable && !updating
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "bg-gray-400 text-gray-700 cursor-not-allowed"
        }`}
        disabled={!isUpdateAvailable || updating}
      >
        {updating
          ? "⏳ 업데이트 중..."
          : isUpdateAvailable
          ? "📥 최신 버전으로 업데이트"
          : "✅ 최신 상태"}
      </button>
    </div>
  );
}