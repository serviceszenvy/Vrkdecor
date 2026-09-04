# features/portfolio

The portfolio: designs, media, filters, gallery and the quote calls to action
(P5).

## The rule everything else follows

**A Design is the parent entity.** Every image belongs to exactly one Design and
inherits its occasion, styles, services, location and description. Only
`alt_text` may be overridden per image. There is never a second Design record
for a related photograph.

That rule is enforced structurally rather than by convention:

- `PortfolioPhoto` is `{ image, design }` — a photograph cannot be represented
  without its parent, so it cannot be rendered, linked or quoted without one.
- `toPhotos()` is the only way to flatten designs into photographs, and it
  copies the parent onto each.
- `designQuoteHref(designSlug, imageId?)` always carries the design. The photo
  id is optional context; the design is not.
- The database cascades and RLS make a child row invisible unless its parent
  Design is published.

## Files

| File            | Purpose                                                                       |
| --------------- | ----------------------------------------------------------------------------- |
| `types.ts`      | View models plus `coverImage`, `toPhotos`, `matchesFilters`, `sortForListing` |
| `data.ts`       | Published-only reads, filter options, sample fallback                         |
| `image-url.ts`  | Storage key to renderable URL                                                 |
| `quote-link.ts` | Design detail and quote hrefs                                                 |
| `components/`   | Card, grid, filter bar, gallery, lightbox, video embed, sample notice         |

## Behaviour worth knowing

- **Filters are links, not client state.** Occasion, style and service are query
  parameters, so every filtered view is shareable, works without JavaScript and
  is ordinary keyboard navigation.
- **Style and service filtering happens in memory** after one query. Those live
  behind join tables, and the PostgREST inner-join syntax for them cannot be
  integration-tested without a live Supabase project. Correct and fast at a
  decorator's scale; move it into the query if the portfolio reaches thousands
  of designs.
- **Reads are bounded by a timeout** so an unreachable database degrades to an
  empty portfolio rather than hanging the page.
- **The lightbox is a real dialog**: focus trap, Escape to close with focus
  returned to the thumbnail, arrow-key navigation, horizontal swipe with
  vertical intent ignored, and body scroll locking. It is portalled so no
  ancestor stacking context can trap it.
- **Video is URL-only** in Phase 1. Only recognised providers are embedded, via
  `youtube-nocookie.com`; anything else degrades to a plain link rather than
  injecting an arbitrary iframe source.

## Sample content

When Supabase is not configured, the portfolio renders the procedurally
generated placeholder set in `lib/content/sample-portfolio.ts` and
`public/samples/`, and every portfolio surface shows a visible notice. Samples
can never appear in staging or production, where Supabase is configured; a unit
test asserts that invariant. Both must be deleted before the production build.
