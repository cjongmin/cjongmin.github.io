import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle: () => void
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 flex items-center justify-center rounded-full
                 bg-black/[0.06] dark:bg-white/10
                 hover:bg-black/[0.1] dark:hover:bg-white/[0.15]
                 transition-colors duration-150"
    >
      {theme === 'dark' ? (
        <Sun size={16} className="text-[#F5F5F7]" />
      ) : (
        <Moon size={16} className="text-[#1D1D1F]" />
      )}
    </button>
  )
}
