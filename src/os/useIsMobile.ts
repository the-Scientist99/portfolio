import { useEffect, useState } from 'react'

/** Shared subscription to a media query. */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', onChange)
    setMatches(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/**
 * Below 768px the window manager stops being a window manager: everything
 * opens maximized and the taskbar becomes the navigation.
 *
 * This is about available space, not input device — use `useCoarsePointer`
 * for anything that depends on how the visitor is actually pointing.
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)')
}

/**
 * True when the primary input is a finger rather than a mouse. Distinct from
 * `useIsMobile`: a narrow desktop window is small but still has a mouse, and
 * a tablet is wide but has no right-click.
 */
export function useCoarsePointer(): boolean {
  return useMediaQuery('(pointer: coarse)')
}
