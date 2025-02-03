"use client";

import { useVideos } from "@/hooks/useVideos";
import VideoControls from "@/app/feed/components/VideoControls";
import VideoList from "@/app/feed/components/VideoList";
import TagFilter from "@/app/feed/components/TagFilter";
import { useState, useEffect } from "react";
import DownloadInput from "./components/DownloadInput";

export default function Home() {
  const {
    videos,
    loading,
    setSort,
    setSearch,
    setSelectedTags,
    onlyFavorites,
    setOnlyFavorites,
    refreshVideos, // ✅ `refreshVideos` 유지
  } = useVideos();

  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [selectedTags, setSelectedTagsState] = useState<{ [key: string]: number }>({});

  const handleTagClick = (tag: string) => {
    setSelectedTagsState((prev) => {
      const updatedTags = {
        ...prev,
        [tag]: (prev[tag] || 0) === 2 ? 0 : (prev[tag] || 0) + 1,
      };

      setSelectedTags(updatedTags);
      return updatedTags;
    });
  };

  return (
    <div className="container mx-auto px-4">
      {/* 🎥 다운로드 입력 UI 추가 ✅ */}
      <DownloadInput refreshVideosAction={refreshVideos} /> {/* ✅ prop 이름 맞춤 */}

      {/* 🏷️ 태그 필터 */}
      <TagFilter selectedTags={selectedTags} onTagClickAction={handleTagClick} />

      {/* 🔍 검색 및 정렬 컨트롤 */}
      <VideoControls
        sort="latest"
        setSortAction={setSort}
        search=""
        setSearchAction={setSearch}
        onlyFavorites={onlyFavorites}
        setOnlyFavoritesAction={setOnlyFavorites}
      />

      {/* 📜 비디오 리스트 */}
      <VideoList
        videos={videos}
        loading={loading}
        onUpdateAction={refreshVideos}
        currentlyPlaying={currentlyPlaying}
        setCurrentlyPlayingAction={setCurrentlyPlaying}
      />
    </div>
  );
}