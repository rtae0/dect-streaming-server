"use client";

import { useState } from "react";

export default function ThumbnailSyncButton() {
  const [loading, setLoading] = useState(false);

  // 🔥 누락된 썸네일 생성 기능
  const generateMissingThumbnails = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/download/generate-thumbnails", { method: "POST" });
      if (!response.ok) {
        throw new Error("Thumbnail generation failed");
      }
      alert("✅ 누락된 썸네일 생성 완료!");
    } catch (error) {
      console.error("❌ 썸네일 생성 오류:", error);
      alert("⚠️ 썸네일 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
    <h2 className="text-lg font-semibold mb-2">🔌 📸 누락된 썸네일 생성</h2>

    <button
      onClick={generateMissingThumbnails}
      className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition"
      disabled={loading}
    >
      {loading ? "📸 썸네일 생성 중..." : "📸 누락된 썸네일 생성"}
    </button>
    </div>
  );
}