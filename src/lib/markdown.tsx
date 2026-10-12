import { Fragment, ReactNode } from 'react'
import { CalendarDays, CalendarPlus, ChevronRight, Clock, Info, Landmark, MapPin, Presentation, Users } from 'lucide-react'

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
 *   ==key phrase==        → blue emphasis      {{key property}} → red bold emphasis (use both sparingly)
 *   $\alpha$              → inline maths; a $$ … $$ block (on its own lines) is displayed maths.
 *                          Both are rendered to SVG with MathJax at build time and arrive as @@MATH@@ markers.
 *
 * Visual blocks, one item per line between ::: fences:
 *   :::info Title          Key: Value           → a fact card
 *   :::event               Date / Title / Detail / Place / Time / Note / Calendar: …  → a ticket
 *                          (date stub + details; Calendar is a link to an .ics file)
 *   :::stats               value | label | note → number tiles
 *   :::steps               Title | lead | text  → numbered steps, stacked (lead is optional)
 *   :::quote               text                 → a highlighted question / pull quote
 *   :::details Title       markdown             → a collapsed aside (detail, caveats); opens for print
 *   :::lead                paragraphs + one ![caption](/figure.webp)
 *                          → an opening like wrapfigure: the figure floats right and the text wraps
 *                            around it (from lg; stacked below)
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
  | { kind: 'steps'; items: { title: string; lead?: string; text: string }[] }
  | { kind: 'math'; html: string }
  | { kind: 'quote'; text: string }
  | { kind: 'lead'; blocks: Block[]; figure?: { src: string; alt: string } }
  | { kind: 'details'; title: string; blocks: Block[] }

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

    if (line.startsWith('@@MATHBLOCK@@')) {
      blocks.push({ kind: 'math', html: decodeURIComponent(line.slice('@@MATHBLOCK@@'.length)) })
      i++
      continue
    }

    const det = line.match(/^:::details\s+(.+)$/)
    if (det) {
      const raw: string[] = []
      i++
      while (i < lines.length && lines[i].trim() !== ':::') raw.push(lines[i++])
      i++                                                     // closing :::
      blocks.push({ kind: 'details', title: det[1].trim(), blocks: parseMarkdown(raw.join('\n')) })
      continue
    }

    if (/^:::lead\s*$/.test(line)) {
      // keep blank lines: the lead is regular markdown (paragraphs) plus one figure
      const raw: string[] = []
      i++
      while (i < lines.length && lines[i].trim() !== ':::') raw.push(lines[i++])
      i++                                                     // closing :::
      const inner = parseMarkdown(raw.join('\n'))
      const img = inner.find((b): b is Extract<Block, { kind: 'image' }> => b.kind === 'image')
      blocks.push({ kind: 'lead', blocks: inner.filter(b => b !== img), figure: img && { src: img.src, alt: img.alt } })
      continue
    }

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
        blocks.push({ kind: 'steps', items: body.map(l => {
          const c = cells(l)
          return c.length >= 3 ? { title: c[0], lead: c[1], text: c.slice(2).join(' | ') } : { title: c[0], text: c[1] ?? '' }
        }) })
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
    while (i < lines.length && lines[i].trim() && !/^(#{1,2}\s|>|!\[|:::|@@MATHBLOCK@@|\s*[-*]\s|\s*\d+\.\s|-{3,}$)/.test(lines[i])) {
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

/** A tear line between ticket parts, with the two notches of a ticket. */
function TearLine({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`relative w-0 border-l-[1.5px] border-dashed border-black/[0.14] dark:border-white/[0.16] ${className}`}>
      <span className="absolute -top-2.5 -left-[11px] w-5 h-5 rounded-full bg-white dark:bg-black border border-black/[0.08] dark:border-white/[0.1]" />
      <span className="absolute -bottom-2.5 -left-[11px] w-5 h-5 rounded-full bg-white dark:bg-black border border-black/[0.08] dark:border-white/[0.1]" />
    </div>
  )
}

/**
 * A conference ticket in three parts: the date stub, the details, and an "Add to
 * calendar" stub on the right (a strip along the bottom on phones).
 */
function EventTicket({ fields }: { fields: Record<string, string> }) {
  const d = ticketDate(fields.date ?? '')
  return (
    <div className="mt-6 flex rounded-2xl overflow-hidden bg-white dark:bg-[#111113] break-inside-avoid
                    border border-black/[0.08] dark:border-white/[0.1] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
      {/* date stub */}
      <div className="shrink-0 w-[78px] sm:w-[104px] flex flex-col items-center justify-center py-4 bg-[#F3F7FD] dark:bg-[#2997FF]/[0.08]">
        {d.month && (
          <span className="text-[12px] sm:text-[13px] font-semibold tracking-[0.18em] text-[#0071E3] dark:text-[#2997FF]">{d.month}</span>
        )}
        <span className="mt-1 text-[24px] sm:text-[30px] font-semibold leading-none tracking-tight tabular-nums text-[#1D1D1F] dark:text-[#F5F5F7]">
          {d.big}
        </span>
        {d.small && <span className="mt-1 text-[12px] sm:text-[13px] font-medium text-secondary">{d.small}</span>}
      </div>
      <TearLine />

      <div className="min-w-0 flex-1 flex flex-col sm:flex-row">
        {/* details */}
        <div className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-5">
          {fields.title && (
            <p className="text-[16px] sm:text-[20px] font-semibold tracking-tight leading-snug text-[#1D1D1F] dark:text-[#F5F5F7]">
              {renderInline(fields.title)}
            </p>
          )}
          {fields.detail && <p className="mt-0.5 text-[14px] sm:text-[16px] text-secondary">{renderInline(fields.detail)}</p>}
          {(fields.time || fields.place || fields.note) && (
            <div className="mt-3 flex flex-col gap-1.5 text-[14px] sm:text-[16px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
              {fields.time && (
                <span className="inline-flex items-start gap-2">
                  <Clock size={16} className="mt-[3px] sm:mt-1 shrink-0 text-[#0071E3] dark:text-[#2997FF]" aria-hidden />{renderInline(fields.time)}
                </span>
              )}
              {fields.place && (
                <span className="inline-flex items-start gap-2">
                  <MapPin size={16} className="mt-[3px] sm:mt-1 shrink-0 text-[#0071E3] dark:text-[#2997FF]" aria-hidden />{renderInline(fields.place)}
                </span>
              )}
              {fields.note && (
                <span className="inline-flex items-start gap-2 font-normal text-secondary">
                  <Info size={16} className="mt-[3px] sm:mt-1 shrink-0" aria-hidden />{renderInline(fields.note)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* calendar stub */}
        {fields.calendar && (
          <>
            <TearLine className="hidden sm:block" />
            <a href={fields.calendar} download aria-label="Add to calendar"
               className="shrink-0 sm:w-[112px] flex sm:flex-col items-center justify-center gap-2 sm:gap-1.5 py-2.5 sm:py-4 print:hidden
                          border-t border-dashed border-black/[0.12] dark:border-white/[0.16] sm:border-t-0
                          bg-rose-50 dark:bg-rose-500/[0.10] text-rose-700 dark:text-rose-300
                          hover:bg-rose-100 dark:hover:bg-rose-500/[0.16] transition-colors">
              <CalendarPlus size={20} aria-hidden />
              <span className="text-[13px] sm:text-[13px] font-semibold leading-tight text-center">
                Add to<span className="sm:hidden"> </span><br className="hidden sm:block" />calendar
              </span>
            </a>
          </>
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
  return text.split(/(@@MATH@@[^@]+@@|\{\{[^}]+\}\}|==[^=]+==|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/).map((part, i) => {
    if (part.startsWith('@@MATH@@') && part.endsWith('@@')) {
      return <span key={i} className="mjx-inline" dangerouslySetInnerHTML={{ __html: decodeURIComponent(part.slice(8, -2)) }} />
    }
    if (part.startsWith('{{') && part.endsWith('}}')) {
      // same red as the emphasis in Recent News
      return <strong key={i} className="font-semibold text-rose-700 dark:text-rose-400">{renderInline(part.slice(2, -2))}</strong>
    }
    if (part.length > 4 && part.startsWith('==') && part.endsWith('==')) {
      return <strong key={i} className="font-semibold text-[#0062C4] dark:text-[#5AB0FF]">{renderInline(part.slice(2, -2))}</strong>
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{renderInline(part.slice(2, -2))}</strong>
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
          case 'details':
            return (
              <details key={i} className="group mt-6 rounded-xl border border-black/[0.06] dark:border-white/[0.08]
                                          bg-neutral-50/70 dark:bg-white/[0.03] break-inside-avoid">
                <summary className="flex items-center gap-2 px-4 sm:px-5 py-3 cursor-pointer select-none list-none
                                    [&::-webkit-details-marker]:hidden text-[13.5px] sm:text-[14px] font-medium text-secondary
                                    hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">
                  <ChevronRight size={14} className="shrink-0 transition-transform group-open:rotate-90" aria-hidden />
                  {renderInline(b.title)}
                </summary>
                <div className="px-4 sm:px-5 pb-4 [&>*:first-child]:mt-0">
                  <MarkdownBody blocks={b.blocks} />
                </div>
              </details>
            )
          case 'lead': {
            // Opening of a post, like LaTeX's wrapfigure: from lg the figure floats right and the
            // text wraps around it, running full width once it passes the figure (flow-root keeps
            // the next heading below). Below lg the text comes first and the figure follows.
            const fig = b.figure
            const figure = (cls: string) => fig && (
              <figure className={cls}>
                <button
                  type="button"
                  onClick={() => onImageClick?.({ src: fig.src, alt: fig.alt, chart: true })}
                  aria-label={`Enlarge image: ${fig.alt}`}
                  className="block w-full rounded-xl overflow-hidden bg-white cursor-zoom-in"
                >
                  <img src={fig.src} alt={fig.alt} loading="lazy" decoding="async" className="w-full h-auto" />
                </button>
                {fig.alt && (
                  <figcaption className="mt-2 text-[12.5px] sm:text-[13px] lg:text-[12px] xl:text-[13px] leading-snug text-secondary text-center">
                    {renderInline(fig.alt)}
                  </figcaption>
                )}
              </figure>
            )
            return (
              <div key={i} className="mt-4 sm:mt-5 flow-root">
                {figure('hidden lg:block float-right w-1/2 ml-8 mb-3 mt-1')}
                <div className="[&>*:first-child]:mt-0">
                  <MarkdownBody blocks={b.blocks} onImageClick={onImageClick} />
                </div>
                {figure('lg:hidden mt-6 max-w-[560px] mx-auto')}
              </div>
            )
          }
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
            // Stacked steps joined by a thin line: number, title, an optional bold lead, then the text
            return (
              <ol key={i} className="mt-7 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] px-5 py-5 sm:px-7 sm:py-6">
                {b.items.map((it, j) => (
                  <li key={it.title} className="relative flex gap-4 sm:gap-5 pb-6 last:pb-0">
                    {j < b.items.length - 1 && (
                      <span aria-hidden className="absolute left-[13px] sm:left-[15px] top-9 bottom-1 w-px bg-black/[0.1] dark:bg-white/[0.14]" />
                    )}
                    <span className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0071E3] dark:bg-[#2997FF] text-white text-[13px] sm:text-[14px]
                                     font-semibold flex items-center justify-center tabular-nums">{j + 1}</span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[16px] sm:text-[18px] leading-snug tracking-tight">
                        <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{it.title}</span>
                        {it.lead && <span className="text-secondary"> — {renderInline(it.lead)}</span>}
                      </p>
                      <p className={`mt-2 text-[14.5px] sm:text-[16px] leading-[1.7] text-body ${JUSTIFY}`}>{renderInline(it.text)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )
          case 'math':
            return (
              // centred; a formula wider than the column scrolls inside its own box instead of overflowing
              <div key={i} className="mjx-block mt-6 mb-2 overflow-x-auto overflow-y-hidden py-2 text-center
                                      text-[#1D1D1F] dark:text-[#F5F5F7] text-[15px] sm:text-[18px]"
                   dangerouslySetInnerHTML={{ __html: b.html }} />
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
