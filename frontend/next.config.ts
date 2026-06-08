import type { NextConfig } from "next";

const cmsOrigin = (process.env.CMS_URL ?? "http://localhost:1337").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  images: {
    // Sharp inside the frontend container caused OOM and aborted /_next/image requests.
    // Media is served from /uploads/ (proxied to Strapi by NPM or the rewrite below).
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "1337",
      },
      {
        protocol: "http",
        hostname: "backend",
        port: "1337",
      },
      {
        protocol: "https",
        hostname: "winemaking-today.ru",
      },
      {
        protocol: "https",
        hostname: "www.winemaking-today.ru",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${cmsOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
