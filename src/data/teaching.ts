// Source of truth: teaching.json — newest first
import data from './teaching.json'

export interface TeachingItem {
  id: string
  course: string        // e.g. "EE.70038 Speech Recognition Systems"
  term: string          // e.g. "Spring 2026"
  role: string          // e.g. "Teaching Assistant"
  instructor?: string
  institution?: string
}

export const teaching: TeachingItem[] = data as TeachingItem[]
