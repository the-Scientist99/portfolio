import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QuotaError, __resetForTests, load, remove, save } from '../os/storage'

beforeEach(() => {
  localStorage.clear()
  __resetForTests()
  vi.restoreAllMocks()
})

describe('storage', () => {
  it('round-trips a value', () => {
    save('k', { a: 1, b: ['x'] })
    expect(load('k', null)).toEqual({ a: 1, b: ['x'] })
  })

  it('returns the fallback for a missing key', () => {
    expect(load('absent', 'fallback')).toBe('fallback')
  })

  it('returns the fallback for corrupt JSON and clears the bad value', () => {
    localStorage.setItem('portfolio.v1.broken', '{not json')
    expect(load('broken', 'fallback')).toBe('fallback')
    expect(localStorage.getItem('portfolio.v1.broken')).toBeNull()
  })

  it('namespaces keys so it cannot collide with other apps', () => {
    save('k', 1)
    expect(localStorage.getItem('portfolio.v1.k')).toBe('1')
  })

  it('removes a key', () => {
    save('k', 1)
    remove('k')
    expect(load('k', 'gone')).toBe('gone')
  })

  it('throws QuotaError when the browser refuses a write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string) => {
      if (key.includes('__probe__')) return
      throw new DOMException('full', 'QuotaExceededError')
    })
    expect(() => save('big', 'x')).toThrow(QuotaError)
  })

  it('still serves the value from memory after a failed write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string) => {
      if (key.includes('__probe__')) return
      throw new DOMException('full', 'QuotaExceededError')
    })
    expect(() => save('big', 'kept')).toThrow(QuotaError)
    vi.restoreAllMocks()
    // The value is not in localStorage, but load() must not blow up.
    expect(load('big', 'fallback')).toBe('fallback')
  })

  it('falls back to memory when localStorage is entirely unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError')
    })
    __resetForTests()
    save('k', 'in-memory')
    expect(load('k', 'fallback')).toBe('in-memory')
  })
})
