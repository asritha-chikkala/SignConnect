"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { PipelineFlow } from "@/components/pipeline-flow";
import { SENTIMENT_THEME, type Sentiment } from "@/lib/utils";
import type { TranslationChunk } from "@/types";

const AvatarStage = dynamic(
  () => import("@/components/avatar-stage").then((mod) => mod.AvatarStage),
  { ssr: false, loading: () => <LoadingSkeleton className="h-[360px] w-full" /> },
);

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
  const confidence = chunk.gloss.length ? Math.max(74, 96 - chunk.unknownWords.length * 8) : 0;

  return (
    <AppShell>
      <div className="mb-4">
        <Card className="p-5">
          <h1 className="text-2xl text-cyan-100" style={{ fontFamily: "var(--font-syne)" }}>
            Neural Translator
          </h1>
          <p className="mt-2 text-sm text-white/70">Speech &rarr; gloss &rarr; semantic map &rarr; avatar signing in one responsive panel.</p>
        </Card>
      </div>
      <div className={`grid gap-4 lg:grid-cols-[1fr_1.3fr_1fr] ${blur ? "backdrop-blur-sm" : ""}`}>
        <Card className="space-y-3 p-5">
          <h2 className="text-xl font-semibold text-cyan-100">Speech Input</h2>
          <textarea
            className="focus-ring h-40 w-full rounded-xl border border-cyan-300/20 bg-black/40 p-3"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            aria-label="Live transcript input"
          />
          <Button onClick={translate} className="w-full" size="lg" aria-live="polite">
            {chunk.processing ? "Processing..." : "Translate to ISL"}
          </Button>
          {chunk.processing && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="h-1 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
            />
          )}
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
          <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-3 text-xs text-cyan-100">
            <p className="mono uppercase tracking-wider text-cyan-300/85">Fallback visualization</p>
            <p className="mt-1">✓ Direct Match</p>
            <p>◎ Semantic Match</p>
            <p>&rarr; Fingerspell</p>
          </div>
        </Card>

        <Card className={`space-y-3 p-5 shadow-2xl ${glow}`}>
          <h2 className="text-xl font-semibold text-cyan-100">VRM Avatar</h2>
          <AvatarStage sentiment={chunk.sentiment} lowBandwidth={lowBandwidth} />
          <p className="text-sm text-white/70">Idle breathing, orbital glow, and sentiment-aware motion are active.</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              ["Mode", SENTIMENT_THEME[chunk.sentiment as Sentiment].label],
              ["AI active", chunk.processing ? "YES" : "READY"],
              ["Speed", `${speed.toFixed(1)}x`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs">
                <p className="mono text-white/50">{k}</p>
                <p className="mt-1 text-cyan-100">{v}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="text-xl font-semibold text-cyan-100">Gloss + AI Analysis</h2>
          <p className="rounded-xl border border-cyan-300/20 bg-black/40 p-3 text-sm text-white/80">
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
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span>Confidence</span>
              <span>{confidence}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300"
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
          </div>
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

      <div className="mt-4">
        <Card className="p-5">
          <h3 className="text-base text-cyan-100">ISL Translation Flow</h3>
          <div className="mt-3">
            <PipelineFlow compact />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
