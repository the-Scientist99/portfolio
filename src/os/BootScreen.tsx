import { useEffect, useRef, useState } from 'react'
import { profile } from '../content'

const POST = [
  'Award Modular BIOS v4.51PG, An Energy Star Ally',
  'Copyright (C) 1984-96, Award Software, Inc.',
  '',
  'KARDOVIC SYSTEMS BIOS (2A59IK2AC)',
  '',
  'Main Processor     : Pentium-S MMX 233MHz',
  'Memory Test        : 65536K OK',
  '',
  'Detecting HDD Primary Master   ... KARDOVIC-HDD-1024',
  'Detecting HDD Primary Slave    ... None',
  'Detecting Coffee Supply        ... OK',
  '',
  'Press DEL to enter SETUP, anything at all to skip',
  'Starting Windows 95...',
]

const LINE_MS = 110
const SPLASH_MS = 1100

type Phase = 'post' | 'splash'

/**
 * Boot sequence. Any input skips it, and it plays once per browser session
 * rather than on every reload — the third visit should not cost three
 * seconds.
 */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('post')
  const [shown, setShown] = useState(0)
  const done = useRef(false)

  const finish = useRef(() => {
    if (done.current) return
    done.current = true
    onDone()
  })

  // Any key, click, or touch skips the whole thing.
  useEffect(() => {
    const skip = () => finish.current()
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'post') return
    if (shown >= POST.length) {
      const t = window.setTimeout(() => setPhase('splash'), 220)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(() => setShown((n) => n + 1), LINE_MS)
    return () => window.clearTimeout(t)
  }, [phase, shown])

  useEffect(() => {
    if (phase !== 'splash') return
    const t = window.setTimeout(() => finish.current(), SPLASH_MS)
    return () => window.clearTimeout(t)
  }, [phase])

  if (phase === 'splash') {
    return (
      <div className="splash" role="status" aria-label="Starting up">
        <div className="splash-card">
          <h1>{profile.name}</h1>
          <p>{profile.role}</p>
        </div>
        <div className="splash-bar" aria-hidden="true"><i /></div>
        <button
          type="button"
          onClick={() => finish.current()}
          style={{ marginTop: 8 }}
        >
          Skip
        </button>
      </div>
    )
  }

  return (
    <div className="boot" role="status" aria-label="System starting">
      <pre>{POST.slice(0, shown).join('\n')}</pre>
      <div className="hint">press any key to skip</div>
    </div>
  )
}
