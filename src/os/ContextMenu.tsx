import { useLayoutEffect, useRef, useState } from 'react'
import { Icon } from './icons'
import { useOpener } from './open'
import { useDismissable } from './useDismissable'

export type MenuPos = { x: number; y: number }

/**
 * Desktop right-click menu.
 *
 * No "Arrange Icons": desktop icons sit in a CSS grid rather than free
 * positions, so the item would do nothing. A menu entry that lies is worse
 * than one that is missing.
 */
export function ContextMenu({ at, onClose }: { at: MenuPos; onClose: () => void }) {
  const { openApp } = useOpener()
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<MenuPos>(at)

  useDismissable(ref, onClose)

  // Keep the menu on screen when opened near an edge.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    // Read the taskbar rather than hardcoding it — it is 28px on desktop and
    // 34px on mobile.
    const taskbar =
      document.querySelector('.taskbar')?.getBoundingClientRect().height ?? 34
    setPos({
      x: Math.max(2, Math.min(at.x, window.innerWidth - width - 2)),
      y: Math.max(2, Math.min(at.y, window.innerHeight - taskbar - height - 2)),
    })
  }, [at])

  function run(fn: () => void) {
    fn()
    onClose()
  }

  return (
    <div
      className="window context-menu"
      ref={ref}
      role="menu"
      aria-label="Desktop menu"
      style={{ left: pos.x, top: pos.y }}
    >
      <div className="context-group-label" aria-hidden="true">New</div>
      <button type="button" className="start-item" role="menuitem" autoFocus
        onClick={() => run(() => openApp('notepad'))}>
        <Icon name="notepad" size={16} />
        Text Document
      </button>
      <button type="button" className="start-item" role="menuitem"
        onClick={() => run(() => openApp('paint'))}>
        <Icon name="paint" size={16} />
        Bitmap Image
      </button>

      <div className="start-sep" role="separator" />

      <button type="button" className="start-item" role="menuitem"
        onClick={() => run(() => window.location.reload())}>
        <Icon name="refresh" size={16} />
        Refresh
      </button>

      <div className="start-sep" role="separator" />

      <button type="button" className="start-item" role="menuitem"
        onClick={() => run(() => openApp('displayprops'))}>
        <Icon name="settings" size={16} />
        Properties
      </button>
    </div>
  )
}
