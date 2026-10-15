// A talk post as its own page, /talks/<no>/ (see main.tsx and scripts/prerender.mjs).
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import TalkDetail from './components/TalkDetail'
import { talkPath, talks } from './data/talks'

export default function TalkPage({ no }: { no: number }) {
  const talk = talks.find(t => t.no === no)
  if (!talk) return null
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <TalkDetail
          talk={talk}
          standalone
          onClose={() => window.location.assign('/#talks')}
          onNavigate={t => window.location.assign(talkPath(t))}
        />
      </MotionConfig>
    </LazyMotion>
  )
}
