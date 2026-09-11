import type { IconName } from '../content'

/**
 * Hand-drawn 16x16 pixel icons. `shape-rendering="crispEdges"` and integer
 * coordinates keep them sharp at any zoom — a scaled-up PNG would not.
 */

type P = { size?: number; className?: string }

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  shapeRendering: 'crispEdges' as const,
  xmlns: 'http://www.w3.org/2000/svg',
  focusable: false,
  'aria-hidden': true as const,
})

function Folder({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <path d="M1 3h5l1 2h8v8H1z" fill="#ffd24d" stroke="#000" strokeWidth="1" />
      <path d="M1 5h13v8H1z" fill="#ffe08a" stroke="#000" strokeWidth="1" />
    </svg>
  )
}

function FolderOpen({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <path d="M1 3h5l1 2h7v3H1z" fill="#ffd24d" stroke="#000" strokeWidth="1" />
      <path d="M1 13V7h13l-2 6z" fill="#ffe9b0" stroke="#000" strokeWidth="1" />
    </svg>
  )
}

function TextFile({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <path d="M3 1h7l3 3v11H3z" fill="#fff" stroke="#000" />
      <path d="M10 1v3h3" fill="none" stroke="#000" />
      <g fill="#4a4a4a">
        <rect x="5" y="6" width="6" height="1" />
        <rect x="5" y="8" width="6" height="1" />
        <rect x="5" y="10" width="4" height="1" />
      </g>
    </svg>
  )
}

function Pdf({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <path d="M3 1h7l3 3v11H3z" fill="#fff" stroke="#000" />
      <path d="M10 1v3h3" fill="none" stroke="#000" />
      <rect x="3" y="9" width="10" height="5" fill="#c22" />
      <text x="8" y="13.2" fontSize="4.2" fill="#fff" textAnchor="middle"
        fontFamily="Arial, sans-serif" fontWeight="bold">PDF</text>
    </svg>
  )
}

function ImageIcon({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <rect x="1" y="3" width="14" height="10" fill="#fff" stroke="#000" />
      <rect x="2" y="4" width="12" height="8" fill="#6cf" />
      <circle cx="5" cy="6.5" r="1.2" fill="#ff4" />
      <path d="M2 12l3.5-4 2.5 2.5L11 7l3 5z" fill="#2a2" />
    </svg>
  )
}

function Computer({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <rect x="1" y="2" width="14" height="9" fill="#c0c0c0" stroke="#000" />
      <rect x="2" y="3" width="12" height="7" fill="#008080" />
      <rect x="5" y="11" width="6" height="2" fill="#c0c0c0" stroke="#000" />
      <rect x="3" y="13" width="10" height="2" fill="#808080" stroke="#000" />
    </svg>
  )
}

function Notepad({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <rect x="2" y="1" width="12" height="14" fill="#fff" stroke="#000" />
      <rect x="2" y="1" width="3" height="14" fill="#4aa" />
      <g fill="#666">
        <rect x="6" y="4" width="6" height="1" />
        <rect x="6" y="7" width="6" height="1" />
        <rect x="6" y="10" width="4" height="1" />
      </g>
    </svg>
  )
}

function Paint({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <path d="M2 10c0-4 3-7 7-7s5 2 5 4-2 3-3 3h-2c-1 0-1 1 0 2s0 3-2 3c-3 0-5-2-5-5z"
        fill="#fff" stroke="#000" />
      <circle cx="6" cy="6" r="1.1" fill="#e22" />
      <circle cx="9" cy="5" r="1.1" fill="#22e" />
      <circle cx="11.5" cy="7.5" r="1.1" fill="#2a2" />
      <circle cx="5" cy="9" r="1.1" fill="#fd0" />
    </svg>
  )
}

function Calculator({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <rect x="2" y="1" width="12" height="14" fill="#c0c0c0" stroke="#000" />
      <rect x="3" y="2" width="10" height="3" fill="#9fc" stroke="#000" />
      <g fill="#333">
        <rect x="3.5" y="6.5" width="2" height="2" />
        <rect x="7" y="6.5" width="2" height="2" />
        <rect x="10.5" y="6.5" width="2" height="2" />
        <rect x="3.5" y="9.5" width="2" height="2" />
        <rect x="7" y="9.5" width="2" height="2" />
        <rect x="10.5" y="9.5" width="2" height="2" />
        <rect x="3.5" y="12.5" width="5.5" height="1.5" />
        <rect x="10.5" y="12.5" width="2" height="1.5" />
      </g>
    </svg>
  )
}

function Terminal({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <rect x="1" y="2" width="14" height="12" fill="#000" stroke="#000" />
      <path d="M3 5l2.5 2.5L3 10" fill="none" stroke="#3f3" strokeWidth="1.2" />
      <rect x="7" y="9.5" width="5" height="1.2" fill="#3f3" />
    </svg>
  )
}

function Mine({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <rect width="16" height="16" fill="#c0c0c0" />
      <circle cx="8" cy="8" r="4.5" fill="#000" />
      <rect x="7.4" y="1.5" width="1.2" height="13" fill="#000" />
      <rect x="1.5" y="7.4" width="13" height="1.2" fill="#000" />
      <rect x="6" y="6" width="1.6" height="1.6" fill="#fff" />
    </svg>
  )
}

function Media({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <rect x="1" y="2" width="14" height="12" fill="#2b2b3d" stroke="#000" />
      <path d="M6 5l6 3-6 3z" fill="#3f9" />
    </svg>
  )
}

function Ie({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <circle cx="8" cy="8" r="6.5" fill="#1f6fd0" stroke="#000" />
      <ellipse cx="8" cy="8" rx="6.5" ry="2.6" fill="none" stroke="#cfe8ff" />
      <path d="M8 1.5v13" stroke="#cfe8ff" fill="none" />
      <path d="M2.5 5.5c4 2 7 2 11 0" stroke="#cfe8ff" fill="none" />
    </svg>
  )
}

function Mail({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <rect x="1" y="3" width="14" height="10" fill="#fff" stroke="#000" />
      <path d="M1 3l7 5 7-5" fill="none" stroke="#000" />
    </svg>
  )
}

function Link({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <circle cx="8" cy="8" r="6.5" fill="#dff" stroke="#000" />
      <path d="M1.5 8h13M8 1.5c3 3 3 10 0 13M8 1.5c-3 3-3 10 0 13"
        fill="none" stroke="#06c" />
    </svg>
  )
}

function Recycle({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <path d="M4 4h8l-1 10H5z" fill="#b9c7cf" stroke="#000" />
      <rect x="3" y="2" width="10" height="2" fill="#9fb0ba" stroke="#000" />
      <g stroke="#556" fill="none">
        <path d="M6.5 6v6M9.5 6v6" />
      </g>
    </svg>
  )
}

function Settings({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <rect x="1" y="2" width="14" height="10" fill="#c0c0c0" stroke="#000" />
      <rect x="2" y="3" width="12" height="8" fill="#008080" />
      <rect x="4" y="5" width="8" height="1.5" fill="#fff" />
      <rect x="4" y="8" width="5" height="1.5" fill="#fff" />
      <rect x="5" y="12" width="6" height="2" fill="#808080" stroke="#000" />
    </svg>
  )
}

function Info({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <circle cx="8" cy="8" r="7" fill="#008" stroke="#000" />
      <rect x="7" y="6.5" width="2" height="5.5" fill="#fff" />
      <rect x="7" y="3.5" width="2" height="2" fill="#fff" />
    </svg>
  )
}

const MAP: Record<IconName, (p: P) => React.ReactElement> = {
  folder: Folder,
  folderOpen: FolderOpen,
  textFile: TextFile,
  pdf: Pdf,
  image: ImageIcon,
  computer: Computer,
  notepad: Notepad,
  paint: Paint,
  calculator: Calculator,
  terminal: Terminal,
  mine: Mine,
  media: Media,
  ie: Ie,
  mail: Mail,
  link: Link,
  recycle: Recycle,
  settings: Settings,
  info: Info,
}

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const C = MAP[name] ?? Info
  return <C size={size} />
}
