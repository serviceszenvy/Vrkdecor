import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { I } from './Icons.jsx'
import { useT, useLang, useQuote } from './Chrome.jsx'
import { WORKS, TESTIMONIALS } from '../data/content.js'
import { MAPS } from '../site.js'
import { localePath } from '../i18n.js'

/* ---------- occasions marquee ---------- */
export function Marquee() {
  const t = useT()
  const items = t.occasions.map(o => <span key={o}>{o} <i>&#10022;</i></span>)
  return (
    <div className="marquee" aria-label={t.occasions.join(', ')}>
      <div className="marquee-track">
        <span style={{ display: 'contents' }}>{items}</span>
        <span style={{ display: 'contents' }} aria-hidden="true">{items}</span>
      </div>
    </div>
  )
}

/* ---------- compact page head (inner pages): title integrated with the content, no tall intro band ---------- */
export function PageHero({ title, lead, crumb, aside }) {
  const t = useT(); const lang = useLang()
  return (
    <section className="page-head">
      <div className="wrap">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to={localePath(lang, '/')}>{t.nav.home}</Link><span className="sep">&#10022;</span><span aria-current="page">{crumb}</span>
        </nav>
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

/* ---------- work grid + lightbox ---------- */
const SPANS = ['w-feature', '', '', 'w-tall', '', '', 'w-wide', '', 'w-tall', '', 'w-wide', '']
// 6-item pattern tiles a 4-col grid into 3 complete rows with no holes
const HOME_SPANS = ['w-feature', 'w-wide', 'w-tall', '', 'w-wide', '']
export function WorkGrid({ limit }) {
  const t = useT()
  const { openQuote } = useQuote()
  const items = limit ? WORKS.slice(0, limit) : WORKS
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
  }, [lb.open])

  const cur = items[lb.i]
  const ref = `VRK-${String(lb.i + 1).padStart(2, '0')}`
  return (
    <>
      <div className="work-grid">
        {items.map((it, n) => {
          const r = `VRK-${String(n + 1).padStart(2, '0')}`
          return (
            <button key={it.slug} className={`work-item ${spans[n % spans.length]} reveal`} onClick={() => open(n)}
              aria-label={`${t.lbOpen} ${it.alt}`}>
              <img src={`/assets/img/work/${it.slug}-960.webp`}
                srcSet={`/assets/img/work/${it.slug}-480.webp 480w, /assets/img/work/${it.slug}-960.webp 960w, /assets/img/work/${it.slug}-1600.webp 1600w`}
                sizes="(max-width:480px) 100vw, (max-width:860px) 50vw, 33vw"
                alt={it.alt} loading={n < 3 ? 'eager' : 'lazy'} decoding="async"
                width={it.sizes['960'][0]} height={it.sizes['960'][1]} />
              <span className="work-label"><span>{r}</span><span className="view-pill">{I.eye} {t.view}</span></span>
            </button>
          )
        })}
      </div>
      {lb.open && (
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
                <button className="btn btn-primary" onClick={() => openQuote(ref, cur.alt)}>{I.heart} {t.quoteThis}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
        <div className="ttrack" style={{ transform: `translateX(-${i * 100}%)` }}>
          {TESTIMONIALS.map(tm => (
            <figure className="tslide" key={tm.name}>
              <div className="gstars" aria-label={`${tm.rating} out of 5`}>{Array.from({ length: tm.rating }).map((_, k) => <span key={k}>{I.star}</span>)}</div>
              <blockquote lang="en"><p>{tm.text}</p></blockquote>
              <figcaption><b>{tm.name}</b><span>{[tm.location, tm.event].filter(Boolean).join(' · ')}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="tcontrols">
        <button className="lb-btn tbtn" aria-label={t.tPrev} onClick={() => setI(x => (x - 1 + n) % n)}>{I.chevl}</button>
        <div className="tdots" role="tablist" aria-label="Testimonials">
          {TESTIMONIALS.map((_, k) => (
            <button key={k} className={`tdot${k === i ? ' is-on' : ''}`} aria-label={`${k + 1}`} aria-selected={k === i} role="tab" onClick={() => setI(k)}></button>
          ))}
        </div>
        <button className="lb-btn tbtn" aria-label={t.tNext} onClick={() => setI(x => (x + 1) % n)}>{I.chevr}</button>
      </div>
      <p className="tsource"><a href={MAPS} target="_blank" rel="noopener noreferrer">{t.tGoogle} {I.arrow}</a></p>
    </div>
  )
}

/* ---------- CTA band ---------- */
export function CtaBand({ kicker, h, p, secondary }) {
  const t = useT()
  const { openQuote } = useQuote()
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="cta-band reveal">
          {kicker && <p className="kicker" style={{ color: '#CBE89E' }}>{kicker}</p>}
          <h2>{h}</h2>
          <p>{p}</p>
          <div style={{ display: 'flex', gap: '.9rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => openQuote()}>{t.getQuote} {I.arrow}</button>
            {secondary}
          </div>
        </div>
      </div>
    </section>
  )
}
