import { Link } from 'react-router-dom'
import { I } from '../components/Icons.jsx'
import { useT, useLang, useQuote, HeroMedia } from '../components/Chrome.jsx'
import { Marquee, PageHero, Breadcrumb, WorkGrid, Testimonials, CtaBand, FaqList, MapFacade, RatingLine, Stars } from '../components/Blocks.jsx'
import { Steps, ServiceCards, AreasBlock, VenuesBlock, LastUpdated, useP } from '../components/Shared.jsx'
import { HOME_SERVICES, PILLARS } from '../data/content.js'
import { HOME_FAQ_IDS, faqById } from '../data/faq.js'
import { PROPRIETOR } from '../site.js'

/* ================= HOME ================= */
export function Home() {
  const t = useT(); const lang = useLang()
  const { openQuote } = useQuote()
  const p = useP()
  const homeFaq = HOME_FAQ_IDS.map(id => faqById(id)[lang])
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-media" aria-hidden="true"><HeroMedia /></div>
        <div className="hero-scrim" aria-hidden="true"></div>
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="hero-eyebrow"><span className="dot"></span> {t.heroEyebrow}</p>
            <h1>{t.heroH1a} <em>{t.heroH1b}</em></h1>
            <p className="hero-tag">{t.heroTag}</p>
            <p className="hero-sub">{t.heroSub}</p>
            <div className="hero-ctas">
              <button className="btn btn-primary" onClick={() => openQuote()}>{t.getQuote} {I.arrow}</button>
              <Link className="btn btn-light" to={p('/our-work')}>{t.exploreWork}</Link>
            </div>
            <div className="hero-meta">
              <span>{I.pin} {t.heroMeta1}</span>
              <span>{I.star} {t.heroRating}</span>
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

      <section className="section section-tight pt-0">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">{t.workK}</p>
            <h2>{t.workH}</h2>
            <p>{t.workP}</p>
          </div>
          <WorkGrid limit={6} eagerCount={0} />
          <p className="center mt-l"><Link className="btn btn-dark" to={p('/our-work')}>{t.viewPortfolio} {I.arrow}</Link></p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="wrap">
          <div className="section-head center"><p className="kicker">{t.svcK}</p><h2>{t.svcH}</h2><p>{t.svcIntroP}</p></div>
          <div className="svc-grid">
            {HOME_SERVICES.map(s => (
              <Link className="card svc svc-link reveal" key={s.en[0]} to={p(s.to)}>
                <span className="icon">{I[s.icon]}</span>
                <h3>{s[lang][0]}</h3><p>{s[lang][1]}</p>
                <span className="text-link">{t.svcCardCta} {I.arrow}</span>
              </Link>
            ))}
          </div>
          <p className="center mt-l"><Link className="text-link" to={p('/services')}>{t.svcMore} {I.arrow}</Link></p>
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

      <section className="section section-tight pt-0">
        <div className="wrap">
          <div className="prop-mini glass reveal">
            <img src="/assets/img/proprietor-chest.webp" alt={`${PROPRIETOR}, proprietor of VRK Decor`} width="360" height="461" loading="lazy" decoding="async" />
            <div className="prop-mini-body">
              <p className="kicker">{t.miniPropK}</p>
              <h2>{PROPRIETOR}</h2>
              <span className="prop-badge">{t.propTitle}</span>
              <p>{t.miniPropP}</p>
              <Link className="btn btn-ghost" to={p('/about')}>{t.miniPropCta} {I.arrow}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tight pt-0">
        <div className="wrap">
          <div className="section-head center"><p className="kicker">{t.tK}</p><h2>{t.tH}</h2></div>
          <RatingLine center />
          <Testimonials />
        </div>
      </section>

      <section className="section section-tight pt-0">
        <AreasBlock />
      </section>

      <section className="section section-tight pt-0">
        <div className="wrap"><VenuesBlock /></div>
      </section>

      <section className="section section-tight">
        <div className="wrap">
          <div className="section-head center"><p className="kicker">{t.homeFaqK}</p><h2>{t.homeFaqH}</h2></div>
          <FaqList items={homeFaq} />
          <p className="center mt-m"><Link className="text-link" to={p('/faq')}>{t.faqMore} {I.arrow}</Link></p>
        </div>
      </section>

      <Steps light />

      <CtaBand kicker={t.ctaK} h={t.ctaH} p={t.ctaP} />
    </main>
  )
}
