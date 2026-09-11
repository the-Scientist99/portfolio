import { useEffect } from 'react'
import type { RefObject } from 'react'

/**
 * Close a floating panel on an outside pointer press or on Escape.
 *
 * Used by the Start menu, the volume popup, and the desktop context menu.
 * The pointerdown listener runs in the capture phase so a click that lands on
 * something else both closes this panel and still reaches its target — the
 * behaviour you want when clicking a desktop icon while the Start menu is up.
 */
export function useDismissable(
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
  /** Selector for the control that opened the panel, so its own click toggles. */
  triggerSelector?: string,
): void {
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = ref.current
      if (!el) return
      const target = e.target as HTMLElement | null
      if (!target) return
      if (el.contains(target)) return
      if (triggerSelector && target.closest(triggerSelector)) return
      onClose()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [ref, onClose, triggerSelector])
}
