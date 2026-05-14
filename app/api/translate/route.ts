import { NextResponse } from "next/server";
import { generateGlossWithGrok } from "@/services/grok";
import { resolvePhrase } from "@/lib/fallback";
import type { Sentiment } from "@/lib/utils";

function detectSentiment(transcript: string): Sentiment {
  const text = transcript.toLowerCase();
  if (text.includes("?")) return "question";
  if (text.includes("help") || text.includes("danger")) return "urgent";
  if (text.includes("thank") || text.includes("happy")) return "happy";
  return "neutral";
}

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();
    const fallback = await resolvePhrase(transcript ?? "");
    const grok = await generateGlossWithGrok(transcript ?? "");
    const gloss = grok.gloss.length ? grok.gloss : fallback.map((f) => f.sign);
    const unknownWords = fallback
      .filter((entry) => entry.step === "fingerspelling")
      .map((entry) => entry.word);

    const heuristic = detectSentiment(transcript ?? "");
    const sentiment = grok.sentiment ?? heuristic;
    const sentimentFromGrok = Boolean(grok.sentiment);

    return NextResponse.json({
      transcript,
      gloss,
      unknownWords,
      sentiment,
      sentimentFromGrok,
      processing: false,
    });
  } catch {
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
