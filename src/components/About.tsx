import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { profile } from '../data/profile'

export default function About() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const paragraphs = profile.bio.split('\n\n').filter(Boolean)

  return (
    <section id="about" ref={ref} className="py-16 sm:py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-3">
            About Me
          </p>
          <h2 className="section-title mb-8">Who I Am</h2>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-10 items-start">
          {/* Bio text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="md:col-span-3 space-y-4"
          >
            {paragraphs.map((para, i) => (
              <p key={i} className="text-[17px] leading-relaxed text-secondary">
                {para}
              </p>
            ))}
          </motion.div>

          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="md:col-span-2"
          >
            <div className="glass-card p-5 space-y-5">
              {/* Current Focus */}
              <div>
                <p className="text-[10px] font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-2.5">
                  Current Focus
                </p>
                <ul className="space-y-1.5">
                  {profile.interests.map(interest => (
                    <li key={interest} className="flex items-center gap-2 text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                      <span className="w-1 h-1 rounded-full bg-[#0071E3]/50 dark:bg-[#2997FF]/50 shrink-0" />
                      {interest}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="divider" />

              {/* Affiliation */}
              <div>
                <p className="text-[10px] font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-2.5">
                  Affiliation
                </p>
                <p className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {profile.affiliation}
                </p>
                <p className="text-sm text-secondary mt-0.5">
                  {profile.university}
                </p>
              </div>

              <div className="divider" />

              {/* Location */}
              <div>
                <p className="text-[10px] font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-2.5">
                  Location
                </p>
                <p className="text-sm text-secondary">{profile.location}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
