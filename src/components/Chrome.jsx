import { useEffect, useRef, useState, createContext, useContext } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { I } from './Icons.jsx'
import { STRINGS, localePath, stripLang } from '../i18n.js'
import { PHONE_DISPLAY, PHONE_TEL, EMAIL, ADDRESS, MAPS, IG, IG_HANDLE, FB, ZENVY, waLink, composeWa, composeWaText } from '../site.js'

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

/* ---------- cinematic background video ----------
   The poster is a CSS background on the parent, so it paints before any JS and never shifts layout.
   After mount this picks the desktop or mobile encode (WebM first, MP4 fallback) so only one file is
   downloaded, and fades the video in once it is actually playing. Reduced-motion users keep the
   poster and never download the video. `seamless` is for footage whose last frame runs into its
   first; otherwise the loop point is hidden with a short fade. */
export function CinematicVideo({ className, src, webm, srcMobile, webmMobile, seamless, ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    const v = ref.current
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const mobile = srcMobile && window.matchMedia('(max-width:700px)').matches
    const sources = [[mobile ? webmMobile : webm, 'video/webm'], [mobile ? srcMobile : src, 'video/mp4']].filter(([u]) => u)
    v.replaceChildren(...sources.map(([u, type]) => Object.assign(document.createElement('source'), { src: u, type })))
    // React does not reliably emit the muted attribute; browsers only allow unprompted playback when muted
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.autoplay = true
    v.preload = 'auto'
    v.load()
    const play = () => { const p = v.play(); p && p.catch(() => {}) }
    const onPlaying = () => v.classList.add('is-playing')
    v.addEventListener('playing', onPlaying)
    const FADE = 0.9
    const onTime = () => {
      if (!v.duration) return
      if (v.duration - v.currentTime <= FADE) v.classList.add('is-fading')
      else if (v.currentTime < 0.6) v.classList.remove('is-fading')
    }
    if (!seamless) v.addEventListener('timeupdate', onTime)
    const io = new IntersectionObserver(es => {
      es.forEach(en => { if (en.isIntersecting) play(); else v.pause() })
    }, { threshold: 0.1 })
    io.observe(v)
    return () => { v.removeEventListener('playing', onPlaying); v.removeEventListener('timeupdate', onTime); io.disconnect() }
  }, [])
  return <video ref={ref} className={className} muted loop playsInline preload="none" aria-hidden="true" {...rest} />
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
  const other = lang === 'ta' ? base : localePath('ta', base)
  const links = [
    [t.nav.home, '/'], [t.nav.services, '/services'], [t.nav.work, '/our-work'], [t.nav.about, '/about'], [t.nav.contact, '/contact'],
  ]
  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' menu-open' : ''}`}>
      <div className="wrap nav">
        <Link className="brand" to={localePath(lang, '/')} aria-label="VRK Decor, home">
          <img className="brand-logo" src="/assets/img/logo.png" alt="VRK Decor" width="560" height="338" />
          <img className="brand-logo brand-logo-dark" src="/assets/img/logo-dark.png" alt="" aria-hidden="true" width="560" height="338" />
        </Link>
        <button className="nav-toggle" aria-expanded={open} aria-label={t.openMenu} onClick={toggle}>
          <span></span><span></span><span></span>
        </button>
        <ul className="nav-links">
          {links.map(([label, href]) => (
            <li key={href}>
              <NavLink to={localePath(lang, href)} end={href === '/'}
                className={({ isActive }) => isActive ? 'is-active' : undefined}
                aria-current={stripLang(loc.pathname) === href ? 'page' : undefined}>{label}</NavLink>
            </li>
          ))}
          <li><Link className="lang-switch" to={lang === 'ta' ? base : other} aria-label={t.switchAria} lang={lang === 'ta' ? 'en' : 'ta'}>{t.switchLabel}</Link></li>
          <li><button className="btn btn-primary nav-cta" onClick={() => openQuote()}>{t.nav.quote}</button></li>
        </ul>
      </div>
    </header>
  )
}

/* ---------- Floating buttons ---------- */
export function Floaters() {
  const t = useT()
  return (
    <div className="float-stack">
      <a className="float-btn float-ig" href={IG} target="_blank" rel="noopener noreferrer" aria-label={`${t.igAria} ${IG_HANDLE}`}>{I.ig}</a>
      <a className="float-btn float-wa" href={waLink(t.waFloating)} target="_blank" rel="noopener noreferrer" aria-label={t.waFloatingAria}>{I.wa}</a>
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
  const clearImg = () => { setImg(prev => { if (prev) URL.revokeObjectURL(prev.url); return null }); setImgErr('') }
  useEffect(() => {
    if (!state.open) { clearImg(); return }
    const onKey = e => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    const first = panelRef.current && panelRef.current.querySelector('input')
    if (first) first.focus()
    return () => document.removeEventListener('keydown', onKey)
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
    let text = composeWaText(Object.fromEntries(new FormData(e.target).entries()), state.ref, t)
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
        <h3 id="quote-title">{t.qmH}</h3>
        <p style={{ fontSize: '.9rem' }}>{t.qmP}</p>
        {state.ref && <p className="modal-ref">{I.heart} <span>{state.refTitle || state.ref}</span></p>}
        <form className="form-grid" onSubmit={submit} noValidate>
          <div><label htmlFor="qm-name">{t.fName}</label><input id="qm-name" name="name" autoComplete="name" required /></div>
          <div><label htmlFor="qm-phone">{t.fPhone}</label><input id="qm-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" /></div>
          <div><label htmlFor="qm-event">{t.fEvent}</label>
            <select id="qm-event" name="event" defaultValue={t.events[0]}>{t.events.map(ev => <option key={ev}>{ev}</option>)}</select></div>
          <div><label htmlFor="qm-date">{t.fDate}</label><input id="qm-date" name="date" type="date" /></div>
          <div className="full"><label htmlFor="qm-loc">{t.fLocation}</label><input id="qm-loc" name="location" placeholder={t.fLocPH} /></div>
          <div className="full"><label htmlFor="qm-notes">{t.fNotes}</label><textarea id="qm-notes" name="notes" placeholder={t.fNotesPH}></textarea></div>
          {!state.ref && (
            <div className="full upload-field">
              <label htmlFor="qm-photo">{t.upLabel}</label>
              {!img ? (
                <>
                  <input id="qm-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
                  <p className="form-note" style={{ marginTop: '.35rem' }}>{t.upHint}</p>
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
              {img && <p className="form-note" style={{ marginTop: '.4rem' }}>{t.upWaNote}</p>}
            </div>
          )}
          <div className="full"><button className="btn btn-wa" type="submit" style={{ width: '100%' }}>{I.wa} {t.continueWa}</button></div>
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
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="brand" to={p('/')} aria-label="VRK Decor, home">
              <img src="/assets/img/logo-dark.png" alt="VRK Decor" width="560" height="338" style={{ width: '170px', height: 'auto' }} loading="lazy" />
            </Link>
            <p style={{ marginTop: '1rem' }}>{t.footerDesc}</p>
            <div className="footer-social">
              <a href={waLink(t.waFloating)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">{I.wa}</a>
              <a href={IG} target="_blank" rel="noopener noreferrer" aria-label="Instagram">{I.ig}</a>
              <a href={FB} target="_blank" rel="noopener noreferrer" aria-label="Facebook">{I.fb}</a>
              <a href={`tel:${PHONE_TEL}`} aria-label={t.cCall}>{I.phone}</a>
            </div>
          </div>
          <nav aria-label="Footer">
            <h4>{t.fExplore}</h4>
            <ul>
              <li><Link to={p('/')}>{t.nav.home}</Link></li>
              <li><Link to={p('/services')}>{t.nav.services}</Link></li>
              <li><Link to={p('/our-work')}>{t.nav.work}</Link></li>
              <li><Link to={p('/about')}>{t.nav.about}</Link></li>
              <li><Link to={p('/contact')}>{t.nav.contact}</Link></li>
            </ul>
          </nav>
          <div>
            <h4>{t.fServices}</h4>
            <ul>
              <li><Link to={p('/services')}>{lang === 'ta' ? 'திருமண அலங்காரம்' : 'Wedding Decoration'}</Link></li>
              <li><Link to={p('/services')}>{lang === 'ta' ? 'மேடை அலங்காரம்' : 'Stage Decoration'}</Link></li>
              <li><Link to={p('/services')}>{lang === 'ta' ? 'பிறந்தநாள் அலங்காரம்' : 'Birthday Decoration'}</Link></li>
              <li><Link to={p('/services')}>{lang === 'ta' ? 'நிறுவன நிகழ்வுகள்' : 'Corporate Events'}</Link></li>
              <li><Link to={p('/services')}>{lang === 'ta' ? 'விழா விளக்குகள்' : 'Event Lighting'}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{t.fContact}</h4>
            <ul>
              <li><a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a></li>
              <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
              <li><a href={MAPS} target="_blank" rel="noopener noreferrer">{ADDRESS}</a></li>
              <li><a href={IG} target="_blank" rel="noopener noreferrer">{IG_HANDLE}</a></li>
            </ul>
            <button className="btn btn-primary" style={{ marginTop: '1.1rem' }} onClick={() => openQuote()}>{t.startEvent}</button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} VRK Decor &middot; Nagercoil, Tamil Nadu</span>
          <span className="made-with">{t.madeWith} <span className="heart" aria-label="love">{I.heartFill}</span> <a href={ZENVY} target="_blank" rel="noopener noreferrer">{t.madeBy}</a></span>
          <span><Link to="/privacy-policy">{t.privacy}</Link> &middot; <Link to="/terms">{t.terms}</Link></span>
        </div>
      </div>
    </footer>
  )
}
