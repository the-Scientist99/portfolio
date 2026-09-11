import type { AppId } from '../content'
import { resolve } from './fs'
import { Explorer } from '../apps/Explorer'
import { TextViewer } from '../apps/TextViewer'
import { ImageViewer } from '../apps/ImageViewer'
import { PdfViewer } from '../apps/PdfViewer'
import { InternetExplorer } from '../apps/InternetExplorer'
import { Notepad } from '../apps/Notepad'
import { Paint } from '../apps/Paint'
import { Calculator } from '../apps/Calculator'
import { Terminal } from '../apps/Terminal'
import { Minesweeper } from '../apps/Minesweeper'
import { MediaPlayer } from '../apps/MediaPlayer'
import { SystemProperties } from '../apps/SystemProperties'
import { DisplayProperties } from '../apps/DisplayProperties'
import { RecycleBin } from '../apps/RecycleBin'

/**
 * Renders the body of a window. The document apps take a `path` and look
 * their own content up, so a window only ever carries a string.
 */
export function AppBody({ appId, props }: { appId: AppId; props: Record<string, unknown> }) {
  const path = typeof props['path'] === 'string' ? (props['path'] as string) : undefined
  const node = path ? resolve(path) : null

  switch (appId) {
    case 'explorer':
      return <Explorer path={path ?? ''} />

    case 'text':
      return <TextViewer body={node?.kind === 'text' ? node.body : 'File not found.'} />

    case 'image':
      return node?.kind === 'image'
        ? <ImageViewer src={node.src} caption={node.caption} />
        : <TextViewer body="Image not found." />

    case 'pdf':
      return <PdfViewer src={node?.kind === 'pdf' ? node.src : './assets/resume.pdf'} />

    case 'browser':
      return <InternetExplorer path={node?.kind === 'page' ? path : undefined} />

    case 'notepad':      return <Notepad />
    case 'paint':        return <Paint />
    case 'calculator':   return <Calculator />
    case 'terminal':     return <Terminal />
    case 'minesweeper':  return <Minesweeper />
    case 'mediaplayer':  return <MediaPlayer />
    case 'sysprops':     return <SystemProperties />
    case 'displayprops': return <DisplayProperties />
    case 'recyclebin':   return <RecycleBin />
  }
}
