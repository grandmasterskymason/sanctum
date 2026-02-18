import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "brothers.skymasons.xyz",
      },
    ],
  },
}

export default nextConfig
