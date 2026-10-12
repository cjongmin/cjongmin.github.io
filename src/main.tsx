import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply theme before first paint to avoid flash
const stored = localStorage.getItem('theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
if (stored === 'dark' || (!stored && prefersDark)) {
  document.documentElement.classList.add('dark')
}

const root = createRoot(document.getElementById('root')!)

// /talks/<id>/ is a talk post on its own page (prerendered; this takes over once loaded)
const talk = window.location.pathname.match(/^\/talks\/([^/]+)\/?$/)
if (talk) {
  import('./TalkPage').then(({ default: TalkPage }) =>
    root.render(<StrictMode><TalkPage id={decodeURIComponent(talk[1])} /></StrictMode>))
} else {
  root.render(<StrictMode><App /></StrictMode>)
}
