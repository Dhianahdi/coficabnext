import type { NextConfig } from "next";

const nextConfig = {
  output: "standalone", // Nécessaire si tu veux utiliser `fs`
  experimental: {
    serverActions: true, // Active les API server-side modernes
  },
  images: {
    domains: [
      "example.com",
      "lh3.googleusercontent.com",
      "github.com",
      "benevolent-reindeer-120.convex.cloud",
      "fiery-dalmatian-147.convex.cloud",
      "avatars.githubusercontent.com",
    ],
    unoptimized: process.env.NODE_ENV === "development", // Désactive l'optimisation en dev
  },
};

export default nextConfig;

