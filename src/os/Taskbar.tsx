import { useEffect, useState } from 'react'
import { Icon } from './icons'
import { useWindows } from './windowStore'
import { useSettings } from './settings'
import { StartMenu } from './StartMenu'

function Clock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    // Tick on the minute boundary rather than every second.
    let timer: number
    const schedule = () => {
      const ms = 60_000 - (Date.now() % 60_000)
      timer = window.setTimeout(() => { setNow(new Date()); schedule() }, ms + 50)
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [])

  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return (
    <span title={now.toLocaleDateString()} aria-label={`Current time ${time}`}>
      {time}
    </span>
  )
}

export function Taskbar() {
  const { windows, topZ, toggleMin } = useWindows()
  const { crt, setCrt } = useSettings()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {menuOpen && <StartMenu onClose={() => setMenuOpen(false)} />}

      <div className="taskbar">
        <button
          type="button"
          className="start-btn"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <Icon name="computer" size={15} />
          Start
        </button>

        <div className="task-divider" aria-hidden="true" />

        <div className="task-buttons">
          {windows.map((w) => {
            const active = !w.minimized && w.z === topZ
            return (
              <button
                key={w.id}
                type="button"
                className="task-btn"
                aria-pressed={active}
                style={active ? { fontWeight: 'bold' } : undefined}
                onClick={() => toggleMin(w.id)}
                title={w.title}
              >
                <Icon name={w.icon} size={14} />
                <span>{w.title}</span>
              </button>
            )
          })}
        </div>

        <div className="tray">
          <button
            type="button"
            className="tray-btn"
            onClick={() => setCrt(!crt)}
            title={crt ? 'Turn CRT effect off' : 'Turn CRT effect on'}
            aria-label={crt ? 'Turn CRT effect off' : 'Turn CRT effect on'}
            aria-pressed={crt}
          >
            <Icon name="settings" size={14} />
          </button>
          <Clock />
        </div>
      </div>
    </>
  )
}
