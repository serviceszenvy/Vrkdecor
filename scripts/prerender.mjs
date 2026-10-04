// Prerender every route to static HTML so SEO/AEO content is crawlable without JS
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const client = path.join(root, 'dist/client')
const DOMAIN = (process.env.SITE_URL || 'https://www.vrkdecor.com').replace(/\/+$/, '')

const { render, metaFor } = await import(pathToFileURL(path.join(root, 'dist/server/entry-server.js')).href)

const template = fs.readFileSync(path.join(client, 'index.html'), 'utf8')

const ROUTES = [
  { url: '/', lang: 'en', base: '/' },
  { url: '/services', lang: 'en', base: '/services' },
  { url: '/our-work', lang: 'en', base: '/our-work' },
  { url: '/about', lang: 'en', base: '/about' },
  { url: '/contact', lang: 'en', base: '/contact' },
  { url: '/privacy-policy', lang: 'en', base: '/privacy-policy' },
  { url: '/terms', lang: 'en', base: '/terms' },
  { url: '/404', lang: 'en', base: '/404', out: '404.html' },
  { url: '/ta', lang: 'ta', base: '/' },
  { url: '/ta/services', lang: 'ta', base: '/services' },
  { url: '/ta/our-work', lang: 'ta', base: '/our-work' },
  { url: '/ta/about', lang: 'ta', base: '/about' },
  { url: '/ta/contact', lang: 'ta', base: '/contact' },
]

const LOCALIZED = ['/', '/services', '/our-work', '/about', '/contact']
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const getMeta = metaFor

function headFor(r) {
  const m = getMeta(r.base === '/404' ? '/404' : r.base, r.lang)
  const canonical = DOMAIN + (r.lang === 'ta' ? (r.base === '/' ? '/ta' : '/ta' + r.base) : (r.base === '/' ? '/' : r.base))
  const og = DOMAIN + '/assets/img/og.jpg'
  let fonts = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
  fonts += r.lang === 'ta'
    ? '<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Tamil:wght@400;600&family=Noto+Sans+Tamil:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">'
    : '<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">'
  let alternates = ''
  if (LOCALIZED.includes(r.base)) {
    const en = DOMAIN + (r.base === '/' ? '/' : r.base)
    const ta = DOMAIN + (r.base === '/' ? '/ta' : '/ta' + r.base)
    alternates = `<link rel="alternate" hreflang="en" href="${en}">\n<link rel="alternate" hreflang="ta" href="${ta}">\n<link rel="alternate" hreflang="x-default" href="${en}">`
  }
  const schema = (m.schema || []).map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')
  // LCP: preload the hero poster on home routes only (matching the breakpoint the video component uses)
  const preload = r.base === '/'
    ? '<link rel="preload" as="image" href="/assets/video/vrk-hero-poster.webp">\n'
    : ''
  return `<title>${esc(m.title)}</title>
${preload}
<meta name="description" content="${esc(m.desc)}">
${m.noindex ? '<meta name="robots" content="noindex">' : ''}
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="VRK Decor">
<meta property="og:title" content="${esc(m.title)}">
<meta property="og:description" content="${esc(m.desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta property="og:locale" content="${r.lang === 'ta' ? 'ta_IN' : 'en_IN'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(m.title)}">
<meta name="twitter:description" content="${esc(m.desc)}">
<meta name="twitter:image" content="${og}">
${alternates}
${fonts}
${schema}`
}

for (const r of ROUTES) {
  const appHtml = render(r.url)
  let html = template
    .replace('<!--app-head-->', headFor(r))
    .replace('<!--app-html-->', appHtml)
    .replace('<html lang="en">', `<html lang="${r.lang}">`)
  const out = r.out
    ? path.join(client, r.out)
    : path.join(client, r.url === '/' ? '' : r.url.slice(1), 'index.html')
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, html)
  console.log('prerendered', r.url, '->', path.relative(client, out))
}

// sitemap with hreflang alternates
const sm = ['<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
const urlset = [
  ...LOCALIZED.flatMap(b => {
    const en = DOMAIN + (b === '/' ? '/' : b)
    const ta = DOMAIN + (b === '/' ? '/ta' : '/ta' + b)
    const alt = `<xhtml:link rel="alternate" hreflang="en" href="${en}"/><xhtml:link rel="alternate" hreflang="ta" href="${ta}"/><xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>`
    const pr = b === '/' ? '1.0' : (b === '/our-work' || b === '/services') ? '0.9' : '0.7'
    return [
      `<url><loc>${en}</loc>${alt}<changefreq>monthly</changefreq><priority>${pr}</priority></url>`,
      `<url><loc>${ta}</loc>${alt}<changefreq>monthly</changefreq><priority>${pr}</priority></url>`,
    ]
  }),
  `<url><loc>${DOMAIN}/privacy-policy</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>`,
  `<url><loc>${DOMAIN}/terms</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>`,
]
fs.writeFileSync(path.join(client, 'sitemap.xml'), sm.concat(urlset, '</urlset>').join('\n'))
fs.writeFileSync(path.join(client, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`)

// deployment configs
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
    { source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ]},
  ],
}, null, 1))
fs.writeFileSync(path.join(client, '_redirects'), `/gallery /our-work 301\n/gallery/* /our-work 301\n/packages /services 301\n/quote /contact 301\n/privacy /privacy-policy 301\n`)
console.log('sitemap, robots, configs written')
