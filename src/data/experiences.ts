// Source of truth: experiences.json (edit via Gradio admin or directly)
// Holds Education entries; the filename is kept for admin-tool compatibility.
import data from './experiences.json'

export interface Education {
  id: string
  title: string          // degree, e.g. "M.S. in Electrical Engineering"
  organization: string   // institution
  department?: string    // school / lab line
  advisor?: string       // e.g. "Prof. Joon Son Chung"
  location: string
  startDate: string
  endDate: string
  link?: string
}

export const education: Education[] = data as Education[]
