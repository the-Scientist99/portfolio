import { useCallback, useEffect, useRef, useState } from 'react'
import * as M from './minesweeper-logic'

function pad(n: number) {
  const clamped = Math.max(-99, Math.min(999, n))
  return clamped < 0 ? `-${String(-clamped).padStart(2, '0')}` : String(clamped).padStart(3, '0')
}

// ASCII rather than emoji: the pixel font renders colour emoji as a blob,
// and a text face suits the era anyway.
const FACE = { ready: ':-)', playing: ':-)', won: 'B-)', lost: 'X-(' } as const

export function Minesweeper() {
  const [level, setLevel] = useState<M.Level>('beginner')
  const [board, setBoard] = useState<M.Board>(
    () => M.emptyBoard(M.LEVELS.beginner.w, M.LEVELS.beginner.h, M.LEVELS.beginner.mines),
  )
  const [elapsed, setElapsed] = useState(0)
  const started = useRef<number | null>(null)

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
          style={{ gridTemplateColumns: `repeat(${board.w}, 18px)` }}
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
                onClick={() => onCell(i, false)}
                onContextMenu={(e) => { e.preventDefault(); onCell(i, true) }}
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
            : 'Right-click or press F to flag.'}
        </div>
      </div>
    </div>
  )
}
