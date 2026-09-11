import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * A chiptune generated with oscillators rather than a shipped audio file:
 * no binary in the repo, no sample licence, and the visualizer reads the
 * same graph it plays through.
 *
 * Never autoplays. Browsers block it anyway, and it would be rude.
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
  const [volume, setVolume] = useState(0.4)
  const [step, setStep] = useState(0)

  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const timerRef = useRef<number | null>(null)
  const stepRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)

  // Tear the audio graph down when the window closes.
  useEffect(() => () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    void ctxRef.current?.close()
  }, [])

  useEffect(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setTargetAtTime(volume, ctxRef.current.currentTime, 0.01)
    }
  }, [volume])

  const blip = useCallback((
    ctx: AudioContext, dest: AudioNode, freq: number,
    type: OscillatorType, length: number, level: number,
  ) => {
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    env.gain.setValueAtTime(0, ctx.currentTime)
    env.gain.linearRampToValueAtTime(level, ctx.currentTime + 0.008)
    env.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + length)
    osc.connect(env).connect(dest)
    osc.start()
    osc.stop(ctx.currentTime + length + 0.02)
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
    // The AudioContext is created inside the click handler so the browser's
    // autoplay policy lets it start.
    let ctx = ctxRef.current
    if (!ctx) {
      ctx = new AudioContext()
      const gain = ctx.createGain()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      gain.gain.value = volume
      gain.connect(analyser).connect(ctx.destination)
      ctxRef.current = ctx
      gainRef.current = gain
      analyserRef.current = analyser
    }
    void ctx.resume()

    const audioCtx = ctx
    const dest = gainRef.current!

    timerRef.current = window.setInterval(() => {
      const i = stepRef.current % LEAD.length
      const lead = LEAD[i]!
      const bass = BASS[i]!
      if (lead >= 0) blip(audioCtx, dest, hz(lead), 'square', 0.16, 0.25)
      if (bass >= 0) blip(audioCtx, dest, hz(bass), 'triangle', 0.22, 0.32)
      if (i % 4 === 0) blip(audioCtx, dest, 90, 'sawtooth', 0.06, 0.18)
      stepRef.current++
      setStep(stepRef.current)
    }, STEP_MS)

    setPlaying(true)
    rafRef.current = requestAnimationFrame(draw)
  }, [blip, draw, volume])

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
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1 }}>
          Vol
          <input
            type="range" min={0} max={100} value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            style={{ flex: 1, minWidth: 70 }}
            aria-label="Volume"
          />
        </label>
      </div>

      <div className="statusbar">
        <div>Synthesised live. No audio files were harmed.</div>
      </div>
    </div>
  )
}
