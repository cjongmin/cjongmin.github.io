import { useState, useEffect } from 'react'
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import Navbar from './components/Navbar'
import Intro from './components/Intro'
import Publications from './components/Publications'
import Talks from './components/Talks'
import Education from './components/Education'
import Projects from './components/Projects'
import Contact from './components/Contact'
import BackgroundGlow from './components/BackgroundGlow'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'   // build-time prerender
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
    // the browser's address-bar colour follows the site's own toggle, not just the OS setting
    document.querySelectorAll('meta[name="theme-color"]').forEach(m =>
      m.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff'))
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    // LazyMotion + m components ship only the animation features in use (strict:
    // a plain motion.* component would throw). "Reduce motion" in the OS turns
    // the fade / slide-in animations off.
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <div className="relative min-h-screen overflow-x-hidden">
          <BackgroundGlow />
          <Navbar theme={theme} toggleTheme={toggleTheme} />
          <main>
            <ErrorBoundary>
              <Intro />
              <Publications />
              <Talks />
              <Education />
              <Projects />
              <Contact />
            </ErrorBoundary>
          </main>
          <footer className="py-6 text-center text-secondary text-[14px] border-t border-black/[0.06] dark:border-white/[0.06]">
            <p>© {new Date().getFullYear()} Jongmin Choi</p>
          </footer>
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}
