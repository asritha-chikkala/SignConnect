"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { SigningHud } from "@/components/signing-hud";
import { SENTIMENT_THEME, type Sentiment } from "@/lib/utils";
import { useSpeechInput } from "@/hooks/use-speech-input";
import type { TranslationChunk } from "@/types";
import type { AvatarHudState } from "@/lib/gloss-sign-plan";

const AvatarStage = dynamic(
  () => import("@/components/avatar-stage").then((m) => m.AvatarStage),
  { ssr: false, loading: () => <LoadingSkeleton className="h-[360px] w-full rounded-2xl" /> },
);

const SENTIMENTS: Sentiment[] = ["neutral", "question", "urgent", "happy"];

export function HomeTranslateBar() {
  const [transcript, setTranscript] = useState("Hello, how are you?");
  const [chunk, setChunk] = useState<TranslationChunk>({
    transcript: "",
    gloss: [],
    sentiment: "neutral",
    unknownWords: [],
    processing: false,
  });
  const [speed, setSpeed] = useState(1);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [sentimentOverride, setSentimentOverride] = useState<Sentiment | null>(null);
  const [error, setError] = useState("");
  const [hud, setHud] = useState<AvatarHudState>({
    phase: "idle",
    detail: "Translate to drive the avatar mixer.",
    stepIndex: 0,
    stepTotal: 0,
  });
  const [lastSpell, setLastSpell] = useState(false);
  const [signReplayKey, setSignReplayKey] = useState(0);

  const speech = useSpeechInput();

  const displaySentiment = sentimentOverride ?? chunk.sentiment;

  const onHudUpdate = useCallback((s: AvatarHudState) => {
    setHud(s);
    setLastSpell(s.phase === "spelling");
  }, []);

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
      setSignReplayKey((k) => k + 1);
    } catch {
      setError("Translation service unavailable.");
    } finally {
      setChunk((prev) => ({ ...prev, processing: false }));
    }
  }

  return (
    <section className="mt-8">
      <Card className="p-5 md:p-7">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-cyan-100" style={{ fontFamily: "var(--font-syne)" }}>
              Live translator
            </h2>
            <p className="mt-1 text-sm text-white/65">
              3D signing via Three.js AnimationMixer on your VRM (procedural clips + fingerspelling). No GIF/video
              playback.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-8 px-3 text-xs"
              disabled={!speech.supported || speech.listening}
              onClick={() =>
                speech.startListening((text) => {
                  setTranscript(text);
                })
              }
            >
              {speech.listening ? "Listening…" : "Speak"}
            </Button>
            {speech.supported && speech.listening && (
              <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => speech.stopListening()}>
                Stop mic
              </Button>
            )}
          </div>
        </div>

        {speech.lastError && <p className="mt-2 text-xs text-amber-300">{speech.lastError}</p>}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <textarea
              className="focus-ring h-32 w-full rounded-xl border border-cyan-300/20 bg-black/40 p-3 text-sm"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              aria-label="English input"
            />
            <div className="flex flex-wrap gap-2">
              <Button className="flex-1" onClick={() => void translate()} disabled={chunk.processing}>
                {chunk.processing ? "Translating…" : "Translate"}
              </Button>
              <Button variant="outline" onClick={() => setLowBandwidth((v) => !v)}>
                Low bandwidth: {lowBandwidth ? "on" : "off"}
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <label className="block text-white/70">Signing speed: {speed.toFixed(1)}×</label>
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
            <div>
              <p className="text-xs uppercase tracking-wider text-white/45">Sentiment</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  variant={sentimentOverride === null ? "default" : "outline"}
                  className="h-8 px-3 text-xs"
                  onClick={() => setSentimentOverride(null)}
                >
                  Auto
                </Button>
                {SENTIMENTS.map((s) => (
                  <Button
                    key={s}
                    variant={sentimentOverride === s ? "default" : "outline"}
                    className="h-8 px-3 text-xs"
                    onClick={() => setSentimentOverride(s)}
                  >
                    {SENTIMENT_THEME[s].label}
                  </Button>
                ))}
              </div>
            </div>
            {!!error && <p className="text-sm text-rose-300">{error}</p>}
          </div>

          <div className={`space-y-3 rounded-2xl border border-cyan-300/20 p-3 ${SENTIMENT_THEME[displaySentiment].glow}`}>
            <AvatarStage
              sentiment={displaySentiment}
              lowBandwidth={lowBandwidth}
              gloss={chunk.gloss}
              signReplayKey={signReplayKey}
              signingSpeed={speed}
              onHudUpdate={onHudUpdate}
            />
            <SigningHud hud={hud} gloss={chunk.gloss} unknownWords={chunk.unknownWords} lastWasSpell={lastSpell} />
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="mono text-[10px] uppercase tracking-[0.2em] text-white/45">Gloss</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {chunk.gloss.length ? (
                  chunk.gloss.map((t) => (
                    <span key={t} className="rounded-md bg-cyan-500/15 px-2 py-1 text-xs text-cyan-100">
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-white/50">Translate to populate tokens.</span>
                )}
              </div>
              <p className="mt-2 text-xs text-white/55">
                Sentiment: {displaySentiment}
                {chunk.sentimentFromGrok ? " (Grok)" : ""}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
