// lib/isl-signs.ts
// Master database for all ISL signs - used by both Text→Sign and Sign→Text

export interface ISLSign {
  id: string;
  gloss: string;           // Uppercase gloss (e.g., "HELLO")
  text: string;            // Display text (e.g., "Hello")
  description: string;     // Description of the sign
  handShape: string;       // Open, fist, point, etc.
  animationClip: string;   // Clip name for avatar (wave, raise_hand, etc.)
  icon: string;            // Emoji icon
  handPose?: {
    fingers: number[];     // [thumb, index, middle, ring, pinky] 0=closed, 1=open
    orientation: 'up' | 'down' | 'forward' | 'side';
  };
}

export const ISL_SIGNS: Record<string, ISLSign> = {
  HELLO: {
    id: 'hello',
    gloss: 'HELLO',
    text: 'Hello',
    description: 'Wave hand near forehead',
    handShape: 'open_hand',
    animationClip: 'wave',
    handPose: { fingers: [1, 1, 1, 1, 1], orientation: 'up' },
    icon: '👋',
  },
  HELP: {
    id: 'help',
    gloss: 'HELP',
    text: 'Help',
    description: 'Raised hand, palm facing out',
    handShape: 'open_palm',
    animationClip: 'raise_hand',
    handPose: { fingers: [0, 1, 1, 1, 1], orientation: 'forward' },
    icon: '🆘',
  },
  YES: {
    id: 'yes',
    gloss: 'YES',
    text: 'Yes',
    description: 'Nodding fist motion',
    handShape: 'fist',
    animationClip: 'nod_yes',
    handPose: { fingers: [0, 0, 0, 0, 0], orientation: 'up' },
    icon: '👍',
  },
  NO: {
    id: 'no',
    gloss: 'NO',
    text: 'No',
    description: 'Head shake with hand wave',
    handShape: 'open_hand',
    animationClip: 'shake_no',
    handPose: { fingers: [1, 1, 1, 1, 1], orientation: 'side' },
    icon: '👎',
  },
  THANK: {
    id: 'thank',
    gloss: 'THANK',
    text: 'Thank you',
    description: 'Hand from chin outward',
    handShape: 'flat',
    animationClip: 'bow_thanks',
    handPose: { fingers: [1, 1, 1, 1, 1], orientation: 'forward' },
    icon: '🙏',
  },
  PLEASE: {
    id: 'please',
    gloss: 'PLEASE',
    text: 'Please',
    description: 'Circular motion on chest',
    handShape: 'flat',
    animationClip: 'pray',
    handPose: { fingers: [1, 1, 1, 1, 1], orientation: 'forward' },
    icon: '🤲',
  },
  SORRY: {
    id: 'sorry',
    gloss: 'SORRY',
    text: 'Sorry',
    description: 'Fist on chest, circular motion',
    handShape: 'fist',
    animationClip: 'bow_thanks',
    handPose: { fingers: [0, 0, 0, 0, 0], orientation: 'forward' },
    icon: '😔',
  },
  GOOD: {
    id: 'good',
    gloss: 'GOOD',
    text: 'Good',
    description: 'Thumbs up gesture',
    handShape: 'thumb_up',
    animationClip: 'thumbs_up',
    handPose: { fingers: [1, 0, 0, 0, 0], orientation: 'up' },
    icon: '👍',
  },
  STOP: {
    id: 'stop',
    gloss: 'STOP',
    text: 'Stop',
    description: 'Raised palm facing forward',
    handShape: 'open_palm',
    animationClip: 'stop',
    handPose: { fingers: [1, 1, 1, 1, 1], orientation: 'forward' },
    icon: '✋',
  },
  COME: {
    id: 'come',
    gloss: 'COME',
    text: 'Come',
    description: 'Pulling hand motion toward body',
    handShape: 'open_hand',
    animationClip: 'come_here',
    handPose: { fingers: [1, 1, 1, 1, 1], orientation: 'forward' },
    icon: '👋',
  },
  GO: {
    id: 'go',
    gloss: 'GO',
    text: 'Go',
    description: 'Pointing away from body',
    handShape: 'point',
    animationClip: 'point',
    handPose: { fingers: [0, 1, 0, 0, 0], orientation: 'forward' },
    icon: '👉',
  },
  EAT: {
    id: 'eat',
    gloss: 'EAT',
    text: 'Eat',
    description: 'Hand motion toward mouth',
    handShape: 'curved',
    animationClip: 'eat',
    handPose: { fingers: [1, 1, 0, 0, 0], orientation: 'forward' },
    icon: '🍽️',
  },
  DRINK: {
    id: 'drink',
    gloss: 'DRINK',
    text: 'Drink',
    description: 'Drinking motion',
    handShape: 'curved',
    animationClip: 'drink',
    handPose: { fingers: [1, 1, 0, 0, 0], orientation: 'forward' },
    icon: '🥤',
  },
  SLEEP: {
    id: 'sleep',
    gloss: 'SLEEP',
    text: 'Sleep',
    description: 'Hand on cheek, head tilted',
    handShape: 'flat',
    animationClip: 'sleep',
    handPose: { fingers: [1, 1, 1, 1, 1], orientation: 'side' },
    icon: '😴',
  },
  WALK: {
    id: 'walk',
    gloss: 'WALK',
    text: 'Walk',
    description: 'Walking finger motion',
    handShape: 'index',
    animationClip: 'walk',
    handPose: { fingers: [0, 1, 0, 0, 0], orientation: 'down' },
    icon: '🚶',
  },
  SIT: {
    id: 'sit',
    gloss: 'SIT',
    text: 'Sit',
    description: 'Two fingers pointing down',
    handShape: 'index',
    animationClip: 'sit',
    handPose: { fingers: [0, 1, 1, 0, 0], orientation: 'down' },
    icon: '🪑',
  },
  LOVE: {
    id: 'love',
    gloss: 'LOVE',
    text: 'Love',
    description: 'Heart shape over chest',
    handShape: 'open',
    animationClip: 'heart',
    handPose: { fingers: [1, 1, 1, 1, 1], orientation: 'forward' },
    icon: '❤️',
  },
  HAPPY: {
    id: 'happy',
    gloss: 'HAPPY',
    text: 'Happy',
    description: 'Gentle clap with smile',
    handShape: 'open',
    animationClip: 'clap',
    handPose: { fingers: [1, 1, 1, 1, 1], orientation: 'up' },
    icon: '😊',
  },
};

// Get sign by gloss
export function getSignByGloss(gloss: string): ISLSign | undefined {
  return ISL_SIGNS[gloss.toUpperCase()];
}

// Get sign by ID
export function getSignById(id: string): ISLSign | undefined {
  return Object.values(ISL_SIGNS).find(s => s.id === id);
}

// Get all signs as array
export function getAllSigns(): ISLSign[] {
  return Object.values(ISL_SIGNS);
}

// Get animation clip for a gloss
export function getAnimationClip(gloss: string): string | undefined {
  const sign = getSignByGloss(gloss);
  return sign?.animationClip;
}

// Check if a sign exists
export function signExists(gloss: string): boolean {
  return !!ISL_SIGNS[gloss.toUpperCase()];
}