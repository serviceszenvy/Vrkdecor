import { Link } from 'react-router-dom'
import { I } from '../components/Icons.jsx'
import { useT, useLang, useQuote, HeroMedia } from '../components/Chrome.jsx'
import { Marquee, PageHero, Breadcrumb, WorkGrid, Testimonials, CtaBand, FaqList, MapFacade, RatingLine, Stars } from '../components/Blocks.jsx'
import { Steps, ServiceCards, AreasBlock, VenuesBlock, LastUpdated, useP } from '../components/Shared.jsx'
import { FAQ_GROUPS } from '../data/faq.js'

/* ================= FAQ ================= */
export function Faq() {
  const t = useT(); const lang = useLang()
  return (
    <main id="main">
      <PageHero crumb={t.nav.faq} title={<>{t.faqPageH1a} <em className="serif-i">{t.faqPageH1b}</em></>} lead={t.faqPageLead} />
      <section className="section section-tight">
        <div className="wrap faq-page">
          {FAQ_GROUPS.map(g => (
            <div className="faq-group" key={g.id} id={g.id}>
              <h2 className="h3">{g[lang]}</h2>
              <FaqList items={g.items.map(i => i[lang])} />
            </div>
          ))}
          <LastUpdated />
        </div>
      </section>
      <CtaBand h={t.faqStillH} p={t.faqStillP} />
    </main>
  )
}
