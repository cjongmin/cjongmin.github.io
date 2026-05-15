// Source of truth: experiences.json (edit via Gradio admin or directly)
import data from './experiences.json'

export interface Experience {
  id: string
  title: string
  organization: string
  location: string
  startDate: string
  endDate: string
  description: string
  tags?: string[]
  link?: string
}

export const experiences: Experience[] = data as Experience[]
