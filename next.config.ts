import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, nextRuntime }) => {
    // Avoid AWS SDK v2 getting bundled on the client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'async_hooks': false,
      };
    }
    
    return config;
  }
};

export default nextConfig;
