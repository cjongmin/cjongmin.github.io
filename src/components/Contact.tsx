import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mail, Github, Linkedin, BookOpen, MapPin, ExternalLink } from 'lucide-react'
import { profile } from '../data/profile'

const contactItems = [
  {
    icon: Mail,
    label: 'Email',
    value: profile.email,
    href: `mailto:${profile.email}`,
    primary: true,
  },
  {
    icon: Github,
    label: 'GitHub',
    value: profile.links.github.replace('https://', ''),
    href: profile.links.github,
    primary: false,
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'linkedin.com/in/cjongmin',
    href: profile.links.linkedin,
    primary: false,
  },
  {
    icon: BookOpen,
    label: 'Google Scholar',
    value: 'Scholar Profile',
    href: profile.links.scholar,
    primary: false,
  },
  {
    icon: MapPin,
    label: 'Location',
    value: profile.location,
    href: undefined,
    primary: false,
  },
]

export default function Contact() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="contact" ref={ref} className="py-16 sm:py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-3">
            Contact
          </p>
          <h2 className="section-title">Get In Touch</h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[17px] leading-relaxed text-secondary mb-10 max-w-2xl"
        >
          I'm always happy to chat about research, collaborations, or just to connect.
          Feel free to reach out through any of the channels below.
        </motion.p>

        {/* Contact grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="grid grid-cols-2 sm:grid-cols-5 gap-3"
        >
          {contactItems.map(({ icon: Icon, label, value, href, primary }, i) => {
            const inner = (
              <>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                  ${primary
                    ? 'bg-[#0071E3]/10 dark:bg-[#2997FF]/15'
                    : 'bg-black/[0.05] dark:bg-white/[0.07]'
                  }`}>
                  <Icon size={16} className={primary ? 'text-[#0071E3] dark:text-[#2997FF]' : 'text-secondary'} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-secondary mb-0.5">{label}</p>
                  <p className={`text-sm font-medium truncate
                    ${primary ? 'text-[#0071E3] dark:text-[#2997FF]' : 'text-[#1D1D1F] dark:text-[#F5F5F7]'}`}>
                    {value}
                  </p>
                </div>
                {href && !href.startsWith('mailto') && (
                  <ExternalLink size={13} className="text-secondary/50 shrink-0 self-center" />
                )}
              </>
            )

            return href ? (
              <motion.a
                key={label}
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.22 + i * 0.06 }}
                className="glass-card p-4 flex items-center gap-3 hover:shadow-md transition-shadow duration-200 group"
              >
                {inner}
              </motion.a>
            ) : (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.22 + i * 0.06 }}
                className="glass-card p-4 flex items-center gap-3"
              >
                {inner}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
