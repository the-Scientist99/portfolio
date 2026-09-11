/**
 * Calculator as an explicit state machine.
 *
 * Kept free of React so the awkward cases — repeated equals, replacing a
 * pending operator, divide by zero — can be tested as plain function calls.
 */

export type Op = '+' | '-' | '*' | '/'

export type Calc = {
  /** What the display shows. Always a string so "0." and "1.20" survive. */
  display: string
  /** Left-hand operand of a pending operation. */
  acc: number | null
  pending: Op | null
  /** Next digit starts a fresh number rather than appending. */
  fresh: boolean
  /** Operand and operator to repeat when `=` is pressed again. */
  repeat: { op: Op; rhs: number } | null
  error: boolean
  memory: number
}

export const initial: Calc = {
  display: '0',
  acc: null,
  pending: null,
  fresh: true,
  repeat: null,
  error: false,
  memory: 0,
}

const MAX_DIGITS = 16

function fmt(n: number): string {
  if (!Number.isFinite(n)) return 'Cannot divide by zero'
  // Trim float noise (0.1 + 0.2) without turning 1e21 into garbage.
  const rounded = Number(n.toPrecision(12))
  if (Object.is(rounded, -0)) return '0'
  const s = String(rounded)
  return s.length > MAX_DIGITS && !s.includes('e') ? rounded.toExponential(9) : s
}

function apply(a: number, op: Op, b: number): number {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '*': return a * b
    case '/': return b === 0 ? NaN : a / b
  }
}

export function digit(s: Calc, d: string): Calc {
  if (s.error) s = initial
  if (s.fresh) return { ...s, display: d === '.' ? '0.' : d, fresh: false }
  if (d === '.') {
    if (s.display.includes('.')) return s
    return { ...s, display: s.display + '.' }
  }
  if (s.display === '0') return { ...s, display: d }
  if (s.display.replace(/[-.]/g, '').length >= MAX_DIGITS) return s
  return { ...s, display: s.display + d }
}

export function operator(s: Calc, op: Op): Calc {
  if (s.error) return s
  const current = Number(s.display)

  // Pressing an operator twice replaces it rather than computing.
  if (s.pending !== null && s.fresh) return { ...s, pending: op, repeat: null }

  if (s.pending !== null && s.acc !== null) {
    const result = apply(s.acc, s.pending, current)
    if (!Number.isFinite(result)) return { ...initial, display: fmt(result), error: true }
    return { ...s, display: fmt(result), acc: result, pending: op, fresh: true, repeat: null }
  }

  return { ...s, acc: current, pending: op, fresh: true, repeat: null }
}

export function equals(s: Calc): Calc {
  if (s.error) return s
  const current = Number(s.display)

  if (s.pending !== null && s.acc !== null) {
    const result = apply(s.acc, s.pending, current)
    if (!Number.isFinite(result)) return { ...initial, display: fmt(result), error: true }
    return {
      ...s,
      display: fmt(result),
      acc: null,
      pending: null,
      fresh: true,
      repeat: { op: s.pending, rhs: current },
    }
  }

  // Repeated equals re-applies the last operation: 2 + 3 = = = -> 11.
  if (s.repeat) {
    const result = apply(current, s.repeat.op, s.repeat.rhs)
    if (!Number.isFinite(result)) return { ...initial, display: fmt(result), error: true }
    return { ...s, display: fmt(result), fresh: true }
  }

  return { ...s, fresh: true }
}

export function clear(): Calc {
  return initial
}

/** CE: clear the current entry only, keeping any pending operation. */
export function clearEntry(s: Calc): Calc {
  if (s.error) return initial
  return { ...s, display: '0', fresh: true }
}

export function backspace(s: Calc): Calc {
  if (s.error || s.fresh) return s
  const next = s.display.slice(0, -1)
  return { ...s, display: next === '' || next === '-' ? '0' : next }
}

export function negate(s: Calc): Calc {
  if (s.error || s.display === '0') return s
  return {
    ...s,
    display: s.display.startsWith('-') ? s.display.slice(1) : '-' + s.display,
  }
}

export function sqrt(s: Calc): Calc {
  if (s.error) return s
  const n = Number(s.display)
  if (n < 0) return { ...initial, display: 'Invalid input', error: true }
  return { ...s, display: fmt(Math.sqrt(n)), fresh: true }
}

export function reciprocal(s: Calc): Calc {
  if (s.error) return s
  const n = Number(s.display)
  if (n === 0) return { ...initial, display: 'Cannot divide by zero', error: true }
  return { ...s, display: fmt(1 / n), fresh: true }
}

export function percent(s: Calc): Calc {
  if (s.error) return s
  // Win95 semantics: x % of the accumulator when one is pending.
  const n = Number(s.display)
  const base = s.acc ?? 0
  return { ...s, display: fmt(s.pending ? (base * n) / 100 : n / 100), fresh: true }
}

export const memory = {
  clear: (s: Calc): Calc => ({ ...s, memory: 0 }),
  recall: (s: Calc): Calc =>
    s.error ? s : { ...s, display: fmt(s.memory), fresh: true },
  store: (s: Calc): Calc =>
    s.error ? s : { ...s, memory: Number(s.display), fresh: true },
  add: (s: Calc): Calc =>
    s.error ? s : { ...s, memory: s.memory + Number(s.display), fresh: true },
}
