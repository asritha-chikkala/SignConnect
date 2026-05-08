import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <AppShell>
      <section className="grid gap-4 py-12 md:grid-cols-2">
        <Card className="neon-border p-8">
          <p className="text-cyan-300">AI Accessibility Platform</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Real-Time Speech & Text to Indian Sign Language
          </h1>
          <p className="mt-4 text-white/70">
            SignBridge combines speech recognition, semantic fallback, and expressive avatar signing for inclusive communication.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/translator">
              <Button>Start Translating</Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline">Watch Demo</Button>
            </Link>
          </div>
        </Card>
        <Card className="p-8">
          <h2 className="text-xl font-semibold">How It Works</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>Deepgram streaming for live transcript</li>
            <li>Claude gloss generation with hierarchical fallback</li>
            <li>VRM avatar with sentiment-aware signing intensity</li>
            <li>Offline emergency phrase panel with IndexedDB cache</li>
          </ul>
        </Card>
      </section>
      <section className="grid gap-4 pb-8 md:grid-cols-3">
        {[
          ["Features", "Live translator, sentiment-aware avatar, fallback intelligence."],
          ["How It Works", "Speech -> Transcript -> Gloss -> Signing animation."],
          ["Accessibility Impact", "Large typography, keyboard-first controls, offline safety."],
          ["Demo Preview", "Scripted cinematic flow for stable investor demos."],
          ["Testimonials", "Mock user quotes from accessibility advocates."],
          ["Footer", "Docs, privacy, support, and deployment references."],
        ].map(([title, body]) => (
          <Card key={title}>
            <h3 className="text-lg font-semibold text-cyan-200">{title}</h3>
            <p className="mt-2 text-sm text-white/70">{body}</p>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
