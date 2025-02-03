"use client";

import { useState } from "react";

export default function UsbFileCopy() {
  const [usbCopying, setUsbCopying] = useState(false);
  const [usbMessage, setUsbMessage] = useState("");

  const copyFromUSB = async () => {
    setUsbCopying(true);
    setUsbMessage("");

    try {
      const res = await fetch("/api/usb-copy", { method: "POST" });
      const data = await res.json();

      setUsbMessage(res.ok ? `✅ USB 파일 복사 완료: ${data.message}` : "❌ USB 파일 복사 실패");
    } catch (error) {
      console.error("❌ USB 복사 오류:", error);
      setUsbMessage("⚠️ 오류 발생");
    } finally {
      setUsbCopying(false);
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">🔌 USB 파일 가져오기</h2>
      <p className="text-sm text-gray-600 mb-2">현재 연결된 USB에서 `/data` 폴더로 모든 파일을 복사합니다.</p>
      <button
        onClick={copyFromUSB}
        className={`px-4 py-2 rounded shadow ${usbCopying ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"}`}
        disabled={usbCopying}
      >
        {usbCopying ? "⏳ 복사 중..." : "📂 USB 파일 복사"}
      </button>
      {usbMessage && <p className="mt-2 text-sm">{usbMessage}</p>}
    </div>
  );
}