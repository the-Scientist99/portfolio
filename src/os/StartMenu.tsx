import { useRef } from 'react'
import { Icon } from './icons'
import { useOpener } from './open'
import { useDismissable } from './useDismissable'
import { profile } from '../content'
import type { AppId, IconName } from '../content'

type Item =
  | { kind: 'app'; appId: AppId; label: string; icon: IconName }
  | { kind: 'path'; path: string; label: string; icon: IconName }
  | { kind: 'href'; href: string; label: string; icon: IconName; download?: string }
  | { kind: 'shutdown'; label: string; icon: IconName }
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
  { kind: 'sep' },
  { kind: 'shutdown', label: 'Shut Down...', icon: 'shutdown' },
]

export function StartMenu({
  onClose, onShutDown,
}: { onClose: () => void; onShutDown: () => void }) {
  const { openApp, openPath } = useOpener()
  const ref = useRef<HTMLDivElement>(null)

  useDismissable(ref, onClose, '.start-btn')

  function activate(item: Item) {
    if (item.kind === 'app') openApp(item.appId)
    else if (item.kind === 'path') openPath(item.path)
    else if (item.kind === 'shutdown') onShutDown()
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
              autoFocus={i === 0}
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
