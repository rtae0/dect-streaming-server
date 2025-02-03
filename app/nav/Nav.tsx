"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import "@/styles/nav.css";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(true); // ✅ 네비게이션 표시 여부
  const pathname = usePathname();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY < lastScrollY) {
        setIsScrollingUp(true); // ✅ 스크롤 올릴 때 네비게이션 표시
      } else {
        setIsScrollingUp(false); // ✅ 스크롤 내릴 때 네비게이션 숨김
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* 📌 모바일에서만 보이는 상단 네비게이션 */}
      <header className={`mobile-header ${isScrollingUp ? "visible" : "hidden"}`}>
        <button className="menu-button" onClick={() => setIsOpen(!isOpen)}>
          <Image
            src={isOpen ? "/icon/cancel.svg" : "/icon/menu.svg"}
            alt="메뉴 버튼"
            width={26}
            height={26}
          />
        </button>

        <div className="logo-container">
          <Image src="/icon/cloud.svg" alt="로고" width={100} height={30} />
        </div>

        <button className="empty-button"></button>
      </header>

      {/* 📌 왼쪽 고정형 네비게이션 */}
      <nav className={`nav-container ${isOpen ? "open" : ""}`}>
        <ul className="nav-list">
          <li>
            <Link
              href="/"
              className={`nav-item ${pathname === "/" || pathname.startsWith("/feed") ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <Image src="/icon/home.svg" alt="홈" width={26} height={26} />
              <span>피드</span>
            </Link>
          </li>
          <li>
            <Link
              href="/tags"
              className={`nav-item ${pathname.startsWith("/tags") ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <Image src="/icon/tag.svg" alt="카테고리 태그" width={26} height={26} />
              <span>카테고리 태그</span>
            </Link>
          </li>
          <li>
            <Link
              href="/shortcuts"
              className={`nav-item ${pathname.startsWith("/shortcuts") ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <Image src="/icon/arrow.svg" alt="사이트 바로가기" width={26} height={26} />
              <span>사이트 바로가기</span>
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className={`nav-item ${pathname.startsWith("/settings") ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <Image src="/icon/setting.svg" alt="설정" width={26} height={26} />
              <span>설정</span>
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}