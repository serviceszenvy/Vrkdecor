import { hydrateRoot, createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

const el = document.getElementById('root')
const app = <BrowserRouter><App /></BrowserRouter>
if (el.hasChildNodes()) hydrateRoot(el, app)
else createRoot(el).render(app)
