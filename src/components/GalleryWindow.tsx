import { ReactNode } from 'react'

export interface PathPart {
  label: string
  href?: string
}

/**
 * The frame of the gallery pages: a window from an older computer, with a pinstriped title
 * bar and a close box that goes up one level, a path line, and a status line at the bottom.
 */
export default function GalleryWindow({ title, up, path, status, children }: {
  title: string
  up: string
  path: PathPart[]
  status: ReactNode
  children: ReactNode
}) {
  return (
    <div className="gal-window">
      <div className="gal-titlebar">
        <a href={up} aria-label="Close this window" title="Close" className="gal-closebox" />
        <span className="gal-plate">{title}</span>
      </div>
      <nav aria-label="Folder path" className="gal-mono gal-pathbar">
        {path.map((part, i) => (
          <span key={part.label} className="inline-flex items-center gap-1.5 min-w-0">
            {i > 0 && <span aria-hidden className="opacity-50">/</span>}
            {part.href
              ? <a href={part.href} className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">{part.label}</a>
              : <span aria-current="page" className="truncate text-[#1D1D1F] dark:text-[#F5F5F7]">{part.label}</span>}
          </span>
        ))}
      </nav>
      {children}
      <div className="gal-mono gal-statusbar">{status}</div>
    </div>
  )
}
