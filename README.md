# cjongmin.github.io

Source of [cjongmin.github.io](https://cjongmin.github.io), the research profile of Jongmin Choi.
React 18 · Vite 5 · TypeScript · Tailwind CSS 3 · Framer Motion.

## Editing content

| What | File |
|---|---|
| Name, role lines, bio, links, optional status line | `src/data/profile.json` |
| Recent news (below About Me); `**text**` = red emphasis | `src/data/news.json` |
| Publications | `src/data/publications.json` |
| Talks & presentations: card data (16:9 `cover` photo, series number `no`) | `src/data/talks.json` |
| Talk post text | `src/content/talks/<id>.md` (see below) |
| Co-author photos and links (author box) | `src/data/people.json`, photos in `public/people/` |
| Education / Teaching | `src/data/education.json`, `src/data/teaching.json` |
| iOS apps | `src/data/projects.json`, images in `public/projects/<id>/` |
| CV (PDF) | `cv/cv.html`, then `./cv/build.sh` (see [cv/README.md](cv/README.md)) |

This repository is public, so everything committed here can be read, including
entries hidden with `published: false`. Commit news only once it is announced.

## Talk posts

Each talk opens as a blog post with the same layout:

1. **Title and subtitle**: `headline` and `subtitle` in `talks.json` (the card keeps the paper `title` and `summary`).
2. **The paper**: title, venue and authors from `publications.json`. `Name^1` marks co-first
   authors and `corresponding` lists corresponding authors; photos and links come from `people.json`.
3. **Contents**: built automatically from the post's `#` and `##` headings.
4. **Body**: `src/content/talks/<id>.md`, which also places the venue photo (`cover`) where the
   text mentions it. Supported: `#` / `##` headings, paragraphs, `-` and `1.` lists, `> callout`,
   `**bold**`, `*italic*`, `` `code` ``, `[link](url)`, images (`![caption](/photo.webp)`, or
   `"figure"` / `"wide"` after the path for charts), and blocks between `:::` fences:
   `:::info Title` (`Key: Value` rows), `:::stats` (`value | label | note`),
   `:::steps` (`Title | text`) and `:::quote`.
5. **The paper / The poster** cards, then **Presentation Notes**: every post as `#1, #2, …`,
   five per page. `no` is the post's permanent number; give a new post the next one.

Before the conference a post introduces the work (heading to the venue, presentation details,
motivation, key idea, key findings, what to discuss, looking ahead). After it, add sections
such as `# Questions from the poster session` and `# Takeaways`, and set `upcoming` to `false`.

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
