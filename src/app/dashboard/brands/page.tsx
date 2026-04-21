"use client";

import { useState, useEffect } from "react";
import { Brand } from "@/types";

const TONES = [
  "Luxury & Refined",
  "Playful & Fun",
  "Bold & Edgy",
  "Warm & Friendly",
  "Professional",
  "Minimalist",
];

const C = {
  accent: "#C8A96E",
  accentDim: "#8B6F3E",
  text: "#F0EDE8",
  textMuted: "#666666",
  textSub: "#999999",
  card: "#161616",
  surface: "#111111",
  border: "#222222",
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    tone: TONES[0],
    voice: "",
    keywords: "",
    colors: "",
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    const res = await fetch("/api/brands");
    const data = await res.json();
    setBrands(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ name: "", industry: "", tone: TONES[0], voice: "", keywords: "", colors: "" });
    await fetchBrands();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/brands?id=${id}`, { method: "DELETE" });
    await fetchBrands();
  };

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: C.accent, marginBottom: 8 }}>BRAND MANAGEMENT</div>
          <h1 style={{ fontSize: 32, color: C.text, fontFamily: "Georgia, serif", fontWeight: 400, margin: 0 }}>Brands</h1>
        </div>
        <button onClick={() => setShowForm(true)} style={{ padding: "10px 20px", background: C.accent, border: "none", borderRadius: 8, color: "#000", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + New Brand
        </button>
      </div>

      {showForm && (
        <div style={{ background: C.card, border: `1px solid ${C.accent}40`, borderRadius: 16, padding: 32, marginBottom: 32 }}>
          <div style={{ fontSize: 14, color: C.text, fontWeight: 600, marginBottom: 24 }}>Create Brand Profile</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {[
              { key: "name", label: "Brand Name", placeholder: "e.g. Marco Masi Store" },
              { key: "industry", label: "Industry", placeholder: "e.g. Fashion, Luxury, Beauty" },
            ].map((f) => (
              <div key={f.key}>
                <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>{f.label.toUpperCase()}</label>
                <input
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>TONE OF VOICE</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TONES.map((t) => (
                <button key={t} onClick={() => setForm((p) => ({ ...p, tone: t }))} style={{ padding: "8px 14px", borderRadius: 20, border: `1px solid ${form.tone === t ? C.accent : C.border}`, background: form.tone === t ? `${C.accent}20` : "transparent", color: form.tone === t ? C.accent : C.textSub, fontSize: 12, cursor: "pointer" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>BRAND VOICE DESCRIPTION</label>
            <textarea value={form.voice} onChange={(e) => setForm((p) => ({ ...p, voice: e.target.value }))} placeholder="Describe your brand voice in detail. e.g. Sophisticated yet approachable, speaks to fashion-forward individuals who appreciate Italian craftsmanship..." rows={3} style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>KEY WORDS / THEMES</label>
            <input value={form.keywords} onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))} placeholder="e.g. elegance, Italian craftsmanship, timeless, exclusive" style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, boxSizing: "border-box" }} />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={handleSave} disabled={saving} style={{ padding: "10px 24px", background: saving ? C.accentDim : C.accent, border: "none", borderRadius: 8, color: "#000", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Saving..." : "Save Brand"}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: "10px 24px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSub, fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: C.textMuted, fontSize: 14 }}>Loading...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {brands.length === 0 && !showForm && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: C.textMuted, fontSize: 14 }}>
              No brands yet. Create your first brand profile.
            </div>
          )}
          {brands.map((brand) => (
            <div key={brand.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: C.accent, marginBottom: 16 }}>◈</div>
              <div style={{ fontSize: 16, color: C.text, fontWeight: 600, marginBottom: 4 }}>{brand.name}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>{brand.industry}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-block", padding: "4px 12px", background: `${C.accent}15`, borderRadius: 20, fontSize: 11, color: C.accent }}>{brand.tone}</span>
                <button onClick={() => handleDelete(brand.id)} style={{ background: "transparent", border: "none", color: C.textMuted, fontSize: 12, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
