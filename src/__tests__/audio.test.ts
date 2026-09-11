import { describe, expect, it } from 'vitest'
import { effectiveGain } from '../os/audio'

/**
 * `effectiveGain` is the only branching logic in the audio module — it decides
 * what the master bus is actually set to. Everything else there is Web Audio
 * wiring that a unit test could not meaningfully check.
 */
describe('effectiveGain', () => {
  it('passes an in-range volume through unchanged', () => {
    expect(effectiveGain(0.35, false)).toBe(0.35)
    expect(effectiveGain(0, false)).toBe(0)
    expect(effectiveGain(1, false)).toBe(1)
  })

  it('is silent when muted, whatever the volume', () => {
    expect(effectiveGain(1, true)).toBe(0)
    expect(effectiveGain(0.5, true)).toBe(0)
    expect(effectiveGain(0, true)).toBe(0)
  })

  it('restores the level when unmuted rather than resetting it', () => {
    const level = 0.72
    expect(effectiveGain(level, true)).toBe(0)
    expect(effectiveGain(level, false)).toBe(level)
  })

  it('clamps out-of-range values instead of throwing', () => {
    // A slider bug should make the audio wrong, not raise inside an audio
    // callback where nothing can catch it.
    expect(effectiveGain(-1, false)).toBe(0)
    expect(effectiveGain(4, false)).toBe(1)
  })

  it('treats non-finite input as silence', () => {
    expect(effectiveGain(Number.NaN, false)).toBe(0)
    expect(effectiveGain(Number.POSITIVE_INFINITY, false)).toBe(0)
  })
})
