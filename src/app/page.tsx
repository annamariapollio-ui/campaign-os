import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: 600, textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: 5,
            color: "#C8A96E",
            marginBottom: 24,
            fontWeight: 600,
          }}
        >
          CAMPAIGN
        </div>
        <h1
          style={{
            fontSize: 64,
            color: "#F0EDE8",
            fontFamily: "Georgia, serif",
            fontWeight: 400,
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          OS
        </h1>
        <p
          style={{
            fontSize: 18,
            color: "#999999",
            lineHeight: 1.7,
            marginBottom: 48,
            maxWidth: 440,
            margin: "0 auto 48px",
          }}
        >
          The unified creative suite for fashion and lifestyle brands. AI-powered
          copy, image direction, and content planning — all in one place.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <SignedOut>
            <Link
              href="/sign-up"
              style={{
                padding: "14px 32px",
                background: "#C8A96E",
                borderRadius: 8,
                color: "#000",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                letterSpacing: 0.5,
              }}
            >
              Get Started
            </Link>
            <Link
              href="/sign-in"
              style={{
                padding: "14px 32px",
                background: "transparent",
                border: "1px solid #222222",
                borderRadius: 8,
                color: "#999999",
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              style={{
                padding: "14px 32px",
                background: "#C8A96E",
                borderRadius: 8,
                color: "#000",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Go to Dashboard →
            </Link>
          </SignedIn>
        </div>

        <div
          style={{
            display: "flex",
            gap: 40,
            justifyContent: "center",
            marginTop: 80,
          }}
        >
          {[
            { icon: "✦", label: "Copy Studio" },
            { icon: "⬡", label: "Image Studio" },
            { icon: "◻", label: "Asset Library" },
            { icon: "◷", label: "Content Calendar" },
          ].map((f) => (
            <div key={f.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, color: "#C8A96E", marginBottom: 8 }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 12, color: "#666666", letterSpacing: 1 }}>
                {f.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
