import './styles/fonts.css'
import './styles/main.css'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App, { preloadPage, kindFor } from './App.jsx'

const el = document.getElementById('root')
const app = <BrowserRouter><App /></BrowserRouter>
// Load this page's chunk first, then hydrate. The prerendered HTML is already visible, so nothing waits on this.
preloadPage(kindFor(location.pathname)).finally(() => {
  if (el.hasChildNodes()) hydrateRoot(el, app)
  else createRoot(el).render(app)
})
