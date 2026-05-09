"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { EMERGENCY_PHRASES } from "@/data/emergency-phrases";
import { useIndexedEmergencyCache } from "@/hooks/use-indexed-emergency-cache";

export default function EmergencyPage() {
  const { primeCache, getCached } = useIndexedEmergencyCache();
  const [phrases, setPhrases] = useState(EMERGENCY_PHRASES);
  const [offline, setOffline] = useState(false);

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

  return (
    <AppShell>
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
