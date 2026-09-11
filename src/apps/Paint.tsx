import { useCallback, useEffect, useRef, useState } from 'react'
import { writeUserFile } from '../os/fs'
import { QuotaError } from '../os/storage'
import { ding } from '../os/audio'

const PALETTE = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff',
]

const W = 520
const H = 340

type Tool = 'pencil' | 'eraser' | 'line' | 'rect' | 'fill'

const TOOL_GLYPH: Record<Tool, string> = {
  pencil: '✎', eraser: '⌫', line: '╲', rect: '▭', fill: '▰',
}

const TOOL_LABEL: Record<Tool, string> = {
  pencil: 'Pencil', eraser: 'Eraser', line: 'Line', rect: 'Rectangle', fill: 'Fill',
}

/** Scanline flood fill. Iterative — a recursive one blows the stack on a big region. */
function floodFill(
  img: ImageData, startX: number, startY: number, rgba: [number, number, number, number],
) {
  const { width, height, data } = img
  const at = (x: number, y: number) => (y * width + x) * 4
  const start = at(startX, startY)
  const target = [data[start]!, data[start + 1]!, data[start + 2]!, data[start + 3]!]
  if (target.every((v, i) => v === rgba[i])) return

  const matches = (i: number) =>
    data[i] === target[0] && data[i + 1] === target[1] &&
    data[i + 2] === target[2] && data[i + 3] === target[3]

  const stack: [number, number][] = [[startX, startY]]
  while (stack.length) {
    const [sx, sy] = stack.pop()!
    let x = sx
    while (x >= 0 && matches(at(x, sy))) x--
    x++
    let spanUp = false
    let spanDown = false
    while (x < width && matches(at(x, sy))) {
      const i = at(x, sy)
      data[i] = rgba[0]; data[i + 1] = rgba[1]; data[i + 2] = rgba[2]; data[i + 3] = rgba[3]

      if (sy > 0) {
        const up = matches(at(x, sy - 1))
        if (up && !spanUp) { stack.push([x, sy - 1]); spanUp = true }
        else if (!up) spanUp = false
      }
      if (sy < height - 1) {
        const down = matches(at(x, sy + 1))
        if (down && !spanDown) { stack.push([x, sy + 1]); spanDown = true }
        else if (!down) spanDown = false
      }
      x++
    }
  }
}

function hexToRgba(hex: string): [number, number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
    255,
  ]
}

export function Paint() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  /** Pixels as they were when the current shape drag began, for live preview. */
  const snapshot = useRef<ImageData | null>(null)
  const origin = useRef<{ x: number; y: number } | null>(null)

  const [tool, setTool] = useState<Tool>('pencil')
  const [color, setColor] = useState('#000000')
  const [size, setSize] = useState(2)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctxRef.current = ctx
  }, [])

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    // The canvas can be CSS-scaled; map back to its backing-store pixels.
    return {
      x: Math.round((e.clientX - r.left) * (W / r.width)),
      y: Math.round((e.clientY - r.top) * (H / r.height)),
    }
  }

  const onDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = ctxRef.current
    if (!ctx || e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = point(e)
    setStatus('')

    if (tool === 'fill') {
      const img = ctx.getImageData(0, 0, W, H)
      floodFill(img, p.x, p.y, hexToRgba(color))
      ctx.putImageData(img, 0, 0)
      return
    }

    origin.current = p
    snapshot.current = ctx.getImageData(0, 0, W, H)

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
      ctx.lineWidth = tool === 'eraser' ? size * 4 : size
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
    }
  }, [tool, color, size])

  const onMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = ctxRef.current
    const from = origin.current
    if (!ctx || !from) return
    const p = point(e)

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
      return
    }

    // Shape tools redraw from the snapshot every move so the preview follows.
    if (snapshot.current) ctx.putImageData(snapshot.current, 0, 0)
    ctx.strokeStyle = color
    ctx.lineWidth = size
    ctx.beginPath()
    if (tool === 'line') {
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(p.x, p.y)
    } else {
      ctx.rect(from.x, from.y, p.x - from.x, p.y - from.y)
    }
    ctx.stroke()
  }, [tool, color, size])

  const onUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    origin.current = null
    snapshot.current = null
    const el = e.currentTarget
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
  }, [])

  const clear = useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)
    setStatus('')
  }, [])

  const save = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const suggested = `drawing-${new Date().toISOString().slice(0, 10)}.png`
    const name = window.prompt('Save as:', suggested)
    if (!name) return
    const filename = name.endsWith('.png') ? name : `${name}.png`
    try {
      writeUserFile({
        type: 'image',
        name: filename,
        dataUrl: canvas.toDataURL('image/png'),
        saved: Date.now(),
      })
      setStatus(`Saved to My Documents\\${filename}`)
    } catch (err) {
      ding()
      setStatus(
        err instanceof QuotaError
          ? 'Save failed: not enough browser storage for this image.'
          : 'Save failed.',
      )
    }
  }, [])

  return (
    <div className="window-body flush paint">
      <div className="menubar">
        <button type="button" onClick={save}>Save</button>
        <button type="button" onClick={clear}>Clear</button>
      </div>

      <div className="paint-main">
        <div className="paint-tools" role="toolbar" aria-label="Tools">
          {(Object.keys(TOOL_GLYPH) as Tool[]).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tool === t}
              aria-label={TOOL_LABEL[t]}
              title={TOOL_LABEL[t]}
              onClick={() => setTool(t)}
            >
              {TOOL_GLYPH[t]}
            </button>
          ))}
        </div>

        <div className="paint-canvas-wrap">
          <canvas
            ref={canvasRef}
            className="paint-canvas"
            width={W}
            height={H}
            data-autofocus
            tabIndex={-1}
            aria-label="Drawing canvas"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
        </div>
      </div>

      <div className="paint-bottom">
        <div className="paint-current" style={{ background: color }} aria-hidden="true" />
        <div className="swatches" role="group" aria-label="Colour palette">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              className="swatch"
              style={{ background: c }}
              aria-pressed={color === c}
              aria-label={`Colour ${c}`}
              title={c}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          Size
          <input
            type="range"
            min={1}
            max={12}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            style={{ width: 72 }}
          />
        </label>
      </div>

      <div className="statusbar">
        <div>{status || `${TOOL_LABEL[tool]} — ${W} × ${H}`}</div>
      </div>
    </div>
  )
}

export const __test = { floodFill, hexToRgba }
