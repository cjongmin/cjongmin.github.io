// First-party statistics, stored by the Worker in cloudflare/stats.
// Nothing here identifies a person across days. It filters what
// GoatCounter's script filters (bots, frames, pages never seen) and adds time on page and scroll depth.
// Opening cjmin.me/stats/ or /?stats=off leaves a browser out, here and on world.cjmin.me.

function setOff(off: boolean) {
  document.cookie = `stats_off=1; Domain=cjmin.me; Path=/; Max-Age=${off ? 63072000 : 0}; SameSite=Lax; Secure`
  try {  // skipgc is GoatCounter's own switch, so an opt-out covers both counters
    if (off) localStorage.setItem('skipgc', 't')
    else localStorage.removeItem('skipgc')
  } catch { /* storage can be blocked */ }
}

function excluded(): boolean {
  const param = new URLSearchParams(location.search).get('stats')
  if (param === 'off' || param === 'on') {
    setOff(param === 'off')
    const url = new URL(location.href)
    url.searchParams.delete('stats')
    history.replaceState(null, '', url)
  }
  const w = window as unknown as Record<string, unknown>
  const d = document as unknown as Record<string, unknown>
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
  return location.hostname !== 'cjmin.me' || window.self !== window.top
    || /(?:^|;\s*)stats_off=1/.test(document.cookie)
    || nav.globalPrivacyControl === true || navigator.doNotTrack === '1'
    || navigator.webdriver || !!(w.callPhantom || w._phantom || w.phantom || w.__nightmare)
    || !!(d.__selenium_unwrapped || d.__webdriver_evaluate || d.__driver_evaluate)
}

// (the prerender imports this file too, outside a browser)
const enabled = typeof window !== 'undefined' && !excluded()
const newId = () => Math.random().toString(36).slice(2, 12)
const send = (data: object) => { if (enabled) navigator.sendBeacon('/api/v', JSON.stringify(data)) }

// The view being read now: its id, the time it has been on screen, and how far it was scrolled
let vid = ''
let shownMs = 0
let shownAt = 0
let lastSent = 0
let maxY = 0
let firstView = true   // only the first view of a visit came from elsewhere

function flushTime() {
  if (!vid) return
  if (shownAt) { shownMs += Date.now() - shownAt; shownAt = 0 }
  const s = Math.round(shownMs / 1000)
  if (s < 3 || s === lastSent) return
  lastSent = s
  const full = document.documentElement.scrollHeight || 1
  send({ k: 'time', id: vid, s, d: Math.round(100 * Math.min(1, (maxY + innerHeight) / full)) })
}

/** Counts one page view: the current address, or a talk post opened over the home page. */
export function trackView(path = location.pathname, title = document.title) {
  flushTime()
  vid = newId()
  shownMs = lastSent = maxY = 0
  shownAt = document.hidden ? 0 : Date.now()
  send({
    k: 'view', p: path, t: title, id: vid, s: screen.width,
    r: firstView ? document.referrer : '', q: firstView ? location.search : '',
  })
  firstView = false
}

/** A post was closed: its time stops here, and the home page behind it is not counted again. */
export function endView() {
  flushTime()
  vid = ''
}

const elementText = (el: Element) => (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 120)

function clickEvent(target: Element): { l: string; t: string } | null {
  const tagged = target.closest('[data-stat]')
  if (tagged) return { l: tagged.getAttribute('data-stat') as string, t: elementText(tagged) }
  const link = target.closest<HTMLAnchorElement>('a[href]')
  if (!link) return null
  if (link.protocol === 'mailto:') return { l: 'out:mailto', t: '' }   // that it was used, not the address
  if (!/^https?:$/.test(link.protocol)) return null
  if (link.hostname !== location.hostname) return { l: `out:${link.hostname.replace(/^www\./, '')}`, t: '' }
  return /\.pdf$/i.test(link.pathname) ? { l: `file:${link.pathname}`, t: '' } : null
}

if (enabled) {
  // A page opened in a background tab counts when it is first looked at, if it ever is.
  if (document.visibilityState === 'visible') trackView()
  else {
    const whenSeen = () => {
      if (document.visibilityState !== 'visible') return
      document.removeEventListener('visibilitychange', whenSeen)
      trackView()
    }
    document.addEventListener('visibilitychange', whenSeen)
  }
  addEventListener('scroll', () => { maxY = Math.max(maxY, scrollY) }, { passive: true })
  addEventListener('pagehide', flushTime)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flushTime()
    else if (vid) shownAt = Date.now()
  })
  const onClick = (e: Event) => {
    if (e.type === 'auxclick' && (e as MouseEvent).button !== 1) return   // a middle click also opens a link
    const click = e.target instanceof Element ? clickEvent(e.target) : null
    if (click) send({ k: 'click', p: location.pathname, id: vid, ...click })
  }
  document.addEventListener('click', onClick, { capture: true, passive: true })
  document.addEventListener('auxclick', onClick, { capture: true, passive: true })
}
