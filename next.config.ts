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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // This is a workaround for the 'async_hooks' error. It tells Webpack to
      // resolve 'async_hooks' to a false (empty) module on the client side.
      config.resolve.alias.async_hooks = false;
    }
    return config;
  },
};

export default nextConfig;
