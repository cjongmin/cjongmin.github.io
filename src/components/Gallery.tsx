import { useRef } from 'react'
import { m, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { albumPath, albumTone, photoSrcSet, photoUrl, GalleryAlbumInfo, GalleryPhoto } from '../data/gallery'
import featuredData from '../data/gallery-home.json'
import FolderGlyph from './FolderGlyph'

const featured = featuredData as { album: GalleryAlbumInfo; photo: GalleryPhoto }[]

const LEAD_SIZES = '(min-width: 2100px) 33vw, (min-width: 1164px) 700px, (min-width: 640px) 66vw, 100vw'
const SIDE_SIZES = '(min-width: 2100px) 17vw, (min-width: 1164px) 350px, (min-width: 640px) 33vw, 50vw'

function Tile({ album, photo, sizes, className }: { album: GalleryAlbumInfo; photo: GalleryPhoto; sizes: string; className: string }) {
  return (
    <a
      href={`${albumPath(album)}#${photo.id}`}
      style={{ backgroundColor: photo.color }}
      className={`group relative block overflow-hidden rounded-2xl ring-1 ring-black/[0.06] dark:ring-white/[0.08] ${className}`}
    >
      <img
        src={photoUrl(album, photo, photo.widths[1] ?? photo.widths[0])}
        srcSet={photoSrcSet(album, photo)}
        sizes={sizes}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        style={photo.position ? { objectPosition: photo.position } : undefined}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
    </a>
  )
}

/**
 * The home-page door to the albums: one large photo and up to two small ones, with the words
 * outside the pictures so it reads differently from the talk banners above. The photos come
 * from "featured" in gallery/gallery.json.
 */
export default function Gallery() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  if (featured.length === 0) return null
  const [lead, ...rest] = featured.slice(0, 3)
  const album = lead.album

  return (
    <section id="gallery" ref={ref} className="py-16 sm:py-24">
      <div className="section-container">
        <m.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-[14px] font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-widest mb-3">
            Gallery
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
            <h2 className="section-title">Photo Albums</h2>
            <a href="/gallery/" className="group inline-flex items-center gap-1.5 text-[15px] font-medium text-[#0071E3] dark:text-[#2997FF]">
              View all albums
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
            </a>
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 sm:grid-rows-2 gap-3 sm:gap-4 sm:aspect-[16/8]">
            <Tile
              album={album}
              photo={lead.photo}
              sizes={LEAD_SIZES}
              className={`col-span-2 aspect-[4/3] sm:aspect-auto sm:row-span-2 ${rest.length === 0 ? 'sm:col-span-3' : ''}`}
            />
            {rest.map(({ album: a, photo }) => (
              <Tile
                key={photo.id}
                album={a}
                photo={photo}
                sizes={SIDE_SIZES}
                className={`aspect-[4/3] sm:aspect-auto ${rest.length === 1 ? 'col-span-2 sm:col-span-1 sm:row-span-2' : ''}`}
              />
            ))}
          </div>

          <div className={`mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-2 ${albumTone(album)}`}>
            <FolderGlyph />
            <a href={albumPath(album)} className="text-[17px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] hover:opacity-70 transition-opacity">
              {album.title}
            </a>
            {album.context && <span className="gal-tag">{album.context}</span>}
            {album.date && <span className="gal-tag">{album.date}</span>}
            <a href={albumPath(album)} className="group ml-auto inline-flex items-center gap-1.5 text-[14px] font-medium text-[#0071E3] dark:text-[#2997FF]">
              View album
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
            </a>
          </div>
        </m.div>
      </div>
    </section>
  )
}
