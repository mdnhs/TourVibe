import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow larger uploads through Server Actions (10MB video + gallery + form fields)
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  images: {
    remotePatterns: [
      // Allow any external https image (cover images from URLs)
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
  },
};

export default nextConfig;
