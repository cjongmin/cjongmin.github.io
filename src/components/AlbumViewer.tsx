import { TouchEvent, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { photoSrcSet, photoUrl, GalleryAlbum } from '../data/gallery'
import Lightbox from './Lightbox'

const STAGE_SIZES = '(min-width: 2100px) 50vw, (min-width: 1164px) 1036px, 100vw'
const SHEET_FROM = 12       // with this many photos, a contact sheet of all of them follows the large view
const SLIDE_MS = 4000

/**
 * One album: the chosen photo large and whole (never cropped), a row of thumbnails to pick from,
 * and its caption and number. Arrow keys and swipes move between photos and nothing advances by
 * itself unless the visitor ticks Slideshow. The address names the photo (#id), so a photo can
 * be linked; a click enlarges it.
 */
export default function AlbumViewer({ album }: { album: GalleryAlbum }) {
  const { photos } = album
  const [index, setIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [captions, setCaptions] = useState(true)
  const [slideshow, setSlideshow] = useState(false)
  const stripRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const photo = photos[index]

  const go = useCallback((i: number) => {
    const next = (i + photos.length) % photos.length
    setIndex(next)
    history.replaceState(null, '', `#${photos[next].id}`)
  }, [photos])

  // Opening a link to one photo. In an effect: the prerendered page shows the first one.
  useEffect(() => {
    const sync = () => {
      const i = photos.findIndex(p => p.id === decodeURIComponent(location.hash.slice(1)))
      if (i >= 0) setIndex(i)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [photos])

  useEffect(() => {
    if (zoomed || photos.length < 2) return
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return     // Alt+Left is the browser's Back
      if (e.key === 'ArrowLeft') go(index - 1)
      if (e.key === 'ArrowRight') go(index + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index, photos.length, zoomed])

  useEffect(() => {
    if (!slideshow || zoomed || photos.length < 2) return
    const timer = setTimeout(() => go(index + 1), SLIDE_MS)
    return () => clearTimeout(timer)
  }, [go, index, photos.length, slideshow, zoomed])

  // The neighbours load ahead so moving feels immediate on a slow connection, and the chosen
  // thumbnail stays in view (moving only the strip, never the page).
  useEffect(() => {
    if (photos.length > 1) {
      for (const p of [photos[(index + 1) % photos.length], photos[(index - 1 + photos.length) % photos.length]]) {
        const ahead = new Image()
        ahead.sizes = STAGE_SIZES
        ahead.srcset = photoSrcSet(album, p)
      }
    }
    const strip = stripRef.current
    const thumb = strip?.querySelector<HTMLElement>('[aria-current="true"]')
    if (strip && thumb) strip.scrollTo({ left: thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2, behavior: 'smooth' })
  }, [album, index, photos])

  const onTouchStart = (e: TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const onTouchEnd = (e: TouchEvent) => {
    if (!touch.current) return
    const dx = e.changedTouches[0].clientX - touch.current.x
    const dy = e.changedTouches[0].clientY - touch.current.y
    touch.current = null
    if (photos.length > 1 && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1))
  }

  const arrow = 'absolute top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full ' +
    'bg-white/90 dark:bg-black/60 backdrop-blur shadow-sm border border-black/[0.08] dark:border-white/[0.16] ' +
    'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-white dark:hover:bg-black transition-colors'

  return (
    <>
      <div
        ref={stageRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="gal-stage relative mx-3 sm:mx-5 mt-3 sm:mt-5 h-[38vh] min-h-[260px] sm:h-[50vh] p-2 sm:p-4 rounded-xl touch-pan-y select-none"
      >
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={`Enlarge: ${photo.alt}`}
          className="w-full h-full flex items-center justify-center cursor-zoom-in"
        >
          <img
            key={photo.id}
            src={photoUrl(album, photo, photo.widths[1] ?? photo.widths[0])}
            srcSet={photoSrcSet(album, photo)}
            sizes={STAGE_SIZES}
            width={photo.width}
            height={photo.height}
            alt={photo.alt}
            decoding="async"
            style={{ backgroundColor: photo.color }}
            className="gal-fade max-w-full max-h-full w-auto h-auto rounded-md shadow-md"
          />
        </button>
        {photos.length > 1 && (
          <>
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous photo" className={`${arrow} left-2 sm:left-4`}>
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next photo" className={`${arrow} right-2 sm:right-4`}>
              <ChevronRight size={18} aria-hidden />
            </button>
          </>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-4 px-4 sm:px-6 py-3">
        <p className="min-w-0 text-[15px] leading-snug text-body">{captions && photo.caption}</p>
        <p aria-live={slideshow ? 'off' : 'polite'} className="shrink-0 text-[14px] tabular-nums text-secondary">{index + 1} / {photos.length}</p>
      </div>

      {photos.length > 1 && (
        <div ref={stripRef} className="relative flex gap-2.5 overflow-x-auto px-4 sm:px-6 pt-0.5 pb-3">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show photo ${i + 1}: ${p.alt}`}
              aria-current={i === index}
              style={{ backgroundColor: p.color }}
              className={`relative shrink-0 w-20 h-16 sm:w-24 sm:h-[72px] my-1 overflow-hidden rounded-lg transition-opacity
                ${i === index ? 'gal-thumb-on' : 'opacity-60 hover:opacity-100'}`}
            >
              <img src={photoUrl(album, p)} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {photos.length >= SHEET_FROM && (
        <div className="px-4 sm:px-6 pt-1 pb-5 border-t border-black/[0.08] dark:border-white/[0.1]">
          <p className="mt-3.5 mb-3 text-[15px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">All photos</p>
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-2.5">
            {photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { go(i); stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}
                aria-label={`Show photo ${i + 1}: ${p.alt}`}
                style={{ backgroundColor: p.color, aspectRatio: `${p.width} / ${p.height}` }}
                className="block w-full mb-2.5 overflow-hidden rounded-lg break-inside-avoid hover:opacity-85 transition-opacity"
              >
                <img src={photoUrl(album, p, p.widths[Math.min(1, p.widths.length - 1)])} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-7 gap-y-2 px-4 sm:px-6 py-3.5 border-t border-black/[0.08] dark:border-white/[0.1]">
        <label className="gal-check">
          <input type="checkbox" checked={captions} onChange={e => setCaptions(e.target.checked)} />
          <span aria-hidden><Check size={14} strokeWidth={3} /></span>
          Captions
        </label>
        {photos.length > 1 && (
          <label className="gal-check">
            <input type="checkbox" checked={slideshow} onChange={e => setSlideshow(e.target.checked)} />
            <span aria-hidden><Check size={14} strokeWidth={3} /></span>
            Slideshow
          </label>
        )}
        {photos.length > 1 && <span className="ml-auto hidden sm:inline text-[14px] text-secondary">← → to browse</span>}
      </div>

      <AnimatePresence>
        {zoomed && (
          <Lightbox
            image={{ src: photoUrl(album, photo, photo.widths[photo.widths.length - 1]), alt: photo.caption ?? photo.alt, chart: false }}
            onClose={() => setZoomed(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
