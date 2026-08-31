# components/layout

Application shell (P2): header, primary and mobile navigation, footer and the
persistent mobile action bar required by the Requirements & SOW section 4.

The shell links to the approved site structure via `lib/navigation.ts`. The
pages themselves are created by later phases — P4 (public pages), P5 (portfolio)
and P6 (`/quote`). Until then those links resolve to the styled 404 page.

WhatsApp and phone links are plain click-to-chat and `tel:` hrefs built from the
approved business contact details. Prefilled WhatsApp messages (P7) and
analytics instrumentation (P9) are added by those phases.
