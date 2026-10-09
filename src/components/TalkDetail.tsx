import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Link2 } from 'lucide-react'
import { Talk, talkShareUrl, talksNewestFirst } from '../data/talks'
import { talkContent } from '../data/talkContent'
import { Publication, publications } from '../data/publications'
import { profile } from '../data/profile'
import { people } from '../data/people'
import { Block, MarkdownBody, parseMarkdown } from '../lib/markdown'
import PaperLinks from './PaperLinks'
import Lightbox, { LightboxImage } from './Lightbox'

interface TalkDetailProps {
  talk: Talk
  onClose: () => void
  onNavigate: (talk: Talk) => void   // open another post from the list at the bottom
}

const HONOURS = new Set(['Oral', 'Spotlight'])

// Keep the last two words together so a title never ends on a lone word
const noOrphan = (text: string) => text.replace(/\s+(\S+)\s*$/, '\u00A0$1')

// Icon-like tiles at the bottom of a post. They share the row equally, so the row
// always spans both edges whatever the number of links: one row from sm; on phones
// up to four per row, and a shorter last row stretches to the full width too.
const LINK_TILE = `grow basis-[calc(25%-0.375rem)] sm:basis-0 min-w-0 inline-flex flex-col items-center justify-center gap-1.5
  h-[72px] sm:h-[84px] rounded-2xl border border-black/[0.08] dark:border-white/[0.1] text-[13px] sm:text-[14px] font-medium
  text-[#1D1D1F] dark:text-[#F5F5F7] hover:shadow-md hover:border-black/[0.14] dark:hover:border-white/[0.2]
  transition-all duration-150`

/**
 * One talk as a blog post: eyebrow, the paper title, subtitle and byline, then
 * the authors, a table of contents, the body (src/content/talks/<id>.md, which
 * places its own photos; clicking one opens it in a lightbox), the paper's
 * links, and the list of all posts. Opens over the site (no router), is
 * addressable via #talk=<id> (shared as /talks/<id>/), and closes on Back / Escape.
 */
export default function TalkDetail({ talk, onClose, onNavigate }: TalkDetailProps) {
  const backRef = useRef<HTMLButtonElement>(null)
  const [copied, setCopied] = useState(false)
  const [zoom, setZoom] = useState<LightboxImage | null>(null)
  const closeZoom = useCallback(() => setZoom(null), [])

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
  const blocks = useMemo(() => parseMarkdown(talkContent(talk.id)), [talk.id])
  const headings = blocks.filter((b): b is Extract<Block, { kind: 'heading' }> => b.kind === 'heading')
  const honour = HONOURS.has(talk.type)

  const copyLink = async () => {
    try {
      // the share page carries this post's own title and preview image (scripts/prerender.mjs)
      await navigator.clipboard.writeText(talkShareUrl(talk.id))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard unavailable — ignore */ }
  }

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-white dark:bg-black"
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
            <span className="text-[12px] sm:text-[13px] font-semibold text-secondary uppercase tracking-widest">
              Presentation Notes <span className="text-[#1D1D1F] dark:text-[#F5F5F7]">#{talk.no}</span>
            </span>
          </div>
        </div>

        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="pb-24"
        >
          {/* ---------- Header: same left and right edges as the body ---------- */}
          <header className="section-container pt-9 sm:pt-16">
            <p className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.14em] text-secondary">
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

            {/* Title and subtitle: justified edge to edge from sm (phones keep them left-aligned:
                large type on a narrow line would open wide gaps), never ending on a lone word;
                long words may hyphenate so a short line doesn't open wide gaps */}
            <h1 className="mt-3 sm:mt-4 text-[24px] sm:text-[34px] lg:text-[40px] font-semibold tracking-tight leading-[1.18]
                           text-[#1D1D1F] dark:text-[#F5F5F7] sm:text-justify sm:hyphens-auto [hyphenate-limit-chars:8_4_4]">
              {noOrphan(talk.title)}
            </h1>
            {talk.subtitle && (
              <p className="mt-3 sm:mt-4 text-[16px] sm:text-[21px] leading-[1.45] text-secondary sm:text-justify">{noOrphan(talk.subtitle)}</p>
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
                <p className="text-[14px] sm:text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{profile.name}</p>
                <p className="mt-1 text-[12px] sm:text-[13px] text-secondary">
                  {[talk.role, talk.date, talk.location].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
          </header>

          {/* ---------- Body ---------- */}
          <article className="section-container">
            {paper && <AuthorsBox paper={paper} />}
            {headings.length > 0 && <Contents headings={headings} />}

            {blocks.length > 0 ? (
              <MarkdownBody blocks={blocks} onImageClick={setZoom} />
            ) : (
              <p className="mt-10 text-[19px] sm:text-[21px] leading-[1.6] text-[#3A3A3C] dark:text-[#D1D1D6]">{talk.summary}</p>
            )}

            {/* ---------- The paper's links, as simple icon tiles ---------- */}
            {paper && (
              <section aria-label="Paper and resources" className="mt-14">
                <p className={EYEBROW}>Paper &amp; resources</p>
                <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
                  <PaperLinks pub={paper} links={{ ...paper.links, ...talk.links }} className={LINK_TILE} iconSize={20} />
                </div>
              </section>
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
        </m.div>

        <AnimatePresence>
          {zoom && <Lightbox image={zoom} onClose={closeZoom} />}
        </AnimatePresence>
      </m.div>
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

/** The paper's authors in a row: photo, name, role; each links to the author's page. */
function AuthorsBox({ paper }: { paper: Publication }) {
  return (
    <section aria-label="The authors"
             className="mt-9 sm:mt-12 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] px-2 py-6 sm:px-7 sm:py-8 text-center">
      <p className={EYEBROW}>The Authors</p>
      <ul className="mt-5 sm:mt-6 flex flex-wrap justify-center gap-x-1.5 gap-y-6 sm:gap-x-4 md:gap-x-6 lg:gap-x-12">
        {authorRoles(paper).map(a => {
          const face = a.photo ? (
            <img src={a.photo} alt="" loading="lazy" decoding="async"
                 className="w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full object-cover ring-1 ring-black/[0.08] dark:ring-white/[0.12]" />
          ) : (
            <span className="w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full flex items-center justify-center text-[20px] font-semibold
                             bg-neutral-100 dark:bg-white/[0.08] text-secondary">
              {a.name.split(' ').map(w => w[0]).join('')}
            </span>
          )
          const text = (
            <>
              {face}
              <span className="mt-2.5 sm:mt-3 text-[13px] sm:text-[15px] md:text-[17px] font-semibold leading-tight text-[#1D1D1F] dark:text-[#F5F5F7]
                               group-hover:text-[#0071E3] dark:group-hover:text-[#2997FF] transition-colors">
                {a.name}
              </span>
              <span className="mt-1 text-[11px] sm:text-[14px] leading-tight text-secondary">{a.role}</span>
            </>
          )
          return (
            <li key={a.name} className="w-[76px] sm:w-[112px] md:w-[140px] lg:w-[168px]">
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

/** Numbered table of contents (1., 2., 2.1 …) built from the post's # and ## headings. */
function Contents({ headings }: { headings: Extract<Block, { kind: 'heading' }>[] }) {
  const plain = (t: string) => t.replace(/\*\*|`|\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  let section = 0, sub = 0
  const numbered = headings.map(h => {
    if (h.level === 1) { section += 1; sub = 0; return { h, no: `${section}.` } }
    sub += 1
    return { h, no: `${Math.max(section, 1)}.${sub}` }
  })
  return (
    <nav aria-label="Contents"
         className="mt-5 rounded-2xl px-5 py-5 sm:px-7 bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08]">
      <p className={EYEBROW}>Contents</p>
      <ol className="mt-3 space-y-1">
        {numbered.map(({ h, no }) => (
          <li key={h.id} className={h.level === 2 ? 'pl-7 sm:pl-8' : ''}>
            <button
              onClick={() => document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className={`group/toc flex gap-2.5 py-0.5 text-left leading-snug transition-colors
                          hover:text-[#0071E3] dark:hover:text-[#2997FF]
                          ${h.level === 1 ? 'text-[14px] sm:text-[16px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7]' : 'text-[13px] sm:text-[15px] text-secondary'}`}
            >
              <span className={`shrink-0 tabular-nums ${h.level === 1 ? 'min-w-5' : 'min-w-7'} text-secondary group-hover/toc:text-current`}>
                {no}
              </span>
              <span className="underline-offset-4 decoration-black/25 dark:decoration-white/30 group-hover/toc:underline">
                {plain(h.text)}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}

const PAGE_SIZE = 5

/** Every post, newest first (#2, #1, …), five per page; the current one is marked. */
function PostList({ current, onNavigate }: { current: Talk; onNavigate: (t: Talk) => void }) {
  const pages = Math.max(1, Math.ceil(talksNewestFirst.length / PAGE_SIZE))
  const [page, setPage] = useState(() => Math.max(0, Math.floor(talksNewestFirst.findIndex(t => t.id === current.id) / PAGE_SIZE)))
  const shown = talksNewestFirst.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <section aria-label="All presentation notes" className="mt-16">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[18px] sm:text-[22px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
          Presentation Notes
        </h2>
        <span className="text-[14px] text-secondary">{talksNewestFirst.length} posts</span>
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
                <span className="shrink-0 w-7 sm:w-8 text-[13px] sm:text-[14px] font-semibold tabular-nums text-secondary">#{t.no}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] sm:text-[16px] font-semibold leading-snug text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {t.title}
                  </span>
                  <span className="mt-1 block text-[12px] sm:text-[13px] text-secondary">
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
