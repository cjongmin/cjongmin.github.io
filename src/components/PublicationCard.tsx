import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, BookOpen, Code2, Globe, Quote, ImageOff } from 'lucide-react'
import { Publication } from '../data/publications'
import { profile } from '../data/profile'
import BibtexModal from './BibtexModal'

interface PublicationCardProps {
  pub: Publication
  index: number
}

const PREPRINT_VENUES = ['arXiv', 'Preprint']

const BASE_BTN = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 border'

function linkButtonClass(label: string): string {
  switch (label) {
    case 'Paper':
      return `${BASE_BTN} bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/60 dark:hover:bg-red-950/50`
    case 'Scholar':
      return `${BASE_BTN} bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/60 dark:hover:bg-green-950/50`
    case 'Code':
      return `${BASE_BTN} bg-neutral-600 text-white border-neutral-600 hover:bg-neutral-500 dark:bg-zinc-700 dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-600`
    case 'BibTeX':
      return `${BASE_BTN} bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/60 dark:hover:bg-blue-950/50`
    default:
      return `${BASE_BTN} bg-black/[0.05] text-secondary border-black/[0.08] hover:bg-black/[0.08] dark:bg-white/[0.07] dark:border-white/[0.1] dark:hover:bg-white/[0.1]`
  }
}

function parseAuthor(raw: string): { name: string; sup: string | null } {
  const match = raw.match(/^(.+?)\^(.+)$/)
  return match ? { name: match[1].trim(), sup: match[2] } : { name: raw, sup: null }
}

export default function PublicationCard({ pub, index }: PublicationCardProps) {
  const [bibtexOpen, setBibtexOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  const isPreprint = PREPRINT_VENUES.includes(pub.venue)

  const links = [
    pub.links?.paper && { label: 'Paper', icon: FileText, href: pub.links.paper },
    pub.links?.scholar && { label: 'Scholar', icon: BookOpen, href: pub.links.scholar },
    pub.links?.code && { label: 'Code', icon: Code2, href: pub.links.code },
    pub.links?.project && { label: 'Project', icon: Globe, href: pub.links.project },
  ].filter(Boolean) as { label: string; icon: React.ElementType; href: string }[]

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, delay: index * 0.07 }}
        className="glass-card overflow-hidden hover:shadow-md transition-shadow duration-200"
      >
        <div className="flex flex-col sm:flex-row gap-0">
          {/* Representative image */}
          {pub.image && !imgError ? (
            <div className="sm:w-[264px] sm:shrink-0 bg-neutral-50 dark:bg-zinc-900/60 flex items-center justify-center overflow-hidden p-2 rounded-l-2xl">
              <img
                src={pub.image}
                alt={pub.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain max-h-44 sm:max-h-none rounded"
              />
            </div>
          ) : pub.image && imgError ? (
            <div className="sm:w-[264px] sm:shrink-0 bg-neutral-50 dark:bg-zinc-900/60 flex items-center justify-center min-h-[80px] rounded-l-2xl">
              <ImageOff size={20} className="text-secondary opacity-30" />
            </div>
          ) : null}

          {/* Content */}
          <div className="flex-1 p-5 flex flex-col gap-3">
            {/* Venue badge + presentation type */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                isPreprint
                  ? 'bg-amber-500/10 dark:bg-amber-400/15 text-amber-700 dark:text-amber-400'
                  : 'bg-[#0071E3]/10 dark:bg-[#2997FF]/15 text-[#0071E3] dark:text-[#2997FF]'
              }`}>
                {pub.displayVenue ?? `${pub.venue} ${pub.year}`}
              </span>
              {isPreprint && (
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  Preprint
                </span>
              )}
              {pub.presentationType && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full
                                  bg-emerald-50 text-emerald-700 border border-emerald-200
                                  dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/60">
                  {pub.presentationType}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-semibold leading-snug text-[#1D1D1F] dark:text-[#F5F5F7]">
              {pub.title}
            </h3>

            {/* Authors — ^number parsed as superscript */}
            <p className="text-sm text-secondary leading-relaxed">
              {pub.authors.map((raw, i) => {
                const { name, sup } = parseAuthor(raw)
                const isMe = name === profile.name
                return (
                  <span key={i}>
                    {isMe ? (
                      <strong className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {name}{sup && <sup className="text-[9px] ml-0.5">{sup}</sup>}
                      </strong>
                    ) : (
                      <span>
                        {name}{sup && <sup className="text-[9px] ml-0.5">{sup}</sup>}
                      </span>
                    )}
                    {i < pub.authors.length - 1 && ', '}
                  </span>
                )
              })}
            </p>

            {/* Tags */}
            {pub.tags && pub.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {pub.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium
                               bg-black/[0.04] dark:bg-white/[0.06]
                               text-secondary border border-black/[0.06] dark:border-white/[0.08]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            {(links.length > 0 || pub.bibtex) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {links.map(({ label, icon: Icon, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkButtonClass(label)}
                    aria-label={`${label} for ${pub.title}`}
                  >
                    <Icon size={13} />
                    {label}
                  </a>
                ))}
                {pub.bibtex && (
                  <button
                    onClick={() => setBibtexOpen(true)}
                    className={linkButtonClass('BibTeX')}
                    aria-label={`Show BibTeX for ${pub.title}`}
                  >
                    <Quote size={13} />
                    BibTeX
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {bibtexOpen && (
        <BibtexModal
          bibtex={pub.bibtex!}
          title={pub.title}
          onClose={() => setBibtexOpen(false)}
        />
      )}
    </>
  )
}
