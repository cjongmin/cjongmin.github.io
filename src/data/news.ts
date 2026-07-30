// Source of truth: news.json — newest first
import data from './news.json'

export interface NewsItem {
  id: string
  date: string       // e.g. "Jan 2026"
  text: string
  highlight?: boolean // subtle emphasis for big announcements
}

export const news: NewsItem[] = data as NewsItem[]
