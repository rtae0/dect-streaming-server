"use client";

import VideoCard from "./VideoCard";
import { Video } from "@/types/Video";
import { MutableRefObject, useCallback } from "react";

type VideoListProps = {
  videos: Video[];
  loading: boolean;
  onUpdateAction: () => void;
  currentlyPlaying: number | null;
  setCurrentlyPlayingAction: (id: number | null) => void;
};

export default function VideoList({
  videos,
  loading,
  onUpdateAction,
  currentlyPlaying,
  setCurrentlyPlayingAction, // ✅ 함수명 변경
}: VideoListProps) {
  const handleSetCurrentlyPlaying = useCallback((id: number | null) => {
    setCurrentlyPlayingAction(id);
  }, [setCurrentlyPlayingAction]);

  return (
    <div className="grid gap-4">
      {videos.map((video) => (
        <VideoCard
        key={video.id}
        video={video}
        onUpdateAction={onUpdateAction} // ✅ 변경된 함수명 전달
        currentlyPlaying={currentlyPlaying}
        setCurrentlyPlayingAction={setCurrentlyPlayingAction} // ✅ 변경된 함수명 전달
      />
    ))}

      {loading && <p className="text-center text-gray-500">로딩 중...</p>}
    </div>
  );
}