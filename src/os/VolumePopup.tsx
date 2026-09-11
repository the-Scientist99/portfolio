import { useRef } from 'react'
import { useDismissable } from './useDismissable'
import { useSettings } from './settings'
import { ensure } from './audio'

/**
 * The taskbar volume control, as Win95 had it: a vertical slider and a mute
 * checkbox in a small panel above the tray.
 *
 * The vertical slider is a plain range input rotated with `writing-mode`,
 * which every current browser supports natively — no JS drag handling.
 */
export function VolumePopup({ onClose }: { onClose: () => void }) {
  const { volume, muted, setVolume, setMuted } = useSettings()
  const ref = useRef<HTMLDivElement>(null)

  useDismissable(ref, onClose, '.tray-volume')

  return (
    <div className="window volume-popup" ref={ref} role="group" aria-label="Volume">
      <div className="volume-label">Volume</div>

      {/* 98.css ships its own vertical slider (`.is-vertical`), built on a
          rotation rather than `writing-mode` — which its track and thumb
          styling does not survive. Use the library's own mechanism. */}
      <div className="is-vertical volume-slider">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(volume * 100)}
          aria-label="Volume level"
          autoFocus
          onChange={(e) => {
            // Touching the slider is a user gesture, so it is a valid moment
            // to start the audio graph.
            ensure()
            setVolume(Number(e.target.value) / 100)
          }}
        />
      </div>

      <div className="volume-value">{muted ? '—' : `${Math.round(volume * 100)}`}</div>

      <label className="volume-mute">
        <input
          type="checkbox"
          checked={muted}
          onChange={(e) => setMuted(e.target.checked)}
        />
        Mute
      </label>
    </div>
  )
}
