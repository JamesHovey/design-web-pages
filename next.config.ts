import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.istock.com",
      },
    ],
  },
  serverExternalPackages: ['puppeteer', 'puppeteer-core', 'puppeteer-extra', 'puppeteer-extra-plugin-stealth'],
  webpack: (config) => {
    // Suppress critical dependency warnings for dynamic requires
    config.module = config.module || {};
    config.module.exprContextCritical = false;
    config.module.unknownContextCritical = false;

    // Ignore warnings for specific packages with dynamic requires
    config.ignoreWarnings = [
      { module: /node_modules\/clone-deep/ },
      { module: /node_modules\/merge-deep/ },
    ];

    return config;
  },
};

export default nextConfig;
