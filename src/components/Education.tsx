import { useRef } from 'react'
import { m, useInView } from 'framer-motion'
import { ExternalLink, GraduationCap } from 'lucide-react'
import { education } from '../data/education'
import { teaching } from '../data/teaching'

export default function Education() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="education" ref={ref} className="py-16 sm:py-24">
      <div className="section-container">
        <m.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-[14px] font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-3">
            Education
          </p>
          <h2 className="section-title">Education &amp; Teaching</h2>
        </m.div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-4 sm:left-5 top-3 bottom-3 w-px bg-black/[0.08] dark:bg-white/[0.08]" />

          <div className="space-y-6">
            {education.map((edu, i) => (
              <m.div
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
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[14px] font-medium text-secondary">
                        {edu.endDate ? `${edu.startDate} — ${edu.endDate}` : `Starting ${edu.startDate}`}
                      </span>
                      {edu.status && (
                        <span className="text-[12px] font-semibold px-2 py-[3px] rounded-md leading-none
                                         bg-emerald-50 text-emerald-700 border border-emerald-200
                                         dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/20">
                          {edu.status}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[17px] sm:text-[18px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] leading-snug">
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

                    <p className="text-[15px] font-medium text-secondary mt-1">
                      {edu.organization}
                    </p>
                    {edu.department && (
                      <p className="text-[15px] text-secondary mt-0.5 leading-snug">
                        {edu.department}
                      </p>
                    )}
                    {edu.advisor && (
                      <p className="text-[15px] text-body mt-1.5">
                        Advisor: <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{edu.advisor}</span>
                      </p>
                    )}
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>

        {/* Teaching — compact rows under the degrees */}
        {teaching.length > 0 && (
          <div className="mt-12">
            <h3 className="text-[14px] font-semibold uppercase tracking-widest text-secondary mb-4">Teaching</h3>
            <div className="glass-card divide-y divide-black/[0.05] dark:divide-white/[0.06]">
              {teaching.map(t => (
                <div key={t.id} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 px-5 py-4">
                  <span className="shrink-0 sm:w-[110px] text-[14px] font-medium text-secondary">{t.term}</span>
                  <div className="min-w-0">
                    <p className="text-[16px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] leading-snug">{t.course}</p>
                    <p className="mt-0.5 text-[15px] text-secondary">
                      {[t.role, t.institution, t.instructor && `Instructor: ${t.instructor}`].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
