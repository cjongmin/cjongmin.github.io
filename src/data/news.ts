// Source of truth: news.json — newest first
import data from './news.json'

export interface NewsItem {
  id: string
  date: string       // e.g. "Jan 2026"
  text: string       // wrap a phrase in **double asterisks** to emphasise it in red
  highlight?: boolean // subtle emphasis for big announcements
}

export const news: NewsItem[] = data as NewsItem[]
