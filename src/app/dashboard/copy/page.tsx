"use client";

import { useState, useEffect } from "react";
import { Brand } from "@/types";

const PLATFORMS = [
  { id: "instagram_post", label: "Instagram Post" },
  { id: "instagram_story", label: "Instagram Story" },
  { id: "instagram_reel", label: "Reel Caption" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "tiktok", label: "TikTok" },
  { id: "email", label: "Email Subject" },
  { id: "ad_copy", label: "Ad Copy" },
];

const LANGUAGES = ["English", "Italian", "French", "German", "Spanish", "Portuguese"];
const LENGTHS = ["Short", "Medium", "Long"] as const;

const C = {
  accent: "#C8A96E", accentDim: "#8B6F3E", text: "#F0EDE8",
  textMuted: "#666666", textSub: "#999999", card: "#161616",
  surface: "#111111", border: "#222222", success: "#4ADE80",
};

export default function CopyStudioPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [platform, setPlatform] = useState("instagram_post");
  const [language, setLanguage] = useState("English");
  const [length, setLength] = useState<"Short" | "Medium" | "Long">("Medium");
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/brands").then((r) => r.json()).then(setBrands);
  }, []);

  const generate = async () => {
    if (!brief) return;
    setLoading(true);
    setResult("");
    setSaved(false);

    const res = await fetch("/api/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: selectedBrandId || undefined, platform, language, length, brief }),
    });
    const data = await res.json();
    setResult(data.copy || "Error generating copy.");
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!result) return;
    const platformLabel = PLATFORMS.find((p) => p.id === platform)?.label;
    await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "COPY",
        content: result,
        platform: platformLabel,
        language,
        brief,
        brandId: selectedBrandId || undefined,
        label: brief.slice(0, 40),
      }),
    });
    setSaved(true);
  };

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.accent, marginBottom: 8 }}>AI COPYWRITING</div>
        <h1 style={{ fontSize: 32, color: C.text, fontFamily: "Georgia, serif", fontWeight: 400, margin: 0 }}>Copy Studio</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        {/* Left: Controls */}
        <div>
          {brands.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>BRAND PROFILE</label>
              <select value={selectedBrandId} onChange={(e) => setSelectedBrandId(e.target.value)} style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13 }}>
                <option value="">No brand selected</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 12 }}>PLATFORM</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PLATFORMS.map((p) => (
                <button key={p.id} onClick={() => setPlatform(p.id)} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${platform === p.id ? C.accent : C.border}`, background: platform === p.id ? `${C.accent}20` : "transparent", color: platform === p.id ? C.accent : C.textSub, fontSize: 12, cursor: "pointer" }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>LANGUAGE</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13 }}>
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>LENGTH</label>
              <div style={{ display: "flex", gap: 8 }}>
                {LENGTHS.map((l) => (
                  <button key={l} onClick={() => setLength(l)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1px solid ${length === l ? C.accent : C.border}`, background: length === l ? `${C.accent}20` : "transparent", color: length === l ? C.accent : C.textSub, fontSize: 12, cursor: "pointer" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>CAMPAIGN BRIEF</label>
            <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="What is this post about? e.g. Launching new spring collection — flowing linen dresses in neutral tones, perfect for the Italian summer..." rows={5} style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.text, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
          </div>

          <button onClick={generate} disabled={loading || !brief} style={{ width: "100%", padding: 14, background: loading ? C.accentDim : C.accent, border: "none", borderRadius: 8, color: "#000", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Generating..." : "✦  Generate Copy"}
          </button>
        </div>

        {/* Right: Result */}
        <div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, minHeight: 300 }}>
            <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, marginBottom: 16 }}>GENERATED COPY</div>
            {loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[100, 85, 90, 70].map((w, i) => (
                  <div key={i} style={{ height: 12, borderRadius: 6, background: C.border, width: `${w}%`, animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            )}
            {!loading && result && (
              <div className="animate-fade-in">
                <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{result}</p>
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button onClick={handleCopy} style={{ flex: 1, padding: 10, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: copied ? C.success : C.textSub, fontSize: 13, cursor: "pointer" }}>
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                  <button onClick={handleSave} disabled={saved} style={{ flex: 1, padding: 10, background: saved ? `${C.success}20` : `${C.accent}20`, border: `1px solid ${saved ? C.success : C.accent}40`, borderRadius: 8, color: saved ? C.success : C.accent, fontSize: 13, cursor: "pointer" }}>
                    {saved ? "✓ Saved" : "Save to Library"}
                  </button>
                  <button onClick={generate} style={{ flex: 1, padding: 10, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSub, fontSize: 13, cursor: "pointer" }}>
                    Regenerate
                  </button>
                </div>
              </div>
            )}
            {!loading && !result && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, color: C.textMuted, fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>✦</div>
                Your copy will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
