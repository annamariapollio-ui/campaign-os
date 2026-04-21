import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Extend to 60s for Vercel Pro, 10s for Hobby

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

  // Try Imagen 3
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
    return { image: imagenData.predictions[0].bytesBase64Encoded, mimeType: "image/png" };
  }
  throw new Error("Gemini image generation requires billing. Please enable at console.cloud.google.com or use Replicate.");
}

async function generateWithReplicate(prompt: string, apiKey: string) {
  // Use fast SDXL-turbo model — generates in ~5 seconds
  const response = await fetch("https://api.replicate.com/v1/models/bytedance/sdxl-lightning-4step/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Prefer": "wait=55",
    },
    body: JSON.stringify({
      input: {
        prompt: prompt,
        width: 1024,
        height: 1024,
        num_outputs: 1,
        num_inference_steps: 4,
        guidance_scale: 0,
        scheduler: "K_EULER",
      },
    }),
  });

  const prediction = await response.json();

  if (prediction.error) throw new Error(prediction.error);

  // If completed immediately
  if (prediction.output?.[0]) {
    const imageUrl = prediction.output[0];
    const imgResponse = await fetch(imageUrl);
    const buffer = await imgResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return { image: base64, mimeType: "image/png" };
  }

  // Poll up to 50 seconds
  const predictionId = prediction.id;
  if (!predictionId) throw new Error("No prediction ID returned from Replicate.");

  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 2500));
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });
    const pollData = await pollResponse.json();

    if (pollData.status === "succeeded" && pollData.output?.[0]) {
      const imageUrl = pollData.output[0];
      const imgResponse = await fetch(imageUrl);
      const buffer = await imgResponse.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      return { image: base64, mimeType: "image/png" };
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
