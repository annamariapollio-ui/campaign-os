import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const brandSchema = z.object({
  name: z.string().min(1),
  industry: z.string().optional(),
  tone: z.string(),
  voice: z.string().optional(),
  keywords: z.string().optional(),
  colors: z.string().optional(),
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
  const brands = await prisma.brand.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(brands);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = brandSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = await getUser(userId);
  const brand = await prisma.brand.create({
    data: { ...parsed.data, userId: user.id },
  });

  return NextResponse.json(brand, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("id");
  if (!brandId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const user = await getUser(userId);
  await prisma.brand.deleteMany({ where: { id: brandId, userId: user.id } });

  return NextResponse.json({ success: true });
}
