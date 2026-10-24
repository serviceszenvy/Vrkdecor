// Production domain: override at build time with VITE_SITE_URL (and SITE_URL for the prerender step)
export const DOMAIN = ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SITE_URL) || 'https://www.vrkdecor.com').replace(/\/+$/, '')

// ---------- Business facts (single source of truth) ----------
export const BRAND = 'VRK Decor'
export const ALT_NAMES = ['VRK Groups', 'VRK Groups Wedding Planners', 'VRK Decoration']
export const OFFICIAL_DESC = 'VRK Decor is a wedding and event decoration company in Nagercoil, Tamil Nadu, started in 2011 by V. Raja Kumerasen, with more than 700 celebrations done across Kanyakumari district and South Tamil Nadu.'
export const OFFICIAL_DESC_TA = 'VRK Decor நாகர்கோவிலில் உள்ள திருமண மற்றும் விழா அலங்கார நிறுவனம். 2011-ல் V. ராஜ குமரேசன் அவர்களால் தொடங்கப்பட்டது. கன்னியாகுமரி மாவட்டம் மற்றும் தென் தமிழ்நாட்டில் 700-க்கும் மேற்பட்ட விழாக்களை அலங்கரித்துள்ளோம்.'
export const PHONE_DISPLAY = '+91 99940 72435'
export const PHONE_TEL = '+919994072435'
export const WA = '919994072435'
export const EMAIL = 'vrk.groups@gmail.com'
export const STREET = '301 M.S Road, Vettunimadam'
export const ADDRESS = '301 M.S Road, Vettunimadam, Nagercoil, Tamil Nadu 629003'
export const ADDRESS_TA = '301 M.S ரோடு, வெட்டுனிமடம், நாகர்கோவில், தமிழ்நாடு 629003'
export const GEO = { lat: 8.189563, lng: 77.416687, plusCode: '6JWV5CQ8+RM' }
export const HOURS = { opens: '09:30', closes: '22:00', label: '9:30 AM to 10:00 PM, all 7 days', labelTa: 'காலை 9:30 முதல் இரவு 10:00 வரை, வாரத்தின் 7 நாட்களும்' }
export const FOUNDED = '2011-12'
export const TEAM_SIZE = 35
export const GOOGLE_RATING = { value: '4.8', count: 80 }
export const PROPRIETOR = 'V. Raja Kumerasen'
export const PROPRIETOR_TA = 'V. ராஜ குமரேசன்'

// Links
export const MAPS = 'https://maps.app.goo.gl/xwWzF1BAnPTxXh8j6' // directions link already used on the site
export const GBP = 'https://share.google/uSUae1q2RsqsOQcjX' // Google Business Profile. CONFIRM: replace with the full https://www.google.com/maps/place/... URL
export const IG = 'https://www.instagram.com/wedding_stagedecor_vrk/'
export const IG_HANDLE = '@wedding_stagedecor_vrk'
export const FB = 'https://www.facebook.com/vrkdecor/'
export const JUSTDIAL = 'https://www.justdial.com/Nagercoil/VRK-Groups-Wedding-Planners-Opposite-to-Indian-MRI-Scan-Center-Parvathipuram/9999P4652-4652-221027173218-V5V4_BZDET'
export const INDIAMART = 'https://www.indiamart.com/vrk-groups-weddingplanner/aboutus.html'
// Not created yet. Add the URL here when each profile exists and it will appear in the footer and schema automatically.
export const YOUTUBE = ''
export const LINKEDIN = ''
export const X_PROFILE = ''
export const SAME_AS = [GBP, IG, FB, JUSTDIAL, INDIAMART, YOUTUBE, LINKEDIN, X_PROFILE].filter(Boolean)
export const ZENVY = 'https://zenvytech.vercel.app/'

// Content dates
export const LAST_UPDATED = '2026-10-24'
export const LAST_UPDATED_LABEL = { en: '24 October 2026', ta: '24 அக்டோபர் 2026' }

// ---------- Hero media ----------
// Desktop shows a sharp still photo (fast LCP). Set HERO.desktopVideo to '/assets/video/vrk-hero-v3.mp4'
// after copying that file into public/assets/video if you want video on desktop too.
export const HERO = {
  desktopVideo: '',
  mobileVideo: '/assets/video/vrk-hero-v3-mobile.mp4',
  desktopPoster: '/assets/img/hero/vrk-hero-desktop-1600.webp',
  desktopPosterSmall: '/assets/img/hero/vrk-hero-desktop-1100.webp',
  mobilePoster: '/assets/video/vrk-hero-v3-mobile-poster.webp',
}

// ---------- Analytics and verification (leave blank until you have the IDs) ----------
export const ANALYTICS = {
  GA4_ID: '',          // e.g. 'G-XXXXXXXXXX'
  META_PIXEL_ID: '',   // e.g. '123456789012345'
}
export const VERIFY = {
  google: '',          // Search Console HTML tag content value
  bing: '',            // Bing Webmaster Tools msvalidate.01 content value
}
export const ANALYTICS_ON = !!(ANALYTICS.GA4_ID || ANALYTICS.META_PIXEL_ID)

export const waLink = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`

export function composeWaText(fields, ref, labels) {
  const lines = [labels.waIntro]
  if (ref) lines.push(`${labels.waRef}: ${ref}`)
  const map = [['name', labels.fName], ['phone', labels.fPhone], ['event', labels.fEvent], ['date', labels.fDate], ['location', labels.fLocation], ['notes', labels.fNotes]]
  map.forEach(([k, label]) => { if (fields[k]) lines.push(`${label}: ${fields[k]}`) })
  return lines.join('\n')
}

export function composeWa(fields, ref, labels) {
  return waLink(composeWaText(fields, ref, labels))
}
