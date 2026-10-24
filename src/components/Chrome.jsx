import { useEffect, useRef, useState, createContext, useContext } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { I } from './Icons.jsx'
import { STRINGS, localePath, stripLang } from '../i18n.js'
import { hasTa } from '../routes.js'
import { SERVICE_INDEX } from '../data/servicesIndex.js'
import { PHONE_DISPLAY, PHONE_TEL, EMAIL, leadError, ADDRESS, ADDRESS_TA, MAPS, GBP, IG, IG_HANDLE, FB, JUSTDIAL, INDIAMART, YOUTUBE, LINKEDIN, X_PROFILE, ZENVY, HERO, ANALYTICS_ON, waLink, composeWaText } from '../site.js'
import { getConsent, setConsent, loadAnalytics, track } from '../analytics.js'

export const LangContext = createContext('en')
export const useT = () => STRINGS[useContext(LangContext)]
export const useLang = () => useContext(LangContext)

/* ---------- Quote modal context ---------- */
export const QuoteContext = createContext({ openQuote: () => {} })
export const useQuote = () => useContext(QuoteContext)

/* ---------- reveal-on-scroll (adds class in place, never scrolls) ---------- */
export function useRevealEffect(deps) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in')); return
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target) } })
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, deps)
}

/* ---------- Hero media ----------
   The poster photo is the real first paint (fast LCP). The hero reel (WebM first, MP4 fallback, a lighter
   portrait file on phones) is only fetched after the page has fully loaded, and never on Save-Data,
   slow 2G/3G connections or when the visitor prefers reduced motion. The footage runs seamlessly into
   its first frame, so it simply loops. */
export function HeroMedia() {
  const ref = useRef(null)
  const [play, setPlay] = useState(false)
  const [playing, setPlaying] = useState(false)
  const mobileRef = useRef(false)
  useEffect(() => {
    mobileRef.current = window.matchMedia('(max-width:700px)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const c = navigator.connection || {}
    const slow = c.saveData || /(^|-)2g$|^3g$/.test(c.effectiveType || '')
    if (reduce || slow) return
    const start = () => setTimeout(() => setPlay(true), 400)
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
  }, [])
  useEffect(() => {
    const v = ref.current
    if (!v || !play) return
    const m = mobileRef.current
    const sources = [[m ? HERO.mobileWebm : HERO.desktopWebm, 'video/webm'], [m ? HERO.mobileVideo : HERO.desktopVideo, 'video/mp4']].filter(([u]) => u)
    v.replaceChildren(...sources.map(([u, type]) => Object.assign(document.createElement('source'), { src: u, type })))
    // React does not reliably emit the muted attribute, and browsers only autoplay when it is set
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.autoplay = true
    v.load()
    const go = () => { const q = v.play(); q && q.catch(() => {}) }
    const onPlaying = () => setPlaying(true)
    v.addEventListener('playing', onPlaying)
    go()
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) go(); else v.pause() }), { threshold: 0.1 })
    io.observe(v)
    return () => { v.removeEventListener('playing', onPlaying); io.disconnect() }
  }, [play])
  return (
    <>
      <picture>
        <source media="(max-width:700px)" srcSet={HERO.mobilePoster} />
        <source media="(max-width:1200px)" srcSet={HERO.desktopPosterSmall} />
        <img className="hero-poster-img" src={HERO.desktopPoster} alt="" width="1600" height="900" fetchPriority="high" decoding="async" />
      </picture>
      {play && <video ref={ref} className={`hero-video-full${playing ? ' is-playing' : ''}`} muted loop playsInline preload="none" tabIndex={-1} aria-hidden="true" />}
    </>
  )
}

/* ---------- Header ---------- */
export function Header() {
  const t = useT(); const lang = useLang()
  const { openQuote } = useQuote()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => { setOpen(false); document.body.style.overflow = '' }, [loc.pathname])
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') { setOpen(false); document.body.style.overflow = '' } }
    document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey)
  }, [])
  const toggle = () => { setOpen(o => { document.body.style.overflow = o ? '' : 'hidden'; return !o }) }
  const base = stripLang(loc.pathname)
  // language switch goes to the matching page when it exists, otherwise to that language's home page
  const switchTo = lang === 'ta' ? base : (hasTa(base) ? localePath('ta', base) : '/ta')
  const links = [
    [t.nav.home, '/'], [t.nav.services, '/services'], [t.nav.work, '/our-work'], [t.nav.about, '/about'], [t.nav.faq, '/faq'], [t.nav.contact, '/contact'],
  ]
  const isActive = href => href === '/' ? base === '/' : (base === href || base.startsWith(href + '/') || (href === '/services' && SERVICE_INDEX.some(p => base === '/' + p.slug)))
  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' menu-open' : ''}`}>
      <div className="wrap nav">
        <Link className="brand" to={localePath(lang, '/')} aria-label="VRK Decor, home">
          <img className="brand-logo" src="/assets/img/logo.webp" alt="VRK Decor logo" width="212" height="128" />
          <img className="brand-logo brand-logo-dark" src="/assets/img/logo-dark.webp" alt="VRK Decor logo" aria-hidden="true" width="212" height="128" />
        </Link>
        <button className="nav-toggle" aria-expanded={open} aria-label={t.openMenu} onClick={toggle}>
          <span></span><span></span><span></span>
        </button>
        <ul className="nav-links">
          {links.map(([label, href]) => (
            <li key={href}>
              <NavLink to={localePath(lang, href)} end={href === '/'}
                className={isActive(href) ? 'is-active' : undefined}
                aria-current={base === href ? 'page' : undefined}>{label}</NavLink>
            </li>
          ))}
          <li><Link className="lang-switch" to={switchTo} aria-label={t.switchAria} lang={lang === 'ta' ? 'en' : 'ta'}>{t.switchLabel}</Link></li>
          <li><button className="btn btn-primary nav-cta" onClick={() => openQuote()}>{t.nav.quote}</button></li>
        </ul>
      </div>
    </header>
  )
}

/* ---------- Floating buttons: Call (phones) + WhatsApp, Instagram on larger screens ----------
   Hidden while a form is on screen so they never cover a submit button */
export function Floaters({ home }) {
  const t = useT()
  const [hide, setHide] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const loc = useLocation()
  // on the home page, keep the hero clear of the floating buttons on phones until the visitor starts scrolling.
  // The class is part of the static HTML (CSS applies it on phone widths only), so the buttons never flash over the hero text.
  useEffect(() => {
    const on = () => setAtTop(window.scrollY < 260)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [loc.pathname])
  useEffect(() => {
    const forms = document.querySelectorAll('.form-grid, .site-footer .footer-bottom')
    if (!forms.length || !('IntersectionObserver' in window)) return
    const seen = new Set()
    const io = new IntersectionObserver(es => {
      es.forEach(en => { en.isIntersecting ? seen.add(en.target) : seen.delete(en.target) })
      setHide(seen.size > 0)
    }, { threshold: 0.05 })
    forms.forEach(f => io.observe(f))
    return () => io.disconnect()
  }, [loc.pathname])
  return (
    <aside className={`float-stack${hide ? ' is-hidden' : ''}${home && atTop ? ' is-hero' : ''}`} aria-label={t.quickAria}>
      <a className="float-btn float-ig" href={IG} target="_blank" rel="noopener noreferrer" aria-label={`${t.igAria} ${IG_HANDLE}`}>{I.ig}</a>
      <a className="float-btn float-call" href={`tel:${PHONE_TEL}`} aria-label={t.callAria}>{I.phone}</a>
      <a className="float-btn float-wa" href={waLink(t.waFloating)} target="_blank" rel="noopener noreferrer" aria-label={t.waFloatingAria}>{I.wa}</a>
    </aside>
  )
}

/* ---------- Analytics consent notice (renders only when an analytics ID is configured) ---------- */
export function ConsentNotice() {
  const t = useT()
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!ANALYTICS_ON) return
    const c = getConsent()
    if (c === 'yes') loadAnalytics()
    else if (c !== 'no') setShow(true)
  }, [])
  if (!show) return null
  const choose = v => { setConsent(v); setShow(false) }
  return (
    <div className="consent glass" role="region" aria-label="Cookies">
      <p>{t.consentP} <Link to="/privacy-policy">{t.privacy}</Link></p>
      <div className="consent-actions">
        <button className="btn btn-primary btn-sm" onClick={() => choose('yes')}>{t.consentAccept}</button>
        <button className="btn btn-ghost btn-sm" onClick={() => choose('no')}>{t.consentDecline}</button>
      </div>
    </div>
  )
}

/* ---------- Quote modal ---------- */
const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const IMG_MAX = 2 * 1024 * 1024
export function QuoteModal({ state, close }) {
  const t = useT()
  const panelRef = useRef(null)
  const [img, setImg] = useState(null)
  const [imgErr, setImgErr] = useState('')
  const [err, setErr] = useState('')
  const clearImg = () => { setImg(prev => { if (prev) URL.revokeObjectURL(prev.url); return null }); setImgErr('') }
  useEffect(() => {
    document.body.classList.toggle('modal-open', !!state.open)
    if (!state.open) { clearImg(); return }
    const opener = document.activeElement
    const onKey = e => {
      if (e.key === 'Escape') { close(); return }
      if (e.key !== 'Tab' || !panelRef.current) return
      // keep keyboard focus inside the dialog
      const items = [...panelRef.current.querySelectorAll('a[href],button:not([disabled]),input:not([tabindex="-1"]):not([type=hidden]),select,textarea')].filter(el => el.offsetParent !== null)
      if (!items.length) return
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && (document.activeElement === last || !panelRef.current.contains(document.activeElement))) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    const first = panelRef.current && panelRef.current.querySelector('input')
    if (first) first.focus()
    return () => { document.removeEventListener('keydown', onKey); if (opener && opener.focus && document.contains(opener)) opener.focus() }
  }, [state.open])
  if (!state.open) return null
  const onFile = e => {
    const f = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!f) return
    const extOk = /\.(jpe?g|png|webp)$/i.test(f.name)
    if (!IMG_TYPES.includes(f.type) || !extOk) { setImgErr(t.upErrType); return }
    if (f.size > IMG_MAX) { setImgErr(t.upErrSize); return }
    setImg(prev => { if (prev) URL.revokeObjectURL(prev.url); return { file: f, url: URL.createObjectURL(f) } })
    setImgErr('')
  }
  const submit = async e => {
    e.preventDefault()
    const fields = Object.fromEntries(new FormData(e.target).entries())
    if (fields.website) return // honeypot: bots fill hidden fields, people never see it
    const bad = leadError(fields)
    setErr(bad)
    if (bad) { const el = e.target.elements[bad]; if (el) el.focus(); return }
    let text = composeWaText(fields, state.ref, t)
    track('generate_lead', { form: 'quote_modal', event_type: fields.event || '' })
    if (img) {
      // where the browser can share a file (most phones), hand WhatsApp the photo directly
      if (navigator.canShare && navigator.canShare({ files: [img.file] })) {
        try { await navigator.share({ files: [img.file], text }); return } catch (err) { if (err && err.name === 'AbortError') return }
      }
      text += `\n${t.waRefImg}`
    }
    window.open(waLink(text), '_blank', 'noopener')
  }
  return (
    <div className="modal is-open" role="dialog" aria-modal="true" aria-labelledby="quote-title">
      <div className="modal-backdrop" onClick={close}></div>
      <div className="modal-panel" ref={panelRef}>
        <button className="modal-close" aria-label={t.close} onClick={close}>{I.x}</button>
        <h2 id="quote-title" className="h3">{t.qmH}</h2>
        <p className="text-sm">{t.qmP}</p>
        {state.ref && <p className="modal-ref">{I.heart} <span>{state.refTitle || state.ref}</span></p>}
        <form className="form-grid" onSubmit={submit} noValidate>
          <div><label htmlFor="qm-name">{t.fName}</label><input id="qm-name" type="text" name="name" autoComplete="name" required aria-invalid={err === 'name' || undefined} aria-describedby={err === 'name' ? 'qm-err' : undefined} /></div>
          <div><label htmlFor="qm-phone">{t.fPhone}</label><input id="qm-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" aria-invalid={err === 'phone' || undefined} aria-describedby={err === 'phone' ? 'qm-err' : undefined} /></div>
          <div><label htmlFor="qm-event">{t.fEvent}</label>
            <select id="qm-event" name="event" defaultValue={t.events[0]}>{t.events.map(ev => <option key={ev}>{ev}</option>)}</select></div>
          <div><label htmlFor="qm-date">{t.fDate}</label><input id="qm-date" name="date" type="date" /></div>
          <div className="full"><label htmlFor="qm-loc">{t.fLocation}</label><input id="qm-loc" type="text" name="location" placeholder={t.fLocPH} /></div>
          <div className="full"><label htmlFor="qm-notes">{t.fNotes}</label><textarea id="qm-notes" name="notes" placeholder={t.fNotesPH}></textarea></div>
          <div className="hp" aria-hidden="true"><label htmlFor="qm-website">Website</label><input id="qm-website" type="text" name="website" tabIndex={-1} autoComplete="off" /></div>
          {!state.ref && (
            <div className="full upload-field">
              <label htmlFor="qm-photo">{t.upLabel}</label>
              {!img ? (
                <>
                  <input id="qm-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
                  <p className="form-note mt-xs">{t.upHint}</p>
                </>
              ) : (
                <div className="upload-preview">
                  <img src={img.url} alt="" />
                  <div>
                    <b>{img.file.name}</b>
                    <span>{img.file.size >= 1048576 ? `${(img.file.size / 1048576).toFixed(2)} MB` : `${Math.max(1, Math.round(img.file.size / 1024))} KB`}</span>
                    <button type="button" className="upload-remove" onClick={clearImg}>{I.x} {t.upRemove}</button>
                  </div>
                </div>
              )}
              {imgErr && <p className="upload-err" role="alert">{imgErr}</p>}
              {img && <p className="form-note mt-xs">{t.upWaNote}</p>}
            </div>
          )}
          {err && <p className="field-err full" id="qm-err" role="alert">{err === 'name' ? t.errName : t.errPhone}</p>}
          <div className="full"><button className="btn btn-wa btn-block" type="submit">{I.wa} {t.continueWa}</button></div>
          <p className="form-note full">{t.formNote}</p>
        </form>
      </div>
    </div>
  )
}

/* ---------- Footer ---------- */
export function Footer() {
  const t = useT(); const lang = useLang()
  const { openQuote } = useQuote()
  const p = x => localePath(lang, x)
  const profiles = [
    ['Google', GBP], ['Instagram', IG], ['Facebook', FB], ['Justdial', JUSTDIAL], ['IndiaMART', INDIAMART],
    ['YouTube', YOUTUBE], ['LinkedIn', LINKEDIN], ['X', X_PROFILE],
  ].filter(([, u]) => u) // YouTube, LinkedIn and X appear automatically once their URLs are added in site.js
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="brand" to={p('/')} aria-label="VRK Decor, home">
              <img className="footer-logo" src="/assets/img/logo-dark.webp" alt="VRK Decor logo" width="212" height="128" loading="lazy" />
            </Link>
            <p className="mt-s">{t.footerDesc}</p>
            <div className="footer-social">
              <a href={waLink(t.waFloating)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">{I.wa}</a>
              <a href={IG} target="_blank" rel="noopener noreferrer" aria-label="Instagram">{I.ig}</a>
              <a href={FB} target="_blank" rel="noopener noreferrer" aria-label="Facebook">{I.fb}</a>
              <a href={`tel:${PHONE_TEL}`} aria-label={t.cCall}>{I.phone}</a>
            </div>
          </div>
          <nav aria-label="Footer">
            <p className="footer-h">{t.fExplore}</p>
            <ul>
              <li><Link to={p('/')}>{t.nav.home}</Link></li>
              <li><Link to={p('/services')}>{t.nav.services}</Link></li>
              <li><Link to={p('/our-work')}>{t.nav.work}</Link></li>
              <li><Link to={p('/about')}>{t.nav.about}</Link></li>
              <li><Link to={p('/faq')}>{t.nav.faq}</Link></li>
              <li><Link to="/blog">{t.nav.blog}</Link></li>
              <li><Link to={p('/contact')}>{t.nav.contact}</Link></li>
            </ul>
          </nav>
          <div>
            <p className="footer-h">{t.fServices}</p>
            <ul>
              {SERVICE_INDEX.map(s => <li key={s.slug}><Link to={p('/' + s.slug)}>{s[lang].name}</Link></li>)}
            </ul>
          </div>
          <div>
            <p className="footer-h">{t.fContact}</p>
            <ul>
              <li><a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a></li>
              <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
              <li><a href={MAPS} target="_blank" rel="noopener noreferrer">{lang === 'ta' ? ADDRESS_TA : ADDRESS}</a></li>
              <li>{t.hoursP.split('.')[0]}</li>
            </ul>
            <p className="footer-h footer-h-sm">{t.profilesH}</p>
            <ul className="footer-profiles">
              {profiles.map(([n, u]) => <li key={n}><a href={u} target="_blank" rel="noopener noreferrer">{n}</a></li>)}
            </ul>
            <button className="btn btn-primary mt-m" onClick={() => openQuote()}>{t.startEvent}</button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} VRK Decor &middot; Nagercoil, Tamil Nadu</span>
          <span className="made-with">{t.madeWith} <span className="heart" role="img" aria-label="love">{I.heartFill}</span> <a href={ZENVY} target="_blank" rel="noopener noreferrer">{t.madeBy}</a></span>
          <span><Link to="/privacy-policy">{t.privacy}</Link> &middot; <Link to="/terms">{t.terms}</Link></span>
        </div>
      </div>
    </footer>
  )
}
