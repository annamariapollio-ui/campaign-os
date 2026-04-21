import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getOrCreateUser(clerkId: string, email: string) {
  return await prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId, email },
    include: {
      brands: { take: 5, orderBy: { createdAt: "desc" } },
      assets: { take: 10, orderBy: { createdAt: "desc" } },
      posts: {
        where: { scheduledAt: { gte: new Date() } },
        take: 5,
        orderBy: { scheduledAt: "asc" },
      },
    },
  });
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  // In production, get email from Clerk user object
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId, email: `user-${userId}@temp.com` },
    include: {
      brands: { orderBy: { createdAt: "desc" } },
      assets: { orderBy: { createdAt: "desc" } },
      posts: {
        where: { scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      },
    },
  });

  const stats = [
    { label: "Brands", value: user.brands.length, icon: "◈" },
    { label: "Assets", value: user.assets.length, icon: "◻" },
    { label: "Scheduled", value: user.posts.length, icon: "◷" },
    { label: "This Month", value: user.assets.filter(a => {
      const now = new Date();
      return a.createdAt.getMonth() === now.getMonth();
    }).length, icon: "✦" },
  ];

  const quickActions = [
    { label: "Generate copy", href: "/dashboard/copy", icon: "✦" },
    { label: "Create image prompt", href: "/dashboard/image", icon: "⬡" },
    { label: "Add brand", href: "/dashboard/brands", icon: "◈" },
    { label: "View calendar", href: "/dashboard/calendar", icon: "◷" },
  ];

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#C8A96E", marginBottom: 8 }}>OVERVIEW</div>
        <h1 style={{ fontSize: 32, color: "#F0EDE8", fontFamily: "Georgia, serif", fontWeight: 400, margin: 0 }}>
          Dashboard
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#161616", border: "1px solid #222222", borderRadius: 12, padding: "24px 20px" }}>
            <div style={{ fontSize: 24, color: "#C8A96E", marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 28, color: "#F0EDE8", fontWeight: 700, fontFamily: "Georgia, serif" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#666666", marginTop: 4, letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Quick actions */}
        <div style={{ background: "#161616", border: "1px solid #222222", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#666666", marginBottom: 20 }}>QUICK ACTIONS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", background: "#C8A96E08",
                border: "1px solid #222222", borderRadius: 8,
                color: "#F0EDE8", fontSize: 13, textDecoration: "none",
              }}>
                <span style={{ color: "#C8A96E" }}>{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming posts */}
        <div style={{ background: "#161616", border: "1px solid #222222", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#666666", marginBottom: 20 }}>UPCOMING POSTS</div>
          {user.posts.length === 0 ? (
            <div style={{ color: "#666666", fontSize: 13, textAlign: "center", padding: "40px 0" }}>
              No scheduled posts yet.{" "}
              <Link href="/dashboard/calendar" style={{ color: "#C8A96E" }}>Add one →</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {user.posts.map((post) => (
                <div key={post.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "#C8A96E20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#C8A96E" }}>
                    {new Date(post.scheduledAt).getDate()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "#F0EDE8" }}>{post.label}</div>
                    <div style={{ fontSize: 11, color: "#666666" }}>{post.platform}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
