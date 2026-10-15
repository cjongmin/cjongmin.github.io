// The way to world.cjmin.me, the floating island: a round button beside the theme toggle.
export default function WorldLink() {
  return (
    <a
      href="https://world.cjmin.me/"
      aria-label="Visit Jongmin's Island"
      title="Jongmin's Island"
      className="w-9 h-9 flex items-center justify-center rounded-full
                 bg-black/[0.06] dark:bg-white/10
                 hover:bg-black/[0.1] dark:hover:bg-white/[0.15]
                 text-[#1D1D1F] dark:text-[#F5F5F7]
                 transition-colors duration-150"
    >
      {/* a small floating island: grass, a tree, a cottage, and the rock hanging below */}
      <svg viewBox="0 0 24 24" className="w-[19px] h-[19px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2.5 12h19" />
        <path d="M4 12c1.4 3.6 4.6 7 8 7.5 3.4-.5 6.6-3.9 8-7.5" />
        <path d="M8 12V8.6" />
        <circle cx="8" cy="6.4" r="2.3" />
        <path d="M13.5 12V9l2.75-2.2L19 9v3" />
      </svg>
    </a>
  )
}
