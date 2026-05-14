/**
 * Maps ISL gloss tokens to 3D sign clip IDs (procedural / Mixamo-style names).
 * Unknown tokens expand to per-letter fingerspelling steps (A–Z, 0–9).
 */

export type SignClipId =
  | "idle"
  | "wave"
  | "point"
  | "come_here"
  | "thumbs_up"
  | "stop"
  | "phone_call"
  | "raise_hand"
  | "nod_yes"
  | "shake_no"
  | "bow_thanks"
  | "clap"
  | "think"
  | "look_around"
  | "heart"
  | "pray"
  | "walk"
  | "sit"
  | "eat"
  | "drink"
  | "sleep"
  | "hurt";

export type AvatarHudState = {
  phase: "idle" | "playing" | "spelling" | "paused";
  detail: string;
  stepIndex: number;
  stepTotal: number;
};

export type SignPlanStep =
  | { kind: "clip"; clip: SignClipId; sourceToken: string }
  | { kind: "spell"; letter: string; sourceToken: string };

/** Gloss token (uppercase) → clip. Extend this table as you add Mixamo exports. */
const TOKEN_TO_CLIP: Record<string, SignClipId> = {
  HELLO: "wave",
  HI: "wave",
  BYE: "wave",
  GOODBYE: "wave",
  HELP: "raise_hand",
  SOS: "raise_hand",
  EMERGENCY: "raise_hand",
  HOSPITAL: "point",
  DOCTOR: "point",
  HERE: "come_here",
  COME: "come_here",
  STOP: "stop",
  WAIT: "stop",
  NO: "shake_no",
  YES: "nod_yes",
  OK: "nod_yes",
  THANK: "bow_thanks",
  THANKS: "bow_thanks",
  PLEASE: "pray",
  SORRY: "bow_thanks",
  PHONE: "phone_call",
  CALL: "phone_call",
  LOVE: "heart",
  HAPPY: "clap",
  GOOD: "thumbs_up",
  GREAT: "thumbs_up",
  FINE: "thumbs_up",
  HURT: "hurt",
  PAIN: "hurt",
  EAT: "eat",
  DRINK: "drink",
  SLEEP: "sleep",
  WALK: "walk",
  SIT: "sit",
  THINK: "think",
  LOOK: "look_around",
  ME: "point",
  YOU: "point",
  I: "point",
  WE: "wave",
  QUESTION: "think",
  WHAT: "think",
  WHERE: "look_around",
};

function isSpellChar(ch: string): boolean {
  return /^[A-Z0-9]$/i.test(ch);
}

export function buildSignPlanFromGloss(gloss: string[]): SignPlanStep[] {
  const steps: SignPlanStep[] = [];
  for (const raw of gloss) {
    const token = raw.trim().toUpperCase();
    if (!token) continue;
    const clip = TOKEN_TO_CLIP[token];
    if (clip) {
      steps.push({ kind: "clip", clip, sourceToken: token });
      continue;
    }
    const letters = token.replace(/[^A-Z0-9]/gi, "").split("");
    if (!letters.length) continue;
    for (const letter of letters) {
      if (isSpellChar(letter)) {
        steps.push({ kind: "spell", letter: letter.toUpperCase(), sourceToken: token });
      }
    }
  }
  return steps;
}

export function describeStep(step: SignPlanStep): string {
  if (step.kind === "clip") return `${step.sourceToken} → ${step.clip}`;
  return `${step.sourceToken} → spell “${step.letter}”`;
}
