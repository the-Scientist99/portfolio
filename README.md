# Portfolio OS

Personal portfolio for **Emir Kardović**, presented as a 1990s desktop
operating system on a CRT monitor. It boots, lands on a desktop, and keeps
the professional content in folders next to a set of working toy programs.

Live content lives in exactly one file: [`src/content.ts`](src/content.ts).

---

## Running it

This project needs **Node 18+**. The repo pins a version in `.nvmrc`:

```bash
nvm use
```

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck, then build static files into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm test` | Run the unit tests once |
| `npm run test:watch` | Run tests in watch mode |

---

## Editing your content

**You only ever need to touch `src/content.ts`.** Everything on the desktop is
declared there: folders, documents, project write-ups, links, and the skills
list. Add a key and it appears on screen. Delete a key and it is gone.

### Add a text file

```ts
'Experience': {
  kind: 'folder',
  children: {
    'SynergySuite.txt': { kind: 'text', body: SYNERGYSUITE },
    'NewJob.txt': { kind: 'text', body: 'Your text here' },   // <- new
  },
},
```

### Add a photo

1. Drop the image in `public/assets/photos/`.
2. Point a node at it:

```ts
'me-at-work.jpg': {
  kind: 'image',
  src: './assets/photos/me-at-work.jpg',
  caption: 'Podgorica, 2025',
},
```

The two `placeholder-*.png` files in that folder are there so the gallery
renders before your real photos arrive. Delete them once you add your own,
and remove their entries from `content.ts`.

### Add a project write-up

Copy one of the `const POS_INTEGRATIONS = \`...\`` blocks near the top of
`content.ts`, change the HTML, then register it under `Projects`:

```ts
'My Side Project': {
  kind: 'page',
  icon: 'ie',
  title: 'My Side Project',
  html: MY_SIDE_PROJECT,
},
```

Project pages open in the fake Internet Explorer. There is a
`// TODO(emir):` marker in the file showing exactly where to add them.

### Update the resume

Replace `public/assets/resume.pdf`. Nothing else changes.

### Show or hide desktop icons

Edit the `desktopOrder` array at the bottom of `content.ts`. Anything you
leave out still exists — it is just not on the desktop.

### Node kinds

| `kind` | Opens in | Fields |
| --- | --- | --- |
| `folder` | Explorer | `children` |
| `text` | Text viewer | `body` |
| `image` | Image viewer | `src`, `caption?` |
| `pdf` | PDF viewer | `src` |
| `page` | Internet Explorer | `title`, `html` |
| `app` | That program | `appId` |
| `link` | A new browser tab | `href` |

---

## What is in it

**Content:** About Me, Experience, Projects, My Documents, resume.pdf,
Contact, and a Skills view rendered as the Device Manager.

**Programs:** Notepad, Paint, Calculator, MS-DOS Prompt, Minesweeper, Media
Player, Internet Explorer, Display Properties.

The MS-DOS Prompt is a real shell over the same filesystem — `help`, `ls`,
`cd`, `cat`, `open`, `skills`, `contact`, `resume`, plus tab completion and
command history.

Notepad and Paint files that visitors save persist in their own browser
(`localStorage`) and show up in My Documents. Nothing is sent anywhere.

The Media Player synthesises its chiptune with Web Audio oscillators, so
there is no audio file in the repo. It never autoplays.

---

## Architecture

```
src/
  content.ts          <- the only file you edit
  App.tsx             boot gate -> desktop
  os/
    windowStore.tsx   all window state (one useReducer)
    Window.tsx        chrome, drag, resize, min/max/close
    fs.ts             virtual filesystem: content.ts + saved user files
    open.ts           maps a filesystem node to the app that opens it
    registry.tsx      appId -> component
    storage.ts        guarded, versioned localStorage
    Desktop.tsx  Taskbar.tsx  StartMenu.tsx  BootScreen.tsx  CrtOverlay.tsx
  apps/               one file per program
  styles/             global, crt, desktop, apps
```

Two rules keep it navigable: nothing in `apps/` imports from another app, and
the desktop, Explorer, and Terminal all read the same tree from `fs.ts`.

Dependencies: React, and [`98.css`](https://jdan.github.io/98.css/) for the
window chrome. Drag, resize, painting, audio, and the CRT effect are all
hand-written — no drag library, no canvas library, no CSS framework.

---

## Accessibility

The CRT effect is decoration and can be switched off — the toggle is in the
system tray and in Display Properties, and the choice is remembered.
`prefers-reduced-motion` disables the flicker and the boot animation
automatically. Every control is a real focusable element with a visible focus
ring, windows close with `Escape`, and Minesweeper cells can be flagged with
`F` for anyone without a right mouse button.

---

## Deploying

The build is static. `npm run build` produces `dist/`, and `base` is set to
`'./'` in `vite.config.ts`, so it works from any path — Vercel, Netlify,
GitHub Pages, or an S3 bucket — with no further configuration.

**Vercel / Netlify:** point at the repo. Build command `npm run build`, output
directory `dist`.

**GitHub Pages:** push `dist/` to a `gh-pages` branch, or use the
`actions/deploy-pages` workflow.
