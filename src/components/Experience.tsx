import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, ExternalLink } from 'lucide-react'
import { experiences } from '../data/experiences'

export default function Experience() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="experience" ref={ref} className="py-16 sm:py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-3">
            Experience
          </p>
          <h2 className="section-title">Research Experience</h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 sm:left-5 top-3 bottom-3 w-px bg-black/[0.08] dark:bg-white/[0.08]" />

          <div className="space-y-8">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex gap-6 sm:gap-8"
              >
                {/* Dot */}
                <div className="relative shrink-0 flex flex-col items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full
                                  bg-white dark:bg-[#1C1C1E]
                                  border border-black/[0.12] dark:border-white/[0.12]
                                  flex items-center justify-center z-10 shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#6E6E73] dark:bg-[#86868B]" />
                  </div>
                </div>

                {/* Card */}
                <div className="flex-1 pb-2">
                  <div className="glass-card p-5 hover:shadow-md transition-shadow duration-200">
                    {/* Date badge */}
                    <span className="inline-block text-xs font-medium text-secondary mb-3">
                      {exp.startDate} — {exp.endDate}
                    </span>

                    {/* Title */}
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] leading-snug">
                        {exp.title}
                      </h3>
                      {exp.link && (
                        <a
                          href={exp.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Link to ${exp.organization}`}
                          className="shrink-0 text-secondary hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>

                    {/* Organization */}
                    <p className="text-sm font-medium text-secondary mb-1">
                      {exp.organization}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-xs text-secondary mb-3">
                      <MapPin size={11} />
                      {exp.location}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-secondary leading-relaxed">
                      {exp.description}
                    </p>

                    {/* Tags */}
                    {exp.tags && exp.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {exp.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-[11px] px-2 py-0.5 rounded-full font-medium
                                       bg-black/[0.04] dark:bg-white/[0.06]
                                       text-secondary border border-black/[0.06] dark:border-white/[0.08]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
