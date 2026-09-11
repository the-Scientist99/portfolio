import { WALLPAPERS, useSettings } from '../os/settings'
import type { WallpaperId } from '../os/settings'

export function DisplayProperties() {
  const { crt, wallpaper, setCrt, setWallpaper } = useSettings()

  return (
    <div className="window-body flush dp">
      <div className="dp-preview">
        <div className="dp-screen" style={{ background: WALLPAPERS[wallpaper].css }} />
      </div>

      <fieldset>
        <legend>Background</legend>
        {(Object.keys(WALLPAPERS) as WallpaperId[]).map((id) => (
          <div className="row" key={id}>
            <input
              type="radio"
              id={`wp-${id}`}
              name="wallpaper"
              checked={wallpaper === id}
              onChange={() => setWallpaper(id)}
            />
            <label htmlFor={`wp-${id}`}>{WALLPAPERS[id].label}</label>
          </div>
        ))}
      </fieldset>

      <fieldset>
        <legend>Monitor</legend>
        <div className="row">
          <input
            type="checkbox"
            id="crt-toggle"
            checked={crt}
            onChange={(e) => setCrt(e.target.checked)}
          />
          <label htmlFor="crt-toggle">CRT simulation (scanlines, glow, flicker)</label>
        </div>
        <p style={{ margin: '6px 2px 0', color: '#444' }}>
          Turn this off for flat, sharp text. The setting is remembered.
        </p>
      </fieldset>
    </div>
  )
}
