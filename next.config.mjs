/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1400, 1600, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 200, 240, 256, 384, 420],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    minimumCacheTTL: 2592000, // 30 days
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: '/privacy', destination: '/policies/privacy-policy' },
      { source: '/privacy-policy', destination: '/policies/privacy-policy' },
      { source: '/refund', destination: '/policies/refund-policy' },
      { source: '/refund-policy', destination: '/policies/refund-policy' },
      { source: '/returns', destination: '/policies/refund-policy' },
      { source: '/return-policy', destination: '/policies/refund-policy' },
      { source: '/shipping-returns', destination: '/policies/refund-policy' },
      { source: '/terms', destination: '/policies/terms-and-conditions' },
      { source: '/terms-and-conditions', destination: '/policies/terms-and-conditions' },
      { source: '/terms-of-service', destination: '/policies/terms-and-conditions' },
      { source: '/shipping-policy', destination: '/policies/shipping-policy' },
      { source: '/shipping', destination: '/policies/shipping-policy' },
      { source: '/cookie-policy', destination: '/policies/cookie-policy' }
    ];
  },
};

export default nextConfig;
