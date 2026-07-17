// Source of truth: projects.json (edit directly, or generate an entry
// with prompts/extract-app-info.md run inside the app's source folder)
import data from './projects.json'

export interface ProjectLinks {
  appStore?: string
  testFlight?: string
  github?: string
  website?: string
}

export interface Project {
  id: string
  name: string
  tagline: string            // one-liner shown on the card
  description: string        // long form, shown in modal ("\n\n" splits paragraphs)
  icon: string               // /projects/<id>/icon.png — square 1024px, no pre-rounded corners
  accentColor?: string       // optional hex used as icon backdrop glow
  screenshots?: string[]     // /projects/<id>/screenshot-1.png ... (portrait, ~1290x2796)
  platforms: string[]        // e.g. ["iOS", "iPadOS", "watchOS"]
  status?: 'App Store' | 'TestFlight' | 'In Development'
  year?: number
  features?: string[]        // key feature bullets
  techStack?: string[]       // e.g. ["Swift", "SwiftUI", "Combine"]
  apis?: string[]            // frameworks / services, e.g. ["CoreData", "StoreKit 2", "Firebase"]
  links?: ProjectLinks
}

export const projects: Project[] = data as Project[]
