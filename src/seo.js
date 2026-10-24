import {
  DOMAIN, BRAND, ALT_NAMES, OFFICIAL_DESC, OFFICIAL_DESC_TA, PHONE_DISPLAY, EMAIL, STREET, GEO, HOURS, FOUNDED, TEAM_SIZE,
  MAPS, SAME_AS, PROPRIETOR, LAST_UPDATED,
} from './site.js'
import { SERVICE_PAGES, servicePageBySlug } from './data/servicePages.js'
import { POSTS, postBySlug } from './data/blog.js'
import { FAQ_GROUPS } from './data/faq.js'
import { WORKS } from './data/content.js'
import { pageFor, taPath } from './routes.js'
import { STATIC_META, caseMeta } from './data/meta.js'
import { caseBySlug } from './data/caseStudies.js'

const BIZ = DOMAIN + '/#business'
const SITE = DOMAIN + '/#website'
const FOUNDER = DOMAIN + '/#founder'
const full = slug => `${DOMAIN}/assets/img/work/${slug}-full.jpg`
const OG_DEFAULT = DOMAIN + '/assets/img/og.jpg'

// ---------- shared entities ----------
const AREA_CITIES = ['Nagercoil', 'Kanyakumari', 'Suchindram', 'Thuckalay', 'Marthandam', 'Kuzhithurai', 'Colachel', 'Eraniel', 'Tirunelveli', 'Thoothukudi', 'Thiruvananthapuram', 'Madurai']
const AREA_SERVED = [
  ...AREA_CITIES.map(name => ({ '@type': 'City', name })),
  { '@type': 'AdministrativeArea', name: 'Kanyakumari district' },
  { '@type': 'AdministrativeArea', name: 'Tamil Nadu' },
]

export const BUSINESS = {
  '@type': 'EventPlanner', '@id': BIZ,
  name: BRAND, alternateName: ALT_NAMES, description: OFFICIAL_DESC,
  url: DOMAIN + '/', logo: DOMAIN + '/assets/img/logo.png',
  image: [OG_DEFAULT, full('royal-gold-mandap'), full('white-floral-luxury-stage'), full('grand-entrance-aisle')],
  telephone: PHONE_DISPLAY, email: EMAIL,
  address: { '@type': 'PostalAddress', streetAddress: STREET, addressLocality: 'Nagercoil', addressRegion: 'Tamil Nadu', postalCode: '629003', addressCountry: 'IN' },
  geo: { '@type': 'GeoCoordinates', latitude: GEO.lat, longitude: GEO.lng },
  hasMap: MAPS,
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: HOURS.opens, closes: HOURS.closes }],
  founder: { '@id': FOUNDER }, foundingDate: FOUNDED,
  numberOfEmployees: { '@type': 'QuantitativeValue', value: TEAM_SIZE },
  knowsLanguage: ['en', 'ta', 'ml'],
  areaServed: AREA_SERVED,
  hasOfferCatalog: {
    '@type': 'OfferCatalog', name: 'Event decoration services',
    itemListElement: SERVICE_PAGES.map(p => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: p.en.name, url: `${DOMAIN}/${p.slug}` } })),
  },
  sameAs: SAME_AS,
}
const PERSON = {
  '@type': 'Person', '@id': FOUNDER, name: PROPRIETOR, jobTitle: 'Proprietor',
  worksFor: { '@id': BIZ }, image: DOMAIN + '/assets/img/proprietor.webp',
  address: { '@type': 'PostalAddress', addressLocality: 'Nagercoil', addressRegion: 'Tamil Nadu', addressCountry: 'IN' },
}
const WEBSITE = { '@type': 'WebSite', '@id': SITE, url: DOMAIN + '/', name: BRAND, alternateName: ALT_NAMES, inLanguage: ['en', 'ta'], publisher: { '@id': BIZ } }

const urlFor = (base, lang) => DOMAIN + (lang === 'ta' ? taPath(base) : base)
const homeLabel = { en: 'Home', ta: 'முகப்பு' }
const qa = list => list.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))

function breadcrumb(base, lang, trail) {
  const items = [{ name: homeLabel[lang], url: urlFor('/', lang) }, ...trail]
  return { '@type': 'BreadcrumbList', '@id': urlFor(base, lang) + '#breadcrumb', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })) }
}

// ---------- meta + graph per page ----------
export function metaFor(base, lang = 'en') {
  const page = pageFor(base)
  if (!page) return { ...STATIC_META['/404'].en, noindex: true, graph: null }
  const url = urlFor(base, lang)
  const graph = [BUSINESS, PERSON, WEBSITE]
  let m, type = 'WebPage', og = OG_DEFAULT, trail = [], extra = [], webExtra = {}

  if (page.kind === 'service') {
    const sp = servicePageBySlug(page.slug); const c = sp[lang] || sp.en
    m = { title: c.title, desc: c.desc }
    og = full(sp.photos[0])
    trail = [{ name: STATIC_META['/services'].crumb[lang] || 'Services', url: urlFor('/services', lang) }, { name: c.name, url }]
    type = c.faqs && c.faqs.length ? ['WebPage', 'FAQPage'] : 'WebPage'
    if (c.faqs && c.faqs.length) webExtra.mainEntity = qa(c.faqs)
    extra.push({
      '@type': 'Service', '@id': url + '#service', name: c.name, serviceType: sp.en.name, description: c.lead,
      provider: { '@id': BIZ }, areaServed: AREA_SERVED, url, image: sp.photos.slice(0, 3).map(full),
    })
    webExtra.dateModified = LAST_UPDATED
    if (sp.draft) m.noindex = true
  } else if (page.kind === 'case') {
    const c = caseBySlug(page.slug)
    m = caseMeta(c)
    og = full(c.photos[0])
    trail = [{ name: lang === 'ta' ? 'எங்கள் படைப்புகள்' : 'Our Work', url: urlFor('/our-work', lang) }, { name: c.eventType, url }]
    extra.push({
      '@type': 'CreativeWork', '@id': url + '#work', name: `${c.eventType}, ${c.area}`, description: c.special,
      creator: { '@id': BIZ }, dateCreated: c.date, locationCreated: { '@type': 'Place', name: c.venue, address: c.area },
      image: c.photos.map(s => ({ '@type': 'ImageObject', contentUrl: full(s) })),
    })
  } else if (page.kind === 'post') {
    const post = postBySlug(page.slug)
    m = { title: post.title, desc: post.desc }
    og = full(post.cover)
    trail = [{ name: 'Blog', url: urlFor('/blog', 'en') }, { name: post.h1, url }]
    extra.push({
      '@type': 'BlogPosting', '@id': url + '#article', headline: post.h1, description: post.desc, image: og,
      author: { '@id': FOUNDER }, publisher: { '@id': BIZ }, datePublished: post.date, dateModified: post.date,
      mainEntityOfPage: { '@id': url }, inLanguage: 'en',
    })
  } else {
    const sm = STATIC_META[base]
    m = { ...(sm[lang] || sm.en) }
    type = sm.type || 'WebPage'
    if (sm.og) og = DOMAIN + sm.og
    if (sm.crumb) trail = [{ name: sm.crumb[lang] || sm.crumb.en, url }]
    if (base === '/faq') {
      webExtra.mainEntity = qa(FAQ_GROUPS.flatMap(g => g.items.map(i => i[lang] || i.en)))
    }
    if (base === '/our-work') {
      webExtra.mainEntity = {
        '@type': 'ImageGallery', name: lang === 'ta' ? 'VRK Decor படைப்புகள்' : 'VRK Decor portfolio',
        associatedMedia: WORKS.map(w => ({ '@type': 'ImageObject', contentUrl: full(w.slug), caption: w.alt, width: w.full[0], height: w.full[1], creator: { '@id': BIZ }, copyrightHolder: { '@id': BIZ } })),
      }
    }
    if (base === '/blog') {
      webExtra.hasPart = POSTS.map(p => ({ '@id': `${DOMAIN}/blog/${p.slug}#article` }))
    }
    if (base === '/about' || base === '/contact' || base === '/') webExtra.about = { '@id': BIZ }
  }

  if (page.draft) m.noindex = true
  const webpage = {
    '@type': type, '@id': url + '#webpage', url, name: m.title, description: m.desc,
    inLanguage: lang, isPartOf: { '@id': SITE }, publisher: { '@id': BIZ },
    primaryImageOfPage: { '@type': 'ImageObject', url: og },
    ...(trail.length ? { breadcrumb: { '@id': url + '#breadcrumb' } } : {}),
    ...webExtra,
  }
  graph.push(webpage, ...extra)
  if (trail.length) graph.push(breadcrumb(base, lang, trail))
  return { ...m, og, graph: { '@context': 'https://schema.org', '@graph': graph } }
}

export const notFoundMeta = () => ({ ...STATIC_META['/404'].en, noindex: true, og: OG_DEFAULT, graph: null })
export { STATIC_META, OG_DEFAULT }
