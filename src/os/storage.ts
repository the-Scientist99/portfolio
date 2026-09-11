/**
 * Versioned localStorage wrapper.
 *
 * Every access is guarded: Safari private mode throws on write, a full quota
 * throws on write, and a user with a corrupted value should see a default
 * rather than a white screen. Failures degrade to in-memory for the session.
 */

const PREFIX = 'portfolio.v1.'

/** Session fallback when localStorage is unavailable or full. */
const memory = new Map<string, string>()

let usable: boolean | null = null

function available(): boolean {
  if (usable !== null) return usable
  try {
    const probe = PREFIX + '__probe__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    usable = true
  } catch {
    usable = false
  }
  return usable
}

export function load<T>(key: string, fallback: T): T {
  const full = PREFIX + key
  try {
    const raw = available() ? localStorage.getItem(full) : (memory.get(full) ?? null)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    // Corrupt or unparseable. Drop it rather than failing forever.
    try {
      if (available()) localStorage.removeItem(full)
    } catch { /* nothing further to try */ }
    return fallback
  }
}

export class QuotaError extends Error {
  constructor() {
    super('Not enough storage space to save.')
    this.name = 'QuotaError'
  }
}

/**
 * Persist a value. Throws QuotaError when the browser refuses the write so
 * callers can tell the user instead of silently losing their work.
 */
export function save(key: string, value: unknown): void {
  const full = PREFIX + key
  const raw = JSON.stringify(value)
  if (!available()) {
    memory.set(full, raw)
    return
  }
  try {
    localStorage.setItem(full, raw)
  } catch {
    memory.set(full, raw)
    throw new QuotaError()
  }
}

export function remove(key: string): void {
  const full = PREFIX + key
  memory.delete(full)
  try {
    if (available()) localStorage.removeItem(full)
  } catch { /* already gone as far as the caller is concerned */ }
}

/** Test seam: forget the cached availability probe. */
export function __resetForTests(): void {
  usable = null
  memory.clear()
}
