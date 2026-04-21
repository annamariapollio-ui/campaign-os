import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { prompt, referenceImages } = body;

  if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });

  try {
    // Build the contents array
    const parts: any[] = [];

    // Add reference images if provided
    if (referenceImages && referenceImages.length > 0) {
      parts.push({
        text: `Use these reference clothing items as inspiration for the outfit in the image:`,
      });
      for (const img of referenceImages) {
        // img is { base64: string, mimeType: string }
        parts.push({
          inline_data: {
            mime_type: img.mimeType,
            data: img.base64,
          },
        });
      }
    }

    parts.push({ text: prompt });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            personGeneration: "allow_adult",
          },
        }),
      }
    );

    const data = await response.json();

    if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
      return NextResponse.json({
        image: data.predictions[0].bytesBase64Encoded,
        mimeType: data.predictions[0].mimeType || "image/png",
      });
    }

    // Fallback: try gemini-2.0-flash with image generation
    const fallbackResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
          },
        }),
      }
    );

    const fallbackData = await fallbackResponse.json();

    // Extract image from response
    const candidates = fallbackData.candidates || [];
    for (const candidate of candidates) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData?.data) {
          return NextResponse.json({
            image: part.inlineData.data,
            mimeType: part.inlineData.mimeType || "image/png",
          });
        }
      }
    }

    return NextResponse.json(
      { error: "No image generated. Try a more detailed prompt.", details: fallbackData },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Gemini error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 });
  }
}
