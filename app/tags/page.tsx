"use client";

import { useEffect, useState } from "react";
import TagSearch from "./components/TagSearch";
import TagForm from "./components/TagForm";
import TagList from "./components/TagList";
import DeleteTagModal from "./components/DeleteTagModal";

export default function TagsPage() {
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const [filteredTags, setFilteredTags] = useState<Record<string, string[]>>({});
  const [selectedTag, setSelectedTag] = useState<{ category: string; tag: string } | null>(null);

  useEffect(() => {
    fetchTagsAction();
  }, []);

  // 📌 태그 목록 불러오기
  const fetchTagsAction = async () => {
    try {
      const res = await fetch("/api/tags");
      const data = await res.json();
      if (typeof data === "object" && data !== null) {
        setTags(data);
        setFilteredTags(data);
      } else {
        setTags({});
        setFilteredTags({});
      }
    } catch (error) {
      console.error("❌ 태그 불러오기 오류:", error);
      setTags({});
      setFilteredTags({});
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🏷️ 카테고리 태그 설정</h1>

      {/* 🔍 태그 검색 UI */}
      <TagSearch tags={tags} setFilteredTagsAction={setFilteredTags} />

      {/* ➕ 태그 추가 UI */}
      <TagForm fetchTagsAction={fetchTagsAction} />

      {/* 📜 카테고리별 태그 리스트 */}
      <TagList tags={filteredTags} setSelectedTagAction={setSelectedTag} />

      {/* 🗑️ 삭제 확인 모달 */}
      {selectedTag && (
        <DeleteTagModal
          selectedTag={selectedTag}
          fetchTagsAction={fetchTagsAction}
          setSelectedTagAction={setSelectedTag}
        />
      )}
    </div>
  );
}