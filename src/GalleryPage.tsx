// The albums on their own pages: /gallery/ and /gallery/<album>/ (see main.tsx and scripts/prerender.mjs).
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import AlbumFolder from './components/AlbumFolder'
import AlbumViewer from './components/AlbumViewer'
import GalleryWindow from './components/GalleryWindow'
import { albumMeta, albumPath, albums, countPhotos, GalleryAlbum } from './data/gallery'
import { profile } from './data/profile'

const HEADING = 'text-[30px] sm:text-[40px] font-semibold tracking-tight leading-tight text-[#1D1D1F] dark:text-[#F5F5F7]'

/** A lone album fills the window beside its details; several sit in a grid of equal folders. */
function AlbumCard({ album, wide }: { album: GalleryAlbum; wide: boolean }) {
  const meta = albumMeta(album)
  return (
    <a
      href={albumPath(album)}
      aria-label={`Open the ${album.title} album, ${countPhotos(album.photos.length)}`}
      className={`group block ${wide ? 'sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:gap-12' : ''}`}
    >
      <AlbumFolder album={album} sizes={wide ? '(min-width: 2100px) 22vw, (min-width: 640px) 45vw, 80vw' : '(min-width: 2100px) 15vw, (min-width: 1024px) 300px, (min-width: 640px) 45vw, 80vw'} />
      <div className={wide ? 'mt-6 sm:mt-0' : 'mt-4'}>
        <p className={`${wide ? 'text-[26px] sm:text-[32px]' : 'text-[18px]'} font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]`}>
          {album.title}
        </p>
        {meta && <p className="gal-mono mt-1 text-[13px] text-secondary">{meta}</p>}
        <p className="gal-mono mt-1 text-[13px] text-secondary">{countPhotos(album.photos.length)}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-[#0071E3] dark:text-[#2997FF]">
          Open folder
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
        </span>
      </div>
    </a>
  )
}

function AlbumList() {
  const total = albums.reduce((n, a) => n + a.photos.length, 0)
  const wide = albums.length === 1
  return (
    <>
      <h1 className={HEADING}>Gallery</h1>
      <p className="mt-2 mb-8 sm:mb-10 text-[16px] sm:text-[18px] text-secondary">Photos from conferences and trips, one folder at a time.</p>
      <GalleryWindow
        title="Gallery"
        up="/#gallery"
        path={[{ label: 'cjmin.me', href: '/#gallery' }, { label: 'gallery' }]}
        status={<><span>{albums.length} {albums.length === 1 ? 'folder' : 'folders'}</span><span>{countPhotos(total)}</span></>}
      >
        <div className={`p-6 sm:p-10 ${wide ? '' : 'grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10'}`}>
          {albums.map(a => <AlbumCard key={a.slug} album={a} wide={wide} />)}
        </div>
      </GalleryWindow>
    </>
  )
}

function AlbumPage({ album }: { album: GalleryAlbum }) {
  const meta = albumMeta(album)
  return (
    <>
      <h1 className={HEADING}>{album.title}</h1>
      <div className="mt-1.5 mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        {meta && <p className="gal-mono text-[14px] text-secondary">{meta}</p>}
        {album.link && (
          <a href={album.link.href} className="group inline-flex items-center gap-1.5 text-[15px] font-medium text-[#0071E3] dark:text-[#2997FF]">
            {album.link.label}
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
          </a>
        )}
      </div>
      <GalleryWindow
        title={album.title}
        up="/gallery/"
        path={[{ label: 'cjmin.me', href: '/#gallery' }, { label: 'gallery', href: '/gallery/' }, { label: album.slug }]}
        status={<><span>{countPhotos(album.photos.length)}</span>{album.photos.length > 1 && <span className="hidden sm:inline">← → to browse</span>}</>}
      >
        <AlbumViewer album={album} />
      </GalleryWindow>
    </>
  )
}

export default function GalleryPage({ slug }: { slug?: string }) {
  const album = slug ? albums.find(a => a.slug === slug) : undefined
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-white dark:bg-black">
          <div className="sticky top-0 z-10 h-14 bg-white/85 dark:bg-black/85 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.07]">
            <div className="section-container h-full flex items-center justify-between">
              <a href={album ? '/gallery/' : '/#gallery'} className="btn-secondary">
                <ArrowLeft size={14} />
                {album ? 'Gallery' : profile.name}
              </a>
              <span className="text-[12px] sm:text-[13px] font-semibold text-secondary uppercase tracking-widest">Gallery</span>
            </div>
          </div>
          <main className="section-container pt-8 sm:pt-10 pb-24">
            {album ? <AlbumPage album={album} /> : <AlbumList />}
          </main>
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}
