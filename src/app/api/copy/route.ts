import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  brandId: z.string().optional(),
  platform: z.string(),
  language: z.string(),
  length: z.enum(["Short", "Medium", "Long"]),
  brief: z.string().min(1),
});

const PLATFORM_LABELS: Record<string, string> = {
  instagram_post: "Instagram Post",
  instagram_story: "Instagram Story",
  instagram_reel: "Instagram Reel Caption",
  facebook: "Facebook Post",
  linkedin: "LinkedIn Post",
  tiktok: "TikTok Caption",
  email: "Email Subject Line",
  ad_copy: "Ad Copy",
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { brandId, platform, language, length, brief } = parsed.data;

  let brandContext = "";
  if (brandId) {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (user) {
      const brand = await prisma.brand.findFirst({ where: { id: brandId, userId: user.id } });
      if (brand) {
        brandContext = `Brand: ${brand.name}. Industry: ${brand.industry || "Fashion"}. Tone: ${brand.tone}. Voice: ${brand.voice || ""}. Keywords: ${brand.keywords || ""}.`;
      }
    }
  }

  const platformLabel = PLATFORM_LABELS[platform] || platform;

  const lengthGuide = {
    Short: "Keep it very concise, 1-2 sentences maximum.",
    Medium: "2-4 sentences, balanced and engaging.",
    Long: "4-6 sentences, detailed and rich.",
  }[length];

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: `You are an expert social media copywriter specialising in fashion and lifestyle brands. Write compelling, platform-optimised copy. Be creative and on-brand. Never add hashtags unless asked. Output ONLY the copy text — no explanation, no quotes around the text.`,
    messages: [
      {
        role: "user",
        content: `${brandContext}

Platform: ${platformLabel}
Language: ${language}
Length: ${length} — ${lengthGuide}
Campaign brief: ${brief}

Write the ${platformLabel} copy now.`,
      },
    ],
  });

  const copy = message.content.map((b) => (b.type === "text" ? b.text : "")).join("");

  return NextResponse.json({ copy });
}
