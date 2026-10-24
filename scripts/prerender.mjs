// Prerender every route to static HTML so all content, meta tags and structured data are in the raw HTML
// (no JavaScript needed for search engines or AI crawlers). Also writes sitemaps, robots.txt, llms.txt and host configs.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import Beasties from 'beasties'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const client = path.join(root, 'dist/client')
const DOMAIN = (process.env.SITE_URL || 'https://www.vrkdecor.com').replace(/\/+$/, '')

const S = await import(pathToFileURL(path.join(root, 'dist/server/entry-server.js')).href)
const { render, metaFor, notFoundMeta, PAGES, taPath, SERVICE_PAGES, POSTS, WORKS, FAQ_GROUPS, SITE } = S

const template = fs.readFileSync(path.join(client, 'index.html'), 'utf8')
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const staticFiles = fs.readdirSync(path.join(client, 'static'))
const fontUrl = prefix => { const f = staticFiles.find(n => n.startsWith(prefix) && n.endsWith('.woff2')); return f ? '/static/' + f : null }
const FONT_EN = fontUrl('instrument-serif-latin-400-normal')
const FONT_TA = fontUrl('noto-serif-tamil-tamil-400-normal')
const FONT_TA_BODY = fontUrl('noto-sans-tamil-tamil-400-normal')

// ---------- route list (English + Tamil) ----------
const ROUTES = []
for (const p of PAGES) {
  ROUTES.push({ url: p.path, base: p.path, lang: 'en', page: p })
  if (p.ta) ROUTES.push({ url: taPath(p.path), base: p.path, lang: 'ta', page: p })
}

function headFor(r, m) {
  const canonical = DOMAIN + (r.url === '/' ? '/' : r.url)
  const alt = []
  if (r.page && r.page.ta) {
    const en = DOMAIN + (r.base === '/' ? '/' : r.base)
    const ta = DOMAIN + taPath(r.base)
    alt.push(`<link rel="alternate" hreflang="en" href="${en}">`, `<link rel="alternate" hreflang="ta" href="${ta}">`, `<link rel="alternate" hreflang="x-default" href="${en}">`)
  }
  const font = r.lang === 'ta' ? FONT_TA : FONT_EN
  const lines = [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.desc)}">`,
    m.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">',
    `<link rel="canonical" href="${canonical}">`,
    ...alt,
    font ? `<link rel="preload" as="font" type="font/woff2" href="${font}" crossorigin>` : '',
    r.lang === 'ta' && FONT_TA_BODY ? `<link rel="preload" as="font" type="font/woff2" href="${FONT_TA_BODY}" crossorigin>` : '',
  ]
  if (r.base === '/') {
    lines.push(
      `<link rel="preload" as="image" href="${SITE.HERO.mobilePoster}" media="(max-width:700px)" fetchpriority="high">`,
      `<link rel="preload" as="image" href="${SITE.HERO.desktopPosterSmall}" media="(min-width:701px) and (max-width:1200px)" fetchpriority="high">`,
      `<link rel="preload" as="image" href="${SITE.HERO.desktopPoster}" media="(min-width:1201px)" fetchpriority="high">`,
    )
  }
  lines.push(
    '<meta property="og:type" content="' + (r.page && r.page.kind === 'post' ? 'article' : 'website') + '">',
    '<meta property="og:site_name" content="VRK Decor">',
    `<meta property="og:title" content="${esc(m.title)}">`,
    `<meta property="og:description" content="${esc(m.desc)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${m.og}">`,
    `<meta property="og:locale" content="${r.lang === 'ta' ? 'ta_IN' : 'en_IN'}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(m.title)}">`,
    `<meta name="twitter:description" content="${esc(m.desc)}">`,
    `<meta name="twitter:image" content="${m.og}">`,
    '<meta name="geo.region" content="IN-TN">',
    '<meta name="geo.placename" content="Nagercoil">',
    `<meta name="geo.position" content="${SITE.GEO.lat};${SITE.GEO.lng}">`,
  )
  if (SITE.VERIFY.google) lines.push(`<meta name="google-site-verification" content="${esc(SITE.VERIFY.google)}">`)
  if (SITE.VERIFY.bing) lines.push(`<meta name="msvalidate.01" content="${esc(SITE.VERIFY.bing)}">`)
  if (m.graph) lines.push(`<script type="application/ld+json">${JSON.stringify(m.graph).replace(/</g, '\\u003c')}</script>`)
  return lines.filter(Boolean).join('\n')
}

const beasties = new Beasties({ path: client, publicPath: '/', preload: 'media', pruneSource: false, reduceInlineStyles: false, logLevel: 'warn', fonts: false })

// The page is fully prerendered, so the app script (menus, quote form, gallery viewer) can start after the page
// has loaded. This keeps the first paint free of JavaScript downloads on slow mobile connections.
// The reveal-on-scroll effect runs from a tiny inline script so nothing above the fold waits for the app.
const REVEAL = `<script>(function(){var d=document,els=d.querySelectorAll('.reveal');if(!('IntersectionObserver'in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){els.forEach(function(e){e.classList.add('in')});return}var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{threshold:0.12,rootMargin:'0px 0px -6% 0px'});els.forEach(function(e){io.observe(e)})})()</script>`
function deferApp(html) {
  const m = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)
  if (!m) throw new Error('app script tag not found')
  // start on the first scroll, tap or key press, or 1.5 s after the page has loaded, whichever comes first
  const loader = `<script>(function(){var done=0,ev=['scroll','pointerdown','touchstart','keydown'];var go=function(){if(done)return;done=1;ev.forEach(function(e){removeEventListener(e,go,true)});var s=document.createElement('script');s.type='module';s.crossOrigin='';s.src='${m[1]}';document.body.appendChild(s)};ev.forEach(function(e){addEventListener(e,go,{capture:true,passive:true,once:true})});var later=function(){setTimeout(go,1500)};if(document.readyState==='complete')later();else addEventListener('load',later,{once:true})})()</script>`
  return html.replace(m[0], '').replace('</body>', REVEAL + loader + '\n</body>')
}

async function write(r, out, m, appHtml) {
  let html = template
    .replace('<!--app-head-->', headFor(r, m))
    .replace('<!--app-html-->', appHtml)
    .replace('<html lang="en">', `<html lang="${r.lang}">`)
    // the home hero is dark: set the light header colours in the static HTML so they do not flip when the app script loads
    .replace('<body>', r.base === '/' ? '<body class="hero-dark">' : '<body>')
  html = (await beasties.process(html)).replace(' data-beasties-container', '')
  html = deferApp(html)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, html)
}

for (const r of ROUTES) {
  const m = metaFor(r.base, r.lang)
  const out = path.join(client, r.url === '/' ? '' : r.url.slice(1), 'index.html')
  await write(r, out, m, render(r.url))
  console.log('prerendered', r.url, m.noindex ? '(noindex draft)' : '')
}
// one 404 page for every missing URL (bilingual content)
await write({ url: '/404', base: '/404', lang: 'en', page: null }, path.join(client, '404.html'), notFoundMeta(), render('/this-page-does-not-exist'))
console.log('prerendered 404.html')

// ---------- sitemaps ----------
const LASTMOD = SITE.LAST_UPDATED
const live = ROUTES.filter(r => !r.page.draft)
const sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
for (const r of live) {
  const loc = DOMAIN + (r.url === '/' ? '/' : r.url)
  let alt = ''
  if (r.page.ta) {
    const en = DOMAIN + (r.base === '/' ? '/' : r.base); const ta = DOMAIN + taPath(r.base)
    alt = `<xhtml:link rel="alternate" hreflang="en" href="${en}"/><xhtml:link rel="alternate" hreflang="ta" href="${ta}"/><xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>`
  }
  sm.push(`<url><loc>${loc}</loc>${alt}<lastmod>${LASTMOD}</lastmod><priority>${r.page.priority || '0.5'}</priority></url>`)
}
sm.push('</urlset>')
fs.writeFileSync(path.join(client, 'sitemap.xml'), sm.join('\n'))

const img = s => `${DOMAIN}/assets/img/work/${s}-full.jpg`
const W = Object.fromEntries(WORKS.map(w => [w.slug, w]))
const imgEntry = s => `<image:image><image:loc>${img(s)}</image:loc></image:image>`
const ism = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">']
ism.push(`<url><loc>${DOMAIN}/our-work</loc>${WORKS.map(w => imgEntry(w.slug)).join('')}</url>`)
for (const p of SERVICE_PAGES) ism.push(`<url><loc>${DOMAIN}/${p.slug}</loc>${p.photos.filter(s => W[s]).map(imgEntry).join('')}</url>`)
for (const p of POSTS) {
  const imgs = [p.cover, ...p.sections.map(s => s.img).filter(Boolean)].filter((s, i, a) => W[s] && a.indexOf(s) === i)
  ism.push(`<url><loc>${DOMAIN}/blog/${p.slug}</loc>${imgs.map(imgEntry).join('')}</url>`)
}
ism.push('</urlset>')
fs.writeFileSync(path.join(client, 'sitemap-images.xml'), ism.join('\n'))

// ---------- robots.txt: every search and AI crawler is welcome ----------
const bots = ['Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot', 'DuckDuckBot']
fs.writeFileSync(path.join(client, 'robots.txt'),
  bots.map(b => `User-agent: ${b}\nAllow: /\n`).join('\n') + `\nUser-agent: *\nAllow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\nSitemap: ${DOMAIN}/sitemap-images.xml\n`)

// ---------- llms.txt (no prices, per the price rule) ----------
const svcLines = SERVICE_PAGES.map(p => `- [${p.en.name}](${DOMAIN}/${p.slug}): ${p.en.lead}`).join('\n')
const faqLines = FAQ_GROUPS.flatMap(g => g.items).filter(i => !i.faqOnly).map(i => `- ${i.en[0]} ${i.en[1]}`).join('\n')
const llms = `# VRK Decor

> ${SITE.OFFICIAL_DESC}

VRK Decor is also known as ${SITE.ALT_NAMES.join(', ')}. The website is in English and Tamil.

## Contact
- Address: ${SITE.ADDRESS}
- Phone and WhatsApp: ${SITE.PHONE_DISPLAY}
- Email: ${SITE.EMAIL}
- Shop hours: ${SITE.HOURS.label}. Phone and WhatsApp are also answered outside these hours.
- Google Business Profile: ${SITE.GBP} (rated ${SITE.GOOGLE_RATING.value} from ${SITE.GOOGLE_RATING.count} reviews)
- Map: ${SITE.MAPS}
- Instagram: ${SITE.IG}
- Facebook: ${SITE.FB}
- Justdial: ${SITE.JUSTDIAL}
- IndiaMART: ${SITE.INDIAMART}

## Key facts
- Founded in December 2011 by proprietor ${SITE.PROPRIETOR}
- More than 700 celebrations decorated
- Team of more than ${SITE.TEAM_SIZE} people
- Service area: all of Kanyakumari district (Nagercoil, Kanyakumari, Suchindram, Thuckalay, Marthandam, Kuzhithurai, Colachel, Eraniel and nearby towns), plus Tirunelveli, Thoothukudi, Thiruvananthapuram and Madurai, other parts of Tamil Nadu and anywhere in India on request
- Marriage halls regularly decorated: Ganga Grandeur, Y.R. Mahal, Perumal Thirumana Mandapam, Shree Lakshman Mahal, VMS Mahal, AMOHAA PALACE Kalyana Mandapam, P.S. Mahal, GPK Mahal, Madha Maaligai
- Band set, sound and AV, and garlands are arranged through partner vendors

## Services
${svcLines}

## Main pages
- [Home](${DOMAIN}/)
- [All services](${DOMAIN}/services)
- [Portfolio of ${WORKS.length} real designs](${DOMAIN}/our-work)
- [Frequently asked questions](${DOMAIN}/faq)
- [About VRK Decor](${DOMAIN}/about)
- [Contact](${DOMAIN}/contact)
- [Blog](${DOMAIN}/blog)
${POSTS.map(p => `- [${p.h1}](${DOMAIN}/blog/${p.slug})`).join('\n')}

## Tamil site
- [தமிழ் முகப்பு](${DOMAIN}/ta)
- [சேவைகள்](${DOMAIN}/ta/services)
- [கேள்வி பதில்](${DOMAIN}/ta/faq)

## Common questions
${faqLines}
`
fs.writeFileSync(path.join(client, 'llms.txt'), llms)

// ---------- Apache / LiteSpeed (cPanel hosting): .htaccess from scripts/htaccess.tpl, follows the SITE_URL domain ----------
const host = new URL(DOMAIN).host
fs.writeFileSync(path.join(client, '.htaccess'), fs.readFileSync(path.join(__dirname, 'htaccess.tpl'), 'utf8')
  .replaceAll('{{DOMAIN}}', DOMAIN).replaceAll('{{HOST_RX}}', host.replace(/\./g, '\\.')))

// ---------- host configs (Vercel / Netlify, if used) ----------
fs.writeFileSync(path.join(client, 'vercel.json'), JSON.stringify({
  cleanUrls: true, trailingSlash: false,
  redirects: [
    { source: '/gallery', destination: '/our-work', permanent: true },
    { source: '/gallery/(.*)', destination: '/our-work', permanent: true },
    { source: '/packages', destination: '/services', permanent: true },
    { source: '/quote', destination: '/contact', permanent: true },
    { source: '/privacy', destination: '/privacy-policy', permanent: true },
  ],
  headers: [
    { source: '/static/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }] },
    { source: '/(.*)', headers: [
      { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] },
  ],
}, null, 1))
fs.writeFileSync(path.join(client, '_redirects'), `/gallery /our-work 301\n/gallery/* /our-work 301\n/packages /services 301\n/quote /contact 301\n/privacy /privacy-policy 301\n`)
console.log('sitemaps, robots.txt, llms.txt and host configs written')
