import { Link } from 'react-router-dom'
import { I } from '../components/Icons.jsx'
import { useT, useLang, useQuote, HeroMedia } from '../components/Chrome.jsx'
import { Marquee, PageHero, Breadcrumb, WorkGrid, Testimonials, CtaBand, FaqList, MapFacade, RatingLine, Stars } from '../components/Blocks.jsx'
import { Steps, ServiceCards, AreasBlock, VenuesBlock, LastUpdated, useP } from '../components/Shared.jsx'
import { WORKS } from '../data/content.js'
import { POST_INDEX } from '../data/blogIndex.js'

/* ================= BLOG ================= */
export function Blog() {
  const t = useT()
  return (
    <main id="main">
      <PageHero crumb={t.nav.blog} title={<>{t.blogH1a} <em className="serif-i">{t.blogH1b}</em></>} lead={t.blogLead} />
      <section className="section section-tight">
        <div className="wrap post-grid">
          {POST_INDEX.map(post => {
            const w = WORKS.find(x => x.slug === post.cover)
            return (
              <article className="card post-card reveal" key={post.slug}>
                <Link to={`/blog/${post.slug}`} className="post-card-img">
                  <img src={`/assets/img/work/${post.cover}-960.webp`} alt={w ? w.alt : ''} width={w.sizes['960'][0]} height={w.sizes['960'][1]} loading="lazy" decoding="async" />
                </Link>
                <div className="post-card-body">
                  <p className="post-meta"><time dateTime={post.date}>{post.dateLabel}</time></p>
                  <h2 className="h3"><Link to={`/blog/${post.slug}`}>{post.h1}</Link></h2>
                  <p>{post.desc}</p>
                  <Link className="text-link" to={`/blog/${post.slug}`}>{t.readMore} {I.arrow}</Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>
      <CtaBand h={t.ctaH} p={t.ctaP} />
    </main>
  )
}
