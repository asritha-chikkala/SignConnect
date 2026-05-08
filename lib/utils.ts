import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Sentiment = "neutral" | "question" | "urgent" | "happy";

export const SENTIMENT_THEME: Record<
  Sentiment,
  { glow: string; label: string; intensity: number }
> = {
  neutral: { glow: "shadow-cyan-400/30", label: "Neutral", intensity: 0.5 },
  question: { glow: "shadow-blue-400/30", label: "Question", intensity: 0.65 },
  urgent: { glow: "shadow-rose-500/40", label: "Urgent", intensity: 0.9 },
  happy: { glow: "shadow-violet-400/40", label: "Happy", intensity: 0.75 },
};
