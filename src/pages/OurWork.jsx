import { Link } from 'react-router-dom'
import { I } from '../components/Icons.jsx'
import { useT, useLang, useQuote, HeroMedia } from '../components/Chrome.jsx'
import { Marquee, PageHero, Breadcrumb, WorkGrid, Testimonials, CtaBand, FaqList, MapFacade, RatingLine, Stars } from '../components/Blocks.jsx'
import { Steps, ServiceCards, AreasBlock, VenuesBlock, LastUpdated, useP } from '../components/Shared.jsx'
import { WORKS } from '../data/content.js'
import { IG } from '../site.js'

/* ================= OUR WORK ================= */
export function OurWork() {
  const t = useT()
  return (
    <main id="main">
      <PageHero crumb={t.nav.work}
        title={<>{t.owH1a} <em className="serif-i">{t.owH1b}</em></>} lead={t.owLead}
        aside={<div className="head-stat reveal" title={t.owCountSub}><b>{WORKS.length}<i>+</i></b><span>{t.owCount}</span></div>} />
      <Marquee />
      <section className="section section-tight">
        <div className="wrap">
          <WorkGrid filter />
          <div className="glass review-band reveal mt-xl">
            <div>
              <h2 className="h3 mb-xs">{t.owBandH}</h2>
              <p className="m-0">{t.owBandP}</p>
            </div>
            <a className="btn btn-dark" href={IG} target="_blank" rel="noopener noreferrer">{I.ig} {t.igMore}</a>
          </div>
        </div>
      </section>
      <CtaBand h={t.ctaH} p={t.ctaP} />
    </main>
  )
}
