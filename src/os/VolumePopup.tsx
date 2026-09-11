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

      {/* 98.css's `.is-vertical` builds its slider from a rotate + translate,
          so it paints half its height above its own layout box and cannot be
          laid out in normal flow without overlapping what follows. The box
          below holds the space; the widget itself is positioned inside it. */}
      <div className="volume-slider-box">
        <div className="is-vertical">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(volume * 100)}
            aria-label="Volume level"
            autoFocus
            onChange={(e) => {
              // Touching the slider is a user gesture, so it is a valid
              // moment to start the audio graph.
              ensure()
              setVolume(Number(e.target.value) / 100)
            }}
          />
        </div>
      </div>

      <div className="volume-value">{muted ? '—' : `${Math.round(volume * 100)}`}</div>

      <div className="volume-mute">
        <input
          type="checkbox"
          id="volume-mute"
          checked={muted}
          onChange={(e) => setMuted(e.target.checked)}
        />
        <label htmlFor="volume-mute">Mute</label>
      </div>
    </div>
  )
}
