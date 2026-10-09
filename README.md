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

1. **Title and subtitle**: the paper `title` and the post's `subtitle` in `talks.json`.
2. **The Authors**: from the paper in `publications.json`. `Name^1` marks co-first authors and
   `corresponding` lists corresponding authors; photos and links come from `people.json`.
3. **Contents**: built automatically from the post's `#` and `##` headings.
4. **Body**: `src/content/talks/<id>.md`, which also places the venue photo (`cover`) where the
   text mentions it; clicking an image opens it in a lightbox. Supported: `#` / `##` headings,
   paragraphs, `-` and `1.` lists, `> callout`, `**bold**`, `*italic*`, `` `code` ``, `[link](url)`,
   images (`![caption](/photo.webp)`, or `"figure"` / `"wide"` after the path for charts), and blocks
   between `:::` fences: `:::event` (a ticket: `Date`, `Title`, `Detail`, `Place`, `Note` rows),
   `:::info Title` (`Key: Value` rows), `:::stats` (`value | label | note`),
   `:::steps` (`Title | text`) and `:::quote`.
5. **Paper & resources**: Paper, Scholar, Code, Poster, BibTeX… from the paper's `links`.
6. **Presentation Notes**: every post, newest first (`#2, #1`), five per page. `no` is the post's
   permanent number; give a new post the next one.

Before the conference a post introduces the work (heading to the venue, presentation details,
motivation, key idea, key findings, what to discuss, looking ahead). After it, add sections
such as `# Questions from the poster session` and `# Takeaways`, and set `upcoming` to `false`.

**Sharing a post**: use its *Copy link* address, `https://cjongmin.github.io/talks/<id>/`. The build
writes that page with the post's own title, description and preview card, so LinkedIn, Slack and
KakaoTalk show the post rather than the home page; visitors are sent straight on to the post. The
card images are `public/talks/og/<id>.jpg`; regenerate them with `python3 scripts/talk_og.py`
(Pillow) after adding a talk or changing a title. A new cover (`public/talks/<name>.webp`, 2000px wide) also
needs its smaller carousel copies: `python3 scripts/responsive_images.py`.

## Build and deploy

Pushing to `main` deploys the site: GitHub Actions
([deploy.yml](.github/workflows/deploy.yml)) runs `npm ci && npm run build` and
publishes `dist/` to GitHub Pages.

`npm run build` type-checks, bundles, and prerenders the page into
`dist/index.html` ([scripts/prerender.mjs](scripts/prerender.mjs)), so search
engines and link previews see the content without running JavaScript. It also
writes the talk share pages, `sitemap.xml` and `robots.txt`. The talk post view
is a separate chunk that loads only when a post is opened.

## Notes

- CSS sizes are written in px but compiled to rem ([postcss.config.js](postcss.config.js)).
  The root font size grows on very wide screens ([src/index.css](src/index.css)),
  so the whole page scales with it, up to 1.5× on a 4K monitor at 100% zoom.
- `public/app-ads.txt` is the AdMob publisher record for the iOS apps and must stay at the site root.
- Images are WebP, sized to how large they are drawn. Inter loads without blocking the first
  paint, and animations use framer-motion's `LazyMotion` with `m.*` components (a plain
  `motion.*` component throws under `strict`). Lighthouse: 99 / 100 / 100 / 100 on mobile.
