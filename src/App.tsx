import { useCallback, useEffect, useState } from 'react'
import { BootScreen } from './os/BootScreen'
import { CrtOverlay } from './os/CrtOverlay'
import { DesktopIcons } from './os/Desktop'
import { Taskbar } from './os/Taskbar'
import { Window } from './os/Window'
import { AppBody } from './os/registry'
import { SettingsProvider, WALLPAPERS, useSettings } from './os/settings'
import { WindowProvider, useWindows } from './os/windowStore'
import { useIsMobile } from './os/useIsMobile'

const BOOTED_KEY = 'portfolio.booted'

function alreadyBooted(): boolean {
  // Reduced motion means the boot animation is skipped entirely.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  try {
    return sessionStorage.getItem(BOOTED_KEY) === '1'
  } catch {
    return false
  }
}

function Desktop() {
  const { windows, topZ } = useWindows()
  const { wallpaper } = useSettings()
  const mobile = useIsMobile()

  return (
    <div id="desktop-root" style={{ background: WALLPAPERS[wallpaper].css }}>
      <div className="desktop-surface">
        <DesktopIcons />
        {windows.map((w) => (
          <Window key={w.id} win={w} focused={w.z === topZ && !w.minimized} mobile={mobile}>
            <AppBody appId={w.appId} props={w.props} />
          </Window>
        ))}
      </div>
      <Taskbar />
    </div>
  )
}

export default function App() {
  const [booted, setBooted] = useState(alreadyBooted)

  const finish = useCallback(() => {
    try { sessionStorage.setItem(BOOTED_KEY, '1') } catch { /* private mode */ }
    setBooted(true)
  }, [])

  // Keep the page from scrolling behind the desktop on mobile.
  useEffect(() => {
    document.body.style.overflow = 'hidden'
  }, [])

  return (
    <SettingsProvider>
      {!booted && <BootScreen onDone={finish} />}
      {booted && (
        <WindowProvider>
          <Desktop />
        </WindowProvider>
      )}
      <CrtOverlay />
    </SettingsProvider>
  )
}
