import { useEffect, useState } from 'react'

const QUERY = '(max-width: 768px)'

/**
 * Below 768px the window manager stops being a window manager: everything
 * opens maximized and the taskbar becomes the navigation.
 */
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const onChange = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener('change', onChange)
    setMobile(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return mobile
}
