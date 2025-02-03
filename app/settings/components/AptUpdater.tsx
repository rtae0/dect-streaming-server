"use client";

import { useState } from "react";

export default function AptUpdater() {
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const handleAptUpdate = async () => {
    setUpdating(true);
    setMessage("");

    try {
      const response = await fetch("/api/update-system", { method: "POST" });
      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage("❌ 업데이트 실패");
      }
    } catch (error) {
      console.error("❌ 시스템 업데이트 오류:", error);
      setMessage("⚠️ 오류 발생");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">📦 시스템 업데이트</h2>
      <p className="text-sm text-gray-600 mb-2">시스템 패키지를 최신 상태로 유지합니다.</p>
      <button
        onClick={handleAptUpdate}
        disabled={updating}
        className={`px-4 py-2 rounded shadow transition ${
          updating ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 text-white hover:bg-orange-600"
        }`}
      >
        {updating ? "⏳ 업데이트 중..." : "📦 APT 업데이트"}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}