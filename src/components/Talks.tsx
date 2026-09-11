import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { talks, Talk } from '../data/talks'
import TalkDetail from './TalkDetail'

const HASH_PREFIX = '#talk='

function talkIdFromHash(): string | null {
  const h = window.location.hash
  return h.startsWith(HASH_PREFIX) ? decodeURIComponent(h.slice(HASH_PREFIX.length)) : null
}

// One slide = card width + the track's gap-4.
function stepSize(el: HTMLDivElement): number {
  const card = el.querySelector<HTMLElement>('[data-card]')
  return (card?.offsetWidth ?? el.clientWidth) + 16
}

// Pills sit on a dark overlay, so they are white-on-dark here.
const PILL = 'text-[12px] font-semibold px-2 py-[3px] rounded-md leading-none'

export default function Talks() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const trackRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<Talk | null>(null)
  const [canScroll, setCanScroll] = useState(false)
  const [active, setActive] = useState(0)
  const [scrolling, setScrolling] = useState(false)
  const scrollTimer = useRef<number>()
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

  // Arrows only make sense when there is more than one banner to scroll to.
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const check = () => setCanScroll(el.scrollWidth > el.clientWidth + 8)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let ticking = false
    const onScroll = () => {
      // Dots stay visible for a moment after a swipe, so touch users see them too.
      setScrolling(true)
      window.clearTimeout(scrollTimer.current)
      scrollTimer.current = window.setTimeout(() => setScrolling(false), 900)
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        setActive(Math.round(el.scrollLeft / stepSize(el)))
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.clearTimeout(scrollTimer.current)
    }
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

  const goTo = (i: number) => {
    const el = trackRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(talks.length - 1, i))
    el.scrollTo({ left: clamped * stepSize(el), behavior: 'smooth' })
  }
  const scrollByCard = (dir: 1 | -1) => goTo(active + dir)

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
          <p className="text-[13px] font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-3">
            Talks &amp; Presentations
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <h2 className="section-title">Conference · Presentation Notes</h2>
            <p className="text-sm text-secondary">
              What was asked, what mattered, what I took home.
            </p>
          </div>
        </motion.div>

        {/*
          One full-width banner per talk. Swipe / arrows move between them.
          The track bleeds to the screen edge on mobile.
        */}
        <div className="relative group/track">
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
                transition={{ duration: 0.45, delay: i * 0.06 }}
                aria-label={`Open notes for ${t.title}`}
                className="snap-center shrink-0 w-full text-left group
                           relative overflow-hidden rounded-[22px]
                           bg-neutral-200 dark:bg-zinc-900
                           ring-1 ring-black/[0.06] dark:ring-white/[0.08]
                           shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                {/* 16:9 banner, height-capped on wide screens so it never becomes a hero */}
                <div className="relative w-full aspect-video max-h-[480px]">

                  {/* Backdrop: the venue photo (or the paper figure until one exists), kept sharp */}
                  {(t.cover ?? t.image) && (
                    <img
                      src={t.cover ?? t.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover
                                 transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  )}

                  {/* Progressive blur: fades in toward the text side (see index.css) */}
                  <div className="talk-blur talk-blur-soft" />
                  <div className="talk-blur talk-blur-strong" />

                  {/*
                    Light translucent darkening so white text reads over any photo.
                    Phone: bottom gradient across the full width.
                    Desktop: right-hand panel fading in from the left.
                  */}
                  <div
                    className="absolute inset-0
                               bg-gradient-to-t from-black/70 via-black/40 via-45% to-black/0
                               sm:left-auto sm:w-[60%]
                               sm:bg-gradient-to-r sm:from-black/0 sm:via-black/45 sm:via-30% sm:to-black/60"
                  />

                  {/* Text lives inside the dark area only */}
                  <div
                    className="absolute inset-0 flex flex-col justify-end p-5
                               sm:left-auto sm:w-[45%] sm:justify-center sm:p-8 sm:pr-10
                               text-white"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`${PILL} bg-white text-[#1D1D1F]`}>{t.event}</span>
                      <span className={`${PILL} text-white/90 ring-1 ring-inset ring-white/40`}>{t.type}</span>
                      {t.upcoming && (
                        <span className={`${PILL} text-white/90 ring-1 ring-inset ring-white/40`}>Coming soon</span>
                      )}
                    </div>

                    <h3 className="mt-3 text-[17px] sm:text-[22px] font-semibold leading-snug tracking-tight line-clamp-2 sm:line-clamp-3">
                      {t.title}
                    </h3>

                    <p className="hidden sm:block mt-2 text-[13px] leading-relaxed text-white/75 line-clamp-2">
                      {t.summary}
                    </p>

                    <div className="mt-3 sm:mt-4 flex items-center justify-between gap-3 text-[13px]">
                      <span className="inline-flex items-center gap-1.5 text-white/70">
                        <CalendarDays size={12} />
                        {t.date}
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium text-white group-hover:gap-2 transition-all">
                        {t.upcoming ? 'Preview' : 'Read notes'}
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
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

          {/* Slide dots: invisible until the pointer is over the track (or a swipe is in progress) */}
          {talks.length > 1 && (
            <div
              role="tablist"
              aria-label="Slides"
              className={`pointer-events-none absolute bottom-5 left-0 right-0 flex justify-center gap-2
                          transition-opacity duration-300 group-hover/track:opacity-100
                          ${scrolling ? 'opacity-100' : 'opacity-0'}`}
            >
              {talks.map((t, i) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`pointer-events-auto w-2.5 h-2.5 rounded-full ring-1 ring-white/90 drop-shadow
                              transition-colors duration-200
                              ${i === active ? 'bg-white' : 'bg-transparent hover:bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && <TalkDetail talk={selected} onClose={close} />}
    </section>
  )
}
