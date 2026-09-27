// Build-time prerender entry (see scripts/prerender.mjs). Renders the page to
// static HTML so search engines and link previews can read it without JS.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
