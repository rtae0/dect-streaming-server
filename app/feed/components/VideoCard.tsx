"use client";

import { useEffect, useRef } from "react";
import FavoriteButton from "./FavoriteButton";
import TagList from "./TagList";
import VideoMenu from "./VideoMenu";
import Image from "next/image"; // ✅ Next.js의 Image 컴포넌트 사용
import "@/styles/videoInfo.css"; // ✅ 스타일 관리

type VideoProps = {
  id: number;
  file_name: string;
  title: string;
  file_size: number;
  duration: number;
  date: string;
  description: string;
  favorite: boolean;
  rate: number;
  views: number;
  tags: string;
};

type VideoCardProps = {
  video: VideoProps;
  onUpdateAction: () => void;
  currentlyPlaying: number | null;
  setCurrentlyPlayingAction: (id: number | null) => void;
};

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toISOString().slice(2, 10).replace(/-/g, ".");
};

const formatDuration = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0초";

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) return mins > 0 ? `${hrs}시간 ${mins}분` : `${hrs}시간`;
  if (mins > 0) return secs > 0 ? `${mins}분 ${secs}초` : `${mins}분`;
  return `${secs}초`;
};

export default function VideoCard({
  video,
  onUpdateAction,
  currentlyPlaying,
  setCurrentlyPlayingAction,
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const increaseViewCount = async () => {
    const today = new Date().toISOString().split("T")[0];
    const viewHistory = JSON.parse(localStorage.getItem("viewedVideos") || "{}");

    if (viewHistory[video.id] === today) return;

    try {
      await fetch(`/api/videos/${video.id}/view`, { method: "POST" });
      viewHistory[video.id] = today;
      localStorage.setItem("viewedVideos", JSON.stringify(viewHistory));
      onUpdateAction();
    } catch (error) {
      console.error("❌ 조회수 증가 실패:", error);
    }
  };

  useEffect(() => {
    if (currentlyPlaying !== video.id && videoRef.current) {
      videoRef.current.pause();
    }
  }, [currentlyPlaying, video.id]);

  return (
    <div className="video-item">
      <video
        ref={videoRef}
        src={`/data/${encodeURIComponent(video.file_name)}.mp4`}
        poster={`/data/${encodeURIComponent(video.file_name)}.png`}
        controls
        className="video-player"
        onPlay={() => {
          setCurrentlyPlayingAction(video.id);
          increaseViewCount();
        }}
      />
      
      <div className="video-content">
        <div className="video-header">
          <div className="video-meta">
            <h2 className="video-title">{video.title}</h2>
            <p className="video-date">{formatDate(video.date)}</p>
          </div>
          <VideoMenu
            video={{
              id: video.id,
              title: video.title,
              description: video.description,
              rate: video.rate,
              tags: video.tags,
            }}
            onUpdateAction={onUpdateAction}
          />
        </div>

        <p className="video-description">{video.description}</p>

        <TagList tags={video.tags} />

        <div className="video-info">
          <div className="video-stats">
            <div className="video-stat">
              <Image src="/icon/star.svg" alt="Rating" width={16} height={16} />
              <span>{video.rate}</span>
            </div>
            <div className="video-stat">
              <Image src="/icon/duration.svg" alt="Duration" width={16} height={16} />
              <span>{formatDuration(video.duration)}</span>
            </div>
            <div className="video-stat">
              <Image src="/icon/eye.svg" alt="Views" width={16} height={16} />
              <span>{video.views}</span>
            </div>
            <FavoriteButton videoId={video.id} initialFavorite={video.favorite} />
          </div>
        </div>
      </div>
    </div>
  );
}