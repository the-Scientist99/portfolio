import { useCallback, useEffect, useRef, useState } from 'react'
import { blip, ensure, master } from '../os/audio'

/**
 * A chiptune generated with oscillators rather than a shipped audio file:
 * no binary in the repo, no sample licence.
 *
 * Volume lives in the taskbar tray, not here — one mixer for the whole OS.
 * This never autoplays.
 */

// Semitone offsets from A4 (440Hz). -1 is a rest.
const LEAD = [
  4, 4, 11, 11, 9, 9, 7, 7, 4, -1, 7, 7, 9, 9, 11, -1,
  4, 4, 11, 11, 12, 12, 11, 9, 7, -1, 4, 4, 7, 7, 4, -1,
]
const BASS = [
  -8, -8, -8, -8, -13, -13, -13, -13, -6, -6, -6, -6, -8, -8, -8, -8,
  -8, -8, -8, -8, -13, -13, -13, -13, -11, -11, -11, -11, -8, -8, -8, -8,
]

const STEP_MS = 160
const hz = (semitone: number) => 440 * Math.pow(2, semitone / 12)

export function MediaPlayer() {
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(0)

  const analyserRef = useRef<AnalyserNode | null>(null)
  const timerRef = useRef<number | null>(null)
  const stepRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)

  // Stop the sequencer when the window closes. The audio context itself is
  // shared and outlives this component, so it is deliberately not closed.
  useEffect(() => () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    analyserRef.current?.disconnect()
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return
    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return

    const bins = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(bins)

    const { width, height } = canvas
    ctx2d.fillStyle = '#000'
    ctx2d.fillRect(0, 0, width, height)

    const bars = 28
    const bw = width / bars
    for (let i = 0; i < bars; i++) {
      const v = (bins[Math.floor((i / bars) * bins.length * 0.6)] ?? 0) / 255
      const h = Math.max(1, v * height)
      ctx2d.fillStyle = v > 0.75 ? '#ff4d4d' : v > 0.45 ? '#ffd24d' : '#33ff99'
      ctx2d.fillRect(i * bw + 1, height - h, bw - 2, h)
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  const stop = useCallback(() => {
    setPlaying(false)
    if (timerRef.current !== null) { window.clearInterval(timerRef.current); timerRef.current = null }
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    const canvas = canvasRef.current
    const c = canvas?.getContext('2d')
    if (canvas && c) { c.fillStyle = '#000'; c.fillRect(0, 0, canvas.width, canvas.height) }
  }, [])

  const play = useCallback(() => {
    // Called from a click, so this is a legal moment to start audio.
    const ctx = ensure()
    const dest = master()
    if (!ctx || !dest) return

    // Tap the master bus for the visualizer without altering what is heard.
    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      dest.connect(analyser)
      analyserRef.current = analyser
    }

    timerRef.current = window.setInterval(() => {
      const i = stepRef.current % LEAD.length
      const lead = LEAD[i]!
      const bass = BASS[i]!
      if (lead >= 0) blip(hz(lead), 'square', 0.16, 0.25)
      if (bass >= 0) blip(hz(bass), 'triangle', 0.22, 0.32)
      if (i % 4 === 0) blip(90, 'sawtooth', 0.06, 0.18)
      stepRef.current++
      setStep(stepRef.current)
    }, STEP_MS)

    setPlaying(true)
    rafRef.current = requestAnimationFrame(draw)
  }, [draw])

  const bar = Math.floor((step % LEAD.length) / 4) + 1

  return (
    <div className="window-body flush mp">
      <div className="mp-screen">
        <div className="mp-title">
          {playing ? `▶ PLAYING — bar ${bar}/8` : '■ STOPPED'} · kardovic.mod
        </div>
        <canvas ref={canvasRef} className="mp-viz" width={280} height={44}
          aria-hidden="true" />
      </div>

      <div className="mp-controls">
        <button type="button" onClick={playing ? stop : play} data-autofocus
          aria-label={playing ? 'Stop' : 'Play'}>
          {playing ? '■' : '▶'}
        </button>
        <span style={{ color: '#444' }}>Volume is in the taskbar tray.</span>
      </div>

      <div className="statusbar">
        <div>Synthesised live. No audio files were harmed.</div>
      </div>
    </div>
  )
}
