"use client";

import { useState } from "react";

export default function VideoConverter() {
  const [converting, setConverting] = useState(false);
  const [conversionMessage, setConversionMessage] = useState("");

  const convertVideosToMP4 = async () => {
    setConverting(true);
    setConversionMessage("");

    try {
      const res = await fetch("/api/convert-videos", { method: "POST" });
      const data = await res.json();

      setConversionMessage(res.ok ? `✅ 변환 완료: ${data.message}` : "❌ 변환 실패");
    } catch (error) {
      console.error("❌ 변환 오류:", error);
      setConversionMessage("⚠️ 오류 발생");
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">🎥 동영상 변환 (MP4)</h2>
      <p className="text-sm text-gray-600 mb-2">다른 확장자의 동영상을 MP4로 변환합니다.</p>
      <button
        onClick={convertVideosToMP4}
        className={`px-4 py-2 rounded shadow ${converting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
        disabled={converting}
      >
        {converting ? "⏳ 변환 중..." : "🎬 MP4로 변환"}
      </button>
      {conversionMessage && <p className="mt-2 text-sm">{conversionMessage}</p>}
    </div>
  );
}