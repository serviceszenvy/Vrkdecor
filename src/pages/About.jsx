import { Link } from 'react-router-dom'
import { I } from '../components/Icons.jsx'
import { useT, useLang, useQuote, HeroMedia } from '../components/Chrome.jsx'
import { Marquee, PageHero, Breadcrumb, WorkGrid, Testimonials, CtaBand, FaqList, MapFacade, RatingLine, Stars } from '../components/Blocks.jsx'
import { Steps, ServiceCards, AreasBlock, VenuesBlock, LastUpdated, useP } from '../components/Shared.jsx'
import { PROPRIETOR, PROPRIETOR_TA, OFFICIAL_DESC, OFFICIAL_DESC_TA, GBP, IG, FB, JUSTDIAL, INDIAMART, YOUTUBE, LINKEDIN, X_PROFILE } from '../site.js'

/* ================= ABOUT ================= */
export function About() {
  const t = useT(); const lang = useLang(); const p = useP()
  const profiles = [['Google', GBP], ['Instagram', IG], ['Facebook', FB], ['Justdial', JUSTDIAL], ['IndiaMART', INDIAMART], ['YouTube', YOUTUBE], ['LinkedIn', LINKEDIN], ['X', X_PROFILE]].filter(([, u]) => u)
  return (
    <main id="main">
      <section className="section page-lede">
        <div className="wrap split">
          <div className="reveal">
            <Breadcrumb trail={[[t.nav.about]]} />
            <p className="kicker">{t.abWhoK}</p>
            <h1>{t.abH1a} <em className="serif-i">{t.abH1b}</em></h1>
            <p className="lead">{lang === 'ta' ? OFFICIAL_DESC_TA : OFFICIAL_DESC}</p>
            <p className="lead-sub">{t.abWhoLead}</p>
            <p>{t.abWhoP}</p>
            <ul className="chips chips-list mt-s">
              <li className="chip">{I.check} {t.abChip1}</li>
              <li className="chip">{I.check} {t.abChip2}</li>
              <li className="chip">{I.check} {t.abChip3}</li>
            </ul>
          </div>
          <div className="stats stats-stack reveal reveal-d1">
            <div className="stat glass"><b>{t.stat1b}<i>{t.stat1i}</i></b><span>{t.stat1}</span></div>
            <div className="stat glass"><b>{t.stat2b}<i>{t.stat2i}</i></b><span>{t.stat2}</span></div>
            <div className="stat glass"><b>{t.stat3b}<i>{t.stat3i}</i></b><span>{t.stat3}</span></div>
          </div>
        </div>
      </section>
      <section id="proprietor" className="section section-tight prop-feature pt-0">
        <div className="wrap prop-grid">
          <div className="prop-media reveal">
            <img src="/assets/img/proprietor.webp" alt={`${PROPRIETOR}, proprietor of VRK Decor`} width="591" height="744" loading="lazy" decoding="async" />
            <span className="prop-float">{I.pin} {t.propFloat}</span>
          </div>
          <div className="prop-body reveal reveal-d1">
            <span className="prop-badge">{t.propTitle}</span>
            <h2>{lang === 'ta' ? PROPRIETOR_TA : PROPRIETOR}</h2>
            <p className="prop-intro">{t.propIntro}</p>
            <p>{t.propP1}</p>
            <p>{t.propP2}</p>
            <p>{t.propP3}</p>
            <blockquote className="pull" lang={lang}>{t.propQuote}<footer>{lang === 'ta' ? `${PROPRIETOR_TA} · உரிமையாளர், VRK Decor` : `${PROPRIETOR} · Proprietor, VRK Decor`}</footer></blockquote>
            <ul className="prop-meta chips-list">
              {t.propChips.map(c => <li className="chip" key={c}>{I.check} {c}</li>)}
            </ul>
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
          <RatingLine center />
          <Testimonials />
          <p className="form-note center mt-s">{t.reviewInvite}</p>
        </div>
      </section>
      <section className="section section-tight pt-0">
        <div className="wrap">
          <div className="glass profiles-band reveal">
            <h2 className="h3">{t.profilesH}</h2>
            <ul className="chips chips-list">
              {profiles.map(([n, u]) => <li key={n}><a className="chip" href={u} target="_blank" rel="noopener noreferrer">{n} {I.arrow}</a></li>)}
            </ul>
            <p className="mt-s"><Link className="text-link" to={p('/faq')}>{t.faqLinkCta} {I.arrow}</Link></p>
          </div>
        </div>
      </section>
      <CtaBand h={t.abCtaH} p={t.abCtaP}
        secondary={<Link className="btn btn-light" to={p('/our-work')}>{t.exploreWork}</Link>} />
    </main>
  )
}
