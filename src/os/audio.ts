/**
 * The single audio graph for the whole OS.
 *
 * Everything that makes noise — the Media Player, the startup chime, the
 * error ding — runs through one AudioContext and one master GainNode, so the
 * taskbar volume control governs all of it. A second context would mean a
 * second volume nobody can find.
 *
 * The context is created lazily: browsers refuse to start one before a user
 * gesture, so `ensure()` is only ever called from a click, a keypress, or
 * something downstream of one.
 */

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null

/** Last requested level, so unmuting restores it rather than guessing. */
let level = 0.35
let isMuted = false

/**
 * Effective gain for a given volume and mute state.
 *
 * Pure, and the only branching logic in this module — hence the unit test.
 * Out-of-range input is clamped rather than rejected: a slider bug should
 * make the audio wrong, not throw in an audio callback.
 */
export function effectiveGain(volume: number, muted: boolean): number {
  if (muted) return 0
  if (!Number.isFinite(volume)) return 0
  return Math.min(1, Math.max(0, volume))
}

/**
 * Create the graph if it does not exist yet, and resume it if the browser
 * suspended it. Returns null when Web Audio is unavailable.
 */
export function ensure(): AudioContext | null {
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  }
  try {
    ctx = new AudioContext()
    masterGain = ctx.createGain()
    masterGain.gain.value = effectiveGain(level, isMuted)
    masterGain.connect(ctx.destination)
    return ctx
  } catch {
    // No Web Audio (very old browser, or blocked). Everything else degrades.
    ctx = null
    masterGain = null
    return null
  }
}

/** The node every sound source should connect to. Null before `ensure()`. */
export function master(): GainNode | null {
  return masterGain
}

/** True once a context exists and is actually running. */
export function isRunning(): boolean {
  return ctx?.state === 'running'
}

/**
 * Apply a volume/mute setting. Safe to call before any context exists — the
 * value is remembered and applied when one is created.
 */
export function applyVolume(volume: number, muted: boolean): void {
  level = volume
  isMuted = muted
  if (!masterGain || !ctx) return
  // Ramp rather than jump, so dragging the slider does not click.
  masterGain.gain.setTargetAtTime(effectiveGain(volume, muted), ctx.currentTime, 0.015)
}

/**
 * One oscillator with a percussive envelope. Shared by every sound here and
 * by the Media Player's sequencer.
 */
export function blip(
  freq: number,
  type: OscillatorType = 'square',
  length = 0.16,
  gain = 0.25,
  delay = 0,
): void {
  const c = ctx
  const dest = masterGain
  if (!c || !dest) return

  const at = c.currentTime + delay
  const osc = c.createOscillator()
  const env = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, at)
  env.gain.setValueAtTime(0, at)
  env.gain.linearRampToValueAtTime(gain, at + 0.008)
  env.gain.exponentialRampToValueAtTime(0.0001, at + length)
  osc.connect(env).connect(dest)
  osc.start(at)
  osc.stop(at + length + 0.02)
}

/** Startup sound: a rising major triad, roughly a second end to end. */
export function chime(): void {
  if (!ensure()) return
  const notes = [349.23, 440.0, 523.25, 698.46] // F4 A4 C5 F5
  notes.forEach((f, i) => blip(f, 'triangle', i === 3 ? 0.9 : 0.4, 0.22, i * 0.13))
  blip(174.61, 'sine', 1.1, 0.18, 0)
}

/** Error sound: the classic two-note "you cannot do that". */
export function ding(): void {
  if (!ensure()) return
  blip(880, 'square', 0.09, 0.2, 0)
  blip(587.33, 'square', 0.16, 0.2, 0.1)
}

/** Test seam: forget the module-level graph between cases. */
export function __resetForTests(): void {
  ctx = null
  masterGain = null
  level = 0.35
  isMuted = false
}
