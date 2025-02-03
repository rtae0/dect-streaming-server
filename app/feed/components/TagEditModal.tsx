"use client";

import { useState, useEffect } from "react";
import "@/styles/modal.css"; // ✅ 모달 스타일 파일

type TagEditModalProps = {
  videoId: number;
  existingTags: string[];
  onCloseAction: () => void;
  onUpdateAction: () => void;
};

type TagGroups = { [category: string]: string[] };

export default function TagEditModal({ videoId, existingTags, onCloseAction, onUpdateAction }: TagEditModalProps) {
  const [availableTags, setAvailableTags] = useState<TagGroups>({});
  const [selectedTags, setSelectedTags] = useState<string[]>(existingTags);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        const data: unknown = await response.json();

        if (typeof data === "object" && data !== null) {
          setAvailableTags(data as TagGroups);
        } else {
          console.error("❌ API 응답이 올바르지 않습니다:", data);
          setAvailableTags({});
        }
      } catch (error) {
        console.error("❌ 태그 목록 불러오기 실패:", error);
      }
    };
    fetchTags();
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredTagGroups: TagGroups = Object.fromEntries(
    Object.entries(availableTags)
      .map(([category, tags]) => [
        category,
        tags.filter((tag) => tag.toLowerCase().includes(search.toLowerCase())),
      ])
      .filter(([, tags]) => tags.length > 0)
  );

  const saveTags = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/videos/${videoId}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: selectedTags }),
      });

      if (!response.ok) {
        throw new Error("태그 업데이트 실패");
      }

      onUpdateAction();
      onCloseAction();
    } catch (error) {
      console.error("❌ 태그 업데이트 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <input
          type="text"
          placeholder="태그 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="modal-input"
        />

        <div className="modal-content">
          {Object.entries(filteredTagGroups).map(([category, tags]) => (
            <div key={category} className="tag-group">
              <h3 className="tag-category">{category}</h3>
              <div className="tag-list">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    className={`tag-item ${selectedTags.includes(tag) ? "selected" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-buttons">
          <button className="modal-cancel" onClick={onCloseAction}>취소</button>
          <button className="modal-save" onClick={saveTags} disabled={loading}>
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}