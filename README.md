# VRK Decor — website redesign

A complete rebuild of the VRK Decor site in the glassmorphism / motion-first
direction described in the brief. Next.js App Router, React 19, Tailwind CSS v4,
TypeScript. All existing content, pages and routes are preserved. Only the
visual, layout and interaction layer is new.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Node 20 or newer.

## What is in here

```
src/
  app/                     one route per page, all server components
    globals.css            the entire design system (tokens, glass, motion)
    layout.tsx             fonts, metadata, LocalBusiness schema, shell
    page.tsx               Home
    our-work/ services/ packages/ gallery/ about/ contact/ quote/
    privacy-policy/ terms/ not-found.tsx sitemap.ts robots.ts
  components/
    layout/                Header (mega menu + mobile overlay), Footer
    home/                  the twelve Home sections
    forms/                 Contact form, multi-step Quote form
    motion/MotionRoot.tsx  the whole motion system, one client component
    ui/                    Icon set, SectionHeading, LeafDivider, PageHero
  fonts/                   Fraunces and Manrope, self hosted
  lib/content/site.ts      every piece of business copy and data
public/images/             placeholder imagery (see below)
scripts/                   placeholder generator, screenshot tooling
```

## Design system

Colours are sampled from the logo and live as CSS custom properties in
`globals.css`.

| Role | Token | Value |
|---|---|---|
| Brand accent | `--color-lime-500` | `#7CB342` |
| Deep secondary | `--color-olive-500` | `#5B6E4C` |
| Light ground | `--color-ivory` | `#F7F8F4` |
| Dark ground | `--color-bark-500` | `#2A3324` |

The thing that keeps the glass readable is a five layer depth ladder,
`--l0` through `--l4`. Every layer differs in luminance, blur, border
brightness and shadow at the same time, so a card never sits at the same
visual depth as the surface behind it. Adding `.band-dark` to a section flips
the whole ladder, which is how the dark cinematic bands work without a second
stylesheet.

Glass classes: `.glass` (resting), `.glass-recessed`, `.glass-raised`,
`.glass-float`, plus `.glass-sheen` for the top edge highlight and
`.glass-lime` for a brand tinted panel.

Typography is Fraunces for display and Manrope for text, both self hosted as
variable woff2, both fluid through `clamp()`. Heading sizes are `.t-display`,
`.t-1`, `.t-2`, `.t-3`.

## Motion

`MotionRoot` is the only client component driving animation, which keeps every
page a server component. Behaviour is attached by data attribute:

| Attribute | Effect |
|---|---|
| `data-reveal="up\|left\|right\|scale"` | scroll-in reveal, stagger with `--i` |
| `data-magnetic="0.3"` | pointer-attracted button |
| `data-tilt="6"` | 3D tilt on pointer move |
| `data-parallax="24"` | pointer parallax |
| `data-countup="600"` | animated number |
| `data-cursor-glow` | pointer-following brand glow |

Everything respects `prefers-reduced-motion`. Under reduced motion the site
falls back to plain fades with no parallax, tilt, or looping animation.

## Logo

`public/logo.png` is the supplied VRK Decor artwork, background removed and
trimmed. `public/logo-light.png` is the same mark with the deep olive lifted to
a pale sage so it stays legible on the dark footer and the mobile menu.
Regenerate both from a new source file with `python3 scripts/make-logo.py`.

## Images

`public/images/*.svg` are generated abstract placeholders, not photographs.
They exist so the layout can be judged without stock imagery. Replace every
file with real event photography before launch, keep the file names and aspect
ratios, and nothing else needs to change. Regenerate them with:

```bash
python3 scripts/gen-placeholders.py
```

Because the placeholders are SVG, `next.config.ts` currently sets
`dangerouslyAllowSVG` with a strict image CSP. Once real JPEGs are in place you
can remove those three lines.

## Accessibility

Semantic landmarks and heading order, a skip link, visible focus rings,
keyboard-operable mega menu and mobile menu with Escape to close, ARIA state on
the disclosure buttons, alt text on every image, and a reduced-motion fallback.
Text on glass is always dark ink on a light panel or light ink on a dark panel,
never light on light.

## Forms

Contact and Quote validate on the client and show inline errors and a success
state. They do not post anywhere yet. Wire `ContactForm` and `QuoteForm` to
your enquiry endpoint, keeping the existing rule that reference images stay
private to the admin panel.

## Screenshots

`shots/` holds the captures used for review: full page and above the fold, for
desktop at 1440px and mobile at 390px. Regenerate with the site running:

```bash
npm start &
node scripts/shoot.mjs && python3 scripts/stitch.py home-desktop home-mobile
node scripts/shoot-fold.mjs
```

Full page captures are stitched from viewport tiles on purpose. A single
`fullPage` screenshot drops backdrop-filter layers in Chromium and comes back
with blank stretches.

## Known gaps before launch

- Real photography to replace the generated placeholders in `public/images`
- Published packages, once they are finalised
- Reviews, once they have been checked and approved
- Gallery lightbox and portfolio detail routes
- Forms need a backend

## Content

All copy, navigation, metrics and contact details are taken from the live site
so this stays a redesign and not a rewrite. Everything lives in
`src/lib/content/site.ts`, including the section headings, so the whole site can
be re-worded from one file.
