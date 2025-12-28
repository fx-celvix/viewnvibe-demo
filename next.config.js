/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Use custom loader for self-hosted image optimization
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
    // Disable Vercel's image optimization
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ensure Sharp works in serverless
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
};

module.exports = nextConfig;
