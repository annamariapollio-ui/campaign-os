"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LanguageProvider, useLanguage } from "@/lib/language-context";
import { Language } from "@/lib/translations";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "it", label: "IT", flag: "🇮🇹" },
  { code: "de", label: "DE", flag: "🇩🇪" },
  { code: "es", label: "ES", flag: "🇪🇸" },
];

function SidebarContent() {
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();

  const NAV_ITEMS = [
    { href: "/dashboard", label: t.dashboard, icon: "⊞" },
    { href: "/dashboard/brands", label: t.brands, icon: "◈" },
    { href: "/dashboard/copy", label: t.copyStudio, icon: "✦" },
    { href: "/dashboard/image", label: t.imageStudio, icon: "⬡" },
    { href: "/dashboard/assets", label: t.assetLibrary, icon: "◻" },
    { href: "/dashboard/calendar", label: t.calendar, icon: "◷" },
  ];

  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: "#111111",
      borderRight: "1px solid #222222",
      display: "flex",
      flexDirection: "column",
      padding: "32px 0",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      height: "100vh",
    }}>
      {/* Logo */}
      <div style={{ padding: "0 24px 32px", borderBottom: "1px solid #222222" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#C8A96E", marginBottom: 4, fontWeight: 600 }}>CAMPAIGN</div>
          <div style={{ fontSize: 22, color: "#F0EDE8", fontFamily: "Georgia, serif", letterSpacing: -0.5 }}>OS</div>
        </Link>
      </div>

      {/* Language switcher */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #222222" }}>
        <div style={{ fontSize: 10, color: "#666666", letterSpacing: 1.5, marginBottom: 8 }}>LANGUAGE</div>
        <div style={{ display: "flex", gap: 6 }}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              title={lang.label}
              style={{
                flex: 1,
                padding: "5px 0",
                borderRadius: 6,
                border: `1px solid ${language === lang.code ? "#C8A96E" : "#222222"}`,
                background: language === lang.code ? "#C8A96E20" : "transparent",
                color: language === lang.code ? "#C8A96E" : "#666666",
                fontSize: 11,
                fontWeight: language === lang.code ? 700 : 400,
                cursor: "pointer",
              }}
            >
              {lang.flag}
            </button>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "8px 0", flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 24px",
              background: isActive ? "#C8A96E15" : "transparent",
              color: isActive ? "#C8A96E" : "#999999",
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              textDecoration: "none",
              borderLeft: isActive ? "2px solid #C8A96E" : "2px solid transparent",
              letterSpacing: 0.3,
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "20px 24px", borderTop: "1px solid #222222", display: "flex", alignItems: "center", gap: 10 }}>
        <UserButton afterSignOutUrl="/" />
        <div style={{ fontSize: 12, color: "#999999" }}>{t.account}</div>
      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div style={{ display: "flex", minHeight: "100vh", background: "#0A0A0A" }}>
        <SidebarContent />
        <main style={{ flex: 1, overflowY: "auto" }}>{children}</main>
      </div>
    </LanguageProvider>
  );
}
