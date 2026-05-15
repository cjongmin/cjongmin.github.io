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

export default function PublicationCard({ pub, index }: PublicationCardProps) {
  const [bibtexOpen, setBibtexOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

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
          {/* Image */}
          {pub.image && !imgError ? (
            <div className="sm:w-44 sm:shrink-0 bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center overflow-hidden">
              <img
                src={pub.image}
                alt={pub.title}
                onError={() => setImgError(true)}
                className="w-full sm:h-full object-cover max-h-40 sm:max-h-none"
              />
            </div>
          ) : pub.image && imgError ? (
            <div className="sm:w-44 sm:shrink-0 bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center min-h-[80px]">
              <ImageOff size={20} className="text-secondary opacity-40" />
            </div>
          ) : null}

          {/* Content */}
          <div className="flex-1 p-5 flex flex-col gap-3">
            {/* Venue + year */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full
                               bg-[#0071E3]/10 dark:bg-[#2997FF]/15
                               text-[#0071E3] dark:text-[#2997FF]">
                {pub.venue} {pub.year}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-semibold leading-snug text-[#1D1D1F] dark:text-[#F5F5F7]">
              {pub.title}
            </h3>

            {/* Authors */}
            <p className="text-sm text-secondary leading-relaxed">
              {pub.authors.map((author, i) => (
                <span key={i}>
                  {author === profile.name ? (
                    <strong className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{author}</strong>
                  ) : (
                    author
                  )}
                  {i < pub.authors.length - 1 && ', '}
                </span>
              ))}
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
                    className={label === 'Paper' ? 'btn-primary' : 'btn-secondary'}
                    aria-label={`${label} for ${pub.title}`}
                  >
                    <Icon size={13} />
                    {label}
                  </a>
                ))}
                {pub.bibtex && (
                  <button
                    onClick={() => setBibtexOpen(true)}
                    className="btn-secondary"
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
