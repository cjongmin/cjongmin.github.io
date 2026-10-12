// Build-time prerender entry (see scripts/prerender.mjs). Renders the home page,
// and each talk post's own page, to static HTML so search engines, link previews,
// reader mode and printing get the content without JS.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import TalkPage from './TalkPage'

export function render(): string {
  return renderToString(<StrictMode><App /></StrictMode>)
}

export function renderTalk(id: string): string {
  return renderToString(<StrictMode><TalkPage id={id} /></StrictMode>)
}
