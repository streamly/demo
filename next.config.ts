import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.syndinet.com',
      },
    ],
  },
};

export default nextConfig;
