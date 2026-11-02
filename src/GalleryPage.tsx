// The albums on their own pages: /gallery/ and /gallery/<album>/ (see main.tsx and scripts/prerender.mjs).
import { ReactNode } from 'react'
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import AlbumFolder from './components/AlbumFolder'
import AlbumViewer from './components/AlbumViewer'
import GalleryWindow from './components/GalleryWindow'
import { albumPath, albums, albumTone, countPhotos, GalleryAlbum } from './data/gallery'
import { profile } from './data/profile'

/** The heading inside a window: a dashed mark, the big title, then a row of small facts. */
function WindowHeader({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <header className="mx-5 sm:mx-8 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-black/[0.08] dark:border-white/[0.1]">
      <div className="flex items-center gap-3.5 sm:gap-4">
        <span aria-hidden className="gal-mark"><i /><i /></span>
        <h1 className="min-w-0 text-[28px] sm:text-[36px] font-semibold tracking-tight leading-tight text-[#1D1D1F] dark:text-[#F5F5F7]">{title}</h1>
      </div>
      {intro && <p className="mt-2.5 text-[15px] sm:text-[17px] text-secondary">{intro}</p>}
      <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-2.5">{children}</div>
    </header>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span className="text-[14px] sm:text-[15px] text-secondary">{label}</span>
      {children}
    </div>
  )
}

/** A lone album fills the window beside its details; several sit in a grid of equal cards. */
function AlbumCard({ album, wide }: { album: GalleryAlbum; wide: boolean }) {
  return (
    <a
      href={albumPath(album)}
      aria-label={`Open the ${album.title} album, ${countPhotos(album.photos.length)}`}
      className={`group gal-card ${albumTone(album)} ${wide
        ? 'p-6 sm:p-10 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:gap-12'
        : 'p-5 flex flex-col'}`}
    >
      <AlbumFolder album={album} sizes={wide ? '(min-width: 2100px) 20vw, (min-width: 640px) 40vw, 80vw' : '(min-width: 2100px) 14vw, (min-width: 1024px) 280px, (min-width: 640px) 45vw, 80vw'} />
      <div className={wide ? 'mt-6 sm:mt-0' : 'mt-5 flex-1 flex flex-col items-start'}>
        <p className={`${wide ? 'text-[26px] sm:text-[32px]' : 'text-[20px]'} font-semibold tracking-tight leading-tight text-[#1D1D1F] dark:text-[#F5F5F7]`}>
          {album.title}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
          {album.context && <span className="gal-tag">{album.context}</span>}
          {album.date && <span className="gal-tag">{album.date}</span>}
          <span className="gal-tag">{countPhotos(album.photos.length)}</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-[15px] font-medium gal-accent ${wide ? 'mt-5' : 'mt-auto pt-4'}`}>
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
  const latest = albums[0]
  return (
    <GalleryWindow up="/#gallery" tone={albumTone(latest)} path={[{ label: 'cjmin.me', href: '/#gallery' }, { label: 'Gallery' }]}>
      <WindowHeader title="Gallery" intro="Photos from conferences and trips, one folder at a time.">
        <Fact label="Latest"><a href={albumPath(latest)} className="gal-pill">{latest.title}</a></Fact>
        <Fact label="Photos"><span className="gal-tag">{total}</span></Fact>
      </WindowHeader>
      <div className={`p-5 sm:p-8 ${wide ? '' : 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'}`}>
        {albums.map(a => <AlbumCard key={a.slug} album={a} wide={wide} />)}
      </div>
    </GalleryWindow>
  )
}

function AlbumPage({ album }: { album: GalleryAlbum }) {
  return (
    <GalleryWindow
      up="/gallery/"
      tone={albumTone(album)}
      path={[{ label: 'cjmin.me', href: '/#gallery' }, { label: 'Gallery', href: '/gallery/' }, { label: album.title }]}
    >
      <WindowHeader title={album.title}>
        {album.context && <Fact label="About"><span className="gal-pill">{album.context}</span></Fact>}
        {album.date && <Fact label="When"><span className="gal-tag">{album.date}</span></Fact>}
        <Fact label="Photos"><span className="gal-tag">{album.photos.length}</span></Fact>
        {album.link && (
          <a href={album.link.href} className="group sm:ml-auto inline-flex items-center gap-1.5 text-[15px] font-medium gal-accent">
            {album.link.label}
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
          </a>
        )}
      </WindowHeader>
      <AlbumViewer album={album} />
    </GalleryWindow>
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
          <main className="section-container pt-6 sm:pt-8 pb-24">
            {album ? <AlbumPage album={album} /> : <AlbumList />}
          </main>
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}
