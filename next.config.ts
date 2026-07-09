import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
})({
  images: {
    remotePatterns: [],
  },
  // ===== ADD THIS: WebGL/Three.js support for Render =====
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        canvas: false,
        encoding: false,
        path: false,
      };
    }
    // Support .glb and .vrm files
    config.module.rules.push({
      test: /\.(glb|vrm)$/,
      type: "asset/resource",
    });
    return config;
  },
  staticPageGenerationTimeout: 120,
});

export default nextConfig;