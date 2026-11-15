import { useCallback, useEffect, useRef, useState } from 'react'
import { Heart } from 'lucide-react'

// Likes on gallery photos, kept by a Cloudflare Worker at /api/likes (not in this repository).
// No sign-in: every tap counts, the way claps do. The Worker stops one person's taps on a photo at
// a daily number, so the count cannot be pumped up; taps beyond it simply do not add.
// Taps go out together after a short pause, so a burst of them is one request.

const API = '/api/likes'
const LIKED_KEY = 'liked-photos'
const SEND_AFTER_MS = 600

function likedHere(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) ?? '[]')) } catch { return new Set() }
}

export function useAlbumLikes(album: string) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [liked, setLiked] = useState<Set<string>>(() => new Set())
  const [full, setFull] = useState<Set<string>>(() => new Set())   // photos where today's taps have run out
  const pending = useRef(new Map<string, number>())
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  useEffect(() => {
    setLiked(likedHere())
    let live = true
    fetch(`${API}?album=${encodeURIComponent(album)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (live && d?.counts) setCounts(d.counts) })
      .catch(() => {})
    return () => { live = false }
  }, [album])

  const send = useCallback(async (id: string) => {
    const taps = pending.current.get(id) ?? 0
    pending.current.delete(id)
    if (!taps) return
    try {
      const res = await fetch(API, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ photo: `${album}/${id}`, taps }), keepalive: true,
      })
      if (!res.ok) return
      const out = await res.json()
      // the server's total, plus taps made while this request was on its way
      setCounts(c => ({ ...c, [id]: out.total + (pending.current.get(id) ?? 0) }))
      if (out.left === 0) setFull(f => new Set(f).add(id))
    } catch { /* the count corrects itself on the next visit */ }
  }, [album])

  // Anything not yet sent goes out when the page is left.
  useEffect(() => {
    const flush = () => { for (const id of [...pending.current.keys()]) send(id) }
    addEventListener('pagehide', flush)
    return () => { removeEventListener('pagehide', flush); flush() }
  }, [send])

  const tap = useCallback((id: string) => {
    if (full.has(id)) return
    setCounts(c => ({ ...c, [id]: (c[id] ?? 0) + 1 }))
    pending.current.set(id, Math.min(30, (pending.current.get(id) ?? 0) + 1))
    setLiked(prev => {
      if (prev.has(id)) return prev
      const next = new Set(prev).add(id)
      try { localStorage.setItem(LIKED_KEY, JSON.stringify([...next].slice(-500))) } catch { /* fine */ }
      return next
    })
    clearTimeout(timers.current.get(id))
    timers.current.set(id, setTimeout(() => send(id), SEND_AFTER_MS))
  }, [full, send])

  return { counts, liked, full, tap }
}

/** The heart under a photo, with its count. Each press adds one, with a small pop. */
export function LikeButton({ id, count, liked, full, onTap }: { id: string; count: number; liked: boolean; full: boolean; onTap: (id: string) => void }) {
  const [pops, setPops] = useState(0)
  return (
    <button
      type="button"
      onClick={() => { onTap(id); setPops(p => p + 1) }}
      aria-label={`Like this photo${count ? `, ${count} like${count === 1 ? '' : 's'} so far` : ''}`}
      title={full ? 'Thank you! That is all the likes one person can give this photo today.' : 'Like'}
      className={`group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 -my-1 text-[14px] tabular-nums transition-colors
        ${liked ? 'text-[#E0245E] dark:text-[#FF5C8A]' : 'text-secondary hover:text-[#E0245E] dark:hover:text-[#FF5C8A]'}
        hover:bg-[#E0245E]/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0245E]/50`}
    >
      <Heart key={pops} size={17} aria-hidden fill={liked ? 'currentColor' : 'none'} className={pops ? 'like-pop' : ''} />
      {count > 0 && <span aria-hidden>{count}</span>}
    </button>
  )
}
