# Page content

## Where content comes from

| Source                    | Used for                                                                        | Owner                                                            |
| ------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `lib/site-config.ts`      | Brand name, domain, phone, WhatsApp, email, address, coverage                   | Requirements section 2                                           |
| `lib/content/business.ts` | Positioning, credentials, coverage, how-it-works, why-choose points             | Requirements sections 2, 3, 18 and the approved customer journey |
| `lib/content/catalog.ts`  | Occasions, services, styles                                                     | Requirements sections 5, 6, 8                                    |
| Supabase                  | Designs, packages, testimonials, and admin-edited occasion/service descriptions | VRK Decor, via the Admin Panel (P8)                              |

Pages prefer database rows when Supabase is configured, so VRK Decor's own edits
win. `lib/content` is the fallback that keeps the site rendering before the
database is connected, and a unit test fails if the two disagree.

## Rules

- **No unsupported claims.** Figures are printed exactly as approved and never
  rounded. There is no "best", "leading", "award-winning", "guaranteed" or
  ranking claim anywhere; unit tests and an end-to-end test both check for them.
- **Partner-vendor delivery is displayed, not hidden.** Requirements section 3
  requires it to be represented accurately, so the Services page separates
  in-house work from partner-delivered services and badges the latter.
- **Prices are only ever admin-entered.** Packages show a "starting from" price
  only when a published package row carries one; everything else says "Custom
  quote". No customer budget range is shown and the site performs no pricing
  arithmetic beyond converting stored paise to rupees.
- **Empty states rather than filler.** Where a section is driven by content VRK
  Decor has not yet added — designs, packages, testimonials — the page shows an
  honest empty state. Inventing placeholder work would put unapproved claims on
  a live site.

## What still needs client input

| Item                                         | Blocks                  | Note                                                                                                                                                   |
| -------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Approved hero photograph or video            | Home page               | Requirements section 7 asks for a premium hero image or video. A deliberate brand panel stands in; the layout accepts a photograph or video unchanged. |
| Portfolio photography and designs            | Home, Our Work, Gallery | Entered through the Admin Panel (P8). Until then those sections show empty states.                                                                     |
| Approved testimonials                        | Home                    | Entered and approved through the Admin Panel.                                                                                                          |
| Published packages                           | Packages                | Including any approved "starting from" prices.                                                                                                         |
| Instagram / social account handle            | Home                    | Requirements section 7 lists a social showcase. No account was supplied, so the section is not built rather than invented.                             |
| Before/after pairs                           | Home, portfolio         | "Where available" per the requirements; none supplied yet.                                                                                             |
| Legal review of the Privacy Policy and Terms | Both legal pages        | Drafted from the site's real data handling and marked with a visible draft notice.                                                                     |
| Retention period                             | Privacy Policy          | An open decision; the page says it is being confirmed rather than stating a figure.                                                                    |
| Analytics provider and cookie notice         | Privacy Policy          | Confirmed in P9.                                                                                                                                       |

Every draft notice must be removed before production sign-off (P11/P12); they
carry a `data-draft-notice` attribute so they are easy to find.
