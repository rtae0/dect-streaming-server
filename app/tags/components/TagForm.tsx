"use client";

import { useState } from "react";

type TagFormProps = {
  fetchTagsAction: () => void; // ✅ 함수명 변경 (Next.js 규칙 준수)
};

export default function TagForm({ fetchTagsAction }: TagFormProps) {
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [status, setStatus] = useState<string | null>(null); // ✅ 상태 메시지 추가

  const addTag = async () => {
    if (!newCategory || !newTag) {
      setStatus("⚠️ 카테고리와 태그를 입력하세요.");
      return;
    }

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory, tag: newTag }),
      });

      if (response.status === 409) {
        setStatus("⚠️ 이미 존재하는 태그입니다!"); // 🔥 중복 태그 경고 메시지
        return;
      }

      if (!response.ok) {
        throw new Error("태그 추가 실패");
      }

      setStatus(`✅ "${newTag}" 태그 추가 완료`);
      setNewCategory(""); // ✅ 추가 성공 시 초기화
      setNewTag("");
      fetchTagsAction(); // ✅ 태그 목록 새로고침
    } catch (error) {
      console.error("❌ 태그 추가 오류:", error);
      setStatus("❌ 태그 추가 실패");
    }
  };

  return (
    <div className="mb-6 p-4 border rounded-lg shadow bg-gray-100">
      <h2 className="text-lg font-semibold mb-2">➕ 태그 추가</h2>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="카테고리 입력"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="px-3 py-2 border rounded w-1/2"
        />
        <input
          type="text"
          placeholder="태그 입력"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          className="px-3 py-2 border rounded w-1/2"
        />
        <button className="px-4 py-2 bg-blue-500 text-white rounded shadow" onClick={addTag}>
          추가
        </button>
      </div>

      {/* 상태 메시지 출력 */}
      {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
    </div>
  );
}