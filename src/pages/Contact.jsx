import { Link } from 'react-router-dom'
import { I } from '../components/Icons.jsx'
import { useT, useLang, useQuote, HeroMedia } from '../components/Chrome.jsx'
import { Marquee, PageHero, Breadcrumb, WorkGrid, Testimonials, CtaBand, FaqList, MapFacade, RatingLine, Stars } from '../components/Blocks.jsx'
import { Steps, ServiceCards, AreasBlock, VenuesBlock, LastUpdated, useP } from '../components/Shared.jsx'
import { useState } from 'react'
import { PHONE_DISPLAY, PHONE_TEL, EMAIL, leadError, ADDRESS, ADDRESS_TA, GBP, IG, IG_HANDLE, FB, waLink } from '../site.js'
import { track } from '../analytics.js'

/* ================= CONTACT ================= */
export function Contact() {
  const t = useT(); const lang = useLang(); const p = useP()
  const [err, setErr] = useState('')
  const submit = e => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.target).entries())
    if (f.website) return // honeypot
    const bad = leadError(f)
    setErr(bad)
    if (bad) { const el = e.target.elements[bad]; if (el) el.focus(); return }
    const lines = [t.waIntro]
    ;[['name', t.fName], ['phone', t.fPhone], ['event', t.fEvent], ['date', t.fDate], ['location', t.fLocation], ['notes', t.fNotes]]
      .forEach(([k, label]) => { if (f[k]) lines.push(`${label}: ${f[k]}`) })
    track('generate_lead', { form: 'contact_page', event_type: f.event || '' })
    window.open(waLink(lines.join('\n')), '_blank', 'noopener')
  }
  return (
    <main id="main">
      <PageHero crumb={t.nav.contact}
        title={<>{t.cH1a} <em className="serif-i">{t.cH1b}</em></>} lead={t.cLead} />
      <section className="section pt-s">
        <div className="wrap">
          <div className="contact-grid">
            <a className="card contact-card reveal" href={waLink(t.waIntro)} target="_blank" rel="noopener noreferrer">
              <span className="icon">{I.wa}</span><b>{t.cWa}</b><span>{PHONE_DISPLAY}</span><span className="text-link">{t.cWaCta} {I.arrow}</span>
            </a>
            <a className="card contact-card reveal reveal-d1" href={`tel:${PHONE_TEL}`}>
              <span className="icon">{I.phone}</span><b>{t.cCall}</b><span>{PHONE_DISPLAY}</span><span className="text-link">{t.cCallCta} {I.arrow}</span>
            </a>
            <a className="card contact-card reveal reveal-d2" href={`mailto:${EMAIL}`}>
              <span className="icon">{I.mail}</span><b>{t.cMail}</b><span>{EMAIL}</span><span className="text-link">{t.cMailCta} {I.arrow}</span>
            </a>
            <a className="card contact-card reveal reveal-d3" href={IG} target="_blank" rel="noopener noreferrer">
              <span className="icon">{I.ig}</span><b>{t.cIg}</b><span>{IG_HANDLE}</span><span className="text-link">{t.cIgCta} {I.arrow}</span>
            </a>
            <a className="card contact-card reveal reveal-d3" href={FB} target="_blank" rel="noopener noreferrer">
              <span className="icon">{I.fb}</span><b>{t.cFb}</b><span>/vrkdecor</span><span className="text-link">{t.cFbCta} {I.arrow}</span>
            </a>
          </div>
        </div>
      </section>
      <section className="section section-tight pt-0">
        <div className="wrap split split-top">
          <div className="glass panel reveal">
            <p className="kicker">{t.formK}</p>
            <h2 className="h3">{t.formH}</h2>
            <form className="form-grid mt-s" onSubmit={submit} noValidate>
              <div><label htmlFor="cf-name">{t.fName}</label><input id="cf-name" type="text" name="name" autoComplete="name" required aria-invalid={err === 'name' || undefined} aria-describedby={err === 'name' ? 'cf-err' : undefined} /></div>
              <div><label htmlFor="cf-phone">{t.fPhone}</label><input id="cf-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" aria-invalid={err === 'phone' || undefined} aria-describedby={err === 'phone' ? 'cf-err' : undefined} /></div>
              <div><label htmlFor="cf-event">{t.fEvent}</label>
                <select id="cf-event" name="event" defaultValue={t.events[0]}>{t.events.map(ev => <option key={ev}>{ev}</option>)}</select></div>
              <div><label htmlFor="cf-date">{t.fDate}</label><input id="cf-date" name="date" type="date" /></div>
              <div className="full"><label htmlFor="cf-loc">{t.fLocation}</label><input id="cf-loc" type="text" name="location" placeholder={t.fLocPH} /></div>
              <div className="full"><label htmlFor="cf-notes">{t.fNotes}</label><textarea id="cf-notes" name="notes" placeholder={t.fNotesPH}></textarea></div>
              <div className="hp" aria-hidden="true"><label htmlFor="cf-website">Website</label><input id="cf-website" type="text" name="website" tabIndex={-1} autoComplete="off" /></div>
              {err && <p className="field-err full" id="cf-err" role="alert">{err === 'name' ? t.errName : t.errPhone}</p>}
              <div className="full"><button className="btn btn-wa btn-block" type="submit">{I.wa} {t.sendWa}</button></div>
              <p className="form-note full">{t.formNote}</p>
            </form>
          </div>
          <div>
            <div className="glass panel reveal reveal-d1">
              <p className="kicker">{t.visitK}</p>
              <h2 className="h3">{t.visitH}</h2>
              <p>{lang === 'ta' ? ADDRESS_TA : ADDRESS}</p>
              <p className="text-sm"><b>{t.hoursK}:</b> {t.hoursP}</p>
              <MapFacade />
              <p className="text-sm mt-s">{t.serving}</p>
            </div>
            <div className="glass panel reveal reveal-d2 mt-s">
              <Stars label="4.8 out of 5" />
              <p className="m-0 text-sm"><a href={GBP} target="_blank" rel="noopener noreferrer">{t.gReviews}</a></p>
            </div>
            <div className="glass panel reveal reveal-d2 mt-s">
              <h2 className="h3">{t.faqLinkH}</h2>
              <p>{t.faqLinkP}</p>
              <Link className="text-link" to={p('/faq')}>{t.faqLinkCta} {I.arrow}</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
