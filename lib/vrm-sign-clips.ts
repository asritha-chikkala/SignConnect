/**
 * Procedural AnimationClips for VRM humanoid bones (Mixamo-style semantics, no external FBX required).
 * Clips target normalized bone nodes by stable UUID paths so THREE.AnimationMixer can resolve them.
 */

import * as THREE from "three";
import type { VRM } from "@pixiv/three-vrm";
import { VRMHumanBoneName } from "@pixiv/three-vrm";
import type { SignClipId } from "@/lib/gloss-sign-plan";

function quatTrack(node: THREE.Object3D, times: number[], rotations: THREE.Quaternion[]): THREE.QuaternionKeyframeTrack {
  const values: number[] = [];
  for (const q of rotations) {
    values.push(q.x, q.y, q.z, q.w);
  }
  return new THREE.QuaternionKeyframeTrack(`${node.uuid}.quaternion`, times, values);
}

function makeClip(name: string, duration: number, tracks: THREE.KeyframeTrack[]): THREE.AnimationClip {
  return new THREE.AnimationClip(name, duration, tracks);
}

function mulQuat(base: THREE.Quaternion, deltaEuler: THREE.Euler): THREE.Quaternion {
  const dq = new THREE.Quaternion().setFromEuler(deltaEuler);
  return base.clone().multiply(dq);
}

export function buildProceduralVrmClipLibrary(vrm: VRM): Map<SignClipId, THREE.AnimationClip> {
  const out = new Map<SignClipId, THREE.AnimationClip>();
  const h = vrm.humanoid;
  if (!h) return out;

  const bone = (name: (typeof VRMHumanBoneName)[keyof typeof VRMHumanBoneName]) => h.getNormalizedBoneNode(name);

  const leftLower = bone(VRMHumanBoneName.LeftLowerArm);
  const leftUpper = bone(VRMHumanBoneName.LeftUpperArm);
  const rightLower = bone(VRMHumanBoneName.RightLowerArm);
  const rightUpper = bone(VRMHumanBoneName.RightUpperArm);
  const rightHand = bone(VRMHumanBoneName.RightHand);
  const leftHand = bone(VRMHumanBoneName.LeftHand);
  const head = bone(VRMHumanBoneName.Head);
  const chest = bone(VRMHumanBoneName.Chest) ?? bone(VRMHumanBoneName.Spine);

  if (leftLower && leftUpper) {
    const q0 = leftLower.quaternion.clone();
    const t = [0, 0.35, 0.7, 1.05, 1.4];
    const r = [
      q0.clone(),
      mulQuat(q0, new THREE.Euler(0.9, 0.2, 0.35, "YXZ")),
      mulQuat(q0, new THREE.Euler(0.15, 0.05, -0.1, "YXZ")),
      mulQuat(q0, new THREE.Euler(0.85, 0.15, 0.3, "YXZ")),
      q0.clone(),
    ];
    out.set("wave", makeClip("wave", t[t.length - 1], [quatTrack(leftLower, t, r)]));
  }

  if (rightLower && rightUpper) {
    const q0 = rightLower.quaternion.clone();
    const t = [0, 0.45, 0.9];
    const r = [q0.clone(), mulQuat(q0, new THREE.Euler(-0.2, -0.35, 0.85, "YXZ")), q0.clone()];
    out.set("point", makeClip("point", t[t.length - 1], [quatTrack(rightLower, t, r)]));
  }

  if (rightLower) {
    const q0 = rightLower.quaternion.clone();
    const t = [0, 0.25, 0.5, 0.75, 1];
    const r = [
      q0.clone(),
      mulQuat(q0, new THREE.Euler(-0.5, 0.4, 0.2, "YXZ")),
      mulQuat(q0, new THREE.Euler(-0.35, 0.55, 0.15, "YXZ")),
      mulQuat(q0, new THREE.Euler(-0.5, 0.35, 0.2, "YXZ")),
      q0.clone(),
    ];
    out.set("come_here", makeClip("come_here", 1, [quatTrack(rightLower, t, r)]));
  }

  if (rightLower && rightHand) {
    const q0 = rightLower.quaternion.clone();
    const qh0 = rightHand.quaternion.clone();
    const t = [0, 0.4, 0.8];
    const r = [q0.clone(), mulQuat(q0, new THREE.Euler(-0.1, -0.2, 0.45, "YXZ")), q0.clone()];
    const rh = [
      qh0.clone(),
      mulQuat(qh0, new THREE.Euler(0.25, 0.1, 0.35, "YXZ")),
      qh0.clone(),
    ];
    out.set("thumbs_up", makeClip("thumbs_up", t[t.length - 1], [quatTrack(rightLower, t, r), quatTrack(rightHand, t, rh)]));
  }

  if (leftLower && rightLower) {
    const ql0 = leftLower.quaternion.clone();
    const qr0 = rightLower.quaternion.clone();
    const t = [0, 0.35, 0.7];
    const rl = [ql0.clone(), mulQuat(ql0, new THREE.Euler(0.75, 0.1, -0.5, "YXZ")), ql0.clone()];
    const rr = [qr0.clone(), mulQuat(qr0, new THREE.Euler(0.75, -0.1, 0.5, "YXZ")), qr0.clone()];
    out.set("stop", makeClip("stop", 0.7, [quatTrack(leftLower, t, rl), quatTrack(rightLower, t, rr)]));
  }

  if (rightLower && rightHand) {
    const q0 = rightLower.quaternion.clone();
    const qh0 = rightHand.quaternion.clone();
    const t = [0, 0.3, 0.6, 0.9];
    const r = [
      q0.clone(),
      mulQuat(q0, new THREE.Euler(-0.35, -0.5, 0.55, "YXZ")),
      mulQuat(q0, new THREE.Euler(-0.25, -0.45, 0.45, "YXZ")),
      q0.clone(),
    ];
    const rh = [
      qh0.clone(),
      mulQuat(qh0, new THREE.Euler(0.15, 0.05, 0.2, "YXZ")),
      mulQuat(qh0, new THREE.Euler(0.2, 0.1, 0.25, "YXZ")),
      qh0.clone(),
    ];
    out.set("phone_call", makeClip("phone_call", 0.9, [quatTrack(rightLower, t, r), quatTrack(rightHand, t, rh)]));
  }

  if (rightUpper && rightLower) {
    const qu0 = rightUpper.quaternion.clone();
    const ql0 = rightLower.quaternion.clone();
    const t = [0, 0.35, 0.7];
    const ru = [qu0.clone(), mulQuat(qu0, new THREE.Euler(-0.05, 0.05, -1.25, "YXZ")), qu0.clone()];
    const rl = [ql0.clone(), mulQuat(ql0, new THREE.Euler(-0.1, 0.1, 0.15, "YXZ")), ql0.clone()];
    out.set("raise_hand", makeClip("raise_hand", 0.7, [quatTrack(rightUpper, t, ru), quatTrack(rightLower, t, rl)]));
  }

  if (head) {
    const q0 = head.quaternion.clone();
    const t = [0, 0.25, 0.5, 0.75, 1];
    const r = [
      q0.clone(),
      mulQuat(q0, new THREE.Euler(0.18, 0.05, 0, "YXZ")),
      mulQuat(q0, new THREE.Euler(-0.05, 0, 0, "YXZ")),
      mulQuat(q0, new THREE.Euler(0.18, 0.05, 0, "YXZ")),
      q0.clone(),
    ];
    out.set("nod_yes", makeClip("nod_yes", 1, [quatTrack(head, t, r)]));
  }

  if (head) {
    const q0 = head.quaternion.clone();
    const t = [0, 0.22, 0.44, 0.66, 0.88];
    const r = [
      q0.clone(),
      mulQuat(q0, new THREE.Euler(0.05, 0.22, 0, "YXZ")),
      mulQuat(q0, new THREE.Euler(0.05, -0.22, 0, "YXZ")),
      mulQuat(q0, new THREE.Euler(0.05, 0.18, 0, "YXZ")),
      q0.clone(),
    ];
    out.set("shake_no", makeClip("shake_no", 0.88, [quatTrack(head, t, r)]));
  }

  if (chest && head) {
    const qc0 = chest.quaternion.clone();
    const qh0 = head.quaternion.clone();
    const t = [0, 0.45, 0.9];
    const rc = [qc0.clone(), mulQuat(qc0, new THREE.Euler(0.35, 0, 0.12, "YXZ")), qc0.clone()];
    const rh = [qh0.clone(), mulQuat(qh0, new THREE.Euler(0.25, 0, 0, "YXZ")), qh0.clone()];
    out.set("bow_thanks", makeClip("bow_thanks", 0.9, [quatTrack(chest, t, rc), quatTrack(head, t, rh)]));
  }

  if (leftLower && rightLower) {
    const ql0 = leftLower.quaternion.clone();
    const qr0 = rightLower.quaternion.clone();
    const t = [0, 0.15, 0.3, 0.45, 0.6];
    const rl = [
      ql0.clone(),
      mulQuat(ql0, new THREE.Euler(0.4, 0, -0.35, "YXZ")),
      mulQuat(ql0, new THREE.Euler(0.1, 0, -0.1, "YXZ")),
      mulQuat(ql0, new THREE.Euler(0.4, 0, -0.35, "YXZ")),
      ql0.clone(),
    ];
    const rr = [
      qr0.clone(),
      mulQuat(qr0, new THREE.Euler(0.4, 0, 0.35, "YXZ")),
      mulQuat(qr0, new THREE.Euler(0.1, 0, 0.1, "YXZ")),
      mulQuat(qr0, new THREE.Euler(0.4, 0, 0.35, "YXZ")),
      qr0.clone(),
    ];
    out.set("clap", makeClip("clap", 0.6, [quatTrack(leftLower, t, rl), quatTrack(rightLower, t, rr)]));
  }

  if (rightHand && head) {
    const qh0 = rightHand.quaternion.clone();
    const qhd0 = head.quaternion.clone();
    const t = [0, 0.5, 1];
    const rh = [qh0.clone(), mulQuat(qh0, new THREE.Euler(0.15, 0.2, 0.25, "YXZ")), qh0.clone()];
    const hd = [qhd0.clone(), mulQuat(qhd0, new THREE.Euler(0.12, -0.15, 0, "YXZ")), qhd0.clone()];
    out.set("think", makeClip("think", 1, [quatTrack(rightHand, t, rh), quatTrack(head, t, hd)]));
  }

  if (head) {
    const q0 = head.quaternion.clone();
    const t = [0, 0.35, 0.7];
    const r = [q0.clone(), mulQuat(q0, new THREE.Euler(0.05, 0.45, 0, "YXZ")), q0.clone()];
    out.set("look_around", makeClip("look_around", 0.7, [quatTrack(head, t, r)]));
  }

  if (leftLower && rightLower) {
    const ql0 = leftLower.quaternion.clone();
    const qr0 = rightLower.quaternion.clone();
    const t = [0, 0.45, 0.9];
    const rl = [ql0.clone(), mulQuat(ql0, new THREE.Euler(0.55, 0.35, -0.55, "YXZ")), ql0.clone()];
    const rr = [qr0.clone(), mulQuat(qr0, new THREE.Euler(0.55, -0.35, 0.55, "YXZ")), qr0.clone()];
    out.set("heart", makeClip("heart", 0.9, [quatTrack(leftLower, t, rl), quatTrack(rightLower, t, rr)]));
  }

  if (leftLower && rightLower) {
    const ql0 = leftLower.quaternion.clone();
    const qr0 = rightLower.quaternion.clone();
    const t = [0, 0.5, 1];
    const rl = [ql0.clone(), mulQuat(ql0, new THREE.Euler(0.2, 0.1, -0.35, "YXZ")), ql0.clone()];
    const rr = [qr0.clone(), mulQuat(qr0, new THREE.Euler(0.2, -0.1, 0.35, "YXZ")), qr0.clone()];
    out.set("pray", makeClip("pray", 1, [quatTrack(leftLower, t, rl), quatTrack(rightLower, t, rr)]));
  }

  if (chest) {
    const q0 = chest.quaternion.clone();
    const t = [0, 0.4, 0.8];
    const r = [q0.clone(), mulQuat(q0, new THREE.Euler(0.08, 0.12, 0.06, "YXZ")), q0.clone()];
    out.set("walk", makeClip("walk", 0.8, [quatTrack(chest, t, r)]));
  }

  if (chest) {
    const q0 = chest.quaternion.clone();
    const t = [0, 0.6, 1.1];
    const r = [q0.clone(), mulQuat(q0, new THREE.Euler(-0.18, 0, 0, "YXZ")), mulQuat(q0, new THREE.Euler(-0.25, 0, 0, "YXZ"))];
    out.set("sit", makeClip("sit", 1.1, [quatTrack(chest, t, r)]));
  }

  if (rightHand) {
    const qh0 = rightHand.quaternion.clone();
    const t = [0, 0.35, 0.7];
    const rh = [qh0.clone(), mulQuat(qh0, new THREE.Euler(0.35, 0.1, 0.2, "YXZ")), qh0.clone()];
    out.set("eat", makeClip("eat", 0.7, [quatTrack(rightHand, t, rh)]));
  }

  if (rightLower) {
    const q0 = rightLower.quaternion.clone();
    const t = [0, 0.35, 0.7];
    const r = [q0.clone(), mulQuat(q0, new THREE.Euler(-0.15, -0.25, 0.55, "YXZ")), q0.clone()];
    out.set("drink", makeClip("drink", 0.7, [quatTrack(rightLower, t, r)]));
  }

  if (head && rightHand) {
    const qh0 = head.quaternion.clone();
    const qr0 = rightHand.quaternion.clone();
    const t = [0, 0.6, 1.2];
    const h = [qh0.clone(), mulQuat(qh0, new THREE.Euler(0.12, 0.08, 0.1, "YXZ")), mulQuat(qh0, new THREE.Euler(0.2, 0, 0, "YXZ"))];
    const rh = [qr0.clone(), mulQuat(qr0, new THREE.Euler(0.05, 0.1, 0.15, "YXZ")), qr0.clone()];
    out.set("sleep", makeClip("sleep", 1.2, [quatTrack(head, t, h), quatTrack(rightHand, t, rh)]));
  }

  if (rightLower) {
    const q0 = rightLower.quaternion.clone();
    const t = [0, 0.35, 0.7];
    const r = [q0.clone(), mulQuat(q0, new THREE.Euler(-0.35, 0.15, 0.45, "YXZ")), q0.clone()];
    out.set("hurt", makeClip("hurt", 0.7, [quatTrack(rightLower, t, r)]));
  }

  out.set("idle", new THREE.AnimationClip("idle", 0.001, []));

  return out;
}

/**
 * Short procedural clip for one fingerspelled character: varies wrist pose by letter index so A–Z are visually distinct.
 * This is a demo approximation, not linguistically accurate ISL hand shapes — replace with mocap clips per letter to expand.
 */
export function buildFingerSpellClip(vrm: VRM, letter: string): THREE.AnimationClip | null {
  const h = vrm.humanoid;
  if (!h) return null;
  const rightLower = h.getNormalizedBoneNode(VRMHumanBoneName.RightLowerArm);
  const rightHand = h.getNormalizedBoneNode(VRMHumanBoneName.RightHand);
  if (!rightLower) return null;

  const code = letter.toUpperCase().charCodeAt(0);
  const idx = code >= 48 && code <= 57 ? code - 48 + 26 : code >= 65 && code <= 90 ? code - 65 : (code % 36) / 36;
  const yaw = (idx / 35 - 0.5) * 1.1;
  const pitch = 0.25 + (idx % 7) * 0.04;

  const q0 = rightLower.quaternion.clone();
  const q1 = mulQuat(q0, new THREE.Euler(pitch, yaw, 0.15, "YXZ"));
  const tracks: THREE.KeyframeTrack[] = [quatTrack(rightLower, [0, 0.12, 0.28, 0.42], [q0, q1, q1, q0])];

  if (rightHand) {
    const qh0 = rightHand.quaternion.clone();
    const qh1 = mulQuat(qh0, new THREE.Euler(0.08 + idx * 0.01, 0.05, 0.12, "YXZ"));
    tracks.push(quatTrack(rightHand, [0, 0.12, 0.28, 0.42], [qh0, qh1, qh1, qh0]));
  }

  return makeClip(`spell_${letter}`, 0.42, tracks);
}

export function mergeGlbEmbeddedClips(gltf: { animations?: THREE.AnimationClip[] }): Map<string, THREE.AnimationClip> {
  const map = new Map<string, THREE.AnimationClip>();
  for (const clip of gltf.animations ?? []) {
    map.set(clip.name.toLowerCase().replace(/\s+/g, "_"), clip);
  }
  return map;
}
