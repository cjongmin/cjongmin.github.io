// gallery.json is generated: scripts/build_gallery.py writes it from the folders in gallery/
// (see gallery/README.md). Edit gallery/<album>/album.json, not the generated file.
import data from './gallery.json'

export interface GalleryPhoto {
  id: string
  width: number
  height: number
  widths: number[]                  // the published sizes, smallest first
  color: string                     // the photo's average colour, shown until it loads
  alt: string
  caption?: string
  position?: string                 // which part to keep when a tile crops it (CSS object-position)
}

export interface GalleryAlbum {
  slug: string
  title: string
  context?: string                  // what the trip was for, e.g. "EMNLP 2026"
  date?: string
  link?: { label: string; href: string }
  cover: string                     // id of the photo on the folder
  photos: GalleryPhoto[]
}

export const albums = data.albums as GalleryAlbum[]

/** The photos shown on the home page. */
export const featured = data.featured.flatMap(({ album: slug, photo: id }) => {
  const album = albums.find(a => a.slug === slug)
  const photo = album?.photos.find(p => p.id === id)
  return album && photo ? [{ album, photo }] : []
})

const TONES = ['gal-tone-coral', 'gal-tone-periwinkle', 'gal-tone-sage', 'gal-tone-butter']
/** An album's colours, counted from the oldest so it keeps them when newer albums arrive. */
export const albumTone = (a: GalleryAlbum) => TONES[(albums.length - 1 - albums.indexOf(a)) % TONES.length]

export const albumPath = (a: GalleryAlbum) => `/gallery/${a.slug}/`
export const coverOf = (a: GalleryAlbum) => a.photos.find(p => p.id === a.cover) ?? a.photos[0]
export const countPhotos = (n: number) => `${n} photo${n === 1 ? '' : 's'}`

export const photoUrl = (a: GalleryAlbum, p: GalleryPhoto, width = p.widths[0]) =>
  `/gallery/${a.slug}/${p.id}-${width}.webp`
export const photoSrcSet = (a: GalleryAlbum, p: GalleryPhoto) =>
  p.widths.map(w => `${photoUrl(a, p, w)} ${w}w`).join(', ')
