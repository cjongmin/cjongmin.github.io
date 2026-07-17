import { useState } from 'react'
import { Project } from '../data/projects'

interface AppIconProps {
  project: Project
  sizeClass: string // e.g. "w-16 h-16"
}

/**
 * App icon in Apple's rounded-square (squircle-approximate) style.
 * Icons are plain square images; the mask is applied here so source
 * assets never need pre-rounded corners.
 */
export default function AppIcon({ project, sizeClass }: AppIconProps) {
  const [error, setError] = useState(false)

  return (
    <div
      className={`${sizeClass} shrink-0 rounded-[22.5%] overflow-hidden
                  ring-1 ring-black/[0.08] dark:ring-white/[0.1] shadow-sm
                  flex items-center justify-center`}
      style={error ? { background: project.accentColor ?? '#5E5CE6' } : undefined}
    >
      {error ? (
        <span className="text-white font-semibold text-lg select-none">
          {project.name.charAt(0)}
        </span>
      ) : (
        <img
          src={project.icon}
          alt={`${project.name} app icon`}
          loading="lazy"
          decoding="async"
          onError={() => setError(true)}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  )
}
