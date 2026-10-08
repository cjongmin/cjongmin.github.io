import { useState } from 'react'
import { BookOpen, Code2, FileText, Globe, Presentation, Quote, Image as ImageIcon } from 'lucide-react'
import { Publication, PublicationLink } from '../data/publications'
import BibtexModal from './BibtexModal'

type Links = PublicationLink & { slides?: string }

interface PaperLinksProps {
  pub: Publication
  links?: Links          // defaults to pub.links; a talk can add slides or override a link
  className: string      // button style, shared by the links and the BibTeX button
  iconSize: number
}

/**
 * Paper · Scholar · Code · Project · Poster · Slides · BibTeX — whichever exist, in that order.
 * Used by the publication cards and at the bottom of every talk post.
 */
export default function PaperLinks({ pub, links = pub.links ?? {}, className, iconSize }: PaperLinksProps) {
  const [bibtexOpen, setBibtexOpen] = useState(false)
  const items = [
    links.paper   && { label: 'Paper',   icon: FileText,     href: links.paper },
    links.scholar && { label: 'Scholar', icon: BookOpen,     href: links.scholar },
    links.code    && { label: 'Code',    icon: Code2,        href: links.code },
    links.project && { label: 'Project', icon: Globe,        href: links.project },
    links.poster  && { label: 'Poster',  icon: Presentation, href: links.poster },
    links.slides  && { label: 'Slides',  icon: ImageIcon,    href: links.slides },
  ].filter(Boolean) as { label: string; icon: React.ElementType; href: string }[]

  if (items.length === 0 && !pub.bibtex) return null
  return (
    <>
      {items.map(({ label, icon: Icon, href }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer"
           aria-label={`${label} for ${pub.title}`} className={className}>
          <Icon size={iconSize} />
          {label}
        </a>
      ))}
      {pub.bibtex && (
        <button onClick={() => setBibtexOpen(true)} aria-label={`Show BibTeX for ${pub.title}`} className={className}>
          <Quote size={iconSize} />
          BibTeX
        </button>
      )}
      {bibtexOpen && pub.bibtex && (
        <BibtexModal bibtex={pub.bibtex} title={pub.title} onClose={() => setBibtexOpen(false)} />
      )}
    </>
  )
}
