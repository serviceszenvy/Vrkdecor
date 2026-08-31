import type { NextConfig } from 'next';

/**
 * Baseline security headers.
 *
 * Scope note: this is the P1 foundation baseline only. Full security hardening
 * (CSP, HSTS tuning, permissions policy, rate limiting) is delivered in P10 per
 * the Master Implementation Specification.
 */
const baselineSecurityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Hostinger managed Node.js hosting runs `next build` + `next start`.
  // Do not introduce Vercel-only capabilities (see CLAUDE.md).
  output: undefined,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: baselineSecurityHeaders,
      },
    ];
  },
};

export default nextConfig;
