import { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import { X } from 'lucide-react'

export interface LightboxImage {
  src: string
  alt: string
  chart: boolean   // charts sit on white so their axes stay readable
}

/**
 * A post image enlarged in place: fades and scales in; Escape, the X or a click
 * outside closes it. On a narrow screen a wide image (a diagram, a row of plots)
 * is shown taller and pans sideways instead of shrinking to the screen width.
 */
export default function Lightbox({ image, onClose }: { image: LightboxImage; onClose: () => void }) {
  const [pan, setPan] = useState(false)
  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    setPan(w / h > 1.8 && window.innerWidth < 640)
  }

  useEffect(() => {
    // capture phase + stop: Escape closes the picture, not the post underneath
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [onClose])

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center
                 p-3 sm:p-8 cursor-zoom-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={image.alt || 'Image'}
    >
      <button
        onClick={onClose}
        aria-label="Close image"
        className="absolute top-3 right-3 sm:top-5 sm:right-5 w-10 h-10 rounded-full flex items-center justify-center
                   bg-white/15 hover:bg-white/25 text-white transition-colors"
      >
        <X size={18} />
      </button>
      <m.figure
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
        className="max-w-[min(1400px,100%)] max-h-full flex flex-col items-center"
      >
        <div
          className={pan ? 'w-[calc(100vw-1.5rem)] overflow-x-auto rounded-xl cursor-auto' : 'contents'}
          onClick={pan ? e => e.stopPropagation() : undefined}   // swiping to pan must not close it
        >
          <img
            src={image.src}
            alt={image.alt}
            onLoad={onLoad}
            className={`${pan ? 'h-[46vh] w-auto max-w-none' : 'max-w-full max-h-[78vh] sm:max-h-[82vh]'}
                        object-contain rounded-xl shadow-2xl ${image.chart ? 'bg-white p-2 sm:p-4' : ''}`}
          />
        </div>
        {pan && <p className="mt-2 text-[13px] text-white/60">Swipe to see the whole figure</p>}
        {image.alt && (
          <figcaption className="mt-3 max-w-[760px] px-2 text-center text-[14px] leading-relaxed text-white/80">
            {image.alt}
          </figcaption>
        )}
      </m.figure>
    </m.div>
  )
}
