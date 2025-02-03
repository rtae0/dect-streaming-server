"use client";

import { useState } from "react";
import "@/styles/modal.css"; // ✅ 스타일 파일

type EditModalProps = {
  video: {
    id: number;
    title: string;
    description: string;
    rate: number;
  };
  onCloseAction: () => void;
  onUpdateAction: () => void;
};

export default function EditModal({ video, onCloseAction, onUpdateAction }: EditModalProps) {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);
  const [rate, setRate] = useState(video.rate);

  const updateVideo = async () => {
    try {
      const safeRate = isNaN(rate) ? 0 : rate;

      const response = await fetch(`/api/videos/${video.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, rate: safeRate }),
      });

      if (!response.ok) {
        throw new Error("❌ 수정 요청 실패");
      }

      onUpdateAction();
      onCloseAction();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">

        {/* 📌 제목 입력 */}
        <div className="input-container">
          <label className={`input-label ${title ? "active" : ""}`}>제목</label>
          <input
            type="text"
            className="modal-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 📌 설명 입력 */}
        <div className="input-container">
          <label className={`input-label ${description ? "active" : ""}`}>설명</label>
          <textarea
            className="modal-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* 📌 평점 입력 */}
        <div className="input-container">
          <label className={`input-label ${rate ? "active" : ""}`}>평점 (0~10)</label>
          <input
            type="number"
            className="modal-input"
            min="0"
            max="10"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="modal-buttons">
          <button className="modal-cancel" onClick={onCloseAction}>
            취소
          </button>
          <button className="modal-save" onClick={updateVideo}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}