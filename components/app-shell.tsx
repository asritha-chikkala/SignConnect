"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { NeuralBackground } from "@/components/neural-background";
import { LowLightDetector } from "@/components/LowLightDetector";
import { SignOfTheDay } from "@/components/SignOfTheDay";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase-client";

const nav = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/translator", label: "Translator", icon: "💬" },
  { href: "/learn", label: "Learn", icon: "📚" },
  { href: "/caption", label: "Caption", icon: "📹" },
  { href: "/sign-to-text", label: "Sign to Text", icon: "✋" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/demo", label: "Demo", icon: "🎬" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="relative min-h-screen pb-20 md:pb-8">
      <NeuralBackground />
      
      <SignOfTheDay 
        position="bottom-right"
        className="z-50"
      />

      <LowLightDetector 
        onLowLightDetected={(isLow, brightness) => {
          console.log(`💡 Low light: ${isLow}, Brightness: ${brightness}%`);
        }}
        autoBoost={true}
        threshold={30}
        className="fixed bottom-4 left-4 z-50"
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-cyan-300/15 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" prefetch className="text-lg font-semibold tracking-wide text-cyan-300 neon-text">
            <span style={{ fontFamily: "var(--font-syne)" }}>{BRAND_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            ))}
            {/* Logout Button - Desktop */}
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-2"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/5 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-cyan-300/15 bg-black/90 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-2 space-y-1">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                {/* Logout Button - Mobile */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

      {/* Bottom Navigation - Mobile ONLY */}
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
              "rounded-xl px-2 py-2 text-center text-[11px] text-white/70 transition-colors",
              pathname === item.href && "bg-cyan-300/15 text-cyan-200"
            )}
          >
            <div className="text-lg">{item.icon}</div>
          </Link>
        ))}
      </nav>
    </div>
  );
}