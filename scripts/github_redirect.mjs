// The copy of the site on GitHub Pages (cjongmin.github.io) only sends visitors to cjmin.me.
// After `npm run build`, every page in dist/ becomes a small page that moves the visitor to the
// same address on https://cjmin.me (path, query and #talk=… kept), with that address as its
// canonical URL. 404.html does the same for any other path (old links to images, the CV PDF, …).
// app-ads.txt stays a real file: AdMob reads it from the developer website listed in the App Store.
// Output: dist-github/ (uploaded by .github/workflows/deploy.yml).
import { copyFileSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'

const SITE = 'https://cjmin.me'
const SRC = 'dist'
const OUT = 'dist-github'

const page = canonical => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Jongmin Choi · moved to cjmin.me</title>
${canonical ? `<link rel="canonical" href="${canonical}">\n` : ''}<script>location.replace('${SITE}' + location.pathname + location.search + location.hash)</script>
<noscript><meta http-equiv="refresh" content="0; url=${canonical || `${SITE}/`}"></noscript>
</head>
<body style="font-family: system-ui, sans-serif; margin: 48px 16px">
<p>This site has moved to <a href="${SITE}/">cjmin.me</a>.</p>
</body>
</html>
`

/** Every index.html under dir, as paths relative to SRC. */
function pages(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return pages(p)
    return e.name === 'index.html' ? [relative(SRC, p)] : []
  })
}

rmSync(OUT, { recursive: true, force: true })
for (const file of pages(SRC)) {
  const dir = dirname(file)
  mkdirSync(join(OUT, dir), { recursive: true })
  writeFileSync(join(OUT, file), page(dir === '.' ? `${SITE}/` : `${SITE}/${dir}/`))
}
writeFileSync(join(OUT, '404.html'), page(null))
copyFileSync('public/app-ads.txt', join(OUT, 'app-ads.txt'))
console.log(`github_redirect: ${pages(SRC).length} pages + 404.html + app-ads.txt in ${OUT}/`)
