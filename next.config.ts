import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "flow.koredigital.com.br",
          },
        ],
        destination: "/vendas",
      },
    ];
  },
};

export default nextConfig;
