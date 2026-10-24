// Page titles and descriptions for the fixed pages. Service page and blog titles live in their light indexes.
import { serviceIndexBySlug } from './servicesIndex.js'
import { postIndexBySlug } from './blogIndex.js'
import { caseBySlug } from './caseStudies.js'

export const STATIC_META = {
  '/': {
    en: { title: 'Event & Wedding Stage Decoration in Nagercoil | VRK Decor', desc: 'Event and wedding decoration in Nagercoil since 2011. Stages, mandapams, birthdays, housewarmings and functions across Kanyakumari district. Get a quote.' },
    ta: { title: 'நாகர்கோவில் திருமண மேடை & விழா அலங்காரம் | VRK Decor', desc: '2011 முதல் நாகர்கோவிலில் திருமண மேடை, நிச்சயதார்த்தம், பிறந்தநாள், புதுமனை புகுவிழா, குடும்ப விழா அலங்காரம். கன்னியாகுமரி மாவட்டம் முழுவதும் சேவை.' },
    type: 'WebPage',
  },
  '/services': {
    en: { title: 'Event Decoration Services in Nagercoil | VRK Decor', desc: 'All VRK Decor services in Nagercoil: wedding stages, engagement and reception, birthday, family function, corporate, flower, entrance and car decoration.' },
    ta: { title: 'நாகர்கோவில் விழா அலங்கார சேவைகள் | VRK Decor', desc: 'நாகர்கோவிலில் திருமண மேடை, நிச்சயதார்த்தம், வரவேற்பு, பிறந்தநாள், குடும்ப விழா, நிறுவன நிகழ்வு, பூ, நுழைவாயில், கார் அலங்காரம். VRK Decor சேவைகள்.' },
    type: 'CollectionPage', crumb: { en: 'Services', ta: 'சேவைகள்' },
  },
  '/our-work': {
    en: { title: 'Wedding & Event Decoration Portfolio, Nagercoil | VRK Decor', desc: 'See 49 real stages, mandapams, entrances and car decorations by VRK Decor in Nagercoil. Pick any design you like and ask for a quote on WhatsApp.' },
    ta: { title: 'திருமண & விழா அலங்கார படைப்புகள் | VRK Decor நாகர்கோவில்', desc: 'நாகர்கோவிலில் VRK Decor அமைத்த 49 உண்மையான மேடைகள், மண்டபங்கள், நுழைவாயில்கள், கார் அலங்காரங்கள். பிடித்த வடிவமைப்புக்கு WhatsApp-ல் விலை கேளுங்கள்.' },
    type: 'CollectionPage', crumb: { en: 'Our Work', ta: 'எங்கள் படைப்புகள்' }, og: '/assets/img/work/white-floral-luxury-stage-full.jpg',
  },
  '/faq': {
    en: { title: 'Event Decoration FAQ: Prices, Booking & Areas | VRK Decor', desc: 'Answers about VRK Decor in Nagercoil: decoration cost, booking, advance, marriage halls, church and temple weddings, areas covered and shop timings.' },
    ta: { title: 'விழா அலங்காரம் கேள்வி பதில் | VRK Decor நாகர்கோவில்', desc: 'நாகர்கோவில் VRK Decor பற்றிய பதில்கள்: அலங்கார செலவு, முன்பதிவு, முன்பணம், திருமண மண்டபங்கள், தேவாலய மற்றும் கோவில் திருமணங்கள், பகுதிகள், கடை நேரம்.' },
    type: 'FAQPage', crumb: { en: 'FAQ', ta: 'கேள்வி பதில்' },
  },
  '/about': {
    en: { title: 'About VRK Decor | Event Decorators in Nagercoil Since 2011', desc: 'VRK Decor is a wedding and event decoration company in Nagercoil, started in 2011 by V. Raja Kumerasen, with 700+ celebrations and a 35 member team.' },
    ta: { title: 'VRK Decor பற்றி | 2011 முதல் நாகர்கோவில் விழா அலங்காரம்', desc: 'நாகர்கோவிலில் 2011-ல் V. ராஜா குமரேசன் அவர்களால் தொடங்கப்பட்ட திருமண மற்றும் விழா அலங்கார நிறுவனம். 700-க்கும் மேற்பட்ட விழாக்கள், 35 பேர் கொண்ட குழு.' },
    type: 'AboutPage', crumb: { en: 'About', ta: 'எங்களைப் பற்றி' }, og: '/assets/img/proprietor.jpg',
  },
  '/contact': {
    en: { title: 'Contact VRK Decor | Wedding Decorators in Nagercoil', desc: 'Call or WhatsApp VRK Decor at +91 99940 72435. Visit our shop at 301 M.S Road, Vettunimadam, Nagercoil, open 9:30 AM to 10:00 PM, all 7 days.' },
    ta: { title: 'VRK Decor தொடர்பு | நாகர்கோவில் திருமண அலங்காரம்', desc: 'VRK Decor-ஐ +91 99940 72435 எண்ணில் அழைக்கவும் அல்லது WhatsApp செய்யவும். கடை: 301 M.S ரோடு, வெட்டூர்ணிமடம், நாகர்கோவில். காலை 9:30 முதல் இரவு 10:00 வரை.' },
    type: 'ContactPage', crumb: { en: 'Contact', ta: 'தொடர்பு' },
  },
  '/blog': {
    en: { title: 'Wedding Decoration Ideas and Guides, Nagercoil | VRK Decor', desc: 'Wedding stage ideas and decoration planning guides from the VRK Decor team in Nagercoil, with photos from real stages our own team has set up.' },
    type: 'CollectionPage', crumb: { en: 'Blog' }, og: '/assets/img/work/royal-gold-mandap-full.jpg',
  },
  '/privacy-policy': {
    en: { title: 'Privacy Policy | VRK Decor Wedding Decorators, Nagercoil', desc: 'How VRK Decor in Nagercoil handles the details you share through this website, WhatsApp enquiries and bookings, and how to contact us about privacy.' },
    type: 'WebPage', crumb: { en: 'Privacy Policy' },
  },
  '/terms': {
    en: { title: 'Terms of Use, Quotations & Bookings | VRK Decor Nagercoil', desc: 'Terms for using the VRK Decor website and for quotations, bookings, advance payment, postponement and partner services for events in Nagercoil.' },
    type: 'WebPage', crumb: { en: 'Terms' },
  },
  '/404': { en: { title: 'Page not found | VRK Decor', desc: 'This page could not be found. Go to the VRK Decor home page, our services or WhatsApp us.' }, noindex: true },
}


// Used in the browser to update the title when moving between pages
export function clientMeta(base, lang) {
  if (STATIC_META[base]) { const m = STATIC_META[base]; return m[lang] || m.en }
  const slug = base.slice(1)
  const s = serviceIndexBySlug(slug)
  if (s) return s[lang] || s.en
  if (base.startsWith('/blog/')) { const p = postIndexBySlug(base.slice(6)); if (p) return p }
  if (base.startsWith('/our-work/')) { const c = caseBySlug(base.slice(10)); if (c) return caseMeta(c) }
  return STATIC_META['/404'].en
}

export const caseMeta = c => ({
  title: `${c.eventType} in ${c.area} | VRK Decor`.slice(0, 60),
  desc: `${c.eventType} at ${c.venue}, ${c.area}. ${c.theme}. Real decoration by VRK Decor, Nagercoil.`.slice(0, 158),
})
