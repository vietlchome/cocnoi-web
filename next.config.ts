import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async redirects() {
    return [
      { source: "/shop", destination: "/cua-hang", permanent: true },
      { source: "/shop/:slug*", destination: "/cua-hang/:slug*", permanent: true },
      {
        source: "/nguoi-noi",
        destination: "/community/nguoi-noi",
        permanent: true,
      },
      {
        source: "/community",
        destination: "/community/nguoi-noi",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/discover/our-story",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
