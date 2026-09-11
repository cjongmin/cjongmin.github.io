import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, FileText, Presentation, Image as ImageIcon, MapPin, CalendarDays } from 'lucide-react'
import { Talk } from '../data/talks'
import { publications } from '../data/publications'

interface TalkDetailProps {
  talk: Talk
  onClose: () => void
}

const PILL = 'text-[13px] font-semibold px-2.5 py-1 rounded-md leading-none'

/**
 * Full-screen "page" for one talk. Opens over the site (no router needed),
 * is addressable via #talk=<id>, and closes on Back / Escape.
 */
export default function TalkDetail({ talk, onClose }: TalkDetailProps) {
  const backRef = useRef<HTMLButtonElement>(null)

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

  const links = [
    paperUrl           && { label: 'Paper',  icon: FileText,     href: paperUrl },
    talk.links?.slides && { label: 'Slides', icon: Presentation, href: talk.links.slides },
    talk.links?.poster && { label: 'Poster', icon: ImageIcon,    href: talk.links.poster },
  ].filter(Boolean) as { label: string; icon: React.ElementType; href: string }[]

  const hasKeyPoints = (talk.keyPoints?.length ?? 0) > 0
  const hasQuestions = (talk.questions?.length ?? 0) > 0
  const hasTakeaways = (talk.takeaways?.length ?? 0) > 0

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
              Talks &amp; Presentations
            </span>
          </div>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="section-container py-10 sm:py-14"
        >
          <div className="max-w-[760px]">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className={`${PILL} bg-[#1D1D1F] text-white dark:bg-[#F5F5F7] dark:text-[#1D1D1F]`}>{talk.event}</span>
              <span className={`${PILL} text-secondary ring-1 ring-inset ring-black/10 dark:ring-white/20`}>{talk.type}</span>
              <span className={`${PILL} text-secondary ring-1 ring-inset ring-black/10 dark:ring-white/20`}>{talk.role}</span>
              {talk.upcoming && (
                <span className={`${PILL} text-[#0071E3] dark:text-[#2997FF] ring-1 ring-inset ring-[#0071E3]/30 dark:ring-[#2997FF]/30`}>
                  Upcoming
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              {talk.title}
            </h1>

            {/* Meta */}
            <div className="mt-3 flex flex-col gap-1 text-[13px] text-secondary">
              {talk.eventFull && <p className="italic">{talk.eventFull}</p>}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} />{talk.date}</span>
                {talk.location && <span className="inline-flex items-center gap-1.5"><MapPin size={13} />{talk.location}</span>}
              </div>
            </div>

            {links.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {links.map(({ label, icon: Icon, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                    <Icon size={14} />
                    {label}
                  </a>
                ))}
              </div>
            )}

            {talk.upcoming && (
              <div className="mt-8 glass-card p-5 border-l-[3px] border-l-[#0071E3] dark:border-l-[#2997FF]">
                <p className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  First write-up coming soon
                </p>
                <p className="mt-1 text-sm text-body leading-relaxed">
                  This page will be filled in after the presentation with the questions raised at the session,
                  the key points of the paper, and what I took away from the discussion.
                </p>
              </div>
            )}

            <p className="mt-8 text-[16px] leading-relaxed text-body">{talk.summary}</p>

            <Section title="Key points" empty={!hasKeyPoints} upcoming={talk.upcoming}>
              <ul className="space-y-2">
                {talk.keyPoints?.map(k => (
                  <li key={k} className="flex items-start gap-2.5 text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#0071E3]/60 dark:bg-[#2997FF]/60 shrink-0" />
                    {k}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Questions from the audience" empty={!hasQuestions} upcoming={talk.upcoming}>
              <dl className="space-y-5">
                {talk.questions?.map((qa, i) => (
                  <div key={i}>
                    <dt className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Q. {qa.question}</dt>
                    <dd className="mt-1 text-[15px] leading-relaxed text-body">{qa.answer}</dd>
                  </div>
                ))}
              </dl>
            </Section>

            <Section title="Takeaways" empty={!hasTakeaways} upcoming={talk.upcoming}>
              <ul className="space-y-2">
                {talk.takeaways?.map(t => (
                  <li key={t} className="flex items-start gap-2.5 text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#0071E3]/60 dark:bg-[#2997FF]/60 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </motion.article>
      </motion.div>
    </AnimatePresence>
  )
}

function Section({
  title, empty, upcoming, children,
}: { title: string; empty: boolean; upcoming: boolean; children: React.ReactNode }) {
  if (empty && !upcoming) return null
  return (
    <section className="mt-10">
      <h2 className="text-[13px] font-semibold text-secondary uppercase tracking-widest mb-3">{title}</h2>
      {empty
        ? <p className="text-sm italic text-secondary/70">Will be posted after the session.</p>
        : children}
    </section>
  )
}
