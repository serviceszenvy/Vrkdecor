import { Link } from 'react-router-dom'
import { I } from '../components/Icons.jsx'
import { useT, useLang, useQuote, CinematicVideo } from '../components/Chrome.jsx'
import { Marquee, PageHero, WorkGrid, Testimonials, CtaBand } from '../components/Blocks.jsx'
import { HOME_SERVICES, SERVICES, PILLARS, STEPS, FAQS } from '../data/content.js'
import { PHONE_DISPLAY, PHONE_TEL, EMAIL, ADDRESS, MAPS, IG, IG_HANDLE, FB, PROPRIETOR, waLink } from '../site.js'
import { localePath } from '../i18n.js'

const Stars = () => <div className="gstars" aria-hidden="true">{[0,1,2,3,4].map(k => <span key={k}>{I.star}</span>)}</div>

/* ================= HOME ================= */
export function Home() {
  const t = useT(); const lang = useLang()
  const { openQuote } = useQuote()
  const p = x => localePath(lang, x)
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-media" aria-hidden="true">
          <CinematicVideo className="hero-video-full"
            src="/assets/video/vrk-hero-v3.mp4" poster="/assets/video/vrk-hero-v3-poster.webp"
            srcMobile="/assets/video/vrk-hero-v3-mobile.mp4" posterMobile="/assets/video/vrk-hero-v3-mobile-poster.webp"
            tabIndex={-1} />
        </div>
        <div className="hero-scrim" aria-hidden="true"></div>
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="hero-eyebrow"><span className="dot"></span> {t.heroEyebrow}</p>
            <h1>{t.heroH1a} <em>{t.heroH1b}</em></h1>
            <p className="hero-sub">{t.heroSub}</p>
            <div className="hero-ctas">
              <button className="btn btn-primary" onClick={() => openQuote()}>{t.getQuote} {I.arrow}</button>
              <Link className="btn btn-light" to={p('/our-work')}>{t.exploreWork}</Link>
            </div>
            <div className="hero-meta">
              <span>{I.pin} {t.heroMeta1}</span>
              <span>{I.star} {t.heroMeta2}</span>
              <span>{I.users} {t.heroMeta3}</span>
            </div>
          </div>
        </div>
        <div className="hero-scroll" aria-hidden="true">{t.scroll}</div>
      </section>

      <Marquee />

      <section className="section">
        <div className="wrap split">
          <div className="reveal">
            <p className="kicker">{t.vrkWayK}</p>
            <h2>{t.vrkWayH}</h2>
            <p className="lead">{t.vrkWayP}</p>
            <Link className="text-link" to={p('/about')}>{t.moreAbout} {I.arrow}</Link>
          </div>
          <div className="stats reveal reveal-d1">
            <div className="stat glass"><b>{t.stat1b}<i>{t.stat1i}</i></b><span>{t.stat1}</span></div>
            <div className="stat glass"><b>{t.stat2b}<i>{t.stat2i}</i></b><span>{t.stat2}</span></div>
            <div className="stat glass"><b>{t.stat3b}<i>{t.stat3i}</i></b><span>{t.stat3}</span></div>
          </div>
        </div>
      </section>

      <section className="section section-tight" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.workK}</p>
            <h2>{t.workH}</h2>
            <p>{t.workP}</p>
          </div>
          <WorkGrid limit={6} />
          <p className="center" style={{ marginTop: '2.2rem' }}><Link className="btn btn-dark" to={p('/our-work')}>{t.viewPortfolio} {I.arrow}</Link></p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="wrap">
          <div className="section-head center"><p className="kicker">{t.svcK}</p><h2>{t.svcH}</h2></div>
          <div className="svc-grid">
            {HOME_SERVICES.map(s => (
              <div className="card svc reveal" key={s.en[0]}>
                <span className="icon">{I[s.icon]}</span>
                <h3>{s[lang][0]}</h3><p>{s[lang][1]}</p>
              </div>
            ))}
          </div>
          <p className="center" style={{ marginTop: '2.2rem' }}><Link className="text-link" to={p('/services')}>{t.svcMore} {I.arrow}</Link></p>
        </div>
      </section>

      <section className="section section-dark">
        <div className="wrap">
          <div className="section-head"><p className="kicker">{t.whyK}</p><h2>{t.whyH}</h2></div>
          <div className="pillars">
            {PILLARS[lang].map(([n, h, d]) => (
              <div className="pillar reveal" key={n}><span className="num">{n}</span><h3>{h}</h3><p>{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tight" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head center"><p className="kicker">{t.tK}</p><h2>{t.tH}</h2></div>
          <Testimonials />
        </div>
      </section>

      <section className="section section-tight" style={{ paddingTop: 0 }}>
        <div className="wrap glass map-band reveal">
          <div>
            <p className="kicker">{t.areaK}</p>
            <h3>{t.areaH}</h3>
            <div className="chips" style={{ marginTop: '1rem' }}>
              {t.areas.map((a, k) => <span className="chip" key={a}>{k === 0 && I.pin} {a}</span>)}
              <span className="chip"><i>&#10022;</i> {t.areaMore}</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '.92rem' }}>{ADDRESS}</p>
            <a className="btn btn-ghost" href={MAPS} target="_blank" rel="noopener noreferrer">{I.pin} {t.mapsCta}</a>
          </div>
        </div>
      </section>

      <CtaBand kicker={t.ctaK} h={t.ctaH} p={t.ctaP}
        secondary={<a className="btn btn-light" href={waLink(t.waFloating)} target="_blank" rel="noopener noreferrer">{I.wa} {t.waUs}</a>} />
    </main>
  )
}

/* ================= SERVICES ================= */
export function Services() {
  const t = useT(); const lang = useLang()
  return (
    <main id="main">
      <PageHero crumb={t.nav.services}
        title={<>{t.svcPageH1a} <em className="serif-i">{t.svcPageH1b}</em></>} lead={t.svcPageLead}
        aside={<div className="head-actions reveal">
          <a className="btn btn-wa" href={waLink(t.waFloating)} target="_blank" rel="noopener noreferrer">{I.wa} {t.waUs}</a>
          <a className="btn btn-ghost" href={`tel:${PHONE_TEL}`}>{I.phone} {PHONE_DISPLAY}</a>
        </div>} />
      <Marquee />
      <section className="section section-tight">
        <div className="wrap">
          <div className="svc-grid svc-grid-page">
            {SERVICES.map((s, k) => (
              <div className={`card svc reveal${k < 2 ? ' svc-feat' : ''}`} key={s.en[0]}>
                <span className="icon">{I[s.icon]}</span>
                <h3>{s[lang][0]}</h3><p>{s[lang][1]}</p>
                {s.partner && <span className="tag">{t.partnerTag}</span>}
              </div>
            ))}
          </div>
          <p className="form-note" style={{ marginTop: '1.4rem' }}>{t.partnerNote}</p>
        </div>
      </section>
      <section className="section section-dark">
        <div className="wrap">
          <div className="section-head"><p className="kicker">{t.stepsK}</p><h2>{t.stepsH}</h2></div>
          <div className="pillars">
            {STEPS[lang].map(([n, h, d]) => <div className="pillar reveal" key={n}><span className="num">{n}</span><h3>{h}</h3><p>{d}</p></div>)}
          </div>
        </div>
      </section>
      <CtaBand h={t.svcCtaH} p={t.svcCtaP}
        secondary={<a className="btn btn-light" href={waLink(t.waFloating)} target="_blank" rel="noopener noreferrer">{I.wa} {t.waUs}</a>} />
    </main>
  )
}

/* ================= OUR WORK ================= */
export function OurWork() {
  const t = useT()
  return (
    <main id="main">
      <PageHero crumb={t.nav.work}
        title={<>{t.owH1a} <em className="serif-i">{t.owH1b}</em></>} lead={t.owLead}
        aside={<div className="head-stat reveal" title={t.owCountSub}><b>49<i>+</i></b><span>{t.owCount}</span></div>} />
      <Marquee />
      <section className="section section-tight">
        <div className="wrap">
          <WorkGrid />
          <div className="glass review-band reveal" style={{ marginTop: '3rem' }}>
            <div>
              <h3 style={{ marginBottom: '.4rem' }}>{t.owBandH}</h3>
              <p style={{ margin: 0 }}>{t.owBandP}</p>
            </div>
            <a className="btn btn-dark" href={IG} target="_blank" rel="noopener noreferrer">{I.ig} {t.igMore}</a>
          </div>
        </div>
      </section>
    </main>
  )
}

/* ================= ABOUT ================= */
export function About() {
  const t = useT(); const lang = useLang()
  return (
    <main id="main">
      <section className="section page-lede">
        <div className="wrap split">
          <div className="reveal">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to={localePath(lang, '/')}>{t.nav.home}</Link><span className="sep">&#10022;</span><span aria-current="page">{t.nav.about}</span>
            </nav>
            <p className="kicker">{t.abWhoK}</p>
            <h1>{t.abH1a} <em className="serif-i">{t.abH1b}</em></h1>
            <p className="lead">{t.abLead}</p>
            <p className="lead-sub">{t.abWhoLead}</p>
            <p>{t.abWhoP}</p>
            <div className="chips" style={{ marginTop: '1.2rem' }}>
              <span className="chip">{I.check} {t.abChip1}</span>
              <span className="chip">{I.check} {t.abChip2}</span>
              <span className="chip">{I.check} {t.abChip3}</span>
            </div>
          </div>
          <div className="stats reveal reveal-d1" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div className="stat glass"><b>{t.stat1b}<i>{t.stat1i}</i></b><span>{t.stat1}</span></div>
            <div className="stat glass"><b>{t.stat2b}<i>{t.stat2i}</i></b><span>{t.stat2}</span></div>
            <div className="stat glass"><b>{t.stat3b}<i>{t.stat3i}</i></b><span>{t.stat3}</span></div>
          </div>
        </div>
      </section>
      <section className="section section-tight prop-feature" style={{ paddingTop: 0 }}>
        <div className="wrap prop-grid">
          <div className="prop-media reveal">
            <img src="/assets/img/proprietor.webp" alt={`${PROPRIETOR}, proprietor of VRK Decor`} width="591" height="744" loading="lazy" decoding="async" />
            <span className="prop-float">{I.pin} {t.propFloat}</span>
          </div>
          <div className="prop-body reveal reveal-d1">
            <span className="prop-badge">{t.propTitle}</span>
            <h2>{PROPRIETOR}</h2>
            <p className="prop-intro">{t.propIntro}</p>
            <p>{t.propP1}</p>
            <p>{t.propP2}</p>
            <blockquote className="pull" lang="en">{t.propQuote}<footer>{PROPRIETOR} &middot; Proprietor, VRK Decor</footer></blockquote>
            <div className="prop-meta">
              {t.propChips.map(c => <span className="chip" key={c}>{I.check} {c}</span>)}
            </div>
          </div>
        </div>
      </section>
      <section className="section section-dark">
        <div className="wrap">
          <div className="section-head"><p className="kicker">{t.promisesK}</p><h2>{t.promisesH}</h2></div>
          <div className="pillars pillars-3">
            {t.promises.map(([h, d], k) => (
              <div className={`pillar reveal${k ? ` reveal-d${k}` : ''}`} key={h}><span className="num">{String(k + 1).padStart(2, '0')}</span><h3>{h}</h3><p>{d}</p></div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="section-head center"><p className="kicker">{t.tK}</p><h2>{t.tH}</h2></div>
          <Testimonials />
          <p className="form-note center" style={{ marginTop: '1rem' }}>{t.reviewInvite}</p>
        </div>
      </section>
      <CtaBand h={t.abCtaH} p={t.abCtaP}
        secondary={<Link className="btn btn-light" to={localePath(lang, '/our-work')}>{t.exploreWork}</Link>} />
    </main>
  )
}

/* ================= CONTACT ================= */
export function Contact() {
  const t = useT()
  const submit = e => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.target).entries())
    const lines = [t.waIntro]
    ;[['name', t.fName], ['phone', t.fPhone], ['event', t.fEvent], ['date', t.fDate], ['location', t.fLocation], ['notes', t.fNotes]]
      .forEach(([k, label]) => { if (f[k]) lines.push(`${label}: ${f[k]}`) })
    window.open(`https://wa.me/919994072435?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener')
  }
  return (
    <main id="main">
      <PageHero crumb={t.nav.contact} kicker={t.cK}
        title={<>{t.cH1a} <em className="serif-i">{t.cH1b}</em></>} lead={t.cLead} />
      <section className="section" style={{ paddingTop: '1.5rem' }}>
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
      <section className="section section-tight" style={{ paddingTop: 0 }}>
        <div className="wrap split" style={{ alignItems: 'start' }}>
          <div className="glass reveal" style={{ padding: '2rem', borderRadius: 'var(--r-l)' }}>
            <p className="kicker">{t.formK}</p>
            <h3>{t.formH}</h3>
            <form className="form-grid" style={{ marginTop: '1.2rem' }} onSubmit={submit} noValidate>
              <div><label htmlFor="cf-name">{t.fName}</label><input id="cf-name" name="name" autoComplete="name" required /></div>
              <div><label htmlFor="cf-phone">{t.fPhone}</label><input id="cf-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" /></div>
              <div><label htmlFor="cf-event">{t.fEvent}</label>
                <select id="cf-event" name="event" defaultValue={t.events[0]}>{t.events.map(ev => <option key={ev}>{ev}</option>)}</select></div>
              <div><label htmlFor="cf-date">{t.fDate}</label><input id="cf-date" name="date" type="date" /></div>
              <div className="full"><label htmlFor="cf-loc">{t.fLocation}</label><input id="cf-loc" name="location" placeholder={t.fLocPH} /></div>
              <div className="full"><label htmlFor="cf-notes">{t.fNotes}</label><textarea id="cf-notes" name="notes" placeholder={t.fNotesPH}></textarea></div>
              <div className="full"><button className="btn btn-wa" type="submit" style={{ width: '100%' }}>{I.wa} {t.sendWa}</button></div>
              <p className="form-note full">{t.formNote}</p>
            </form>
          </div>
          <div>
            <div className="glass reveal reveal-d1" style={{ padding: '2rem', borderRadius: 'var(--r-l)' }}>
              <p className="kicker">{t.visitK}</p>
              <h3>{t.visitH}</h3>
              <p>{ADDRESS}</p>
              <a className="btn btn-ghost" href={MAPS} target="_blank" rel="noopener noreferrer">{I.pin} {t.mapsCta}</a>
              <p style={{ marginTop: '1.4rem', fontSize: '.9rem' }}>{t.serving}</p>
            </div>
            <div className="glass reveal reveal-d2" style={{ padding: '2rem', borderRadius: 'var(--r-l)', marginTop: '1rem' }}>
              <Stars />
              <p style={{ margin: 0, fontSize: '.95rem' }}><a href={MAPS} target="_blank" rel="noopener noreferrer">{t.gReviews}</a></p>
            </div>
          </div>
        </div>
      </section>
      <section className="section section-tight">
        <div className="wrap">
          <div className="section-head center"><p className="kicker">{t.faqK}</p><h2>{t.faqH}</h2></div>
          <div className="faq reveal">
            {FAQS[useLang()].map(([q, a]) => (
              <details key={q}><summary>{q}<span className="plus">+</span></summary><div className="faq-a">{a}</div></details>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

/* ================= LEGAL ================= */
export function Privacy() {
  return (
    <main id="main">
      <PageHero crumb="Privacy Policy" kicker="VRK Decor" title="Privacy Policy" lead="How this website handles the details you share with us" />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap prose">
          <p>VRK Decor (301 M.S Road, Vettunimadam, Nagercoil, Tamil Nadu 629003) respects your privacy. This website is a brochure site for our event decoration business. It runs no analytics trackers, sets no marketing cookies and stores no form submissions on any server</p>
          <h2>Information you share with us</h2>
          <p>The quote and contact forms on this site compose a WhatsApp message on your own device. The name, phone number, event details and requirements you type are sent to us only when you choose to send that message in WhatsApp. If you call, email or message us directly, those conversations are handled under the terms of your phone, email or WhatsApp provider</p>
          <h2>How we use your details</h2>
          <p>We use the details you share only to respond to your enquiry, prepare quotations, plan and deliver the decoration services you book, and coordinate partner services such as band set or sound where you request them. We do not sell your information, and we do not share it with anyone except the partner vendors needed to deliver your event</p>
          <h2>Event photographs</h2>
          <p>We photograph our decoration work for our records. If we wish to feature photographs from your event on our website, Instagram or other promotion, we will seek your permission first. You may ask us at any time to remove a photograph connected to your event by contacting the details below</p>
          <h2>Links to other services</h2>
          <p>This site links to WhatsApp, Instagram and Google Maps. Those platforms operate under their own privacy policies once you leave our site</p>
          <h2>Your choices</h2>
          <p>You may contact us at any time to ask what details of yours we hold from past enquiries or bookings, to correct them, or to ask us to delete them where we have no ongoing need to keep them</p>
          <h2>Contact</h2>
          <p>For any privacy question, write to <a href="mailto:vrk.groups@gmail.com">vrk.groups@gmail.com</a> or call +91 99940 72435</p>
        </div>
      </section>
    </main>
  )
}

export function Terms() {
  return (
    <main id="main">
      <PageHero crumb="Terms" kicker="VRK Decor" title="Terms of Use" lead="The terms that apply to this website and to bookings made with VRK Decor" />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap prose">
          <h2>About this website</h2>
          <p>This website presents the services and past work of VRK Decor, an event decoration business based in Nagercoil, Tamil Nadu. Using the site or sending an enquiry does not by itself create a booking</p>
          <h2>Quotations</h2>
          <p>Designs shown in Our Work illustrate VRK Decor&rsquo;s styles and capabilities. Final designs depend on your venue, season, flower availability and budget, and are confirmed in a written quotation for your specific date. A quotation is valid for the period stated on it</p>
          <h2>Bookings and payment</h2>
          <p>A booking is confirmed only on payment of the advance stated in your quotation. The balance is payable as agreed in the quotation. Changes to the venue, date, scope or design after confirmation may revise the quoted amount</p>
          <h2>Cancellation and postponement</h2>
          <p>If you need to cancel or postpone, inform us as early as possible. Amounts already spent on flowers, materials and advances to partner vendors for your event may not be refundable. Postponement to a new date is accommodated subject to availability</p>
          <h2>Partner services</h2>
          <p>Band set, live band, sound and AV are provided by partner vendors arranged and coordinated by VRK Decor. These services are delivered by the partner under their own terms, with VRK Decor as your single point of coordination</p>
          <h2>Venue conditions</h2>
          <p>Decoration plans depend on the venue permitting the agreed setup, access times and electrical supply. Restrictions imposed by a venue on the day may require reasonable adjustments to the design</p>
          <h2>Website content</h2>
          <p>Photographs, text and the VRK Decor name and logo on this site belong to VRK Decor and may not be copied or reused without written permission</p>
          <h2>Jurisdiction</h2>
          <p>These terms are governed by the laws of India, and any dispute is subject to the courts at Nagercoil, Tamil Nadu</p>
          <h2>Contact</h2>
          <p>Questions about these terms can be sent to <a href="mailto:vrk.groups@gmail.com">vrk.groups@gmail.com</a> or +91 99940 72435</p>
        </div>
      </section>
    </main>
  )
}

export function NotFound() {
  const t = useT(); const lang = useLang()
  return (
    <main id="main">
      <PageHero crumb="404" kicker="VRK Decor" title={t.notFoundH} lead={t.notFoundP} />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p><Link className="btn btn-primary" to={localePath(lang, '/')}>{t.backHome}</Link> &nbsp; <Link className="btn btn-ghost" to={localePath(lang, '/our-work')}>{t.exploreWork}</Link></p>
        </div>
      </section>
    </main>
  )
}
