import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["watts-depot-thank-garcia.trycloudflare.com"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "brochures-sunshine-ala-discussed.trycloudflare.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
