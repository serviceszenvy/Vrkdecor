import type { NextConfig } from 'next';

/**
 * The Supabase host that serves published portfolio images.
 *
 * `next/image` refuses a remote URL that no pattern allows, which is exactly
 * the behaviour we want: without this, a compromised or mistaken storage key
 * could point the optimiser at an arbitrary host. The pattern is derived from
 * the configured project rather than hard-coded, and it is narrowed to the
 * PUBLIC portfolio path.
 *
 * Private reference images are deliberately absent. They are served through
 * short-lived signed URLs and are rendered with a plain `<img>` so they never
 * enter the image optimiser's cache (P8).
 */
function portfolioImagePatterns(): NonNullable<NextConfig['images']>['remotePatterns'] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];

  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== 'https:') return [];
    return [
      {
        protocol: 'https',
        hostname,
        pathname: '/storage/v1/object/public/portfolio/**',
      },
    ];
  } catch {
    return [];
  }
}

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

/**
 * The Admin Panel is never indexed and never cached by an intermediary.
 *
 * The pages also carry `robots: { index: false }` metadata; this says the same
 * thing at the HTTP level, so a crawler that ignores the meta tag still gets
 * the instruction and a shared cache never keeps an admin response.
 */
const adminHeaders = [
  { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
  { key: 'Cache-Control', value: 'no-store, max-age=0' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      /*
        Two upload surfaces need more than the 1 MB Server Actions default: the
        quote form's three 5 MB reference images (Requirements & SOW section 13)
        and the Admin Panel's portfolio uploads at 10 MB each.

        16 MB is NOT a general relaxation. `lib/uploads` re-applies the per-file
        limit, the file count and the whole content check on the server, and the
        buckets apply their own limits again in Supabase Storage. The
        application's own request ceiling (`MAX_UPLOAD_REQUEST_BYTES`, 15 MB)
        sits just under this one so an oversized batch is refused with a
        sentence rather than by the framework with a generic error. This value
        only decides how large a body Next will read before rejecting it.
      */
      bodySizeLimit: '16mb',
    },
  },
  // Hostinger managed Node.js hosting runs `next build` + `next start`.
  // Do not introduce Vercel-only capabilities (see CLAUDE.md).
  output: undefined,
  images: {
    remotePatterns: portfolioImagePatterns(),
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
  /*
    The standalone Occasions page (Requirements section 5) has been folded
    into Services (`/services`), which now leads with the same occasion
    content grouped by category. This keeps every previously-shared or
    bookmarked `/occasions` link resolving to something, rather than a 404,
    without keeping a page around that duplicates what `/services` now
    covers. Not `permanent`: this is a content restructuring, not a change of
    canonical URL that should be hard-cached by browsers/CDNs indefinitely.
  */
  async redirects() {
    return [
      {
        source: '/occasions',
        destination: '/services',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: baselineSecurityHeaders,
      },
      {
        source: '/admin/:path*',
        headers: adminHeaders,
      },
      {
        source: '/admin',
        headers: adminHeaders,
      },
    ];
  },
};

export default nextConfig;
