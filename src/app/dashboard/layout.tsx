"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/dashboard/brands", label: "Brands", icon: "◈" },
  { href: "/dashboard/copy", label: "Copy Studio", icon: "✦" },
  { href: "/dashboard/image", label: "Image Studio", icon: "⬡" },
  { href: "/dashboard/assets", label: "Asset Library", icon: "◻" },
  { href: "/dashboard/calendar", label: "Calendar", icon: "◷" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0A0A0A" }}>
      {/* Sidebar */}
      <aside
        style={{
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
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "0 24px 32px",
            borderBottom: "1px solid #222222",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 4,
                color: "#C8A96E",
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              CAMPAIGN
            </div>
            <div
              style={{
                fontSize: 22,
                color: "#F0EDE8",
                fontFamily: "Georgia, serif",
                letterSpacing: -0.5,
              }}
            >
              OS
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ padding: "8px 0", flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 24px",
                  background: isActive ? "#C8A96E15" : "transparent",
                  color: isActive ? "#C8A96E" : "#999999",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: "none",
                  borderLeft: isActive
                    ? "2px solid #C8A96E"
                    : "2px solid transparent",
                  letterSpacing: 0.3,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div
          style={{
            padding: "20px 24px",
            borderTop: "1px solid #222222",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <UserButton afterSignOutUrl="/" />
          <div style={{ fontSize: 12, color: "#999999" }}>Account</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto" }}>{children}</main>
    </div>
  );
}
