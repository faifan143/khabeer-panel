import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: false,
  images: {
    unoptimized: false,
    domains: ['khabirs.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'khabirs.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
