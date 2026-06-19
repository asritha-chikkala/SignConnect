// lib/standard-isl-animations.ts
// Standard Indian Sign Language (ISLRTC National Curriculum) Animation Definitions

import * as THREE from "three";
import type { VRM } from "@pixiv/three-vrm";
import { VRMHumanBoneName } from "@pixiv/three-vrm";

export type ISLAnimationType = 
  | "wave" | "handToChin" | "chestCircle" | "fistChest" | "pushUp" 
  | "crossChest" | "wristTap" | "urgentPump" | "fistNod" | "handSweep"
  | "templeToChest" | "raisedPalm" | "pointChest" | "pointForward" 
  | "interlockArms" | "chinTouch" | "foreheadTouch" | "pointAway"
  | "pullToward" | "pullChest" | "tapChest" | "indexTwist" | "pointSideToSide"
  | "tapWrist" | "foreheadToOut" | "interlockRotate" | "chestTap" 
  | "chinToForward" | "chinToBack" | "downwardFist" | "number1" | "number2"
  | "number3" | "number4" | "number5" | "circleArms" | "openHand"
  | "flatHandPalm" | "indexPoint" | "thumbUp" | "thumbDown" | "clap"
  | "pointIndex" | "heartShape" | "prayHands" | "eatSign" | "drinkSign"
  | "sleepSign" | "walkSign" | "sitSign" | "standSign" | "callSign"
  // Added missing types
  | "handToMouth"
  | "touchArea"
  | "flashingMotion"
  | "flickMotion"
  | "badgeTap"
  | "thumbSweep"
  | "circularMotion"
  | "slowMotion"
  | "fastMotion"
  | "pointSide"
  | "brotherSign"
  | "sisterSign"
  | "childSign"
  | "interlockIndex"
  | "giveMotion"
  | "takeMotion"
  | "forwardWave"
  | "morningSign"
  | "nightSign"
  | "weekSign"
  | "monthSign"
  | "yearSign"
  | "number0"
  | "number6"
  | "number7"
  | "number8"
  | "number9"
  | "number10"
  | "sadFace"
  | "angryClaw"
  | "tiredSign"
  | "pointDown"
  | "pointDistance"
  | "insideSign"
  | "outsideSign"
  | "upSign"
  | "downSign"
  | "leftSign"
  | "rightSign";

export interface ISLAnimationDefinition {
  type: ISLAnimationType;
  duration: number;
  armAngle?: number;
  handShape?: "open" | "fist" | "index" | "flat" | "curved" | "thumbUp" | "ok";
  twoHanded?: boolean;
  urgency?: boolean;
  description: string;
}

// Standard ISL Animation Definitions (ISLRTC National Curriculum)
export const STANDARD_ISL_ANIMATIONS: Record<string, ISLAnimationDefinition> = {
  // Greetings & Politeness
  "HELLO": { type: "wave", duration: 1.2, armAngle: 45, handShape: "open", twoHanded: false, description: "Wave hand near forehead" },
  "HI": { type: "wave", duration: 0.8, armAngle: 40, handShape: "open", description: "Quick wave greeting" },
  "WELCOME": { type: "openHand", duration: 1.0, handShape: "open", twoHanded: true, description: "Open hands pulling toward body" },
  "THANK": { type: "handToChin", duration: 1.0, armAngle: 30, handShape: "flat", description: "Hand from chin outward" },
  "THANKS": { type: "handToChin", duration: 0.9, armAngle: 30, handShape: "flat", description: "Quick thank you" },
  "PLEASE": { type: "chestCircle", duration: 1.1, handShape: "flat", description: "Circular motion on chest" },
  "SORRY": { type: "fistChest", duration: 0.9, handShape: "fist", description: "Fist on chest, circular motion" },
  
  // Emergency & Medical
  "HELP": { type: "pushUp", duration: 1.3, handShape: "flat", twoHanded: false, urgency: true, description: "One hand pushing up on other palm" },
  "HOSPITAL": { type: "crossChest", duration: 1.2, handShape: "flat", description: "Cross on chest (red cross gesture)" },
  "DOCTOR": { type: "wristTap", duration: 1.0, handShape: "index", description: "Tap wrist (pulse point)" },
  "MEDICINE": { type: "handToMouth", duration: 1.1, handShape: "curved", description: "Hand to mouth, then fist" },
  "PAIN": { type: "touchArea", duration: 1.0, handShape: "index", description: "Touch affected area with pointed finger" },
  "HURT": { type: "touchArea", duration: 0.9, handShape: "index", description: "Touch area of pain" },
  "EMERGENCY": { type: "urgentPump", duration: 1.5, handShape: "fist", urgency: true, description: "Repeated fist pump" },
  "AMBULANCE": { type: "flashingMotion", duration: 1.4, handShape: "flat", description: "Flashing hand motion (like lights)" },
  "FIRE": { type: "flickMotion", duration: 1.2, handShape: "open", urgency: true, description: "Flicking motion representing flames" },
  "POLICE": { type: "badgeTap", duration: 1.1, handShape: "flat", description: "Tap chest (badge area)" },
  
  // Basic Communication
  "YES": { type: "fistNod", duration: 0.8, handShape: "fist", description: "Nodding fist" },
  "NO": { type: "handSweep", duration: 0.8, handShape: "flat", description: "Head shake + hand wave" },
  "UNDERSTAND": { type: "templeToChest", duration: 1.0, handShape: "index", description: "Point to temple, then down" },
  "NOT": { type: "thumbSweep", duration: 0.7, handShape: "thumbUp", description: "Thumb sweep indicating negation" },
  "WAIT": { type: "raisedPalm", duration: 0.9, handShape: "flat", description: "Raised palm facing out" },
  "AGAIN": { type: "circularMotion", duration: 0.8, handShape: "index", description: "Circular hand motion" },
  "SLOW": { type: "slowMotion", duration: 1.0, handShape: "flat", description: "Hand moving slowly downward" },
  "FAST": { type: "fastMotion", duration: 0.7, handShape: "flat", description: "Quick hand movement" },
  
  // People & Relations
  "ME": { type: "pointChest", duration: 0.7, handShape: "index", description: "Point to chest" },
  "I": { type: "pointChest", duration: 0.7, handShape: "index", description: "Point to chest" },
  "YOU": { type: "pointForward", duration: 0.7, handShape: "index", description: "Point forward" },
  "WE": { type: "circleArms", duration: 0.9, handShape: "open", twoHanded: true, description: "Circle arm including others" },
  "THEY": { type: "pointSide", duration: 0.8, handShape: "index", description: "Point to side" },
  "FAMILY": { type: "interlockArms", duration: 1.2, handShape: "open", twoHanded: true, description: "Interlocked arms" },
  "MOTHER": { type: "chinTouch", duration: 0.9, handShape: "open", description: "Open hand on chin" },
  "FATHER": { type: "foreheadTouch", duration: 0.9, handShape: "open", description: "Open hand on forehead" },
  "BROTHER": { type: "brotherSign", duration: 1.0, handShape: "index", description: "Combination of male + sibling" },
  "SISTER": { type: "sisterSign", duration: 1.0, handShape: "index", description: "Combination of female + sibling" },
  "CHILD": { type: "childSign", duration: 0.8, handShape: "flat", description: "Patting motion at waist height" },
  "FRIEND": { type: "interlockIndex", duration: 1.1, handShape: "index", twoHanded: true, description: "Interlocked index fingers" },
  
  // Actions & Requests
  "GO": { type: "pointAway", duration: 0.8, handShape: "index", description: "Point forward, move hand away" },
  "COME": { type: "pullToward", duration: 0.9, handShape: "index", description: "Pulling motion toward body" },
  "WANT": { type: "pullChest", duration: 0.9, handShape: "curved", description: "Pull hand toward chest" },
  "NEED": { type: "tapChest", duration: 0.9, handShape: "flat", description: "Tap chest repeatedly" },
  "HAVE": { type: "flatHandPalm", duration: 0.8, handShape: "flat", description: "Flat hand showing possession" },
  "GIVE": { type: "giveMotion", duration: 0.8, handShape: "open", description: "Hand moving from chest outward" },
  "TAKE": { type: "takeMotion", duration: 0.8, handShape: "curved", description: "Grasping motion toward body" },
  "SIT": { type: "sitSign", duration: 0.9, handShape: "index", twoHanded: true, description: "Two fingers pointing down" },
  "STAND": { type: "standSign", duration: 0.9, handShape: "flat", description: "Flat hand moving up" },
  "WALK": { type: "walkSign", duration: 1.0, handShape: "index", twoHanded: true, description: "Walking finger motion" },
  "EAT": { type: "eatSign", duration: 0.8, handShape: "curved", description: "Hand to mouth motion" },
  "DRINK": { type: "drinkSign", duration: 0.7, handShape: "curved", description: "Drinking motion" },
  "SLEEP": { type: "sleepSign", duration: 1.1, handShape: "flat", description: "Hand on cheek, tilted head" },
  
  // Questions (ISL specific word order)
  "WHAT": { type: "indexTwist", duration: 0.8, handShape: "index", description: "Raised index finger, twist" },
  "WHERE": { type: "pointSideToSide", duration: 0.9, handShape: "index", description: "Pointing finger moving side to side" },
  "WHEN": { type: "tapWrist", duration: 0.9, handShape: "index", description: "Index finger tapping wrist (watch area)" },
  "WHY": { type: "foreheadToOut", duration: 0.9, handShape: "open", description: "Fingers from forehead outward" },
  "HOW": { type: "interlockRotate", duration: 1.0, handShape: "open", twoHanded: true, description: "Interlocked fingers rotating" },
  "WHO": { type: "thumbUp", duration: 0.8, handShape: "thumbUp", description: "Pointing thumb over shoulder" },
  "WHICH": { type: "pointIndex", duration: 1.0, handShape: "index", description: "Alternating pointing between options" },
  
  // Time
  "TODAY": { type: "chestTap", duration: 0.8, handShape: "flat", description: "Hand taps chest" },
  "TOMORROW": { type: "chinToForward", duration: 0.9, handShape: "flat", description: "Hand moves forward from chin" },
  "YESTERDAY": { type: "chinToBack", duration: 0.9, handShape: "flat", description: "Hand moves backward from chin" },
  "NOW": { type: "downwardFist", duration: 0.7, handShape: "fist", description: "Downward fist motion" },
  "LATER": { type: "forwardWave", duration: 0.8, handShape: "open", description: "Hand moves forward with wave" },
  "MORNING": { type: "morningSign", duration: 0.9, handShape: "open", description: "Hand rising like sun" },
  "NIGHT": { type: "nightSign", duration: 0.9, handShape: "flat", description: "Hand lowering like dark" },
  "WEEK": { type: "weekSign", duration: 0.8, handShape: "index", description: "Finger tracing week" },
  "MONTH": { type: "monthSign", duration: 0.8, handShape: "index", description: "Finger tracing month" },
  "YEAR": { type: "yearSign", duration: 0.8, handShape: "fist", description: "Fist circling" },
  
  // Numbers (Standard ISL) - FIXED handShape values
  "0": { type: "number0", duration: 0.5, handShape: "ok", description: "Zero/O sign" },
  "1": { type: "number1", duration: 0.5, handShape: "index", description: "One - raised index finger" },
  "2": { type: "number2", duration: 0.5, handShape: "index", description: "Two - index and middle" },
  "3": { type: "number3", duration: 0.5, handShape: "index", description: "Three - thumb, index, middle" },
  "4": { type: "number4", duration: 0.5, handShape: "open", description: "Four - four fingers up" },
  "5": { type: "number5", duration: 0.5, handShape: "open", description: "Five - all fingers spread" },
  "6": { type: "number6", duration: 0.5, handShape: "thumbUp", description: "Six - thumb and pinky" },
  "7": { type: "number7", duration: 0.5, handShape: "thumbUp", description: "Seven - thumb and index" },
  "8": { type: "number8", duration: 0.5, handShape: "thumbUp", description: "Eight - thumb and middle" },
  "9": { type: "number9", duration: 0.5, handShape: "curved", description: "Nine - curled index" },
  "10": { type: "number10", duration: 0.5, handShape: "fist", description: "Ten - shake L shape" },
  
  // Emotions
  "HAPPY": { type: "clap", duration: 0.9, handShape: "open", twoHanded: true, description: "Gentle clap with smile" },
  "SAD": { type: "sadFace", duration: 1.0, handShape: "open", description: "Hand sliding down face" },
  "ANGRY": { type: "angryClaw", duration: 0.9, handShape: "fist", description: "Claw hand shake" },
  "SCARED": { type: "chestTap", duration: 0.8, handShape: "flat", description: "Tapping chest with wide eyes" },
  "TIRED": { type: "tiredSign", duration: 1.0, handShape: "flat", description: "Hands lowering, body slumping" },
  "LOVE": { type: "heartShape", duration: 1.2, handShape: "open", twoHanded: true, description: "Heart shape over chest" },
  
  // Direction & Location
  "HERE": { type: "pointDown", duration: 0.6, handShape: "index", description: "Point down to ground" },
  "THERE": { type: "pointDistance", duration: 0.7, handShape: "index", description: "Point to distance" },
  "INSIDE": { type: "insideSign", duration: 0.8, handShape: "open", description: "Hand going into other" },
  "OUTSIDE": { type: "outsideSign", duration: 0.8, handShape: "open", description: "Hand moving outward" },
  "UP": { type: "upSign", duration: 0.6, handShape: "index", description: "Finger pointing up" },
  "DOWN": { type: "downSign", duration: 0.6, handShape: "index", description: "Finger pointing down" },
  "LEFT": { type: "leftSign", duration: 0.6, handShape: "index", description: "Point to left" },
  "RIGHT": { type: "rightSign", duration: 0.6, handShape: "index", description: "Point to right" },
};

// Map English words to Standard ISL gloss
export const ENGLISH_TO_ISL_GLOSS: Record<string, string[]> = {
  // Common replacements
  "hello": ["HELLO"],
  "hi": ["HELLO"],
  "hey": ["HELLO"],
  "goodbye": ["GOODBYE"],
  "bye": ["GOODBYE"],
  "thank": ["THANK"],
  "thanks": ["THANK"],
  "please": ["PLEASE"],
  "sorry": ["SORRY"],
  
  // Emergency
  "help": ["HELP"],
  "hospital": ["HOSPITAL"],
  "doctor": ["DOCTOR"],
  "medicine": ["MEDICINE"],
  "pain": ["PAIN"],
  "hurt": ["PAIN"],
  "emergency": ["EMERGENCY"],
  "ambulance": ["AMBULANCE"],
  "fire": ["FIRE"],
  "police": ["POLICE"],
  
  // Communication
  "yes": ["YES"],
  "yeah": ["YES"],
  "no": ["NO"],
  "understand": ["UNDERSTAND"],
  "wait": ["WAIT"],
  "again": ["AGAIN"],
  "slow": ["SLOW"],
  "fast": ["FAST"],
  
  // People
  "i": ["ME"],
  "me": ["ME"],
  "my": ["ME"],
  "you": ["YOU"],
  "your": ["YOU"],
  "we": ["WE"],
  "they": ["THEY"],
  "family": ["FAMILY"],
  "mother": ["MOTHER"],
  "mom": ["MOTHER"],
  "father": ["FATHER"],
  "dad": ["FATHER"],
  "child": ["CHILD"],
  "friend": ["FRIEND"],
  
  // Actions
  "go": ["GO"],
  "come": ["COME"],
  "want": ["WANT"],
  "need": ["NEED"],
  "have": ["HAVE"],
  "give": ["GIVE"],
  "take": ["TAKE"],
  "sit": ["SIT"],
  "stand": ["STAND"],
  "walk": ["WALK"],
  "eat": ["EAT"],
  "drink": ["DRINK"],
  "sleep": ["SLEEP"],
  
  // Questions
  "what": ["WHAT"],
  "where": ["WHERE"],
  "when": ["WHEN"],
  "why": ["WHY"],
  "how": ["HOW"],
  "who": ["WHO"],
  
  // Time
  "today": ["TODAY"],
  "tomorrow": ["TOMORROW"],
  "yesterday": ["YESTERDAY"],
  "now": ["NOW"],
  "later": ["LATER"],
  "morning": ["MORNING"],
  "night": ["NIGHT"],
  "week": ["WEEK"],
  "month": ["MONTH"],
  "year": ["YEAR"],
  
  // Emotions
  "happy": ["HAPPY"],
  "glad": ["HAPPY"],
  "sad": ["SAD"],
  "angry": ["ANGRY"],
  "mad": ["ANGRY"],
  "scared": ["SCARED"],
  "afraid": ["SCARED"],
  "tired": ["TIRED"],
  "love": ["LOVE"],
  
  // Direction
  "here": ["HERE"],
  "there": ["THERE"],
  "inside": ["INSIDE"],
  "outside": ["OUTSIDE"],
  "up": ["UP"],
  "down": ["DOWN"],
  "left": ["LEFT"],
  "right": ["RIGHT"],
};

// Get animation for a gloss token
export function getAnimationForGloss(gloss: string): ISLAnimationDefinition | undefined {
  return STANDARD_ISL_ANIMATIONS[gloss];
}

// Check if a gloss has a defined animation
export function hasAnimation(gloss: string): boolean {
  return gloss in STANDARD_ISL_ANIMATIONS;
}

// Get all available glosses with animations
export function getAllAnimatedGlosses(): string[] {
  return Object.keys(STANDARD_ISL_ANIMATIONS);
}