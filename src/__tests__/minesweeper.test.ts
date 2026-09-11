import { describe, expect, it } from 'vitest'
import * as M from '../apps/minesweeper-logic'

/** Deterministic sequence so board layouts are reproducible. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

describe('minesweeper', () => {
  it('plants exactly the requested number of mines', () => {
    const b = M.plant(M.emptyBoard(9, 9, 10), 40, seeded(1))
    expect(b.cells.filter((c) => c.mine)).toHaveLength(10)
  })

  it('never puts a mine on the first click or its neighbours', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const start = 40
      const b = M.plant(M.emptyBoard(9, 9, 10), start, seeded(seed))
      const safe = [start, ...M.neighbours(b, start)]
      for (const i of safe) expect(b.cells[i]!.mine).toBe(false)
    }
  })

  it('computes adjacency counts that match the planted mines', () => {
    const b = M.plant(M.emptyBoard(9, 9, 10), 40, seeded(7))
    for (let i = 0; i < b.cells.length; i++) {
      const actual = M.neighbours(b, i).filter((j) => b.cells[j]!.mine).length
      expect(b.cells[i]!.n).toBe(actual)
    }
  })

  it('opens a region on the first click and terminates', () => {
    const b = M.reveal(M.emptyBoard(9, 9, 10), 40, seeded(3))
    expect(b.state).toBe('playing')
    expect(b.cells.filter((c) => c.open).length).toBeGreaterThan(1)
    // Flood fill must never open a mine.
    expect(b.cells.some((c) => c.open && c.mine)).toBe(false)
  })

  it('flood fill handles a board with no mines without hanging', () => {
    const b = M.reveal(M.emptyBoard(16, 16, 0), 0, seeded(5))
    expect(b.cells.every((c) => c.open)).toBe(true)
    expect(b.state).toBe('won')
  })

  it('loses when a mine is revealed and marks the cell', () => {
    let b = M.plant(M.emptyBoard(9, 9, 10), 40, seeded(11))
    const mine = b.cells.findIndex((c) => c.mine)
    b = M.reveal(b, mine)
    expect(b.state).toBe('lost')
    expect(b.boom).toBe(mine)
    // Every mine is shown on a loss.
    expect(b.cells.filter((c) => c.mine).every((c) => c.open)).toBe(true)
  })

  it('wins when every non-mine cell is open', () => {
    let b = M.plant(M.emptyBoard(5, 5, 3), 12, seeded(13))
    for (let i = 0; i < b.cells.length; i++) {
      if (!b.cells[i]!.mine) b = M.reveal(b, i)
    }
    expect(b.state).toBe('won')
    expect(M.flagsUsed(b)).toBe(3)
  })

  it('ignores clicks on flagged cells', () => {
    let b = M.plant(M.emptyBoard(9, 9, 10), 40, seeded(17))
    b = M.toggleFlag(b, 0)
    const after = M.reveal(b, 0)
    expect(after.cells[0]!.open).toBe(false)
  })

  it('does not flag an already-open cell', () => {
    let b = M.reveal(M.emptyBoard(9, 9, 10), 40, seeded(19))
    const open = b.cells.findIndex((c) => c.open)
    b = M.toggleFlag(b, open)
    expect(b.cells[open]!.flag).toBe(false)
  })

  it('accepts more mines than free cells without looping forever', () => {
    const b = M.plant(M.emptyBoard(3, 3, 99), 4, seeded(23))
    // Every cell but the safe 3x3 region, which here is the whole board.
    expect(b.cells.filter((c) => c.mine)).toHaveLength(0)
  })
})
