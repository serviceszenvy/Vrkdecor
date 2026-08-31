import { routes } from '@/lib/navigation';

/**
 * Builds the "Get Quote for This Design" destination.
 *
 * The parent Design is ALWAYS carried in the link, whether the request starts
 * from a design page or from an individual photograph. The customer never
 * re-selects the design (CLAUDE.md core business rules; Technical Development
 * Specification section 9).
 *
 * `image` is optional context so the team can see which photograph prompted the
 * enquiry. The server still resolves and verifies the Design from `design`
 * alone, and must confirm it exists and is publicly eligible before accepting
 * the enquiry (P6).
 */
export function designQuoteHref(designSlug: string, imageId?: string): string {
  const params = new URLSearchParams({ design: designSlug });
  if (imageId) params.set('photo', imageId);
  return `${routes.quote}?${params.toString()}`;
}

/** Canonical path of a Design detail page. */
export function designHref(slug: string): string {
  return `${routes.work}/${slug}`;
}
