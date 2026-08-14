import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const repositoryName =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ??
  "catholic-leaders-in-action";
const basePath = isGitHubPages ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 375, 430, 640, 768, 1024, 1280, 1440, 1920],
  },
};

export default nextConfig;
