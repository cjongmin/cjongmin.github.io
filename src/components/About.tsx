import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { profile } from '../data/profile'

// "[text](https://…)" inside the bio becomes a link.
function renderLinks(text: string) {
  return text.split(/(\[[^\]]+\]\([^)]+\))/).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    return m ? (
      <a
        key={i}
        href={m[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7] underline decoration-black/25 dark:decoration-white/30
                   underline-offset-[3px] hover:text-[#0071E3] dark:hover:text-[#2997FF] hover:decoration-current
                   transition-colors"
      >
        {m[1]}
      </a>
    ) : part
  })
}

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
          <p className="text-[14px] font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-3">
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
            <p key={i} className="text-[16px] sm:text-[17px] leading-relaxed text-body">
              {renderLinks(para)}
            </p>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
