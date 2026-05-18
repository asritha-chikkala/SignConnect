// lib/isl-sentence-builder.ts
// English to Indian Sign Language (ISL) Grammar Converter
// ISL follows Subject-Object-Verb (SOV) order with different question structure

export interface ISLSentence {
  original: string;
  glossTokens: string[];
  islWordOrder: string[];
  type: "statement" | "question" | "command" | "negative";
  confidence: number;
}

// ISL grammatical markers
const QUESTION_MARKERS = ["WHAT", "WHERE", "WHEN", "WHY", "HOW", "WHO"];

// Convert English sentence to ISL word order (SOV - Subject Object Verb)
export function englishToISL(text: string): ISLSentence {
  const original = text.trim();
  const words = original.toLowerCase().split(/\s+/);
  
  // Detect sentence type
  let type: ISLSentence["type"] = "statement";
  if (original.includes("?")) type = "question";
  if (words.some(w => ["please", "kindly"].includes(w))) type = "command";
  if (words.some(w => ["no", "not", "don't", "never"].includes(w))) type = "negative";
  
  // Extract subject, object, verb (simplified)
  const subjectWords = extractSubject(words);
  const objectWords = extractObject(words);
  const verbWords = extractVerb(words);
  
  // Build ISL word order: Subject + Object + Verb
  let islOrder: string[] = [];
  
  if (type === "question") {
    // ISL questions put question word at the end or beginning
    const questionWord = findQuestionWord(original);
    islOrder = [...subjectWords, ...objectWords, ...verbWords];
    if (questionWord) islOrder.push(questionWord);
  } else if (type === "negative") {
    // ISL negatives put "NOT" after the verb
    islOrder = [...subjectWords, ...objectWords, ...verbWords, "NOT"];
  } else {
    // Standard SOV order
    islOrder = [...subjectWords, ...objectWords, ...verbWords];
  }
  
  // Convert to uppercase gloss format
  const glossTokens = islOrder.map(w => w.toUpperCase()).filter(w => w.length > 0);
  
  // Calculate confidence
  const confidence = calculateConfidence(original, glossTokens);
  
  return {
    original,
    glossTokens,
    islWordOrder: islOrder,
    type,
    confidence,
  };
}

function extractSubject(words: string[]): string[] {
  const subjectPronouns: Record<string, string> = {
    "i": "ME", "you": "YOU", "he": "HE", "she": "SHE", "it": "IT",
    "we": "WE", "they": "THEY", "my": "MY", "your": "YOUR",
    "this": "THIS", "that": "THAT"
  };
  
  for (const word of words) {
    if (subjectPronouns[word]) return [subjectPronouns[word]];
  }
  return [];
}

function extractObject(words: string[]): string[] {
  const objects: string[] = [];
  const commonObjects = ["hospital", "doctor", "medicine", "water", "food", "help"];
  
  for (const word of words) {
    if (commonObjects.includes(word)) {
      objects.push(word.toUpperCase());
    }
  }
  return objects;
}

function extractVerb(words: string[]): string[] {
  const verbs: Record<string, string> = {
    "go": "GO", "come": "COME", "want": "WANT", "need": "NEED",
    "help": "HELP", "call": "CALL", "take": "TAKE", "give": "GIVE",
    "eat": "EAT", "drink": "DRINK", "sleep": "SLEEP", "walk": "WALK"
  };
  
  for (const word of words) {
    if (verbs[word]) return [verbs[word]];
  }
  return [];
}

function findQuestionWord(text: string): string | null {
  const lowerText = text.toLowerCase();
  if (lowerText.includes("what")) return "WHAT";
  if (lowerText.includes("where")) return "WHERE";
  if (lowerText.includes("when")) return "WHEN";
  if (lowerText.includes("why")) return "WHY";
  if (lowerText.includes("how")) return "HOW";
  if (lowerText.includes("who")) return "WHO";
  return null;
}

function calculateConfidence(original: string, glossTokens: string[]): number {
  // Simple confidence calculation based on length matching
  const wordCount = original.split(/\s+/).length;
  const glossCount = glossTokens.length;
  
  if (glossCount === 0) return 0;
  
  const ratio = Math.min(1, glossCount / (wordCount + 1));
  return Math.round(ratio * 100);
}

// Example sentences for testing
export const EXAMPLE_ISL_SENTENCES = {
  statement: [
    { english: "I need help", isl: "ME HELP NEED" },
    { english: "I want water", isl: "ME WATER WANT" },
    { english: "Please call doctor", isl: "DOCTOR CALL PLEASE" },
    { english: "Thank you for your help", isl: "HELP THANK" },
  ],
  question: [
    { english: "Where is the hospital?", isl: "HOSPITAL WHERE" },
    { english: "What is your name?", isl: "YOUR NAME WHAT" },
    { english: "How are you?", isl: "YOU HOW" },
  ],
  command: [
    { english: "Please sit down", isl: "SIT PLEASE" },
    { english: "Come here please", isl: "COME HERE PLEASE" },
  ],
  negative: [
    { english: "I don't understand", isl: "ME NOT UNDERSTAND" },
    { english: "No problem", isl: "PROBLEM NOT" },
  ],
};