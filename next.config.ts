import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The E2E test server sets NEXT_DIST_DIR so it can run alongside `npm run dev`
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
