import { useCallback, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { MIN_H, MIN_W, useWindows } from './windowStore'
import type { WinState } from './windowStore'
import { Icon } from './icons'

const TASKBAR_H = 28

type Props = {
  win: WinState
  focused: boolean
  mobile: boolean
  children: ReactNode
}

/**
 * Window chrome: title bar, drag, resize, focus, minimize/maximize/close.
 *
 * Drag and resize both use pointer capture rather than document-level
 * listeners — the browser routes every subsequent move to the captured
 * element, so there is nothing to leak and touch works for free.
 */
export function Window({ win, focused, mobile, children }: Props) {
  const { close, focus, minimize, toggleMax, move, resize } = useWindows()
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const sizing = useRef<{ ox: number; oy: number; w: number; h: number } | null>(null)

  const maximized = win.maximized || mobile

  // Focus the window's content on open so keyboard users land inside it.
  useEffect(() => {
    if (!focused) return
    const el = ref.current
    if (!el) return
    if (el.contains(document.activeElement)) return
    const target = el.querySelector<HTMLElement>('[data-autofocus]')
    target?.focus()
  }, [focused, win.id])

  const onTitlePointerDown = useCallback((e: React.PointerEvent) => {
    focus(win.id)
    if (maximized) return
    if (e.button !== 0) return
    // Let the title bar buttons handle their own clicks.
    if ((e.target as HTMLElement).closest('button')) return
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [focus, win.id, win.x, win.y, maximized])

  const onTitlePointerMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const maxY = window.innerHeight - TASKBAR_H - 24
    move(
      win.id,
      Math.max(-win.w + 80, Math.min(e.clientX - d.dx, window.innerWidth - 80)),
      Math.max(0, Math.min(e.clientY - d.dy, maxY)),
    )
  }, [move, win.id, win.w])

  const endDrag = useCallback((e: React.PointerEvent) => {
    drag.current = null
    const el = e.currentTarget as HTMLElement
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
  }, [])

  const onGripPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.stopPropagation()
    focus(win.id)
    sizing.current = { ox: e.clientX, oy: e.clientY, w: win.w, h: win.h }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [focus, win.id, win.w, win.h])

  const onGripPointerMove = useCallback((e: React.PointerEvent) => {
    const s = sizing.current
    if (!s) return
    resize(
      win.id,
      Math.max(MIN_W, s.w + (e.clientX - s.ox)),
      Math.max(MIN_H, s.h + (e.clientY - s.oy)),
    )
  }, [resize, win.id])

  const endResize = useCallback((e: React.PointerEvent) => {
    sizing.current = null
    const el = e.currentTarget as HTMLElement
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
  }, [])

  // Esc closes the focused window. Apps that need Esc themselves stop the
  // event before it reaches here.
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      close(win.id)
    }
  }, [close, win.id])

  // The parent .desktop-surface already stops above the taskbar, so a
  // maximized window fills it completely — subtracting the taskbar here too
  // would leave a dead strip along the bottom.
  const style: React.CSSProperties = maximized
    ? { left: 0, top: 0, width: '100%', height: '100%', zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }

  return (
    <div
      ref={ref}
      className={`window win${mobile ? ' mobile' : ''}`}
      style={{ ...style, display: win.minimized ? 'none' : 'flex' }}
      role="dialog"
      aria-label={win.title}
      aria-modal={false}
      onPointerDownCapture={() => focus(win.id)}
      onKeyDown={onKeyDown}
    >
      <div
        className={`title-bar${focused ? '' : ' inactive'}`}
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => !mobile && toggleMax(win.id)}
        style={{ touchAction: 'none' }}
      >
        <div className="title-bar-text">
          <Icon name={win.icon} size={13} />
          {win.title}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={() => minimize(win.id)} />
          {!mobile && (
            <button
              aria-label={win.maximized ? 'Restore' : 'Maximize'}
              onClick={() => toggleMax(win.id)}
            />
          )}
          <button aria-label="Close" onClick={() => close(win.id)} />
        </div>
      </div>

      <div className="win-body">{children}</div>

      {!maximized && (
        <div
          className="resize-grip"
          onPointerDown={onGripPointerDown}
          onPointerMove={onGripPointerMove}
          onPointerUp={endResize}
          onPointerCancel={endResize}
          role="presentation"
        />
      )}
    </div>
  )
}
