import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// 'virtual:pages' points at eager page modules for the server build and lazy (split) ones for the browser
const pagesRegistry = () => ({
  name: 'vrk-pages-registry',
  enforce: 'pre',
  resolveId(id, importer, opts) {
    if (id === 'virtual:pages') return path.resolve(__dirname, 'src/registry', opts && opts.ssr ? 'pages.server.js' : 'pages.client.js')
  },
})

// Hashed build files go to /static/ so they can be cached for a year. Photos and video stay in /assets/.
export default defineConfig({
  plugins: [pagesRegistry(), react()],
  build: { assetsInlineLimit: 0, assetsDir: 'static' },
})
