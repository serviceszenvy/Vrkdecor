import { Link } from 'react-router-dom'
import { I } from '../components/Icons.jsx'
import { useT, useLang, useQuote, HeroMedia } from '../components/Chrome.jsx'
import { Marquee, PageHero, Breadcrumb, WorkGrid, Testimonials, CtaBand, FaqList, MapFacade, RatingLine, Stars } from '../components/Blocks.jsx'
import { Steps, ServiceCards, AreasBlock, VenuesBlock, LastUpdated, useP } from '../components/Shared.jsx'
import { VENUES, servicePageBySlug } from '../data/servicePages.js'
import { PHONE_DISPLAY, PHONE_TEL, waLink } from '../site.js'

/* ================= SERVICE PAGE ================= */
export function ServicePage({ slug }) {
  const t = useT(); const lang = useLang(); const p = useP()
  const sp = servicePageBySlug(slug)
  const c = sp[lang] || sp.en
  return (
    <main id="main">
      <PageHero trail={[[t.nav.services, p('/services')], [c.name]]}
        title={<>{c.h1a} <em className="serif-i">{c.h1b}</em></>} lead={c.lead}
        aside={<div className="head-actions reveal">
          <a className="btn btn-wa" href={waLink(`${t.waFloating} (${c.name})`)} target="_blank" rel="noopener noreferrer">{I.wa} {t.waUs}</a>
          <a className="btn btn-ghost" href={`tel:${PHONE_TEL}`}>{I.phone} {PHONE_DISPLAY}</a>
        </div>} />
      <section className="section section-tight">
        <div className="wrap split split-top">
          <div className="prose-flow">
            {c.intro.map((para, k) => <p key={k} className={k === 0 ? 'lead' : undefined}>{para}</p>)}
            <LastUpdated />
          </div>
          <div className="glass included">
            <p className="kicker">{t.includedK}</p>
            <h2 className="h3">{c.includedH}</h2>
            <ul className="check-list">{c.included.map(x => <li key={x}>{I.check} {x}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="section section-tight pt-0">
        <div className="wrap">
          <div className="section-head"><p className="kicker">{t.galleryK}</p><h2>{c.galleryH}</h2></div>
          <WorkGrid slugs={sp.photos} eagerCount={0} />
        </div>
      </section>

      {c.styles && c.styles.length > 0 && (
        <section className="section section-tight pt-0">
          <div className="wrap split split-top">
            <div className="reveal">
              <p className="kicker">{t.stylesK}</p>
              <h2>{c.stylesH}</h2>
              <p>{c.stylesP}</p>
              <ul className="check-list">{c.styles.map(x => <li key={x}>{I.check} {x}</li>)}</ul>
            </div>
            {c.extraH && (
              <div className="glass included reveal reveal-d1">
                <h2 className="h3">{c.extraH}</h2>
                {c.extraP.map((para, k) => <p key={k}>{para}</p>)}
              </div>
            )}
          </div>
        </section>
      )}

      {sp.showVenues && c.venuesH && (
        <section className="section section-tight pt-0">
          <div className="wrap">
            <div className="venues glass reveal">
              <h2 className="h3">{c.venuesH}</h2>
              <p>{c.venuesP}</p>
              <ul className="venue-list">{VENUES.map(v => <li key={v}>{I.check} {v}</li>)}</ul>
              <p className="form-note">{c.venuesMore}</p>
            </div>
          </div>
        </section>
      )}

      <Steps />

      {c.faqs && c.faqs.length > 0 && (
        <section className="section section-tight">
          <div className="wrap">
            <div className="section-head center"><p className="kicker">{t.faqSvcK}</p><h2>{lang === 'ta' ? `${c.name}: கேள்விகள்` : `${c.name}: common questions`}</h2></div>
            <FaqList items={c.faqs} />
            <p className="center mt-m"><Link className="text-link" to={p('/faq')}>{t.faqMore} {I.arrow}</Link></p>
          </div>
        </section>
      )}

      <section className="section section-tight pt-0">
        <div className="wrap">
          <div className="section-head"><p className="kicker">{t.relatedK}</p><h2>{t.relatedH}</h2></div>
          <ServiceCards slugs={sp.related} withLead />
          <p className="mt-m"><Link className="text-link" to={p('/services')}>{t.allServices} {I.arrow}</Link></p>
        </div>
      </section>

      <CtaBand h={c.ctaH} p={c.ctaP} />
    </main>
  )
}
