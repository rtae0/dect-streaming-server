import { useState, useEffect, useRef, useCallback } from "react";
import { Video } from "@/types/Video";

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState("latest");
  const [selectedTags, setSelectedTags] = useState<{ [key: string]: number }>({});
  const [onlyFavorites, setOnlyFavorites] = useState(false); // ⭐ 즐겨찾기 필터 추가
  const [search, setSearch] = useState("");

  const observer = useRef<IntersectionObserver | null>(null);
  const lastVideoRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    fetchVideos(1, sort, selectedTags, search, onlyFavorites, true);
  }, [sort, selectedTags, search, onlyFavorites]);

  useEffect(() => {
    if (page > 1) fetchVideos(page, sort, selectedTags, search, onlyFavorites, false);
  }, [page]);

  // 🔥 비디오 목록을 새로 불러오는 함수 추가 (수정 후 자동 업데이트)
  const refreshVideos = useCallback(() => {
    fetchVideos(1, sort, selectedTags, search, onlyFavorites, true);
  }, [sort, selectedTags, search, onlyFavorites]);

  const fetchVideos = async (
    page: number,
    sort: string,
    tags: { [key: string]: number },
    search: string,
    onlyFavorites: boolean,
    reset = false
  ) => {
    if (!hasMore && !reset) return;
    setLoading(true);

    const query = new URLSearchParams({ sort, page: page.toString() });
    Object.entries(tags).forEach(([tag, mode]) => {
      if (mode === 1) query.append("tagsOR", tag);
      if (mode === 2) query.append("tagsAND", tag);
    });

    if (search) query.append("search", search);
    if (onlyFavorites) query.append("favorite", "true");

    const res = await fetch(`/api/videos?${query.toString()}`);
    const data = await res.json();

    if (reset) {
      setVideos(data);
    } else {
      setVideos(prev => [...prev, ...data]);
    }

    setHasMore(data.length === 10);
    setLoading(false);
  };

  return {
    videos,
    loading,
    lastVideoRef,
    setSort,
    setSearch,
    setOnlyFavorites, // ✅ 추가됨: 즐겨찾기 필터 상태 업데이트
    onlyFavorites, // ✅ 추가됨: 즐겨찾기 필터 상태 반환
    setSelectedTags,
    refreshVideos, // ✅ 추가됨: 수정 후 피드 새로고침 기능
  };
}