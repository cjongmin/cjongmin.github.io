import { motion } from 'framer-motion'
import { Github, Linkedin, BookOpen, Download } from 'lucide-react'
import { profile } from '../data/profile'
import { scrollToSection } from '../lib/utils'

const socialLinks = [
  { key: 'github', icon: Github, label: 'GitHub', href: profile.links.github },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', href: profile.links.linkedin },
  { key: 'scholar', icon: BookOpen, label: 'Scholar', href: profile.links.scholar },
]

const keywords = profile.keywords ?? []

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center overflow-hidden pt-16"
    >
      <div className="flex-1" />
      <div className="section-container relative z-10 flex flex-col items-center text-center gap-6">
        {/* Profile photo / monogram */}
        {profile.profileImage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.35 }}
            className="w-[96px] h-[96px] sm:w-[172px] sm:h-[172px] rounded-full overflow-hidden
                       ring-1 ring-black/[0.1] dark:ring-white/[0.12]
                       shadow-lg sm:shadow-xl cursor-pointer"
          >
            <img
              src={profile.profileImage}
              alt={profile.name}
              decoding="async"
              fetchPriority="high"
              className="w-full h-full object-cover"
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-14 h-14 rounded-2xl
                       bg-white dark:bg-[#1C1C1E]
                       border border-black/[0.08] dark:border-white/[0.1]
                       shadow-sm flex items-center justify-center"
          >
            <span className="text-[15px] font-semibold tracking-widest text-[#1D1D1F] dark:text-[#F5F5F7] select-none">
              JC
            </span>
          </motion.div>
        )}

        {/* Name + title */}
        <div className="flex flex-col gap-2 sm:gap-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]"
          >
            {profile.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl text-secondary font-light"
          >
            {profile.title}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="text-[11px] sm:text-sm text-secondary"
          >
            {profile.affiliation} · {profile.university}
          </motion.p>
        </div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34 }}
          className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center"
        >
          {socialLinks.map(({ key, icon: Icon, label, href }) => (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer"
               aria-label={label} className="btn-secondary">
              <Icon size={14} />
              {label}
            </a>
          ))}
          {profile.cvFile ? (
            <a
              href={profile.cvFile}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="btn-secondary"
            >
              <Download size={14} />
              CV
            </a>
          ) : (
            <span className="btn-secondary opacity-40 cursor-default pointer-events-none">
              <Download size={14} />
              CV
            </span>
          )}
        </motion.div>

        {/* Keyword chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.48 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {keywords.map((kw, i) => (
            <motion.span
              key={kw}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48 + i * 0.06 }}
              className="px-3 py-1 text-xs font-medium rounded-full
                         bg-black/[0.04] dark:bg-white/[0.06]
                         text-secondary border border-black/[0.05] dark:border-white/[0.07]"
            >
              {kw}
            </motion.span>
          ))}
        </motion.div>

      </div>

      <div className="flex-1" />

      {/* Scroll cue — floats between content and bottom of hero */}
      <motion.button
        onClick={() => scrollToSection('about')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="relative z-10 mb-12 text-secondary hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors flex flex-col items-center gap-1.5 text-xs"
        aria-label="Scroll to About section"
      >
        <span>Explore</span>
        <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
          <motion.path
            d="M7 1 L7 19 M1 13 L7 19 L13 13"
            stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
        </svg>
      </motion.button>
    </section>
  )
}
