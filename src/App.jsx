import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { LangContext, QuoteContext, Header, Footer, Floaters, QuoteModal, useRevealEffect } from './components/Chrome.jsx'
import { Home, Services, OurWork, About, Contact, Privacy, Terms, NotFound } from './pages/index.jsx'
import { STRINGS, stripLang } from './i18n.js'
import { metaFor } from './seo.js'

function Layout({ lang, children }) {
  const loc = useLocation()
  const [quote, setQuote] = useState({ open: false, ref: '', refTitle: '' })
  const openQuote = (ref = '', refTitle = '') => setQuote({ open: true, ref, refTitle })
  const close = () => {
    setQuote(q => ({ ...q, open: false }))
    document.body.style.overflow = document.querySelector('.lightbox') ? 'hidden' : ''
  }
  useRevealEffect([loc.pathname])
  useEffect(() => {
    // user-initiated navigation: go to the #section if the link names one, else the top of the new page
    const target = loc.hash && document.getElementById(decodeURIComponent(loc.hash.slice(1)))
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
    const m = metaFor(stripLang(loc.pathname), lang)
    document.title = m.title
    const d = document.querySelector('meta[name="description"]')
    if (d) d.setAttribute('content', m.desc)
    document.documentElement.lang = lang
  }, [loc.pathname, loc.hash, lang])
  const t = STRINGS[lang]
  return (
    <LangContext.Provider value={lang}>
      <QuoteContext.Provider value={{ openQuote }}>
        <a className="skip-link" href="#main">{t.skip}</a>
        <Header />
        {children}
        <Footer />
        <Floaters />
        <QuoteModal state={quote} close={close} />
      </QuoteContext.Provider>
    </LangContext.Provider>
  )
}

const page = (lang, El, dark) => (
  <Layout lang={lang}>
    <DarkHero on={!!dark} />
    <El />
  </Layout>
)
function DarkHero({ on }) {
  useEffect(() => {
    document.body.classList.toggle('hero-dark', on)
    return () => document.body.classList.remove('hero-dark')
  }, [on])
  return null
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={page('en', Home, true)} />
      <Route path="/services" element={page('en', Services)} />
      <Route path="/our-work" element={page('en', OurWork)} />
      <Route path="/about" element={page('en', About)} />
      <Route path="/contact" element={page('en', Contact)} />
      <Route path="/privacy-policy" element={page('en', Privacy)} />
      <Route path="/terms" element={page('en', Terms)} />
      <Route path="/ta" element={page('ta', Home, true)} />
      <Route path="/ta/services" element={page('ta', Services)} />
      <Route path="/ta/our-work" element={page('ta', OurWork)} />
      <Route path="/ta/about" element={page('ta', About)} />
      <Route path="/ta/contact" element={page('ta', Contact)} />
      <Route path="*" element={page('en', NotFound)} />
    </Routes>
  )
}
