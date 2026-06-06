import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Avoids Next picking up a stray
  // lockfile in a parent directory (C:\Sohan_Projects) as the root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
