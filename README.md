# cjongmin.github.io

Source of [cjongmin.github.io](https://cjongmin.github.io), the research profile of Jongmin Choi.
React 18 · Vite 5 · TypeScript · Tailwind CSS 3 · Framer Motion.

## Editing content

| What | File |
|---|---|
| Name, role lines, bio, links, optional status line | `src/data/profile.json` |
| Recent news (below About Me); `**text**` = red emphasis | `src/data/news.json` |
| Publications | `src/data/publications.json` |
| Talks & presentations (16:9 `cover` photo) | `src/data/talks.json` |
| Education / Teaching | `src/data/education.json`, `src/data/teaching.json` |
| iOS apps | `src/data/projects.json`, images in `public/projects/<id>/` |
| CV (PDF) | `cv/cv.html`, then `./cv/build.sh` (see [cv/README.md](cv/README.md)) |

This repository is public, so everything committed here can be read, including
entries hidden with `published: false`. Commit news only once it is announced.

## Build and deploy

Pushing to `main` deploys the site: GitHub Actions
([deploy.yml](.github/workflows/deploy.yml)) runs `npm ci && npm run build` and
publishes `dist/` to GitHub Pages.

`npm run build` type-checks, bundles, and prerenders the page into
`dist/index.html` ([scripts/prerender.mjs](scripts/prerender.mjs)), so search
engines and link previews see the content without running JavaScript.

## Notes

- CSS sizes are written in px but compiled to rem ([postcss.config.js](postcss.config.js)).
  The root font size grows on very wide screens ([src/index.css](src/index.css)),
  so the whole page scales with it, up to 1.5× on a 4K monitor at 100% zoom.
- `public/app-ads.txt` is the AdMob publisher record for the iOS apps and must stay at the site root.
