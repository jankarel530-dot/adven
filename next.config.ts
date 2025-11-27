import type {NextConfig} from 'next';
import chokidar from 'chokidar';

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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // This is a workaround to make sure that Next.js dev server reloads when
  // a file in the src/lib/data directory is changed.
  webpack: (config, {isServer}) => {
    if (!isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    } else {
      config.plugins.push({
        apply: (compiler: any) => {
          compiler.hooks.afterEmit.tap('MyPlugin', () => {
            if (process.env.NODE_ENV === 'development') {
              const watcher = chokidar.watch('./src/lib/data/*.json', {
                persistent: false,
              });
              watcher.on('change', () => {
                compiler.watching.invalidate();
              });
            }
          });
        },
      });
    }
    return config;
  },
};

export default nextConfig;
