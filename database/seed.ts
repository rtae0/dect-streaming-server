import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { PATHS } from "@/config/paths";

// 📌 DB 연결 함수
async function getDB() {
  return open({
    filename: PATHS.DB_FILE,
    driver: sqlite3.Database,
  });
}

async function seedDatabase() {
  const db = await getDB();

  // 📌 기존 데이터 삭제
  await db.exec("DELETE FROM video_tags");
  await db.exec("DELETE FROM videos");
  await db.exec("DELETE FROM tags");
  await db.exec("DELETE FROM shortcuts");

  // 📌 태그 데이터 생성
  const tags = [
    { tag: "Action", category: "Genre" },
    { tag: "Comedy", category: "Genre" },
    { tag: "Drama", category: "Genre" },
    { tag: "Sci-Fi", category: "Genre" },
    { tag: "Tutorial", category: "Category" },
    { tag: "Review", category: "Category" },
    { tag: "Documentary", category: "Category" }
  ];

  for (const tag of tags) {
    await db.run("INSERT INTO tags (tag, category) VALUES (?, ?)", [tag.tag, tag.category]);
  }

  // 태그 ID 목록 가져오기
  const tagRows = await db.all("SELECT id FROM tags");

  // 📌 더미 비디오 데이터 생성
  for (let i = 1; i <= 50; i++) {
    const fileName = `video_${i}`;
    const title = `Sample Video ${i}`;
    const fileSize = Math.floor(Math.random() * 500_000_000) + 100_000_000; // 100MB~600MB
    const duration = Math.floor(Math.random() * 600) + 60; // 1~10분
    const date = new Date(Date.now() - Math.random() * 10_000_000_000).toISOString(); // 랜덤 과거 날짜
    const description = `This is a sample description for video ${i}`;
    const favorite = Math.random() > 0.7 ? 1 : 0;
    const rate = parseFloat((Math.random() * 10).toFixed(1));
    const views = Math.floor(Math.random() * 10_000);

    const result = await db.run(
      `INSERT INTO videos (file_name, title, file_size, duration, date, description, favorite, rate, views)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fileName, title, fileSize, duration, date, description, favorite, rate, views]
    );

    const videoId = result.lastID;

    // 📌 각 비디오에 태그 3개 랜덤으로 추가
    const selectedTags = [...tagRows].sort(() => 0.5 - Math.random()).slice(0, 3);
    for (const tag of selectedTags) {
      await db.run("INSERT INTO video_tags (video_id, tag_id) VALUES (?, ?)", [videoId, tag.id]);
    }
  }

  // 📌 더미 shortcut 데이터 추가
  const shortcuts = [
    { name: "YouTube", url: "https://youtube.com", plugin_type: "YouTube", vpn_required: 0 },
    { name: "Twitch", url: "https://twitch.tv", plugin_type: "Twitch", vpn_required: 0 },
    { name: "Niconico", url: "https://www.nicovideo.jp", plugin_type: "NicoNico", vpn_required: 1 },
    { name: "Pornhub", url: "https://pornhub.com", plugin_type: "Adult", vpn_required: 1 }
  ];

  for (const shortcut of shortcuts) {
    await db.run(
      `INSERT INTO shortcuts (name, url, plugin_type, vpn_required)
       VALUES (?, ?, ?, ?)`,
      [shortcut.name, shortcut.url, shortcut.plugin_type, shortcut.vpn_required]
    );
  }

  console.log("✅ 더미 데이터 삽입 완료!");

  await db.close();
}

seedDatabase();