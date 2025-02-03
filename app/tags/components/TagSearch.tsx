"use client";

import { useEffect, useState } from "react";

type TagSearchProps = {
  tags: Record<string, string[]>;
  setFilteredTagsAction: (filtered: Record<string, string[]>) => void; // ✅ 함수명 변경 (Next.js 규칙 준수)
};

export default function TagSearch({ tags, setFilteredTagsAction }: TagSearchProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!search.trim()) {
        setFilteredTagsAction(tags);
        return;
      }

      const lowerSearch = search.toLowerCase();
      const newFilteredTags = Object.entries(tags).reduce((acc, [category, categoryTags]) => {
        const filtered = categoryTags.filter((tag) => tag.toLowerCase().includes(lowerSearch));
        if (filtered.length > 0) acc[category] = filtered;
        return acc;
      }, {} as Record<string, string[]>);

      setFilteredTagsAction(newFilteredTags);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, tags, setFilteredTagsAction]);

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="🔍 태그 검색..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 border rounded-md"
      />
    </div>
  );
}