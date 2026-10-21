import { StrictMode, type ReactNode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply theme before first paint to avoid flash
const stored = localStorage.getItem('theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
if (stored === 'dark' || (!stored && prefersDark)) {
  document.documentElement.classList.add('dark')
}

// The built pages arrive prerendered (scripts/prerender.mjs): React takes over that HTML
// as it is (hydration) instead of building the page again, which would cost a second
// layout and restart the opening animation. `npm run dev` serves an empty #root.
const el = document.getElementById('root')!
const mount = (app: ReactNode) =>
  el.hasChildNodes() ? hydrateRoot(el, <StrictMode>{app}</StrictMode>) : createRoot(el).render(<StrictMode>{app}</StrictMode>)

// /talks/<no>/ is a talk post on its own page (prerendered; this takes over once loaded)
const talk = window.location.pathname.match(/^\/talks\/(\d+)\/?$/)
if (talk) {
  import('./TalkPage').then(({ default: TalkPage }) => mount(<TalkPage no={Number(talk[1])} />))
} else {
  mount(<App />)
}
