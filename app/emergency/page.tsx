"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { AvatarStage } from "@/components/avatar-stage";
import { EMERGENCY_PHRASES } from "@/data/emergency-phrases";
import { useIndexedEmergencyCache } from "@/hooks/use-indexed-emergency-cache";
import { avatarStyles } from "@/components/avatar-selector";
import { GestureShortcut } from "@/components/GestureShortcut";
import { LowLightDetector } from "@/components/LowLightDetector";


export default function EmergencyPage() {
  const { primeCache, getCached } = useIndexedEmergencyCache();
  const [phrases, setPhrases] = useState(EMERGENCY_PHRASES);
  const [offline, setOffline] = useState(false);
  const [selectedGloss, setSelectedGloss] = useState<string[]>([]);
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
        setAvatarKey(prev => prev + 1); // Force reload
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

  useEffect(() => {
    primeCache(EMERGENCY_PHRASES).catch(() => undefined);
    const onStatus = () => setOffline(!navigator.onLine);
    onStatus();
    window.addEventListener("online", onStatus);
    window.addEventListener("offline", onStatus);
    getCached().then((items) => items.length && setPhrases(items));
    return () => {
      window.removeEventListener("online", onStatus);
      window.removeEventListener("offline", onStatus);
    };
  }, [primeCache, getCached]);

  const handlePhraseClick = (gloss: string[]) => {
    setSelectedGloss(gloss);
    setReplayKey(prev => prev + 1);
  };

  return (
    <AppShell>
      <GestureShortcut 
        currentGloss={selectedGloss}
        onShortcutTriggered={(shortcut) => {
          console.log("Emergency shortcut:", shortcut);
        }}
      />
      <div className="mb-6">
        <AvatarStage 
          key={avatarKey}
          sentiment="urgent" 
          lowBandwidth={false}
          gloss={selectedGloss}
          signReplayKey={replayKey}
          emergencyMode={true}
          signingSpeed={1.2}
          avatarUrl={avatarUrl}
          onLoadStatus={(phase, message) => console.log("Avatar:", phase, message)}
        />
      </div>
{/* 🔴 Add LowLightDetector here */}
      <LowLightDetector 
        onLowLightDetected={(isLow, brightness) => {
          console.log(`Home: Low light: ${isLow}, Brightness: ${brightness}%`);
        }}
        autoBoost={true}
        threshold={30}
      />
      <Card className="border-rose-400/40 bg-gradient-to-b from-rose-900/30 to-black/30">
        <h1 className="text-2xl font-semibold text-rose-200" style={{ fontFamily: "var(--font-syne)" }}>
          Emergency Accessibility Mode
        </h1>
        <p className="mt-2 text-sm text-white/70">
          {offline ? "Offline mode active." : "Online. Emergency panel is still API-independent."}
        </p>
        <p className="mt-1 inline-flex rounded-full border border-rose-400/30 px-2 py-1 text-xs text-rose-200">
          {offline ? "OFFLINE CACHE ACTIVE" : "NETWORK CONNECTED"}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {phrases.map((phrase) => (
            <button
              key={phrase.id}
              onClick={() => handlePhraseClick(phrase.gloss)}
              className="focus-ring rounded-xl border border-rose-400/30 bg-black/50 p-4 text-left transition hover:scale-[1.01] hover:bg-rose-500/10"
            >
              <p className="text-lg font-semibold text-rose-200">{phrase.label}</p>
              <p className="mt-1 text-sm text-white/70">{phrase.gloss.join(" ")}</p>
            </button>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}