import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const assetSchema = z.object({
  type: z.enum(["COPY", "IMAGE_PROMPT", "IMAGE"]),
  content: z.string().min(1),
  platform: z.string().optional(),
  language: z.string().optional(),
  style: z.string().optional(),
  brief: z.string().optional(),
  label: z.string().optional(),
  tags: z.array(z.string()).default([]),
  brandId: z.string().optional(),
});

async function getUser(clerkId: string) {
  return prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId, email: `user-${clerkId}@temp.com` },
  });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const brandId = searchParams.get("brandId");

  const user = await getUser(userId);
  const assets = await prisma.asset.findMany({
    where: {
      userId: user.id,
      ...(type ? { type: type as "COPY" | "IMAGE_PROMPT" | "IMAGE" } : {}),
      ...(brandId ? { brandId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assets);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = assetSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = await getUser(userId);
  const asset = await prisma.asset.create({
    data: { ...parsed.data, userId: user.id },
  });

  return NextResponse.json(asset, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const assetId = searchParams.get("id");
  if (!assetId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const user = await getUser(userId);
  await prisma.asset.deleteMany({ where: { id: assetId, userId: user.id } });

  return NextResponse.json({ success: true });
}
