import { Fragment, ReactNode } from 'react'
import { CalendarDays, Clock, Info, Landmark, MapPin, Presentation, Users } from 'lucide-react'

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
 *   :::event               Date / Title / Detail / Place / Note: …  → a ticket (date stub + details)
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
  | { kind: 'event'; fields: Record<string, string> }
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

    const fence = line.match(/^:::(info|event|stats|steps|quote)\s*(.*)$/)
    if (fence) {
      const body: string[] = []
      i++
      while (i < lines.length && lines[i].trim() !== ':::') { if (lines[i].trim()) body.push(lines[i].trim()); i++ }
      i++                                                     // closing :::
      const cells = (l: string) => l.split('|').map(c => c.trim())
      if (fence[1] === 'event') {
        const fields: Record<string, string> = {}
        for (const l of body) { const k = l.indexOf(':'); if (k > 0) fields[l.slice(0, k).trim().toLowerCase()] = l.slice(k + 1).trim() }
        blocks.push({ kind: 'event', fields })
      } else if (fence[1] === 'info') {
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

// :::info rows get an icon from their key; anything else gets a generic one
function infoIcon(key: string) {
  const k = key.toLowerCase()
  if (/when|date|day/.test(k)) return CalendarDays
  if (/time|hour/.test(k)) return Clock
  if (/where|location|venue|city|room/.test(k)) return MapPin
  if (/presentation|format|type|poster|talk/.test(k)) return Presentation
  if (/conference|event|venue|meeting/.test(k)) return Landmark
  if (/session|people|host|chair/.test(k)) return Users
  return Info
}

// "Oct 2026" / "Oct 21, 2026" → the ticket stub's month, big number (day or year) and small line
function ticketDate(date: string): { month: string; big: string; small?: string } {
  const full = date.match(/^([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/)
  if (full) return { month: full[1].slice(0, 3).toUpperCase(), big: full[2], small: full[3] }
  const my = date.match(/^([A-Za-z]+)\.?\s+(\d{4})$/)
  if (my) return { month: my[1].slice(0, 3).toUpperCase(), big: my[2] }
  return { month: '', big: date }
}

/** A conference ticket: date stub, a perforated tear line, then the details. */
function EventTicket({ fields }: { fields: Record<string, string> }) {
  const d = ticketDate(fields.date ?? '')
  return (
    <div className="mt-6 flex rounded-2xl overflow-hidden bg-white dark:bg-[#111113]
                    border border-black/[0.08] dark:border-white/[0.1] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
      {/* stub */}
      <div className="shrink-0 w-[88px] sm:w-[120px] flex flex-col items-center justify-center py-5
                      bg-[#F3F7FD] dark:bg-[#2997FF]/[0.08]">
        {d.month && (
          <span className="text-[12px] sm:text-[13px] font-semibold tracking-[0.18em] text-[#0071E3] dark:text-[#2997FF]">{d.month}</span>
        )}
        <span className="mt-1 text-[24px] sm:text-[32px] font-semibold leading-none tracking-tight tabular-nums
                         text-[#1D1D1F] dark:text-[#F5F5F7]">{d.big}</span>
        {d.small && <span className="mt-1 text-[12px] sm:text-[13px] font-medium text-secondary">{d.small}</span>}
      </div>
      {/* tear line, with the two notches of a ticket */}
      <div aria-hidden className="relative w-0 border-l-[1.5px] border-dashed border-black/[0.14] dark:border-white/[0.16]">
        <span className="absolute -top-2.5 -left-[11px] w-5 h-5 rounded-full bg-white dark:bg-black border border-black/[0.08] dark:border-white/[0.1]" />
        <span className="absolute -bottom-2.5 -left-[11px] w-5 h-5 rounded-full bg-white dark:bg-black border border-black/[0.08] dark:border-white/[0.1]" />
      </div>
      {/* details */}
      <div className="min-w-0 flex-1 px-4 py-4 sm:px-7 sm:py-6">
        {fields.title && (
          <p className="text-[16px] sm:text-[20px] font-semibold tracking-tight leading-snug text-[#1D1D1F] dark:text-[#F5F5F7]">
            {renderInline(fields.title)}
          </p>
        )}
        {fields.detail && <p className="mt-1 text-[14px] sm:text-[16px] text-secondary">{renderInline(fields.detail)}</p>}
        {(fields.place || fields.note) && (
          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-x-5 gap-y-1.5 text-[13px] sm:text-[14px] text-secondary">
            {fields.place && (
              <span className="inline-flex items-center gap-1.5 text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">
                <MapPin size={14} className="text-[#0071E3] dark:text-[#2997FF]" aria-hidden />{renderInline(fields.place)}
              </span>
            )}
            {fields.note && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} aria-hidden />{renderInline(fields.note)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Columns for 1–4 facts (full class names, so Tailwind generates them)
const INFO_COLS = ['grid-cols-1', 'grid-cols-1', 'grid-cols-1 sm:grid-cols-2', 'grid-cols-1 sm:grid-cols-3', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4']

// "October 2026 (session to be announced)" → main value + a small note
function splitNote(value: string): [string, string | undefined] {
  const m = value.match(/^(.*?)\s*\(([^)]+)\)\s*$/)
  return m ? [m[1], m[2]] : [value, undefined]
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
                  className="scroll-mt-24 mt-12 sm:mt-14 text-[20px] sm:text-[26px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {renderInline(b.text)}
              </h2>
            ) : (
              <h3 key={i} id={b.id}
                  className="scroll-mt-24 mt-8 sm:mt-9 text-[17px] sm:text-[20px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {renderInline(b.text)}
              </h3>
            )
          case 'paragraph':
            return <p key={i} className={`mt-4 sm:mt-5 text-[15px] sm:text-[17px] leading-[1.7] sm:leading-[1.75] text-body ${JUSTIFY}`}>{renderInline(b.text)}</p>
          case 'list':
            return b.ordered ? (
              <ol key={i} className="mt-5 space-y-2.5 list-decimal pl-6 marker:text-secondary marker:font-medium">
                {b.items.map((it, j) => <li key={j} className={`pl-1 text-[15px] sm:text-[17px] leading-[1.7] text-body ${JUSTIFY}`}>{renderInline(it)}</li>)}
              </ol>
            ) : (
              <ul key={i} className="mt-5 space-y-2.5">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3 text-[15px] sm:text-[17px] leading-[1.7] text-body">
                    <span className="mt-[10px] sm:mt-[11px] w-1.5 h-1.5 rounded-full bg-[#1D1D1F]/50 dark:bg-white/50 shrink-0" />
                    <span className={`min-w-0 flex-1 ${JUSTIFY}`}>{renderInline(it)}</span>
                  </li>
                ))}
              </ul>
            )
          case 'callout':
            return (
              <div key={i} className={`mt-6 rounded-xl px-5 py-4 bg-neutral-50 dark:bg-white/[0.04]
                                      border border-black/[0.06] dark:border-white/[0.08]
                                      text-[14.5px] sm:text-[16px] leading-[1.7] text-body ${JUSTIFY}`}>
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
                {b.alt && <figcaption className="mt-2.5 sm:mt-3 text-[13px] sm:text-[14px] leading-relaxed text-secondary text-center">{renderInline(b.alt)}</figcaption>}
              </figure>
            )
          }
          case 'info':
            // A fact strip, not a table: icon, small label, value (and an optional note)
            return (
              <div key={i} className="mt-6 rounded-2xl bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08]
                                      px-5 py-5 sm:px-7 sm:py-6">
                {b.title && <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-secondary">{b.title}</p>}
                <dl className={`grid gap-x-5 gap-y-4 sm:gap-y-6 ${INFO_COLS[Math.min(b.rows.length, 4)]}`}>
                  {b.rows.map(([k, v]) => {
                    const Icon = infoIcon(k)
                    const [value, note] = splitNote(v)
                    return (
                      <div key={k} className="flex gap-3 min-w-0">
                        <span className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center
                                         bg-[#0071E3]/[0.08] text-[#0071E3] dark:bg-[#2997FF]/[0.14] dark:text-[#2997FF]">
                          <Icon size={18} aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <dt className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.08em] text-secondary">{k}</dt>
                          <dd className="mt-0.5 sm:mt-1 text-[14.5px] sm:text-[16px] font-semibold leading-snug text-[#1D1D1F] dark:text-[#F5F5F7]">
                            {renderInline(value)}
                          </dd>
                          {note && <dd className="mt-0.5 text-[12px] sm:text-[13px] leading-snug text-secondary">{renderInline(note)}</dd>}
                        </div>
                      </div>
                    )
                  })}
                </dl>
              </div>
            )
          case 'event':
            return <EventTicket key={i} fields={b.fields} />
          case 'stats':
            return (
              <div key={i} className={`mt-7 grid gap-3 sm:gap-4 ${b.items.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                {b.items.map(it => (
                  <div key={it.value + it.label}
                       className="rounded-2xl px-5 py-5 bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08]">
                    <p className="text-[26px] sm:text-[34px] font-semibold tracking-tight leading-none text-[#0071E3] dark:text-[#2997FF] tabular-nums">
                      {it.value}
                    </p>
                    <p className="mt-2 sm:mt-2.5 text-[14px] sm:text-[15px] font-medium leading-snug text-[#1D1D1F] dark:text-[#F5F5F7]">{renderInline(it.label)}</p>
                    {it.note && <p className="mt-1 text-[12px] sm:text-[13px] text-secondary">{renderInline(it.note)}</p>}
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
                      <span className="text-[16px] sm:text-[18px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">{it.title}</span>
                    </div>
                    <p className={`mt-2.5 sm:mt-3 text-[14.5px] sm:text-[16px] leading-[1.7] text-body ${JUSTIFY}`}>{renderInline(it.text)}</p>
                  </li>
                ))}
              </ol>
            )
          case 'quote':
            return (
              <blockquote key={i} className="my-8 pl-5 sm:pl-6 border-l-[3px] border-[#0071E3] dark:border-[#2997FF]
                                             text-[17px] sm:text-[22px] font-medium leading-[1.5] tracking-tight
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
