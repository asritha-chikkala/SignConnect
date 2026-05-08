"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

const SCRIPT = ["Hello, how are you?", "I need help.", "Where is the hospital?", "Thank you."];

export default function DemoPage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((prev) => (prev + 1) % SCRIPT.length), 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <AppShell>
      <Card className="neon-border p-8">
        <h1 className="text-3xl font-bold">Guided Demo Mode</h1>
        <p className="mt-2 text-white/70">Autoplay cinematic walkthrough for stable presentations.</p>
        <div className="mt-6 rounded-xl border bg-black/40 p-6">
          <p className="text-sm text-white/60">Current phrase</p>
          <p className="mt-2 text-2xl text-cyan-300">{SCRIPT[index]}</p>
        </div>
      </Card>
    </AppShell>
  );
}
