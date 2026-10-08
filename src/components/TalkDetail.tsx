import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowUpRight, Check, ChevronLeft, ChevronRight, Link2,
  Presentation, Image as ImageIcon,
} from 'lucide-react'
import { Talk, talkContent, talksInOrder } from '../data/talks'
import { Publication, publications } from '../data/publications'
import { profile } from '../data/profile'
import { people } from '../data/people'
import { Block, MarkdownBody, parseMarkdown } from '../lib/markdown'

interface TalkDetailProps {
  talk: Talk
  onClose: () => void
  onNavigate: (talk: Talk) => void   // open another post from the list at the bottom
}

const HONOURS = new Set(['Oral', 'Spotlight'])

/**
 * One talk as a blog post: eyebrow, title, subtitle and byline, then the paper
 * box (title, venue, authors), a table of contents, the body
 * (src/content/talks/<id>.md, which places its own photos), the paper and
 * poster cards, and the list of all posts. Opens over the site (no router), is addressable via #talk=<id>, and
 * closes on Back / Escape.
 */
export default function TalkDetail({ talk, onClose, onNavigate }: TalkDetailProps) {
  const backRef = useRef<HTMLButtonElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    backRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const paper = talk.paperId ? publications.find(p => p.id === talk.paperId) : undefined
  const paperUrl = talk.links?.paper ?? paper?.links?.paper
  // The poster comes from the talk itself or, failing that, from its paper
  const posterUrl = talk.links?.poster ?? paper?.links?.poster
  const posterImage = paper?.posterImage
  const extraLinks = [
    talk.links?.slides && { label: 'Slides', icon: Presentation, href: talk.links.slides },
    posterUrl && !posterImage && { label: 'Poster', icon: ImageIcon, href: posterUrl },
  ].filter(Boolean) as { label: string; icon: React.ElementType; href: string }[]

  const blocks = useMemo(() => parseMarkdown(talkContent(talk.id)), [talk.id])
  const headings = blocks.filter((b): b is Extract<Block, { kind: 'heading' }> => b.kind === 'heading')
  const honour = HONOURS.has(talk.type)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard unavailable — ignore */ }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[100] overflow-y-auto bg-white dark:bg-black"
        role="dialog"
        aria-modal="true"
        aria-label={talk.title}
      >
        {/* Sticky top bar */}
        <div className="sticky top-0 z-10 h-14 bg-white/85 dark:bg-black/85 backdrop-blur-xl
                        border-b border-black/[0.06] dark:border-white/[0.07]">
          <div className="section-container h-full flex items-center justify-between">
            <button ref={backRef} onClick={onClose} className="btn-secondary">
              <ArrowLeft size={14} />
              Back
            </button>
            <span className="text-[13px] font-semibold text-secondary uppercase tracking-widest">
              Presentation Notes <span className="text-[#1D1D1F] dark:text-[#F5F5F7]">#{talk.no}</span>
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="pb-24"
        >
          {/* ---------- Header ---------- */}
          <header className="section-container pt-10 sm:pt-16">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-secondary">
              <span className="text-[#1D1D1F] dark:text-[#F5F5F7]">{talk.event}</span>
              <span className="mx-2 text-neutral-300 dark:text-neutral-600">·</span>
              <span className={honour ? 'text-rose-700 dark:text-rose-400' : ''}>{talk.type}</span>
              {talk.upcoming && (
                <>
                  <span className="mx-2 text-neutral-300 dark:text-neutral-600">·</span>
                  <span className="text-[#0071E3] dark:text-[#2997FF]">Upcoming</span>
                </>
              )}
            </p>

            <h1 className="mt-4 max-w-[900px] text-[30px] sm:text-[44px] font-semibold tracking-tight leading-[1.12]
                           text-[#1D1D1F] dark:text-[#F5F5F7]">
              {talk.headline ?? talk.title}
            </h1>
            {talk.subtitle && (
              <p className="mt-4 max-w-[860px] text-[19px] sm:text-[22px] leading-[1.45] text-secondary">{talk.subtitle}</p>
            )}

            {/* Byline */}
            <div className="mt-7 flex items-center gap-3">
              {profile.profileImage && (
                <img
                  src={profile.profileImage}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-black/[0.08] dark:ring-white/[0.12]"
                />
              )}
              <div className="leading-tight">
                <p className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{profile.name}</p>
                <p className="mt-1 text-[13px] text-secondary">
                  {[talk.role, talk.date, talk.location].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
          </header>

          {/* ---------- Body ---------- */}
          <article className="section-container">
            {paper && <PaperBox paper={paper} venue={talk.eventFull ?? paper.venueFull} />}
            {headings.length > 0 && <Contents headings={headings} />}

            {blocks.length > 0 ? (
              <MarkdownBody blocks={blocks} />
            ) : (
              <p className="mt-10 text-[19px] sm:text-[21px] leading-[1.6] text-[#3A3A3C] dark:text-[#D1D1D6]">{talk.summary}</p>
            )}

            {/* ---------- The paper (and its poster) ---------- */}
            <div className={`mt-14 grid gap-4 ${posterUrl && posterImage ? 'md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]' : ''}`}>
              {paper && (
                <a
                  href={paperUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-4 sm:gap-5 items-center rounded-2xl p-4 sm:p-5
                             border border-black/[0.08] dark:border-white/[0.1]
                             hover:shadow-md transition-shadow duration-200"
                >
                  {paper.image && (
                    <div className="shrink-0 w-24 sm:w-40 aspect-[4/3] rounded-lg overflow-hidden p-1.5
                                    bg-neutral-50 dark:bg-zinc-900/60 flex items-center justify-center">
                      <img src={paper.image} alt="" loading="lazy" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-secondary">The paper</p>
                    <p className="mt-1 text-[15px] sm:text-[16px] font-semibold leading-snug text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {paper.title}
                    </p>
                    {paper.venueFull && (
                      <p className="mt-1 text-[13px] italic text-secondary">{paper.venueFull}</p>
                    )}
                    <span className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-medium
                                     text-[#0071E3] dark:text-[#2997FF] group-hover:gap-1.5 transition-all">
                      Read the paper <ArrowUpRight size={13} />
                    </span>
                  </div>
                </a>
              )}

              {posterUrl && posterImage && (
                <a
                  href={posterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-4 sm:gap-5 items-center rounded-2xl p-4 sm:p-5
                             border border-black/[0.08] dark:border-white/[0.1]
                             hover:shadow-md transition-shadow duration-200"
                >
                  <div className="shrink-0 w-16 sm:w-20 aspect-[1/1.414] rounded-md overflow-hidden
                                  ring-1 ring-black/[0.08] dark:ring-white/[0.1] bg-neutral-50">
                    <img src={posterImage} alt="" loading="lazy" className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-secondary">The poster</p>
                    <p className="mt-1 text-[15px] sm:text-[16px] font-semibold leading-snug text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {talk.event} {talk.type}
                    </p>
                    <p className="mt-1 text-[13px] italic text-secondary">PDF · A0</p>
                    <span className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-medium
                                     text-[#0071E3] dark:text-[#2997FF] group-hover:gap-1.5 transition-all">
                      View the poster <ArrowUpRight size={13} />
                    </span>
                  </div>
                </a>
              )}
            </div>

            {extraLinks.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {extraLinks.map(({ label, icon: Icon, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                    <Icon size={14} />
                    {label}
                  </a>
                ))}
              </div>
            )}

            {/* ---------- All posts ---------- */}
            <PostList current={talk} onNavigate={onNavigate} />

            {/* ---------- Footer ---------- */}
            <div className="mt-16 pt-6 border-t border-black/[0.08] dark:border-white/[0.1]
                            flex items-center justify-between gap-4">
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-secondary
                           hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
              >
                <ArrowLeft size={14} />
                All presentation notes
              </button>
              <button onClick={copyLink} className="btn-secondary">
                {copied ? <Check size={14} /> : <Link2 size={14} />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
          </article>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const EYEBROW = 'text-[12px] font-semibold uppercase tracking-[0.12em] text-secondary'

// "Name^1" marks equal contribution (same convention as the publication cards)
function authorRoles(paper: Publication) {
  return paper.authors.map((raw, i) => {
    const name = raw.replace(/\^.*$/, '').trim()
    const role = paper.corresponding?.includes(name) ? 'Corresponding author'
      : raw.includes('^') ? 'Co-first author'
      : i === 0 ? 'First author'
      : 'Co-author'
    return { name, role, ...people[name] }
  })
}

/** The paper at the top of the post: title, venue, and its authors in a row (photo, name, role; each links to their page). */
function PaperBox({ paper, venue }: { paper: Publication; venue?: string }) {
  return (
    <section aria-label="The paper and its authors"
             className="mt-10 sm:mt-12 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] px-3 py-6 sm:p-7 text-center">
      <p className={EYEBROW}>The paper</p>
      <p className="mt-2 mx-auto max-w-[760px] px-2 text-[17px] sm:text-[19px] font-semibold leading-snug tracking-tight
                    text-[#1D1D1F] dark:text-[#F5F5F7]">
        {paper.title}
      </p>
      {venue && <p className="mt-1.5 px-2 text-[14px] italic text-secondary">{venue}</p>}
      <ul className="mt-6 flex flex-wrap justify-center gap-x-2.5 gap-y-6 sm:gap-x-6">
        {authorRoles(paper).map(a => {
          const face = a.photo ? (
            <img src={a.photo} alt="" loading="lazy" decoding="async"
                 className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover ring-1 ring-black/[0.08] dark:ring-white/[0.12]" />
          ) : (
            <span className="w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-[18px] font-semibold
                             bg-neutral-100 dark:bg-white/[0.08] text-secondary">
              {a.name.split(' ').map(w => w[0]).join('')}
            </span>
          )
          const text = (
            <>
              {face}
              <span className="mt-2.5 text-[13px] sm:text-[15px] font-semibold leading-tight text-[#1D1D1F] dark:text-[#F5F5F7]
                               group-hover:text-[#0071E3] dark:group-hover:text-[#2997FF] transition-colors">
                {a.name}
              </span>
              <span className="mt-1 text-[11.5px] sm:text-[13px] leading-tight text-secondary">{a.role}</span>
            </>
          )
          return (
            <li key={a.name} className="w-[68px] sm:w-[144px]">
              {a.url ? (
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center text-center">
                  {text}
                </a>
              ) : (
                <div className="flex flex-col items-center text-center">{text}</div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** Notion-style table of contents built from the post's # and ## headings. */
function Contents({ headings }: { headings: Extract<Block, { kind: 'heading' }>[] }) {
  const plain = (t: string) => t.replace(/\*\*|`|\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  return (
    <nav aria-label="Contents"
         className="mt-5 rounded-2xl px-5 py-5 sm:px-7 bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08]">
      <p className={EYEBROW}>Contents</p>
      <ul className="mt-3 space-y-1">
        {headings.map(h => (
          <li key={h.id} className={h.level === 2 ? 'pl-5' : ''}>
            <button
              onClick={() => document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className={`py-0.5 text-left leading-snug underline-offset-4 decoration-black/25 dark:decoration-white/30 hover:underline
                          hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors
                          ${h.level === 1 ? 'text-[15px] sm:text-[16px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7]' : 'text-[14px] sm:text-[15px] text-secondary'}`}
            >
              {plain(h.text)}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

const PAGE_SIZE = 5

/** Every post in series order (#1, #2, …), five per page; the current one is marked. */
function PostList({ current, onNavigate }: { current: Talk; onNavigate: (t: Talk) => void }) {
  const pages = Math.max(1, Math.ceil(talksInOrder.length / PAGE_SIZE))
  const [page, setPage] = useState(() => Math.max(0, Math.floor(talksInOrder.findIndex(t => t.id === current.id) / PAGE_SIZE)))
  const shown = talksInOrder.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <section aria-label="All presentation notes" className="mt-16">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
          Presentation Notes
        </h2>
        <span className="text-[14px] text-secondary">{talksInOrder.length} posts</span>
      </div>

      <ol className="mt-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] overflow-hidden
                     divide-y divide-black/[0.06] dark:divide-white/[0.08]">
        {shown.map(t => {
          const isCurrent = t.id === current.id
          return (
            <li key={t.id}>
              <button
                onClick={() => !isCurrent && onNavigate(t)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`w-full text-left flex items-baseline gap-4 px-5 py-4 transition-colors
                            ${isCurrent ? 'bg-neutral-50 dark:bg-white/[0.04] cursor-default' : 'hover:bg-black/[0.025] dark:hover:bg-white/[0.04]'}`}
              >
                <span className="shrink-0 w-8 text-[14px] font-semibold tabular-nums text-secondary">#{t.no}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] sm:text-[16px] font-semibold leading-snug text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {t.headline ?? t.title}
                  </span>
                  <span className="mt-1 block text-[13px] text-secondary">
                    {[`${t.event} · ${t.type}`, t.date, t.location].filter(Boolean).join(' · ')}
                  </span>
                </span>
                {isCurrent && (
                  <span className="shrink-0 text-[12px] font-semibold text-[#0071E3] dark:text-[#2997FF]">Reading</span>
                )}
              </button>
            </li>
          )
        })}
      </ol>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} aria-label="Previous page"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-secondary disabled:opacity-30
                             hover:bg-black/[0.05] dark:hover:bg-white/[0.08]">
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)} aria-current={i === page ? 'page' : undefined}
                    className={`min-w-9 h-9 px-2 rounded-full text-[14px] font-medium tabular-nums
                                ${i === page ? 'bg-black/[0.07] dark:bg-white/[0.1] text-[#1D1D1F] dark:text-[#F5F5F7]'
                                             : 'text-secondary hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'}`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page === pages - 1} aria-label="Next page"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-secondary disabled:opacity-30
                             hover:bg-black/[0.05] dark:hover:bg-white/[0.08]">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  )
}
