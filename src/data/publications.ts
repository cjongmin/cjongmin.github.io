// Source of truth: publications.json
import data from './publications.json'

export interface PublicationLink {
  paper?: string
  scholar?: string
  code?: string
  project?: string
}

export interface Publication {
  id: string
  title: string
  authors: string[]         // Use "Name^1" for superscript author numbering
  venue: string             // Filter key: "ICASSP", "NeurIPS", "arXiv"
  displayVenue?: string     // Badge override, e.g. "EMNLP 2026 Findings" (fallback: "venue year")
  venueFull?: string        // Spelled-out venue, e.g. "Neural Information Processing Systems (NeurIPS)"
  year: number
  order: number
  status?: 'Conference' | 'Workshop' | 'Preprint' | 'Journal'
  submittedTo?: string      // Venue a preprint is under review at, e.g. "NeurIPS 2026"
  presentationType?: 'Oral' | 'Poster' | 'Spotlight'
  image?: string
  links?: PublicationLink
  bibtex?: string
  equalContribution?: string[]  // Legacy; prefer ^number in authors
}

export const publications: Publication[] = data as Publication[]
