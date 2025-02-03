"use client";

import { useState } from "react";

export default function SyncButton() {
  const [loading, setLoading] = useState(false);

  // 🔥 동기화 기능 (데이터베이스 갱신)
  const syncVideos = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/sync", { method: "POST" });
      if (!response.ok) {
        throw new Error("Sync failed");
      }
      alert("✅ 동기화 완료!");
    } catch (error) {
      console.error("❌ 동기화 오류:", error);
      alert("⚠️ 동기화 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">🔄 데이터베이스 동기화</h2>
      <button
      onClick={syncVideos}
      className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
      disabled={loading}
    >
      {loading ? "🔄 동기화 중..." : "🔄 동기화"}
    </button>
      </div>
  );

}