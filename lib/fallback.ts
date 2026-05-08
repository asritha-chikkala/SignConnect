const ISL_DICTIONARY: Record<string, string> = {
  hello: "HELLO",
  help: "HELP",
  hospital: "HOSPITAL",
  thank: "THANK",
  you: "YOU",
  happy: "HAPPY",
  danger: "DANGER",
};

const SEMANTIC_NEAREST: Record<string, string> = {
  ecstatic: "happy",
  joyful: "happy",
  clinic: "hospital",
  peril: "danger",
};

type ResolutionStep = "dictionary" | "neo4j-semantic" | "fingerspelling";

export type FallbackResolution = {
  word: string;
  sign: string;
  step: ResolutionStep;
};

export async function resolveWord(word: string): Promise<FallbackResolution> {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) {
    return { word, sign: word, step: "fingerspelling" };
  }

  if (ISL_DICTIONARY[clean]) {
    return { word: clean, sign: ISL_DICTIONARY[clean], step: "dictionary" };
  }

  const mapped = SEMANTIC_NEAREST[clean];
  if (mapped && ISL_DICTIONARY[mapped]) {
    return { word: clean, sign: ISL_DICTIONARY[mapped], step: "neo4j-semantic" };
  }

  return { word: clean, sign: clean.toUpperCase().split("").join("-"), step: "fingerspelling" };
}

export async function resolvePhrase(phrase: string) {
  const words = phrase.split(/\s+/).filter(Boolean);
  return Promise.all(words.map((word) => resolveWord(word)));
}
