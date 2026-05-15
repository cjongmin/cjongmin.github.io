import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check } from 'lucide-react'

interface BibtexModalProps {
  bibtex: string
  title: string
  onClose: () => void
}

export default function BibtexModal({ bibtex, title, onClose }: BibtexModalProps) {
  const [copied, setCopied] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Focus trap & Escape key
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bibtex)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = bibtex
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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
        aria-label="BibTeX citation"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl glass-card p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#0071E3] dark:text-[#2997FF] mb-1">
                BibTeX
              </p>
              <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] line-clamp-2">
                {title}
              </h3>
            </div>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close modal"
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full
                         bg-black/[0.06] dark:bg-white/10
                         hover:bg-black/[0.1] dark:hover:bg-white/[0.15]
                         transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Bibtex code */}
          <pre className="text-xs font-mono leading-relaxed overflow-x-auto
                          bg-black/[0.03] dark:bg-white/[0.04]
                          border border-black/[0.06] dark:border-white/[0.08]
                          rounded-xl p-4 text-[#1D1D1F] dark:text-[#F5F5F7]
                          whitespace-pre-wrap break-all">
            {bibtex.trim()}
          </pre>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="mt-4 btn-primary w-full justify-center gap-2"
          >
            {copied ? (
              <>
                <Check size={14} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy BibTeX
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
