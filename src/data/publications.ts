// Source of truth: publications.json (edit via Gradio admin or directly)
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
  displayVenue?: string     // Display override, e.g. "ICASSP 2026" (fallback: "venue year")
  year: number
  order: number
  status?: 'Conference' | 'Workshop' | 'Preprint' | 'Journal'
  presentationType?: 'Oral' | 'Poster' | 'Spotlight'
  image?: string
  tags?: string[]
  links?: PublicationLink
  bibtex?: string
  equalContribution?: string[]  // Legacy; prefer ^number in authors
}

export const publications: Publication[] = data as Publication[]
