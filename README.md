# Jongmin Choi — Research Profile Website

A modern, Apple-inspired research profile page built with React + Vite + TypeScript + Tailwind CSS.

## Quick Start

```bash
# Node.js v18 is available via nvm
export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH"

npm install
npm run dev        # development server → http://localhost:5173
npm run build      # production build  → dist/
npm run preview    # preview the production build locally
```

---

## Where to Edit Your Content

| What to change | File |
|---|---|
| Name, bio, email, links | `src/data/profile.ts` |
| Publications | `src/data/publications.ts` |
| Experience / Timeline | `src/data/experiences.ts` |
| Accent color, fonts | `tailwind.config.js` |
| GitHub Pages base path | `vite.config.ts` |

### Add a profile photo

1. Place your photo at `public/profile.jpg`
2. In `src/data/profile.ts`, uncomment:
   ```ts
   profileImage: '/profile.jpg',
   ```

### Add a publication

Open `src/data/publications.ts` and add a new entry to the `publications` array:

```ts
{
  id: 'unique-id-2026',
  title: 'Your Paper Title',
  authors: ['Jongmin Choi', 'Co-Author'],
  venue: 'CVPR',            // short name — used for filtering
  year: 2026,
  order: 1,                 // sort order within the same year (lower = first)
  image: '/publications/paper.jpg',   // optional; place file in public/publications/
  tags: ['Topic 1', 'Topic 2'],
  links: {
    paper: 'https://arxiv.org/...',
    scholar: 'https://scholar.google.com/...',
    code: 'https://github.com/...',
    project: 'https://...',
  },
  bibtex: `@inproceedings{...}`,
},
```

Omit any `links` keys that don't exist — the buttons won't be rendered.

---

## GitHub Pages Deployment

### Case 1 — User site (`YOUR_USERNAME.github.io`)

In `vite.config.ts` set:
```ts
base: '/'
```

Then push to a repo named **`YOUR_USERNAME.github.io`** on the `main` branch and enable GitHub Pages (Settings → Pages → Deploy from branch → `main` → `/ (root)`).

Or use the automated deploy script:
```bash
npm run deploy     # builds + pushes dist/ to gh-pages branch
```
Then in GitHub Pages settings select **gh-pages** branch.

### Case 2 — Project site (`github.com/USER/profilepage`)

In `vite.config.ts` set:
```ts
base: '/profilepage/'   // replace with your actual repo name
```

```bash
npm run deploy
```

---

## First Git Push (run these yourself)

```bash
git add .
git commit -m "Initial research profile website"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` and `YOUR_REPO_NAME` with your actual values.

---

## Tech Stack

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide React](https://lucide.dev/)
