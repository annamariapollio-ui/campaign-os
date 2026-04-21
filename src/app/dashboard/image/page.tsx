"use client";

import { useState, useEffect } from "react";
import { Brand } from "@/types";

const STYLES = ["Editorial fashion", "Product flat lay", "Lifestyle", "Lookbook", "Campaign art", "Street style", "Studio portrait"];

const C = {
  accent: "#C8A96E", accentDim: "#8B6F3E", text: "#F0EDE8",
  textMuted: "#666666", textSub: "#999999", card: "#161616",
  surface: "#111111", border: "#222222",
};

export default function ImageStudioPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [brief, setBrief] = useState("");
  const [references, setReferences] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/brands").then((r) => r.json()).then(setBrands);
  }, []);

  const generate = async () => {
    if (!brief) return;
    setLoading(true);
    setPrompt("");
    setSaved(false);

    const res = await fetch("/api/generate-image-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: selectedBrandId || undefined, style, brief, references }),
    });
    const data = await res.json();
    setPrompt(data.prompt || "Error generating prompt.");
    setLoading(false);
  };

  const handleSave = async () => {
    if (!prompt) return;
    await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "IMAGE_PROMPT",
        content: prompt,
        style,
        brief,
        brandId: selectedBrandId || undefined,
        label: brief.slice(0, 40),
      }),
    });
    setSaved(true);
  };

  const addReference = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (e.key === "Enter" && input.value.trim()) {
      setReferences((prev) => [...prev, input.value.trim()]);
      input.value = "";
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.accent, marginBottom: 8 }}>AI IMAGE DIRECTION</div>
        <h1 style={{ fontSize: 32, color: C.text, fontFamily: "Georgia, serif", fontWeight: 400, margin: 0 }}>Image Studio</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
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
            <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 12 }}>VISUAL STYLE</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {STYLES.map((s) => (
                <button key={s} onClick={() => setStyle(s)} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${style === s ? C.accent : C.border}`, background: style === s ? `${C.accent}20` : "transparent", color: style === s ? C.accent : C.textSub, fontSize: 12, cursor: "pointer" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>SCENE BRIEF</label>
            <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Describe the image you want. e.g. Model wearing a cream linen dress at golden hour on an Italian terrace, sea view in the background..." rows={4} style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.text, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>OUTFIT ITEMS / REFERENCES</label>
            <input onKeyDown={addReference} placeholder="Type an item and press Enter — e.g. cream linen blazer" style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, boxSizing: "border-box" }} />
            {references.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {references.map((r, i) => (
                  <span key={i} onClick={() => setReferences((prev) => prev.filter((_, j) => j !== i))} style={{ padding: "4px 12px", background: `${C.accent}15`, borderRadius: 20, fontSize: 12, color: C.accent, cursor: "pointer" }}>
                    {r} ×
                  </span>
                ))}
              </div>
            )}
          </div>

          <button onClick={generate} disabled={loading || !brief} style={{ width: "100%", padding: 14, background: loading ? C.accentDim : C.accent, border: "none", borderRadius: 8, color: "#000", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Generating..." : "⬡  Generate Image Prompt"}
          </button>
        </div>

        <div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, marginBottom: 16 }}>GENERATED PROMPT</div>
            {loading && (
              <div style={{ height: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, border: `2px solid ${C.accent}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 13, color: C.textMuted }}>Crafting your visual brief...</div>
              </div>
            )}
            {!loading && prompt && (
              <div className="animate-fade-in">
                <div style={{ background: C.surface, borderRadius: 8, padding: 16, marginBottom: 16 }}>
                  <p style={{ color: C.text, fontSize: 13, lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>{prompt}</p>
                </div>
                <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 16 }}>Copy this prompt into Gemini Imagen, Midjourney, or DALL-E 3 to generate your image.</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => navigator.clipboard.writeText(prompt)} style={{ flex: 1, padding: 10, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSub, fontSize: 13, cursor: "pointer" }}>
                    Copy Prompt
                  </button>
                  <button onClick={handleSave} disabled={saved} style={{ flex: 1, padding: 10, background: `${C.accent}20`, border: `1px solid ${C.accent}40`, borderRadius: 8, color: C.accent, fontSize: 13, cursor: "pointer" }}>
                    {saved ? "✓ Saved" : "Save to Library"}
                  </button>
                </div>
              </div>
            )}
            {!loading && !prompt && (
              <div style={{ height: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.textMuted }}>
                <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.2 }}>⬡</div>
                <div style={{ fontSize: 13 }}>Your image prompt will appear here</div>
              </div>
            )}
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginTop: 16 }}>
            <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, marginBottom: 12 }}>RECOMMENDED TOOLS</div>
            {[
              { name: "Gemini Imagen 3", url: "https://gemini.google.com", desc: "Best for fashion & lifestyle" },
              { name: "Midjourney", url: "https://midjourney.com", desc: "Editorial & artistic quality" },
              { name: "DALL-E 3", url: "https://openai.com/dall-e-3", desc: "Fast, versatile generation" },
            ].map((t) => (
              <a key={t.name} href={t.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}`, textDecoration: "none" }}>
                <span style={{ fontSize: 13, color: C.text }}>{t.name}</span>
                <span style={{ fontSize: 11, color: C.textMuted }}>{t.desc}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
