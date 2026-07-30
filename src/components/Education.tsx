import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ExternalLink, GraduationCap } from 'lucide-react'
import { education } from '../data/education'

export default function Education() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="education" ref={ref} className="py-16 sm:py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-3">
            Education
          </p>
          <h2 className="section-title">Education</h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-4 sm:left-5 top-3 bottom-3 w-px bg-black/[0.08] dark:bg-white/[0.08]" />

          <div className="space-y-6">
            {education.map((edu, i) => (
              <motion.div
                key={edu.id}
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
                    <GraduationCap size={16} className="text-[#6E6E73] dark:text-[#86868B]" />
                  </div>
                </div>

                {/* Card — degree / institution / department / advisor, nothing more */}
                <div className="flex-1 pb-2">
                  <div className="glass-card p-5 hover:shadow-md transition-shadow duration-200">
                    <span className="inline-block text-xs font-medium text-secondary mb-2">
                      {edu.startDate} — {edu.endDate}
                    </span>

                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] leading-snug">
                        {edu.title}
                      </h3>
                      {edu.link && (
                        <a
                          href={edu.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Link for ${edu.title}`}
                          className="shrink-0 text-secondary hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>

                    <p className="text-sm font-medium text-secondary mt-1">
                      {edu.organization}
                    </p>
                    {edu.department && (
                      <p className="text-[13px] text-secondary mt-0.5 leading-snug">
                        {edu.department}
                      </p>
                    )}
                    {edu.advisor && (
                      <p className="text-[13px] text-body mt-1.5">
                        Advisor: <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{edu.advisor}</span>
                      </p>
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
