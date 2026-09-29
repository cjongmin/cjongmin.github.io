// Source of truth: education.json
import data from './education.json'

export interface Education {
  id: string
  title: string          // degree, e.g. "M.S. in Electrical Engineering"
  status?: string        // shown as a chip beside the dates, e.g. "Incoming"
  organization: string   // institution
  department?: string    // school / lab line
  advisor?: string       // e.g. "Prof. Joon Son Chung"
  location: string
  startDate: string
  endDate: string        // "" = not started yet → "Starting <startDate>"
  link?: string
}

export const education: Education[] = data as Education[]
