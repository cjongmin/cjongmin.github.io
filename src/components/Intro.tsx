import { motion } from 'framer-motion'
import { profile } from '../data/profile'
import { news } from '../data/news'
import { SocialIcon, SocialIconName } from './SocialIcons'

// "[text](https://…)" in the bio becomes a link.
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

// "**text**" in a news item becomes a red emphasis.
function renderEmphasis(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold text-rose-700 dark:text-rose-400">{part.slice(2, -2)}</strong>
      : part,
  )
}

const LINKS: { name: SocialIconName; label: string; href: string }[] = [
  { name: 'github',   label: 'GitHub',         href: profile.links.github },
  { name: 'linkedin', label: 'LinkedIn',       href: profile.links.linkedin },
  { name: 'scholar',  label: 'Google Scholar', href: profile.links.scholar },
  ...(profile.cvFile ? [{ name: 'cv' as const, label: 'CV (PDF)', href: profile.cvFile }] : []),
]

const EYEBROW = 'text-[14px] font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest'

/**
 * First screen: who I am on the left (photo, name, affiliation, links),
 * what I do and what's new on the right (About + Recent News).
 * Phones: a compact profile row (photo beside name), then About, then News.
 */
export default function Intro() {
  const paragraphs = profile.bio.split('\n\n').filter(Boolean)

  return (
    <section id="home" className="relative pt-24 md:pt-32 pb-10 md:pb-16">
      <div className="section-container relative z-10 grid md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)] gap-8 md:gap-12 lg:gap-16 items-start">

        {/* ---------- Left: who ---------- */}
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex md:flex-col items-center md:items-start gap-5 md:gap-0"
        >
          {profile.profileImage && (
            <img
              src={profile.profileImage}
              alt={profile.name}
              decoding="async"
              {...{ fetchpriority: 'high' }}
              className="shrink-0 w-[96px] h-[96px] md:w-[220px] md:h-[220px] lg:w-[240px] lg:h-[240px] rounded-full object-cover
                         ring-1 ring-black/[0.1] dark:ring-white/[0.12] shadow-lg"
            />
          )}

          <div className="min-w-0 md:mt-7">
            <h1 className="text-[30px] md:text-[40px] font-bold tracking-tight leading-[1.1] text-[#1D1D1F] dark:text-[#F5F5F7]">
              {profile.name}
            </h1>
            <p className="mt-1.5 md:mt-3 text-[15px] md:text-[17px] leading-snug text-secondary">{profile.title}</p>
            <p className="text-[15px] md:text-[17px] leading-snug text-secondary">{profile.affiliation} · KAIST</p>

            {/* Icon-only links */}
            <div className="mt-3 md:mt-5 flex items-center gap-5 text-[#1D1D1F] dark:text-[#F5F5F7]">
              {LINKS.map(l => (
                <a
                  key={l.name}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={l.label}
                  title={l.label}
                  className="opacity-85 hover:opacity-100 hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
                >
                  <SocialIcon name={l.name} className="w-[22px] h-[22px] md:w-[26px] md:h-[26px]" />
                </a>
              ))}
            </div>

            {/* Optional one-line status, e.g. what I'm looking for (profile.status; empty = hidden) */}
            {profile.status && (
              <p className="mt-4 inline-flex items-center gap-2 text-[15px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden />
                {profile.status}
              </p>
            )}
          </div>
        </motion.aside>

        {/* ---------- Right: about + news ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="min-w-0"
        >
          <p className={`${EYEBROW} mb-3`}>About Me</p>
          <div className="space-y-4">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-[16px] sm:text-[17px] leading-relaxed text-body">{renderLinks(para)}</p>
            ))}
          </div>

          {news.length > 0 && (
            <>
              <p className={`${EYEBROW} mt-10 mb-3`}>Recent News</p>
              <div className="glass-card divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                {news.map(item => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-0.5 sm:gap-6 px-5 py-3.5 sm:items-baseline">
                    {/* phones: date above the text so the sentence gets the full width */}
                    <span className="shrink-0 sm:w-[76px] text-[14px] font-medium text-secondary">{item.date}</span>
                    <p
                      className={`text-[15px] sm:text-[16px] leading-relaxed ${
                        item.highlight ? 'font-medium text-[#1D1D1F] dark:text-[#F5F5F7]' : 'text-body'
                      }`}
                    >
                      {renderEmphasis(item.text)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  )
}
