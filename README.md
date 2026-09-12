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

Minesweeper flags a cell three ways, so every input has one: right-click,
the `F` key, or a long press on touch. Cells grow to 28px where the primary
pointer is coarse, because a 400ms hold on an 18px target is a coin flip.

**Shell:** a Start menu with Shut Down, a taskbar volume mixer, and a
right-click menu on the desktop.

The MS-DOS Prompt is a real shell over the same filesystem — `help`, `ls`,
`cd`, `cat`, `open`, `skills`, `contact`, `resume`, plus tab completion and
command history.

Notepad and Paint files that visitors save persist in their own browser
(`localStorage`) and show up in My Documents. Nothing is sent anywhere.

All sound — the Media Player's chiptune, the startup chime, the error ding —
is synthesised with Web Audio oscillators, so there is no audio file in the
repo. One shared audio graph runs through the taskbar volume control, which
remembers its level and mute state. Nothing autoplays: the chime waits for
your first click, because browsers block audio before a user gesture.

To ship silent instead, change the `muted` default in
[`src/os/settings.tsx`](src/os/settings.tsx) to `true`.

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

## How this site is findable

The content lives inside a simulated desktop, so a crawler that does not open
windows would see eight icon labels and nothing else. Two things fix that, and
both are generated from `src/content.ts` so they cannot drift from what the
site actually says:

- **Static content in the shipped HTML.** [`scripts/seo.ts`](scripts/seo.ts)
  turns the filesystem tree into real markup, and a small Vite plugin injects
  it into `#root`. React clears that container when it mounts, so visitors
  with JavaScript never see it — and visitors without it get a readable page
  instead of a blank one. It is not hidden text: it is the same content,
  genuinely present in the document.
- **`Person` structured data** (JSON-LD) in the head, so a search engine can
  tell the page is about a specific human rather than guessing.

To see what a crawler sees:

```bash
npm run build && node -e "const h=require('fs').readFileSync('dist/index.html','utf8');console.log(h.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '))"
```

`public/robots.txt` and `public/sitemap.xml` carry the site URL. **If the
domain changes, update it there, in the `canonical` link, and in the `og:`
tags in `index.html`** — those are all absolute by necessity.

Traffic is measured with Vercel Web Analytics (`<Analytics />` in
[`src/App.tsx`](src/App.tsx)). It is cookieless, so there is no consent banner,
and it only reports in production — in development it logs to the console
instead.

## Regenerating the social preview image

`public/og.png` is what LinkedIn and Slack show when the link is shared. It is
a real 1200x630 screenshot of the running app, not a mock-up. To refresh it
after a visual change, run the dev server and capture it with headless Chrome:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --virtual-time-budget=12000 --screenshot=public/og.png --window-size=1200,630 http://localhost:5173/
```

That lands on the boot screen. To capture the desktop with windows open, the
repo history has a throwaway `public/__og.html` that seeds `sessionStorage`,
loads the app in a same-origin iframe, and clicks a few icons before the
screenshot. Delete it again afterwards — it is not part of the site.

**The `og:image` URL in `index.html` is absolute.** If the site moves to a new
domain, update it there or the preview breaks.

## Deploying

The build is static. `npm run build` produces `dist/`, and `base` is set to
`'./'` in `vite.config.ts`, so it works from any path — Vercel, Netlify,
GitHub Pages, or an S3 bucket — with no further configuration.

**Vercel / Netlify:** point at the repo. Build command `npm run build`, output
directory `dist`.

**GitHub Pages:** push `dist/` to a `gh-pages` branch, or use the
`actions/deploy-pages` workflow.
