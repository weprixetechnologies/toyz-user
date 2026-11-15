/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
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
