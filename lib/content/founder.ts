import type { StaticImageData } from 'next/image';

/**
 * The founder section on the About page.
 *
 * The name and role were supplied in the refinement brief of 2026-09-05. The
 * supporting copy is deliberately positional rather than biographical: it
 * describes his role, vision and approach and states no achievement, award,
 * year count, client count or claim that has not been provided.
 *
 * `portrait` is the single replacement point for the real photograph. It is
 * `null` until VRK Decor supplies one, and `components/page/founder-portrait.tsx`
 * renders a designed placeholder in the meantime. To replace it:
 *
 *   import founderPhoto from '@/public/brand/founder.jpg';
 *   portrait: { src: founderPhoto, alt: 'V. Raja Kumerasen, Founder and CEO of VRK Decor' }
 *
 * Nothing else on the page needs to change.
 */
export type FounderPortrait = {
  src: StaticImageData | string;
  alt: string;
};

export const founder = {
  name: 'V. Raja Kumerasen',
  role: 'Founder and CEO',
  intro:
    'At the heart of VRK Decor is V. Raja Kumerasen, Founder and CEO, whose vision is to create celebrations that feel personal, beautifully designed and thoughtfully executed.',
  approach:
    'His approach combines creativity, attention to detail and an understanding that every celebration should reflect the people behind it. He is involved from the first conversation to the last light being switched off, and he expects the same care from the whole team.',
  principles: [
    {
      title: 'Personal before impressive',
      body: 'A setting should say something about the family, not just fill a hall.',
    },
    {
      title: 'Designed, then built properly',
      body: 'Good ideas are only good when they stand up on the day, in the venue, on time.',
    },
    {
      title: 'One team, one conversation',
      body: 'Whatever the celebration needs, the customer talks to one team that takes responsibility for all of it.',
    },
  ],
  portrait: null as FounderPortrait | null,
} as const;
