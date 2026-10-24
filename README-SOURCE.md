# VRK Decor website, version 2 (SEO, AEO and GEO upgrade)

This is your full project (React source, photos and videos) with the SEO upgrade applied on top of your latest `Vrkdecor-main` code. `SEO-REPORT.md` lists every change, every page title and description, the test results and the items still waiting for you.

## 1. Put it live

**Option A, GitHub (your existing way).** Replace the files in your GitHub repository with the contents of this folder, commit to `main` and push. The workflow in `.github/workflows/deploy.yml` runs `npm ci` and `npm run build`, then uploads `dist/client` to `public_html`. Nothing else is needed. Make sure the hidden `.github` folder and `.gitignore` are copied too.

**Option B, manual upload.** The separate `vrk-decor-deploy.zip` holds the finished site. Upload everything inside it to `public_html` (turn on "Show Hidden Files" first, the `.htaccess` file must go too).

Before either option, download a backup of the current `public_html` from cPanel.

After the upload, open these and check they load: `https://www.vrkdecor.com/`, `/services`, `/wedding-stage-decoration-nagercoil`, `/faq`, `/ta`, `/ta/faq`, `/llms.txt`, `/sitemap.xml`. Then check that `http://vrkdecor.com/about/` lands on `https://www.vrkdecor.com/about` in one step. Hard-refresh the home page, because browsers cache the old one.

## 2. After upload (one time, about 30 minutes)

1. **Google Search Console**: add the property `https://www.vrkdecor.com`, verify it, then submit `sitemap.xml` and `sitemap-images.xml`. Use URL Inspection on the home page and each service page and click "Request indexing".
2. **Bing Webmaster Tools**: import the site from Search Console (one click), submit the same two sitemaps. Bing results feed ChatGPT search and Copilot.
3. **IndexNow**: from the source folder run `npm run indexnow`. It tells Bing and other engines about every URL right away.
4. **Google Business Profile**: set the website link to `https://www.vrkdecor.com`, and make sure the name, address and phone match the website exactly.
5. **Rich Results Test**: test the home page, `/faq` and one service page at https://search.google.com/test/rich-results. They were validated locally, this confirms it on Google's side.
6. **PageSpeed Insights**: run https://pagespeed.web.dev on the live home page to get the real mobile score.

## 3. Things to fill in later (all in `source/src/site.js`)

| Setting | What to put |
|---|---|
| `GBP` | The full Google Maps link of the Business Profile (`https://www.google.com/maps/place/...`) instead of the share.google short link |
| `ANALYTICS.GA4_ID` | Google Analytics 4 ID, for example `G-XXXXXXXXXX`. A small consent notice appears automatically once this is set |
| `ANALYTICS.META_PIXEL_ID` | Meta (Facebook) Pixel ID |
| `VERIFY.google`, `VERIFY.bing` | Verification codes if you verify with an HTML tag instead of DNS |
| `YOUTUBE`, `LINKEDIN`, `X_PROFILE` | Profile links once created. They appear in the footer and in the schema automatically |
| `HERO.desktopVideo`, `HERO.mobileVideo` | Hero background video paths. Both currently play `/assets/video/vrk-hero.mp4`, the video from your original zip |

After any change, push to GitHub (the workflow rebuilds and uploads) or rebuild and upload `dist/client` yourself (section 3).

## 3. Building it yourself

```
npm ci
npm run build        # output: dist/client  (this is what gets uploaded)
```

Node 22 is required (already set in `package.json`). To build for another domain, set `SITE_URL` and `VITE_SITE_URL` first (see below).

Where things live:

- Business facts, links, hours, IDs, hero video files: `src/site.js`
- Service pages: `src/data/servicesIndex.js` (names, titles, short intros) and `src/data/servicePages.js` (full content)
- FAQ: `src/data/faq.js`
- Blog: `src/data/blogIndex.js` and `src/data/blog.js`
- Case studies of real events: `src/data/caseStudies.js` (empty, with instructions inside)
- Fixed page titles and descriptions: `src/data/meta.js`
- English and Tamil interface text: `src/i18n.js`
- Server rules (redirects, caching, security headers): `scripts/htaccess.tpl`, written into `dist/client/.htaccess` at build time
- Build, sitemap, llms.txt, robots.txt: `scripts/prerender.mjs`

Domain: it defaults to `https://www.vrkdecor.com`. For another domain run `VITE_SITE_URL=https://example.com SITE_URL=https://example.com npm run build`. The `.htaccess` redirects follow that domain.

## 4. Hero video

The hero shows a still photo first, then your reel video fades in after the page has loaded. Desktop plays `vrk-hero-reel.webm` (MP4 fallback). Phones play `vrk-hero-reel-mobile-lite.webm` (MP4 fallback), a lighter copy of your phone reel at about 0.8 MB, because your own phone files (2.6 and 3.2 MB) are heavy for mobile data. Your original phone files are still in `public/assets/video/` and can be selected in `HERO` in `src/site.js`. The video does not load on Data Saver, slow connections or "reduce motion", where the photo stays.
