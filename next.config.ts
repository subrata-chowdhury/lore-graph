import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["10.86.206.100:3000", "10.86.206.100", "10.167.29.100", "localhost:3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        // Matches /@username (e.g., /@user)
        source: "/@:username",
        // Serves the page at app/user/[username]/page.tsx
        destination: "/users/:username",
      },
    ];
  },
};

export default nextConfig;
