import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mail, Github, Linkedin, BookOpen, MapPin } from 'lucide-react'
import { profile } from '../data/profile'

const contactItems = [
  {
    icon: Mail,
    label: 'Email',
    value: profile.email,
    href: `mailto:${profile.email}`,
  },
  {
    icon: Github,
    label: 'GitHub',
    value: profile.links.github.replace('https://', ''),
    href: profile.links.github,
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'LinkedIn Profile',
    href: profile.links.linkedin,
  },
  {
    icon: BookOpen,
    label: 'Google Scholar',
    value: 'Scholar Profile',
    href: profile.links.scholar,
  },
  {
    icon: MapPin,
    label: 'Location',
    value: profile.location,
    href: undefined,
  },
]

export default function Contact() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="contact" ref={ref} className="py-28 bg-[#F5F5F7]/50 dark:bg-[#1C1C1E]/40">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-sm font-medium text-[#0071E3] dark:text-[#2997FF] uppercase tracking-widest mb-4">
            Contact
          </p>
          <h2 className="section-title">Get In Touch</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-[17px] leading-relaxed text-secondary mb-6">
              I'm always happy to chat about research, collaborations, or just to connect.
              Feel free to reach out through any of the channels below.
            </p>
            <a
              href={`mailto:${profile.email}`}
              className="btn-primary text-base px-6 py-3 rounded-xl"
            >
              <Mail size={16} />
              Send an Email
            </a>
          </motion.div>

          {/* Contact info card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="space-y-4">
              {contactItems.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#0071E3]/10 dark:bg-[#2997FF]/15
                                  flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-[#0071E3] dark:text-[#2997FF]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-secondary mb-0.5">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('mailto') ? undefined : '_blank'}
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]
                                   hover:text-[#0071E3] dark:hover:text-[#2997FF]
                                   transition-colors truncate block"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                        {value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
