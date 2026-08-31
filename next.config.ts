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
    /*
      WebP only. AVIF encodes far more slowly than WebP, and Next optimises on
      demand at request time — on Hostinger's shared Node hosting a first
      visitor to an image-heavy portfolio page would pay seconds of CPU per
      image. WebP gives most of the saving at a fraction of the cost. Revisit if
      images are ever pre-generated at build time or served through a CDN.
    */
    formats: ['image/webp'],
    // Cache optimised variants for a year; the underlying object keys are
    // content-addressed, so a replaced image gets a new key.
    minimumCacheTTL: 31536000,
    /*
      Candidate widths are capped at 1920. A decoration portfolio never needs a
      3840px asset, and leaving that candidate in place lets the browser request
      an upscale of a portrait source to 3840x5120 — around 20 megapixels, which
      a mobile browser can refuse to decode, leaving a silently blank image.
      Capping also keeps mobile payloads small (Requirements section 20).
    */
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [64, 96, 128, 200, 256, 384],
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
