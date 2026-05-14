"use client";

import type { AvatarHudState } from "@/lib/gloss-sign-plan";

type Props = {
  hud: AvatarHudState;
  gloss: string[];
  unknownWords: string[];
  /** When true, the last step used fingerspelling (approximation). */
  lastWasSpell: boolean;
};

export function SigningHud({ hud, gloss, unknownWords, lastWasSpell }: Props) {
  return (
    <div
      className="space-y-2 rounded-xl border border-cyan-300/20 bg-black/45 p-3 text-xs text-white/80"
      role="status"
      aria-live="polite"
      aria-label="Signing status"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">Animation</p>
        <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] uppercase text-cyan-100">{hud.phase}</span>
      </div>
      <p className="text-sm text-cyan-50">{hud.detail}</p>
      <p className="text-[11px] text-white/55">
        Step {hud.stepTotal ? hud.stepIndex + 1 : 0} / {hud.stepTotal || "—"}
      </p>
      <div>
        <p className="mono text-[10px] uppercase tracking-wider text-white/45">Gloss queue</p>
        <p className="mt-1 break-words text-cyan-100/90">{gloss.length ? gloss.join(" · ") : "—"}</p>
      </div>
      {unknownWords.length > 0 && (
        <p className="text-amber-200/90">
          Semantic/fingerspell fallback words: {unknownWords.join(", ")}
        </p>
      )}
      {lastWasSpell && (
        <p className="text-violet-200/90">Last segment used procedural fingerspelling (demo wrist poses per letter).</p>
      )}
    </div>
  );
}
