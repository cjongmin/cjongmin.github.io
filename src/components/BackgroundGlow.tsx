/*
 * Decorative background glows.
 * Uses pre-faded radial gradients instead of `filter: blur(...)` —
 * huge blurred layers force expensive GPU repaints on every scroll,
 * while gradients rasterize once and scroll for free.
 */
const ORBS: { className: string; style: React.CSSProperties }[] = [
  // Hero — top-left
  { className: 'glow-orb glow-blue',   style: { width: '60vw', height: '60vw', top: '-20vw', left: '-18vw' } },
  // Hero — top-right
  { className: 'glow-orb glow-violet', style: { width: '42vw', height: '42vw', top: '-8vw', right: '-14vw' } },
  // About → Publications — mid-left
  { className: 'glow-orb glow-sky',    style: { width: '52vw', height: '52vw', top: '90vh', left: '-16vw' } },
  // Publications → Experience — mid-right
  { className: 'glow-orb glow-indigo', style: { width: '48vw', height: '48vw', top: '185vh', right: '-18vw' } },
  // Contact — bottom
  { className: 'glow-orb glow-blue',   style: { width: '54vw', height: '54vw', top: '290vh', left: '10vw' } },
]

export default function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: 0 }}>
      {ORBS.map((orb, i) => (
        <div key={i} className={orb.className} style={orb.style} />
      ))}
    </div>
  )
}
