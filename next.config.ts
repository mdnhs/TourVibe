import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow larger uploads through Server Actions (50MB video/photo + gallery + form fields)
    serverActions: {
      bodySizeLimit: "60mb",
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
