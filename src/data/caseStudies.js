// Case studies of real VRK Decor events. EMPTY on purpose: add an entry only for a real event, with the family's
// permission for the photos. Each entry becomes a page at /our-work/<slug>.
// Set draft: true while you are still collecting details. Drafts are built with noindex, are not linked
// anywhere and stay out of the sitemap. Remove draft (or set it to false) to publish.
//
// Example shape (copy, fill with real details, and put photos in public/assets/img/work/ using the same
// four sizes as the portfolio: -480.webp, -800.webp, -960.webp, -1600.webp and -full.jpg):
// {
//   slug: 'pastel-church-wedding-nagercoil',
//   draft: true,
//   date: '2026-11-15',                       // event date
//   eventType: 'Church wedding and reception',
//   venue: 'Name of the church and hall',
//   area: 'Nagercoil',
//   theme: 'Pastel flowers with white drapes',
//   colours: 'Blush pink, ivory and soft green',
//   special: 'One or two lines on what made this event special, in the family’s words if possible.',
//   photos: ['photo-slug-1', 'photo-slug-2', 'photo-slug-3', 'photo-slug-4'],
//   service: 'wedding-stage-decoration-nagercoil', // related service page
// },
export const CASE_STUDIES = []

export const caseBySlug = slug => CASE_STUDIES.find(c => c.slug === slug)
