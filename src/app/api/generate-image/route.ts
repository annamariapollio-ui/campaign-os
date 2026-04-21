import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

async function generateWithGemini(prompt: string, apiKey: string) {
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
      if (data.error) continue;
      for (const candidate of data.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData?.data) {
            return { image: part.inlineData.data, mimeType: part.inlineData.mimeType || "image/png" };
          }
        }
      }
    } catch (e) { continue; }
  }
  throw new Error("Gemini image generation requires billing. Please enable at console.cloud.google.com or use Replicate.");
}

async function generateWithReplicate(prompt: string, apiKey: string) {
  // Use the standard predictions endpoint with black-forest-labs/flux-schnell — very fast (~3s)
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Prefer": "wait=55",
    },
    body: JSON.stringify({
      version: "black-forest-labs/flux-schnell",
      input: {
        prompt,
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "png",
        output_quality: 90,
        go_fast: true,
      },
    }),
  });

  const prediction = await response.json();
  if (prediction.error) throw new Error(prediction.error);

  // Completed immediately
  if (prediction.output?.[0]) {
    const imgResponse = await fetch(prediction.output[0]);
    const buffer = await imgResponse.arrayBuffer();
    return { image: Buffer.from(buffer).toString("base64"), mimeType: "image/png" };
  }

  // Poll
  const predictionId = prediction.id;
  if (!predictionId) throw new Error("No prediction ID from Replicate. Check API key.");

  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const poll = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });
    const pollData = await poll.json();

    if (pollData.status === "succeeded" && pollData.output?.[0]) {
      const imgResponse = await fetch(pollData.output[0]);
      const buffer = await imgResponse.arrayBuffer();
      return { image: Buffer.from(buffer).toString("base64"), mimeType: "image/png" };
    }
    if (pollData.status === "failed") throw new Error(pollData.error || "Replicate generation failed.");
  }

  throw new Error("Generation timed out. Please try again.");
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { prompt, provider = "replicate" } = body;
  if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

  try {
    if (provider === "replicate") {
      const apiKey = process.env.REPLICATE_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "Replicate API key not configured" }, { status: 500 });
      const result = await generateWithReplicate(prompt, apiKey);
      return NextResponse.json(result);
    } else {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
      const result = await generateWithGemini(prompt, apiKey);
      return NextResponse.json(result);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
