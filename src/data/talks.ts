// Source of truth: talks.json — newest first (the order of the home-page carousel).
// Entries with published: false are drafts and never rendered.
// Each post's text lives in src/content/talks/<id>.md, loaded by talkContent.ts (see README → Talk posts).
import data from './talks.json'

export interface TalkLinks {
  paper?: string
  slides?: string
  poster?: string
}

export interface Talk {
  id: string
  no: number                        // series number: #1 is the first post; never renumber
  title: string                     // the paper title; also the post's title
  subtitle?: string                 // one line under the post title
  event: string                     // short, e.g. "EMNLP 2026"
  eventFull?: string                // spelled-out venue
  type: 'Poster' | 'Spotlight' | 'Oral' | 'Talk'
  role: string                      // e.g. "Presenter"
  date: string                      // e.g. "Nov 2026"
  location?: string
  cover?: string                    // 16:9 photo for the card banner; place it in the post's .md where it is mentioned
  image?: string                    // paper figure; used as the backdrop until a cover exists
  paperId?: string                  // id in publications.json (authors, paper and poster links)
  summary: string                   // one or two sentences for the card (and the post, if it has no .md yet)
  published: boolean                // false = hidden draft
  upcoming: boolean                 // true until the conference has happened
  links?: TalkLinks
}

export const talks: Talk[] = (data as Talk[]).filter(t => t.published)

/** Newest post first (#2, #1, …), as listed at the bottom of every post. */
export const talksNewestFirst: Talk[] = [...talks].sort((a, b) => b.no - a.no)

/** The address to share: a static page with this post's title and preview image that opens the post. */
export function talkShareUrl(id: string): string {
  return new URL(`/talks/${id}/`, window.location.origin).href
}
