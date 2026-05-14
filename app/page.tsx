"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { HomeTranslateBar } from "@/components/home-translate-bar";

const AvatarStage = dynamic(
  () => import("@/components/avatar-stage").then((mod) => mod.AvatarStage),
  {
    ssr: false,
    loading: () => <LoadingSkeleton className="h-[360px] w-full rounded-2xl" />,
  }
);

const PipelineFlow = dynamic(
  () => import("@/components/pipeline-flow").then((mod) => mod.PipelineFlow),
  {
    ssr: false,
    loading: () => <LoadingSkeleton className="h-24 w-full rounded-xl" />,
  }
);

export default function Home() {
  const [showHeavyComponents, setShowHeavyComponents] = useState(false);

  useEffect(() => {
    // Wait for page to be interactive before loading heavy components
    const timer = setTimeout(() => {
      setShowHeavyComponents(true);
    }, 500); // 500ms delay to prevent unresponsive dialog
    
    return () => clearTimeout(timer);
  }, []);

  const floatingStats = [
    ["Neural Status", "ACTIVE"],
    ["Latency", "3ms"],
    ["Confidence", "96%"],
    ["Sessions", "2.4k"],
  ] as const;

  const sections = [
    ["Live AI Intelligence", "Real-time speech ingest, tokenized gloss conversion, semantic routing, and avatar execution in one fluid pipeline."],
    ["Accessibility by Design", "High contrast visual hierarchy, keyboard-first navigation, reduced-motion handling, and screen-reader friendly structure."],
    ["Investor Demo Ready", "Cinematic transitions, scriptable phrase walkthroughs, and reliability-first rendering for conference stage presentations."],
  ] as const;

  const highlights = [
    ["Feature Stack", "Deepgram, Grok, Neo4j, VRM, Supabase"],
    ["How It Works", "Speech -> Text -> Grok Gloss -> Semantic Map -> ISL Animation"],
    ["Rendering", "Adaptive DPR, viewport pausing, and lean GPU-friendly effects"],
    ["Reliability", "Fallback routing, loading skeletons, and cache-aware model serving"],
  ] as const;

  return (
    <AppShell>
      <section className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#050713]/85 p-5 md:p-8 lg:p-10">
        <div className="scanlines absolute inset-0 opacity-80" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,229,255,0.24),transparent_38%),radial-gradient(circle_at_85%_18%,rgba(139,92,246,0.25),transparent_36%),linear-gradient(180deg,rgba(0,229,255,0.08),transparent_35%)]" />
        <div className="relative grid items-center gap-6 xl:grid-cols-[280px_minmax(420px,1fr)_280px]">
          <Card className="neon-border order-2 h-full p-5 xl:order-1">
            <p className="mono text-[11px] uppercase tracking-[0.25em] text-cyan-300/75">Input Stream</p>
            <div className="mt-4 rounded-xl border border-cyan-300/25 bg-cyan-300/5 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="mono text-[10px] uppercase text-cyan-200/80">Live waveform</span>
                <span className="mono text-[10px] text-green-300">ONLINE</span>
              </div>
              <div className="flex h-14 items-end gap-1.5">
                {Array.from({ length: 18 }).map((_, idx) => (
                  <span
                    key={`wave-${idx}`}
                    className="w-1 rounded-full bg-gradient-to-t from-cyan-400/35 to-cyan-200/90 motion-safe:animate-pulse"
                    style={{ height: `${25 + ((idx * 19) % 55)}%`, animationDelay: `${idx * 55}ms` }}
                  />
                ))}
              </div>
            </div>
            <p className="mt-4 text-sm text-white/72">
              Neural speech capture, acoustic confidence, and token readiness remain visible for operator trust.
            </p>
          </Card>

          <div className="order-1 space-y-4 xl:order-2">
            <div className="text-center">
              <p className="mono text-xs uppercase tracking-[0.24em] text-cyan-300/80">Neural Accessibility Interface</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl" style={{ fontFamily: "var(--font-syne)" }}>
                <span className="gradient-text">AI Powered Real-Time ISL Translation</span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-white/72">
                SignBridge transforms live speech into expressive Indian Sign Language using Grok gloss intelligence, semantic fallback mapping, and cinematic VRM signing.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/translator" prefetch={false}>
                  <Button size="lg">Translate Now</Button>
                </Link>
                <Link href="/demo" prefetch={false}>
                  <Button variant="outline" size="lg">Watch Demo</Button>
                </Link>
              </div>
            </div>
            
            {/* Show loading placeholder or actual component */}
            {!showHeavyComponents && (
              <div className="h-[360px] w-full rounded-2xl bg-black/40 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-3"></div>
                  <p className="text-cyan-300/60 text-sm">Loading 3D Environment...</p>
                </div>
              </div>
            )}
            
            {showHeavyComponents && <AvatarStage sentiment="happy" lowBandwidth={false} />}
            
            <div className="grid grid-cols-2 gap-3">
              {floatingStats.map(([title, value]) => (
                <Card key={title} className="p-3">
                  <p className="mono text-[11px] uppercase tracking-wider text-white/55">{title}</p>
                  <p className="mt-1 text-lg text-cyan-200">{value}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="neon-border order-3 h-full p-5">
            <p className="mono text-[11px] uppercase tracking-[0.25em] text-cyan-300/75">AI Analysis</p>
            <div className="mt-4 space-y-2">
              {[
                ["ISL Gloss", "HELP HOSPITAL CALL"],
                ["Sentiment", "URGENT"],
                ["Fallback", "DIRECT + SEMANTIC"],
                ["FingerSpell", "READY"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 px-3 py-2">
                  <p className="mono text-[10px] uppercase text-white/55">{label}</p>
                  <p className="mt-1 text-xs text-cyan-200">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-cyan-300/15">
              <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-cyan-300 via-cyan-400 to-violet-400" />
            </div>
            <p className="mt-2 text-xs text-white/60">Confidence stream synced in real time.</p>
          </Card>
        </div>
      </section>

      <HomeTranslateBar />

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {sections.map(([title, body]) => (
          <Card key={title} className="p-6">
            <h3 className="text-lg text-cyan-200">{title}</h3>
            <p className="mt-2 text-sm text-white/70">{body}</p>
          </Card>
        ))}
      </section>

      <section className="mt-8">
        <Card className="p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-cyan-100" style={{ fontFamily: "var(--font-syne)" }}>
            Translation Intelligence Pipeline
          </h2>
          <p className="mt-2 text-sm text-white/70">Speech to signing with Grok-powered glossing, confidence-aware semantic fallback, and avatar execution.</p>
          <div className="mt-5">
            {showHeavyComponents && <PipelineFlow />}
            {!showHeavyComponents && <LoadingSkeleton className="h-24 w-full rounded-xl" />}
          </div>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {highlights.map(([title, body]) => (
          <Card key={title} className="p-5">
            <h3 className="text-base text-cyan-200">{title}</h3>
            <p className="mt-2 text-sm text-white/68">{body}</p>
          </Card>
        ))}
      </section>

      <footer className="mt-10 pb-2 text-center text-xs text-white/45">
        SignBridge Neural Accessibility Platform
      </footer>
    </AppShell>
  );
}