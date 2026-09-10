import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { talks, Talk } from '../data/talks'
import TalkDetail from './TalkDetail'

const HASH_PREFIX = '#talk='

function talkIdFromHash(): string | null {
  const h = window.location.hash
  return h.startsWith(HASH_PREFIX) ? decodeURIComponent(h.slice(HASH_PREFIX.length)) : null
}

const PILL = 'text-[10px] font-semibold px-2 py-0.5 rounded-full leading-none'

export default function Talks() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const trackRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<Talk | null>(null)
  const [canScroll, setCanScroll] = useState(false)
  const pushedRef = useRef(false)

  // Detail view is addressable (#talk=<id>): deep links work and the
  // browser back button closes it.
  useEffect(() => {
    const sync = () => {
      const id = talkIdFromHash()
      const t = id ? talks.find(x => x.id === id) ?? null : null
      if (!t) pushedRef.current = false
      setSelected(t)
    }
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  // Arrows only make sense when the track actually overflows.
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const check = () => setCanScroll(el.scrollWidth > el.clientWidth + 8)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const open = (t: Talk) => {
    history.pushState(null, '', HASH_PREFIX + t.id)
    pushedRef.current = true
    setSelected(t)
  }

  const close = useCallback(() => {
    if (pushedRef.current) {
      pushedRef.current = false
      history.back()                      // popstate → sync() clears selection
    } else {
      history.replaceState(null, '', window.location.pathname + window.location.search)
      setSelected(null)
    }
  }, [])

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-card]')
    const step = card ? card.offsetWidth + 16 : 320
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  if (talks.length === 0) return null

  return (
    <section id="talks" ref={ref} className="py-16 sm:py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-3">
            Talks &amp; Presentations
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <h2 className="section-title">Notes from the Podium</h2>
            <p className="text-sm text-secondary">
              What was asked, what mattered, what I took home.
            </p>
          </div>
        </motion.div>

        {/* Horizontal, swipeable track. Bleeds to the screen edge on mobile. */}
        <div className="relative">
          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2
                       -mx-6 px-6 sm:mx-0 sm:px-0
                       [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {talks.map((t, i) => (
              <motion.button
                key={t.id}
                data-card
                onClick={() => open(t)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                aria-label={`Open notes for ${t.title}`}
                className="snap-start shrink-0 w-[280px] sm:w-[340px] glass-card overflow-hidden text-left
                           flex flex-col hover:shadow-md transition-shadow duration-200 group"
              >
                {t.image && (
                  <div className="h-[128px] bg-neutral-50 dark:bg-zinc-900/50 flex items-center justify-center p-2 overflow-hidden">
                    <img
                      src={t.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="max-w-full max-h-full object-contain rounded-sm"
                    />
                  </div>
                )}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`${PILL} bg-[#1D1D1F] text-white dark:bg-[#F5F5F7] dark:text-[#1D1D1F]`}>
                      {t.event}
                    </span>
                    <span className={`${PILL} text-secondary ring-1 ring-inset ring-black/10 dark:ring-white/20`}>
                      {t.type}
                    </span>
                    {t.upcoming && (
                      <span className={`${PILL} text-[#0071E3] dark:text-[#2997FF] ring-1 ring-inset ring-[#0071E3]/30 dark:ring-[#2997FF]/30`}>
                        Coming soon
                      </span>
                    )}
                  </div>
                  <h3 className="text-[14px] font-semibold leading-snug text-[#1D1D1F] dark:text-[#F5F5F7] line-clamp-2">
                    {t.title}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-secondary line-clamp-2">
                    {t.summary}
                  </p>
                  <span className="mt-auto pt-1 inline-flex items-center gap-1 text-[12px] font-medium
                                   text-[#0071E3] dark:text-[#2997FF] group-hover:gap-2 transition-all">
                    {t.upcoming ? 'Preview' : 'Read notes'}
                    <ArrowRight size={12} />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {canScroll && (
            <>
              <button
                onClick={() => scrollByCard(-1)}
                aria-label="Previous"
                className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center
                           rounded-full bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur border border-black/[0.08] dark:border-white/[0.1]
                           shadow-sm hover:shadow-md transition-shadow"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scrollByCard(1)}
                aria-label="Next"
                className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center
                           rounded-full bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur border border-black/[0.08] dark:border-white/[0.1]
                           shadow-sm hover:shadow-md transition-shadow"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {selected && <TalkDetail talk={selected} onClose={close} />}
    </section>
  )
}
