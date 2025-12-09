import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Handle @react-pdf/renderer canvas dependency on client side
    if (!isServer) {
      config.resolve.alias.canvas = false;
    }
    return config;
  },
  // Exclude @react-pdf/renderer from server-side bundling
  serverExternalPackages: ['@react-pdf/renderer'],
};

export default nextConfig;
