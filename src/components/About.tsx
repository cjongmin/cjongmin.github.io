import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { profile } from '../data/profile'

export default function About() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const paragraphs = profile.bio.split('\n\n').filter(Boolean)

  return (
    <section id="about" ref={ref} className="py-28">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-medium text-[#0071E3] dark:text-[#2997FF] uppercase tracking-widest mb-4">
            About Me
          </p>
          <h2 className="section-title mb-10">Who I Am</h2>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-12 items-start">
          {/* Bio text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="md:col-span-3 space-y-4"
          >
            {paragraphs.map((para, i) => (
              <p key={i} className="text-[17px] leading-relaxed text-secondary">
                {para}
              </p>
            ))}
          </motion.div>

          {/* Research interests */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="md:col-span-2"
          >
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] uppercase tracking-widest mb-4">
                Research Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(interest => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 text-sm rounded-xl
                               bg-[#0071E3]/8 dark:bg-[#2997FF]/10
                               text-[#0071E3] dark:text-[#2997FF]
                               border border-[#0071E3]/15 dark:border-[#2997FF]/20
                               font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
