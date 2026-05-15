export default function BackgroundGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 0 }}
    >
      {/* Hero — top-left */}
      <div
        className="absolute rounded-full bg-blue-200/[0.18] dark:bg-white/[0.13] blur-[160px]"
        style={{ width: '60vw', height: '60vw', top: '-20vw', left: '-18vw' }}
      />
      {/* Hero — top-right */}
      <div
        className="absolute rounded-full bg-violet-200/[0.14] dark:bg-white/[0.09] blur-[140px]"
        style={{ width: '42vw', height: '42vw', top: '-8vw', right: '-14vw' }}
      />
      {/* About → Publications — mid-left */}
      <div
        className="absolute rounded-full bg-sky-200/[0.11] dark:bg-white/[0.07] blur-[180px]"
        style={{ width: '52vw', height: '52vw', top: '90vh', left: '-16vw' }}
      />
      {/* Publications → Experience — mid-right */}
      <div
        className="absolute rounded-full bg-indigo-200/[0.11] dark:bg-white/[0.07] blur-[170px]"
        style={{ width: '48vw', height: '48vw', top: '185vh', right: '-18vw' }}
      />
      {/* Contact — bottom */}
      <div
        className="absolute rounded-full bg-blue-200/[0.14] dark:bg-white/[0.09] blur-[160px]"
        style={{ width: '54vw', height: '54vw', top: '290vh', left: '10vw' }}
      />
    </div>
  )
}
