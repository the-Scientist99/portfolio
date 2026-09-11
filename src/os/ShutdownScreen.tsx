import { useEffect, useRef } from 'react'

/**
 * The end of the road, and the way back from it.
 *
 * A shutdown that cannot be undone would be a dead end on a portfolio site,
 * so Restart is always present and any key press takes it too.
 */
export function ShutdownScreen({ onRestart }: { onRestart: () => void }) {
  const btn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    btn.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') onRestart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onRestart])

  return (
    <div className="shutdown" role="status" aria-label="Computer shut down">
      <p className="shutdown-text">
        It&apos;s now safe to turn off
        <br />
        your computer.
      </p>
      <button type="button" ref={btn} className="shutdown-restart" onClick={onRestart}>
        Restart
      </button>
    </div>
  )
}

/** Win95's confirmation dialog, pared back to the one option that exists. */
export function ShutdownDialog({
  onConfirm, onCancel,
}: { onConfirm: () => void; onCancel: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="modal-backdrop">
      <div className="window shutdown-dialog" role="dialog" aria-modal="true"
        aria-label="Shut Down Windows">
        <div className="title-bar">
          <div className="title-bar-text">Shut Down Windows</div>
        </div>
        <div className="window-body">
          <p style={{ margin: '4px 0 14px' }}>Are you sure you want to shut down?</p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button type="button" ref={ref} onClick={onConfirm}>Yes</button>
            <button type="button" onClick={onCancel}>No</button>
          </div>
        </div>
      </div>
    </div>
  )
}
