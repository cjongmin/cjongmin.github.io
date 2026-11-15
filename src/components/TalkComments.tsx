import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'

// Comments under a talk post, served from /api/comments by a Cloudflare Worker (not in this
// repository). Anyone can comment or reply with a nickname and a password; the password lets them
// delete their comment later. The site's owner, signed in on this browser, can delete any comment,
// and comments written while signed in are marked as the author's.
// Comments load only when the section comes near the screen, so they never slow the post down.

interface Comment {
  id: number
  parent: number | null
  ts: number
  nick?: string
  body?: string
  owner?: boolean
  deleted?: boolean
}

const API = '/api/comments'
const NICK_KEY = 'comment-nick'
const when = (ts: number) => new Date(ts).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })

async function send(path: string, data: object) {
  const res = await fetch(path, {
    method: 'POST', credentials: 'same-origin',
    headers: { 'content-type': 'application/json' }, body: JSON.stringify(data),
  })
  const out = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(out.error || 'Something went wrong. Please try again.')
  return out
}

const INPUT = `w-full rounded-xl border border-black/[0.12] dark:border-white/[0.14] bg-white dark:bg-white/[0.04]
               px-3 py-2 text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#8E8E93]
               focus:outline-none focus:ring-2 focus:ring-[#0071E3]/40 dark:focus:ring-[#2997FF]/50`
const PRIMARY = `inline-flex items-center rounded-full bg-[#0071E3] dark:bg-[#2997FF] px-4 py-2 text-[14px] font-medium text-white
                 hover:opacity-90 disabled:opacity-50 transition-opacity`
const QUIET = `text-[13px] font-medium text-secondary hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors`

function CommentForm({ postId, parent, prefill = '', onPosted, onCancel, autoFocus = false }: {
  postId: string
  parent?: number
  prefill?: string
  onPosted: (c: Comment) => void
  onCancel?: () => void
  autoFocus?: boolean
}) {
  const [nick, setNick] = useState('')
  const [password, setPassword] = useState('')
  const [body, setBody] = useState(prefill)
  const [website, setWebsite] = useState('')            // stays empty for people; see the Worker
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    try { setNick(localStorage.getItem(NICK_KEY) ?? '') } catch { /* storage can be blocked */ }
    if (autoFocus && bodyRef.current) {
      bodyRef.current.focus()
      bodyRef.current.setSelectionRange(prefill.length, prefill.length)
    }
  }, [autoFocus, prefill])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const out = await send(API, { post: postId, parent, nick, password, body, website })
      try { localStorage.setItem(NICK_KEY, nick.trim()) } catch { /* fine */ }
      setBody(''); setPassword('')
      if (out.comment) onPosted(out.comment)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const ids = `comment-${parent ?? 'new'}`
  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="block mb-1 text-[13px] font-medium text-secondary">Nickname</span>
          <input className={INPUT} value={nick} onChange={e => setNick(e.target.value)} maxLength={24} required
                 autoComplete="nickname" name={`${ids}-nick`} />
        </label>
        <label className="block">
          <span className="block mb-1 text-[13px] font-medium text-secondary">Password <span className="font-normal">(to delete it later)</span></span>
          <input className={INPUT} type="password" value={password} onChange={e => setPassword(e.target.value)}
                 minLength={4} maxLength={64} required autoComplete="new-password" name={`${ids}-password`} />
        </label>
      </div>
      <label className="block">
        <span className="sr-only">{parent ? 'Your reply' : 'Your comment'}</span>
        <textarea ref={bodyRef} className={`${INPUT} min-h-[96px] resize-y leading-relaxed`} value={body}
                  onChange={e => setBody(e.target.value)} maxLength={1000} required
                  placeholder={parent ? 'Write a reply' : 'Leave a comment'} />
      </label>
      {/* Hidden from people and from assistive technology; bots that fill every field give themselves away. */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label>Website <input tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></label>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button type="submit" className={PRIMARY} disabled={busy}>{busy ? 'Posting…' : parent ? 'Reply' : 'Post comment'}</button>
        {onCancel && <button type="button" className={QUIET} onClick={onCancel}>Cancel</button>}
        {body.length > 900 && <span className="text-[12.5px] text-secondary tabular-nums">{1000 - body.length} characters left</span>}
        <p role="status" aria-live="polite" className="text-[13.5px] text-[#C0392B] dark:text-[#FF6B5E]">{error}</p>
      </div>
    </form>
  )
}

function DeleteBox({ id, admin, onDeleted, onCancel }: { id: number; admin: boolean; onDeleted: () => void; onCancel: () => void }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try { await send(`${API}/delete`, admin ? { id } : { id, password }); onDeleted() } catch (err) { setError((err as Error).message) } finally { setBusy(false) }
  }
  return (
    <form onSubmit={submit} className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
      {admin ? (
        <span className="text-[13.5px] text-body">Delete this comment?</span>
      ) : (
        <label className="flex items-center gap-2">
          <span className="text-[13px] text-secondary">Password</span>
          <input className={`${INPUT} !w-40 !py-1.5 !text-[14px]`} type="password" value={password} autoFocus required
                 onChange={e => setPassword(e.target.value)} autoComplete="off" />
        </label>
      )}
      <button type="submit" disabled={busy}
              className="rounded-full px-3 py-1.5 text-[13px] font-medium text-white bg-[#C0392B] hover:opacity-90 disabled:opacity-50">
        {busy ? 'Deleting…' : 'Delete'}
      </button>
      <button type="button" className={QUIET} onClick={onCancel}>Cancel</button>
      <p role="status" aria-live="polite" className="w-full text-[13px] text-[#C0392B] dark:text-[#FF6B5E] empty:hidden">{error}</p>
    </form>
  )
}

function CommentView({ c, admin, onReply, deleting, setDeleting, onDeleted }: {
  c: Comment
  admin: boolean
  onReply: () => void
  deleting: boolean
  setDeleting: (on: boolean) => void
  onDeleted: () => void
}) {
  if (c.deleted) return <p className="py-1 text-[14px] italic text-secondary">This comment was deleted.</p>
  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] break-all">{c.nick}</span>
        {c.owner && (
          <span className="rounded-full bg-[#0071E3]/10 dark:bg-[#2997FF]/15 px-2 py-0.5 text-[11.5px] font-semibold text-[#0071E3] dark:text-[#2997FF]">Author</span>
        )}
        <time dateTime={new Date(c.ts).toISOString()} className="text-[12.5px] text-secondary tabular-nums">{when(c.ts)}</time>
      </p>
      <p className="mt-1.5 text-[15px] sm:text-[16px] leading-[1.65] text-body whitespace-pre-wrap break-words">{c.body}</p>
      {deleting ? (
        <DeleteBox id={c.id} admin={admin} onDeleted={onDeleted} onCancel={() => setDeleting(false)} />
      ) : (
        <div className="mt-1.5 flex gap-4">
          <button type="button" className={QUIET} onClick={onReply}>Reply</button>
          <button type="button" className={QUIET} onClick={() => setDeleting(true)}>Delete</button>
        </div>
      )}
    </div>
  )
}

export default function TalkComments({ postId, eyebrowClass }: { postId: string; eyebrowClass: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [items, setItems] = useState<Comment[]>([])
  const [admin, setAdmin] = useState(false)
  const [replyTo, setReplyTo] = useState<{ thread: number; prefill: string } | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const load = useCallback(async () => {
    setStatus(s => (s === 'ready' ? s : 'loading'))
    try {
      const res = await fetch(`${API}?post=${encodeURIComponent(postId)}`, { credentials: 'same-origin' })
      if (!res.ok) throw new Error(String(res.status))
      const out = await res.json()
      setItems(out.comments ?? []); setAdmin(!!out.admin); setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [postId])

  // A post can change without this component unmounting (the next post opened from the list).
  useEffect(() => { setItems([]); setStatus('idle'); setReplyTo(null); setDeleting(null) }, [postId])

  useEffect(() => {
    if (status !== 'idle') return
    const el = sectionRef.current
    if (!el || !('IntersectionObserver' in window)) { load(); return }
    const io = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { io.disconnect(); load() } }, { rootMargin: '600px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [status, load])

  const threads = items.filter(c => c.parent === null)
  const repliesOf = (id: number) => items.filter(c => c.parent === id)
  const count = items.filter(c => !c.deleted).length
  const added = (c: Comment) => { setItems(list => [...list, c]); setReplyTo(null) }
  const removed = () => { setDeleting(null); load() }

  return (
    <section ref={sectionRef} aria-label="Comments" className="mt-14">
      <p className={eyebrowClass}>Comments{status === 'ready' && count > 0 ? ` · ${count}` : ''}</p>
      {admin && (
        <p className="mt-2 text-[13px] text-secondary">You are signed in as the site's owner: you can delete any comment, and your comments are marked as the author's.</p>
      )}

      {status === 'error' && (
        <p className="mt-4 text-[14px] text-secondary">
          Comments could not be loaded. <button type="button" className="underline" onClick={load}>Try again</button>
        </p>
      )}
      {status === 'ready' && threads.length === 0 && <p className="mt-4 text-[14.5px] text-secondary">No comments yet. Questions and thoughts are welcome.</p>}

      {threads.length > 0 && (
        <ol className="mt-5 space-y-6">
          {threads.map(t => (
            <li key={t.id} className="pb-6 border-b border-black/[0.06] dark:border-white/[0.08] last:border-b-0 last:pb-0">
              <CommentView c={t} admin={admin} deleting={deleting === t.id} setDeleting={on => setDeleting(on ? t.id : null)} onDeleted={removed}
                           onReply={() => setReplyTo({ thread: t.id, prefill: '' })} />
              {repliesOf(t.id).length > 0 && (
                <ol className="mt-4 space-y-4 pl-4 sm:pl-6 border-l-2 border-black/[0.06] dark:border-white/[0.1]">
                  {repliesOf(t.id).map(r => (
                    <li key={r.id}>
                      <CommentView c={r} admin={admin} deleting={deleting === r.id} setDeleting={on => setDeleting(on ? r.id : null)} onDeleted={removed}
                                   onReply={() => setReplyTo({ thread: t.id, prefill: `@${r.nick} ` })} />
                    </li>
                  ))}
                </ol>
              )}
              {replyTo?.thread === t.id && (
                <div className="mt-2 pl-4 sm:pl-6 border-l-2 border-[#0071E3]/30 dark:border-[#2997FF]/40">
                  <CommentForm key={`${t.id}:${replyTo.prefill}`} postId={postId} parent={t.id} prefill={replyTo.prefill} autoFocus
                               onPosted={added} onCancel={() => setReplyTo(null)} />
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      <div className={threads.length > 0 ? 'mt-8' : ''}>
        <CommentForm postId={postId} onPosted={added} />
      </div>
    </section>
  )
}
