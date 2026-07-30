// Source of truth: education.json
import data from './education.json'

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
