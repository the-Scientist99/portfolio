/**
 * Minesweeper rules, kept free of React so the board maths can be tested
 * directly: mine count, first-click safety, and a flood fill that terminates.
 */

export type Cell = {
  mine: boolean
  /** Adjacent mines, 0-8. */
  n: number
  open: boolean
  flag: boolean
}

export type Board = {
  w: number
  h: number
  mines: number
  cells: Cell[]
  state: 'ready' | 'playing' | 'won' | 'lost'
  /** Index of the mine that ended the game, for the red cell. */
  boom: number | null
}

export const LEVELS = {
  beginner: { w: 9, h: 9, mines: 10 },
  intermediate: { w: 16, h: 16, mines: 40 },
} as const

export type Level = keyof typeof LEVELS

export function emptyBoard(w: number, h: number, mines: number): Board {
  return {
    w, h, mines,
    cells: Array.from({ length: w * h }, () => ({ mine: false, n: 0, open: false, flag: false })),
    state: 'ready',
    boom: null,
  }
}

export function neighbours(b: Board, i: number): number[] {
  const x = i % b.w
  const y = Math.floor(i / b.w)
  const out: number[] = []
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= b.w || ny >= b.h) continue
      out.push(ny * b.w + nx)
    }
  }
  return out
}

/**
 * Place mines, never on `safe` or its neighbours, so the first click always
 * opens a region rather than ending the game.
 */
export function plant(board: Board, safe: number, rand: () => number = Math.random): Board {
  const b: Board = { ...board, cells: board.cells.map((c) => ({ ...c })) }
  const forbidden = new Set([safe, ...neighbours(b, safe)])

  const candidates: number[] = []
  for (let i = 0; i < b.cells.length; i++) if (!forbidden.has(i)) candidates.push(i)

  // Partial Fisher-Yates: shuffle only as many as we need.
  const count = Math.min(b.mines, candidates.length)
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rand() * (candidates.length - i))
    const tmp = candidates[i]!
    candidates[i] = candidates[j]!
    candidates[j] = tmp
    b.cells[candidates[i]!]!.mine = true
  }

  for (let i = 0; i < b.cells.length; i++) {
    b.cells[i]!.n = neighbours(b, i).filter((j) => b.cells[j]!.mine).length
  }

  return { ...b, state: 'playing' }
}

/** Iterative flood fill. A recursive one overflows on a 16x16 open region. */
function openRegion(b: Board, start: number): void {
  const stack = [start]
  const seen = new Set<number>()
  while (stack.length) {
    const i = stack.pop()!
    if (seen.has(i)) continue
    seen.add(i)
    const cell = b.cells[i]!
    if (cell.flag || cell.open || cell.mine) continue
    cell.open = true
    if (cell.n === 0) for (const j of neighbours(b, i)) if (!seen.has(j)) stack.push(j)
  }
}

function checkWin(b: Board): Board {
  const cleared = b.cells.every((c) => c.mine || c.open)
  if (!cleared) return b
  return {
    ...b,
    state: 'won',
    cells: b.cells.map((c) => (c.mine ? { ...c, flag: true } : c)),
  }
}

export function reveal(board: Board, i: number, rand?: () => number): Board {
  if (board.state === 'won' || board.state === 'lost') return board

  let b = board
  if (b.state === 'ready') b = plant(b, i, rand)

  const cells = b.cells.map((c) => ({ ...c }))
  b = { ...b, cells }
  const cell = cells[i]
  if (!cell || cell.open || cell.flag) return b

  if (cell.mine) {
    for (const c of cells) if (c.mine) c.open = true
    return { ...b, state: 'lost', boom: i }
  }

  openRegion(b, i)
  return checkWin(b)
}

export function toggleFlag(board: Board, i: number): Board {
  if (board.state === 'won' || board.state === 'lost') return board
  const cells = board.cells.map((c) => ({ ...c }))
  const cell = cells[i]
  if (!cell || cell.open) return board
  cell.flag = !cell.flag
  return { ...board, cells }
}

export function flagsUsed(b: Board): number {
  return b.cells.filter((c) => c.flag).length
}
