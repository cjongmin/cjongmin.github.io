/** A small manila folder, the mark that ties the home-page section to the album pages. */
export default function FolderGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 16" aria-hidden className={`w-[20px] h-[16px] shrink-0 ${className}`}>
      <path d="M1 3a2 2 0 0 1 2-2h4.2c.5 0 1 .2 1.4.6L10 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3Z" fill="#C9A55F" />
      <path d="M1 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7Z" fill="#EBCD8B" />
    </svg>
  )
}
