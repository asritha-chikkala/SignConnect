"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { NeuralBackground } from "@/components/neural-background";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <NeuralBackground />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.08),transparent_58%)]" />
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md rounded-3xl border border-cyan-300/30 bg-black/45 p-6 backdrop-blur-xl"
      >
        <Link href="/" className="mono text-xs tracking-widest text-cyan-300/80">
          SIGNBRIDGE
        </Link>
        <h1 className="mt-3 text-3xl text-cyan-100" style={{ fontFamily: "var(--font-syne)" }}>
          {title}
        </h1>
        <p className="mt-2 text-sm text-white/68">{subtitle}</p>
        <div className="mt-5 space-y-3">{children}</div>
        {footer ? <div className="mt-4 border-t border-white/10 pt-4">{footer}</div> : null}
      </motion.section>
    </main>
  );
}
