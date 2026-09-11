import { describe, expect, it } from 'vitest'
import * as C from '../apps/calculator-logic'

/** Feed a key sequence through the machine, like a person pressing buttons. */
function press(keys: string[]): string {
  let s = C.initial
  for (const k of keys) {
    if (/^[0-9.]$/.test(k)) s = C.digit(s, k)
    else if (k === '=') s = C.equals(s)
    else if (k === 'C') s = C.clear()
    else if (k === 'CE') s = C.clearEntry(s)
    else if (k === '<') s = C.backspace(s)
    else if (k === '+/-') s = C.negate(s)
    else s = C.operator(s, k as C.Op)
  }
  return s.display
}

describe('calculator', () => {
  it('adds', () => {
    expect(press(['2', '+', '3', '='])).toBe('5')
  })

  it('chains operations, computing at each operator', () => {
    expect(press(['2', '+', '3', '+', '4', '='])).toBe('9')
    expect(press(['2', '+', '3', '*', '4', '='])).toBe('20')
  })

  it('repeats the last operation on repeated equals', () => {
    expect(press(['2', '+', '3', '=', '=', '='])).toBe('11')
    expect(press(['2', '*', '3', '=', '='])).toBe('18')
  })

  it('replaces a pending operator instead of computing', () => {
    expect(press(['8', '+', '*', '2', '='])).toBe('16')
  })

  it('errors on divide by zero and recovers on the next digit', () => {
    const s = C.equals(C.digit(C.operator(C.digit(C.initial, '5'), '/'), '0'))
    expect(s.error).toBe(true)
    expect(s.display).toMatch(/divide by zero/i)
    expect(C.digit(s, '7').display).toBe('7')
    expect(C.digit(s, '7').error).toBe(false)
  })

  it('allows only one decimal point', () => {
    expect(press(['1', '.', '5', '.', '2'])).toBe('1.52')
  })

  it('starts a decimal with a leading zero', () => {
    expect(press(['.', '5'])).toBe('0.5')
  })

  it('trims binary float noise', () => {
    expect(press(['0', '.', '1', '+', '0', '.', '2', '='])).toBe('0.3')
  })

  it('CE clears the entry but keeps the pending operation', () => {
    expect(press(['9', '+', '5', 'CE', '1', '='])).toBe('10')
  })

  it('backspace does not run past empty', () => {
    expect(press(['7', '<', '<', '<'])).toBe('0')
  })

  it('negates and un-negates', () => {
    expect(press(['5', '+/-'])).toBe('-5')
    expect(press(['5', '+/-', '+/-'])).toBe('5')
    expect(press(['0', '+/-'])).toBe('0')
  })

  it('does not treat -0 as negative', () => {
    expect(press(['5', '-', '5', '='])).toBe('0')
  })

  it('square root rejects negatives', () => {
    expect(C.sqrt(C.negate(C.digit(C.initial, '9'))).error).toBe(true)
    expect(C.sqrt(C.digit(C.initial, '9')).display).toBe('3')
  })

  it('reciprocal of zero errors', () => {
    expect(C.reciprocal(C.initial).error).toBe(true)
  })

  it('stores and recalls memory', () => {
    let s = C.digit(C.initial, '7')
    s = C.memory.store(s)
    s = C.clear()
    expect(C.memory.recall(s).display).toBe('0')
    // clear() resets memory too, matching the C button.
    s = C.memory.store(C.digit(C.initial, '7'))
    s = C.memory.add(C.digit(s, '3'))
    expect(C.memory.recall(s).display).toBe('10')
  })
})
