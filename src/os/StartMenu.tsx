import { useEffect, useRef } from 'react'
import { Icon } from './icons'
import { useOpener } from './open'
import { profile } from '../content'
import type { AppId, IconName } from '../content'

type Item =
  | { kind: 'app'; appId: AppId; label: string; icon: IconName }
  | { kind: 'path'; path: string; label: string; icon: IconName }
  | { kind: 'href'; href: string; label: string; icon: IconName; download?: string }
  | { kind: 'sep' }

const ITEMS: Item[] = [
  { kind: 'path', path: 'About Me', label: 'About Me', icon: 'folder' },
  { kind: 'path', path: 'Experience', label: 'Experience', icon: 'folder' },
  { kind: 'path', path: 'Projects', label: 'Projects', icon: 'folder' },
  { kind: 'path', path: 'My Documents', label: 'My Documents', icon: 'folder' },
  { kind: 'app', appId: 'sysprops', label: 'Skills', icon: 'computer' },
  { kind: 'sep' },
  { kind: 'app', appId: 'notepad', label: 'Notepad', icon: 'notepad' },
  { kind: 'app', appId: 'paint', label: 'Paint', icon: 'paint' },
  { kind: 'app', appId: 'calculator', label: 'Calculator', icon: 'calculator' },
  { kind: 'app', appId: 'terminal', label: 'MS-DOS Prompt', icon: 'terminal' },
  { kind: 'app', appId: 'minesweeper', label: 'Minesweeper', icon: 'mine' },
  { kind: 'app', appId: 'mediaplayer', label: 'Media Player', icon: 'media' },
  { kind: 'app', appId: 'browser', label: 'Internet Explorer', icon: 'ie' },
  { kind: 'sep' },
  { kind: 'app', appId: 'displayprops', label: 'Settings', icon: 'settings' },
  { kind: 'href', href: `mailto:${profile.email}`, label: 'Email me', icon: 'mail' },
  { kind: 'href', href: profile.resume, label: 'Download resume', icon: 'pdf',
    download: 'Emir_Kardovic_Resume.pdf' },
]

export function StartMenu({ onClose }: { onClose: () => void }) {
  const { openApp, openPath } = useOpener()
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside pointer or Escape. Capture phase so a click on a desktop
  // icon closes the menu and still reaches the icon.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const el = ref.current
      if (!el) return
      const target = e.target as HTMLElement
      if (el.contains(target) || target.closest('.start-btn')) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('pointerdown', onDown, true)
    document.addEventListener('keydown', onKey)
    ref.current?.querySelector<HTMLElement>('.start-item')?.focus()
    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  function activate(item: Item) {
    if (item.kind === 'app') openApp(item.appId)
    else if (item.kind === 'path') openPath(item.path)
    else if (item.kind === 'href') {
      const a = document.createElement('a')
      a.href = item.href
      if (item.download) a.download = item.download
      else a.rel = 'noreferrer'
      a.click()
    }
    onClose()
  }

  return (
    <div className="window start-menu" ref={ref} role="menu" aria-label="Start menu">
      <div className="start-rail" aria-hidden="true"><span>Kardović 95</span></div>
      <div className="start-items">
        {ITEMS.map((item, i) =>
          item.kind === 'sep' ? (
            <div className="start-sep" key={`sep-${i}`} role="separator" />
          ) : (
            <button
              key={item.label}
              type="button"
              className="start-item"
              role="menuitem"
              onClick={() => activate(item)}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </button>
          ),
        )}
      </div>
    </div>
  )
}
