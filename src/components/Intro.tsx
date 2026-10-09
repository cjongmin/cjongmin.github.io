import { m } from 'framer-motion'
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
 * First screen: who I am on the left (photo, name, affiliation, links; centred),
 * About Me on the right, and Recent News below both at full width.
 * Phones and tablets (below lg): the centred profile, then About, then News.
 */
export default function Intro() {
  const paragraphs = profile.bio.split('\n\n').filter(Boolean)

  return (
    <section id="home" className="relative pt-24 md:pt-32 pb-10 md:pb-16">
      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-8 md:gap-10 lg:gap-16 items-start lg:items-stretch">

          {/* ---------- Left: who ---------- */}
          <m.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            {profile.profileImage && (
              <img
                src={profile.profileImage}
                alt={profile.name}
                decoding="async"
                {...{ fetchpriority: 'high' }}
                className="w-[132px] h-[132px] md:w-[168px] md:h-[168px] lg:w-[208px] lg:h-[208px] rounded-full object-cover
                           ring-1 ring-black/[0.1] dark:ring-white/[0.12] shadow-lg"
              />
            )}

            <h1 className="mt-5 md:mt-6 lg:mt-7 text-[30px] md:text-[36px] lg:text-[40px] font-bold tracking-tight leading-[1.1] text-[#1D1D1F] dark:text-[#F5F5F7]">
              {profile.name}
            </h1>
            <p className="mt-2 md:mt-3 text-[16px] md:text-[17px] leading-snug text-secondary">{profile.title}</p>
            <p className="text-[16px] md:text-[17px] leading-snug text-secondary">{profile.affiliation}</p>

            {/* lg+: the column stretches to the About text's height and this spacer
                pushes the icons down, so they line up with the last line of About Me
                (mb-[3px] centres the 26px icons on that line's 29.75px line box) */}
            <div aria-hidden className="hidden lg:block lg:flex-1" />

            {/* Icon-only links */}
            <div className="mt-4 md:mt-5 lg:mb-[3px] flex items-center justify-center gap-5 text-[#1D1D1F] dark:text-[#F5F5F7]">
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
                  <SocialIcon name={l.name} className="w-[24px] h-[24px] md:w-[26px] md:h-[26px]" />
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
          </m.aside>

          {/* ---------- Right: about ---------- */}
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="min-w-0"
          >
            <p className={`${EYEBROW} mb-3`}>About Me</p>
            <div className="space-y-4">
              {paragraphs.map((para, i) => (
                // Justified. Phones may hyphenate long words (10+ letters) so the
                // narrow column doesn't open wide gaps; wider screens never hyphenate.
                <p key={i} className="text-[15px] sm:text-[17px] leading-[1.75] text-body text-justify
                                      hyphens-auto [hyphenate-limit-chars:10_4_4] sm:hyphens-manual">
                  {renderLinks(para)}
                </p>
              ))}
            </div>
          </m.div>
        </div>

        {/* ---------- Below both columns: news, full width ---------- */}
        {news.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 md:mt-16"
          >
            <p className={`${EYEBROW} mb-3`}>Recent News</p>
            <div className="glass-card divide-y divide-black/[0.05] dark:divide-white/[0.06]">
              {news.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-0.5 sm:gap-6 px-5 py-3.5 sm:items-baseline">
                  {/* phones: date above the text so the sentence gets the full width */}
                  <span className="shrink-0 sm:w-[76px] text-[14px] font-medium text-secondary">{item.date}</span>
                  <p
                    className={`text-[14px] sm:text-[16px] leading-relaxed ${
                      item.highlight ? 'font-medium text-[#1D1D1F] dark:text-[#F5F5F7]' : 'text-body'
                    }`}
                  >
                    {renderEmphasis(item.text)}
                  </p>
                </div>
              ))}
            </div>
          </m.div>
        )}
      </div>
    </section>
  )
}
