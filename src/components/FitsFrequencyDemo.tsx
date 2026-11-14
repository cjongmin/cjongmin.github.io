import { useEffect, useId, useRef, useState } from 'react'

// The FiTS frequency-response demo, placed in a post by a :::fits-frequency-demo block.
// It draws the continuous-time subthreshold magnitude response of a standard LIF neuron and of an
// FS neuron whose adaptation strength κ* comes from the paper's closed-form inverse (Theorem 1),
// so the FS curve peaks exactly at the chosen target frequency. µ and ρ are fixed illustrative
// rates, not learned values, and there are no spikes or resets here.
const MU = 2 * Math.PI * 4     // s⁻¹
const RHO = 2 * Math.PI * 3    // s⁻¹
const MAX_HZ = 30
const MIN_TARGET = 2, MAX_TARGET = 25

function kappaFor(targetHz: number) {
  const w = 2 * Math.PI * targetHz
  return RHO * (RHO + MU) * (Math.sqrt(1 + (1 + (w / RHO) ** 2) ** 2 / (1 + MU / RHO) ** 2) - 1)
}
const lifMagnitude = (hz: number) => 1 / Math.hypot(MU, 2 * Math.PI * hz)
function fsMagnitude(hz: number, kappa: number) {
  const w = 2 * Math.PI * hz
  return Math.hypot(RHO, w) / Math.hypot(MU * RHO + kappa - w * w, (MU + RHO) * w)
}

const hz = (v: number) => `${Number.isInteger(v) ? v : v.toFixed(1)} Hz`

const FS_STROKE = 'stroke-[#208d6d] dark:stroke-[#36a984]'
const FS_FILL = 'fill-[#208d6d] dark:fill-[#36a984]'
const LIF_STROKE = 'stroke-[#9ba7b5] dark:stroke-[#7d8a99]'

export default function FitsFrequencyDemo({ title, description }: { title?: string; description?: string }) {
  const id = useId()
  const [target, setTarget] = useState(10)
  const [reading, setReading] = useState<number | null>(null)
  // Drawn at the plot's real size, so the labels keep the text size of the page. The first
  // render (also the prerendered one) uses a typical width, then the real one is measured.
  const [size, setSize] = useState({ width: 680, font: 13 })
  const boxRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const measure = () => setSize({ width: Math.max(260, box.clientWidth), font: parseFloat(getComputedStyle(box).fontSize) || 13 })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  const { width: W, font } = size
  const k = font / 13
  const padL = 52 * k, padR = 16 * k, padT = 30 * k, padB = 44 * k
  const tick = 12.5 * k
  const H = Math.round(Math.min(Math.max(W * 0.42, 220 * k), 300 * k))
  const x = (f: number) => padL + (W - padL - padR) * f / MAX_HZ
  const y = (v: number) => padT + (H - padT - padB) * (1 - v)

  const kappa = kappaFor(target)
  const fsPeak = fsMagnitude(target, kappa)
  const lif = (f: number) => lifMagnitude(f) / lifMagnitude(0)
  const fs = (f: number) => fsMagnitude(f, kappa) / fsPeak
  // The target itself is one of the samples, so the drawn curve tops out exactly at the marked peak.
  const samples = [...Array.from({ length: 301 }, (_, i) => MAX_HZ * i / 300), target].sort((a, b) => a - b)
  const path = (fn: (f: number) => number) =>
    samples.map((f, i) => `${i ? 'L' : 'M'}${x(f).toFixed(1)} ${y(fn(f)).toFixed(1)}`).join('')

  const peakX = x(target)
  const peakAnchor = peakX > W - padR - 70 * k ? 'end' : peakX < padL + 70 * k ? 'start' : 'middle'
  const lifLabelAt = 28

  const read = (clientX: number, rect: DOMRect) => {
    const f = ((clientX - rect.left) * (W / rect.width) - padL) / (W - padL - padR) * MAX_HZ
    setReading(Math.min(MAX_HZ, Math.max(0, Math.round(f * 2) / 2)))
  }

  return (
    <section aria-labelledby={`${id}-title`}
             className="mt-8 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-neutral-50/70 dark:bg-white/[0.03]
                        px-4 py-5 sm:px-6 sm:py-6 break-inside-avoid">
      <p className="text-[11.5px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] text-secondary">Interactive · Frequency Selectivity</p>
      {title && <p id={`${id}-title`} className="mt-2 text-[16px] sm:text-[18px] font-semibold tracking-tight leading-snug text-[#1D1D1F] dark:text-[#F5F5F7]">{title}</p>}
      {description && <p className="mt-1.5 text-[13.5px] sm:text-[14.5px] leading-relaxed text-secondary">{description}</p>}

      <div className="mt-4 flex items-center gap-3 sm:gap-4">
        <label htmlFor={`${id}-target`} className="shrink-0 text-[13px] sm:text-[14px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Target frequency</label>
        <input id={`${id}-target`} type="range" min={MIN_TARGET} max={MAX_TARGET} step={0.5} value={target}
               onChange={e => setTarget(Number(e.target.value))} aria-valuetext={hz(target)}
               className="min-w-0 flex-1 cursor-pointer rounded-full accent-[#208d6d] dark:accent-[#36a984]
                          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#208d6d] dark:focus-visible:outline-[#36a984]" />
        <output htmlFor={`${id}-target`} className="shrink-0 w-[4.5em] text-right text-[15px] sm:text-[16px] font-semibold tabular-nums text-[#1a7a5d] dark:text-[#36a984]">
          {hz(target)}
        </output>
      </div>

      <div ref={boxRef} className="mt-3 text-[13px]">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="block overflow-visible touch-pan-y select-none" role="img"
             aria-label={`Normalized subthreshold magnitude responses: standard LIF peaks at 0 Hz, FS peaks at the ${hz(target)} target.`}>
          {[0, 0.5, 1].map(v => (
            <g key={v}>
              <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} className="stroke-black/[0.08] dark:stroke-white/[0.1]" strokeWidth={1} />
              <text x={padL - 8 * k} y={y(v) + 4 * k} textAnchor="end" fontSize={tick} className="fill-current text-secondary tabular-nums">{v.toFixed(1)}</text>
            </g>
          ))}
          {[0, 5, 10, 15, 20, 25, 30].map(f => (
            <text key={f} x={x(f)} y={H - padB + 19 * k} textAnchor="middle" fontSize={tick} className="fill-current text-secondary tabular-nums">{f}</text>
          ))}
          <text x={(padL + W - padR) / 2} y={H - 5 * k} textAnchor="middle" fontSize={tick} className="fill-current text-secondary">Frequency (Hz)</text>
          <text transform={`translate(${13 * k} ${(y(0) + y(1)) / 2}) rotate(-90)`} textAnchor="middle" fontSize={tick} className="fill-current text-secondary">Normalized |H|</text>

          <path d={path(lif)} fill="none" strokeWidth={2} strokeDasharray="6 5" strokeLinecap="round" className={LIF_STROKE} />
          <text x={x(lifLabelAt)} y={y(lif(lifLabelAt)) + 17 * k} textAnchor="end" fontSize={tick} className="fill-current text-secondary">Standard LIF</text>

          <line x1={peakX} x2={peakX} y1={y(1)} y2={y(0)} strokeWidth={1.25} strokeDasharray="3 4" className={`${FS_STROKE} opacity-50`} />
          <path d={path(fs)} fill="none" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" className={FS_STROKE} />
          <circle cx={peakX} cy={y(1)} r={5.5 * k} strokeWidth={2} className={`${FS_FILL} stroke-white dark:stroke-[#0b0b0c]`} />
          <text x={peakX} y={y(1) - 11 * k} textAnchor={peakAnchor} fontSize={tick} className="fill-current text-[#1a7a5d] dark:text-[#36a984] font-semibold tabular-nums">
            FS peak · {hz(target)}
          </text>

          {reading !== null && (
            <g pointerEvents="none">
              <line x1={x(reading)} x2={x(reading)} y1={padT} y2={y(0)} strokeWidth={1} className="stroke-black/25 dark:stroke-white/30" />
              <circle cx={x(reading)} cy={y(lif(reading))} r={3.5 * k} className="fill-[#9ba7b5] dark:fill-[#7d8a99]" />
              <circle cx={x(reading)} cy={y(fs(reading))} r={3.5 * k} className={FS_FILL} />
            </g>
          )}
          <rect x={padL} y={padT} width={W - padL - padR} height={y(0) - padT} fill="transparent"
                onPointerMove={e => read(e.clientX, (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect())}
                onPointerDown={e => read(e.clientX, (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect())}
                onPointerLeave={() => setReading(null)} />
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] sm:text-[13px] text-secondary">
        <span className="inline-flex items-center gap-2">
          <svg width="22" height="6" aria-hidden><line x1="1" x2="21" y1="3" y2="3" strokeWidth="2.5" strokeLinecap="round" className={FS_STROKE} /></svg>
          FS · learnable peak
        </span>
        <span className="inline-flex items-center gap-2">
          <svg width="22" height="6" aria-hidden><line x1="1" x2="21" y1="3" y2="3" strokeWidth="2" strokeDasharray="5 4" className={LIF_STROKE} /></svg>
          Standard LIF · peak at 0 Hz
        </span>
        <span className="tabular-nums sm:ml-auto min-h-[1.4em]">
          {reading !== null && <>At {hz(reading)}: FS {fs(reading).toFixed(2)} · LIF {lif(reading).toFixed(2)}</>}
        </span>
      </div>

      <p className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] text-[12px] sm:text-[12.5px] leading-relaxed text-secondary">
        Each curve is normalized by its own peak. This illustration shows continuous-time subthreshold responses without
        spikes or resets; it is not a learned result or empirical measurement. µ = 2π × 4 s⁻¹ and ρ = 2π × 3 s⁻¹ are fixed
        demonstration values, κ* comes from the inverse in Theorem 1, and the 2–25 Hz range is illustrative.
      </p>
    </section>
  )
}
