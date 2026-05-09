"use client";

import { motion } from "framer-motion";

export function NeuralBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="neural-grid absolute inset-0 opacity-70" />
      <motion.div
        className="absolute -left-10 top-12 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl"
        animate={{ x: [0, 24, -16, 0], y: [0, -18, 12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 top-24 h-60 w-60 rounded-full bg-violet-500/20 blur-3xl"
        animate={{ x: [0, -22, 12, 0], y: [0, 12, -10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl"
        animate={{ scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
