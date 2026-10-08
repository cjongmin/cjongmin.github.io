// Source of truth: people.json — co-authors shown in the author box of a talk post.
// Photos live in public/people/ (square, 256px); an author without an entry gets initials.
import data from './people.json'

export interface Person {
  photo?: string
  url?: string
}

export const people: Record<string, Person> = data
