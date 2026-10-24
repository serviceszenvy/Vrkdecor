import { Link } from 'react-router-dom'
import { I } from '../components/Icons.jsx'
import { useT, useLang, useQuote, HeroMedia } from '../components/Chrome.jsx'
import { Marquee, PageHero, Breadcrumb, WorkGrid, Testimonials, CtaBand, FaqList, MapFacade, RatingLine, Stars } from '../components/Blocks.jsx'
import { Steps, ServiceCards, AreasBlock, VenuesBlock, LastUpdated, useP } from '../components/Shared.jsx'
import { SERVICES } from '../data/content.js'
import { PHONE_DISPLAY, PHONE_TEL, waLink } from '../site.js'

/* ================= SERVICES HUB ================= */
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
          <div className="section-head"><h2>{t.svcMainH}</h2><p>{t.svcMainP}</p></div>
          <ServiceCards withLead />
        </div>
      </section>
      <section className="section section-tight pt-0">
        <div className="wrap">
          <div className="section-head"><h2>{t.svcHubOtherH}</h2><p>{t.svcHubOtherP}</p></div>
          <div className="svc-grid svc-grid-page">
            {SERVICES.map((s, k) => (
              <div className={`card svc reveal${k < 2 ? ' svc-feat' : ''}`} key={s.en[0]}>
                <span className="icon">{I[s.icon]}</span>
                <h3>{s[lang][0]}</h3><p>{s[lang][1]}</p>
                {s.partner && <span className="tag">{t.partnerTag}</span>}
              </div>
            ))}
          </div>
          <p className="form-note mt-m">{t.partnerNote}</p>
        </div>
      </section>
      <Steps />
      <CtaBand h={t.svcCtaH} p={t.svcCtaP} />
    </main>
  )
}
