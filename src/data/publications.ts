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
  authors: string[]
  venue: string             // Filter key: "ICASSP", "NeurIPS", "arXiv"
  displayVenue?: string     // Display override, e.g. "ICASSP 2026" (fallback: "venue year")
  year: number
  order: number
  status?: 'Conference' | 'Workshop' | 'Preprint' | 'Journal'
  image?: string
  tags?: string[]
  links?: PublicationLink
  bibtex?: string
  equalContribution?: string[]
}

export const publications: Publication[] = data as Publication[]
