// A talk post as its own page, /talks/<id>/ (see main.tsx and scripts/prerender.mjs).
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import TalkDetail from './components/TalkDetail'
import { talks } from './data/talks'

export default function TalkPage({ id }: { id: string }) {
  const talk = talks.find(t => t.id === id)
  if (!talk) return null
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <TalkDetail
          talk={talk}
          standalone
          onClose={() => window.location.assign('/#talks')}
          onNavigate={t => window.location.assign(`/talks/${t.id}/`)}
        />
      </MotionConfig>
    </LazyMotion>
  )
}
