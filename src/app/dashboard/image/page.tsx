"use client";

import { useState, useEffect, useRef } from "react";
import { Brand } from "@/types";
import { useLanguage } from "@/lib/language-context";

const STYLES = ["Editorial fashion", "Product flat lay", "Lifestyle", "Lookbook", "Campaign art", "Street style", "Studio portrait"];

const C = {
  accent: "#C8A96E", accentDim: "#8B6F3E", text: "#F0EDE8",
  textMuted: "#666666", textSub: "#999999", card: "#161616",
  surface: "#111111", border: "#222222", success: "#4ADE80",
};

const PROVIDERS = [
  { id: "gemini", label: "Gemini", sublabel: "Requires billing", icon: "G" },
  { id: "replicate", label: "Replicate", sublabel: "Free tier available", icon: "R" },
];

interface ReferenceImage {
  base64: string;
  mimeType: string;
  preview: string;
  name: string;
}

export default function ImageStudioPage() {
  const { t } = useLanguage();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [brief, setBrief] = useState("");
  const [provider, setProvider] = useState<"gemini" | "replicate">("replicate");
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [generatedImage, setGeneratedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/brands").then((r) => r.json()).then(setBrands);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const base64 = result.split(",")[1];
        setReferenceImages((prev) => [...prev, { base64, mimeType: file.type, preview: result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const buildPrompt = () => {
    const brandContext = brands.find((b) => b.id === selectedBrandId);
    let prompt = `${style} photography. ${brief}`;
    if (brandContext) {
      prompt += `. Brand aesthetic: ${brandContext.tone}. Keywords: ${brandContext.keywords || ""}.`;
    }
    if (referenceImages.length > 0) {
      prompt += ` Incorporate the clothing items from the reference images into the outfit.`;
    }
    prompt += ` High quality, professional fashion photography, detailed, sharp focus.`;
    return prompt;
  };

  const generate = async () => {
    if (!brief) return;
    setLoading(true);
    setGeneratedImage(null);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: buildPrompt(),
          provider,
          referenceImages: referenceImages.map((r) => ({ base64: r.base64, mimeType: r.mimeType })),
        }),
      });
      const data = await res.json();
      if (data.image) {
        setGeneratedImage({ data: data.image, mimeType: data.mimeType });
      } else {
        setError(data.error || "Failed to generate image.");
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!generatedImage) return;
    await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "IMAGE",
        content: `data:${generatedImage.mimeType};base64,${generatedImage.data}`,
        style, brief,
        brandId: selectedBrandId || undefined,
        label: brief.slice(0, 40),
      }),
    });
    setSaved(true);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = `data:${generatedImage.mimeType};base64,${generatedImage.data}`;
    link.download = `campaign-os-${Date.now()}.png`;
    link.click();
  };

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.accent, marginBottom: 8 }}>{t.aiImageGen}</div>
        <h1 style={{ fontSize: 32, color: C.text, fontFamily: "Georgia, serif", fontWeight: 400, margin: 0 }}>{t.imageStudioTitle}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          {/* Provider selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 12 }}>AI MODEL</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {PROVIDERS.map((p) => (
                <button key={p.id} onClick={() => setProvider(p.id as any)} style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: `1px solid ${provider === p.id ? C.accent : C.border}`,
                  background: provider === p.id ? `${C.accent}15` : C.card,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: provider === p.id ? C.accent : C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: provider === p.id ? "#000" : C.textMuted }}>
                      {p.icon}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: provider === p.id ? C.accent : C.text }}>{p.label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{p.sublabel}</div>
                </button>
              ))}
            </div>
          </div>

          {brands.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>{t.brandProfile}</label>
              <select value={selectedBrandId} onChange={(e) => setSelectedBrandId(e.target.value)} style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13 }}>
                <option value="">{t.noBrandSelected}</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 12 }}>{t.visualStyle}</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {STYLES.map((s) => (
                <button key={s} onClick={() => setStyle(s)} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${style === s ? C.accent : C.border}`, background: style === s ? `${C.accent}20` : "transparent", color: style === s ? C.accent : C.textSub, fontSize: 12, cursor: "pointer" }}>{s}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>{t.sceneBrief}</label>
            <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder={t.sceneBriefPlaceholder} rows={4} style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.text, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>{t.clothingRefs}</label>
            <div onClick={() => fileInputRef.current?.click()} style={{ border: `2px dashed ${C.border}`, borderRadius: 8, padding: "20px", textAlign: "center", cursor: "pointer", marginBottom: 12 }}>
              <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.4 }}>⬆</div>
              <div style={{ fontSize: 13, color: C.textMuted }}>{t.uploadClothing}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{t.uploadHint}</div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} style={{ display: "none" }} />
            {referenceImages.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {referenceImages.map((img, i) => (
                  <div key={i} style={{ position: "relative", width: 72, height: 72 }}>
                    <img src={img.preview} alt={img.name} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}` }} />
                    <button onClick={() => setReferenceImages((prev) => prev.filter((_, j) => j !== i))} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#F87171", border: "none", color: "#fff", fontSize: 12, cursor: "pointer" }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={generate} disabled={loading || !brief} style={{ width: "100%", padding: 14, background: loading ? C.accentDim : C.accent, border: "none", borderRadius: 8, color: "#000", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? t.generatingImage : t.generateImage}
          </button>
        </div>

        {/* Right: Result */}
        <div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", minHeight: 400 }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5 }}>{t.generatedImage}</div>
              <div style={{ fontSize: 11, color: C.textMuted, padding: "3px 10px", background: `${C.accent}10`, borderRadius: 20, border: `1px solid ${C.accent}20` }}>
                {provider === "gemini" ? "Gemini Imagen" : "Replicate SDXL"}
              </div>
            </div>

            {loading && (
              <div style={{ height: 360, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, border: `2px solid ${C.accent}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 13, color: C.textMuted }}>{t.generatingMsg}</div>
                <div style={{ fontSize: 11, color: C.textMuted, opacity: 0.6 }}>{t.generatingTime}</div>
              </div>
            )}

            {!loading && error && (
              <div style={{ padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#F87171", marginBottom: 16, lineHeight: 1.6 }}>{error}</div>
                <button onClick={generate} style={{ padding: "8px 20px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSub, fontSize: 13, cursor: "pointer", marginRight: 10 }}>{t.tryAgain}</button>
                {provider === "gemini" && (
                  <button onClick={() => { setProvider("replicate"); setError(""); }} style={{ padding: "8px 20px", background: `${C.accent}20`, border: `1px solid ${C.accent}40`, borderRadius: 8, color: C.accent, fontSize: 13, cursor: "pointer" }}>
                    Switch to Replicate
                  </button>
                )}
              </div>
            )}

            {!loading && generatedImage && (
              <div>
                <img src={`data:${generatedImage.mimeType};base64,${generatedImage.data}`} alt="Generated" style={{ width: "100%", display: "block" }} />
                <div style={{ padding: 16, display: "flex", gap: 10 }}>
                  <button onClick={handleDownload} style={{ flex: 1, padding: 10, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSub, fontSize: 13, cursor: "pointer" }}>{t.download}</button>
                  <button onClick={handleSave} disabled={saved} style={{ flex: 1, padding: 10, background: saved ? `${C.success}20` : `${C.accent}20`, border: `1px solid ${saved ? C.success : C.accent}40`, borderRadius: 8, color: saved ? C.success : C.accent, fontSize: 13, cursor: "pointer" }}>
                    {saved ? t.saved : t.saveToLibrary}
                  </button>
                  <button onClick={generate} style={{ flex: 1, padding: 10, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSub, fontSize: 13, cursor: "pointer" }}>{t.regenerate}</button>
                </div>
              </div>
            )}

            {!loading && !generatedImage && !error && (
              <div style={{ height: 360, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.textMuted }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.15 }}>⬡</div>
                <div style={{ fontSize: 13 }}>{t.imageWillAppear}</div>
                <div style={{ fontSize: 11, marginTop: 8, opacity: 0.6 }}>{t.describeScene}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
