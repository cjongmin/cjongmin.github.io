import { ReactNode } from 'react'

export interface PathPart {
  label: string
  href?: string
}

/**
 * The frame of the gallery pages: a desktop window with the path in its title bar. The red
 * light closes it, going up one level; the other two are only there to look right.
 */
export default function GalleryWindow({ up, path, tone, children }: {
  up: string
  path: PathPart[]
  tone: string
  children: ReactNode
}) {
  return (
    <div className={`gal-window ${tone}`}>
      <div className="gal-titlebar">
        <div className="flex items-center gap-2 shrink-0">
          <a href={up} aria-label="Close this window" title="Close" className="gal-light gal-light-red">
            <svg viewBox="0 0 10 10" aria-hidden><path d="M2.8 2.8l4.4 4.4m0-4.4L2.8 7.2" /></svg>
          </a>
          <span aria-hidden className="gal-light gal-light-yellow" />
          <span aria-hidden className="gal-light gal-light-green" />
        </div>
        <nav aria-label="Folder path" className="min-w-0 flex items-center gap-1.5 text-[14px] text-secondary">
          {path.map((part, i) => (
            <span key={part.label} className={`inline-flex items-center gap-1.5 ${i === path.length - 1 ? 'min-w-0' : 'shrink-0'}`}>
              {i > 0 && <span aria-hidden className="opacity-50">/</span>}
              {part.href
                ? <a href={part.href} className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">{part.label}</a>
                : <span aria-current="page" className="truncate">{part.label}</span>}
            </span>
          ))}
        </nav>
      </div>
      {children}
    </div>
  )
}
