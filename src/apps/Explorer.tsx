import { useMemo, useState } from 'react'
import { Icon } from '../os/icons'
import { basename, iconFor, list, parentOf, segments } from '../os/fs'
import { useOpener } from '../os/open'
import { useIsMobile } from '../os/useIsMobile'

export function Explorer({ path = '' }: { path?: string }) {
  const [cwd, setCwd] = useState(path)
  const [selected, setSelected] = useState<string | null>(null)
  const { openPath } = useOpener()
  const mobile = useIsMobile()

  const entries = useMemo(() => list(cwd), [cwd])
  const atRoot = segments(cwd).length === 0

  function activate(name: string) {
    const full = cwd ? `${cwd}/${name}` : name
    const entry = entries.find(([n]) => n === name)
    // Folders navigate in place; everything else opens its own window.
    if (entry && entry[1].kind === 'folder') setCwd(full)
    else openPath(full)
  }

  return (
    <div className="window-body flush">
      <div className="explorer-toolbar">
        <button
          type="button"
          disabled={atRoot}
          onClick={() => setCwd(parentOf(cwd))}
          aria-label="Up one level"
          title="Up one level"
        >
          ↑ Up
        </button>
        <div className="explorer-path" title={cwd || 'Desktop'}>
          C:\{segments(cwd).join('\\') || 'DESKTOP'}
        </div>
      </div>

      <div className="explorer-list" role="listbox" aria-label={basename(cwd)}>
        {entries.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: 12, color: '#666' }}>
            This folder is empty.
          </div>
        )}
        {entries.map(([name, node]) => (
          <button
            key={name}
            className="explorer-item"
            role="option"
            aria-pressed={selected === name}
            aria-selected={selected === name}
            onClick={() => (mobile ? activate(name) : setSelected(name))}
            onDoubleClick={() => activate(name)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                activate(name)
              }
            }}
          >
            <Icon name={iconFor(node)} size={32} />
            <span>{name}</span>
          </button>
        ))}
      </div>

      <div className="statusbar">
        <div>{entries.length} object{entries.length === 1 ? '' : 's'}</div>
        <div>{selected ?? (mobile ? 'Tap to open' : 'Double-click to open')}</div>
      </div>
    </div>
  )
}
