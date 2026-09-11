import { useState } from 'react'
import { desktopOrder } from '../content'
import { iconFor, resolve } from './fs'
import { Icon } from './icons'
import { useOpener } from './open'
import { useIsMobile } from './useIsMobile'

export function DesktopIcons() {
  const [selected, setSelected] = useState<string | null>(null)
  const { openPath } = useOpener()
  const mobile = useIsMobile()

  const items = desktopOrder
    .map((name) => ({ name, node: resolve(name) }))
    .filter((e): e is { name: string; node: NonNullable<typeof e.node> } => e.node !== null)

  return (
    <div
      className="icon-grid"
      onPointerDown={(e) => { if (e.target === e.currentTarget) setSelected(null) }}
    >
      {items.map(({ name, node }) => (
        <button
          key={name}
          className="desk-icon"
          aria-pressed={selected === name}
          onClick={() => (mobile ? openPath(name) : setSelected(name))}
          onDoubleClick={() => openPath(name)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPath(name) }
          }}
        >
          <Icon name={iconFor(node)} size={32} />
          <span className="label">{name}</span>
        </button>
      ))}
    </div>
  )
}
