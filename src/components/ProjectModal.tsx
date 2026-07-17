import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Github, Globe, ImageOff, Layers, Cpu } from 'lucide-react'
import { Project } from '../data/projects'
import AppIcon from './AppIcon'

interface ProjectModalProps {
  project: Project
  onClose: () => void
}

const CHIP = 'text-[11px] font-medium px-2.5 py-1 rounded-full bg-black/[0.05] dark:bg-white/[0.07] text-secondary border border-black/[0.05] dark:border-white/[0.07]'

function statusBadgeClass(status?: Project['status']): string {
  switch (status) {
    case 'App Store':
      return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/45 dark:text-emerald-400'
    case 'TestFlight':
      return 'bg-sky-50 text-sky-800 dark:bg-sky-950/45 dark:text-sky-400'
    default:
      return 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
  }
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  // Escape to close + lock body scroll while open
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  const paragraphs = project.description.split('\n\n').filter(Boolean)
  const screenshots = project.screenshots ?? []

  const links = [
    project.links?.appStore   && { label: 'App Store',  icon: AppStoreGlyph, href: project.links.appStore },
    project.links?.testFlight && { label: 'TestFlight', icon: AppStoreGlyph, href: project.links.testFlight },
    project.links?.github     && { label: 'GitHub',     icon: Github,        href: project.links.github },
    project.links?.website    && { label: 'Website',    icon: Globe,         href: project.links.website },
  ].filter(Boolean) as { label: string; icon: React.ElementType; href: string }[]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
        role="dialog"
        aria-modal="true"
        aria-label={project.name}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[86vh] overflow-y-auto glass-card p-6 sm:p-8 shadow-2xl"
        >
          {/* Close */}
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full
                       bg-black/[0.06] dark:bg-white/10
                       hover:bg-black/[0.1] dark:hover:bg-white/[0.15]
                       transition-colors"
          >
            <X size={14} />
          </button>

          {/* Header — icon, name, tagline, badges */}
          <div className="flex items-start gap-4 sm:gap-5 mb-5">
            <AppIcon project={project} sizeClass="w-16 h-16 sm:w-20 sm:h-20" />
            <div className="min-w-0 pt-0.5">
              <h3 className="text-lg sm:text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
                {project.name}
              </h3>
              <p className="text-[13px] sm:text-sm text-secondary mt-0.5 leading-snug">
                {project.tagline}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                {project.status && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full leading-none ${statusBadgeClass(project.status)}`}>
                    {project.status}
                  </span>
                )}
                {project.platforms.map(p => (
                  <span key={p} className="text-[10px] font-semibold px-2 py-0.5 rounded-full leading-none
                    bg-black/[0.05] dark:bg-white/[0.08] text-secondary">
                    {p}
                  </span>
                ))}
                {project.year && (
                  <span className="text-[10px] font-medium text-secondary">{project.year}</span>
                )}
              </div>
            </div>
          </div>

          {/* Screenshots — horizontal scroll */}
          {screenshots.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
              {screenshots.map(src => (
                <Screenshot key={src} src={src} alt={`${project.name} screenshot`} />
              ))}
            </div>
          )}

          {/* Description */}
          <div className="space-y-3 mb-5">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-[14px] leading-relaxed text-body">
                {para}
              </p>
            ))}
          </div>

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] font-semibold text-secondary uppercase tracking-widest mb-2">
                Key Features
              </p>
              <ul className="space-y-1.5">
                {project.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <span className="w-1 h-1 mt-2 rounded-full bg-[#0071E3]/50 dark:bg-[#2997FF]/50 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech stack + APIs */}
          {((project.techStack?.length ?? 0) > 0 || (project.apis?.length ?? 0) > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {project.techStack && project.techStack.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold text-secondary uppercase tracking-widest mb-2">
                    <Cpu size={11} /> Tech Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.map(t => <span key={t} className={CHIP}>{t}</span>)}
                  </div>
                </div>
              )}
              {project.apis && project.apis.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold text-secondary uppercase tracking-widest mb-2">
                    <Layers size={11} /> Frameworks & APIs
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.apis.map(a => <span key={a} className={CHIP}>{a}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Links */}
          {links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {links.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={label === 'App Store' ? 'btn-primary' : 'btn-secondary'}
                >
                  <Icon size={14} />
                  {label}
                </a>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Screenshot({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false)
  if (error) {
    return (
      <div className="shrink-0 h-[300px] w-[140px] rounded-xl bg-neutral-100 dark:bg-zinc-900
                      flex items-center justify-center">
        <ImageOff size={16} className="text-secondary opacity-30" />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
      className="shrink-0 h-[300px] w-auto rounded-xl border border-black/[0.06] dark:border-white/[0.08] object-contain"
    />
  )
}

// Minimal Apple-style glyph for store links (lucide has no App Store icon)
function AppStoreGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M9.5 15.5 L12 11 L14.5 15.5 M12 11 L13.6 8 M8 15.5 H16" />
    </svg>
  )
}
