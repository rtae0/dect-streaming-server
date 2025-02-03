"use client";

import { useState } from "react";

export default function DownloadInput({ refreshVideosAction }: { refreshVideosAction: () => void }) {
  const [url, setUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  // 📌 URL 유효성 검사 함수
  const isValidUrl = (inputUrl: string) => {
    try {
      new URL(inputUrl);
      return true;
    } catch {
      return false;
    }
  };

  // 📌 🎯 다운로드 실행 함수
  const handleDownload = async () => {
    if (!url.trim()) {
      setStatus("⚠️ URL을 입력하세요.");
      return;
    }

    if (!isValidUrl(url)) {
      setStatus("⚠️ 올바른 URL을 입력하세요.");
      return;
    }

    setDownloading(true);
    setProgress(10);
    setStatus("📥 다운로드 시작...");

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ 다운로드 오류:", data.error);
        setStatus(data.error || "⚠️ 다운로드할 수 없는 URL입니다.");
        return;
      }

      if (data.error && data.error.includes("비디오 제목을 가져오지 못했습니다")) {
        setStatus("⚠️ 다운로드할 수 없는 URL입니다.");
        return;
      }

      // ✅ 다운로드 진행 상태 업데이트
      setProgress(30);
      setStatus("📀 다운로드 중...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setProgress(50);
      setStatus("🔄 파일 변환 중...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setProgress(70);
      setStatus("🖼️ 썸네일 생성 중...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setProgress(100);
      setStatus("✅ 다운로드 완료!");

      // 📜 비디오 목록 새로고침
      refreshVideosAction();
    } catch (error) {
      console.error("❌ 네트워크 오류:", error);
      setStatus("⚠️ 다운로드 요청 실패! 네트워크를 확인하세요.");
    } finally {
      setTimeout(() => {
        setDownloading(false);
        setProgress(0);
      }, 3000);
    }
  };

  return (
    <div className="download-input-container">
      {/* 📥 URL 입력창 (다운로드 중에는 비활성화) */}
      <input
        type="text"
        placeholder="다운로드 URL 입력"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleDownload()}
        className="download-input"
        disabled={downloading}
      />

      {/* 📊 다운로드 진행 상태 표시 */}
      {downloading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%`, transition: "width 0.4s ease-in-out" }}
            ></div>
          </div>
          <p className="progress-status">{status}</p>
        </div>
      )}

      {/* 📌 오류 메시지 표시 */}
      {status && !downloading && <p className="error-message">{status}</p>}
    </div>
  );
}