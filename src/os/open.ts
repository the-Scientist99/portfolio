import { useCallback } from 'react'
import type { AppId, IconName, Node } from '../content'
import { basename, iconFor, resolve } from './fs'
import { useWindows } from './windowStore'

type Meta = { title: string; icon: IconName; w: number; h: number }

export const APP_META: Record<AppId, Meta> = {
  explorer:     { title: 'Explorer',           icon: 'folderOpen', w: 520, h: 360 },
  text:         { title: 'Document',           icon: 'textFile',   w: 570, h: 440 },
  image:        { title: 'Image Preview',      icon: 'image',      w: 480, h: 380 },
  pdf:          { title: 'Resume',             icon: 'pdf',        w: 640, h: 560 },
  browser:      { title: 'Internet Explorer',  icon: 'ie',         w: 660, h: 500 },
  notepad:      { title: 'Untitled - Notepad', icon: 'notepad',    w: 480, h: 360 },
  paint:        { title: 'untitled - Paint',   icon: 'paint',      w: 560, h: 440 },
  calculator:   { title: 'Calculator',         icon: 'calculator', w: 262, h: 250 },
  terminal:     { title: 'MS-DOS Prompt',      icon: 'terminal',   w: 560, h: 360 },
  minesweeper:  { title: 'Minesweeper',        icon: 'mine',       w: 260, h: 320 },
  mediaplayer:  { title: 'Media Player',       icon: 'media',      w: 320, h: 220 },
  sysprops:     { title: 'System Properties',  icon: 'computer',   w: 420, h: 420 },
  displayprops: { title: 'Display Properties', icon: 'settings',   w: 380, h: 420 },
  recyclebin:   { title: 'Recycle Bin',        icon: 'recycle',    w: 380, h: 240 },
}

/** Which app renders a given filesystem node. */
function appFor(node: Node): AppId {
  switch (node.kind) {
    case 'folder': return 'explorer'
    case 'text':   return 'text'
    case 'image':  return 'image'
    case 'pdf':    return 'pdf'
    case 'page':   return 'browser'
    case 'app':    return node.appId
    case 'link':   return 'browser'
  }
}

export function useOpener() {
  const { open } = useWindows()

  const openApp = useCallback((
    appId: AppId,
    extra?: { title?: string; props?: Record<string, unknown>; singletonKey?: string },
  ) => {
    const meta = APP_META[appId]
    open({
      appId,
      title: extra?.title ?? meta.title,
      icon: meta.icon,
      w: meta.w,
      h: meta.h,
      props: extra?.props,
      // Utility windows are singletons; documents key off their path.
      singletonKey: extra?.singletonKey
        ?? (appId === 'sysprops' || appId === 'displayprops' || appId === 'recyclebin'
          ? appId
          : undefined),
    })
  }, [open])

  /** Open whatever lives at `path`. No-op for a path that does not resolve. */
  const openPath = useCallback((path: string) => {
    const node = resolve(path)
    if (!node) return

    if (node.kind === 'link') {
      window.open(node.href, '_blank', 'noopener,noreferrer')
      return
    }

    const appId = appFor(node)
    const meta = APP_META[appId]
    const name = basename(path)

    const titles: Partial<Record<AppId, string>> = {
      explorer: name,
      text: `${name} - Notepad`,
      image: `${name} - Image Preview`,
      pdf: `${name} - Resume`,
      browser: node.kind === 'page' ? node.title : meta.title,
    }

    open({
      appId,
      title: titles[appId] ?? meta.title,
      icon: node.kind === 'app' ? meta.icon : iconFor(node),
      w: meta.w,
      h: meta.h,
      props: { path },
      singletonKey: `path:${path}`,
    })
  }, [open])

  return { openApp, openPath }
}
