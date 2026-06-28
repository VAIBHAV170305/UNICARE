import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Prevent webpack from bundling native/server-only packages.
  // better-sqlite3 is a native addon (not available on Vercel); pg is Node-only.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-better-sqlite3",
    "@prisma/adapter-pg",
    "better-sqlite3",
    "pg",
  ]
};

export default nextConfig;
