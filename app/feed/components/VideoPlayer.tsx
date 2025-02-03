import React from "react";

type VideoPlayerProps = {
  fileName: string; // 🔥 확장자 없이 파일명만 전달
};

export default function VideoPlayer({ fileName }: VideoPlayerProps) {
  return (
    <div className="relative w-full h-auto">
      <video
        src={`/data/${fileName}.mp4`} // 🔥 .mp4 확장자 자동 추가
        poster={`/data/${fileName}.png`} // 🔥 썸네일 추가
        controls
        className="w-full h-auto rounded-lg shadow-md"
      />
    </div>
  );
}