import { useEffect, useState, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { LangContext, QuoteContext, Header, Footer, Floaters, QuoteModal, ConsentNotice, useRevealEffect } from './components/Chrome.jsx'
import { STRINGS, stripLang } from './i18n.js'
import { clientMeta } from './data/meta.js'
import { PAGES, taPath } from './routes.js'
import { initClickTracking, pageView } from './analytics.js'

// Each page is its own chunk in the browser (only the current page's code and text is downloaded).
// The server/prerender build loads them all eagerly so every page is fully rendered to HTML.
import { MODS, EAGER } from 'virtual:pages'
const KIND = {
  home: ['Home', 'Home'], services: ['Services', 'Services'], service: ['ServicePage', 'ServicePage'], faq: ['Faq', 'Faq'],
  work: ['OurWork', 'OurWork'], about: ['About', 'About'], contact: ['Contact', 'Contact'], blog: ['Blog', 'Blog'], post: ['Post', 'Post'],
  case: ['CaseStudy', 'CaseStudy'], privacy: ['Legal', 'Privacy'], terms: ['Legal', 'Terms'], notfound: ['Legal', 'NotFound'],
}
const cache = {}
function pageComponent(kind) {
  const [file, name] = KIND[kind] || KIND.notfound
  const key = `../pages/${file}.jsx`
  if (EAGER) return MODS[key][name]
  return cache[kind] || (cache[kind] = lazy(() => MODS[key]().then(m => ({ default: m[name] }))))
}
// called before hydration so the current page's chunk is already downloading
export function preloadPage(kind) {
  const [file] = KIND[kind] || KIND.notfound
  const f = !EAGER && MODS[`../pages/${file}.jsx`]
  return f ? f() : Promise.resolve()
}

function Layout({ lang, children, missing }) {
  const loc = useLocation()
  const [quote, setQuote] = useState({ open: false, ref: '', refTitle: '' })
  const openQuote = (ref = '', refTitle = '') => setQuote({ open: true, ref, refTitle })
  const close = () => {
    setQuote(q => ({ ...q, open: false }))
    document.body.style.overflow = document.querySelector('.lightbox') ? 'hidden' : ''
  }
  useRevealEffect([loc.pathname])
  useEffect(() => { initClickTracking() }, [])
  useEffect(() => {
    // user-initiated navigation: reset to top of the new page and update the head
    if (window.__vrkNavigated) {
      window.scrollTo(0, 0); pageView(loc.pathname)
      const m = missing ? clientMeta('/404', 'en') : clientMeta(stripLang(loc.pathname), lang)
      document.title = m.title
      const d = document.querySelector('meta[name="description"]')
      if (d) d.setAttribute('content', m.desc)
      document.documentElement.lang = lang
    }
    window.__vrkNavigated = true
  }, [loc.pathname, lang])
  const t = STRINGS[lang]
  return (
    <LangContext.Provider value={lang}>
      <QuoteContext.Provider value={{ openQuote }}>
        <a className="skip-link" href="#main">{t.skip}</a>
        <Header />
        <Suspense fallback={<main id="main" className="page-loading" />}>{children}</Suspense>
        <Footer />
        <Floaters />
        <QuoteModal state={quote} close={close} />
        <ConsentNotice />
      </QuoteContext.Provider>
    </LangContext.Provider>
  )
}

function DarkHero({ on }) {
  useEffect(() => {
    document.body.classList.toggle('hero-dark', on)
    return () => document.body.classList.remove('hero-dark')
  }, [on])
  return null
}

function PageEl({ page }) {
  const C = pageComponent(page.kind)
  return <C slug={page.slug} />
}

const el = (lang, page) => (
  <Layout lang={lang}>
    <DarkHero on={page.kind === 'home'} />
    <PageEl page={page} />
  </Layout>
)

export const kindFor = pathname => {
  const base = stripLang(pathname)
  const p = PAGES.find(x => x.path === base)
  return p ? p.kind : 'notfound'
}

export default function App() {
  return (
    <Routes>
      {PAGES.map(page => <Route key={page.path} path={page.path} element={el('en', page)} />)}
      {PAGES.filter(p => p.ta).map(page => <Route key={'ta' + page.path} path={taPath(page.path)} element={el('ta', page)} />)}
      <Route path="*" element={<Layout lang="en" missing><PageEl page={{ kind: 'notfound' }} /></Layout>} />
    </Routes>
  )
}
