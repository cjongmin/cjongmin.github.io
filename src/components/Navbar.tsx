import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { scrollToSection } from '../lib/utils'

interface NavbarProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const NAV_ITEMS = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Publications', id: 'publications' },
  { label: 'Experience', id: 'experience' },
  { label: 'Contact', id: 'contact' },
]

export default function Navbar({ theme, toggleTheme }: NavbarProps) {
  const [activeSection, setActiveSection] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)

      const sections = NAV_ITEMS.map(i => document.getElementById(i.id)).filter(Boolean) as HTMLElement[]
      const navH = 64
      for (let i = sections.length - 1; i >= 0; i--) {
        const top = sections[i].getBoundingClientRect().top
        if (top <= navH + 40) {
          setActiveSection(NAV_ITEMS[i].id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (id: string) => {
    scrollToSection(id)
    setMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300
        ${scrolled
          ? 'bg-white/88 dark:bg-black/88 backdrop-blur-2xl border-b border-black/[0.07] dark:border-white/[0.07]'
          : 'bg-white/55 dark:bg-black/50 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.04]'
        }`}
    >
      <div className="section-container h-full flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNav('home')}
          className="font-semibold text-[15px] tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] hover:opacity-60 transition-opacity duration-150"
        >
          Jongmin Choi
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150
                ${activeSection === item.id
                  ? 'bg-black/[0.07] dark:bg-white/[0.1] text-[#1D1D1F] dark:text-[#F5F5F7]'
                  : 'text-secondary hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full
                       bg-black/[0.05] dark:bg-white/[0.08]
                       hover:bg-black/[0.09] dark:hover:bg-white/[0.13]
                       transition-colors duration-150"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 dark:bg-[#111]/95 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.07] py-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors
                ${activeSection === item.id
                  ? 'text-[#1D1D1F] dark:text-[#F5F5F7]'
                  : 'text-secondary hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  )
}
