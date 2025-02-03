import { useState, useEffect } from "react";

type VideoControlsProps = {
  sort: string;
  setSortAction: (value: string) => void;
  search: string;
  setSearchAction: (value: string) => void;
  onlyFavorites: boolean;
  setOnlyFavoritesAction: (value: boolean) => void;
};

export default function VideoControls({
  sort,
  setSortAction,
  search,
  setSearchAction,
  onlyFavorites,
  setOnlyFavoritesAction,
}: VideoControlsProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [selectedSort, setSelectedSort] = useState(sort);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchAction(localSearch);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [localSearch, setSearchAction]);

  useEffect(() => {
    setSelectedSort(sort);
  }, [sort]);

  return (
    <div className="video-controls">
      {/* 🔍 검색 입력 */}
      <input
        id="searchInput"
        name="search"
        type="text"
        placeholder="제목 또는 설명 검색..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="search-input"
      />

      {/* 정렬 옵션 & 즐겨찾기 버튼을 한 줄로 정렬 */}
      <div className="controls-container">
        <div className="sort-container">
          <select
            id="sortSelect"
            name="sort"
            value={selectedSort}
            onChange={(e) => {
              setSelectedSort(e.target.value);
              setSortAction(e.target.value);
            }}
            className="sort-select"
          >
            <option value="latest">최신순</option>
            <option value="oldest">과거순</option>
            <option value="views">조회수순</option>
            <option value="duration">영상 길이순</option>
          </select>
        </div>

        {/* ⭐ 즐겨찾기 버튼 (체크박스 숨기고 버튼처럼 스타일링) */}
        <button
          className={`favorites-button ${onlyFavorites ? "active" : ""}`}
          onClick={() => setOnlyFavoritesAction(!onlyFavorites)}
        >
          <input
            type="checkbox"
            checked={onlyFavorites}
            readOnly
            className="hidden-checkbox"
          />
          즐겨찾기
        </button>
      </div>
    </div>
  );
}