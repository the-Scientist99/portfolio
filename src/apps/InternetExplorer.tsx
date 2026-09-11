import { useMemo, useState } from 'react'
import { list, resolve } from '../os/fs'
import { profile } from '../content'

const HOME = 'about:home'

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/**
 * Project write-ups behind period-correct browser chrome.
 *
 * The page bodies come from `content.ts`, which is authored in this repo —
 * not from user input or the network — so `dangerouslySetInnerHTML` here is
 * rendering our own template, not injecting a third party's markup.
 */
export function InternetExplorer({ path }: { path?: string }) {
  const projects = useMemo(() => list('Projects'), [])
  const [current, setCurrent] = useState<string>(path ?? HOME)
  const [history, setHistory] = useState<string[]>([path ?? HOME])
  const [cursor, setCursor] = useState(0)

  function go(next: string) {
    const trimmed = history.slice(0, cursor + 1)
    setHistory([...trimmed, next])
    setCursor(trimmed.length)
    setCurrent(next)
  }

  function step(delta: number) {
    const i = cursor + delta
    const target = history[i]
    if (target === undefined) return
    setCursor(i)
    setCurrent(target)
  }

  const node = current === HOME ? null : resolve(current)
  const page = node && node.kind === 'page' ? node : null
  const address = current === HOME
    ? `http://www.${slug(profile.name.replace(/ć/g, 'c'))}.net/`
    : `http://www.${slug(profile.name.replace(/ć/g, 'c'))}.net/${slug(current.split('/').pop() ?? '')}.html`

  return (
    <div className="window-body flush">
      <div className="explorer-toolbar">
        <button type="button" onClick={() => step(-1)} disabled={cursor === 0}>← Back</button>
        <button type="button" onClick={() => step(1)} disabled={cursor >= history.length - 1}>
          Forward →
        </button>
        <button type="button" onClick={() => go(HOME)}>Home</button>
        <div className="explorer-path" title={address}>{address}</div>
      </div>

      <div className="ie-page" tabIndex={0} data-autofocus>
        {page ? (
          <div dangerouslySetInnerHTML={{ __html: page.html }} />
        ) : current === HOME ? (
          <div className="ie-home">
            <h1>{profile.name}</h1>
            <p className="lede">{profile.role} — {profile.location}</p>
            <h2>Project write-ups</h2>
            <ul>
              {projects.map(([name, n]) => (
                <li key={name}>
                  <a
                    href={`#${slug(name)}`}
                    onClick={(e) => { e.preventDefault(); go(`Projects/${name}`) }}
                  >
                    {n.kind === 'page' ? n.title : name}
                  </a>
                </li>
              ))}
            </ul>
            <h2>Elsewhere</h2>
            <ul>
              <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li>
              <li>
                <a href={profile.linkedinHref} target="_blank" rel="noreferrer">
                  {profile.linkedinLabel}
                </a>
              </li>
              <li><a href={profile.resume} download>Resume (PDF)</a></li>
            </ul>
            <p style={{ fontSize: 12, color: '#666', marginTop: 26 }}>
              Best viewed at 800×600. Your mileage may vary.
            </p>
          </div>
        ) : (
          <>
            <h1>404 — Page Not Found</h1>
            <p className="lede">The page you requested could not be located on this server.</p>
            <p>
              <a href="#home" onClick={(e) => { e.preventDefault(); go(HOME) }}>
                Return to the home page
              </a>
            </p>
          </>
        )}
      </div>

      <div className="statusbar">
        <div>Done</div>
        <div>Internet zone</div>
      </div>
    </div>
  )
}
