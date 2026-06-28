import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access: Valid authentication token required" }, { status: 401 });
    }

    const { text, lang = "en-IN", speaker = "aditi" } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text parameter is required" }, { status: 400 });
    }

    const sarvamApiKey = process.env.SARVAM_API_KEY;

    if (!sarvamApiKey) {
      console.warn("SARVAM_API_KEY environment variable is not configured. Falling back to local SpeechSynthesis.");
      return NextResponse.json({ error: "SARVAM_API_KEY is not configured" }, { status: 500 });
    }

    const targetLang = lang === "hi" || lang.startsWith("hi") ? "hi-IN" : "en-IN";
    const selectedSpeaker = !speaker || speaker === "aditi" || speaker === "aravind"
      ? (targetLang === "hi-IN" ? "neha" : "aditya")
      : speaker;

    console.log(`Connecting to Sarvam AI TTS for text: "${text.substring(0, 40)}..." Language: ${targetLang}, Speaker: ${selectedSpeaker}`);

    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "api-subscription-key": sarvamApiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        target_language_code: targetLang,
        model: "bulbul:v3",
        speaker: selectedSpeaker
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Sarvam AI TTS API error:", errText);
      return NextResponse.json(
        { error: `Sarvam AI API responded with code: ${response.status}`, details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    if (!data.audios || data.audios.length === 0) {
      return NextResponse.json({ error: "No audio generated from Sarvam AI" }, { status: 500 });
    }

    return NextResponse.json({ audio: data.audios[0] });
  } catch (error: unknown) {
    console.error("Error in /api/tts:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Internal Server Error", details: errorMessage }, { status: 500 });
  }
}
