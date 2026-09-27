export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** 1rem in px. The root font size grows on very wide screens (index.css). */
export function remPx(): number {
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
}

export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    const navHeight = 4 * remPx() // header is h-16
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight
    window.scrollTo({ top, behavior: 'smooth' })
  }
}
