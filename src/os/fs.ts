import { filesystem } from '../content'
import type { IconName, Node } from '../content'
import { load, save } from './storage'

export const USER_DIR = 'My Documents'

export type UserFile =
  | { type: 'text'; name: string; body: string; saved: number }
  | { type: 'image'; name: string; dataUrl: string; saved: number }

/** Documents the visitor created in Notepad or Paint, newest first. */
export function userFiles(): UserFile[] {
  const files = load<UserFile[]>('userFiles', [])
  return Array.isArray(files) ? files : []
}

export function writeUserFile(file: UserFile): void {
  const existing = userFiles().filter((f) => f.name !== file.name)
  save('userFiles', [file, ...existing])
}

export function deleteUserFile(name: string): void {
  save('userFiles', userFiles().filter((f) => f.name !== name))
}

function userNode(f: UserFile): Node {
  return f.type === 'text'
    ? { kind: 'text', body: f.body, icon: 'textFile' }
    : { kind: 'image', src: f.dataUrl, caption: f.name, icon: 'image' }
}

/**
 * The tree as apps see it: authored content plus whatever the visitor saved.
 * Rebuilt on demand rather than cached — it is a few dozen keys, and a stale
 * cache after a save is a worse problem than the work of rebuilding.
 */
export function tree(): Record<string, Node> {
  const files = userFiles()
  const children: Record<string, Node> = {}
  for (const f of files) children[f.name] = userNode(f)

  return {
    ...filesystem,
    [USER_DIR]: { kind: 'folder', icon: 'folder', children },
  }
}

/** Split a '/'-joined path, tolerating leading, trailing and doubled slashes. */
export function segments(path: string): string[] {
  return path.split('/').filter((s) => s.length > 0)
}

/** Resolve a path to a node, or null when any segment is missing. */
export function resolve(path: string, root: Record<string, Node> = tree()): Node | null {
  const parts = segments(path)
  if (parts.length === 0) return { kind: 'folder', children: root }

  let current: Node | undefined = root[parts[0]!]
  for (let i = 1; i < parts.length; i++) {
    if (!current || current.kind !== 'folder') return null
    current = current.children[parts[i]!]
  }
  return current ?? null
}

/** Entries of a folder path. Empty for a missing path or a non-folder. */
export function list(path: string, root: Record<string, Node> = tree()): [string, Node][] {
  const node = resolve(path, root)
  if (!node || node.kind !== 'folder') return []
  return Object.entries(node.children)
}

export function parentOf(path: string): string {
  const parts = segments(path)
  return parts.slice(0, -1).join('/')
}

export function basename(path: string): string {
  const parts = segments(path)
  return parts[parts.length - 1] ?? 'Desktop'
}

const DEFAULT_ICON: Record<Node['kind'], IconName> = {
  folder: 'folder',
  text: 'textFile',
  image: 'image',
  pdf: 'pdf',
  page: 'ie',
  app: 'computer',
  link: 'link',
}

export function iconFor(node: Node): IconName {
  return node.icon ?? DEFAULT_ICON[node.kind]
}
