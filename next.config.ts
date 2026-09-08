import type { NextConfig } from "next";

const nextConfig = {

  poweredByHeader: false,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    imageSizes: [16, 32, 48, 64, 96, 128, 140, 256, 280, 384],
    minimumCacheTTL: 86400, // cache optimized images for 24 hours to reduce CPU load
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
      {
        protocol: "https",
        hostname: "busan-public.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "1gamestopup.com",
      },
      {
        protocol: "https",
        hostname: "elitedias.com",
      }
    ],
  },
  serverExternalPackages: ["nodemailer"],
  experimental: {
    inlineCss: true,
    optimizePackageImports: ['lucide-react', 'react-icons', 'framer-motion'],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
