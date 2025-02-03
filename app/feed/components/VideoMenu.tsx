"use client";

import { useState, useRef, useEffect } from "react";
import EditModal from "./EditModal";
import TagEditModal from "./TagEditModal";
import Image from "next/image";
import "@/styles/videoInfo.css"; // ✅ 스타일 관리

type VideoMenuProps = {
  video: {
    id: number;
    title: string;
    description: string;
    rate: number;
    tags?: string;
  };
  onUpdateAction: () => void;
};

export default function VideoMenu({ video, onUpdateAction }: VideoMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [tagEditOpen, setTagEditOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // 📌 비디오 삭제 기능
  const deleteVideo = async () => {
    if (!confirm(`"${video.title}"을 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/videos/${video.id}`, { method: "DELETE" });

      if (!response.ok) throw new Error("삭제 실패");

      onUpdateAction();
    } catch (error) {
      console.error("❌ 비디오 삭제 오류:", error);
    }
  };

  return (
    <div className="video-menu">
      {/* 📌 더보기 버튼 */}
      <button ref={buttonRef} className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <Image src="/icon/more.svg" alt="More" width={24} height={24} />
      </button>

      {/* 📌 더보기 메뉴 (각 비디오 아이템 내부에서 개별적으로 위치) */}
      {menuOpen && (
        <div ref={menuRef} className="menu-dropdown">
          <button className="menu-item" onClick={() => { setMenuOpen(false); setEditOpen(true); }}>
            편집
          </button>
          <button className="menu-item" onClick={() => { setMenuOpen(false); setTagEditOpen(true); }}>
            태그 관리
          </button>
          <button className="menu-item delete" onClick={deleteVideo}>
            삭제
          </button>
        </div>
      )}

      {/* ✏️ 편집 모달 */}
      {editOpen && <EditModal video={video} onCloseAction={() => setEditOpen(false)} onUpdateAction={onUpdateAction} />}

      {/* 🏷️ 태그 관리 모달 */}
      {tagEditOpen && (
        <TagEditModal
          videoId={video.id}
          existingTags={(video.tags || "").split(", ")}
          onCloseAction={() => setTagEditOpen(false)}
          onUpdateAction={onUpdateAction}
        />
      )}
    </div>
  );
}