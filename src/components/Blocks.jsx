import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { I } from './Icons.jsx'
import { useT, useLang, useQuote } from './Chrome.jsx'
import { WORKS, TESTIMONIALS, WORK_CATS, workCat, workBySlug } from '../data/content.js'
import { GBP, MAPS, GEO, waLink } from '../site.js'
import { localePath } from '../i18n.js'

/* ---------- occasions marquee ---------- */
export function Marquee() {
  const t = useT()
  const items = t.occasions.map(o => <span key={o}>{o} <i>&#10022;</i></span>)
  return (
    <div className="marquee" role="group" aria-label={t.occasions.join(', ')}>
      <div className="marquee-track">
        <span className="contents">{items}</span>
        <span className="contents" aria-hidden="true">{items}</span>
      </div>
    </div>
  )
}

/* ---------- breadcrumb: Home > ...trail ---------- */
export function Breadcrumb({ trail }) {
  const t = useT(); const lang = useLang()
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to={localePath(lang, '/')}>{t.nav.home}</Link>
      {trail.map(([label, to], k) => (
        <span key={k} className="crumb">
          <span className="sep" aria-hidden="true">&#10022;</span>
          {to ? <Link to={to}>{label}</Link> : <span aria-current="page">{label}</span>}
        </span>
      ))}
    </nav>
  )
}

/* ---------- compact page head (inner pages) ---------- */
export function PageHero({ title, lead, crumb, trail, aside }) {
  return (
    <section className="page-head">
      <div className="wrap">
        <Breadcrumb trail={trail || [[crumb]]} />
        <div className="page-head-row">
          <div className="page-head-main">
            <h1>{title}</h1>
            {lead && <p className="lead">{lead}</p>}
          </div>
          {aside && <div className="page-head-aside">{aside}</div>}
        </div>
      </div>
    </section>
  )
}

/* ---------- work grid + filter + lightbox ----------
   All photos are in the HTML. The filter only hides items once JavaScript runs, so the full gallery works without it. */
const SPANS = ['w-feature', '', '', 'w-tall', '', '', 'w-wide', '', 'w-tall', '', 'w-wide', '']
const HOME_SPANS = ['w-feature', 'w-wide', 'w-tall', '', 'w-wide', '']
export function WorkGrid({ limit, slugs, filter, eagerCount = 1 }) {
  const t = useT(); const lang = useLang()
  const { openQuote } = useQuote()
  const [cat, setCat] = useState('all')
  const base = slugs ? slugs.map(workBySlug).filter(Boolean) : (limit ? WORKS.slice(0, limit) : WORKS)
  const items = cat === 'all' ? base : base.filter(w => workCat(w.slug) === cat)
  const even = !!slugs || cat !== 'all'
  const spans = limit === 6 ? HOME_SPANS : SPANS
  const [lb, setLb] = useState({ open: false, i: 0 })
  const [switching, setSwitching] = useState(false)
  const lastFocus = useRef(null)
  const touchX = useRef(null)
  const closeRef = useRef(null)

  const open = i => { lastFocus.current = document.activeElement; setLb({ open: true, i }); document.body.style.overflow = 'hidden' }
  const close = () => { setLb(s => ({ ...s, open: false })); document.body.style.overflow = ''; lastFocus.current && lastFocus.current.focus() }
  const step = d => {
    setSwitching(true)
    setTimeout(() => { setLb(s => ({ ...s, i: (s.i + d + items.length) % items.length })); setSwitching(false) }, 180)
  }
  useEffect(() => {
    if (!lb.open) return
    closeRef.current && closeRef.current.focus()
    const onKey = e => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') step(-1)
      if (e.key === 'ArrowRight') step(1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lb.open, items.length])

  const refOf = it => `VRK-${String(WORKS.indexOf(it) + 1).padStart(2, '0')}`
  const cur = items[Math.min(lb.i, items.length - 1)]
  return (
    <>
      {filter && (
        <div className="work-filter" role="group" aria-label={t.filterLabel}>
          {WORK_CATS.map(c => {
            const n = c.id === 'all' ? base.length : base.filter(w => workCat(w.slug) === c.id).length
            return <button key={c.id} type="button" className={`chip chip-btn${cat === c.id ? ' is-on' : ''}`} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c[lang]} <span className="chip-count">{n}</span></button>
          })}
        </div>
      )}
      <div className={`work-grid${even ? ' is-even' : ''}`}>
        {items.map((it, n) => (
          <button key={it.slug} className={`work-item ${even ? '' : spans[n % spans.length]}`} onClick={() => open(n)}
            aria-label={`${t.lbOpen} ${it.alt}`}>
            <img src={`/assets/img/work/${it.slug}-960.webp`}
              srcSet={`/assets/img/work/${it.slug}-480.webp 480w, /assets/img/work/${it.slug}-800.webp 800w, /assets/img/work/${it.slug}-960.webp 960w, /assets/img/work/${it.slug}-1600.webp 1600w`}
              sizes="(max-width:480px) 100vw, (max-width:860px) 50vw, 33vw"
              alt={it.alt} loading={n < eagerCount ? 'eager' : 'lazy'} fetchPriority={n === 0 && eagerCount > 0 ? 'high' : undefined} decoding="async"
              width={it.sizes['960'][0]} height={it.sizes['960'][1]} />
            <span className="work-label"><span>{refOf(it)}</span><span className="view-pill">{I.eye} {t.view}</span></span>
          </button>
        ))}
      </div>
      {lb.open && cur && (
        <div className="lightbox is-open" role="dialog" aria-modal="true" aria-label={t.viewerAria}
          onTouchStart={e => { touchX.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            if (touchX.current === null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            if (Math.abs(dx) > 48) step(dx > 0 ? -1 : 1)
            touchX.current = null
          }}>
          <div className="lightbox-backdrop" onClick={close}></div>
          <div className="lightbox-stage">
            <button ref={closeRef} className="lb-btn lb-close" aria-label={t.closeViewer} onClick={close}>{I.x}</button>
            <div className="lightbox-imgwrap">
              <button className="lb-btn lb-prev" aria-label={t.prev} onClick={() => step(-1)}>{I.chevl}</button>
              <img className={switching ? 'is-switching' : ''} src={`/assets/img/work/${cur.slug}-full.jpg`} alt={cur.alt} />
              <button className="lb-btn lb-next" aria-label={t.next} onClick={() => step(1)}>{I.chevr}</button>
            </div>
            <div className="lightbox-bar">
              <div>
                <div className="lightbox-count">{lb.i + 1} / {items.length}</div>
                <div className="lightbox-caption">{cur.alt}</div>
              </div>
              <div className="lightbox-actions">
                <button className="btn btn-primary" onClick={() => openQuote(refOf(cur), cur.alt)}>{I.heart} {t.quoteThis}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ---------- stars ---------- */
export const Stars = ({ label }) => (
  <div className="gstars" role="img" aria-label={label || '5 out of 5'}>{[0, 1, 2, 3, 4].map(k => <span key={k}>{I.star}</span>)}</div>
)

/* ---------- Google rating line (visible text only, no review markup) ---------- */
export function RatingLine({ center }) {
  const t = useT()
  return (
    <div className={`rating-line${center ? ' center' : ''}`}>
      <Stars label="4.8 out of 5" />
      <span>{t.ratingLine}</span>
      <a href={GBP} target="_blank" rel="noopener noreferrer" className="text-link">{t.ratingCta} {I.arrow}</a>
    </div>
  )
}

/* ---------- testimonials carousel ---------- */
export function Testimonials() {
  const t = useT()
  const [i, setI] = useState(0)
  const paused = useRef(false)
  const touchX = useRef(null)
  const n = TESTIMONIALS.length
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => { if (!paused.current) setI(x => (x + 1) % n) }, 7000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="tcarousel glass reveal" onMouseEnter={() => { paused.current = true }} onMouseLeave={() => { paused.current = false }}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; paused.current = true }}
      onTouchEnd={e => {
        if (touchX.current !== null) {
          const dx = e.changedTouches[0].clientX - touchX.current
          if (Math.abs(dx) > 48) setI(x => (x + (dx > 0 ? -1 : 1) + n) % n)
        }
        touchX.current = null; paused.current = false
      }}>
      <span className="tquote" aria-hidden="true">{I.quote}</span>
      <div className="tviewport">
        {/* transform is the one dynamic inline style kept on purpose: it moves the slider */}
        <div className="ttrack" style={{ transform: `translateX(-${i * 100}%)` }}>
          {TESTIMONIALS.map((tm, k) => (
            <figure className="tslide" key={tm.name} aria-hidden={k !== i}>
              <div className="gstars" role="img" aria-label={`${tm.rating} out of 5`}>{Array.from({ length: tm.rating }).map((_, s) => <span key={s}>{I.star}</span>)}</div>
              <blockquote lang="en"><p>{tm.text}</p></blockquote>
              <figcaption><b>{tm.name}</b><span>{[tm.location, tm.event].filter(Boolean).join(' · ')}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="tcontrols">
        <button className="lb-btn tbtn" aria-label={t.tPrev} onClick={() => setI(x => (x - 1 + n) % n)}>{I.chevl}</button>
        <div className="tdots">
          {TESTIMONIALS.map((_, k) => (
            <button key={k} className={`tdot${k === i ? ' is-on' : ''}`} aria-label={`${k + 1} / ${n}`} aria-pressed={k === i} onClick={() => setI(k)}></button>
          ))}
        </div>
        <button className="lb-btn tbtn" aria-label={t.tNext} onClick={() => setI(x => (x + 1) % n)}>{I.chevr}</button>
      </div>
      <p className="tsource"><a href={GBP} target="_blank" rel="noopener noreferrer">{t.tGoogle} {I.arrow}</a></p>
    </div>
  )
}

/* ---------- FAQ list (details/summary works without JavaScript) ---------- */
export function FaqList({ items }) {
  return (
    <div className="faq reveal">
      {items.map(([q, a]) => (
        <details key={q}><summary>{q}<span className="plus" aria-hidden="true">+</span></summary><div className="faq-a"><p>{a}</p></div></details>
      ))}
    </div>
  )
}

/* ---------- Google map: visible straight away; the frame itself loads lazily when it nears the viewport ---------- */
export function MapFacade() {
  const t = useT()
  const src = `https://www.google.com/maps?q=${GEO.lat},${GEO.lng}&z=16&output=embed`
  return (
    <div className="map-embed">
      <div className="map-facade">
        <iframe title={t.mapTitle} src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen></iframe>
      </div>
      <a className="text-link" href={MAPS} target="_blank" rel="noopener noreferrer">{t.directions} {I.arrow}</a>
    </div>
  )
}

/* ---------- CTA band ---------- */
export function CtaBand({ kicker, h, p, secondary, className = 'pt-0' }) {
  const t = useT()
  const { openQuote } = useQuote()
  return (
    <section className={`section ${className}`}>
      <div className="wrap">
        <div className="cta-band reveal">
          {kicker && <p className="kicker kicker-light">{kicker}</p>}
          <h2>{h}</h2>
          <p>{p}</p>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => openQuote()}>{t.getQuote} {I.arrow}</button>
            {secondary || <a className="btn btn-light" href={waLink(t.waFloating)} target="_blank" rel="noopener noreferrer">{I.wa} {t.waUs}</a>}
          </div>
        </div>
      </div>
    </section>
  )
}
