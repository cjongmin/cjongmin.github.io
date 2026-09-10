// Source of truth: talks.json — newest first.
// Entries with published: false are drafts and never rendered.
import data from './talks.json'

export interface TalkQA {
  question: string
  answer: string
}

export interface TalkLinks {
  paper?: string
  slides?: string
  poster?: string
}

export interface Talk {
  id: string
  title: string                     // usually the paper title
  event: string                     // short, e.g. "EMNLP 2026"
  eventFull?: string                // spelled-out venue
  type: 'Poster' | 'Oral' | 'Talk'
  role: string                      // e.g. "Presenter"
  date: string                      // e.g. "Nov 2026"
  location?: string
  image?: string                    // card thumbnail
  paperId?: string                  // id in publications.json
  summary: string                   // one or two sentences for the card
  published: boolean                // false = hidden draft
  upcoming: boolean                 // true until the write-up is posted
  keyPoints?: string[]
  questions?: TalkQA[]              // questions raised at the session
  takeaways?: string[]
  links?: TalkLinks
}

export const talks: Talk[] = (data as Talk[]).filter(t => t.published)
