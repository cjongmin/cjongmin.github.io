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
  venue: string            // Use "arXiv" for preprints
  year: number
  order: number
  image?: string
  tags?: string[]
  links?: PublicationLink
  bibtex?: string
  equalContribution?: string[]  // Author names with equal contribution (shown as *)
}

export const publications: Publication[] = data as Publication[]

// Venue → filter category mapping. Add more as needed.
export const venueCategories: Record<string, string[]> = {
  'Preprint': ['arXiv', 'Preprint'],
  'NLP / LLM': ['ACL', 'EMNLP', 'NAACL', 'ICLR'],
  'Vision': ['CVPR', 'ICCV', 'ECCV'],
  'General ML': ['NeurIPS', 'ICML', 'ICLR'],
}
