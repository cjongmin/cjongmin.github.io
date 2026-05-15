import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Publications from './components/Publications'
import Experience from './components/Experience'
import Contact from './components/Contact'
import BackgroundGlow from './components/BackgroundGlow'

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BackgroundGlow />
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero />
        <About />
        <Publications />
        <Experience />
        <Contact />
      </main>
      <footer className="py-6 text-center text-secondary text-xs border-t border-black/[0.06] dark:border-white/[0.06]">
        <p>© {new Date().getFullYear()} Jongmin Choi · Built with React + Vite</p>
      </footer>
    </div>
  )
}
