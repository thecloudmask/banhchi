import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: process.env.NODE_ENV === "production" ? "export" : undefined,
  trailingSlash: false,
  reactCompiler: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
