"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { PipelineFlow } from "@/components/pipeline-flow";
import { SigningHud } from "@/components/signing-hud";
import { CollabPlaceholder } from "@/components/collab-placeholder";
import { SENTIMENT_THEME, type Sentiment } from "@/lib/utils";
import { useSpeechInput } from "@/hooks/use-speech-input";
import { useTranslatorHotkeys } from "@/hooks/use-translator-hotkeys";
import { useRecordCanvas } from "@/hooks/use-record-canvas";
import type { TranslationChunk } from "@/types";
import type { AvatarHudState } from "@/lib/gloss-sign-plan";

const AvatarStage = dynamic(
  () => import("@/components/avatar-stage").then((mod) => mod.AvatarStage),
  { ssr: false, loading: () => <LoadingSkeleton className="h-[360px] w-full" /> },
);

const SENTIMENTS: Sentiment[] = ["neutral", "question", "urgent", "happy"];

export default function TranslatorPage() {
  const [transcript, setTranscript] = useState("Hello, how are you?");
  const [chunk, setChunk] = useState<TranslationChunk>({
    transcript: "",
    gloss: [],
    sentiment: "neutral",
    unknownWords: [],
    processing: false,
    sentimentFromGrok: false,
  });
  const [speed, setSpeed] = useState(1);
  const [blur, setBlur] = useState(true);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [sentimentOverride, setSentimentOverride] = useState<Sentiment | null>(null);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [learningSlowMo, setLearningSlowMo] = useState(1);
  const [learningMirror, setLearningMirror] = useState(false);
  const [appearanceHue, setAppearanceHue] = useState(0);
  const [highContrast, setHighContrast] = useState(false);
  const [hud, setHud] = useState<AvatarHudState>({
    phase: "idle",
    detail: "Translate to begin 3D signing.",
    stepIndex: 0,
    stepTotal: 0,
  });
  const [lastSpell, setLastSpell] = useState(false);
  const [signReplayKey, setSignReplayKey] = useState(0);
  const [sessionLog, setSessionLog] = useState<{ t: string; gloss: string[] }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorder = useRecordCanvas();

  const speech = useSpeechInput();

  const displaySentiment = sentimentOverride ?? chunk.sentiment;
  const glow = useMemo(() => SENTIMENT_THEME[displaySentiment].glow, [displaySentiment]);
  const confidence = chunk.gloss.length ? Math.max(74, 96 - chunk.unknownWords.length * 8) : 0;

  const onHudUpdate = useCallback((s: AvatarHudState) => {
    setHud(s);
    setLastSpell(s.phase === "spelling");
  }, []);

  const translate = useCallback(async () => {
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
      const stamp = new Date().toISOString();
      setSessionLog((prev) => [...prev.slice(-19), { t: stamp, gloss: data.gloss }]);
    } catch {
      setError("API failure: translation service unavailable.");
    } finally {
      setChunk((prev) => ({ ...prev, processing: false }));
    }
  }, [transcript]);

  useTranslatorHotkeys(
    {
      onSubmit: () => void translate(),
      onClear: () => setTranscript(""),
      onTogglePlay: undefined,
    },
    true,
  );

  return (
    <AppShell>
      <div className="mb-4">
        <Card className="p-5">
          <h1 className="text-2xl text-cyan-100" style={{ fontFamily: "var(--font-syne)" }}>
            Neural Translator
          </h1>
          <p className="mt-2 text-sm text-white/70">
            English speech or text → ISL gloss → procedural VRM bone animations (Mixer) + fingerspelling for unknown
            tokens. No video clips.
          </p>
          <p className="mt-2 text-[11px] text-white/45">
            Shortcuts: Ctrl+Enter translate · Escape clear input · High contrast and ARIA regions below.
          </p>
        </Card>
      </div>

      <div className={`grid gap-4 lg:grid-cols-[1fr_1.35fr_1fr] ${blur ? "backdrop-blur-sm" : ""}`}>
        <Card className="space-y-3 p-5" role="region" aria-label="Translation input">
          <h2 className="text-xl font-semibold text-cyan-100">Speech Input</h2>
          <textarea
            className="focus-ring h-40 w-full rounded-xl border border-cyan-300/20 bg-black/40 p-3"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            aria-label="Live transcript input"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void translate()} className="flex-1" size="lg" aria-live="polite">
              {chunk.processing ? "Processing..." : "Translate to ISL"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              disabled={!speech.supported || speech.listening}
              onClick={() =>
                speech.startListening((text) => {
                  setTranscript(text);
                })
              }
            >
              {speech.listening ? "Listening…" : "Mic"}
            </Button>
            {speech.supported && speech.listening && (
              <Button variant="outline" size="lg" onClick={() => speech.stopListening()}>
                Stop
              </Button>
            )}
          </div>
          {speech.lastError && <p className="text-xs text-amber-300">{speech.lastError}</p>}
          {chunk.processing && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="h-1 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
            />
          )}
          <div className="space-y-2 text-sm">
            <label className="block">Signing speed: {speed.toFixed(1)}×</label>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full"
              aria-valuemin={0.5}
              aria-valuemax={2}
              aria-valuenow={speed}
              aria-label="Signing speed multiplier"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/45">Sentiment override</p>
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
          <div className="flex flex-wrap gap-2 text-xs">
            <Button variant="outline" onClick={() => setBlur((v) => !v)}>
              Background blur
            </Button>
            <Button variant="outline" onClick={() => setLowBandwidth((v) => !v)}>
              Low bandwidth
            </Button>
            <Button variant="outline" onClick={() => setHighContrast((v) => !v)}>
              High contrast: {highContrast ? "on" : "off"}
            </Button>
          </div>
          <Button
            type="button"
            className="w-full bg-gradient-to-r from-rose-600 to-red-600 py-6 text-lg font-semibold text-white shadow-lg shadow-rose-900/40 hover:brightness-110"
            aria-pressed={emergencyMode}
            onClick={() => setEmergencyMode((v) => !v)}
          >
            {emergencyMode ? "Exit emergency signing" : "Emergency mode — faster, emphatic"}
          </Button>
          <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-3 text-xs text-cyan-100">
            <p className="mono uppercase tracking-wider text-cyan-300/85">Learning mode</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant={learningSlowMo === 1 ? "default" : "outline"} className="h-8 px-3 text-xs" onClick={() => setLearningSlowMo(1)}>
                1× study
              </Button>
              <Button variant={learningSlowMo === 0.5 ? "default" : "outline"} className="h-8 px-3 text-xs" onClick={() => setLearningSlowMo(0.5)}>
                0.5× slow
              </Button>
              <Button variant={learningSlowMo === 0.25 ? "default" : "outline"} className="h-8 px-3 text-xs" onClick={() => setLearningSlowMo(0.25)}>
                0.25× slow
              </Button>
              <Button variant={learningMirror ? "default" : "outline"} className="h-8 px-3 text-xs" onClick={() => setLearningMirror((v) => !v)}>
                Mirror avatar
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-white/50">
              Mirror flips the rig on X for practice. Replace procedural clips with per-letter mocap to teach true
              handshapes.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 p-3 text-xs">
            <label className="block text-white/60">Avatar hue ({Math.round(appearanceHue * 100)}%)</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={appearanceHue}
              onChange={(e) => setAppearanceHue(Number(e.target.value))}
              className="mt-1 w-full"
              aria-label="Avatar color hue shift"
            />
          </div>
          <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-3 text-xs text-cyan-100">
            <p className="mono uppercase tracking-wider text-cyan-300/85">Fallback visualization</p>
            <p className="mt-1">✓ Direct Match</p>
            <p>◎ Semantic Match</p>
            <p>→ Fingerspell (3D wrist poses)</p>
          </div>
        </Card>

        <Card className={`space-y-3 p-5 shadow-2xl ${glow} ${emergencyMode ? "animate-pulse ring-2 ring-rose-500/70" : ""}`} role="region" aria-label="3D avatar signing">
          <h2 className="text-xl font-semibold text-cyan-100">3D Avatar (VRM + Mixer)</h2>
          <AvatarStage
            sentiment={displaySentiment}
            lowBandwidth={lowBandwidth}
            gloss={chunk.gloss}
            signReplayKey={signReplayKey}
            signingSpeed={speed}
            emergencyMode={emergencyMode}
            learningSlowMo={learningSlowMo}
            learningMirror={learningMirror}
            appearanceHue={appearanceHue}
            highContrast={highContrast}
            onHudUpdate={onHudUpdate}
            onCanvasReady={(c) => {
              canvasRef.current = c;
            }}
          />
          <SigningHud hud={hud} gloss={chunk.gloss} unknownWords={chunk.unknownWords} lastWasSpell={lastSpell} />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => (recorder.recording ? recorder.stop() : recorder.start(canvasRef.current))}>
              {recorder.recording ? "Stop recording" : "Record signing (WebM)"}
            </Button>
            {recorder.lastBlobUrl && (
              <a className="h-8 rounded-lg border border-cyan-300/40 px-3 py-1.5 text-xs text-cyan-100" href={recorder.lastBlobUrl} download="signbridge-session.webm">
                Download last clip
              </a>
            )}
          </div>
          <p className="text-sm text-white/70">
            Animations are procedural keyframes on VRM humanoid bones (wave, point, raise hand, etc.). Add Mixamo GLB
            via <code className="text-cyan-200">NEXT_PUBLIC_GLTF_FALLBACK_URL</code> to play embedded FBX→GLB tracks
            named after gloss tokens.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              ["Mode", SENTIMENT_THEME[displaySentiment].label],
              ["Mixer", hud.phase.toUpperCase()],
              ["Speed", `${speed.toFixed(1)}×`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs">
                <p className="mono text-white/50">{k}</p>
                <p className="mt-1 text-cyan-100">{v}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3 p-5" role="region" aria-label="Gloss and analysis">
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
          <p className="text-sm">
            Sentiment: {chunk.sentiment}
            {chunk.sentimentFromGrok ? " (from Grok JSON)" : " (heuristic / fallback)"}
          </p>
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
          <div className="max-h-28 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-2 text-[11px] text-white/55">
            <p className="mono uppercase tracking-wider text-white/40">Session log</p>
            {sessionLog.length === 0 ? (
              <p className="mt-1">No translations yet.</p>
            ) : (
              sessionLog.map((row) => (
                <p key={row.t} className="mt-1 font-mono text-[10px] text-cyan-200/80">
                  {row.t}: {row.gloss.join(" · ")}
                </p>
              ))
            )}
          </div>
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

      <CollabPlaceholder />
    </AppShell>
  );
}
