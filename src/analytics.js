// Analytics loader. Nothing loads unless an ID is set in site.js AND the visitor accepts the notice.
import { ANALYTICS, ANALYTICS_ON } from './site.js'

const KEY = 'vrk-consent'
let loaded = false

export function getConsent() {
  try { return localStorage.getItem(KEY) } catch { return null }
}
export function setConsent(v) {
  try { localStorage.setItem(KEY, v) } catch { /* storage blocked: choice applies to this visit only */ }
  if (v === 'yes') loadAnalytics()
}

function inject(src) {
  const s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s)
}

export function loadAnalytics() {
  if (loaded || !ANALYTICS_ON || typeof window === 'undefined') return
  loaded = true
  const run = () => {
    if (ANALYTICS.GA4_ID) {
      window.dataLayer = window.dataLayer || []
      window.gtag = function () { window.dataLayer.push(arguments) }
      window.gtag('js', new Date())
      window.gtag('config', ANALYTICS.GA4_ID, { anonymize_ip: true })
      inject(`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.GA4_ID}`)
    }
    if (ANALYTICS.META_PIXEL_ID) {
      const f = window
      if (!f.fbq) {
        const n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }
        if (!f._fbq) f._fbq = n
        n.push = n; n.loaded = true; n.version = '2.0'; n.queue = []
        inject('https://connect.facebook.net/en_US/fbevents.js')
      }
      f.fbq('init', ANALYTICS.META_PIXEL_ID)
      f.fbq('track', 'PageView')
    }
  }
  // load only after the page itself has finished loading, so it never slows the first view
  if (document.readyState === 'complete') setTimeout(run, 1500)
  else window.addEventListener('load', () => setTimeout(run, 1500), { once: true })
}

export function track(name, params = {}) {
  if (typeof window === 'undefined') return
  if (window.gtag) window.gtag('event', name, params)
  if (window.fbq && (name === 'generate_lead' || name === 'whatsapp_click' || name === 'phone_click')) window.fbq('track', 'Contact')
}

// One listener tracks every WhatsApp, phone and map link on the site
export function initClickTracking() {
  if (typeof document === 'undefined' || document.__vrkTracking) return
  document.__vrkTracking = true
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]')
    if (!a) return
    const h = a.getAttribute('href')
    if (h.startsWith('https://wa.me')) track('whatsapp_click', { link_url: 'wa.me', page_path: location.pathname })
    else if (h.startsWith('tel:')) track('phone_click', { page_path: location.pathname })
    else if (/maps\.app\.goo\.gl|google\.com\/maps|share\.google/.test(h)) track('map_click', { page_path: location.pathname })
  }, { capture: true })
}

export function pageView(path) {
  if (typeof window !== 'undefined' && window.gtag && ANALYTICS.GA4_ID) window.gtag('event', 'page_view', { page_path: path })
}
