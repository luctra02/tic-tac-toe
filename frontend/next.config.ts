import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{
      "hostname":'lh3.googleusercontent.com'
    },
      {
        hostname: 'cdn.discordapp.com', // Add Discord domain here
      }
    ], 
  },
};

export default nextConfig;
