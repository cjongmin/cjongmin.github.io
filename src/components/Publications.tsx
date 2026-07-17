import { useState, useMemo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { publications } from '../data/publications'
import PublicationCard from './PublicationCard'

// Auto-generate filters directly from venue field values in the data
function buildFilters(pubs: typeof publications): string[] {
  const venues = [...new Set(pubs.map(p => p.venue))].sort()
  return ['All', ...venues]
}

export default function Publications() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [activeFilter, setActiveFilter] = useState('All')

  const filters = useMemo(() => buildFilters(publications), [])

  const filtered = useMemo(() => {
    const pubs = activeFilter === 'All'
      ? publications
      : publications.filter(p => p.venue === activeFilter)

    const byYear: Record<number, typeof publications> = {}
    for (const pub of pubs) {
      if (!byYear[pub.year]) byYear[pub.year] = []
      byYear[pub.year].push(pub)
    }
    for (const year in byYear) {
      byYear[Number(year)].sort((a, b) => b.order - a.order)
    }
    return Object.entries(byYear)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, pubs]) => ({ year: Number(year), pubs }))
  }, [activeFilter])

  return (
    <section id="publications" ref={ref} className="py-16 sm:py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-3">
            Publications
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <h2 className="section-title">Research Papers</h2>

            {/* Filter pills — auto-generated from venue field */}
            {filters.length > 1 && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter publications">
                {filters.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    aria-pressed={activeFilter === f}
                    className={`px-3.5 py-1 rounded-full text-sm font-medium transition-all duration-150
                      ${activeFilter === f
                        ? 'bg-neutral-600 dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F]'
                        : 'bg-black/[0.06] dark:bg-white/10 text-secondary hover:bg-black/[0.1] dark:hover:bg-white/[0.15]'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-10">
          {filtered.length === 0 && (
            <p className="text-secondary text-center py-12">No publications found for this filter.</p>
          )}

          {filtered.map(({ year, pubs }) => (
            <div key={year}>
              <div className="flex items-center gap-4 mb-5">
                <span className="text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{year}</span>
                <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.08]" />
              </div>
              <div className="space-y-3">
                {pubs.map((pub, i) => (
                  <PublicationCard key={pub.id} pub={pub} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
