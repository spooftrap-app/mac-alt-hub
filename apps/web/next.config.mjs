/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@macalthub/catalog", "@macalthub/design"],
  experimental: {
    externalDir: true
  }
};

export default nextConfig;

