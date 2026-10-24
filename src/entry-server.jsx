import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App.jsx'
export { metaFor, notFoundMeta } from './seo.js'
export { PAGES, taPath } from './routes.js'
export { SERVICE_PAGES } from './data/servicePages.js'
export { POSTS } from './data/blog.js'
export { WORKS } from './data/content.js'
export { FAQ_GROUPS } from './data/faq.js'
export * as SITE from './site.js'

export function render(url) {
  return renderToString(
    <StaticRouter location={url}><App /></StaticRouter>
  )
}
