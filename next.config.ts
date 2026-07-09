import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // ✅ Serve VRM files
  async headers() {
    return [
      {
        source: "/avatars/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "application/octet-stream",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
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
    config.module.rules.push({
      test: /\.(glb|vrm)$/,
      type: "asset/resource",
    });
    return config;
  },
  staticPageGenerationTimeout: 120,
};

export default nextConfig;