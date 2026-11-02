import { Images } from 'lucide-react'
import { coverOf, photoSrcSet, photoUrl, GalleryAlbum } from '../data/gallery'

/**
 * An album as a folder with its photos sticking out of the top, in the colours of its tone.
 * Hovering the link around it (a .group) opens the flap and fans the prints. It is a picture
 * of the link, so it is hidden from screen readers; the link says what it opens.
 */
export default function AlbumFolder({ album, sizes }: { album: GalleryAlbum; sizes: string }) {
  const cover = coverOf(album)
  const prints = [cover, ...album.photos.filter(p => p !== cover)].slice(0, 3)
  return (
    <div className="gal-folder" aria-hidden>
      <div className="gal-folder-back" />
      {prints.map((photo, i) => (
        <img
          key={photo.id}
          src={photoUrl(album, photo)}
          srcSet={photoSrcSet(album, photo)}
          sizes={sizes}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ backgroundColor: photo.color, objectPosition: photo.position, zIndex: 3 - i }}
          className={`gal-print gal-print-${i}`}
        />
      ))}
      <div className="gal-folder-front">
        <Images className="gal-folder-mark" strokeWidth={1.5} />
      </div>
    </div>
  )
}
