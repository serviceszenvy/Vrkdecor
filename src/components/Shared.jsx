import { Link } from 'react-router-dom'
import { I } from './Icons.jsx'
import { useT, useLang } from './Chrome.jsx'
import { STEPS, AREAS } from '../data/content.js'
import { SERVICE_INDEX, VENUES, serviceIndexBySlug } from '../data/servicesIndex.js'
import { ADDRESS, ADDRESS_TA, MAPS, LAST_UPDATED, LAST_UPDATED_LABEL } from '../site.js'
import { localePath } from '../i18n.js'

export const useP = () => { const lang = useLang(); return x => localePath(lang, x) }

/* ---------- shared bits ---------- */
export function Steps({ light }) {
  const t = useT(); const lang = useLang()
  return (
    <section className={light ? 'section section-tight pt-0 steps-light' : 'section section-dark'}>
      <div className="wrap">
        <div className="section-head"><p className="kicker">{t.stepsK}</p><h2>{t.stepsH}</h2></div>
        <div className="pillars">
          {STEPS[lang].map(([n, h, d]) => <div className="pillar reveal" key={n}><span className="num">{n}</span><h3>{h}</h3><p>{d}</p></div>)}
        </div>
      </div>
    </section>
  )
}

export function ServiceCards({ slugs, withLead }) {
  const t = useT(); const lang = useLang(); const p = useP()
  const list = slugs ? slugs.map(serviceIndexBySlug) : SERVICE_INDEX
  return (
    <div className="svc-grid">
      {list.map(s => (
        <Link className="card svc svc-link reveal" key={s.slug} to={p('/' + s.slug)}>
          <span className="icon">{I[s.icon]}</span>
          <h3>{s[lang].name}</h3>
          {withLead && <p>{s[lang].lead}</p>}
          <span className="text-link">{t.svcCardCta} {I.arrow}</span>
        </Link>
      ))}
    </div>
  )
}

export function AreasBlock() {
  const t = useT(); const lang = useLang()
  return (
    <div className="wrap glass map-band reveal">
      <div>
        <p className="kicker">{t.areaK}</p>
        <h2 className="h3">{t.areaH}</h2>
        <p>{t.areaP}</p>
        <ul className="chips chips-list">
          {AREAS[lang].map((a, k) => <li className="chip" key={a}>{k === 0 && I.pin} {a}</li>)}
        </ul>
        <p className="mt-s">{t.areaFarP}</p>
        <ul className="chips chips-list">
          {AREAS[lang === 'ta' ? 'farTa' : 'farEn'].map(a => <li className="chip" key={a}><i>&#10022;</i> {a}</li>)}
        </ul>
      </div>
      <div>
        <p className="text-sm">{lang === 'ta' ? ADDRESS_TA : ADDRESS}</p>
        <p className="text-sm">{t.hoursP}</p>
        <a className="btn btn-ghost" href={MAPS} target="_blank" rel="noopener noreferrer">{I.pin} {t.mapsCta}</a>
      </div>
    </div>
  )
}

export function VenuesBlock() {
  const t = useT()
  return (
    <div className="venues glass reveal">
      <p className="kicker">{t.venuesK}</p>
      <h2 className="h3">{t.venuesH}</h2>
      <p>{t.venuesP}</p>
      <ul className="venue-list">{VENUES.map(v => <li key={v}>{I.check} {v}</li>)}</ul>
      <p className="form-note">{t.venuesMore}</p>
    </div>
  )
}

export function LastUpdated() {
  const t = useT(); const lang = useLang()
  return <p className="last-updated">{t.lastUpdated}: <time dateTime={LAST_UPDATED}>{LAST_UPDATED_LABEL[lang]}</time></p>
}

