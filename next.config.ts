import type { NextConfig } from "next";

const apiUrl = process.env.API_URL ?? "http://book-api:8743";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
