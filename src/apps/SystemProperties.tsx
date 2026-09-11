import { useState } from 'react'
import { profile, skills } from '../content'
import { Icon } from '../os/icons'

/** Skills rendered as the Device Manager tree, because that is what it is. */
export function SystemProperties() {
  const [open, setOpen] = useState<Record<string, boolean>>(
    () => Object.fromEntries(skills.map((s) => [s.group, true])),
  )

  return (
    <div className="window-body flush">
      <div style={{ display: 'flex', gap: 10, padding: 10, alignItems: 'center' }}>
        <Icon name="computer" size={44} />
        <div className="selectable">
          <div style={{ fontWeight: 'bold', fontSize: 13 }}>{profile.name}</div>
          <div>{profile.role}</div>
          <div style={{ color: '#444' }}>{profile.location}</div>
        </div>
      </div>

      <div style={{ padding: '0 10px 6px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: 3 }}>Installed components:</div>
      </div>

      <div className="tree-root">
        {skills.map(({ group, items }) => {
          const expanded = open[group] ?? false
          return (
            <div className="tree-group" key={group}>
              <button
                type="button"
                className="tree-toggle"
                aria-expanded={expanded}
                onClick={() => setOpen((o) => ({ ...o, [group]: !expanded }))}
              >
                <span className="tree-box" aria-hidden="true">{expanded ? '−' : '+'}</span>
                <Icon name={expanded ? 'folderOpen' : 'folder'} size={14} />
                <span style={{ fontWeight: 'bold' }}>{group}</span>
              </button>
              {expanded && (
                <div className="tree-children">
                  {items.map((item) => (
                    <div className="tree-leaf" key={item}>
                      <Icon name="settings" size={13} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="statusbar">
        <div>{skills.reduce((n, s) => n + s.items.length, 0)} components, all functioning normally</div>
      </div>
    </div>
  )
}
