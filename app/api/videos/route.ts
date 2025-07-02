import { NextResponse } from "next/server";
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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sort = url.searchParams.get("sort") || "latest";
    const favorite = url.searchParams.get("favorite");
    const tagsOR = url.searchParams.getAll("tagsOR");
    const tagsAND = url.searchParams.getAll("tagsAND");
    const searchQuery = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    const db = await getDB();

    // 📌 정렬 방식 설정
    let orderBy = "v.date DESC";
    if (sort === "oldest") orderBy = "v.date ASC";
    if (sort === "views") orderBy = "v.views DESC";
    if (sort === "duration") orderBy = "v.duration DESC";

    // 📌 WHERE 조건문 생성
    let whereClause = "1=1";
    let queryParams: any[] = [];

    // 🔍 검색어 필터 추가
    if (searchQuery) {
      whereClause += " AND (v.title LIKE ? OR v.description LIKE ?)";
      queryParams.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    // ⭐ 즐겨찾기 필터
    if (favorite === "true") {
      whereClause += " AND v.favorite = 1";
    }

    // 🏷️ 태그 AND 필터
    let tagAndCondition = "";
    if (tagsAND.length > 0) {
      tagAndCondition = tagsAND.map(() => `
        v.id IN (
          SELECT video_id FROM video_tags vt
          JOIN tags t ON vt.tag_id = t.id
          WHERE t.tag = ?
        )
      `).join(" AND ");
      queryParams.push(...tagsAND);
    }

    // 🏷️ 태그 OR 필터 (이전과 다르게 별도 그룹화)
    let tagOrCondition = "";
    if (tagsOR.length > 0) {
      tagOrCondition = `
        v.id IN (
          SELECT video_id FROM video_tags vt
          JOIN tags t ON vt.tag_id = t.id
          WHERE t.tag IN (${tagsOR.map(() => "?").join(", ")})
        )
      `;
      queryParams.push(...tagsOR);
    }

    // 📌 WHERE 조건 조합 (AND와 OR을 올바르게 분리)
    if (tagAndCondition && tagOrCondition) {
      whereClause += ` AND (${tagAndCondition}) OR (${tagOrCondition})`;
    } else if (tagAndCondition) {
      whereClause += ` AND (${tagAndCondition})`;
    } else if (tagOrCondition) {
      whereClause += ` OR (${tagOrCondition})`;
    }

    // 📌 최종 SQL 실행
    const query = `
      SELECT 
        v.id, 
        v.file_name,
        v.title, 
        v.file_size, 
        v.duration, 
        v.date,  
        v.description, 
        v.favorite, 
        v.rate, 
        v.views, 
        GROUP_CONCAT(t.tag, ', ') AS tags
      FROM videos v
      LEFT JOIN video_tags vt ON v.id = vt.video_id
      LEFT JOIN tags t ON vt.tag_id = t.id
      WHERE ${whereClause}
      GROUP BY v.id
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?;
    `;

    queryParams.push(pageSize, offset);
    const videos = await db.all(query, queryParams);

    await db.close();
    return NextResponse.json(videos);
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}