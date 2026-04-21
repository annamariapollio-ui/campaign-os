import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  brandId: z.string().optional(),
  style: z.string(),
  brief: z.string().min(1),
  references: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { brandId, style, brief, references } = parsed.data;

  let brandContext = "";
  if (brandId) {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (user) {
      const brand = await prisma.brand.findFirst({ where: { id: brandId, userId: user.id } });
      if (brand) {
        brandContext = `Brand: ${brand.name}. Tone: ${brand.tone}. Keywords: ${brand.keywords || ""}.`;
      }
    }
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `You are an expert fashion photographer and art director. Create a detailed image generation prompt for Gemini Imagen, Midjourney, or DALL-E.

${brandContext}
Visual style: ${style}
Scene brief: ${brief}
${references.length > 0 ? `Outfit items / references to include: ${references.join(", ")}` : ""}

Write a vivid, detailed image prompt (3-5 sentences) describing the scene, model, lighting, composition, mood, colour palette, and styling direction. Be specific and evocative. Output ONLY the prompt text — no explanation, no preamble.`,
      },
    ],
  });

  const prompt = message.content.map((b) => (b.type === "text" ? b.text : "")).join("");

  return NextResponse.json({ prompt });
}
