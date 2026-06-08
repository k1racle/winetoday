import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sharp inside the frontend container caused OOM and aborted /_next/image requests.
    // Media is proxied via app/uploads/[...path]/route.ts (Range-aware for mobile Safari).
    unoptimized: true,
    localPatterns: [
      {
        pathname: "/uploads/**",
      },
    ],
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
        protocol: "http",
        hostname: "185.72.147.187",
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
};

export default nextConfig;
