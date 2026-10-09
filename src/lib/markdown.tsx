import { Fragment, ReactNode } from 'react'

/**
 * The small Markdown subset that talk posts are written in
 * (src/content/talks/<id>.md):
 *
 *   # Section            ## Subsection         (both appear in the contents box)
 *   plain paragraphs     - bullet / 1. numbered lists
 *   > callout            ---
 *   ![caption](/photo.webp)                      photo, full width
 *   ![caption](/chart.webp "figure")             chart on white, up to 760px wide
 *   ![caption](/diagram.webp "wide")             chart on white, full width
 *   **bold**  *italic*  `code`  [link](https://…)
 *
 * Visual blocks, one item per line between ::: fences:
 *   :::info Title          Key: Value           → a fact card
 *   :::stats               value | label | note → number tiles
 *   :::steps               Title | text         → numbered step cards
 *   :::quote               text                 → a highlighted question / pull quote
 *
 * Parsing produces plain data, so the same headings feed the table of contents.
 */
export type Block =
  | { kind: 'heading'; level: 1 | 2; text: string; id: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'callout'; text: string }
  | { kind: 'image'; alt: string; src: string; variant: 'photo' | 'figure' | 'wide' }
  | { kind: 'rule' }
  | { kind: 'info'; title: string; rows: [string, string][] }
  | { kind: 'stats'; items: { value: string; label: string; note?: string }[] }
  | { kind: 'steps'; items: { title: string; text: string }[] }
  | { kind: 'quote'; text: string }

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section'
}

export function parseMarkdown(src: string): Block[] {
  const blocks: Block[] = []
  const used = new Map<string, number>()
  const lines = src.replace(/\r\n?/g, '\n').split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i].trimEnd()
    if (!line.trim()) { i++; continue }

    const h = line.match(/^(#{1,2})\s+(.+)$/)
    if (h) {
      const text = h[2].trim()
      const base = slugify(text)
      const n = used.get(base) ?? 0
      used.set(base, n + 1)
      blocks.push({ kind: 'heading', level: h[1].length as 1 | 2, text, id: n ? `${base}-${n + 1}` : base })
      i++
      continue
    }
    if (/^-{3,}$/.test(line.trim())) { blocks.push({ kind: 'rule' }); i++; continue }

    const fence = line.match(/^:::(info|stats|steps|quote)\s*(.*)$/)
    if (fence) {
      const body: string[] = []
      i++
      while (i < lines.length && lines[i].trim() !== ':::') { if (lines[i].trim()) body.push(lines[i].trim()); i++ }
      i++                                                     // closing :::
      const cells = (l: string) => l.split('|').map(c => c.trim())
      if (fence[1] === 'info') {
        blocks.push({ kind: 'info', title: fence[2].trim(), rows: body.map(l => {
          const k = l.indexOf(':'); return [l.slice(0, k).trim(), l.slice(k + 1).trim()] as [string, string]
        }) })
      } else if (fence[1] === 'stats') {
        blocks.push({ kind: 'stats', items: body.map(l => { const [value, label, note] = cells(l); return { value, label, note } }) })
      } else if (fence[1] === 'steps') {
        blocks.push({ kind: 'steps', items: body.map(l => { const [title, text] = cells(l); return { title, text } }) })
      } else {
        blocks.push({ kind: 'quote', text: body.join(' ') })
      }
      continue
    }

    const img = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"(figure|wide)")?\)$/)
    if (img) { blocks.push({ kind: 'image', alt: img[1], src: img[2], variant: (img[3] as 'figure' | 'wide') ?? 'photo' }); i++; continue }

    if (line.startsWith('>')) {
      const body: string[] = []
      while (i < lines.length && lines[i].startsWith('>')) body.push(lines[i++].replace(/^>\s?/, ''))
      blocks.push({ kind: 'callout', text: body.join(' ').trim() })
      continue
    }

    const bullet = /^\s*[-*]\s+/, numbered = /^\s*\d+\.\s+/
    if (bullet.test(line) || numbered.test(line)) {
      const ordered = numbered.test(line)
      const marker = ordered ? numbered : bullet
      const items: string[] = []
      while (i < lines.length && lines[i].trim()) {
        if (marker.test(lines[i])) items.push(lines[i].replace(marker, '').trim())
        else items[items.length - 1] += ' ' + lines[i].trim()     // wrapped list item
        i++
      }
      blocks.push({ kind: 'list', ordered, items })
      continue
    }

    const para: string[] = []
    while (i < lines.length && lines[i].trim() && !/^(#{1,2}\s|>|!\[|:::|\s*[-*]\s|\s*\d+\.\s|-{3,}$)/.test(lines[i])) {
      para.push(lines[i++].trim())
    }
    blocks.push({ kind: 'paragraph', text: para.join(' ') })
  }
  return blocks
}

// Body text is justified like About Me; phones may hyphenate long words (10+ letters)
// so narrow lines don't open wide gaps, wider screens never hyphenate.
const JUSTIFY = 'text-justify hyphens-auto [hyphenate-limit-chars:10_4_4] sm:hyphens-manual'

// **bold**, *italic*, `code`, [text](url)
export function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1 py-0.5 rounded bg-black/[0.05] dark:bg-white/10 text-[0.9em]">{part.slice(1, -1)}</code>
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      const external = /^https?:/.test(link[2])
      return (
        <a key={i} href={link[2]} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
           className="font-medium text-[#0071E3] dark:text-[#2997FF] hover:underline">
          {link[1]}
        </a>
      )
    }
    if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>
    return <Fragment key={i}>{part}</Fragment>
  })
}

/**
 * The post body. Headings carry ids (scroll-mt clears the sticky top bar) for the
 * contents box; clicking an image hands it to onImageClick (the post's lightbox).
 */
export function MarkdownBody({ blocks, onImageClick }: {
  blocks: Block[]
  onImageClick?: (image: { src: string; alt: string; chart: boolean }) => void
}) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case 'heading':
            return b.level === 1 ? (
              <h2 key={i} id={b.id}
                  className="scroll-mt-24 mt-14 text-[24px] sm:text-[26px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {renderInline(b.text)}
              </h2>
            ) : (
              <h3 key={i} id={b.id}
                  className="scroll-mt-24 mt-9 text-[19px] sm:text-[20px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {renderInline(b.text)}
              </h3>
            )
          case 'paragraph':
            return <p key={i} className={`mt-5 text-[17px] leading-[1.75] text-body ${JUSTIFY}`}>{renderInline(b.text)}</p>
          case 'list':
            return b.ordered ? (
              <ol key={i} className="mt-5 space-y-2.5 list-decimal pl-6 marker:text-secondary marker:font-medium">
                {b.items.map((it, j) => <li key={j} className={`pl-1 text-[17px] leading-[1.7] text-body ${JUSTIFY}`}>{renderInline(it)}</li>)}
              </ol>
            ) : (
              <ul key={i} className="mt-5 space-y-2.5">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3 text-[17px] leading-[1.7] text-body">
                    <span className="mt-[11px] w-1.5 h-1.5 rounded-full bg-[#1D1D1F]/50 dark:bg-white/50 shrink-0" />
                    <span className={`min-w-0 flex-1 ${JUSTIFY}`}>{renderInline(it)}</span>
                  </li>
                ))}
              </ul>
            )
          case 'callout':
            return (
              <div key={i} className={`mt-6 rounded-xl px-5 py-4 bg-neutral-50 dark:bg-white/[0.04]
                                      border border-black/[0.06] dark:border-white/[0.08]
                                      text-[16px] leading-[1.7] text-body ${JUSTIFY}`}>
                {renderInline(b.text)}
              </div>
            )
          case 'image': {
            const chart = b.variant !== 'photo'
            return (
              <figure key={i} className={`mt-8 ${b.variant === 'figure' ? 'max-w-[760px] mx-auto' : ''}`}>
                {/* tap / click enlarges it in the post's lightbox */}
                <button
                  type="button"
                  onClick={() => onImageClick?.({ src: b.src, alt: b.alt, chart })}
                  aria-label={`Enlarge image${b.alt ? `: ${b.alt}` : ''}`}
                  className={`block w-full cursor-zoom-in transition-shadow hover:shadow-md ${chart
                    // charts keep a white ground in dark mode too, so their axes stay readable
                    ? 'rounded-2xl bg-white p-3 sm:p-5 border border-black/[0.06] dark:border-white/[0.08]'
                    : 'rounded-2xl overflow-hidden'}`}
                >
                  <img src={b.src} alt={b.alt} loading="lazy" decoding="async" className="w-full h-auto" />
                </button>
                {b.alt && <figcaption className="mt-3 text-[14px] leading-relaxed text-secondary text-center">{renderInline(b.alt)}</figcaption>}
              </figure>
            )
          }
          case 'info':
            return (
              <div key={i} className="mt-6 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] overflow-hidden">
                {b.title && (
                  <p className="px-5 sm:px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-secondary
                                bg-neutral-50 dark:bg-white/[0.04] border-b border-black/[0.06] dark:border-white/[0.08]">
                    {b.title}
                  </p>
                )}
                <dl className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                  {b.rows.map(([k, v]) => (
                    <div key={k} className="flex flex-col sm:flex-row gap-0.5 sm:gap-6 px-5 sm:px-6 py-3">
                      <dt className="shrink-0 sm:w-[150px] text-[14px] font-medium text-secondary">{k}</dt>
                      <dd className="text-[16px] text-[#1D1D1F] dark:text-[#F5F5F7]">{renderInline(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )
          case 'stats':
            return (
              <div key={i} className={`mt-7 grid gap-3 sm:gap-4 ${b.items.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                {b.items.map(it => (
                  <div key={it.value + it.label}
                       className="rounded-2xl px-5 py-5 bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08]">
                    <p className="text-[30px] sm:text-[34px] font-semibold tracking-tight leading-none text-[#0071E3] dark:text-[#2997FF] tabular-nums">
                      {it.value}
                    </p>
                    <p className="mt-2.5 text-[15px] font-medium leading-snug text-[#1D1D1F] dark:text-[#F5F5F7]">{renderInline(it.label)}</p>
                    {it.note && <p className="mt-1 text-[13px] text-secondary">{renderInline(it.note)}</p>}
                  </div>
                ))}
              </div>
            )
          case 'steps':
            return (
              <ol key={i} className={`mt-7 grid gap-3 sm:gap-4 ${b.items.length >= 2 ? 'sm:grid-cols-2' : ''}`}>
                {b.items.map((it, j) => (
                  <li key={it.title} className="rounded-2xl p-5 sm:p-6 border border-black/[0.08] dark:border-white/[0.1]">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#0071E3] dark:bg-[#2997FF] text-white text-[13px] font-semibold
                                       flex items-center justify-center tabular-nums">{j + 1}</span>
                      <span className="text-[18px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">{it.title}</span>
                    </div>
                    <p className={`mt-3 text-[16px] leading-[1.7] text-body ${JUSTIFY}`}>{renderInline(it.text)}</p>
                  </li>
                ))}
              </ol>
            )
          case 'quote':
            return (
              <blockquote key={i} className="my-8 pl-5 sm:pl-6 border-l-[3px] border-[#0071E3] dark:border-[#2997FF]
                                             text-[19px] sm:text-[22px] font-medium leading-[1.5] tracking-tight
                                             text-[#1D1D1F] dark:text-[#F5F5F7]">
                {renderInline(b.text)}
              </blockquote>
            )
          case 'rule':
            return <hr key={i} className="my-12 border-black/[0.08] dark:border-white/[0.1]" />
        }
      })}
    </>
  )
}
