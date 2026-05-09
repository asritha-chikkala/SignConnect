"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  "Speech",
  "Text",
  "Grok AI Gloss Conversion",
  "Neo4j Semantic Mapping",
  "ISL Gloss",
  "VRM Sign Animation",
];

export function PipelineFlow({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-2 md:grid-cols-3" : "md:grid-cols-6")}>
      {steps.map((step, index) => (
        <motion.div
          key={step}
          initial={{ opacity: 0.65, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.04, duration: 0.3 }}
          className="relative rounded-xl border border-cyan-300/30 bg-cyan-300/5 p-3 text-xs text-cyan-100"
        >
          <span className="mono text-cyan-300/80">0{index + 1}</span>
          <p className="mt-1">{step}</p>
        </motion.div>
      ))}
    </div>
  );
}
