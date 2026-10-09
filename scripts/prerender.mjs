// After `vite build`:
//  1. Render <App/> to HTML and put it inside #root of dist/index.html. The
//     browser still mounts the app with createRoot, which replaces this markup,
//     so what visitors see is unchanged; crawlers and link previews get the text
//     (bio, news, papers) instead of an empty div.
//  2. Write a share page per published talk, dist/talks/<id>/index.html: link
//     previews (LinkedIn, Slack, KakaoTalk, X) read its own title, description
//     and card image (public/talks/og/<id>.jpg, scripts/talk_og.py), and a
//     browser is sent straight on to the post (/#talk=<id>).
//  3. Write sitemap.xml, robots.txt and 404.html.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'vite'

const SITE = 'https://cjongmin.github.io'

// One-shot render: no file watcher (it can hit the OS watch limit and is never needed here)
const vite = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom', logLevel: 'error' })
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

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const talks = JSON.parse(readFileSync('src/data/talks.json', 'utf8')).filter(t => t.published)

for (const t of talks) {
  const url = `${SITE}/talks/${t.id}/`
  const target = `/#talk=${encodeURIComponent(t.id)}`
  const card = existsSync(`public/talks/og/${t.id}.jpg`) ? `/talks/og/${t.id}.jpg` : t.cover ?? '/og-image.png'
  const title = `${t.title} · ${t.event} ${t.type}`
  const description = t.subtitle ?? t.summary
  mkdirSync(`dist/talks/${t.id}`, { recursive: true })
  writeFileSync(`dist/talks/${t.id}/index.html`, `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Jongmin Choi" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${SITE}${card}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${SITE}${card}" />
  <script>location.replace(${JSON.stringify(target)})</script>
</head>
<body>
  <p><a href="${target}">${esc(t.title)}</a></p>
</body>
</html>
`)
}
console.log(`prerender: ${talks.length} talk share pages in dist/talks/`)

// Only the home page: the share pages are thin redirects, not content to index
const urls = [`${SITE}/`]
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`)
// GitHub Pages serves 404.html for unknown paths: say so briefly, then go home
writeFileSync('dist/404.html', `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <title>Page not found · Jongmin Choi</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta http-equiv="refresh" content="4; url=/" />
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; text-align: center;
           font-family: Inter, system-ui, -apple-system, sans-serif; color: #1d1d1f; background: #fff; }
    @media (prefers-color-scheme: dark) { body { color: #f5f5f7; background: #000; } }
    p { color: #6e6e73; } a { color: #0071e3; }
  </style>
</head>
<body>
  <main>
    <h1>Page not found</h1>
    <p>Taking you to <a href="/">cjongmin.github.io</a>…</p>
  </main>
</body>
</html>
`)
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)
