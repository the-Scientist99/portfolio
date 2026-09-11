import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { load, save } from './storage'

export const WALLPAPERS = {
  teal: { label: 'Teal (none)', css: '#008080' },
  clouds: {
    label: 'Clouds',
    css: 'linear-gradient(#5aa9e6 0%, #9fd0f0 55%, #d8ecf8 100%)',
  },
  maze: {
    label: '3D Maze',
    css:
      'repeating-conic-gradient(#0a2a6b 0% 25%, #123f9b 0% 50%) 0 0 / 32px 32px',
  },
  hills: {
    label: 'Bliss (pre-alpha)',
    css: 'linear-gradient(#2f6fb5 0%, #68a8dd 45%, #4f8a3a 55%, #2f5f22 100%)',
  },
} as const

export type WallpaperId = keyof typeof WALLPAPERS

type Settings = {
  crt: boolean
  wallpaper: WallpaperId
  setCrt: (on: boolean) => void
  setWallpaper: (id: WallpaperId) => void
}

const Ctx = createContext<Settings | null>(null)

function isWallpaper(v: unknown): v is WallpaperId {
  return typeof v === 'string' && v in WALLPAPERS
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [crt, setCrtState] = useState<boolean>(() => load('settings.crt', true))
  const [wallpaper, setWallpaperState] = useState<WallpaperId>(() => {
    const stored = load<unknown>('settings.wallpaper', 'teal')
    return isWallpaper(stored) ? stored : 'teal'
  })

  // The CRT class lives on <html> so the fixed overlay and the desktop glow
  // can both key off one toggle.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('crt-off', !crt)
    root.classList.toggle('crt-on', crt)
  }, [crt])

  const setCrt = useCallback((on: boolean) => {
    setCrtState(on)
    try { save('settings.crt', on) } catch { /* preference, not user data */ }
  }, [])

  const setWallpaper = useCallback((id: WallpaperId) => {
    setWallpaperState(id)
    try { save('settings.wallpaper', id) } catch { /* preference, not user data */ }
  }, [])

  const value = useMemo(
    () => ({ crt, wallpaper, setCrt, setWallpaper }),
    [crt, wallpaper, setCrt, setWallpaper],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSettings(): Settings {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSettings must be used inside <SettingsProvider>')
  return v
}
