"use client";

type TagListProps = {
  tags: Record<string, string[]>;
  setSelectedTagAction: (tag: { category: string; tag: string } | null) => void; // ✅ 함수명 변경 (Next.js 규칙 준수)
};

export default function TagList({ tags, setSelectedTagAction }: TagListProps) {
  return (
    <>
      {Object.entries(tags).length === 0 ? (
        <p className="text-center text-gray-500">🔍 검색 결과가 없습니다.</p>
      ) : (
        Object.entries(tags).map(([category, categoryTags]) => (
          <div key={category} className="mb-6">
            <h2 className="text-lg font-semibold mb-2">{category}</h2>
            <div className="flex flex-wrap gap-2">
              {categoryTags.map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-2 bg-blue-200 text-sm rounded-md shadow hover:bg-red-300"
                  onClick={() => setSelectedTagAction({ category, tag })}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}