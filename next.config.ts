import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true,
    instantNavigationDevToolsToggle: true,
  },
};

export default nextConfig;
