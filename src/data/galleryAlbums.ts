// Every album. Only the gallery pages import this, so the home page's script stays small.
import data from './gallery.json'
import { GalleryAlbum } from './gallery'

export const albums = data.albums as GalleryAlbum[]
