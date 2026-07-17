import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
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
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-3">
            Projects
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <h2 className="section-title">Apps I've Built</h2>
            <p className="text-sm text-secondary">Indie iOS development — tap a card for details.</p>
          </div>
        </motion.div>

        {/* iOS-folder-style card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {projects.map((project, i) => (
            <motion.button
              key={project.id}
              onClick={() => setSelected(project)}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              aria-label={`Open details for ${project.name}`}
              className="glass-card rounded-[26px] p-5 sm:p-6 flex flex-col items-center text-center gap-3
                         hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <AppIcon project={project} sizeClass="w-[72px] h-[72px] sm:w-20 sm:h-20" />
              <div className="min-w-0 w-full">
                <p className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                  {project.name}
                </p>
                <p className="text-[11.5px] text-secondary leading-snug mt-0.5 line-clamp-2">
                  {project.tagline}
                </p>
              </div>
              {project.status && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full leading-none
                                 bg-black/[0.04] dark:bg-white/[0.06] text-secondary
                                 border border-black/[0.05] dark:border-white/[0.07]">
                  {project.status}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  )
}
