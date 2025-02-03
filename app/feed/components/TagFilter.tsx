"use client";

import { useEffect, useState } from "react";
import "@/styles/video-filter.css"; // ✅ 스타일 파일 추가

type TagGroups = Record<string, string[]>;

type TagFilterProps = {
  selectedTags: { [key: string]: number }; // 0: 선택 안됨, 1: OR, 2: AND
  onTagClickAction: (tag: string) => void;
};

export default function TagFilter({ selectedTags, onTagClickAction }: TagFilterProps) {
  const [tagGroups, setTagGroups] = useState<TagGroups>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tags");
        const data: TagGroups = await res.json();
        setTagGroups(data);
      } catch (err) {
        console.error("❌ 태그 불러오기 실패:", err);
      }
    };
    fetchTags();
  }, []);

  const filteredTagGroups: TagGroups = Object.fromEntries(
    Object.entries(tagGroups)
      .map(([category, tags]) => [
        category,
        tags.filter((tag) => tag.toLowerCase().includes(search.toLowerCase())),
      ])
      .filter(([, tags]) => tags.length > 0)
  );

  return (
    <div className="video-filter">
      <input
        type="text"
        placeholder="태그 검색..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="filter-input"
      />

      <div className="filter-container">
        {Object.entries(filteredTagGroups).map(([category, tags]) => (
          <div key={category} className="filter-group">
            <h4 className="filter-category">{category}</h4>
            <div className="filter-tags">
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`tag-button ${
                    selectedTags[tag] === 2 ? "selected-and" :
                    selectedTags[tag] === 1 ? "selected-or" :
                    "default"
                  }`}
                  onClick={() => onTagClickAction(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}