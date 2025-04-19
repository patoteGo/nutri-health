import type { NextConfig } from "next";
const withPWA = require("next-pwa");

const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
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
