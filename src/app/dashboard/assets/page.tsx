"use client";

import { useState, useEffect } from "react";
import { Asset } from "@/types";
import { format } from "date-fns";

const C = {
  accent: "#C8A96E", accentDim: "#8B6F3E", text: "#F0EDE8",
  textMuted: "#666666", textSub: "#999999", card: "#161616",
  surface: "#111111", border: "#222222",
};

const TYPE_COLORS: Record<string, string> = {
  COPY: "#7C3AED",
  IMAGE_PROMPT: "#C8A96E",
  IMAGE: "#059669",
};

export default function AssetLibraryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Asset | null>(null);

  useEffect(() => {
    fetchAssets();
  }, [filter]);

  const fetchAssets = async () => {
    setLoading(true);
    const url = filter === "all" ? "/api/assets" : `/api/assets?type=${filter}`;
    const res = await fetch(url);
    const data = await res.json();
    setAssets(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/assets?id=${id}`, { method: "DELETE" });
    setSelected(null);
    await fetchAssets();
  };

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: C.accent, marginBottom: 8 }}>SAVED CONTENT</div>
          <h1 style={{ fontSize: 32, color: C.text, fontFamily: "Georgia, serif", fontWeight: 400, margin: 0 }}>Asset Library</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { val: "all", label: "All" },
            { val: "COPY", label: "Copy" },
            { val: "IMAGE_PROMPT", label: "Prompts" },
            { val: "IMAGE", label: "Images" },
          ].map((f) => (
            <button key={f.val} onClick={() => setFilter(f.val)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${filter === f.val ? C.accent : C.border}`, background: filter === f.val ? `${C.accent}20` : "transparent", color: filter === f.val ? C.accent : C.textSub, fontSize: 12, cursor: "pointer" }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: C.textMuted, fontSize: 14 }}>Loading assets...</div>
      ) : assets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: C.textMuted }}>
          <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.2 }}>◻</div>
          <div style={{ fontSize: 14 }}>No assets yet. Generate copy or image prompts to populate your library.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {assets.map((asset) => (
            <div key={asset.id} onClick={() => setSelected(asset)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "border-color 0.15s" }}>
              <div style={{ height: 100, background: `${TYPE_COLORS[asset.type]}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: `${TYPE_COLORS[asset.type]}60` }}>
                {asset.type === "COPY" ? "✦" : asset.type === "IMAGE_PROMPT" ? "⬡" : "◻"}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 500, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {asset.label || asset.content.slice(0, 30) + "..."}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: C.textMuted }}>{asset.platform || asset.style || "—"}</span>
                  <span style={{ fontSize: 11, color: C.textMuted }}>{format(new Date(asset.createdAt), "MMM d")}</span>
                </div>
                <div style={{ display: "inline-block", padding: "3px 10px", background: `${TYPE_COLORS[asset.type]}15`, borderRadius: 20, fontSize: 10, color: TYPE_COLORS[asset.type] }}>
                  {asset.type.replace("_", " ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "#00000080", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, width: 560, maxHeight: "80vh", overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, marginBottom: 4 }}>{selected.type.replace("_", " ")}</div>
                <div style={{ fontSize: 16, color: C.text, fontWeight: 600 }}>{selected.label || "Asset"}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: C.textMuted, fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ background: C.card, borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <p style={{ color: C.text, fontSize: 13, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{selected.content}</p>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {selected.platform && <span style={{ padding: "4px 12px", background: `${C.accent}15`, borderRadius: 20, fontSize: 11, color: C.accent }}>{selected.platform}</span>}
              {selected.language && <span style={{ padding: "4px 12px", background: `${C.border}`, borderRadius: 20, fontSize: 11, color: C.textSub }}>{selected.language}</span>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => navigator.clipboard.writeText(selected.content)} style={{ flex: 1, padding: 10, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSub, fontSize: 13, cursor: "pointer" }}>Copy</button>
              <button onClick={() => handleDelete(selected.id)} style={{ flex: 1, padding: 10, background: "#F8717120", border: "1px solid #F8717140", borderRadius: 8, color: "#F87171", fontSize: 13, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
