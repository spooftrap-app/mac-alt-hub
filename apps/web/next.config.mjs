/** @type {import('next').NextConfig} */
const staticExport = process.env.MACALTHUB_STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig = {
  transpilePackages: ["@macalthub/catalog", "@macalthub/design"],
  basePath,
  assetPrefix: basePath,
  output: staticExport ? "export" : undefined,
  trailingSlash: staticExport,
  experimental: {
    externalDir: true
  }
};

export default nextConfig;
