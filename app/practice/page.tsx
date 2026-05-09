"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const recap = ["HELLO YOU", "I NEED HELP", "WHERE HOSPITAL", "THANK YOU"];

export default function PracticePage() {
  const [speed, setSpeed] = useState(0.5);
  return (
    <AppShell>
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-cyan-100" style={{ fontFamily: "var(--font-syne)" }}>
          Practice & Recap
        </h1>
        <p className="mt-2 text-white/70">Replay previous signs and review learning cards.</p>
        <label className="mt-4 block text-sm">Slow motion replay: {speed.toFixed(1)}x</label>
        <input
          type="range"
          min={0.2}
          max={1}
          step={0.1}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="mt-2 w-full"
        />
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {recap.map((item) => (
            <Card key={item} className="p-3">
              <p className="font-medium">{item}</p>
              <Button className="mt-2 w-full">Replay</Button>
            </Card>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
