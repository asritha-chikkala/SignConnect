"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { PipelineFlow } from "@/components/pipeline-flow";
import { SigningHud } from "@/components/signing-hud";
import { CollabPlaceholder } from "@/components/collab-placeholder";
import { AvatarSelector, avatarStyles, type AvatarStyle } from "@/components/avatar-selector";
import { SENTIMENT_THEME, type Sentiment } from "@/lib/utils";
import { useSpeechInput } from "@/hooks/use-speech-input";
import { useTranslatorHotkeys } from "@/hooks/use-translator-hotkeys";
import { useRecordCanvas } from "@/hooks/use-record-canvas";
import type { TranslationChunk } from "@/types";
import type { AvatarHudState } from "@/lib/gloss-sign-plan";
import { GestureShortcut } from "@/components/GestureShortcut";
import { VideoCaptioner } from "@/components/VideoCaptioner";
import { LowLightDetector } from "@/components/LowLightDetector";

const AvatarStage = dynamic(
  () => import("@/components/avatar-stage").then((mod) => mod.AvatarStage),
  { ssr: false, loading: () => <LoadingSkeleton className="h-[360px] w-full" /> },
);

const SENTIMENTS: Sentiment[] = ["neutral", "question", "urgent", "happy"];

// Fallback gloss for common phrases
const FALLBACK_GLOSS: Record<string, string[]> = {
  "hello": ["HELLO"],
  "hi": ["HELLO"],
  "how are you": ["HOW", "YOU"],
  "i need help": ["I", "NEED", "HELP"],
  "help": ["HELP"],
  "thank you": ["THANK", "YOU"],
  "thanks": ["THANK"],
  "yes": ["YES"],
  "no": ["NO"],
  "goodbye": ["GOODBYE"],
  "where is hospital": ["WHERE", "HOSPITAL"],
  "hospital": ["HOSPITAL"],
  "doctor": ["DOCTOR"],
  "pain": ["PAIN"],
  "emergency": ["EMERGENCY"],
  "please": ["PLEASE"],
  "sorry": ["SORRY"],
};

export default function TranslatorPage() {
  const [transcript, setTranscript] = useState("");
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
  
  // Avatar selection states
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarStyle | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorder = useRecordCanvas();

  const speech = useSpeechInput();

  const displaySentiment = sentimentOverride ?? chunk.sentiment;
  const glow = useMemo(() => SENTIMENT_THEME[displaySentiment].glow, [displaySentiment]);
  const confidence = chunk.gloss.length ? Math.max(74, 96 - chunk.unknownWords.length * 8) : 0;

  // Load saved avatar on mount - DEFAULT AVATAR FIRST
  useEffect(() => {
    const savedAvatarId = localStorage.getItem("selectedAvatar");
    const savedAvatarUrl = localStorage.getItem("selectedAvatarUrl");
    
    const defaultAvatar = avatarStyles.find(a => a.id === "default");
    
    if (savedAvatarId && savedAvatarUrl) {
      const avatar = avatarStyles.find(a => a.id === savedAvatarId && !a.isComingSoon);
      if (avatar) {
        setSelectedAvatar(avatar);
        setAvatarUrl(savedAvatarUrl);
        return;
      }
    }
    
    if (defaultAvatar) {
      setSelectedAvatar(defaultAvatar);
      setAvatarUrl(defaultAvatar.vrmUrl);
      localStorage.setItem("selectedAvatar", defaultAvatar.id);
      localStorage.setItem("selectedAvatarUrl", defaultAvatar.vrmUrl);
    }
  }, []);

  // Force avatar to reload when avatarUrl changes
  useEffect(() => {
    if (avatarUrl) {
      const timer = setTimeout(() => {
        setSignReplayKey(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [avatarUrl]);

  const onHudUpdate = useCallback((s: AvatarHudState) => {
    setHud(s);
    setLastSpell(s.phase === "spelling");
  }, []);

  const handleAvatarSelect = (avatar: AvatarStyle) => {
    setSelectedAvatar(avatar);
    setAvatarUrl(avatar.vrmUrl);
    localStorage.setItem("selectedAvatar", avatar.id);
    localStorage.setItem("selectedAvatarUrl", avatar.vrmUrl);
  };

  function detectSentiment(text: string): Sentiment {
    const lower = text.toLowerCase();
    if (lower.includes("?")) return "question";
    if (lower.includes("help") || lower.includes("emergency") || lower.includes("pain")) return "urgent";
    if (lower.includes("thank") || lower.includes("love") || lower.includes("happy")) return "happy";
    return "neutral";
  }

  function getGlossFromText(text: string): string[] {
    const lowerText = text.toLowerCase().trim();
    
    for (const [key, gloss] of Object.entries(FALLBACK_GLOSS)) {
      if (lowerText.includes(key)) {
        return gloss;
      }
    }
    
    const words = lowerText.split(/\s+/).filter(w => w.length > 0);
    const glossTokens: string[] = [];
    
    for (const word of words) {
      if (FALLBACK_GLOSS[word]) {
        glossTokens.push(...FALLBACK_GLOSS[word]);
      } else {
        glossTokens.push(word.toUpperCase());
      }
    }
    
    return glossTokens.slice(0, 15);
  }

  const translate = useCallback(async () => {
    if (!transcript.trim()) return;
    
    setError("");
    setChunk((prev) => ({ ...prev, processing: true }));
    
    try {
      const fallbackGloss = getGlossFromText(transcript);
      const sentiment = detectSentiment(transcript);
      
      let apiGloss: string[] = [];
      let apiSuccess = false;
      
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.gloss && data.gloss.length > 0) {
            apiGloss = data.gloss;
            apiSuccess = true;
          }
        }
      } catch (apiError) {
        console.log("API unavailable, using fallback");
      }
      
      const finalGloss = apiSuccess && apiGloss.length > 0 ? apiGloss : fallbackGloss;
      
      setChunk({
        transcript: transcript,
        gloss: finalGloss,
        sentiment: sentiment,
        unknownWords: [],
        processing: false,
        sentimentFromGrok: apiSuccess,
      });
      
      setSignReplayKey((k) => k + 1);
      const stamp = new Date().toISOString();
      setSessionLog((prev) => [...prev.slice(-19), { t: stamp, gloss: finalGloss }]);
      
    } catch (err) {
      setError("Translation failed. Please try again.");
      setChunk((prev) => ({ ...prev, processing: false }));
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

  const currentAvatarDisplay = selectedAvatar || avatarStyles.find(a => a.id === "default") || avatarStyles[0];

  return (
    <AppShell>
      {/* 🔴 ADD THIS 🔴 - Place it RIGHT AFTER AppShell opens */}
      <GestureShortcut 
        currentGloss={chunk.gloss}
        onShortcutTriggered={(shortcut) => {
          console.log("🎯 Shortcut triggered:", shortcut);
          // You can add additional logic here like logging to analytics
        }}
      />
      <LowLightDetector 
    onLowLightDetected={(isLow, brightness) => {
      console.log(`Low light: ${isLow}, Brightness: ${brightness}%`);
    }}
    autoBoost={true}
    threshold={30}
  />

      
      {/* Avatar Selector Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-black/30 rounded-xl p-4 border border-cyan-300/20">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentAvatarDisplay.previewColor} flex items-center justify-center text-2xl shadow-lg`}>
            {currentAvatarDisplay.previewEmoji}
          </div>
          <div>
            <p className="text-xs text-white/50">Current Avatar</p>
            <p className="text-sm font-medium text-white">{currentAvatarDisplay.name}</p>
            <p className="text-xs text-white/30">{currentAvatarDisplay.category}</p>
          </div>
        </div>
        <AvatarSelector 
          onSelectAvatar={handleAvatarSelect}
          currentAvatarId={selectedAvatar?.id}
        />
      </div>

      <div className="mb-4">
        <Card className="p-5">
          <h1 className="text-2xl text-cyan-100" style={{ fontFamily: "var(--font-syne)" }}>
            Neural Translator
          </h1>
          <p className="mt-2 text-sm text-white/70">
            English speech or text → ISL gloss → Avatar signs in real-time
          </p>
          <p className="mt-2 text-[11px] text-white/45">
            Type a phrase and click Translate. The avatar will sign your words.
          </p>
        </Card>
      </div>

      <div className={`grid gap-4 lg:grid-cols-[1fr_1.35fr_1fr] ${blur ? "backdrop-blur-sm" : ""}`}>
        {/* Left Panel - Speech Input */}
        <Card className="space-y-3 p-5" role="region" aria-label="Translation input">
          <h2 className="text-xl font-semibold text-cyan-100">Speech Input</h2>
          <textarea
            className="focus-ring h-40 w-full rounded-xl border border-cyan-300/20 bg-black/40 p-3 text-white placeholder:text-white/40"
            placeholder='Type a phrase... (e.g., "Hello", "I need help", "Thank you")'
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void translate()} className="flex-1" size="lg">
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
              {speech.listening ? "Listening…" : "🎤"}
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
            className="w-full bg-gradient-to-r from-rose-600 to-red-600 py-6 text-lg font-semibold text-white"
            onClick={() => setEmergencyMode((v) => !v)}
          >
            {emergencyMode ? "Exit emergency signing" : "🚨 Emergency mode"}
          </Button>
          <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-3 text-xs text-cyan-100">
            <p className="mono uppercase tracking-wider text-cyan-300/85">Try these phrases:</p>
            <p className="mt-1 text-white/60">Hello • I need help • Thank you • Where is hospital • Yes/No</p>
          </div>
        </Card>

        {/* Center Panel - Avatar */}
        <Card className={`space-y-3 p-5 shadow-2xl ${glow} ${emergencyMode ? "animate-pulse ring-2 ring-rose-500/70" : ""}`}>
          <h2 className="text-xl font-semibold text-cyan-100">3D Avatar Signing</h2>
          <AvatarStage
            key={avatarUrl}  // ← IMPORTANT: Forces reload when avatar changes
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
            avatarUrl={avatarUrl}
            onHudUpdate={onHudUpdate}
            onCanvasReady={(c) => {
              canvasRef.current = c;
            }}
          />
          <SigningHud hud={hud} gloss={chunk.gloss} unknownWords={chunk.unknownWords} lastWasSpell={lastSpell} />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => (recorder.recording ? recorder.stop() : recorder.start(canvasRef.current))}>
              {recorder.recording ? "Stop recording" : "Record signing"}
            </Button>
            {recorder.lastBlobUrl && (
              <a className="h-8 rounded-lg border border-cyan-300/40 px-3 py-1.5 text-xs text-cyan-100" href={recorder.lastBlobUrl} download="signconnect-session.webm">
                Download
              </a>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              ["Mode", SENTIMENT_THEME[displaySentiment].label],
              ["Status", hud.phase.toUpperCase()],
              ["Speed", `${speed.toFixed(1)}×`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs">
                <p className="mono text-white/50">{k}</p>
                <p className="mt-1 text-cyan-100">{v}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Panel - Gloss + Analysis */}
        <Card className="space-y-3 p-5" role="region" aria-label="Gloss and analysis">
          <h2 className="text-xl font-semibold text-cyan-100">Gloss Output</h2>
          <p className="rounded-xl border border-cyan-300/20 bg-black/40 p-3 text-sm text-white/80">
            {chunk.transcript || "Awaiting input..."}
          </p>
          <div className="flex flex-wrap gap-2">
            {chunk.gloss.map((token, idx) => (
              <span key={`${token}-${idx}`} className="rounded-md bg-cyan-500/20 px-2 py-1 text-xs font-mono">
                {token}
              </span>
            ))}
            {chunk.gloss.length === 0 && !chunk.processing && (
              <span className="text-xs text-white/40">Click Translate to see ISL gloss</span>
            )}
          </div>
          <p className="text-sm text-white/70">Sentiment: {chunk.sentiment}</p>
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
              />
            </div>
          </div>
          
          <textarea
            className="focus-ring h-20 w-full rounded-xl border border-cyan-300/20 bg-black/40 p-2 text-sm text-white placeholder:text-white/40"
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