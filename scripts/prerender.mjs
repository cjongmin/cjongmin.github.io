// After `vite build`: render <App/> to HTML and put it inside #root of
// dist/index.html. The browser still mounts the app with createRoot, which
// replaces this markup, so what visitors see is unchanged; crawlers and link
// previews now get the text (bio, news, papers) instead of an empty div.
import { readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'vite'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
  const app = render()
  const file = 'dist/index.html'
  const html = readFileSync(file, 'utf8')
  const slot = '<div id="root"></div>'
  if (!html.includes(slot)) throw new Error(`${file}: ${slot} not found`)
  writeFileSync(file, html.replace(slot, `<div id="root">${app}</div>`))
  console.log(`prerender: ${(app.length / 1024).toFixed(1)} KB of HTML written into ${file}`)
} finally {
  await vite.close()
}
