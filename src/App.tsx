import { useCallback, useEffect, useRef, useState } from 'react'
import { BootScreen } from './os/BootScreen'
import { CrtOverlay } from './os/CrtOverlay'
import { DesktopIcons } from './os/Desktop'
import { Taskbar } from './os/Taskbar'
import { Window } from './os/Window'
import { ContextMenu } from './os/ContextMenu'
import type { MenuPos } from './os/ContextMenu'
import { ShutdownDialog, ShutdownScreen } from './os/ShutdownScreen'
import { AppBody } from './os/registry'
import { SettingsProvider, WALLPAPERS, useSettings } from './os/settings'
import { WindowProvider, useWindows } from './os/windowStore'
import { useIsMobile } from './os/useIsMobile'
import { chime, ensure, isRunning } from './os/audio'
// The `/react` entry, not `/next` — this is a Vite app, and the Next entry
// imports next/navigation.
import { Analytics } from '@vercel/analytics/react'

const BOOTED_KEY = 'portfolio.booted'
const CHIMED_KEY = 'portfolio.chimed'

function alreadyBooted(): boolean {
  // Reduced motion means the boot animation is skipped entirely.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  try {
    return sessionStorage.getItem(BOOTED_KEY) === '1'
  } catch {
    return false
  }
}

function alreadyChimed(): boolean {
  try {
    return sessionStorage.getItem(CHIMED_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Play the startup sound once per browser session.
 *
 * An AudioContext cannot start before a user gesture, so if the context is
 * still suspended we wait for the first real interaction rather than failing
 * silently or logging an error.
 */
function useStartupChime(active: boolean) {
  const done = useRef(false)

  useEffect(() => {
    if (!active || done.current || alreadyChimed()) return

    const mark = () => {
      done.current = true
      try { sessionStorage.setItem(CHIMED_KEY, '1') } catch { /* private mode */ }
    }

    if (isRunning() || ensure()?.state === 'running') {
      chime()
      mark()
      return
    }

    const onGesture = () => {
      if (done.current) return
      if (ensure()?.state === 'running' || isRunning()) {
        chime()
        mark()
      }
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }

    window.addEventListener('pointerdown', onGesture)
    window.addEventListener('keydown', onGesture)
    return () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
  }, [active])
}

function Desktop({ onShutDown }: { onShutDown: () => void }) {
  const { windows, topZ } = useWindows()
  const { wallpaper } = useSettings()
  const mobile = useIsMobile()
  const [menu, setMenu] = useState<MenuPos | null>(null)

  return (
    <div id="desktop-root" style={{ background: WALLPAPERS[wallpaper].css }}>
      <div
        className="desktop-surface"
        onContextMenu={(e) => {
          // Only the bare desktop; windows and icons keep the native menu.
          const target = e.target as HTMLElement
          if (!target.closest('.win') && !target.closest('.desk-icon')) {
            e.preventDefault()
            setMenu({ x: e.clientX, y: e.clientY })
          }
        }}
      >
        <DesktopIcons />
        {windows.map((w) => (
          <Window key={w.id} win={w} focused={w.z === topZ && !w.minimized} mobile={mobile}>
            <AppBody appId={w.appId} props={w.props} />
          </Window>
        ))}
        {menu && <ContextMenu at={menu} onClose={() => setMenu(null)} />}
      </div>
      <Taskbar onShutDown={onShutDown} />
    </div>
  )
}

type Power = 'running' | 'confirming' | 'off'

export default function App() {
  const [booted, setBooted] = useState(alreadyBooted)
  const [power, setPower] = useState<Power>('running')

  useStartupChime(booted && power !== 'off')

  const finish = useCallback(() => {
    try { sessionStorage.setItem(BOOTED_KEY, '1') } catch { /* private mode */ }
    setBooted(true)
  }, [])

  const restart = useCallback(() => {
    try {
      sessionStorage.removeItem(BOOTED_KEY)
      sessionStorage.removeItem(CHIMED_KEY)
    } catch { /* private mode */ }
    setPower('running')
    setBooted(false)
  }, [])

  // Keep the page from scrolling behind the desktop on mobile.
  useEffect(() => {
    document.body.style.overflow = 'hidden'
  }, [])

  return (
    <SettingsProvider>
      {power === 'off' ? (
        <ShutdownScreen onRestart={restart} />
      ) : (
        <>
          {!booted && <BootScreen onDone={finish} />}
          {booted && (
            <WindowProvider>
              <Desktop onShutDown={() => setPower('confirming')} />
              {power === 'confirming' && (
                <ShutdownDialog
                  onConfirm={() => setPower('off')}
                  onCancel={() => setPower('running')}
                />
              )}
            </WindowProvider>
          )}
        </>
      )}
      <CrtOverlay />
      <Analytics />
    </SettingsProvider>
  )
}
