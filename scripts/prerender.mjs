// After `vite build`:
//  1. Render <App/> to HTML and put it inside #root of dist/index.html, with the
//     stylesheet inlined into the page. In the browser React hydrates this markup
//     (main.tsx), so the first render has to match it; crawlers and link previews
//     get the text (bio, news, papers) instead of an empty div.
//  2. Write each published talk post as its own page, dist/talks/<no>/index.html,
//     from the same template: the article prerendered into #root, and its own
//     title, description, canonical URL, card image (public/talks/og/<id>.jpg,
//     scripts/talk_og.py) and BlogPosting JSON-LD. In the browser, main.tsx sees
//     /talks/<no>/ and mounts the post as a page (not the home page).
//  3. Write sitemap.xml, robots.txt and 404.html.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'vite'

const SITE = 'https://cjmin.me'
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const talks = JSON.parse(readFileSync('src/data/talks.json', 'utf8')).filter(t => t.published)
const profile = JSON.parse(readFileSync('src/data/profile.json', 'utf8'))

const file = 'dist/index.html'
const slot = '<div id="root"></div>'
const template = inlineStylesheet(readFileSync(file, 'utf8'))
if (!template.includes(slot)) throw new Error(`${file}: ${slot} not found`)

/** The stylesheet goes into the page itself. Visitors in Korea reach cjmin.me through Los Angeles,
 *  where each request costs about a second, and this one stood between the HTML and the first paint. */
function inlineStylesheet(html) {
  const link = html.match(/<link rel="stylesheet"[^>]* href="(\/assets\/[^"]+\.css)"[^>]*>/)
  if (!link) throw new Error(`prerender: no stylesheet link in ${file}`)
  const css = readFileSync(`dist${link[1]}`, 'utf8')
  if (css.includes('</style')) throw new Error('prerender: the stylesheet contains </style')
  return html.replace(link[0], () => `<style>${css}</style>`)
}

/** The prerendered markup inside #root. The email_off comments keep Cloudflare's email obfuscation
 *  away from it: rewriting the mailto: link costs a blocking script at the end of the page, and the
 *  address is on the page in plain text anyway. React's hydration skips comments like these. */
const root = markup => `<div id="root"><!--email_off-->${markup}<!--/email_off--></div>`

/** Swap one tag's attribute value in the template (title / meta / link), failing loudly if it is missing. */
function setTag(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`prerender: ${pattern} not found in ${file}`)
  return html.replace(pattern, replacement)
}

function talkHtml(t, article) {
  const url = `${SITE}/talks/${t.no}/`
  const card = existsSync(`public/talks/og/${t.id}.jpg`) ? `/talks/og/${t.id}.jpg` : t.cover ?? '/og-image.png'
  const title = `${t.title} · ${t.event} ${t.type}`
  const description = t.summary   // the card teaser says what the work is; the subtitle can be just a tagline
  let html = template
  html = setTag(html, /<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
  html = setTag(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(description)}" />`)
  html = setTag(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`)
  html = setTag(html, /<meta property="og:type" content="[^"]*" \/>/, '<meta property="og:type" content="article" />')
  html = setTag(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(title)}" />`)
  html = setTag(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(description)}" />`)
  html = setTag(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`)
  html = setTag(html, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${SITE}${card}" />`)
  html = setTag(html, /<meta property="og:image:alt" content="[^"]*" \/>/, `<meta property="og:image:alt" content="${esc(t.title)}" />`)
  html = setTag(html, /<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${SITE}${card}" />`)
  const ld = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: t.title, description, url, image: `${SITE}${card}`,
    author: { '@type': 'Person', name: profile.name, url: `${SITE}/` },
    about: t.title, isPartOf: { '@type': 'Blog', name: 'Presentation Notes', url: `${SITE}/#talks` },
  }
  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>\n  </head>`)
  return html.replace(slot, () => root(article))
}

// One-shot render: no file watcher (it can hit the OS watch limit and is never needed here)
const vite = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom', logLevel: 'error' })
try {
  const { render, renderTalk } = await vite.ssrLoadModule('/src/entry-server.tsx')
  const app = render()
  writeFileSync(file, template.replace(slot, () => root(app)))
  console.log(`prerender: ${(app.length / 1024).toFixed(1)} KB of HTML written into ${file}`)
  for (const t of talks) {
    const article = renderTalk(t.no)
    mkdirSync(`dist/talks/${t.no}`, { recursive: true })
    writeFileSync(`dist/talks/${t.no}/index.html`, talkHtml(t, article))
  }
  console.log(`prerender: ${talks.length} talk posts as pages in dist/talks/`)
} finally {
  await vite.close()
}

const urls = [`${SITE}/`, ...talks.map(t => `${SITE}/talks/${t.no}/`)]
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
    <p>Taking you to <a href="/">cjmin.me</a>…</p>
  </main>
</body>
</html>
`)
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)
