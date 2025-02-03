"use client";

import { useState } from "react";
import Image from "next/image"; // ✅ Next.js의 Image 컴포넌트 사용
import "@/styles/videoInfo.css"; // ✅ 스타일 관리

type FavoriteButtonProps = {
  videoId: number;
  initialFavorite: boolean;
};

export default function FavoriteButton({ videoId, initialFavorite }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const toggleFavorite = async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: !isFavorite }),
      });

      if (!response.ok) {
        throw new Error("Failed to update favorite status");
      }

      const data = await response.json();
      setIsFavorite(data.favorite);
    } catch (error) {
      console.error("❌ 즐겨찾기 업데이트 실패:", error);
    }
  };

  return (
    <button onClick={toggleFavorite} className="favorite-button">
      <Image
        src={isFavorite ? "/icon/bookmark_check.svg" : "/icon/bookmark.svg"}
        alt="Favorite"
        width={24}
        height={24}
      />
    </button>
  );
}