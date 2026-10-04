import { DOMAIN, PHONE_DISPLAY, EMAIL, MAPS, IG, FB, PROPRIETOR } from './site.js'
import { SERVICES, TESTIMONIALS, FAQS } from './data/content.js'

const BIZ_ID = DOMAIN + '/#business'

export const LOCAL_BUSINESS = {
  '@context': 'https://schema.org', '@type': 'LocalBusiness', '@id': BIZ_ID,
  name: 'VRK Decor', image: DOMAIN + '/assets/img/og.jpg', url: DOMAIN,
  telephone: PHONE_DISPLAY, email: EMAIL, priceRange: '₹₹', foundingDate: '2011-12',
  description: 'Premium event decoration and event management in Nagercoil, Tamil Nadu, covering weddings, engagements, receptions, birthdays, housewarmings, family functions and corporate events',
  address: { '@type': 'PostalAddress', streetAddress: '301 M.S Road, Vettunimadam', addressLocality: 'Nagercoil', addressRegion: 'Tamil Nadu', postalCode: '629003', addressCountry: 'IN' },
  hasMap: MAPS,
  founder: { '@type': 'Person', name: PROPRIETOR, jobTitle: 'Proprietor' },
  sameAs: [IG, FB],
  areaServed: ['Nagercoil', 'Kanyakumari district', 'Tirunelveli', 'Trivandrum', 'Tuticorin', 'Madurai', 'Tamil Nadu'],
  review: TESTIMONIALS.map(t => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: t.name },
    reviewBody: t.text,
    ...(t.rating ? { reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5 } } : {}),
  })),
}
export const WEBSITE = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': DOMAIN + '/#website', url: DOMAIN, name: 'VRK Decor', inLanguage: ['en', 'ta'], publisher: { '@id': BIZ_ID } }
const breadcrumb = (name, path) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: DOMAIN + '/' },
    { '@type': 'ListItem', position: 2, name, item: DOMAIN + path },
  ],
})
const svcSchema = {
  '@context': 'https://schema.org', '@type': 'ItemList', name: 'VRK Decor services',
  itemListElement: SERVICES.map((s, i) => ({
    '@type': 'Service', position: i + 1, name: s.en[0].replace('&amp;', '&'), description: s.en[1],
    provider: { '@id': BIZ_ID }, areaServed: 'Nagercoil, Kanyakumari district, Tamil Nadu',
  })),
}
const personSchema = {
  '@context': 'https://schema.org', '@type': 'Person', name: PROPRIETOR, jobTitle: 'Proprietor',
  worksFor: { '@id': BIZ_ID }, image: DOMAIN + '/assets/img/proprietor.webp',
  address: { '@type': 'PostalAddress', addressLocality: 'Nagercoil', addressRegion: 'Tamil Nadu' },
}
const faqSchema = (lang) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: FAQS[lang].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
})

// route meta: path (en form) -> per-lang meta
export const META = {
  '/': {
    en: { title: 'VRK Decor · Wedding & Event Decoration in Nagercoil, Tamil Nadu', desc: 'Premium wedding, engagement, birthday and corporate event decoration in Nagercoil since 2011. 700+ celebrations across Kanyakumari district and Tamil Nadu. Get a quote on WhatsApp' },
    ta: { title: 'VRK Decor · நாகர்கோவில் திருமண & விழா அலங்காரம்', desc: '2011 முதல் நாகர்கோவிலில் திருமணம், நிச்சயதார்த்தம், பிறந்தநாள், நிறுவன நிகழ்வு அலங்காரம் · 700+ விழாக்கள் · WhatsApp-இல் விலை விவரம் பெறுங்கள்' },
    schema: () => [LOCAL_BUSINESS, WEBSITE],
  },
  '/services': {
    en: { title: 'Event Decoration Services in Nagercoil · VRK Decor', desc: 'Wedding, engagement, reception, birthday, housewarming and corporate event decoration in Nagercoil. Stage decoration, florals, entrance decor, lighting, car decoration and band set via partners' },
    ta: { title: 'விழா அலங்கார சேவைகள் · நாகர்கோவில் · VRK Decor', desc: 'நாகர்கோவிலில் திருமணம், நிச்சயதார்த்தம், வரவேற்பு, பிறந்தநாள், புதுமனை புகுவிழா, நிறுவன நிகழ்வு அலங்காரம் · மேடை, பூ, நுழைவாயில், விளக்கு, கார் அலங்காரம்' },
    schema: () => [breadcrumb('Services', '/services'), svcSchema],
  },
  '/our-work': {
    en: { title: 'Our Work · Wedding & Event Decoration Portfolio · VRK Decor Nagercoil', desc: 'Browse real VRK Decor stages and setups from weddings, receptions, engagements, birthdays and corporate events in and around Nagercoil. Request a quote for any design you like' },
    ta: { title: 'எங்கள் படைப்புகள் · VRK Decor நாகர்கோவில்', desc: 'திருமணம், வரவேற்பு, நிச்சயதார்த்தம், பிறந்தநாள் நிகழ்வுகளில் VRK Decor அமைத்த உண்மையான மேடைகள் · பிடித்த வடிவமைப்புக்கு விலை கேளுங்கள்' },
    schema: () => [breadcrumb('Our Work', '/our-work')],
  },
  '/about': {
    en: { title: 'About VRK Decor · Event Decorators in Nagercoil since 2011', desc: 'Meet VRK Decor, a Nagercoil event decoration team founded in December 2011 and led by proprietor V. Raja Kumerasen. 700+ celebrations, a 35-member in-house crew and a trusted partner network' },
    ta: { title: 'VRK Decor பற்றி · 2011 முதல் நாகர்கோவில் விழா அலங்காரம்', desc: '2011 டிசம்பரில் தொடங்கப்பட்ட நாகர்கோவில் அலங்காரக் குழு · உரிமையாளர் V. ராஜ குமரேசன் · 700+ விழாக்கள், 35 பேர் கொண்ட சொந்த குழு' },
    schema: () => [breadcrumb('About', '/about'), personSchema],
  },
  '/contact': {
    en: { title: 'Contact VRK Decor · Get a Quote for Event Decoration in Nagercoil', desc: 'Contact VRK Decor in Nagercoil on WhatsApp +91 99940 72435 for wedding and event decoration quotes. Visit us at 301 M.S Road, Vettunimadam, or find us on Google Maps' },
    ta: { title: 'VRK Decor தொடர்பு · விலை விவரம் பெற · நாகர்கோவில்', desc: 'WhatsApp +91 99940 72435 மூலம் VRK Decor-ஐ தொடர்பு கொள்ளுங்கள் · முகவரி: 301 M.S Road, வெட்டுனிமடம், நாகர்கோவில் · Google Maps-இல் காணலாம்' },
    schema: (lang) => [breadcrumb('Contact', '/contact'), faqSchema(lang)],
  },
  '/privacy-policy': {
    en: { title: 'Privacy Policy · VRK Decor', desc: 'How VRK Decor handles the information you share through this website' },
    schema: () => [breadcrumb('Privacy Policy', '/privacy-policy')],
  },
  '/terms': {
    en: { title: 'Terms of Use · VRK Decor', desc: 'Terms for using the VRK Decor website, quotations, bookings and partner services' },
    schema: () => [breadcrumb('Terms of Use', '/terms')],
  },
  '/404': { en: { title: 'Page not found · VRK Decor', desc: 'Page not found', noindex: true }, schema: () => [] },
}

export function metaFor(basePath, lang) {
  const m = META[basePath] || META['/404']
  const langMeta = m[lang] || m.en
  return { ...langMeta, schema: (m.schema || (() => []))(lang) }
}
