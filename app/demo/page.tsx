"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PipelineFlow } from "@/components/pipeline-flow";
import { AvatarStage } from "@/components/avatar-stage";
import { avatarStyles } from "@/components/avatar-selector";
import type { Sentiment } from "@/lib/utils";
import { LowLightDetector } from "@/components/LowLightDetector";


const SCRIPT = ["HELLO HOW ARE YOU", "I NEED HELP", "CALL HOSPITAL", "THANK YOU", "ME GO SCHOOL"];

export default function DemoPage() {
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [slowMode, setSlowMode] = useState(false);
  const [sentiment, setSentiment] = useState<Sentiment>("neutral");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  
  const gloss = useMemo(() => SCRIPT[index].split(/\s+/).filter(Boolean), [index]);

  // Load saved avatar on mount
  useEffect(() => {
    const savedAvatarUrl = localStorage.getItem("selectedAvatarUrl");
    if (savedAvatarUrl) {
      setAvatarUrl(savedAvatarUrl);
    } else {
      // Use default avatar
      const defaultAvatar = avatarStyles.find(a => a.id === "default");
      if (defaultAvatar) {
        setAvatarUrl(defaultAvatar.vrmUrl);
      }
    }
  }, []);

  useEffect(() => {
    const phrase = SCRIPT[index];
    if (phrase.includes("HELP") || phrase.includes("HOSPITAL")) {
      setSentiment("urgent");
      return;
    }
    if (phrase.includes("THANK")) {
      setSentiment("happy");
      return;
    }
    setSentiment("neutral");
  }, [index]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setIndex((prev) => (prev + 1) % SCRIPT.length), slowMode ? 4200 : 2500);
    return () => clearInterval(id);
  }, [running, slowMode]);

  return (
    <AppShell>
      <Card className="neon-border p-5 md:p-8">
        <h1 className="text-3xl text-cyan-100" style={{ fontFamily: "var(--font-syne)" }}>
          Demo Showcase
        </h1>
        <p className="mt-2 text-white/70">Scripted translation flow for presentation mode and step-by-step AI explanation.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => setRunning(true)}>Start Demo</Button>
          <Button variant="outline" onClick={() => setIndex(0)}>
            Replay
          </Button>
          <Button variant="outline" onClick={() => setSlowMode((v) => !v)}>
            {slowMode ? "Disable Slow-motion" : "Slow-motion Mode"}
          </Button>
        </div>
        {/* 🔴 Add LowLightDetector here */}
      <LowLightDetector 
        onLowLightDetected={(isLow, brightness) => {
          console.log(`Home: Low light: ${isLow}, Brightness: ${brightness}%`);
        }}
        autoBoost={true}
        threshold={30}
      />
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-cyan-300/20 bg-black/40 p-6">
            <p className="text-sm text-white/60">Current phrase</p>
            <motion.p
              key={SCRIPT[index]}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-2xl text-cyan-300"
            >
              {SCRIPT[index]}
            </motion.p>
            <p className="mt-3 text-xs text-white/60">
              Live AI simulation: transcript → gloss conversion → semantic mapping → sign output
            </p>
          </div>
          <div>
            <AvatarStage
              key={avatarUrl}
              sentiment={sentiment}
              lowBandwidth={false}
              gloss={gloss}
              signReplayKey={index}
              signingSpeed={slowMode ? 0.5 : 1}
              learningSlowMo={slowMode ? 0.5 : 1}
              avatarUrl={avatarUrl}
            />
          </div>
        </div>
        <div className="mt-5">
          <PipelineFlow />
        </div>
      </Card>
    </AppShell>
  );
}