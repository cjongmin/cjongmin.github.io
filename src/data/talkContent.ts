// Post bodies, src/content/talks/<id>.md. Imported only by the post view, so the
// text loads with it when a post is opened rather than with the home page.
const contents = import.meta.glob('../content/talks/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

/** Markdown body of a post (empty string if the file does not exist yet). */
export function talkContent(id: string): string {
  return contents[`../content/talks/${id}.md`] ?? ''
}
