// Single list of every page. App.jsx, the prerender script, the sitemap and llms.txt all read from here.
import { SERVICE_INDEX, DRAFT_INDEX } from './data/servicesIndex.js'
import { POST_INDEX } from './data/blogIndex.js'
import { CASE_STUDIES } from './data/caseStudies.js'

// kind: which page component renders it. ta: whether a Tamil version exists. draft: noindex, unlinked, not in sitemap.
export const PAGES = [
  { path: '/', kind: 'home', ta: true, priority: '1.0' },
  { path: '/services', kind: 'services', ta: true, priority: '0.9' },
  ...SERVICE_INDEX.map(p => ({ path: '/' + p.slug, kind: 'service', slug: p.slug, ta: true, priority: '0.9' })),
  ...DRAFT_INDEX.map(p => ({ path: '/' + p.slug, kind: 'service', slug: p.slug, ta: false, draft: true })),
  { path: '/our-work', kind: 'work', ta: true, priority: '0.8' },
  ...CASE_STUDIES.map(c => ({ path: '/our-work/' + c.slug, kind: 'case', slug: c.slug, ta: false, priority: '0.7', draft: !!c.draft })),
  { path: '/faq', kind: 'faq', ta: true, priority: '0.8' },
  { path: '/about', kind: 'about', ta: true, priority: '0.7' },
  { path: '/contact', kind: 'contact', ta: true, priority: '0.8' },
  { path: '/blog', kind: 'blog', ta: false, priority: '0.6' },
  ...POST_INDEX.map(p => ({ path: '/blog/' + p.slug, kind: 'post', slug: p.slug, ta: false, priority: '0.6' })),
  { path: '/privacy-policy', kind: 'privacy', ta: false, priority: '0.2' },
  { path: '/terms', kind: 'terms', ta: false, priority: '0.2' },
]

export const taPath = p => (p === '/' ? '/ta' : '/ta' + p)
export const pageFor = base => PAGES.find(p => p.path === base)
export const hasTa = base => { const p = pageFor(base); return !!(p && p.ta) }
