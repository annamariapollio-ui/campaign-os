import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const postSchema = z.object({
  label: z.string().min(1),
  platform: z.string(),
  scheduledAt: z.string(),
  brandId: z.string().optional(),
  assetId: z.string().optional(),
});

async function getUser(clerkId: string) {
  return prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId, email: `user-${clerkId}@temp.com` },
  });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUser(userId);
  const posts = await prisma.scheduledPost.findMany({
    where: { userId: user.id },
    orderBy: { scheduledAt: "asc" },
    include: { brand: true },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = await getUser(userId);
  const post = await prisma.scheduledPost.create({
    data: {
      ...parsed.data,
      scheduledAt: new Date(parsed.data.scheduledAt),
      userId: user.id,
    },
  });

  return NextResponse.json(post, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("id");
  if (!postId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const user = await getUser(userId);
  await prisma.scheduledPost.deleteMany({ where: { id: postId, userId: user.id } });

  return NextResponse.json({ success: true });
}
