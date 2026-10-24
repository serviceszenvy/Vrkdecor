import { Link } from 'react-router-dom'
import { I } from '../components/Icons.jsx'
import { useT, useLang, useQuote, HeroMedia } from '../components/Chrome.jsx'
import { Marquee, PageHero, Breadcrumb, WorkGrid, Testimonials, CtaBand, FaqList, MapFacade, RatingLine, Stars } from '../components/Blocks.jsx'
import { Steps, ServiceCards, AreasBlock, VenuesBlock, LastUpdated, useP } from '../components/Shared.jsx'
import { WORKS } from '../data/content.js'
import { postBySlug } from '../data/blog.js'
import { PROPRIETOR } from '../site.js'

export function Post({ slug }) {
  const t = useT()
  const post = postBySlug(slug)
  const img = (s, first) => { const w = WORKS.find(x => x.slug === s); return w && <figure className="post-fig"><img src={`/assets/img/work/${s}-960.webp`} srcSet={`/assets/img/work/${s}-480.webp 480w, /assets/img/work/${s}-800.webp 800w, /assets/img/work/${s}-960.webp 960w, /assets/img/work/${s}-1600.webp 1600w`} sizes="(max-width:800px) 100vw, 760px" alt={w.alt} width={w.sizes['960'][0]} height={w.sizes['960'][1]} loading={first ? 'eager' : 'lazy'} fetchPriority={first ? 'high' : 'auto'} decoding="async" /><figcaption>{w.alt}. VRK Decor.</figcaption></figure> }
  return (
    <main id="main">
      <article className="section page-head post">
        <div className="wrap prose post-body">
          <Breadcrumb trail={[[t.nav.blog, '/blog'], [post.h1]]} />
          <h1 className="post-h1">{post.h1}</h1>
          <p className="post-meta">{t.byline} <Link to="/about">{PROPRIETOR}</Link>, VRK Decor &middot; {t.published} <time dateTime={post.date}>{post.dateLabel}</time></p>
          {img(post.cover, true)}
          {post.intro.map((x, k) => <p key={k} className={k === 0 ? 'lead' : undefined}>{x}</p>)}
          {post.sections.map(s => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.img && s.img !== post.cover && img(s.img)}
              {s.p.map((x, k) => <p key={k}>{x}</p>)}
            </section>
          ))}
          <h2>{post.afterH}</h2>
          {post.after.map((x, k) => <p key={k}>{x}</p>)}
          <h2>{post.checklistH}</h2>
          <ul className="check-list">{post.checklist.map(x => <li key={x}>{I.check} {x}</li>)}</ul>
          <h2>{t.blogRelatedH}</h2>
        </div>
        <div className="wrap mt-m"><ServiceCards slugs={post.related} withLead /></div>
      </article>
      <CtaBand h={t.ctaH} p={t.ctaP} />
    </main>
  )
}
