import { useCallback, useState } from 'react'
import * as C from './calculator-logic'

const KEYPAD: {
  label: string
  cls?: string
  action: (s: C.Calc) => C.Calc
  aria?: string
}[][] = [
  [
    { label: 'MC', cls: 'fn', action: C.memory.clear, aria: 'Memory clear' },
    { label: '7', action: (s) => C.digit(s, '7') },
    { label: '8', action: (s) => C.digit(s, '8') },
    { label: '9', action: (s) => C.digit(s, '9') },
    { label: '/', cls: 'op', action: (s) => C.operator(s, '/'), aria: 'Divide' },
  ],
  [
    { label: 'MR', cls: 'fn', action: C.memory.recall, aria: 'Memory recall' },
    { label: '4', action: (s) => C.digit(s, '4') },
    { label: '5', action: (s) => C.digit(s, '5') },
    { label: '6', action: (s) => C.digit(s, '6') },
    { label: '*', cls: 'op', action: (s) => C.operator(s, '*'), aria: 'Multiply' },
  ],
  [
    { label: 'MS', cls: 'fn', action: C.memory.store, aria: 'Memory store' },
    { label: '1', action: (s) => C.digit(s, '1') },
    { label: '2', action: (s) => C.digit(s, '2') },
    { label: '3', action: (s) => C.digit(s, '3') },
    { label: '-', cls: 'op', action: (s) => C.operator(s, '-'), aria: 'Subtract' },
  ],
  [
    { label: 'M+', cls: 'fn', action: C.memory.add, aria: 'Memory add' },
    { label: '0', action: (s) => C.digit(s, '0') },
    { label: '.', action: (s) => C.digit(s, '.'), aria: 'Decimal point' },
    { label: '±', action: C.negate, aria: 'Negate' },
    { label: '+', cls: 'op', action: (s) => C.operator(s, '+'), aria: 'Add' },
  ],
  [
    { label: '√', cls: 'fn', action: C.sqrt, aria: 'Square root' },
    { label: '1/x', cls: 'fn', action: C.reciprocal, aria: 'Reciprocal' },
    { label: '%', cls: 'fn', action: C.percent, aria: 'Percent' },
    { label: '=', cls: 'op wide', action: C.equals, aria: 'Equals' },
  ],
]

const KEYMAP: Record<string, (s: C.Calc) => C.Calc> = {
  '0': (s) => C.digit(s, '0'), '1': (s) => C.digit(s, '1'),
  '2': (s) => C.digit(s, '2'), '3': (s) => C.digit(s, '3'),
  '4': (s) => C.digit(s, '4'), '5': (s) => C.digit(s, '5'),
  '6': (s) => C.digit(s, '6'), '7': (s) => C.digit(s, '7'),
  '8': (s) => C.digit(s, '8'), '9': (s) => C.digit(s, '9'),
  '.': (s) => C.digit(s, '.'), ',': (s) => C.digit(s, '.'),
  '+': (s) => C.operator(s, '+'), '-': (s) => C.operator(s, '-'),
  '*': (s) => C.operator(s, '*'), '/': (s) => C.operator(s, '/'),
  '=': C.equals, 'Enter': C.equals,
  'Backspace': C.backspace,
  'Delete': C.clearEntry,
}

export function Calculator() {
  const [state, setState] = useState<C.Calc>(C.initial)

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Escape clears rather than closing, like the real thing.
      e.stopPropagation()
      setState(C.clear())
      return
    }
    const fn = KEYMAP[e.key]
    if (!fn) return
    e.preventDefault()
    setState(fn)
  }, [])

  return (
    <div className="window-body flush calc" onKeyDown={onKeyDown}>
      <div
        className="calc-display"
        role="status"
        aria-live="polite"
        aria-label="Result"
        tabIndex={0}
        data-autofocus
      >
        {state.display}
      </div>

      <div style={{ display: 'flex', gap: 3 }}>
        <button type="button" style={{ flex: 1 }} onClick={() => setState(C.clear())}>C</button>
        <button type="button" style={{ flex: 1 }} onClick={() => setState(C.clearEntry)}>CE</button>
        <button type="button" style={{ flex: 1 }} onClick={() => setState(C.backspace)}>←</button>
        <div
          style={{ flex: '0 0 22px', display: 'grid', placeItems: 'center' }}
          aria-hidden="true"
        >
          {state.memory !== 0 ? 'M' : ''}
        </div>
      </div>

      <div className="calc-grid">
        {KEYPAD.flat().map((k) => (
          <button
            key={k.label}
            type="button"
            className={k.cls}
            aria-label={k.aria ?? k.label}
            onClick={() => setState(k.action)}
          >
            {k.label}
          </button>
        ))}
      </div>
    </div>
  )
}
