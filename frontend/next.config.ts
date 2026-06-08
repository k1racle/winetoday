import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "1337",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "http",
        hostname: "backend",
        port: "1337",
      },
      {
        protocol: "http",
        hostname: "185.72.147.187",
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
