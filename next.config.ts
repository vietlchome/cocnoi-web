import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
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
    ];
  },
};

export default nextConfig;
