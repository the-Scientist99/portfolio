import { useCallback, useEffect, useRef, useState } from 'react'
import * as M from './minesweeper-logic'
import { useCoarsePointer } from '../os/useIsMobile'

function pad(n: number) {
  const clamped = Math.max(-99, Math.min(999, n))
  return clamped < 0 ? `-${String(-clamped).padStart(2, '0')}` : String(clamped).padStart(3, '0')
}

// ASCII rather than emoji: the pixel font renders colour emoji as a blob,
// and a text face suits the era anyway.
const FACE = { ready: ':-)', playing: ':-)', won: 'B-)', lost: 'X-(' } as const

/** Hold this long to flag instead of reveal. */
const LONG_PRESS_MS = 400
/** Moving further than this means the player is scrolling, not pressing. */
const MOVE_TOLERANCE = 10

export function Minesweeper() {
  const [level, setLevel] = useState<M.Level>('beginner')
  const [board, setBoard] = useState<M.Board>(
    () => M.emptyBoard(M.LEVELS.beginner.w, M.LEVELS.beginner.h, M.LEVELS.beginner.mines),
  )
  const [elapsed, setElapsed] = useState(0)
  const started = useRef<number | null>(null)
  // Hold-to-flag is a touch affordance, so the hint follows the pointer
  // type rather than the viewport width.
  const touch = useCoarsePointer()

  /**
   * Touch has no right-click and no F key, so a long press flags instead.
   * Tracked per-press: the timer that fires the flag, and whether it already
   * fired, so the click that follows the release does not also reveal.
   */
  const press = useRef<
    { timer: number; origin: { x: number; y: number } } | null
  >(null)
  const flaggedByHold = useRef(false)

  const clearPress = useCallback(() => {
    if (press.current) {
      window.clearTimeout(press.current.timer)
      press.current = null
    }
  }, [])

  // A pending timer must not outlive the window.
  useEffect(() => clearPress, [clearPress])

  const reset = useCallback((lvl: M.Level) => {
    const { w, h, mines } = M.LEVELS[lvl]
    setLevel(lvl)
    setBoard(M.emptyBoard(w, h, mines))
    setElapsed(0)
    started.current = null
  }, [])

  useEffect(() => {
    if (board.state !== 'playing') return
    if (started.current === null) started.current = Date.now()
    const id = window.setInterval(() => {
      if (started.current !== null) {
        setElapsed(Math.floor((Date.now() - started.current) / 1000))
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [board.state])

  const onCell = useCallback((i: number, flagging: boolean) => {
    setBoard((b) => (flagging ? M.toggleFlag(b, i) : M.reveal(b, i)))
  }, [])

  const startPress = useCallback((i: number, e: React.PointerEvent) => {
    // Touch and pen only. A mouse already has right-click, and arming a hold
    // there would turn any slow click into an accidental flag.
    if (e.pointerType === 'mouse') return
    clearPress()
    flaggedByHold.current = false
    const origin = { x: e.clientX, y: e.clientY }
    press.current = {
      origin,
      timer: window.setTimeout(() => {
        flaggedByHold.current = true
        press.current = null
        onCell(i, true)
      }, LONG_PRESS_MS),
    }
  }, [clearPress, onCell])

  const movePress = useCallback((e: React.PointerEvent) => {
    const p = press.current
    if (!p) return
    if (Math.hypot(e.clientX - p.origin.x, e.clientY - p.origin.y) > MOVE_TOLERANCE) {
      clearPress()
    }
  }, [clearPress])

  const reveal = useCallback((i: number) => {
    // The click that follows a long press must not also open the cell.
    if (flaggedByHold.current) {
      flaggedByHold.current = false
      return
    }
    onCell(i, false)
  }, [onCell])

  const remaining = board.mines - M.flagsUsed(board)

  return (
    <div className="window-body flush mine-app">
      <div className="menubar">
        <button type="button" onClick={() => reset('beginner')}
          aria-pressed={level === 'beginner'}>Beginner</button>
        <button type="button" onClick={() => reset('intermediate')}
          aria-pressed={level === 'intermediate'}>Intermediate</button>
      </div>

      <div className="mine-hud">
        <div className="mine-lcd" aria-label={`${remaining} mines remaining`}>{pad(remaining)}</div>
        <button
          type="button"
          className="mine-face"
          onClick={() => reset(level)}
          aria-label="New game"
        >
          {FACE[board.state]}
        </button>
        <div className="mine-lcd" aria-label={`${elapsed} seconds elapsed`}>{pad(elapsed)}</div>
      </div>

      <div className="mine-grid-wrap">
        <div
          className="mine-grid"
          style={{ gridTemplateColumns: `repeat(${board.w}, var(--cell-size))` }}
          role="grid"
          aria-label="Minefield"
          onContextMenu={(e) => e.preventDefault()}
        >
          {board.cells.map((c, i) => {
            const label = c.open
              ? (c.mine ? 'Mine' : c.n === 0 ? 'Empty' : `${c.n}`)
              : c.flag ? 'Flagged' : 'Hidden'
            return (
              <button
                key={i}
                type="button"
                role="gridcell"
                aria-label={label}
                className={`cell${c.open ? ' open' : ''}${board.boom === i ? ' boom' : ''}${
                  c.open && !c.mine && c.n > 0 ? ` n${c.n}` : ''
                }`}
                onClick={() => reveal(i)}
                onContextMenu={(e) => { e.preventDefault(); onCell(i, true) }}
                onPointerDown={(e) => startPress(i, e)}
                onPointerMove={movePress}
                onPointerUp={clearPress}
                onPointerLeave={clearPress}
                onPointerCancel={clearPress}
                onKeyDown={(e) => {
                  // Keyboard flagging: F, since right-click has no equivalent.
                  if (e.key.toLowerCase() === 'f') { e.preventDefault(); onCell(i, true) }
                }}
              >
                {c.open
                  ? (c.mine ? '✹' : c.n > 0 ? c.n : '')
                  : c.flag ? '⚑' : ''}
              </button>
            )
          })}
        </div>
      </div>

      <div className="statusbar">
        <div>
          {board.state === 'won' ? 'Cleared. Well played.'
            : board.state === 'lost' ? 'Boom. Click the face to retry.'
            : touch ? 'Tap to open. Press and hold to flag.'
            : 'Right-click or press F to flag.'}
        </div>
      </div>
    </div>
  )
}
