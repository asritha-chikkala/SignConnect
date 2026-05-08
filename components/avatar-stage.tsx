"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { SENTIMENT_THEME, type Sentiment } from "@/lib/utils";

type Props = {
  sentiment: Sentiment;
  lowBandwidth: boolean;
};

export function AvatarStage({ sentiment, lowBandwidth }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!host.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1.6, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: !lowBandwidth, alpha: true });
    renderer.setSize(host.current.clientWidth, 360);
    host.current.innerHTML = "";
    host.current.appendChild(renderer.domElement);
    camera.position.set(0, 1.4, 2.2);

    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(2, 3, 2);
    scene.add(light);

    // Graceful fallback stage if avatar is unavailable.
    const geometry = lowBandwidth
      ? new THREE.WireframeGeometry(new THREE.BoxGeometry(0.7, 1.6, 0.4))
      : new THREE.BoxGeometry(0.7, 1.6, 0.4);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(SENTIMENT_THEME[sentiment].intensity, 0.5, 1),
      wireframe: lowBandwidth,
    });
    const standIn = new THREE.Mesh(geometry as THREE.BufferGeometry, material);
    standIn.position.y = 0.8;
    scene.add(standIn);

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    if (process.env.NEXT_PUBLIC_VRM_MODEL_URL) {
      loader.load(
        process.env.NEXT_PUBLIC_VRM_MODEL_URL,
        (gltf) => {
          console.log("✓ VRM model loaded successfully");
          scene.add(gltf.scene);
        },
        (progress) => {
          console.log(`Loading VRM: ${Math.round((progress.loaded / progress.total) * 100)}%`);
        },
        (error) => {
          console.error("✗ VRM model failed to load:", error);
          console.error("URL:", process.env.NEXT_PUBLIC_VRM_MODEL_URL);
        },
      );
    } else {
      console.warn("⚠ NEXT_PUBLIC_VRM_MODEL_URL not set");
    }

    let frame = 0;
    const animate = () => {
      frame += 0.02;
      standIn.rotation.y = Math.sin(frame) * 0.2;
      standIn.position.y = 0.8 + Math.sin(frame * 2) * 0.03;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  }, [sentiment, lowBandwidth]);

  return <div ref={host} className="glass neon-border h-[360px] w-full rounded-2xl" />;
}
