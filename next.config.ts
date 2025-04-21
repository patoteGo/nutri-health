import type { NextConfig } from "next";
const withPWA = require("next-pwa");

const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: true, // Temporarily disable PWA for all environments to troubleshoot build issues
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "lh3.googleusercontent.com", // Google avatars
      "avatars.githubusercontent.com", // GitHub avatars
    ],
  },
};

export default withPWA(pwaConfig)(nextConfig);
