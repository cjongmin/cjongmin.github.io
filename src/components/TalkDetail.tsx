import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowUpRight, Check, Lightbulb, Link2, MessagesSquare,
  Presentation, Image as ImageIcon, Sparkles,
} from 'lucide-react'
import { Talk } from '../data/talks'
import { publications } from '../data/publications'
import { profile } from '../data/profile'

interface TalkDetailProps {
  talk: Talk
  onClose: () => void
}

const HONOURS = new Set(['Oral', 'Spotlight'])

/**
 * One talk as a blog post: eyebrow, title, byline, wide cover photo, lead
 * paragraph, then the notes. Opens over the site (no router), is addressable
 * via #talk=<id>, and closes on Back / Escape.
 */
export default function TalkDetail({ talk, onClose }: TalkDetailProps) {
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
  const extraLinks = [
    talk.links?.slides && { label: 'Slides', icon: Presentation, href: talk.links.slides },
    talk.links?.poster && { label: 'Poster', icon: ImageIcon,    href: talk.links.poster },
  ].filter(Boolean) as { label: string; icon: React.ElementType; href: string }[]

  const paragraphs = talk.body?.split('\n\n').filter(Boolean) ?? []
  const keyPoints = talk.keyPoints ?? []
  const questions = talk.questions ?? []
  const takeaways = talk.takeaways ?? []
  const hasNotes = paragraphs.length + keyPoints.length + questions.length + takeaways.length > 0
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
              Presentation Notes
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
              {talk.title}
            </h1>

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

          {/* ---------- Cover (wider than the text column) ---------- */}
          {talk.cover && (
            <figure className="section-container mt-10 sm:mt-12 !px-0 sm:!px-8">
              <img
                src={talk.cover}
                alt=""
                decoding="async"
                className="w-full aspect-[16/9] object-cover sm:rounded-2xl"
              />
            </figure>
          )}

          {/* ---------- Body ---------- */}
          <article className="section-container">
            <p className="mt-10 sm:mt-12 text-[19px] sm:text-[21px] leading-[1.6] text-[#3A3A3C] dark:text-[#D1D1D6]">
              {talk.summary}
            </p>

            {paragraphs.map((para, i) => (
              <p key={i} className="mt-6 text-[17px] leading-[1.75] text-body">{para}</p>
            ))}

            {talk.upcoming && !hasNotes ? (
              <UpcomingNotice />
            ) : (
              <>
                {keyPoints.length > 0 && (
                  <PostSection title="Key points">
                    <ol className="space-y-4">
                      {keyPoints.map((k, i) => (
                        <li key={k} className="flex gap-4">
                          <span className="shrink-0 w-7 h-7 rounded-full bg-neutral-100 dark:bg-white/[0.08]
                                           text-[13px] font-semibold flex items-center justify-center
                                           text-[#1D1D1F] dark:text-[#F5F5F7]">{i + 1}</span>
                          <span className="pt-0.5 text-[17px] leading-[1.7] text-body">{k}</span>
                        </li>
                      ))}
                    </ol>
                  </PostSection>
                )}

                {questions.length > 0 && (
                  <PostSection title="Questions from the audience">
                    <div className="space-y-8">
                      {questions.map((qa, i) => (
                        <div key={i} className="border-l-2 border-neutral-200 dark:border-white/15 pl-5">
                          <p className="text-[17px] font-semibold leading-snug text-[#1D1D1F] dark:text-[#F5F5F7]">
                            {qa.question}
                          </p>
                          <p className="mt-2 text-[17px] leading-[1.75] text-body">{qa.answer}</p>
                        </div>
                      ))}
                    </div>
                  </PostSection>
                )}

                {takeaways.length > 0 && (
                  <PostSection title="Takeaways">
                    <ul className="space-y-3">
                      {takeaways.map(t => (
                        <li key={t} className="flex gap-3 text-[17px] leading-[1.7] text-body">
                          <span className="mt-[11px] w-1.5 h-1.5 rounded-full bg-[#1D1D1F]/50 dark:bg-white/50 shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </PostSection>
                )}
              </>
            )}

            {/* ---------- The paper ---------- */}
            {paper && (
              <a
                href={paperUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-14 flex gap-4 sm:gap-5 items-center rounded-2xl p-4 sm:p-5
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

function PostSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

// One tidy note instead of three empty sections while the write-up is pending.
function UpcomingNotice() {
  const items = [
    { icon: Lightbulb,      title: 'Key points',        text: 'The core ideas of the paper, in brief.' },
    { icon: MessagesSquare, title: 'Audience questions', text: 'What people asked at the session, and my answers.' },
    { icon: Sparkles,       title: 'Takeaways',         text: 'What I took home from the discussion.' },
  ]
  return (
    <div className="mt-12 rounded-2xl p-6 sm:p-7 bg-neutral-50 dark:bg-white/[0.04]
                    border border-black/[0.05] dark:border-white/[0.08]">
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-secondary">After the conference</p>
      <p className="mt-2 text-[17px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
        The full notes will be posted here after the session.
      </p>
      <ul className="mt-6 grid gap-5 sm:grid-cols-3">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title}>
            <Icon size={18} className="text-[#1D1D1F]/70 dark:text-white/70" />
            <p className="mt-2 text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-secondary">{text}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
