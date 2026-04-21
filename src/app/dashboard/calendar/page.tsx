"use client";

import { useState, useEffect } from "react";
import { ScheduledPost } from "@/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from "date-fns";

const PLATFORMS = ["Instagram Post", "Instagram Story", "Reel Caption", "Facebook", "LinkedIn", "TikTok", "Email", "Ad Copy"];

const PLATFORM_COLORS: Record<string, string> = {
  "Instagram Post": "#E1306C",
  "Instagram Story": "#833AB4",
  "Reel Caption": "#FD1D1D",
  "Facebook": "#1877F2",
  "LinkedIn": "#0A66C2",
  "TikTok": "#69C9D0",
  "Email": "#C8A96E",
  "Ad Copy": "#059669",
};

const C = {
  accent: "#C8A96E", text: "#F0EDE8", textMuted: "#666666",
  textSub: "#999999", card: "#161616", surface: "#111111", border: "#222222",
};

export default function CalendarPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showModal, setShowModal] = useState<Date | null>(null);
  const [form, setForm] = useState({ label: "", platform: PLATFORMS[0], time: "12:00" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  };

  const handleAdd = async () => {
    if (!form.label || !showModal) return;
    setSaving(true);
    const [h, m] = form.time.split(":").map(Number);
    const scheduledAt = new Date(showModal);
    scheduledAt.setHours(h, m);

    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, scheduledAt: scheduledAt.toISOString() }),
    });

    setShowModal(null);
    setForm({ label: "", platform: PLATFORMS[0], time: "12:00" });
    await fetchPosts();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
    await fetchPosts();
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = (getDay(monthStart) + 6) % 7; // Monday-first

  const postsOnDay = (day: Date) =>
    posts.filter((p) => isSameDay(new Date(p.scheduledAt), day));

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: C.accent, marginBottom: 8 }}>CONTENT PLANNING</div>
          <h1 style={{ fontSize: 32, color: C.text, fontFamily: "Georgia, serif", fontWeight: 400, margin: 0 }}>Content Calendar</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1))} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", color: C.textSub, cursor: "pointer", fontSize: 16 }}>‹</button>
          <span style={{ fontSize: 16, color: C.text, minWidth: 140, textAlign: "center" }}>{format(currentMonth, "MMMM yyyy")}</span>
          <button onClick={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1))} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", color: C.textSub, cursor: "pointer", fontSize: 16 }}>›</button>
        </div>
      </div>

      {/* Weekday headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 8 }}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, textAlign: "center", padding: "8px 0" }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map((day) => {
          const dayPosts = postsOnDay(day);
          const today = isToday(day);
          return (
            <div key={day.toString()} onClick={() => setShowModal(day)} style={{ minHeight: 90, background: today ? `${C.accent}10` : C.card, border: `1px solid ${today ? C.accent : C.border}`, borderRadius: 8, padding: 10, cursor: "pointer" }}>
              <div style={{ fontSize: 13, color: today ? C.accent : C.textSub, fontWeight: today ? 700 : 400, marginBottom: 6 }}>{format(day, "d")}</div>
              {dayPosts.map((p) => (
                <div key={p.id} onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} title="Click to delete" style={{ padding: "3px 6px", borderRadius: 4, background: `${PLATFORM_COLORS[p.platform] || C.accent}20`, fontSize: 10, color: PLATFORM_COLORS[p.platform] || C.accent, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.label}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Add post modal */}
      {showModal && (
        <div onClick={() => setShowModal(null)} style={{ position: "fixed", inset: 0, background: "#00000080", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, width: 400 }}>
            <div style={{ fontSize: 16, color: C.text, fontWeight: 600, marginBottom: 4 }}>Add Post</div>
            <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 24 }}>{format(showModal, "EEEE, d MMMM yyyy")}</div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>POST LABEL</label>
              <input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} placeholder="e.g. Spring collection teaser" style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>PLATFORM</label>
                <select value={form.platform} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))} style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13 }}>
                  {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: C.textMuted, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>TIME</label>
                <input type="time" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleAdd} disabled={saving || !form.label} style={{ flex: 1, padding: 10, background: C.accent, border: "none", borderRadius: 8, color: "#000", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {saving ? "Saving..." : "Add Post"}
              </button>
              <button onClick={() => setShowModal(null)} style={{ flex: 1, padding: 10, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSub, fontSize: 13, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
