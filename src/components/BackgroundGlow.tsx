export default function BackgroundGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 0 }}
    >
      {/* Hero — top-left */}
      <div
        className="absolute rounded-full bg-blue-200/25 dark:bg-blue-500/[5] blur-[200px]"
        style={{ width: '60vw', height: '60vw', top: '-20vw', left: '-18vw' }}
      />
      {/* Hero — top-right */}
      <div
        className="absolute rounded-full bg-violet-200/20 dark:bg-violet-500/[4] blur-[180px]"
        style={{ width: '42vw', height: '42vw', top: '-8vw', right: '-14vw' }}
      />
      {/* About → Publications — mid-left */}
      <div
        className="absolute rounded-full bg-sky-200/15 dark:bg-sky-500/[3] blur-[200px]"
        style={{ width: '52vw', height: '52vw', top: '90vh', left: '-16vw' }}
      />
      {/* Publications → Experience — mid-right */}
      <div
        className="absolute rounded-full bg-indigo-200/15 dark:bg-indigo-500/[3] blur-[200px]"
        style={{ width: '48vw', height: '48vw', top: '185vh', right: '-18vw' }}
      />
      {/* Contact — bottom */}
      <div
        className="absolute rounded-full bg-blue-200/20 dark:bg-blue-500/[4] blur-[190px]"
        style={{ width: '54vw', height: '54vw', top: '290vh', left: '10vw' }}
      />
    </div>
  )
}
