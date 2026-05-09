"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { SENTIMENT_THEME, type Sentiment } from "@/lib/utils";

type Props = {
  sentiment: Sentiment;
  lowBandwidth: boolean;
};

let cachedVrmPromise: Promise<THREE.Object3D | null> | null = null;

function loadVrmOnce(modelUrl: string): Promise<THREE.Object3D | null> {
  if (!cachedVrmPromise) {
    console.log("Loading VRM from:", modelUrl);
    cachedVrmPromise = new Promise((resolve) => {
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));
      loader.load(
        modelUrl,
        (gltf) => {
          console.log("VRM model loaded successfully!");
          resolve(gltf.scene);
        },
        (progress) => {
          console.log("VRM loading:", Math.round(progress.loaded / progress.total * 100), "%");
        },
        (error) => {
          console.error("VRM load error:", error);
          resolve(null);
        },
      );
    });
  }
  return cachedVrmPromise;
}

export function AvatarStage({ sentiment, lowBandwidth }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const animationFrameRef = useRef<number>(0);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const fallbackRef = useRef<THREE.Group | null>(null);
  const vrmLoadedRef = useRef(false);

  useEffect(() => {
    if (!host.current) return;
    
    console.log("Initializing Three.js scene...");
    const container = host.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050713);
    scene.fog = new THREE.FogExp2(0x050713, 0.008);
    
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / 360, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: !lowBandwidth, 
      alpha: false,
      powerPreference: "high-performance" 
    });
    
    renderer.setSize(container.clientWidth, 360);
    renderer.setPixelRatio(lowBandwidth ? 1 : Math.min(window.devicePixelRatio, 1.5));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    
    // Position camera
    camera.position.set(0, 1.2, 2.5);
    camera.lookAt(0, 1, 0);
    
    // Lighting system
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(2, 3, 2);
    scene.add(mainLight);
    
    const fillLight = new THREE.PointLight(0x4466ff, 0.5);
    fillLight.position.set(-1, 1.5, 1);
    scene.add(fillLight);
    
    const backLight = new THREE.PointLight(0xff66cc, 0.3);
    backLight.position.set(0, 1.5, -1);
    scene.add(backLight);
    
    const rimLight = new THREE.PointLight(0x00e5ff, 0.4);
    rimLight.position.set(1, 1.8, 1.2);
    scene.add(rimLight);
    
    // Ground grid
    const gridHelper = new THREE.GridHelper(4, 20, 0x00e5ff, 0x3366aa);
    gridHelper.position.y = -0.5;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.3;
    scene.add(gridHelper);
    
    // Create visible fallback avatar
    const fallbackGroup = new THREE.Group();
    
    // Body
    const bodyGeo = new THREE.BoxGeometry(0.8, 1.0, 0.5);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00aaff, metalness: 0.7, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0;
    body.castShadow = true;
    body.receiveShadow = false;
    fallbackGroup.add(body);
    
    // Head
    const headGeo = new THREE.SphereGeometry(0.48, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffaa66, metalness: 0.2, roughness: 0.1 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.85;
    head.castShadow = true;
    fallbackGroup.add(head);
    
    // Eyes
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 24), eyeMat);
    leftEye.position.set(-0.18, 1.02, 0.48);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 24), eyeMat);
    rightEye.position.set(0.18, 1.02, 0.48);
    fallbackGroup.add(leftEye);
    fallbackGroup.add(rightEye);
    
    // Pupils
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 24), pupilMat);
    leftPupil.position.set(-0.18, 1.0, 0.58);
    const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 24), pupilMat);
    rightPupil.position.set(0.18, 1.0, 0.58);
    fallbackGroup.add(leftPupil);
    fallbackGroup.add(rightPupil);
    
    // Arms
    const armMat = new THREE.MeshStandardMaterial({ color: 0x00aaff });
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 8), armMat);
    leftArm.position.set(-0.55, 0.5, 0);
    leftArm.rotation.z = 0.3;
    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 8), armMat);
    rightArm.position.set(0.55, 0.5, 0);
    rightArm.rotation.z = -0.3;
    fallbackGroup.add(leftArm);
    fallbackGroup.add(rightArm);
    
    // Glow effect around avatar
    const glowGeometry = new THREE.SphereGeometry(0.65, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00e5ff, 
      transparent: true, 
      opacity: 0.1,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 0.85;
    fallbackGroup.add(glow);
    
    scene.add(fallbackGroup);
    fallbackRef.current = fallbackGroup;
    
    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    
    // Try to load VRM model
    const modelUrl = process.env.NEXT_PUBLIC_VRM_MODEL_URL || "/api/vrm";
    console.log("Attempting to load VRM from:", modelUrl);
    
    loadVrmOnce(modelUrl).then((vrmModel) => {
      if (vrmModel && !vrmLoadedRef.current) {
        console.log("VRM model loaded successfully, replacing fallback");
        scene.remove(fallbackGroup);
        vrmModel.position.y = -0.3;
        vrmModel.scale.set(0.8, 0.8, 0.8);
        scene.add(vrmModel);
        modelRef.current = vrmModel;
        vrmLoadedRef.current = true;
      } else if (!vrmModel) {
        console.log("No VRM model available, using fallback avatar");
      }
    });
    
    // Animation variables
    let time = 0;
    let lastTime = performance.now();
    let armSwing = 0;
    
    const animate = () => {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;
      time += delta;
      armSwing += delta * 3;
      
      // Animate fallback avatar
      if (fallbackRef.current && !vrmLoadedRef.current) {
        // Bobbing motion
        fallbackRef.current.position.y = Math.sin(time * 2) * 0.02;
        // Swaying
        fallbackRef.current.rotation.z = Math.sin(time * 1.2) * 0.03;
        
        // Animate arms
        const leftArmNode = fallbackRef.current.children.find(c => c.position.x === -0.55);
        const rightArmNode = fallbackRef.current.children.find(c => c.position.x === 0.55);
        if (leftArmNode && rightArmNode) {
          leftArmNode.rotation.z = 0.3 + Math.sin(armSwing) * 0.2;
          rightArmNode.rotation.z = -0.3 - Math.sin(armSwing) * 0.2;
        }
        
        // Blink eyes
        if (Math.sin(time * 3) > 0.95) {
          const leftPupilNode = fallbackRef.current.children.find(c => c.position.x === -0.18 && c.position.z === 0.58);
          const rightPupilNode = fallbackRef.current.children.find(c => c.position.x === 0.18 && c.position.z === 0.58);
          if (leftPupilNode && rightPupilNode) {
            leftPupilNode.scale.set(1, 0.1, 1);
            rightPupilNode.scale.set(1, 0.1, 1);
            setTimeout(() => {
              if (leftPupilNode && rightPupilNode) {
                leftPupilNode.scale.set(1, 1, 1);
                rightPupilNode.scale.set(1, 1, 1);
              }
            }, 100);
          }
        }
        
        // Glow pulse
        const glowNode = fallbackRef.current.children.find(c => c instanceof THREE.Mesh && c.material instanceof THREE.MeshBasicMaterial);
        if (glowNode && glowNode.material) {
          (glowNode.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.sin(time * 3) * 0.05;
        }
      }
      
      // Animate VRM model if loaded
      if (modelRef.current && vrmLoadedRef.current) {
        modelRef.current.position.y = -0.3 + Math.sin(time * 2) * 0.01;
        modelRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      }
      
      // Animate lights
      fillLight.intensity = 0.5 + Math.sin(time * 1.3) * 0.1;
      rimLight.intensity = 0.4 + Math.sin(time * 2) * 0.15;
      backLight.intensity = 0.3 + Math.sin(time * 1.8) * 0.1;
      
      // Rotate fill light
      fillLight.position.x = -1 + Math.sin(time * 0.5) * 0.5;
      rimLight.position.x = 1 + Math.sin(time * 0.7) * 0.3;
      
      // Render
      if (cameraRef.current && rendererRef.current && sceneRef.current) {
        cameraRef.current.lookAt(0, 0.8, 0);
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const width = container.clientWidth;
      cameraRef.current.aspect = width / 360;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, 360);
    });
    resizeObserver.observe(container);
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (container) {
        container.replaceChildren();
      }
    };
  }, [lowBandwidth]);
  
  // Update colors based on sentiment
  useEffect(() => {
    if (fallbackRef.current && !vrmLoadedRef.current) {
      const bodyMesh = fallbackRef.current.children.find(c => c instanceof THREE.Mesh && c.geometry instanceof THREE.BoxGeometry);
      if (bodyMesh && bodyMesh.material) {
        const colors = {
          urgent: 0xff4444,
          happy: 0x44ff44,
          question: 0xffaa44,
          neutral: 0x00aaff
        };
        (bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(colors[sentiment] || colors.neutral);
      }
      
      // Update glow color
      const glowNode = fallbackRef.current.children.find(c => c instanceof THREE.Mesh && c.material instanceof THREE.MeshBasicMaterial);
      if (glowNode && glowNode.material) {
        const glowColors = {
          urgent: 0xff0000,
          happy: 0x00ff00,
          question: 0xff8800,
          neutral: 0x00e5ff
        };
        (glowNode.material as THREE.MeshBasicMaterial).color.setHex(glowColors[sentiment] || glowColors.neutral);
      }
    }
  }, [sentiment]);
  
  return (
    <div 
      ref={host} 
      className="relative h-[360px] w-full rounded-2xl overflow-hidden"
      style={{ background: '#050713' }}
    />
  );
}