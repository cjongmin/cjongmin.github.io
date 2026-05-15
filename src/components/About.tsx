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

        {/* Bio text — full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="max-w-2xl space-y-4 mb-10"
        >
          {paragraphs.map((para, i) => (
            <p key={i} className="text-[17px] leading-relaxed text-secondary">
              {para}
            </p>
          ))}
        </motion.div>

        {/* 3-column info row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Current Focus */}
          <div className="glass-card p-5">
            <p className="text-[10px] font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-3">
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

          {/* Affiliation */}
          <div className="glass-card p-5">
            <p className="text-[10px] font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-3">
              Affiliation
            </p>
            <p className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
              {profile.affiliation}
            </p>
            <p className="text-sm text-secondary mt-0.5 leading-snug">
              {profile.university}
            </p>
          </div>

          {/* Location */}
          <div className="glass-card p-5">
            <p className="text-[10px] font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-3">
              Location
            </p>
            <p className="text-sm text-secondary">{profile.location}</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
