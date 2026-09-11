import { beforeEach, describe, expect, it } from 'vitest'
import { basename, list, parentOf, resolve, segments, tree, USER_DIR, userFiles, writeUserFile, deleteUserFile } from '../os/fs'
import { __resetForTests } from '../os/storage'

beforeEach(() => {
  localStorage.clear()
  __resetForTests()
})

describe('path handling', () => {
  it('splits paths and tolerates stray slashes', () => {
    expect(segments('About Me/Photos')).toEqual(['About Me', 'Photos'])
    expect(segments('/About Me//Photos/')).toEqual(['About Me', 'Photos'])
    expect(segments('')).toEqual([])
  })

  it('reports the parent and the basename', () => {
    expect(parentOf('About Me/Photos')).toBe('About Me')
    expect(parentOf('About Me')).toBe('')
    expect(basename('About Me/readme.txt')).toBe('readme.txt')
    expect(basename('')).toBe('Desktop')
  })
})

describe('resolve', () => {
  it('finds a top-level folder', () => {
    expect(resolve('About Me')?.kind).toBe('folder')
  })

  it('finds a nested file', () => {
    const node = resolve('Experience/SynergySuite.txt')
    expect(node?.kind).toBe('text')
    expect(node?.kind === 'text' && node.body).toContain('SYNERGYSUITE')
  })

  it('returns the root for an empty path', () => {
    const root = resolve('')
    expect(root?.kind).toBe('folder')
    expect(root?.kind === 'folder' && Object.keys(root.children).length).toBeGreaterThan(0)
  })

  it('returns null for a missing segment', () => {
    expect(resolve('About Me/nope.txt')).toBeNull()
    expect(resolve('Nowhere/at/all')).toBeNull()
  })

  it('returns null when descending into a file', () => {
    expect(resolve('Experience/SynergySuite.txt/deeper')).toBeNull()
  })
})

describe('list', () => {
  it('lists a folder', () => {
    const names = list('About Me').map(([n]) => n)
    expect(names).toContain('readme.txt')
    expect(names).toContain('Photos')
  })

  it('returns empty for a file or a missing path', () => {
    expect(list('Experience/SynergySuite.txt')).toEqual([])
    expect(list('does/not/exist')).toEqual([])
  })
})

describe('user files', () => {
  it('starts empty and merges saved files into My Documents', () => {
    expect(userFiles()).toEqual([])
    expect(list(USER_DIR)).toEqual([])

    writeUserFile({ type: 'text', name: 'note.txt', body: 'hello', saved: 1 })
    expect(list(USER_DIR).map(([n]) => n)).toEqual(['note.txt'])

    const node = resolve(`${USER_DIR}/note.txt`)
    expect(node?.kind === 'text' && node.body).toBe('hello')
  })

  it('overwrites a file of the same name rather than duplicating it', () => {
    writeUserFile({ type: 'text', name: 'note.txt', body: 'first', saved: 1 })
    writeUserFile({ type: 'text', name: 'note.txt', body: 'second', saved: 2 })
    expect(userFiles()).toHaveLength(1)
    const node = resolve(`${USER_DIR}/note.txt`)
    expect(node?.kind === 'text' && node.body).toBe('second')
  })

  it('stores images as image nodes', () => {
    writeUserFile({
      type: 'image', name: 'art.png', dataUrl: 'data:image/png;base64,AA', saved: 1,
    })
    const node = resolve(`${USER_DIR}/art.png`)
    expect(node?.kind).toBe('image')
    expect(node?.kind === 'image' && node.src).toBe('data:image/png;base64,AA')
  })

  it('deletes a file', () => {
    writeUserFile({ type: 'text', name: 'note.txt', body: 'x', saved: 1 })
    deleteUserFile('note.txt')
    expect(list(USER_DIR)).toEqual([])
  })

  it('never lets user files shadow authored content', () => {
    writeUserFile({ type: 'text', name: 'readme.txt', body: 'mine', saved: 1 })
    const authored = resolve('About Me/readme.txt')
    expect(authored?.kind === 'text' && authored.body).toContain('ABOUT ME')
    expect(USER_DIR in tree()).toBe(true)
  })
})
