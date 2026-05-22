"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarStage } from "@/components/avatar-stage";
import { avatarStyles } from "@/components/avatar-selector";

const recap = [
  { label: "HELLO YOU", gloss: ["HELLO", "YOU"] },
  { label: "I NEED HELP", gloss: ["I", "NEED", "HELP"] },
  { label: "WHERE HOSPITAL", gloss: ["WHERE", "HOSPITAL"] },
  { label: "THANK YOU", gloss: ["THANK", "YOU"] },
];

export default function PracticePage() {
  const [speed, setSpeed] = useState(0.5);
  const [currentGloss, setCurrentGloss] = useState<string[]>([]);
  const [replayKey, setReplayKey] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarKey, setAvatarKey] = useState(0);

  // Load saved avatar on mount - use the same logic as translator
  useEffect(() => {
    const savedAvatarId = localStorage.getItem("selectedAvatar");
    const savedAvatarUrl = localStorage.getItem("selectedAvatarUrl");
    
    if (savedAvatarId && savedAvatarUrl) {
      const avatar = avatarStyles.find(a => a.id === savedAvatarId && !a.isComingSoon);
      if (avatar) {
        setAvatarUrl(savedAvatarUrl);
        setAvatarKey(prev => prev + 1);
        return;
      }
    }
    
    // Fallback to default avatar
    const defaultAvatar = avatarStyles.find(a => a.id === "default");
    if (defaultAvatar) {
      setAvatarUrl(defaultAvatar.vrmUrl);
      setAvatarKey(prev => prev + 1);
    }
  }, []);

  // Listen for avatar changes from other pages
  useEffect(() => {
    const handleStorageChange = () => {
      const savedAvatarUrl = localStorage.getItem("selectedAvatarUrl");
      if (savedAvatarUrl && savedAvatarUrl !== avatarUrl) {
        setAvatarUrl(savedAvatarUrl);
        setAvatarKey(prev => prev + 1);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [avatarUrl]);

  const handleReplay = (gloss: string[]) => {
    setCurrentGloss(gloss);
    setReplayKey(prev => prev + 1);
  };

  return (
    <AppShell>
      <div className="mb-6">
        <AvatarStage 
          key={avatarKey}
          sentiment="neutral" 
          lowBandwidth={false}
          gloss={currentGloss}
          signReplayKey={replayKey}
          signingSpeed={speed}
          learningSlowMo={speed}
          avatarUrl={avatarUrl}
          onLoadStatus={(phase, message) => console.log("Avatar:", phase, message)}
        />
      </div>

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
            <Card key={item.label} className="p-3">
              <p className="font-medium">{item.label}</p>
              <Button 
                className="mt-2 w-full" 
                onClick={() => handleReplay(item.gloss)}
              >
                Replay Sign
              </Button>
            </Card>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
