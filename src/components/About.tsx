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
          className="space-y-4"
        >
          {paragraphs.map((para, i) => (
            <p key={i} className="text-[15px] sm:text-[17px] leading-relaxed text-body text-justify">
              {para}
            </p>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
