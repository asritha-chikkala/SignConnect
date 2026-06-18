"use client";

import { AppShell } from "@/components/app-shell";
import { SignToText } from "@/components/SignToText";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Camera, Sparkles, Database } from "lucide-react";
import { ISL_SIGNS } from "@/lib/isl-signs";

export default function SignToTextPage() {
  const totalSigns = Object.keys(ISL_SIGNS).length;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-cyan-100 mb-2" style={{ fontFamily: "var(--font-syne)" }}>
          🤟 Sign-to-Text
        </h1>
        <p className="text-white/50 mb-6">
          Use your camera to sign, and the system will convert your signs to text in real-time.
          <span className="block text-xs text-cyan-400/60 mt-1">
            Uses the same ISL sign database as the translator ({totalSigns} signs available)
          </span>
        </p>

        <SignToText 
          onSignDetected={(sign) => {
            console.log(`🎯 Sign detected: ${sign.id} → "${sign.text}"`);
          }}
          onTextGenerated={(text) => {
            console.log(`📝 Text generated: "${text}"`);
          }}
          className="mb-6"
        />

        {/* Features List */}
        <Card className="p-6 bg-gradient-to-br from-black/40 to-black/20 border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl mb-2">📷</div>
              <h4 className="text-sm font-medium text-white">1. Camera Capture</h4>
              <p className="text-xs text-white/40">Camera captures your hand signs in real-time</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl mb-2">🧠</div>
              <h4 className="text-sm font-medium text-white">2. ISL Database Match</h4>
              <p className="text-xs text-white/40">Matches signs against {totalSigns}+ ISL signs</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl mb-2">📝</div>
              <h4 className="text-sm font-medium text-white">3. Text Output</h4>
              <p className="text-xs text-white/40">Text appears in the text field</p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <p className="text-xs text-cyan-300">
                Using the same ISL sign database as the Translator page - consistent signs across the platform!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}