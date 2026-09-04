/**
 * Founder & CEO section content — redesign brief sections 13–15.
 *
 * Kept separate from `business.ts`, which is locked to the original
 * Requirements & SOW document (section 2/3/18) and is asserted against by
 * `tests/unit/content.test.ts`. This is new content the redesign brief itself
 * supplies verbatim as safe, approved copy — it deliberately does NOT invent
 * any achievement, award, year of experience or client count beyond what the
 * brief gave: only role, vision and approach are described, in the brief's own
 * words.
 */
export const founder = {
  name: 'V. Raja Kumerasen',
  role: 'Founder & CEO',
  bio: [
    'At the heart of VRK Decor is V. Raja Kumerasen, Founder and CEO, whose vision is to create celebrations that feel personal, beautifully designed and thoughtfully executed.',
    'Its approach combines creativity, attention to detail and an understanding of how every celebration should reflect the people behind it.',
  ],
} as const;

/**
 * The founder photograph is not yet supplied (redesign brief section 15).
 * `isPlaceholder: true` drives the visual placeholder in `FounderPortrait`;
 * once VRK Decor provides an approved photograph, add it under
 * `public/brand/`, set `src` here and flip this to `false` — nothing else
 * needs to change, matching the same single-replacement-point pattern used
 * for the home hero image (`lib/content/hero-media.ts`).
 */
export const founderPhoto = {
  src: null as string | null,
  alt: '',
  isPlaceholder: true,
} as const;
