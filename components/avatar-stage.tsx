"use client";

/**
 * AvatarStage — VRM-first 3D avatar with THREE.AnimationMixer-driven sign clips.
 *
 * Pipeline: English → gloss (parent) → buildSignPlanFromGloss → procedural clips on VRM humanoid bones.
 * Fingerspelling: per-letter clips (wrist pose variation — expand with real hand-shape mocap later).
 * Fallback: optional GLB (NEXT_PUBLIC_GLTF_FALLBACK_URL) with embedded animations; no decorative robot mesh.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, type VRM } from "@pixiv/three-vrm";
import { SENTIMENT_THEME, type Sentiment } from "@/lib/utils";
import { buildFingerSpellClip, buildProceduralVrmClipLibrary, mergeGlbEmbeddedClips } from "@/lib/vrm-sign-clips";
import { buildSignPlanFromGloss, describeStep, type AvatarHudState } from "@/lib/gloss-sign-plan";

export type AvatarStageProps = {
  sentiment: Sentiment;
  lowBandwidth: boolean;
  /** Gloss tokens from /api/translate — drives AnimationMixer sequence. */
  gloss?: string[];
  /**
   * Increment when you want the same gloss to play again (e.g. after each Translate click).
   * Otherwise React will not re-run the signing effect when gloss text is unchanged.
   */
  signReplayKey?: number;
  signingSpeed?: number;
  emergencyMode?: boolean;
  learningSlowMo?: number;
  learningMirror?: boolean;
  /** 0–1 hue shift for outfit/skin tint (demo). */
  appearanceHue?: number;
  highContrast?: boolean;
  avatarUrl?: string;
  onHudUpdate?: (state: AvatarHudState) => void;
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
  onLoadStatus?: (phase: "loading" | "ready" | "error", message?: string) => void;
};

import { deleteCachedModel, readCachedModel, writeCachedModel } from "@/lib/animation-idb-cache";

const bufferByUrl = new Map<string, Promise<ArrayBuffer>>();

/** VRM is a GLB container — must start with glTF magic (little-endian). */
function isBinaryGLB(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 12) return false;
  return new DataView(buffer).getUint32(0, true) === 0x46546c67;
}

async function fetchModelBuffer(modelUrl: string): Promise<ArrayBuffer> {
  const cached = bufferByUrl.get(modelUrl);
  if (cached) return cached;

  const promise = (async () => {
    const fromIdb = await readCachedModel(modelUrl);
    if (fromIdb) {
      if (isBinaryGLB(fromIdb)) return fromIdb;
      await deleteCachedModel(modelUrl);
    }

    const res = await fetch(modelUrl, { mode: "cors", cache: "force-cache" });
    if (!res.ok) throw new Error(`Model fetch failed: ${res.status} ${res.statusText} (${modelUrl})`);
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      throw new Error("Endpoint returned JSON instead of a binary model.");
    }
    const buf = await res.arrayBuffer();
    if (!isBinaryGLB(buf)) {
      throw new Error(`Response is not a GLB/VRM binary (${modelUrl}).`);
    }
    void writeCachedModel(modelUrl, buf);
    return buf;
  })();

  bufferByUrl.set(modelUrl, promise);
  promise.catch(() => {
    bufferByUrl.delete(modelUrl);
  });
  return promise;
}

function vrmModelUrls(customUrl?: string): string[] {
  const fromEnv = process.env.NEXT_PUBLIC_VRM_MODEL_URL?.trim();
  const urls: string[] = [];
  
  if (customUrl && customUrl.trim() !== "") {
    urls.push(customUrl);
  }
  
  if (fromEnv && fromEnv.trim() !== "") {
    urls.push(fromEnv);
  }
  
  urls.push("/avatars/default.vrm");
  urls.push("/avatars/male-professional.vrm");
  urls.push("/avatars/female-professional.vrm");
  urls.push("/avatars/female-casual.vrm");
  
  return [...new Set(urls)];
}

function sentimentLightColors(sentiment: Sentiment): {
  key: number;
  fill: number;
  rim: number;
  back: number;
} {
  switch (sentiment) {
    case "urgent":
      return { key: 0xffe0e8, fill: 0xff6b6b, rim: 0xff3355, back: 0xff8899 };
    case "happy":
      return { key: 0xfff6dd, fill: 0xa7f3d0, rim: 0xc4b5fd, back: 0xfbcfe8 };
    case "question":
      return { key: 0xe8f4ff, fill: 0x7dd3fc, rim: 0x60a5fa, back: 0x93c5fd };
    default:
      return { key: 0xffffff, fill: 0x4466ff, rim: 0x00e5ff, back: 0xff66cc };
  }
}

function tintVrmMaterials(root: THREE.Object3D, sentiment: Sentiment, intensity: number) {
  const emissiveBySentiment: Record<Sentiment, THREE.Color> = {
    urgent: new THREE.Color(0xff6b6b),
    happy: new THREE.Color(0xa7f3d0),
    question: new THREE.Color(0x7dd3fc),
    neutral: new THREE.Color(0x22d3ee),
  };
  const emissive = emissiveBySentiment[sentiment] ?? emissiveBySentiment.neutral;
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const mat = obj.material;
    const mats = Array.isArray(mat) ? mat : [mat];
    for (const m of mats) {
      if (m && "emissive" in m && m.emissive instanceof THREE.Color) {
        const t = Math.min(1, Math.max(0, intensity * 0.35));
        m.emissive.setRGB(0, 0, 0).lerp(emissive, t);
      }
    }
  });
}

function applyHueToMeshes(root: THREE.Object3D, hue01: number) {
  const hsl = { h: 0, s: 0, l: 0 };
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const mat = obj.material;
    const mats = Array.isArray(mat) ? mat : [mat];
    for (const m of mats) {
      if (m instanceof THREE.MeshStandardMaterial) {
        m.color.getHSL(hsl);
        m.color.setHSL((hsl.h + hue01) % 1, Math.min(1, hsl.s + 0.08), hsl.l);
      }
    }
  });
}

// ===== DEFAULT ATTENTION POSITION =====
function setDefaultAttentionPosition(root: THREE.Object3D) {
  // Try multiple common bone naming conventions
  const leftArm = root.getObjectByName('LeftArm') || 
                  root.getObjectByName('leftArm') || 
                  root.getObjectByName('Arm_L') || 
                  root.getObjectByName('J_Bip_L_UpperArm') ||
                  root.getObjectByName('J_Bip_LeftUpperArm') ||
                  root.getObjectByName('upperarm_l') ||
                  root.getObjectByName('L_UpperArm');
  
  const rightArm = root.getObjectByName('RightArm') || 
                   root.getObjectByName('rightArm') || 
                   root.getObjectByName('Arm_R') || 
                   root.getObjectByName('J_Bip_R_UpperArm') ||
                   root.getObjectByName('J_Bip_RightUpperArm') ||
                   root.getObjectByName('upperarm_r') ||
                   root.getObjectByName('R_UpperArm');
  
  const leftForearm = root.getObjectByName('LeftForearm') || 
                      root.getObjectByName('leftForearm') || 
                      root.getObjectByName('Forearm_L') || 
                      root.getObjectByName('J_Bip_L_LowerArm') ||
                      root.getObjectByName('J_Bip_LeftLowerArm') ||
                      root.getObjectByName('lowerarm_l') ||
                      root.getObjectByName('L_LowerArm');
  
  const rightForearm = root.getObjectByName('RightForearm') || 
                       root.getObjectByName('rightForearm') || 
                       root.getObjectByName('Forearm_R') || 
                       root.getObjectByName('J_Bip_R_LowerArm') ||
                       root.getObjectByName('J_Bip_RightLowerArm') ||
                       root.getObjectByName('lowerarm_r') ||
                       root.getObjectByName('R_LowerArm');
  
  const head = root.getObjectByName('Head') || 
               root.getObjectByName('head') || 
               root.getObjectByName('J_Bip_C_Head') ||
               root.getObjectByName('J_Bip_Head') ||
               root.getObjectByName('head_jnt');
  
  const spine = root.getObjectByName('Spine') || 
                root.getObjectByName('spine') || 
                root.getObjectByName('J_Bip_C_Spine') ||
                root.getObjectByName('J_Bip_Spine') ||
                root.getObjectByName('hips') ||
                root.getObjectByName('Hips');
  
  // Log what was found for debugging
  console.log('🔍 Bone search results:');
  console.log('  Left Arm:', leftArm ? '✅ Found' : '❌ Not found');
  console.log('  Right Arm:', rightArm ? '✅ Found' : '❌ Not found');
  console.log('  Left Forearm:', leftForearm ? '✅ Found' : '❌ Not found');
  console.log('  Right Forearm:', rightForearm ? '✅ Found' : '❌ Not found');
  console.log('  Head:', head ? '✅ Found' : '❌ Not found');
  console.log('  Spine:', spine ? '✅ Found' : '❌ Not found');
  
  // Set attention position - arms slightly forward, relaxed
  if (leftArm) {
    leftArm.rotation.z = 0.08;
    leftArm.rotation.x = -0.05;
    console.log('✅ Left arm position set');
  }
  if (rightArm) {
    rightArm.rotation.z = -0.08;
    rightArm.rotation.x = -0.05;
    console.log('✅ Right arm position set');
  }
  if (leftForearm) {
    leftForearm.rotation.x = 0.02;
    console.log('✅ Left forearm position set');
  }
  if (rightForearm) {
    rightForearm.rotation.x = 0.02;
    console.log('✅ Right forearm position set');
  }
  if (head) {
    head.rotation.x = 0.02;
    console.log('✅ Head position set');
  }
  if (spine) {
    spine.rotation.x = 0.01;
    console.log('✅ Spine position set');
  }
}

// ===== FACIAL EXPRESSIONS =====
function setFacialExpression(vrm: VRM, sentiment: Sentiment, intensity: number = 0.7) {
  if (!vrm.expressionManager) return;
  
  // Get available expression names from the VRM model
  const availableExpressions: string[] = [];
  try {
    const exprManager = vrm.expressionManager as any;
    if (exprManager._expressionMap) {
      for (const key of Object.keys(exprManager._expressionMap)) {
        availableExpressions.push(key);
      }
    }
  } catch (e) {
    // Fallback common expressions
    availableExpressions.push('happy', 'joy', 'angry', 'aa', 'oh', 'surprised', 'fun', 'blink', 'sad');
  }
  
  // Reset all expressions to 0 first
  for (const name of availableExpressions) {
    try {
      vrm.expressionManager.setValue(name, 0);
    } catch (e) {
      // Ignore
    }
  }
  
  // Map sentiment to expression values
  let expressionValues: { name: string; value: number }[] = [];
  
  switch (sentiment) {
    case 'happy':
      expressionValues = [
        { name: 'happy', value: intensity },
        { name: 'joy', value: intensity * 0.5 },
        { name: 'fun', value: intensity * 0.3 },
      ];
      break;
    case 'urgent':
      expressionValues = [
        { name: 'angry', value: intensity * 0.8 },
        { name: 'aa', value: intensity * 0.4 },
        { name: 'surprised', value: intensity * 0.3 },
      ];
      break;
    case 'question':
      expressionValues = [
        { name: 'oh', value: intensity * 0.6 },
        { name: 'aa', value: intensity * 0.3 },
        { name: 'surprised', value: intensity * 0.3 },
      ];
      break;
    case 'neutral':
    default:
      expressionValues = [];
      break;
  }
  
  // Apply expressions (only if they exist in the model)
  for (const expr of expressionValues) {
    try {
      if (availableExpressions.includes(expr.name)) {
        vrm.expressionManager.setValue(expr.name, expr.value);
      }
    } catch (e) {
      // Expression not supported, ignore
    }
  }
}

function findClipByName(clips: Map<string, THREE.AnimationClip>, token: string): THREE.AnimationClip | undefined {
  const t = token.toLowerCase();
  for (const [name, clip] of clips) {
    if (name.includes(t) || t.includes(name)) return clip;
  }
  return undefined;
}

async function delay(ms: number): Promise<void> {
  await new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export function AvatarStage({
  sentiment,
  lowBandwidth,
  gloss = [],
  signReplayKey = 0,
  signingSpeed = 1,
  emergencyMode = false,
  learningSlowMo = 1,
  learningMirror = false,
  appearanceHue = 0,
  highContrast = false,
  avatarUrl,
  onHudUpdate,
  onCanvasReady,
  onLoadStatus,
}: AvatarStageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);

  const modelRootRef = useRef<THREE.Object3D | null>(null);
  const vrmRef = useRef<VRM | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const clipsRef = useRef<Map<string, THREE.AnimationClip>>(new Map());

  const sentimentRef = useRef(sentiment);
  const signingSpeedRef = useRef(signingSpeed);
  const emergencyRef = useRef(emergencyMode);
  const learningSlowRef = useRef(learningSlowMo);
  const appearanceHueRef = useRef(appearanceHue);
  const highContrastRef = useRef(highContrast);
  const learningMirrorRef = useRef(learningMirror);
  const onLoadStatusRef = useRef(onLoadStatus);
  const onCanvasReadyRef = useRef(onCanvasReady);

  const lightsRef = useRef<{
    main: THREE.DirectionalLight;
    fill: THREE.PointLight;
    rim: THREE.PointLight;
    back: THREE.PointLight;
  } | null>(null);

  const animationFrameRef = useRef(0);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const signingAbortRef = useRef<{ aborted: boolean }>({ aborted: false });
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);
  const avatarBaseYawRef = useRef(Math.PI);

  const [loadPhase, setLoadPhase] = useState<"loading" | "ready" | "error">("loading");
  const [loadMessage, setLoadMessage] = useState("");

  useEffect(() => {
    sentimentRef.current = sentiment;
  }, [sentiment]);
  useEffect(() => {
    signingSpeedRef.current = signingSpeed;
  }, [signingSpeed]);
  useEffect(() => {
    emergencyRef.current = emergencyMode;
  }, [emergencyMode]);
  useEffect(() => {
    learningSlowRef.current = learningSlowMo;
  }, [learningSlowMo]);
  useEffect(() => {
    appearanceHueRef.current = appearanceHue;
  }, [appearanceHue]);
  useEffect(() => {
    highContrastRef.current = highContrast;
  }, [highContrast]);
  useEffect(() => {
    learningMirrorRef.current = learningMirror;
  }, [learningMirror]);
  useEffect(() => {
    onLoadStatusRef.current = onLoadStatus;
  }, [onLoadStatus]);
  useEffect(() => {
    onCanvasReadyRef.current = onCanvasReady;
  }, [onCanvasReady]);

  const pushHud = useCallback(
    (partial: Partial<AvatarHudState> & Pick<AvatarHudState, "phase" | "detail">) => {
      onHudUpdate?.({
        phase: partial.phase,
        detail: partial.detail,
        stepIndex: partial.stepIndex ?? 0,
        stepTotal: partial.stepTotal ?? 0,
      });
    },
    [onHudUpdate],
  );

  useEffect(() => {
    const mount = canvasMountRef.current;
    const outer = hostRef.current;
    if (!mount || !outer) return;

    let cancelled = false;
    setLoadPhase("loading");
    setLoadMessage("Loading 3D model…");
    onLoadStatusRef.current?.("loading");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(highContrastRef.current ? 0x0a0a12 : 0x050713);
    scene.fog = new THREE.FogExp2(highContrastRef.current ? 0x0a0a12 : 0x050713, 0.008);

    const width = outer.clientWidth;
    const camera = new THREE.PerspectiveCamera(45, width / 360, 0.1, 1000);
    
    // ===== WEBGL RENDERER WITH CONTEXT HANDLING =====
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !lowBandwidth,
        alpha: false,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
        depth: true,
        stencil: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
      });
      
      // Handle context loss
      renderer.domElement.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        console.warn('⚠️ WebGL context lost. Attempting to recover...');
        setTimeout(() => {
          try {
            renderer.forceContextRestore();
            console.log('✅ WebGL context restore attempted');
          } catch (e) {
            console.error('Failed to restore WebGL context:', e);
          }
        }, 100);
      }, false);
      
      renderer.domElement.addEventListener('webglcontextrestored', () => {
        console.log('✅ WebGL context restored successfully!');
      }, false);
      
    } catch (error) {
      console.error('❌ WebGL creation error:', error);
      setLoadPhase("error");
      setLoadMessage("WebGL not supported. Please use a different browser.");
      onLoadStatusRef.current?.("error", "WebGL not supported");
      return;
    }
    
    renderer.setSize(width, 360);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.replaceChildren(renderer.domElement);
    onCanvasReadyRef.current?.(renderer.domElement);

    camera.position.set(0, 1.2, 2.5);
    camera.lookAt(0, 1, 0);

    scene.add(new THREE.AmbientLight(0x404060));
    const lc = sentimentLightColors("neutral");
    const mainLight = new THREE.DirectionalLight(lc.key, 1);
    mainLight.position.set(2, 3, 2);
    scene.add(mainLight);
    const fillLight = new THREE.PointLight(lc.fill, 0.55);
    fillLight.position.set(-1, 1.5, 1);
    scene.add(fillLight);
    const backLight = new THREE.PointLight(lc.back, 0.35);
    backLight.position.set(0, 1.5, -1);
    scene.add(backLight);
    const rimLight = new THREE.PointLight(lc.rim, 0.45);
    rimLight.position.set(1, 1.8, 1.2);
    scene.add(rimLight);
    lightsRef.current = { main: mainLight, fill: fillLight, rim: rimLight, back: backLight };

    const grid = new THREE.GridHelper(4, 20, 0x00e5ff, 0x3366aa);
    grid.position.y = -0.5;
    const gm = grid.material;
    if (Array.isArray(gm)) {
      for (const m of gm) {
        m.transparent = true;
        m.opacity = 0.25;
      }
    } else {
      gm.transparent = true;
      gm.opacity = 0.25;
    }
    scene.add(grid);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    const attachModel = (root: THREE.Object3D, vrm: VRM | null, clips: Map<string, THREE.AnimationClip>) => {
      if (cancelled) return;
      if (modelRootRef.current) scene.remove(modelRootRef.current);
      modelRootRef.current = root;
      root.position.y = -0.05;
      root.scale.set(0.95, 0.95, 0.95);
      const yawEnv = process.env.NEXT_PUBLIC_VRM_YAW_OFFSET;
      const yawParsed = yawEnv !== undefined && yawEnv !== "" ? Number(yawEnv) : NaN;
      avatarBaseYawRef.current = Number.isFinite(yawParsed) ? yawParsed : Math.PI;
      root.rotation.y = avatarBaseYawRef.current;
      scene.add(root);
      vrmRef.current = vrm;
      mixerRef.current = new THREE.AnimationMixer(root);
      clipsRef.current = clips;
      tintVrmMaterials(root, sentimentRef.current, SENTIMENT_THEME[sentimentRef.current].intensity);
      applyHueToMeshes(root, appearanceHueRef.current);
      
      // Set default attention position
      setDefaultAttentionPosition(root);
      
      // Set initial facial expression
      if (vrmRef.current) {
        setFacialExpression(vrmRef.current, sentimentRef.current, 0.5);
      }
      
      setLoadPhase("ready");
      setLoadMessage("");
      onLoadStatusRef.current?.("ready");
    };

    void (async () => {
      const glbUrl = process.env.NEXT_PUBLIC_GLTF_FALLBACK_URL || "";

      let lastError: unknown;
      const urls = vrmModelUrls(avatarUrl);
      console.log("🔍 Trying VRM URLs:", urls);
      
      for (const vrmUrl of urls) {
        try {
          console.log("🔄 Attempting to load:", vrmUrl);
          const buffer = await fetchModelBuffer(vrmUrl);
          if (cancelled) return;

          const loader = new GLTFLoader();
          loader.register((parser) => new VRMLoaderPlugin(parser));

          const gltf = await new Promise<GLTF>((resolve, reject) => {
            loader.parse(buffer, "", resolve, (e) => reject(e instanceof Error ? e : new Error(String(e))));
          });
          if (cancelled) return;

          const vrm = gltf.userData.vrm as VRM | undefined;
          if (!vrm) {
            console.warn("[SignConnect] File parsed but has no VRM extension — trying next URL:", vrmUrl);
            lastError = new Error("No VRM userData on glTF");
            continue;
          }

          const lib = buildProceduralVrmClipLibrary(vrm);
          const merged = new Map<string, THREE.AnimationClip>();
          for (const [k, v] of lib) merged.set(k, v);
          for (const [k, v] of mergeGlbEmbeddedClips(gltf)) merged.set(k, v);
          attachModel(gltf.scene, vrm, merged);
          console.info("[SignConnect] VRM ready", { source: vrmUrl, clips: merged.size });
          return;
        } catch (e) {
          lastError = e;
          console.warn("[SignConnect] VRM candidate failed:", vrmUrl, e);
        }
      }

      console.warn("[SignConnect] All VRM URLs failed, trying GLB fallback…", lastError);

      if (glbUrl) {
        try {
          const buf = await fetchModelBuffer(glbUrl);
          if (cancelled) return;
          const loader = new GLTFLoader();
          const gltf = await new Promise<GLTF>((resolve, reject) => {
            loader.parse(buf, "", resolve, (e) => reject(e instanceof Error ? e : new Error(String(e))));
          });
          if (cancelled) return;
          const merged = new Map<string, THREE.AnimationClip>();
          for (const [k, v] of mergeGlbEmbeddedClips(gltf)) merged.set(k, v);
          if (merged.size === 0) throw new Error("GLB has no embedded animation clips.");
          attachModel(gltf.scene, null, merged);
          console.info("[SignConnect] GLB fallback ready", { clips: merged.size });
          return;
        } catch (e) {
          console.error("[SignConnect] GLB fallback failed", e);
        }
      }

      if (!cancelled) {
        setLoadPhase("error");
        const msg = "Could not load VRM model. Please ensure public/avatars/default.vrm exists.";
        setLoadMessage(msg);
        onLoadStatusRef.current?.("error", msg);
      }
    })();

    let lastTime = performance.now();
    let time = 0;

    const animate = () => {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      time += delta;

      mixerRef.current?.update(delta);
      vrmRef.current?.update(delta);

      // Update facial expressions during animation
      if (vrmRef.current) {
        const currentSentiment = sentimentRef.current;
        const targetIntensity = 0.5 + Math.sin(time * 0.5) * 0.2;
        setFacialExpression(vrmRef.current, currentSentiment, targetIntensity);
      }

      const root = modelRootRef.current;
      if (root) {
        const base = 0.95;
        const mx = learningMirrorRef.current ? -base : base;
        root.scale.set(mx, base, base);
        const signing = Boolean(activeActionRef.current?.isRunning());
        const bob = signing ? 0.012 : 0.008;
        root.position.y = -0.05 + Math.sin(time * 2) * bob;
        const sway = Math.sin(time * 0.45) * (signing ? 0.06 : 0.04);
        root.rotation.y = avatarBaseYawRef.current + sway;
      }

      const lights = lightsRef.current;
      if (lights) {
        const lcNow = sentimentLightColors(sentimentRef.current);
        lights.main.color.lerp(new THREE.Color(lcNow.key), 0.06);
        lights.fill.color.lerp(new THREE.Color(lcNow.fill), 0.06);
        lights.rim.color.lerp(new THREE.Color(lcNow.rim), 0.06);
        lights.back.color.lerp(new THREE.Color(lcNow.back), 0.06);
        lights.fill.intensity = 0.55 + Math.sin(time * 1.3) * 0.1;
        lights.rim.intensity = 0.45 + Math.sin(time * 2) * 0.15;
      }

      if (cameraRef.current && rendererRef.current && sceneRef.current) {
        cameraRef.current.lookAt(0, 0.85, 0);
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    const ro = new ResizeObserver(() => {
      if (!outer || !cameraRef.current || !rendererRef.current) return;
      const w = outer.clientWidth;
      cameraRef.current.aspect = w / 360;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, 360);
    });
    ro.observe(outer);

    return () => {
      cancelled = true;
      signingAbortRef.current.aborted = true;
      cancelAnimationFrame(animationFrameRef.current);
      ro.disconnect();
      activeActionRef.current?.stop();
      mixerRef.current?.stopAllAction();
      mixerRef.current = null;
      
      // Proper WebGL disposal
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss?.();
      }
      renderer.dispose();
      
      mount.replaceChildren();
      modelRootRef.current = null;
      vrmRef.current = null;
      clipsRef.current = new Map();
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      lightsRef.current = null;
      onCanvasReadyRef.current?.(null);
    };
  }, [lowBandwidth]);

  useEffect(() => {
    if (modelRootRef.current) {
      tintVrmMaterials(modelRootRef.current, sentiment, SENTIMENT_THEME[sentiment].intensity);
      applyHueToMeshes(modelRootRef.current, appearanceHue);
      
      // Update facial expression when sentiment changes
      if (vrmRef.current) {
        setFacialExpression(vrmRef.current, sentiment, 0.7);
      }
    }
    const lights = lightsRef.current;
    if (lights) {
      const lc = sentimentLightColors(sentiment);
      lights.main.color.setHex(lc.key);
      lights.fill.color.setHex(lc.fill);
      lights.rim.color.setHex(lc.rim);
      lights.back.color.setHex(lc.back);
    }
    if (sceneRef.current) {
      const bg = highContrast ? 0x0a0a12 : 0x050713;
      sceneRef.current.background = new THREE.Color(bg);
      if (sceneRef.current.fog instanceof THREE.FogExp2) {
        sceneRef.current.fog.color.setHex(bg);
      }
    }
  }, [sentiment, appearanceHue, highContrast]);

  const glossKey = gloss.join("|");

  useEffect(() => {
    if (loadPhase !== "ready") return;
    const mixer = mixerRef.current;
    const clips = clipsRef.current;
    const vrm = vrmRef.current;
    if (!mixer || clips.size === 0) return;

    signingAbortRef.current = { aborted: false };
    const signal = signingAbortRef.current;

    mixer.stopAllAction();
    activeActionRef.current = null;
    vrm?.humanoid?.resetNormalizedPose();

    const run = async () => {
      const plan = buildSignPlanFromGloss(gloss);
      if (!plan.length) {
        pushHud({ phase: "idle", detail: "Waiting for gloss…", stepIndex: 0, stepTotal: 0 });
        return;
      }

      const speedBase = signingSpeedRef.current * (emergencyRef.current ? 1.45 : 1) * learningSlowRef.current;
      const speed = Math.max(0.35, Math.min(2.8, speedBase));

      for (let i = 0; i < plan.length; i++) {
        if (signal.aborted) break;
        const step = plan[i];
        const phase: AvatarHudState["phase"] = step.kind === "spell" ? "spelling" : "playing";
        pushHud({
          phase,
          detail: describeStep(step),
          stepIndex: i,
          stepTotal: plan.length,
        });

        vrm?.humanoid?.resetNormalizedPose();

        let clip: THREE.AnimationClip | undefined;
        if (step.kind === "clip") {
          clip = clips.get(step.clip) ?? findClipByName(clips, step.clip) ?? findClipByName(clips, step.sourceToken);
        } else if (vrm) {
          clip = buildFingerSpellClip(vrm, step.letter) ?? undefined;
        }

        if (!clip) {
          await delay(220 / speed);
          if (signal.aborted) break;
          continue;
        }

        const action = mixer.clipAction(clip);
        activeActionRef.current = action;
        action.clampWhenFinished = true;
        action.setLoop(THREE.LoopOnce, 1);
        action.reset().fadeIn(0.1).setEffectiveTimeScale(speed).play();

        const ms = (clip.duration / speed) * 1000 + 80;
        await delay(ms);
        if (signal.aborted) break;
        action.fadeOut(0.12);
        await delay(140);
        if (signal.aborted) break;
        action.stop();
        mixer.uncacheAction(clip);
        activeActionRef.current = null;
      }

      if (!signal.aborted) {
        pushHud({ phase: "idle", detail: "Sequence complete", stepIndex: plan.length, stepTotal: plan.length });
        vrm?.humanoid?.resetNormalizedPose();
      }
    };

    void run();

    return () => {
      signingAbortRef.current.aborted = true;
      activeActionRef.current?.stop();
      activeActionRef.current = null;
      mixer.stopAllAction();
    };
  }, [glossKey, signReplayKey, loadPhase, pushHud]);

  return (
    <div ref={hostRef} className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-white/10">
      <div ref={canvasMountRef} className="absolute inset-0" />
      {loadPhase === "loading" && (
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-center text-sm text-cyan-100"
          role="status"
          aria-busy="true"
        >
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
          <span>{loadMessage}</span>
        </div>
      )}
      {loadPhase === "error" && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 p-4 text-center text-xs text-rose-200"
          role="alert"
        >
          <p className="text-sm font-semibold text-rose-300">Avatar model unavailable</p>
          <p className="max-w-md text-white/70">{loadMessage}</p>
        </div>
      )}
    </div>
  );
}