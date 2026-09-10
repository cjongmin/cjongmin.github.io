import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

const SITE = 'https://cjongmin.github.io'

/**
 * Inject schema.org JSON-LD at build time, derived straight from
 * src/data/*.json so there is a single source of truth. Search engines get
 * a Person record plus one ScholarlyArticle per publication.
 */
function jsonLd(): Plugin {
  return {
    name: 'inject-json-ld',
    transformIndexHtml() {
      const read = (file: string) => JSON.parse(readFileSync(`src/data/${file}`, 'utf8'))
      const profile = read('profile.json')
      const pubs: any[] = read('publications.json')

      const personId = `${SITE}/#person`
      const person = {
        '@type': 'Person',
        '@id': personId,
        name: profile.name,
        url: `${SITE}/`,
        image: `${SITE}${profile.profileImage}`,
        email: `mailto:${profile.email}`,
        jobTitle: profile.title,
        affiliation: {
          '@type': 'Organization',
          name: profile.university,
          department: { '@type': 'Organization', name: profile.affiliation },
        },
        sameAs: Object.values(profile.links),
        knowsAbout: profile.keywords,
      }

      const articles = pubs.map(p => {
        const author = p.authors.map((raw: string) => {
          const name = raw.replace(/\^.*$/, '').trim()   // strip "^1" markers
          return name === profile.name ? { '@id': personId } : { '@type': 'Person', name }
        })
        const article: Record<string, unknown> = {
          '@type': 'ScholarlyArticle',
          headline: p.title,
          author,
          datePublished: String(p.year),
        }
        if (p.links?.paper) article.url = p.links.paper
        if (p.venue !== 'arXiv') {
          article.publication = {
            '@type': 'PublicationEvent',
            name: p.displayVenue ?? `${p.venue} ${p.year}`,
          }
        }
        return article
      })

      const graph = { '@context': 'https://schema.org', '@graph': [person, ...articles] }
      return [{
        tag: 'script',
        attrs: { type: 'application/ld+json' },
        // "<" must never appear raw inside a <script> body
        children: JSON.stringify(graph).replace(/</g, '\\u003c'),
        injectTo: 'head',
      }]
    },
  }
}

/**
 * Drop unpublished talks at build time so a draft never reaches the bundle
 * (a runtime filter would still ship the text to anyone reading the source).
 * enforce: 'pre' runs this before Vite's own JSON plugin, so `code` is raw JSON.
 */
function stripDraftTalks(): Plugin {
  return {
    name: 'strip-draft-talks',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/src/data/talks.json')) return null
      const kept = (JSON.parse(code) as any[]).filter(t => t.published)
      return { code: JSON.stringify(kept), map: null }
    },
  }
}

// EDIT BASE PATH:
//   - User site (YOUR_USERNAME.github.io):  base: '/'
//   - Project site (github.com/USER/REPO):  base: '/REPO_NAME/'
export default defineConfig({
  plugins: [react(), jsonLd(), stripDraftTalks()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        // Split stable vendor code from app code so content edits
        // don't invalidate the whole bundle in browser caches.
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
