import { Link } from 'react-router-dom'
import { I } from '../components/Icons.jsx'
import { useT } from '../components/Chrome.jsx'
import { Breadcrumb, WorkGrid, CtaBand } from '../components/Blocks.jsx'
import { ServiceCards } from '../components/Shared.jsx'
import { caseBySlug } from '../data/caseStudies.js'

/* ================= CASE STUDY (real event) ================= */
export function CaseStudy({ slug }) {
  const t = useT()
  const c = caseBySlug(slug)
  if (!c) return null
  const facts = [['Event', c.eventType], ['Venue', c.venue], ['Area', c.area], ['Theme', c.theme], ['Colours', c.colours]].filter(([, v]) => v)
  return (
    <main id="main">
      <section className="section page-head">
        <div className="wrap">
          <Breadcrumb trail={[[t.nav.work, '/our-work'], [c.eventType + ', ' + c.area]]} />
          <h1>{c.eventType} <em className="serif-i">in {c.area}</em></h1>
          <p className="lead">{c.special}</p>
          <ul className="check-list case-facts">{facts.map(([k, v]) => <li key={k}>{I.check} <b>{k}:</b> {v}</li>)}</ul>
          <WorkGrid slugs={c.photos} eagerCount={1} />
          {c.service && <><h2 className="mt-xl">{t.relatedH}</h2><ServiceCards slugs={[c.service]} withLead /></>}
          <p className="mt-m"><Link className="text-link" to="/our-work">{t.viewPortfolio} {I.arrow}</Link></p>
        </div>
      </section>
      <CtaBand h={t.ctaH} p={t.ctaP} />
    </main>
  )
}
