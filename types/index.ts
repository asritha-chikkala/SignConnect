import type { Sentiment } from "@/lib/utils";

export type TranslationChunk = {
  transcript: string;
  gloss: string[];
  sentiment: Sentiment;
  unknownWords: string[];
  processing: boolean;
  /** When true, the translation service used Grok for sentiment (otherwise heuristic). */
  sentimentFromGrok?: boolean;
};

export type EmergencyPhrase = {
  id: string;
  label: string;
  gloss: string[];
};

export type SessionMetric = {
  id: string;
  phrase: string;
  created_at: string;
  unknown_count: number;
};
