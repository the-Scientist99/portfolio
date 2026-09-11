import { useCallback, useRef, useState } from 'react'
import { writeUserFile } from '../os/fs'
import { QuotaError } from '../os/storage'

const GREETING = `Go ahead, type something.

Save it and it turns up in My Documents, still there when
you come back. Stored in your own browser, nowhere else.
`

export function Notepad({ body }: { body?: string }) {
  const [text, setText] = useState(body ?? GREETING)
  const [status, setStatus] = useState('')
  const [wrap, setWrap] = useState(true)
  const area = useRef<HTMLTextAreaElement>(null)

  const saveAs = useCallback(() => {
    const suggested = `note-${new Date().toISOString().slice(0, 10)}.txt`
    const name = window.prompt('Save as:', suggested)
    if (!name) return
    const filename = name.endsWith('.txt') ? name : `${name}.txt`
    try {
      writeUserFile({ type: 'text', name: filename, body: text, saved: Date.now() })
      setStatus(`Saved to My Documents\\${filename}`)
    } catch (err) {
      setStatus(
        err instanceof QuotaError
          ? 'Save failed: not enough browser storage.'
          : 'Save failed.',
      )
    }
  }, [text])

  return (
    <div className="window-body flush">
      <div className="menubar">
        <button type="button" onClick={saveAs}>Save</button>
        <button type="button" onClick={() => { setText(''); setStatus('') }}>New</button>
        <button type="button" onClick={() => setWrap((w) => !w)}>
          Word Wrap: {wrap ? 'On' : 'Off'}
        </button>
      </div>

      <textarea
        ref={area}
        className="notepad-area"
        data-autofocus
        value={text}
        wrap={wrap ? 'soft' : 'off'}
        spellCheck={false}
        aria-label="Document text"
        onChange={(e) => { setText(e.target.value); setStatus('') }}
        // Esc closes windows; inside a text field it should not.
        onKeyDown={(e) => { if (e.key === 'Escape') e.stopPropagation() }}
      />

      <div className="statusbar">
        <div>{status || `${text.length} characters`}</div>
        <div>Ln {text.slice(0, area.current?.selectionStart ?? 0).split('\n').length}</div>
      </div>
    </div>
  )
}
