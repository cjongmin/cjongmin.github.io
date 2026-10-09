import { useRef, useState } from 'react'
import { m, useInView } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { projects, Project } from '../data/projects'
import AppIcon from './AppIcon'
import ProjectModal from './ProjectModal'

export default function Projects() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [selected, setSelected] = useState<Project | null>(null)

  if (projects.length === 0) return null

  return (
    <section id="projects" ref={ref} className="py-16 sm:py-24">
      <div className="section-container">
        <m.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-[14px] font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-3">
            Projects
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
            <h2 className="section-title">On-Device AI Apps</h2>
            <p className="text-[15px] text-secondary">Indie iOS apps that run vision models entirely on the phone. Tap a card for details.</p>
          </div>
        </m.div>

        {/* Compact list rows: icon, name, one-line tagline; tap for the detail sheet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projects.map((project, i) => (
            <m.button
              key={project.id}
              onClick={() => setSelected(project)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              aria-label={`Open details for ${project.name}`}
              className="group glass-card rounded-2xl px-4 py-3.5 flex items-center gap-4 text-left
                         hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <AppIcon project={project} sizeClass="w-14 h-14" />
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate">{project.name}</p>
                <p className="text-[14px] text-secondary leading-snug line-clamp-2 sm:line-clamp-1">{project.tagline}</p>
              </div>
              <ChevronRight
                size={18}
                className="shrink-0 text-secondary group-hover:translate-x-0.5 transition-transform"
                aria-hidden
              />
            </m.button>
          ))}
        </div>
      </div>

      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  )
}
