import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { prompt } = body;

  if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });

  // Try gemini-2.0-flash-preview-image-generation first
  const models = [
    "gemini-2.0-flash-preview-image-generation",
    "gemini-2.0-flash-exp-image-generation",
  ];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        console.log(`Model ${model} error:`, data.error.message);
        continue;
      }

      const candidates = data.candidates || [];
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
    } catch (e: any) {
      console.log(`Model ${model} failed:`, e.message);
      continue;
    }
  }

  // Fallback: Imagen 3
  try {
    const imagenResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1, aspectRatio: "1:1", personGeneration: "allow_adult" },
        }),
      }
    );

    const imagenData = await imagenResponse.json();

    if (imagenData.predictions?.[0]?.bytesBase64Encoded) {
      return NextResponse.json({
        image: imagenData.predictions[0].bytesBase64Encoded,
        mimeType: "image/png",
      });
    }

    // Return full error for debugging
    return NextResponse.json(
      { error: "Image generation unavailable. Check API key permissions.", details: imagenData },
      { status: 400 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
