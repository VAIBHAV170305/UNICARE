import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { verifyAuthToken } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimiter";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { allowed } = rateLimit(`food-analyze:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageBase64, mimeType } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    const clientApiKey = request.headers.get("x-gemini-api-key");
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        name: "Mixed Meal",
        calories: 450,
        protein: 22,
        carbs: 55,
        fats: 14,
        notes: "Estimated values — configure Gemini API key for accurate analysis."
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType || "image/jpeg"
        }
      },
      `You are a nutrition expert. Analyze this food image and return ONLY a JSON object (no markdown, no explanation):
{
  "name": "descriptive food name",
  "calories": <number>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fats": <number in grams>,
  "notes": "brief health notes about this food (1 sentence)"
}
Estimate for a typical serving visible in the image. Return only valid JSON.`
    ]);

    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const nutrition = JSON.parse(cleaned);

    return NextResponse.json(nutrition);
  } catch (err) {
    console.error("Food analysis error:", err);
    return NextResponse.json({ error: "Could not analyze image. Try again." }, { status: 500 });
  }
}
