import { useCallback, useEffect, useRef, useState } from 'react'
import { profile, skills } from '../content'
import { list, resolve, segments } from '../os/fs'
import { useOpener } from '../os/open'
import type { AppId } from '../content'

const BANNER = `Microsoft(R) Windows 95
   (C)Copyright Microsoft Corp 1981-1996.
   (C)Copyright ${profile.name} — all bugs reserved.

Type HELP for a list of commands.
`

const HELP = `Available commands:

  HELP              this list
  WHOAMI            who is running this thing
  LS [path]         list a directory
  CD <path>         change directory
  CAT <file>        print a text file
  OPEN <app>        launch a program
  SKILLS            print the tech stack
  HOBBIES           what I do when not at a keyboard
  CONTACT           email and links
  RESUME            download the resume
  DATE              current date and time
  CLS               clear the screen
  EXIT              close this window

Tab completes file and directory names.
`

const APPS: AppId[] = [
  'notepad', 'paint', 'calculator', 'terminal',
  'minesweeper', 'mediaplayer', 'browser', 'sysprops', 'displayprops',
]

type Line = { text: string; cls?: 'cmd' | 'err' }

export function Terminal() {
  const [lines, setLines] = useState<Line[]>([{ text: BANNER }])
  const [input, setInput] = useState('')
  const [cwd, setCwd] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const { openApp, openPath } = useOpener()
  const scroller = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const prompt = `C:\\${segments(cwd).join('\\')}>`

  const emit = useCallback((text: string, cls?: Line['cls']) => {
    setLines((prev) => [...prev, { text, cls }])
  }, [])

  /** Resolve a user-typed path against the current directory. */
  const toPath = useCallback((arg: string) => {
    if (!arg) return cwd
    const raw = arg.replace(/\\/g, '/')
    if (raw.startsWith('/')) return raw.slice(1)
    if (raw === '..') return segments(cwd).slice(0, -1).join('/')
    if (raw === '.') return cwd
    return cwd ? `${cwd}/${raw}` : raw
  }, [cwd])

  const run = useCallback((raw: string) => {
    const line = raw.trim()
    emit(`${prompt} ${line}`, 'cmd')
    if (!line) return

    const [cmdRaw, ...rest] = line.split(/\s+/)
    const cmd = (cmdRaw ?? '').toLowerCase()
    const arg = rest.join(' ')

    switch (cmd) {
      case 'help': case '?':
        emit(HELP); break

      case 'whoami':
        emit(`${profile.name}\n${profile.role}\n${profile.location}\n`); break

      case 'ls': case 'dir': {
        const target = toPath(arg)
        const node = resolve(target)
        if (!node) { emit(`Directory not found: ${arg}`, 'err'); break }
        if (node.kind !== 'folder') { emit(`${arg} is a file, not a directory.`, 'err'); break }
        const entries = list(target)
        if (entries.length === 0) { emit('  (empty)\n'); break }
        emit(entries
          .map(([n, child]) => `  ${child.kind === 'folder' ? '<DIR>' : '     '}  ${n}`)
          .join('\n') + '\n')
        break
      }

      case 'cd': {
        if (!arg || arg === '\\' || arg === '/') { setCwd(''); break }
        const target = toPath(arg)
        const node = resolve(target)
        if (!node || node.kind !== 'folder') {
          emit(`The system cannot find the path specified: ${arg}`, 'err')
          break
        }
        setCwd(target)
        break
      }

      case 'cat': case 'type': {
        if (!arg) { emit('Usage: CAT <file>', 'err'); break }
        const node = resolve(toPath(arg))
        if (!node) { emit(`File not found: ${arg}`, 'err'); break }
        if (node.kind === 'text') emit(node.body)
        else if (node.kind === 'page') emit(node.html.replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim() + '\n')
        else emit(`Cannot display ${arg} as text. Try OPEN.`, 'err')
        break
      }

      case 'open': case 'start': {
        const key = arg.toLowerCase().replace(/\s+/g, '') as AppId
        if (APPS.includes(key)) { openApp(key); emit(`Starting ${arg}...\n`); break }
        const target = toPath(arg)
        if (resolve(target)) { openPath(target); emit(`Opening ${arg}...\n`); break }
        emit(`Unknown program or file: ${arg || '(nothing)'}`, 'err')
        break
      }

      case 'skills':
        emit(skills.map((s) => `  ${s.group.padEnd(26)} ${s.items.join(', ')}`).join('\n') + '\n')
        break

      case 'hobbies': {
        const node = resolve('About Me/hobbies.txt')
        emit(node?.kind === 'text' ? node.body : 'Not found.', node ? undefined : 'err')
        break
      }

      case 'contact':
        emit(`  Email     ${profile.email}\n  LinkedIn  ${profile.linkedinLabel}\n  Location  ${profile.location}\n`)
        break

      case 'resume': {
        const a = document.createElement('a')
        a.href = profile.resume
        a.download = 'Emir_Kardovic_Resume.pdf'
        a.click()
        emit('Downloading resume...\n')
        break
      }

      case 'date': case 'time':
        emit(new Date().toString() + '\n'); break

      case 'cls': case 'clear':
        setLines([]); break

      case 'exit':
        emit('Close the window with the X. This is a browser, not a shell.\n'); break

      case 'sudo':
        emit(`${profile.name} is not in the sudoers file. This incident has been reported.`, 'err')
        break

      case 'rm':
        emit('Nice try.', 'err'); break

      case 'coffee':
        emit('418 I\'m a teapot\n'); break

      default:
        emit(`'${cmdRaw}' is not recognized as an internal or external command,\noperable program or batch file.`, 'err')
    }
  }, [emit, prompt, toPath, openApp, openPath])

  const complete = useCallback(() => {
    const parts = input.split(/\s+/)
    const partial = parts[parts.length - 1] ?? ''
    const names = list(cwd).map(([n]) => n)
    const hits = names.filter((n) => n.toLowerCase().startsWith(partial.toLowerCase()))
    if (hits.length === 1) {
      parts[parts.length - 1] = hits[0]!.includes(' ') ? `"${hits[0]}"` : hits[0]!
      setInput(parts.join(' '))
    } else if (hits.length > 1) {
      emit(`${prompt} ${input}`, 'cmd')
      emit('  ' + hits.join('   ') + '\n')
    }
  }, [input, cwd, emit, prompt])

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { e.stopPropagation(); setInput(''); return }

    if (e.key === 'Tab') { e.preventDefault(); complete(); return }

    if (e.key === 'Enter') {
      run(input)
      if (input.trim()) setHistory((h) => [input, ...h].slice(0, 50))
      setHistIdx(-1)
      setInput('')
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(histIdx + 1, history.length - 1)
      if (next >= 0 && history[next] !== undefined) { setHistIdx(next); setInput(history[next]!) }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = histIdx - 1
      if (next < 0) { setHistIdx(-1); setInput('') }
      else { setHistIdx(next); setInput(history[next] ?? '') }
    }
  }, [input, run, complete, history, histIdx])

  return (
    <div className="window-body flush">
      <div
        className="term"
        ref={scroller}
        onClick={() => field.current?.focus()}
        role="log"
        aria-label="Terminal output"
      >
        {lines.map((l, i) => (
          <pre key={i} className={l.cls}>{l.text}</pre>
        ))}
        <div className="term-line">
          <span>{prompt}</span>
          <input
            ref={field}
            className="term-input"
            value={input}
            data-autofocus
            spellCheck={false}
            autoComplete="off"
            aria-label="Command input"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
      </div>
    </div>
  )
}
