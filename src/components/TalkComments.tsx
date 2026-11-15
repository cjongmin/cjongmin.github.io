import { FormEvent, Fragment, ReactNode, useCallback, useEffect, useRef, useState } from 'react'

// Comments under a talk post, served from /api/comments by a Cloudflare Worker (not in this
// repository). Anyone can comment or reply with a nickname and a password; the password lets them
// edit or delete their comment later. The site's owner, signed in on this browser, can delete any
// comment, and comments written while signed in are marked as the author's.
// Comments load only when the section comes near the screen, so they never slow the post down.
// $…$ and $$…$$ in a comment are drawn as maths with KaTeX, loaded only when some comment has a $.

interface Comment {
  id: number
  parent: number | null
  ts: number
  nick?: string
  body?: string
  owner?: boolean
  edited?: number
  deleted?: boolean
}

const API = '/api/comments'
const NICK_KEY = 'comment-nick'
const MAX_LENGTH = 1000
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

type MathRenderer = (tex: string, display: boolean) => string
let mathModule: Promise<MathRenderer> | null = null
const loadMath = () => (mathModule ??= import('../lib/katex').then(m => m.renderMath))

type Piece = { kind: 'text'; text: string } | { kind: 'math'; tex: string; display: boolean }

/**
 * Splits a comment into text and maths. $$…$$ is displayed maths; $…$ is inline maths when the first $
 * is followed by a non-space and the closing $, on the same line, follows a non-space and is not
 * followed by a digit, so "$5 and $10" stays text. \$ is a plain dollar sign.
 */
export function splitMath(s: string): Piece[] {
  const out: Piece[] = []
  let text = '', i = 0
  const flush = () => { if (text) { out.push({ kind: 'text', text }); text = '' } }
  while (i < s.length) {
    if (s[i] === '\\' && s[i + 1] === '$') { text += '$'; i += 2; continue }
    if (s[i] === '$' && s[i + 1] === '$') {
      const end = s.indexOf('$$', i + 2)
      if (end > i + 2 && s.slice(i + 2, end).trim()) {
        // displayed maths is its own block, so the line breaks around it would only add blank lines
        text = text.replace(/\n$/, '')
        flush(); out.push({ kind: 'math', tex: s.slice(i + 2, end).trim(), display: true })
        i = s[end + 2] === '\n' ? end + 3 : end + 2
        continue
      }
    } else if (s[i] === '$' && s[i + 1] && !/\s/.test(s[i + 1])) {
      let end = -1
      for (let k = i + 1; k < s.length && s[k] !== '\n'; k++) {
        if (s[k] === '\\') { k++; continue }
        if (s[k] === '$') { if (!/\s/.test(s[k - 1]) && !/\d/.test(s[k + 1] ?? '')) end = k; break }
      }
      if (end > i + 1) { flush(); out.push({ kind: 'math', tex: s.slice(i + 1, end), display: false }); i = end + 1; continue }
    }
    text += s[i++]
  }
  flush()
  return out
}

/** A comment's text, with its maths drawn once KaTeX has arrived (until then, the TeX as typed). */
function CommentBody({ text, math }: { text: string; math: MathRenderer | null }) {
  return (
    <p className="mt-1.5 text-[15px] sm:text-[16px] leading-[1.65] text-body whitespace-pre-wrap break-words">
      {splitMath(text).map((p, i) => {
        if (p.kind === 'text') return <Fragment key={i}>{p.text}</Fragment>
        const typed = p.display ? `$$${p.tex}$$` : `$${p.tex}$`
        if (!math) return <Fragment key={i}>{typed}</Fragment>
        return (
          <span key={i} title={typed} className={p.display ? 'block overflow-x-auto overflow-y-hidden whitespace-normal' : 'whitespace-normal'}
                dangerouslySetInnerHTML={{ __html: math(p.tex, p.display) }} />
        )
      })}
    </p>
  )
}

// Fields and the button share one height and one corner, so a row of them reads as one control.
const FIELD = `w-full min-w-0 rounded-xl border border-black/[0.12] dark:border-white/[0.14] bg-white dark:bg-white/[0.04]
               px-3 py-2 text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#8E8E93]
               focus:outline-none focus:ring-2 focus:ring-[#0071E3]/40 dark:focus:ring-[#2997FF]/50`
const BUTTON = `rounded-xl px-4 sm:px-5 py-2 text-[15px] font-medium text-white bg-[#0071E3] dark:bg-[#2997FF]
                hover:opacity-90 disabled:opacity-50 transition-opacity focus:outline-none focus-visible:ring-2
                focus-visible:ring-offset-2 focus-visible:ring-[#0071E3] dark:focus-visible:ring-offset-black`
const DANGER = BUTTON.replace('bg-[#0071E3] dark:bg-[#2997FF]', 'bg-[#C0392B]')
const QUIET = `text-[13px] font-medium text-secondary hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors`

/** The line under a form: Cancel, the characters left near the limit, and any error. */
function FormNotes({ onCancel, length, error }: { onCancel?: () => void; length?: number; error: string }) {
  const nearLimit = length !== undefined && length > MAX_LENGTH - 100
  if (!onCancel && !nearLimit && !error) return <p role="status" aria-live="polite" className="sr-only">{error}</p>
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
      {onCancel && <button type="button" className={QUIET} onClick={onCancel}>Cancel</button>}
      {nearLimit && <span className="text-[12.5px] text-secondary tabular-nums">{MAX_LENGTH - (length ?? 0)} characters left</span>}
      <p role="status" aria-live="polite" className="text-[13.5px] text-[#C0392B] dark:text-[#FF6B5E]">{error}</p>
    </div>
  )
}

function TextBox({ value, onChange, placeholder, label, autoFocusAt }: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  label: string
  autoFocusAt?: number
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (autoFocusAt === undefined || !ref.current) return
    ref.current.focus()
    ref.current.setSelectionRange(autoFocusAt, autoFocusAt)
  }, [autoFocusAt])
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <textarea ref={ref} className={`${FIELD} block min-h-[96px] resize-y leading-relaxed`} value={value}
                onChange={e => onChange(e.target.value)} maxLength={MAX_LENGTH} required placeholder={placeholder} />
    </label>
  )
}

function PasswordField({ value, onChange, autoComplete = 'new-password' }: { value: string; onChange: (v: string) => void; autoComplete?: string }) {
  return (
    <label className="block min-w-0">
      <span className="sr-only">Password</span>
      <input className={FIELD} type="password" placeholder="Password" value={value} onChange={e => onChange(e.target.value)}
             minLength={4} maxLength={64} required autoComplete={autoComplete} />
    </label>
  )
}

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
  useEffect(() => { try { setNick(localStorage.getItem(NICK_KEY) ?? '') } catch { /* storage can be blocked */ } }, [])

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

  return (
    <form onSubmit={submit} className="mt-4">
      <TextBox value={body} onChange={setBody} label={parent ? 'Your reply' : 'Your comment'}
               placeholder={parent ? 'Write a reply. LaTeX works too: $\\Omega^\\star$' : 'Leave a comment. LaTeX works too: $\\Omega^\\star$'}
               autoFocusAt={autoFocus ? prefill.length : undefined} />
      <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 sm:gap-3">
        <label className="block min-w-0">
          <span className="sr-only">Nickname</span>
          <input className={FIELD} placeholder="Nickname" value={nick} onChange={e => setNick(e.target.value)} maxLength={24} required autoComplete="nickname" />
        </label>
        <PasswordField value={password} onChange={setPassword} />
        <button type="submit" className={BUTTON} disabled={busy}>{parent ? 'Reply' : 'Post'}</button>
      </div>
      {/* Hidden from people and from assistive technology; bots that fill every field give themselves away. */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label>Website <input tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></label>
      </div>
      <FormNotes onCancel={onCancel} length={body.length} error={error} />
    </form>
  )
}

/** Editing a comment in place. The owner edits their own comments without the password. */
function EditForm({ c, needsPassword, onSaved, onCancel }: { c: Comment; needsPassword: boolean; onSaved: (c: Comment) => void; onCancel: () => void }) {
  const [body, setBody] = useState(c.body ?? '')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try { onSaved((await send(`${API}/edit`, needsPassword ? { id: c.id, body, password } : { id: c.id, body })).comment) }
    catch (err) { setError((err as Error).message) }
    finally { setBusy(false) }
  }
  return (
    <form onSubmit={submit} className="mt-2">
      <TextBox value={body} onChange={setBody} label="Edit your comment" placeholder="Your comment" autoFocusAt={body.length} />
      <div className="mt-2.5 flex gap-2 sm:gap-3">
        {needsPassword && <div className="flex-1 sm:flex-none sm:w-64"><PasswordField value={password} onChange={setPassword} autoComplete="current-password" /></div>}
        <button type="submit" className={BUTTON} disabled={busy}>Save</button>
      </div>
      <FormNotes onCancel={onCancel} length={body.length} error={error} />
    </form>
  )
}

function DeleteForm({ id, needsPassword, onDeleted, onCancel }: { id: number; needsPassword: boolean; onDeleted: () => void; onCancel: () => void }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try { await send(`${API}/delete`, needsPassword ? { id, password } : { id }); onDeleted() }
    catch (err) { setError((err as Error).message) }
    finally { setBusy(false) }
  }
  return (
    <form onSubmit={submit} className="mt-2">
      {needsPassword ? (
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1 sm:flex-none sm:w-64"><PasswordField value={password} onChange={setPassword} autoComplete="current-password" /></div>
          <button type="submit" className={DANGER} disabled={busy}>Delete</button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-body">Delete this comment?</span>
          <button type="submit" className={DANGER} disabled={busy}>Delete</button>
        </div>
      )}
      <FormNotes onCancel={onCancel} error={error} />
    </form>
  )
}

type Action = { id: number; kind: 'edit' | 'delete' } | null

function CommentView({ c, admin, math, action, setAction, onReply, onSaved, onDeleted }: {
  c: Comment
  admin: boolean
  math: MathRenderer | null
  action: Action
  setAction: (a: Action) => void
  onReply: () => void
  onSaved: (c: Comment) => void
  onDeleted: () => void
}) {
  if (c.deleted) return <p className="py-1 text-[14px] italic text-secondary">This comment was deleted.</p>
  const mine = action?.id === c.id ? action.kind : null
  let below: ReactNode
  if (mine === 'edit') below = <EditForm c={c} needsPassword={!(admin && c.owner)} onSaved={saved => { setAction(null); onSaved(saved) }} onCancel={() => setAction(null)} />
  else if (mine === 'delete') below = <DeleteForm id={c.id} needsPassword={!admin} onDeleted={onDeleted} onCancel={() => setAction(null)} />
  else below = (
    <div className="mt-1.5 flex gap-4">
      <button type="button" className={QUIET} onClick={onReply}>Reply</button>
      <button type="button" className={QUIET} onClick={() => setAction({ id: c.id, kind: 'edit' })}>Edit</button>
      <button type="button" className={QUIET} onClick={() => setAction({ id: c.id, kind: 'delete' })}>Delete</button>
    </div>
  )
  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] break-all">{c.nick}</span>
        {c.owner && (
          <span className="rounded-full bg-[#0071E3]/10 dark:bg-[#2997FF]/15 px-2 py-0.5 text-[11.5px] font-semibold text-[#0071E3] dark:text-[#2997FF]">Author</span>
        )}
        <time dateTime={new Date(c.ts).toISOString()} className="text-[12.5px] text-secondary tabular-nums">{when(c.ts)}</time>
        {c.edited && <span className="text-[12.5px] text-secondary" title={`Edited ${when(c.edited)}`}>· edited</span>}
      </p>
      {mine !== 'edit' && <CommentBody text={c.body ?? ''} math={math} />}
      {below}
    </div>
  )
}

export default function TalkComments({ postId, eyebrowClass }: { postId: string; eyebrowClass: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [items, setItems] = useState<Comment[]>([])
  const [admin, setAdmin] = useState(false)
  const [replyTo, setReplyTo] = useState<{ thread: number; prefill: string } | null>(null)
  const [action, setAction] = useState<Action>(null)
  const [math, setMath] = useState<MathRenderer | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const hasMath = items.some(c => c.body?.includes('$'))
  useEffect(() => { if (hasMath && !math) loadMath().then(fn => setMath(() => fn)).catch(() => {}) }, [hasMath, math])

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
  useEffect(() => { setItems([]); setStatus('idle'); setReplyTo(null); setAction(null) }, [postId])

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
  const saved = (c: Comment) => setItems(list => list.map(x => (x.id === c.id ? c : x)))
  const removed = () => { setAction(null); load() }
  const view = (c: Comment, onReply: () => void) => (
    <CommentView c={c} admin={admin} math={math} action={action} setAction={a => { setAction(a); if (a) setReplyTo(null) }}
                 onReply={() => { setAction(null); onReply() }} onSaved={saved} onDeleted={removed} />
  )

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
              {view(t, () => setReplyTo({ thread: t.id, prefill: '' }))}
              {repliesOf(t.id).length > 0 && (
                <ol className="mt-4 space-y-4 pl-4 sm:pl-6 border-l-2 border-black/[0.06] dark:border-white/[0.1]">
                  {repliesOf(t.id).map(r => <li key={r.id}>{view(r, () => setReplyTo({ thread: t.id, prefill: `@${r.nick} ` }))}</li>)}
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
