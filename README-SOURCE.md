# VRK Decor — React source (v3)

Full project source. Heavy media (public/assets/img/work/, img/hero/, video/) is left out of this zip to keep it small — copy those folders from the deploy zip (vrk-decor-website-react-v3.zip → assets/img/work, assets/img/hero, assets/video) into public/ before building.

Build: npm install, then npm run build. Output lands in dist/client — that folder is exactly what you deploy (it already contains vercel.json, sitemap.xml, robots.txt).

## Production domain

The domain is configurable. It defaults to https://www.vrkdecor.com. To build for another domain set both variables before the build:

VITE_SITE_URL=https://example.com SITE_URL=https://example.com npm run build

This updates canonical URLs, Open Graph URLs, hreflang alternates, the sitemap and all structured data.

## Hero video selection (v3)

Two videos were supplied for the hero. The selected video is the 10 second white-and-green floral stage reel (the Gemini generated file): it matches the brand palette, loops smoothly, and reads well behind text. The 3 second WhatsApp clip was not used because a 3 second loop restarts visibly, its resolution is lower, and it includes a couple's name sign.

Where it is used: assets/video/vrk-hero-v3.mp4 is the desktop and tablet hero background (1280x720, 1.3 MB). assets/video/vrk-hero-v3-mobile.mp4 is a portrait center crop (480x744, 0.5 MB) that phones download instead — the component picks one source at load, so only one file is ever downloaded. Each has its own poster image.

## v3 changes

Full-bleed cinematic hero video with localized text gradient and entrance motion, hero fits 100svh on every device. Inner pages now start with real content under a compact title row instead of tall intro bands. Services expanded to 22 entries including Temple, Church, Fresh Flowers, Bouquets and Garlands (Garlands, Band Set and Sound are marked Partner Service). Featured asymmetric services layout. Refined circular glass check chips and a consistent icon set. Facebook (facebook.com/vrkdecor) added to the footer, contact page and LocalBusiness sameAs schema. Staggered scroll reveals, proprietor photo mask reveal, button and card hover polish, all behind prefers-reduced-motion.
