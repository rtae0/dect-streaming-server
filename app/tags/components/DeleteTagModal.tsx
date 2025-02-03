"use client";

type DeleteTagModalProps = {
  selectedTag: { category: string; tag: string };
  fetchTagsAction: () => void; // ✅ 함수명 변경 (Next.js 규칙 준수)
  setSelectedTagAction: (tag: { category: string; tag: string } | null) => void; // ✅ 함수명 변경
};

export default function DeleteTagModal({ selectedTag, fetchTagsAction, setSelectedTagAction }: DeleteTagModalProps) {
  const deleteTag = async () => {
    try {
      const res = await fetch("/api/tags", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedTag.category, tag: selectedTag.tag }),
      });

      if (!res.ok) throw new Error("삭제 실패");

      setSelectedTagAction(null);
      fetchTagsAction(); // ✅ 태그 목록 새로고침
    } catch (error) {
      console.error("❌ 태그 삭제 오류:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg">
        <p className="mb-4">
          태그 <strong>#{selectedTag.tag}</strong>을 삭제하시겠습니까?
        </p>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={deleteTag}>
            삭제
          </button>
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setSelectedTagAction(null)}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}