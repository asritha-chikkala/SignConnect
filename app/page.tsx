"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { BookOpen, Captions, Mic } from "lucide-react"; // 🔴 ADD Mic
import { Camera} from "lucide-react";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export default function Home() {
  const features = [
    { icon: "🎙️", title: "Speech Recognition", desc: "Real-time transcription with Deepgram AI" },
    { icon: "🤖", title: "AI Translation", desc: "Grok-powered ISL gloss conversion" },
    { icon: "🕸️", title: "Semantic Mapping", desc: "Neo4j graph for context-aware fallback" },
    { icon: "🧑", title: "3D Avatar", desc: "VRM avatar performs sign language" },
  ];

  const stats = [
    { value: "98%", label: "Accuracy" },
    { value: "3ms", label: "Latency" },
    { value: "2.4k+", label: "Signs" },
    { value: "24/7", label: "Available" },
  ];

  return (
    <AppShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#050713]/85 p-8 md:p-12 lg:p-16">
        <div className="scanlines absolute inset-0 opacity-80" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,229,255,0.24),transparent_38%),radial-gradient(circle_at_85%_18%,rgba(139,92,246,0.25),transparent_36%),linear-gradient(180deg,rgba(0,229,255,0.08),transparent_35%)]" />
        
        <div className="relative flex flex-col items-center text-center">
          <div className="animate-float mb-8">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_0_60px_rgba(0,229,255,0.4)]">
              <span className="text-5xl md:text-6xl">🤟</span>
            </div>
          </div>

          <p className="mono text-xs uppercase tracking-[0.24em] text-cyan-300/80">Neural Accessibility Interface</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-syne)" }}>
            <span className="gradient-text">AI Powered Real-Time<br/>ISL Translation</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/72">
            {BRAND_NAME} transforms live speech into expressive Indian Sign Language using Grok gloss intelligence, 
            semantic fallback mapping, and cinematic VRM signing.
          </p>
          
          {/* Buttons - ADD Sign-to-Speech */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/translator" prefetch={false}>
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                Start Translating →
              </Button>
            </Link>
            <Link href="/learn" prefetch={false}>
              <Button size="lg" variant="outline" className="border-cyan-500/50 hover:bg-cyan-500/10">
                <BookOpen className="w-4 h-4 mr-2" />
                Educational Mode
              </Button>
            </Link>
            <Link href="/caption" prefetch={false}>
              <Button size="lg" variant="outline" className="border-purple-500/50 hover:bg-purple-500/10">
                <Captions className="w-4 h-4 mr-2" />
                Video Captioning
              </Button>
            </Link>
            {/* 🔴 NEW: Sign-to-Speech Button */}
            <Link href="/sign-to-speech" prefetch={false}>
              <Button size="lg" variant="outline" className="border-pink-500/50 hover:bg-pink-500/10">
                <Mic className="w-4 h-4 mr-2" />
                Sign to Speech
              </Button>
            </Link>
            <Link href="/demo" prefetch={false}>
              <Button variant="outline" size="lg">Watch Demo</Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-cyan-300/20">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-cyan-300">{stat.value}</div>
                <div className="text-xs text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mt-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-cyan-100" style={{ fontFamily: "var(--font-syne)" }}>
            Powerful Features
          </h2>
          <p className="text-white/50 mt-2">Everything you need for seamless communication</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6 text-center">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-cyan-200 mb-2">{feature.title}</h3>
              <p className="text-sm text-white/60">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-12 mb-8">
        <Card className="p-8 md:p-12 text-center bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
          <h2 className="text-2xl font-bold text-cyan-100 mb-4" style={{ fontFamily: "var(--font-syne)" }}>
            Ready to break the silence barrier?
          </h2>
          <p className="text-white/60 mb-6 max-w-2xl mx-auto">
            Start translating speech to Indian Sign Language in real-time with our AI-powered 3D avatar.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/translator">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500">
                Go to Translator →
              </Button>
            </Link>
           <Link href="/sign-to-text" prefetch={false}>
  <Button size="lg" variant="outline" className="border-pink-500/50 hover:bg-pink-500/10">
    <Camera className="w-4 h-4 mr-2" />
    Sign to Text
  </Button>
</Link>
            <Link href="/caption">
              <Button size="lg" variant="outline" className="border-purple-500/50 hover:bg-purple-500/10">
                <Captions className="w-4 h-4 mr-2" />
                Try Video Captioning
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      <footer className="mt-10 pb-2 text-center text-xs text-white/45">
        {BRAND_NAME} {BRAND_TAGLINE} — Breaking the Silence Barrier
      </footer>
    </AppShell>
  );
}