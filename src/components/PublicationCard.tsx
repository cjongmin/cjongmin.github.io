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

const CONFERENCE_PREFIXES = [
  'ICASSP', 'NeurIPS', 'NIPS', 'ICML', 'ICLR', 'CVPR', 'ICCV', 'ECCV',
  'ACL', 'EMNLP', 'NAACL', 'COLING', 'Interspeech', 'AISTATS', 'UAI',
  'WACV', 'BMVC', 'SIGGRAPH', 'CHI', 'AAAI', 'IJCAI', 'KDD', 'WWW',
  'ICRA', 'IROS', 'RSS', 'CoRL', 'MICCAI', 'ISCA', 'EACL', 'FINDINGS',
]
const PREPRINT_VENUES = new Set(['arXiv', 'Preprint', 'arxiv'])

function getVenueType(pub: Publication): 'conference' | 'journal' | 'preprint' {
  if (pub.status === 'Journal') return 'journal'
  if (pub.status === 'Preprint' || PREPRINT_VENUES.has(pub.venue)) return 'preprint'
  if (pub.status === 'Conference' || pub.status === 'Workshop') return 'conference'
  if (PREPRINT_VENUES.has(pub.venue)) return 'preprint'
  const upper = pub.venue.toUpperCase()
  if (CONFERENCE_PREFIXES.some(c => upper.includes(c.toUpperCase()))) return 'conference'
  return 'journal'
}

function venueBadgeClass(type: 'conference' | 'journal' | 'preprint'): string {
  switch (type) {
    case 'conference':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
    case 'journal':
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
    case 'preprint':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'Oral':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40'
    case 'Poster':
      return 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800/40'
    case 'Spotlight':
      return 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/40'
    default:
      return 'bg-neutral-100 text-neutral-500 border border-neutral-200 dark:bg-white/[0.06] dark:text-neutral-400 dark:border-white/[0.1]'
  }
}

function parseAuthor(raw: string): { name: string; sup: string | null } {
  const match = raw.match(/^(.+?)\^(.+)$/)
  return match ? { name: match[1].trim(), sup: match[2] } : { name: raw, sup: null }
}

function toHashtag(tag: string): string {
  return '#' + tag.toLowerCase().replace(/[\s/]+/g, '-')
}

// Action buttons — clearly distinct from hashtag metadata
const BTN_BASE = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium transition-colors duration-150 border cursor-pointer select-none'
// Paper: subtle fill to signal primary action
const BTN_PRIMARY = `${BTN_BASE} bg-neutral-100 border-neutral-300 text-neutral-900 hover:bg-neutral-200 dark:bg-white/[0.11] dark:border-white/[0.28] dark:text-[#F0F0F2] dark:hover:bg-white/[0.18]`
// Others: outlined
const BTN_SECONDARY = `${BTN_BASE} bg-transparent border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-white/[0.2] dark:text-[#C7C7CB] dark:hover:bg-white/[0.08]`

export default function PublicationCard({ pub, index }: PublicationCardProps) {
  const [bibtexOpen, setBibtexOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  const venueType = getVenueType(pub)
  const isPreprint = venueType === 'preprint'

  const links = [
    pub.links?.paper   && { label: 'Paper',   icon: FileText, href: pub.links.paper },
    pub.links?.scholar && { label: 'Scholar',  icon: BookOpen, href: pub.links.scholar },
    pub.links?.code    && { label: 'Code',     icon: Code2,    href: pub.links.code },
    pub.links?.project && { label: 'Project',  icon: Globe,    href: pub.links.project },
  ].filter(Boolean) as { label: string; icon: React.ElementType; href: string }[]

  const hasTags    = !!pub.tags && pub.tags.length > 0
  const hasActions = links.length > 0 || !!pub.bibtex

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, delay: index * 0.07 }}
        className="glass-card overflow-hidden hover:shadow-md transition-shadow duration-200"
      >
        {/*
          No fixed card height — card sizes to content.
          Image container uses self-stretch on desktop to fill whatever
          height the content side naturally occupies.
        */}
        <div className="flex flex-col sm:flex-row">

          {/* Image frame — 120px on mobile, self-stretches to content height on desktop */}
          {pub.image && !imgError ? (
            <div className="h-[120px] sm:h-auto sm:self-stretch sm:w-[192px] sm:shrink-0
                            bg-neutral-50 dark:bg-zinc-900/50
                            flex items-center justify-center overflow-hidden p-2.5">
              <img
                src={pub.image}
                alt={pub.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain rounded-sm"
              />
            </div>
          ) : pub.image && imgError ? (
            <div className="h-[120px] sm:h-auto sm:self-stretch sm:w-[192px] sm:shrink-0
                            bg-neutral-50 dark:bg-zinc-900/50
                            flex items-center justify-center">
              <ImageOff size={18} className="text-secondary opacity-25" />
            </div>
          ) : null}

          {/* Content — natural vertical flow, no spacers, no fixed heights */}
          <div className="flex-1 px-5 py-4 flex flex-col gap-2 min-w-0">

            {/* 1. Venue badge + status badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full leading-none ${venueBadgeClass(venueType)}`}>
                {pub.displayVenue ?? `${pub.venue} ${pub.year}`}
              </span>
              {isPreprint && (
                <span className="text-[10px] font-medium text-amber-600/70 dark:text-amber-400/60 leading-none">
                  Preprint
                </span>
              )}
              {pub.presentationType && (
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full leading-none ${statusBadgeClass(pub.presentationType)}`}>
                  {pub.presentationType}
                </span>
              )}
            </div>

            {/* 2. Title — strongest hierarchy element */}
            <h3 className="text-[15px] font-semibold leading-snug text-[#1D1D1F] dark:text-[#F5F5F7]">
              {pub.title}
            </h3>

            {/* 3. Authors */}
            <p className="text-[13px] leading-relaxed text-[#6E6E73] dark:text-[#8E8E93]">
              {pub.authors.map((raw, i) => {
                const { name, sup } = parseAuthor(raw)
                const isMe = name === profile.name
                return (
                  <span key={i}>
                    {isMe ? (
                      <strong className="font-semibold text-[#1D1D1F] dark:text-[#E8E8ED]">
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

            {/*
              4. Hashtag metadata — only rendered if tags exist.
              When absent, action buttons flow directly after authors
              with no reserved empty space.
            */}
            {hasTags && (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                {pub.tags!.map(tag => (
                  <span
                    key={tag}
                    className="text-[11px] font-normal text-[#8E8E93] dark:text-[#636366] select-none"
                  >
                    {toHashtag(tag)}
                  </span>
                ))}
              </div>
            )}

            {/*
              5. Action buttons — clearly larger and bordered vs. hashtags.
              pt-0.5 adds modest extra separation from hashtags when present.
              No mt-auto — buttons follow the last rendered row naturally.
            */}
            {hasActions && (
              <div className={`flex flex-wrap gap-1.5${hasTags ? ' pt-0.5' : ''}`}>
                {links.map(({ label, icon: Icon, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} for ${pub.title}`}
                    className={label === 'Paper' ? BTN_PRIMARY : BTN_SECONDARY}
                  >
                    <Icon size={12} />
                    {label}
                  </a>
                ))}
                {pub.bibtex && (
                  <button
                    onClick={() => setBibtexOpen(true)}
                    aria-label={`Show BibTeX for ${pub.title}`}
                    className={BTN_SECONDARY}
                  >
                    <Quote size={12} />
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
