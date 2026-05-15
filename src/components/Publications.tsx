import { useState, useMemo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { publications, venueCategories } from '../data/publications'
import PublicationCard from './PublicationCard'

// Build filter options from actual publications
function buildFilters(pubs: typeof publications): string[] {
  const venueSet = new Set(pubs.map(p => p.venue))
  const matched = Object.keys(venueCategories).filter(cat =>
    venueCategories[cat].some(v => venueSet.has(v))
  )
  return ['All', ...matched]
}

export default function Publications() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [activeFilter, setActiveFilter] = useState('All')

  const filters = useMemo(() => buildFilters(publications), [])

  const filtered = useMemo(() => {
    const pubs = activeFilter === 'All'
      ? publications
      : publications.filter(p =>
          venueCategories[activeFilter]?.includes(p.venue)
        )

    // Group by year, sort within year by order
    const byYear: Record<number, typeof publications> = {}
    for (const pub of pubs) {
      if (!byYear[pub.year]) byYear[pub.year] = []
      byYear[pub.year].push(pub)
    }
    for (const year in byYear) {
      byYear[Number(year)].sort((a, b) => a.order - b.order)
    }
    // Sort years descending
    return Object.entries(byYear)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, pubs]) => ({ year: Number(year), pubs }))
  }, [activeFilter])

  return (
    <section id="publications" ref={ref} className="py-28 bg-[#F5F5F7]/50 dark:bg-[#1C1C1E]/40">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="text-sm font-medium text-[#0071E3] dark:text-[#2997FF] uppercase tracking-widest mb-4">
            Publications
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <h2 className="section-title">Research Papers</h2>

            {/* Filter pills */}
            {filters.length > 1 && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter publications">
                {filters.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    aria-pressed={activeFilter === f}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150
                      ${activeFilter === f
                        ? 'bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F]'
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

        {/* Publications grouped by year */}
        <motion.div
          layout
          className="space-y-12"
        >
          {filtered.length === 0 && (
            <p className="text-secondary text-center py-16">No publications found for this filter.</p>
          )}

          {filtered.map(({ year, pubs }) => (
            <div key={year}>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{year}</span>
                <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.08]" />
              </div>
              <div className="space-y-4">
                {pubs.map((pub, i) => (
                  <PublicationCard key={pub.id} pub={pub} index={i} />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
