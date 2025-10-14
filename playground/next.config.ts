import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.wgsl': {
          loaders: ['raw-loader'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.wgsl$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
