"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NeuralBackground } from "@/components/neural-background";
import { LowLightDetector } from "@/components/LowLightDetector";

const nav = [
  { href: "/", label: "Home" },
  { href: "/translator", label: "Translator" },
  { href: "/learn", label: "Learn" },
  { href: "/caption", label: "Caption" },
  { href: "/sign-to-speech", label: "Sign to Speech" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/practice", label: "Practice" },
  { href: "/emergency", label: "Emergency" },
  { href: "/demo", label: "Demo" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen pb-20 md:pb-8">
      <NeuralBackground />
      
      {/* 🔴 Low Light Detector - Global */}
      <LowLightDetector 
        onLowLightDetected={(isLow, brightness) => {
          console.log(`💡 Low light: ${isLow}, Brightness: ${brightness}%`);
        }}
        autoBoost={true}
        threshold={30}
        className="fixed bottom-4 left-4 z-50"
      />

      <header className="sticky top-0 z-40 border-b border-cyan-300/15 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" prefetch className="text-lg font-semibold tracking-wide text-cyan-300 neon-text">
            <span style={{ fontFamily: "var(--font-syne)" }}>SignBridge</span>
          </Link>
          <nav className="hidden gap-2 overflow-auto md:flex" aria-label="Primary navigation">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm text-white/75 transition-colors hover:text-white",
                  pathname === item.href && "text-white",
                )}
              >
                {pathname === item.href && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute inset-0 -z-10 rounded-lg bg-white/10"
                  />
                )}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? {} : { opacity: 0, y: -4 }}
          transition={{ duration: 0.26, ease: "easeOut" }}
          className="relative mx-auto max-w-7xl px-4 py-8"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <nav
        className="fixed inset-x-2 bottom-2 z-50 grid grid-cols-6 gap-1 rounded-2xl border border-cyan-300/20 bg-black/70 p-1 backdrop-blur-xl md:hidden"
        aria-label="Bottom navigation"
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            className={cn(
              "rounded-xl px-2 py-2 text-center text-[11px] text-white/70",
              pathname === item.href && "bg-cyan-300/15 text-cyan-200",
            )}
          >
            {item.label === "Home" ? "🏠" : 
             item.label === "Emergency" ? "⚠️" : 
             item.label === "Sign to Speech" ? "🎤" :
             item.label === "Caption" ? "📹" :
             item.label === "Learn" ? "📚" :
             item.label.charAt(0)}
          </Link>
        ))}
      </nav>
    </div>
  );
}