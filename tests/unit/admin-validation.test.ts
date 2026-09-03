import { describe, expect, it } from 'vitest';
import { isSlug, slugify } from '@/lib/slug';
import {
  DESIGN_FIELDS,
  ENQUIRY_UPDATE_FIELDS,
  OCCASION_FIELDS,
  PACKAGE_FIELDS,
  SERVICE_FIELDS,
  TESTIMONIAL_FIELDS,
  VIDEO_FIELDS,
  designSchema,
  enquiryUpdateSchema,
  occasionSchema,
  packageSchema,
  parseAdminForm,
  serviceSchema,
  testimonialSchema,
  videoSchema,
} from '@/lib/validation/admin';

/**
 * Admin input validation.
 *
 * The Admin Panel is behind authentication, and that is exactly why these tests
 * exist: it is tempting to treat an authenticated form as trusted input. It is
 * not. It is a browser posting bytes, and what it posts lands in columns the
 * public website renders.
 */

const DESIGN_ID = '7f1c2a3e-4b5d-4e7f-8a9b-0c1d2e3f4a5b';
const OTHER_ID = '1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d';

function form(values: Record<string, string | string[]>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      for (const entry of value) data.append(key, entry);
    } else {
      data.set(key, value);
    }
  }
  return data;
}

const validDesign = {
  name: 'Golden Mandap Setting',
  slug: '',
  occasionId: DESIGN_ID,
  description: 'A warm gold and ivory mandap.',
  location: 'Nagercoil',
  pricingMode: 'custom_quote',
  startingPrice: '',
  styleIds: [OTHER_ID],
  serviceIds: [DESIGN_ID],
  seoTitle: '',
  seoDescription: '',
};

describe('slugs', () => {
  it('reduce a name to a safe URL segment', () => {
    expect(slugify('Golden Mandap Setting')).toBe('golden-mandap-setting');
    expect(slugify('  Gold & Ivory!!  ')).toBe('gold-ivory');
    expect(slugify('Engagement / Nichayathārtham')).toBe('engagement-nichayathartham');
  });

  it('cannot produce a path, a query string or a script', () => {
    for (const hostile of [
      '../../etc/passwd',
      'a/b?c=d#e',
      '<script>alert(1)</script>',
      'javascript:alert(1)',
      '%2e%2e%2f',
    ]) {
      const slug = slugify(hostile);
      expect(slug, hostile).toMatch(/^[a-z0-9-]*$/);
      expect(slug, hostile).not.toContain('..');
    }
  });

  it('is bounded and never ends in a hyphen', () => {
    const long = slugify('a '.repeat(200));
    expect(long.length).toBeLessThanOrEqual(80);
    expect(long.endsWith('-')).toBe(false);
  });

  it('recognises a value that is already a slug', () => {
    expect(isSlug('golden-mandap-setting')).toBe(true);
    expect(isSlug('Golden Mandap')).toBe(false);
    expect(isSlug('')).toBe(false);
  });
});

describe('the design form', () => {
  it('accepts a complete design and generates its slug', () => {
    const result = parseAdminForm(designSchema, DESIGN_FIELDS, form(validDesign), [
      'styleIds',
      'serviceIds',
    ]);
    expect(result.success).toBe(true);
    expect(result.success && result.data.slug).toBe('golden-mandap-setting');
    expect(result.success && result.data.startingPrice).toBeNull();
  });

  it('requires a name', () => {
    const result = parseAdminForm(
      designSchema,
      DESIGN_FIELDS,
      form({ ...validDesign, name: '   ' }),
      ['styleIds', 'serviceIds'],
    );
    expect(result.success).toBe(false);
    expect(result.success === false && result.errors.name).toMatch(/enter a name/i);
  });

  it('sanitises an admin-supplied slug rather than trusting it', () => {
    const result = parseAdminForm(
      designSchema,
      DESIGN_FIELDS,
      form({ ...validDesign, slug: '../Secret Design/../' }),
      ['styleIds', 'serviceIds'],
    );
    expect(result.success && result.data.slug).toBe('secret-design');
  });

  it('stores money in paise, never as a float', () => {
    const result = parseAdminForm(
      designSchema,
      DESIGN_FIELDS,
      form({ ...validDesign, pricingMode: 'starting_from', startingPrice: '45,000' }),
      ['styleIds', 'serviceIds'],
    );
    expect(result.success && result.data.startingPrice).toBe(4_500_000);
  });

  it('refuses a price with decimals', () => {
    const result = parseAdminForm(
      designSchema,
      DESIGN_FIELDS,
      form({ ...validDesign, pricingMode: 'starting_from', startingPrice: '45000.50' }),
      ['styleIds', 'serviceIds'],
    );
    expect(result.success).toBe(false);
  });

  it('refuses a pricing mode and price that disagree, in both directions', () => {
    const missing = parseAdminForm(
      designSchema,
      DESIGN_FIELDS,
      form({ ...validDesign, pricingMode: 'starting_from', startingPrice: '' }),
      ['styleIds', 'serviceIds'],
    );
    expect(missing.success).toBe(false);

    const unwanted = parseAdminForm(
      designSchema,
      DESIGN_FIELDS,
      form({ ...validDesign, pricingMode: 'custom_quote', startingPrice: '45000' }),
      ['styleIds', 'serviceIds'],
    );
    expect(unwanted.success).toBe(false);
  });

  it('refuses a pricing mode that is not one of the two approved ones', () => {
    const result = parseAdminForm(
      designSchema,
      DESIGN_FIELDS,
      form({ ...validDesign, pricingMode: 'negotiable' }),
      ['styleIds', 'serviceIds'],
    );
    expect(result.success).toBe(false);
  });

  it('refuses a style or service selection that is not an identifier', () => {
    const result = parseAdminForm(
      designSchema,
      DESIGN_FIELDS,
      form({ ...validDesign, styleIds: ['not-a-uuid'] }),
      ['styleIds', 'serviceIds'],
    );
    expect(result.success).toBe(false);
  });

  it('de-duplicates a repeated selection', () => {
    const result = parseAdminForm(
      designSchema,
      DESIGN_FIELDS,
      form({ ...validDesign, styleIds: [OTHER_ID, OTHER_ID, OTHER_ID] }),
      ['styleIds', 'serviceIds'],
    );
    expect(result.success && result.data.styleIds).toEqual([OTHER_ID]);
  });

  it('reads only the fields it declares', () => {
    const data = form(validDesign);
    // The columns an admin form must never be able to set.
    data.set('status', 'published');
    data.set('published_at', '2020-01-01');
    data.set('id', OTHER_ID);

    const result = parseAdminForm(designSchema, DESIGN_FIELDS, data, [
      'styleIds',
      'serviceIds',
    ]);
    expect(result.success).toBe(true);
    expect(result.success && Object.keys(result.data)).not.toContain('status');
    expect(result.success && Object.keys(result.data)).not.toContain('id');
  });

  it('strips control and direction-override characters from text', () => {
    const result = parseAdminForm(
      designSchema,
      DESIGN_FIELDS,
      form({ ...validDesign, name: 'Golden‮ Mandap​' }),
      ['styleIds', 'serviceIds'],
    );
    expect(result.success && result.data.name).toBe('Golden Mandap');
  });
});

describe('the video form', () => {
  const base = { provider: 'youtube', url: '', caption: '', sortOrder: '0' };

  it('accepts a provider URL over https', () => {
    const result = parseAdminForm(
      videoSchema,
      VIDEO_FIELDS,
      form({ ...base, url: 'https://www.youtube.com/watch?v=abc123' }),
    );
    expect(result.success).toBe(true);
  });

  it('refuses a URL that belongs to another host', () => {
    // A stored URL becomes an iframe on a public page.
    const result = parseAdminForm(
      videoSchema,
      VIDEO_FIELDS,
      form({ ...base, url: 'https://evil.test/watch?v=abc' }),
    );
    expect(result.success).toBe(false);
    expect(result.success === false && result.errors.url).toMatch(/provider/i);
  });

  it('refuses a lookalike host', () => {
    const result = parseAdminForm(
      videoSchema,
      VIDEO_FIELDS,
      form({ ...base, url: 'https://youtube.com.evil.test/watch?v=abc' }),
    );
    expect(result.success).toBe(false);
  });

  it('refuses plain http and a javascript URL', () => {
    for (const url of [
      'http://www.youtube.com/watch?v=abc',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
    ]) {
      const result = parseAdminForm(videoSchema, VIDEO_FIELDS, form({ ...base, url }));
      expect(result.success, url).toBe(false);
    }
  });
});

describe('the enquiry update form', () => {
  it('accepts a step in the approved pipeline', () => {
    const result = parseAdminForm(
      enquiryUpdateSchema,
      ENQUIRY_UPDATE_FIELDS,
      form({ status: 'quotation_sent', internalNotes: 'Called, will send Monday.' }),
    );
    expect(result.success).toBe(true);
    expect(result.success && result.data.status).toBe('quotation_sent');
  });

  it('refuses a step that is not in the pipeline', () => {
    const result = parseAdminForm(
      enquiryUpdateSchema,
      ENQUIRY_UPDATE_FIELDS,
      form({ status: 'deleted', internalNotes: '' }),
    );
    expect(result.success).toBe(false);
  });

  it('turns empty notes into null rather than an empty string', () => {
    const result = parseAdminForm(
      enquiryUpdateSchema,
      ENQUIRY_UPDATE_FIELDS,
      form({ status: 'new', internalNotes: '   ' }),
    );
    expect(result.success && result.data.internalNotes).toBeNull();
  });

  it('keeps line breaks in notes but caps the length', () => {
    const long = parseAdminForm(
      enquiryUpdateSchema,
      ENQUIRY_UPDATE_FIELDS,
      form({ status: 'new', internalNotes: 'x'.repeat(6000) }),
    );
    expect(long.success).toBe(false);

    const multiline = parseAdminForm(
      enquiryUpdateSchema,
      ENQUIRY_UPDATE_FIELDS,
      form({ status: 'new', internalNotes: 'Line one\nLine two' }),
    );
    expect(multiline.success && multiline.data.internalNotes).toBe(
      'Line one\nLine two',
    );
  });
});

describe('packages, testimonials and taxonomy', () => {
  it('a package price is stored in paise and must match its mode', () => {
    const ok = parseAdminForm(
      packageSchema,
      PACKAGE_FIELDS,
      form({
        name: 'Wedding Essentials',
        slug: '',
        description: '',
        pricingMode: 'starting_from',
        startingPrice: '75000',
        status: 'draft',
        sortOrder: '1',
      }),
    );
    expect(ok.success && ok.data.startingPrice).toBe(7_500_000);
    expect(ok.success && ok.data.slug).toBe('wedding-essentials');
  });

  it('a package status is one of the three publication states', () => {
    const result = parseAdminForm(
      packageSchema,
      PACKAGE_FIELDS,
      form({
        name: 'Wedding Essentials',
        slug: '',
        description: '',
        pricingMode: 'custom_quote',
        startingPrice: '',
        status: 'live',
        sortOrder: '0',
      }),
    );
    expect(result.success).toBe(false);
  });

  it('a testimonial needs a name, a body and an approval state', () => {
    const result = parseAdminForm(
      testimonialSchema,
      TESTIMONIAL_FIELDS,
      form({
        name: 'Meena R',
        body: 'They made our wedding beautiful.',
        eventType: 'Wedding',
        approvalStatus: 'approved',
        displayOrder: '2',
      }),
    );
    expect(result.success).toBe(true);

    const missingBody = parseAdminForm(
      testimonialSchema,
      TESTIMONIAL_FIELDS,
      form({
        name: 'Meena R',
        body: '',
        eventType: '',
        approvalStatus: 'approved',
        displayOrder: '0',
      }),
    );
    expect(missingBody.success).toBe(false);
  });

  it('an occasion keeps its Tamil term and generates a slug', () => {
    const result = parseAdminForm(
      occasionSchema,
      OCCASION_FIELDS,
      form({
        name: 'Puberty Ceremony',
        secondaryTerm: 'Manjal Neerattu Vizha',
        slug: '',
        description: '',
        status: 'active',
        sortOrder: '5',
      }),
    );
    expect(result.success && result.data.slug).toBe('puberty-ceremony');
    expect(result.success && result.data.secondaryTerm).toBe('Manjal Neerattu Vizha');
  });

  it('a service must state how it is delivered', () => {
    const result = parseAdminForm(
      serviceSchema,
      SERVICE_FIELDS,
      form({
        name: 'Makeup & Styling',
        slug: '',
        description: '',
        deliveryModel: 'outsourced',
        status: 'active',
        sortOrder: '0',
      }),
    );
    expect(result.success).toBe(false);

    const partner = parseAdminForm(
      serviceSchema,
      SERVICE_FIELDS,
      form({
        name: 'Makeup & Styling',
        slug: '',
        description: '',
        deliveryModel: 'partner_vendor',
        status: 'active',
        sortOrder: '0',
      }),
    );
    expect(partner.success && partner.data.deliveryModel).toBe('partner_vendor');
  });
});
