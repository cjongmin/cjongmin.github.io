import { motion } from 'framer-motion'
import { Github, Linkedin, BookOpen, Mail } from 'lucide-react'
import { profile } from '../data/profile'
import { scrollToSection } from '../lib/utils'

const socialLinks = [
  { key: 'github', icon: Github, label: 'GitHub', href: profile.links.github },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', href: profile.links.linkedin },
  { key: 'scholar', icon: BookOpen, label: 'Scholar', href: profile.links.scholar },
]

const keywords = [
  'Vision-Language Models',
  'Representation Learning',
  'Multimodal AI',
  'Foundation Models',
  'Human-Centered AI',
]

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
    >
      {/* Subtle background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-100/40 dark:bg-blue-900/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-100/30 dark:bg-purple-900/10 blur-[100px]" />
      </div>

      <div className="section-container relative z-10 flex flex-col items-center text-center gap-8 py-24">
        {/* Avatar placeholder */}
        {profile.profileImage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-2 ring-black/[0.06] dark:ring-white/[0.1] shadow-xl"
          >
            <img
              src={profile.profileImage}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full
                       bg-gradient-to-br from-blue-100 to-purple-100
                       dark:from-blue-900/30 dark:to-purple-900/30
                       ring-2 ring-black/[0.06] dark:ring-white/[0.1]
                       shadow-xl flex items-center justify-center
                       text-4xl font-semibold text-[#0071E3] dark:text-[#2997FF]"
          >
            J
          </motion.div>
        )}

        {/* Name + title */}
        <div className="flex flex-col gap-3">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]"
          >
            {profile.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl text-secondary font-light"
          >
            {profile.title}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base text-secondary"
          >
            {profile.affiliation} · {profile.university}
          </motion.p>
        </div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex items-center gap-3 flex-wrap justify-center"
        >
          {socialLinks.map(({ key, icon: Icon, label, href }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="btn-secondary"
            >
              <Icon size={15} />
              {label}
            </a>
          ))}
          <a href={`mailto:${profile.email}`} className="btn-secondary">
            <Mail size={15} />
            Email
          </a>
        </motion.div>

        {/* Floating research keyword pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 max-w-xl mt-2"
        >
          {keywords.map((kw, i) => (
            <motion.span
              key={kw}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.07 }}
              className="px-3 py-1 text-xs font-medium rounded-full
                         bg-black/[0.04] dark:bg-white/[0.06]
                         text-secondary border border-black/[0.06] dark:border-white/[0.08]"
            >
              {kw}
            </motion.span>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.button
          onClick={() => scrollToSection('about')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 text-secondary hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors flex flex-col items-center gap-1.5 text-xs"
          aria-label="Scroll to About section"
        >
          <span>Explore</span>
          <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M7 1 L7 19 M1 13 L7 19 L13 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
          </svg>
        </motion.button>
      </div>
    </section>
  )
}
