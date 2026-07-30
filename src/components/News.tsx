import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { news } from '../data/news'

export default function News() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  if (news.length === 0) return null

  return (
    <section id="news" ref={ref} className="py-16 sm:py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-3">
            News
          </p>
          <h2 className="section-title">Recent News</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="glass-card divide-y divide-black/[0.05] dark:divide-white/[0.06]"
        >
          {news.map(item => (
            <div key={item.id} className="flex gap-4 sm:gap-6 px-5 py-3.5 items-baseline">
              <span className="shrink-0 w-[74px] text-xs font-medium text-secondary">
                {item.date}
              </span>
              <p
                className={`text-[14px] sm:text-[15px] leading-relaxed ${
                  item.highlight
                    ? 'font-medium text-[#1D1D1F] dark:text-[#F5F5F7]'
                    : 'text-body'
                }`}
              >
                {item.text}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
