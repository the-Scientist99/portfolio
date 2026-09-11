import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { AppId, IconName } from '../content'

export type WinState = {
  id: string
  appId: AppId
  title: string
  icon: IconName
  x: number
  y: number
  w: number
  h: number
  z: number
  minimized: boolean
  maximized: boolean
  props: Record<string, unknown>
  /** Geometry to restore to when un-maximizing. */
  restore?: { x: number; y: number; w: number; h: number }
}

export type OpenRequest = {
  appId: AppId
  title: string
  icon: IconName
  w?: number
  h?: number
  props?: Record<string, unknown>
  /**
   * Reuse an existing window with the same key instead of opening a second
   * one. Used for singletons (System Properties) and for re-opening the same
   * document.
   */
  singletonKey?: string
}

type State = {
  windows: WinState[]
  nextZ: number
  seq: number
}

type Action =
  | { type: 'OPEN'; req: OpenRequest; viewport: { w: number; h: number } }
  | { type: 'CLOSE'; id: string }
  | { type: 'FOCUS'; id: string }
  | { type: 'MINIMIZE'; id: string }
  | { type: 'TOGGLE_MIN'; id: string }
  | { type: 'TOGGLE_MAX'; id: string }
  | { type: 'MOVE'; id: string; x: number; y: number }
  | { type: 'RESIZE'; id: string; w: number; h: number; x?: number; y?: number }

export const MIN_W = 240
export const MIN_H = 140
const TASKBAR_H = 28
const CASCADE = 24

function clampToViewport(
  x: number, y: number, w: number, h: number,
  vp: { w: number; h: number },
) {
  const width = Math.min(w, vp.w)
  const height = Math.min(h, vp.h - TASKBAR_H)
  return {
    w: width,
    h: height,
    // Keep at least a strip of title bar reachable on both axes.
    x: Math.max(-width + 80, Math.min(x, vp.w - 80)),
    y: Math.max(0, Math.min(y, vp.h - TASKBAR_H - 24)),
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'OPEN': {
      const { req, viewport } = action

      if (req.singletonKey) {
        const existing = state.windows.find(
          (w) => w.props['__key'] === req.singletonKey,
        )
        if (existing) {
          return {
            ...state,
            nextZ: state.nextZ + 1,
            windows: state.windows.map((w) =>
              w.id === existing.id
                ? { ...w, z: state.nextZ + 1, minimized: false }
                : w,
            ),
          }
        }
      }

      const w = req.w ?? 520
      const h = req.h ?? 380
      const step = (state.seq % 8) * CASCADE
      const geom = clampToViewport(
        Math.round((viewport.w - w) / 2 - 60) + step,
        Math.round((viewport.h - TASKBAR_H - h) / 2 - 40) + step,
        w, h, viewport,
      )

      const win: WinState = {
        id: `win-${state.seq}`,
        appId: req.appId,
        title: req.title,
        icon: req.icon,
        ...geom,
        z: state.nextZ + 1,
        minimized: false,
        maximized: false,
        props: { ...req.props, ...(req.singletonKey ? { __key: req.singletonKey } : {}) },
      }

      return { windows: [...state.windows, win], nextZ: state.nextZ + 1, seq: state.seq + 1 }
    }

    case 'CLOSE':
      return { ...state, windows: state.windows.filter((w) => w.id !== action.id) }

    case 'FOCUS': {
      const target = state.windows.find((w) => w.id === action.id)
      if (!target || (target.z === state.nextZ && !target.minimized)) return state
      return {
        ...state,
        nextZ: state.nextZ + 1,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, z: state.nextZ + 1, minimized: false } : w,
        ),
      }
    }

    case 'MINIMIZE':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, minimized: true } : w,
        ),
      }

    case 'TOGGLE_MIN': {
      const target = state.windows.find((w) => w.id === action.id)
      if (!target) return state
      // Clicking the taskbar button of the focused window minimizes it;
      // clicking any other window's button raises it.
      const isTop = target.z === state.nextZ && !target.minimized
      if (isTop) {
        return {
          ...state,
          windows: state.windows.map((w) =>
            w.id === action.id ? { ...w, minimized: true } : w,
          ),
        }
      }
      return {
        ...state,
        nextZ: state.nextZ + 1,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, z: state.nextZ + 1, minimized: false } : w,
        ),
      }
    }

    case 'TOGGLE_MAX':
      return {
        ...state,
        windows: state.windows.map((w) => {
          if (w.id !== action.id) return w
          if (w.maximized) {
            const r = w.restore
            return r
              ? { ...w, maximized: false, ...r, restore: undefined }
              : { ...w, maximized: false, restore: undefined }
          }
          return {
            ...w,
            maximized: true,
            restore: { x: w.x, y: w.y, w: w.w, h: w.h },
          }
        }),
      }

    case 'MOVE':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, x: action.x, y: action.y } : w,
        ),
      }

    case 'RESIZE':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? {
                ...w,
                w: Math.max(MIN_W, action.w),
                h: Math.max(MIN_H, action.h),
                ...(action.x !== undefined ? { x: action.x } : {}),
                ...(action.y !== undefined ? { y: action.y } : {}),
              }
            : w,
        ),
      }
  }
}

const initial: State = { windows: [], nextZ: 10, seq: 0 }

type Api = {
  windows: WinState[]
  topZ: number
  open: (req: OpenRequest) => void
  close: (id: string) => void
  focus: (id: string) => void
  minimize: (id: string) => void
  toggleMin: (id: string) => void
  toggleMax: (id: string) => void
  move: (id: string, x: number, y: number) => void
  resize: (id: string, w: number, h: number, x?: number, y?: number) => void
}

const Ctx = createContext<Api | null>(null)

export function WindowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial)

  const open = useCallback((req: OpenRequest) => {
    dispatch({
      type: 'OPEN',
      req,
      viewport: { w: window.innerWidth, h: window.innerHeight },
    })
  }, [])

  const api = useMemo<Api>(() => ({
    windows: state.windows,
    topZ: state.nextZ,
    open,
    close: (id) => dispatch({ type: 'CLOSE', id }),
    focus: (id) => dispatch({ type: 'FOCUS', id }),
    minimize: (id) => dispatch({ type: 'MINIMIZE', id }),
    toggleMin: (id) => dispatch({ type: 'TOGGLE_MIN', id }),
    toggleMax: (id) => dispatch({ type: 'TOGGLE_MAX', id }),
    move: (id, x, y) => dispatch({ type: 'MOVE', id, x, y }),
    resize: (id, w, h, x, y) => dispatch({ type: 'RESIZE', id, w, h, x, y }),
  }), [state.windows, state.nextZ, open])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useWindows(): Api {
  const v = useContext(Ctx)
  if (!v) throw new Error('useWindows must be used inside <WindowProvider>')
  return v
}

/** Exported for tests. */
export const __test = { reducer, initial, clampToViewport }
