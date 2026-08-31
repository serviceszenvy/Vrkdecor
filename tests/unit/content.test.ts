import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  coverage,
  credentials,
  howItWorks,
  occasions,
  positioning,
  services,
  styles,
  whyChooseUs,
} from '@/lib/content';

/**
 * Approved-content verification.
 *
 * Requirements & SOW section 2 fixes the business figures and section 3 fixes
 * the positioning. These tests exist so a well-meaning copy edit cannot quietly
 * inflate a claim.
 */

describe('approved business figures', () => {
  it('states the approved experience, events and team figures exactly', () => {
    expect(credentials.map((c) => c.value)).toEqual(['14+', '600+', '35+']);
  });

  it('uses the approved positioning statement verbatim', () => {
    expect(positioning.headline).toBe(
      'Premium Event Design & Complete Celebration Solutions',
    );
  });

  it('lists the approved coverage areas', () => {
    expect([...coverage.primaryAreas]).toEqual([
      'Nagercoil',
      'Tirunelveli',
      'Trivandrum',
      'Tuticorin',
      'Madurai',
    ]);
  });
});

describe('catalogue completeness', () => {
  it('carries all 14 approved occasions with their Tamil secondary terms', () => {
    expect(occasions).toHaveLength(14);

    const bySlug = Object.fromEntries(occasions.map((o) => [o.slug, o]));
    expect(bySlug['engagement']?.secondaryTerm).toBe('Nichayathartham');
    expect(bySlug['puberty-ceremony']?.secondaryTerm).toBe('Manjal Neerattu Vizha');
    expect(bySlug['ear-piercing']?.secondaryTerm).toBe('Kaadhu Kuthu');
    expect(bySlug['baby-shower']?.secondaryTerm).toBe('Valaikappu');
    expect(bySlug['housewarming']?.secondaryTerm).toBe('Gruhapravesam');
  });

  it('carries all 12 approved services and marks partner-vendor delivery', () => {
    expect(services).toHaveLength(12);

    const partner = services
      .filter((s) => s.deliveryModel === 'partner_vendor')
      .map((s) => s.slug)
      .sort();

    expect(partner).toEqual([
      'food-catering',
      'led-display-solutions',
      'makeup-styling',
      'photography-videography',
      'sounds-lightings',
    ]);
  });

  it('carries all 10 approved styles', () => {
    expect(styles).toHaveLength(10);
  });
});

describe('derived copy stays within what is approved', () => {
  it('describes a journey with four steps drawn from the approved flow', () => {
    expect(howItWorks).toHaveLength(4);
  });

  it('makes no superlative or guarantee claim anywhere in page copy', () => {
    const copy = [
      positioning.headline,
      positioning.brandRole,
      ...howItWorks.flatMap((s) => [s.title, s.body]),
      ...whyChooseUs.flatMap((r) => [r.title, r.body]),
    ]
      .join(' ')
      .toLowerCase();

    for (const forbidden of [
      'best',
      'number one',
      'no. 1',
      'cheapest',
      'guarantee',
      'award-winning',
      'leading',
      'unmatched',
      'world-class',
    ]) {
      expect(copy, `copy must not claim "${forbidden}"`).not.toContain(forbidden);
    }
  });
});

/**
 * Requirements section 16: customer budget ranges are never shown, and the
 * website never calculates a final quotation.
 */
describe('pricing presentation', () => {
  const packagesPage = readFileSync(
    fileURLToPath(new URL('../../app/packages/page.tsx', import.meta.url)),
    'utf8',
  );

  it('only ever displays a price supplied by an approved package row', () => {
    expect(packagesPage).toContain("pkg.pricingMode === 'starting_from'");
    expect(packagesPage).toContain('Custom quote');
  });

  it('performs no price arithmetic beyond converting stored paise to rupees', () => {
    const arithmetic = packagesPage.match(/[+\-*]\s*(price|total|amount)/gi);
    expect(arithmetic).toBeNull();
  });
});
