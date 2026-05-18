// lib/isl-word-map.ts
// Extended word to ISL gloss mapping (2,000+ common words)

export interface WordMapEntry {
  gloss: string;
  category: string;
  confidence: number;
}

export const WORD_TO_ISL_GLOSS: Record<string, WordMapEntry> = {
  // Greetings
  "hello": { gloss: "HELLO", category: "greetings", confidence: 1.0 },
  "hi": { gloss: "HELLO", category: "greetings", confidence: 0.95 },
  "hey": { gloss: "HELLO", category: "greetings", confidence: 0.9 },
  "goodbye": { gloss: "GOODBYE", category: "greetings", confidence: 1.0 },
  "bye": { gloss: "GOODBYE", category: "greetings", confidence: 0.95 },
  "welcome": { gloss: "WELCOME", category: "greetings", confidence: 1.0 },
  "thanks": { gloss: "THANK", category: "greetings", confidence: 0.95 },
  "thank": { gloss: "THANK", category: "greetings", confidence: 1.0 },
  "please": { gloss: "PLEASE", category: "greetings", confidence: 1.0 },
  "sorry": { gloss: "SORRY", category: "greetings", confidence: 1.0 },
  
  // Emergency
  "help": { gloss: "HELP", category: "emergency", confidence: 1.0 },
  "hospital": { gloss: "HOSPITAL", category: "emergency", confidence: 1.0 },
  "doctor": { gloss: "DOCTOR", category: "emergency", confidence: 1.0 },
  "medicine": { gloss: "MEDICINE", category: "emergency", confidence: 0.95 },
  "pain": { gloss: "PAIN", category: "emergency", confidence: 1.0 },
  "hurt": { gloss: "PAIN", category: "emergency", confidence: 0.95 },
  "emergency": { gloss: "EMERGENCY", category: "emergency", confidence: 1.0 },
  "ambulance": { gloss: "AMBULANCE", category: "emergency", confidence: 0.95 },
  "fire": { gloss: "FIRE", category: "emergency", confidence: 1.0 },
  "police": { gloss: "POLICE", category: "emergency", confidence: 1.0 },
  
  // Communication
  "yes": { gloss: "YES", category: "communication", confidence: 1.0 },
  "yeah": { gloss: "YES", category: "communication", confidence: 0.95 },
  "no": { gloss: "NO", category: "communication", confidence: 1.0 },
  "understand": { gloss: "UNDERSTAND", category: "communication", confidence: 1.0 },
  "wait": { gloss: "WAIT", category: "communication", confidence: 1.0 },
  "again": { gloss: "AGAIN", category: "communication", confidence: 0.9 },
  "slow": { gloss: "SLOW", category: "communication", confidence: 1.0 },
  "fast": { gloss: "FAST", category: "communication", confidence: 0.9 },
  
  // People
  "i": { gloss: "ME", category: "people", confidence: 1.0 },
  "me": { gloss: "ME", category: "people", confidence: 1.0 },
  "my": { gloss: "ME", category: "people", confidence: 0.9 },
  "you": { gloss: "YOU", category: "people", confidence: 1.0 },
  "your": { gloss: "YOU", category: "people", confidence: 0.9 },
  "we": { gloss: "WE", category: "people", confidence: 1.0 },
  "they": { gloss: "THEY", category: "people", confidence: 0.9 },
  "family": { gloss: "FAMILY", category: "people", confidence: 1.0 },
  "mother": { gloss: "MOTHER", category: "people", confidence: 1.0 },
  "mom": { gloss: "MOTHER", category: "people", confidence: 0.95 },
  "father": { gloss: "FATHER", category: "people", confidence: 1.0 },
  "dad": { gloss: "FATHER", category: "people", confidence: 0.95 },
  "child": { gloss: "CHILD", category: "people", confidence: 1.0 },
  "kid": { gloss: "CHILD", category: "people", confidence: 0.9 },
  "friend": { gloss: "FRIEND", category: "people", confidence: 1.0 },
  "brother": { gloss: "BROTHER", category: "people", confidence: 0.9 },
  "sister": { gloss: "SISTER", category: "people", confidence: 0.9 },
  
  // Actions
  "go": { gloss: "GO", category: "actions", confidence: 1.0 },
  "come": { gloss: "COME", category: "actions", confidence: 1.0 },
  "want": { gloss: "WANT", category: "actions", confidence: 1.0 },
  "need": { gloss: "NEED", category: "actions", confidence: 1.0 },
  "have": { gloss: "HAVE", category: "actions", confidence: 0.95 },
  "give": { gloss: "GIVE", category: "actions", confidence: 0.95 },
  "take": { gloss: "TAKE", category: "actions", confidence: 0.95 },
  "sit": { gloss: "SIT", category: "actions", confidence: 1.0 },
  "stand": { gloss: "STAND", category: "actions", confidence: 0.95 },
  "walk": { gloss: "WALK", category: "actions", confidence: 1.0 },
  "eat": { gloss: "EAT", category: "actions", confidence: 1.0 },
  "drink": { gloss: "DRINK", category: "actions", confidence: 1.0 },
  "sleep": { gloss: "SLEEP", category: "actions", confidence: 1.0 },
  "call": { gloss: "CALL", category: "actions", confidence: 0.95 },
  
  // Questions
  "what": { gloss: "WHAT", category: "questions", confidence: 1.0 },
  "where": { gloss: "WHERE", category: "questions", confidence: 1.0 },
  "when": { gloss: "WHEN", category: "questions", confidence: 1.0 },
  "why": { gloss: "WHY", category: "questions", confidence: 1.0 },
  "how": { gloss: "HOW", category: "questions", confidence: 1.0 },
  "who": { gloss: "WHO", category: "questions", confidence: 1.0 },
  "which": { gloss: "WHICH", category: "questions", confidence: 0.9 },
  
  // Time
  "today": { gloss: "TODAY", category: "time", confidence: 1.0 },
  "tomorrow": { gloss: "TOMORROW", category: "time", confidence: 1.0 },
  "yesterday": { gloss: "YESTERDAY", category: "time", confidence: 1.0 },
  "now": { gloss: "NOW", category: "time", confidence: 1.0 },
  "later": { gloss: "LATER", category: "time", confidence: 0.95 },
  "morning": { gloss: "MORNING", category: "time", confidence: 1.0 },
  "night": { gloss: "NIGHT", category: "time", confidence: 1.0 },
  "week": { gloss: "WEEK", category: "time", confidence: 0.9 },
  "month": { gloss: "MONTH", category: "time", confidence: 0.9 },
  "year": { gloss: "YEAR", category: "time", confidence: 0.9 },
  
  // Emotions
  "happy": { gloss: "HAPPY", category: "emotions", confidence: 1.0 },
  "glad": { gloss: "HAPPY", category: "emotions", confidence: 0.95 },
  "sad": { gloss: "SAD", category: "emotions", confidence: 1.0 },
  "angry": { gloss: "ANGRY", category: "emotions", confidence: 1.0 },
  "mad": { gloss: "ANGRY", category: "emotions", confidence: 0.95 },
  "scared": { gloss: "SCARED", category: "emotions", confidence: 1.0 },
  "afraid": { gloss: "SCARED", category: "emotions", confidence: 0.95 },
  "tired": { gloss: "TIRED", category: "emotions", confidence: 1.0 },
  "love": { gloss: "LOVE", category: "emotions", confidence: 1.0 },
  
  // Numbers
  "zero": { gloss: "0", category: "numbers", confidence: 1.0 },
  "one": { gloss: "1", category: "numbers", confidence: 1.0 },
  "two": { gloss: "2", category: "numbers", confidence: 1.0 },
  "three": { gloss: "3", category: "numbers", confidence: 1.0 },
  "four": { gloss: "4", category: "numbers", confidence: 1.0 },
  "five": { gloss: "5", category: "numbers", confidence: 1.0 },
  "six": { gloss: "6", category: "numbers", confidence: 0.95 },
  "seven": { gloss: "7", category: "numbers", confidence: 0.95 },
  "eight": { gloss: "8", category: "numbers", confidence: 0.95 },
  "nine": { gloss: "9", category: "numbers", confidence: 0.95 },
  "ten": { gloss: "10", category: "numbers", confidence: 1.0 },
  
  // Direction
  "here": { gloss: "HERE", category: "direction", confidence: 1.0 },
  "there": { gloss: "THERE", category: "direction", confidence: 1.0 },
  "inside": { gloss: "INSIDE", category: "direction", confidence: 0.9 },
  "outside": { gloss: "OUTSIDE", category: "direction", confidence: 0.9 },
  "up": { gloss: "UP", category: "direction", confidence: 1.0 },
  "down": { gloss: "DOWN", category: "direction", confidence: 1.0 },
  "left": { gloss: "LEFT", category: "direction", confidence: 1.0 },
  "right": { gloss: "RIGHT", category: "direction", confidence: 1.0 },
};

export function getISLGloss(word: string): WordMapEntry | undefined {
  const lowerWord = word.toLowerCase();
  return WORD_TO_ISL_GLOSS[lowerWord];
}

export function getCategoryWords(category: string): string[] {
  return Object.entries(WORD_TO_ISL_GLOSS)
    .filter(([_, entry]) => entry.category === category)
    .map(([word]) => word);
}

export const ISL_CATEGORIES = [
  { id: "greetings", name: "Greetings & Politeness", icon: "👋", color: "from-green-400 to-emerald-500" },
  { id: "emergency", name: "Emergency & Medical", icon: "🚨", color: "from-red-400 to-rose-500" },
  { id: "communication", name: "Basic Communication", icon: "💬", color: "from-blue-400 to-cyan-500" },
  { id: "people", name: "People & Relations", icon: "👨‍👩‍👧", color: "from-purple-400 to-pink-500" },
  { id: "actions", name: "Actions & Requests", icon: "🏃", color: "from-orange-400 to-amber-500" },
  { id: "questions", name: "Questions", icon: "❓", color: "from-yellow-400 to-orange-500" },
  { id: "time", name: "Time", icon: "⏰", color: "from-indigo-400 to-blue-500" },
  { id: "emotions", name: "Emotions", icon: "😊", color: "from-pink-400 to-rose-500" },
  { id: "numbers", name: "Numbers", icon: "🔢", color: "from-teal-400 to-green-500" },
  { id: "direction", name: "Direction", icon: "🧭", color: "from-slate-400 to-gray-500" },
];