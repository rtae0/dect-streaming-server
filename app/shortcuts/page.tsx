"use client";

import { useEffect, useState } from "react";

type Shortcut = {
  id: number;
  name: string;
  url: string;
  plugin_type: string | null; // ✅ 플러그인 유형 추가
  vpn_required: number; // ✅ boolean 대신 number (0 또는 1)
};

export default function ShortcutsPage() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [pluginType, setPluginType] = useState("");
  const [vpnRequired, setVpnRequired] = useState(false);

  // 📌 shortcuts 목록 가져오기
  useEffect(() => {
    fetch("/api/shortcuts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setShortcuts(data);
        } else {
          console.error("❌ Invalid response:", data);
          setError("데이터를 불러오는 중 오류가 발생했습니다.");
        }
      })
      .catch((err) => {
        console.error("❌ shortcuts 가져오기 실패:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      })
      .finally(() => setLoading(false));
  }, []);

  // 📌 shortcut 추가 요청
  const addShortcut = async () => {
    if (!name || !url) return alert("사이트 이름과 URL을 입력하세요.");
    setLoading(true);

    try {
      const response = await fetch("/api/shortcuts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          url,
          plugin_type: pluginType.trim() || null, // ✅ 빈 값이면 null
          vpn_required: vpnRequired ? 1 : 0, // ✅ boolean → 1 또는 0 변환
        }),
      });

      if (!response.ok) throw new Error("추가 실패");

      const newShortcut = await response.json();
      setShortcuts((prev) => [...prev, newShortcut]);
      setName("");
      setUrl("");
      setPluginType("");
      setVpnRequired(false);
    } catch (error) {
      console.error("❌ Shortcut 추가 오류:", error);
      alert("추가 실패");
    } finally {
      setLoading(false);
    }
  };

  // 📌 shortcut 삭제 요청
  const deleteShortcut = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setLoading(true);

    try {
      const response = await fetch("/api/shortcuts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("삭제 실패");

      setShortcuts((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("❌ Shortcut 삭제 오류:", error);
      alert("삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">🔗 사이트 바로가기</h1>

      {/* 📌 에러 메시지 출력 */}
      {error && <p className="text-red-500">{error}</p>}

      {/* 사이트 추가 입력 */}
      <div className="p-4 border rounded-lg shadow-md bg-white mb-4">
        <h2 className="text-lg font-semibold mb-2">➕ 사이트 추가</h2>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="사이트 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="사이트 URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="플러그인 유형 (예: YouTube, Twitch, Niconico 등)"
            value={pluginType}
            onChange={(e) => setPluginType(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={vpnRequired}
              onChange={(e) => setVpnRequired(e.target.checked)}
              className="w-4 h-4"
            />
            <label className="text-sm">VPN 필요</label>
          </div>
          <button
            onClick={addShortcut}
            className={`bg-blue-500 text-white p-2 rounded mt-2 w-full ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "추가 중..." : "추가"}
          </button>
        </div>
      </div>

      {/* 🔄 로딩 표시 */}
      {loading && <p className="text-gray-500">로딩 중...</p>}

      {/* 저장된 사이트 목록 */}
      {!loading && shortcuts.length > 0 ? (
        <ul className="space-y-2">
          {shortcuts.map((s) => (
            <li key={s.id} className="flex justify-between items-center border-b py-2">
              <div className="flex items-center gap-2">
              <a
                href={s.url.startsWith("http") ? s.url : `https://${s.url}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {s.name}
              </a>
                {s.plugin_type && (
                  <span className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded-md">
                    {s.plugin_type}
                  </span>
                )}
                {s.vpn_required === 1 && (
                  <span className="text-red-500 ml-2 text-xs font-bold">(VPN 필요)</span>
                )}
              </div>
              <button onClick={() => deleteShortcut(s.id)} className="text-red-500">🗑 삭제</button>
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p className="text-gray-500">저장된 사이트가 없습니다.</p>
      )}
    </div>
  );
}