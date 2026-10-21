import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  onToggle: () => void
}

// The icon follows the `dark` class on <html> (set before the first paint), not React state,
// so the prerendered button is already right and matches what hydration renders.
export default function ThemeToggle({ onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle dark mode"
      className="w-9 h-9 flex items-center justify-center rounded-full
                 bg-black/[0.06] dark:bg-white/10
                 hover:bg-black/[0.1] dark:hover:bg-white/[0.15]
                 transition-colors duration-150"
    >
      <Moon size={16} className="text-[#1D1D1F] dark:hidden" aria-hidden />
      <Sun size={16} className="hidden dark:block text-[#F5F5F7]" aria-hidden />
    </button>
  )
}
