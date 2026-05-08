"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AvatarStage } from "@/components/avatar-stage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SENTIMENT_THEME, type Sentiment } from "@/lib/utils";
import type { TranslationChunk } from "@/types";

export default function TranslatorPage() {
  const [transcript, setTranscript] = useState("Hello, how are you?");
  const [chunk, setChunk] = useState<TranslationChunk>({
    transcript: "",
    gloss: [],
    sentiment: "neutral",
    unknownWords: [],
    processing: false,
  });
  const [speed, setSpeed] = useState(1);
  const [blur, setBlur] = useState(true);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  async function translate() {
    setError("");
    setChunk((prev) => ({ ...prev, processing: true }));
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      if (!res.ok) throw new Error("Translation failed");
      const data = (await res.json()) as TranslationChunk;
      setChunk(data);
    } catch {
      setError("API failure: translation service unavailable.");
    } finally {
      setChunk((prev) => ({ ...prev, processing: false }));
    }
  }

  const glow = useMemo(() => SENTIMENT_THEME[chunk.sentiment as Sentiment].glow, [chunk.sentiment]);

  return (
    <AppShell>
      <div className={`grid gap-4 lg:grid-cols-3 ${blur ? "backdrop-blur-sm" : ""}`}>
        <Card className="space-y-3">
          <h2 className="text-xl font-semibold">Live Input</h2>
          <textarea
            className="focus-ring h-40 w-full rounded-xl border bg-black/40 p-3"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            aria-label="Live transcript input"
          />
          <Button onClick={translate} className="w-full">
            {chunk.processing ? "Processing..." : "Translate to ISL Gloss"}
          </Button>
          <div className="space-y-2 text-sm">
            <label className="block">Signing speed: {speed.toFixed(1)}x</label>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 text-xs">
            <Button variant="outline" onClick={() => setBlur((v) => !v)}>
              Background blur
            </Button>
            <Button variant="outline" onClick={() => setLowBandwidth((v) => !v)}>
              Low bandwidth
            </Button>
          </div>
        </Card>

        <Card className={`space-y-3 shadow-2xl ${glow}`}>
          <h2 className="text-xl font-semibold">3D Signing Avatar</h2>
          <AvatarStage sentiment={chunk.sentiment} lowBandwidth={lowBandwidth} />
          <p className="text-sm text-white/70">Visual soundwave and rhythm pulse active during translation.</p>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-semibold">Gloss & Analytics</h2>
          <p className="rounded-xl border bg-black/40 p-3 text-sm text-white/80">
            {chunk.transcript || "Awaiting input..."}
          </p>
          <div className="flex flex-wrap gap-2">
            {chunk.gloss.map((token) => (
              <span key={token} className="rounded-md bg-cyan-500/20 px-2 py-1 text-xs">
                {token}
              </span>
            ))}
          </div>
          <p className="text-sm">Sentiment: {chunk.sentiment}</p>
          <p className="text-sm text-amber-300">
            Unknown words: {chunk.unknownWords.length ? chunk.unknownWords.join(", ") : "None"}
          </p>
          <textarea
            className="focus-ring h-20 w-full rounded-xl border bg-black/40 p-2 text-sm"
            placeholder="Flag this sign (optional feedback)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              await fetch("/api/flag-sign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transcript: chunk.transcript, feedback, gloss: chunk.gloss }),
              });
              setFeedback("");
            }}
          >
            Flag This Sign
          </Button>
          {!!error && <p className="text-sm text-rose-300">{error}</p>}
        </Card>
      </div>
    </AppShell>
  );
}
