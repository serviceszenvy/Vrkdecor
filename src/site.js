// Production domain — override at build time with VITE_SITE_URL (and SITE_URL for the prerender step)
export const DOMAIN = ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SITE_URL) || 'https://www.vrkdecor.com').replace(/\/+$/, '')
export const PHONE_DISPLAY = '+91 99940 72435'
export const PHONE_TEL = '+919994072435'
export const WA = '919994072435'
export const EMAIL = 'vrk.groups@gmail.com'
export const ADDRESS = '301 M.S Road, Vettunimadam, Nagercoil, Tamil Nadu 629003'
export const MAPS = 'https://maps.app.goo.gl/xwWzF1BAnPTxXh8j6'
export const IG = 'https://www.instagram.com/wedding_stagedecor_vrk/'
export const IG_HANDLE = '@wedding_stagedecor_vrk'
export const FB = 'https://www.facebook.com/vrkdecor/'
export const PROPRIETOR = 'V. Raja Kumerasen'
export const ZENVY = 'https://zenvytech.vercel.app/'

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
