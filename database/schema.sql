-- videos 테이블
CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT NOT NULL,        -- 🔥 파일 이름 추가
    title TEXT NOT NULL,            -- 영상 제목
    file_size INTEGER NOT NULL,     -- 파일 크기 (bytes)
    duration INTEGER,               -- 영상 길이 (초)
    date DATE,                      -- 영상 수정일
    description TEXT DEFAULT '',    -- 영상 설명
    favorite BOOLEAN DEFAULT 0,     -- 즐겨찾기 여부
    rate REAL DEFAULT 0,            -- 평점 (0~10)
    views INTEGER DEFAULT 0         -- 조회수
);

-- tags 테이블
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL
);

-- video_tags 테이블 (비디오-태그 관계)
CREATE TABLE IF NOT EXISTS video_tags (
    video_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (video_id, tag_id),
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- shortcuts 테이블 (사이트 바로가기 저장)
CREATE TABLE IF NOT EXISTS shortcuts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,       -- 사이트 이름
    url TEXT NOT NULL,        -- 사이트 URL
    plugin_type TEXT,         -- 관련 플러그인 유형 (예: YouTube, Twitch 등)
    vpn_required BOOLEAN DEFAULT 0 -- VPN 필요 여부 (0: 필요 없음, 1: 필요)
);