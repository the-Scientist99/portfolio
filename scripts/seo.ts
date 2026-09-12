/**
 * Turns `src/content.ts` into the static HTML and structured data that ships
 * inside index.html.
 *
 * Why this exists: the site renders its content into a simulated desktop, so
 * a crawler that does not open windows sees eight icon labels and nothing
 * else. This emits the same content as real markup in the delivered document.
 *
 * It is generated rather than hand-written because `content.ts` is the file
 * Emir edits. A hand-maintained copy would drift within two commits and
 * nobody would notice.
 */

import { filesystem, profile, skills } from '../src/content'
import type { Node } from '../src/content'

const SITE = 'https://emir-kardovic.vercel.app'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Names that title-casing would otherwise flatten ("SYNERGYSUITE" becomes
 * "Synergysuite"). Add to this if a heading ever reads wrong.
 */
const PROPER_NOUNS = [
  'SynergySuite', 'CBS NorthStar', 'CloudWatch', 'MySQL', 'AWS', 'SQS', 'SNS',
  'ECS', 'EC2', 'POS', 'REST', 'APIs', 'API', 'SaaS', 'SQL',
]

/** ALL-CAPS shouts on a normal web page; title case reads as a heading. */
function titleCase(s: string): string {
  let out = s
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())
    .replace(/\bI\b/gi, 'I')
  for (const name of PROPER_NOUNS) {
    out = out.replace(new RegExp(`\\b${name}\\b`, 'gi'), name)
  }
  return out
}

/**
 * The .txt bodies are formatted for a 1990s text viewer: ALL-CAPS headings,
 * rules made of = or -, and dot leaders lining values up in a monospace
 * column. Convert that to semantic HTML rather than dumping it in a <pre>,
 * so the markup says what the content means.
 *
 * `sectionName` suppresses a leading heading that merely repeats the folder
 * it sits in, which would otherwise read as a duplicate.
 */
function textToHtml(body: string, sectionName = ''): string {
  const lines = body.split('\n')
  const out: string[] = []
  let paragraph: string[] = []
  let list: string[] = []

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${escapeHtml(paragraph.join(' ').trim())}</p>`)
      paragraph = []
    }
  }
  const flushList = () => {
    if (list.length) {
      out.push(`<ul>${list.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`)
      list = []
    }
  }
  const flush = () => { flushParagraph(); flushList() }

  for (const raw of lines) {
    const line = raw.trimEnd()

    // A rule of = or - is decoration; the heading is the line above it.
    if (/^[=-]{3,}$/.test(line.trim())) continue

    if (line.trim() === '') { flush(); continue }

    // Dot leaders: `Montenegrin ......... Native` is a monospace-column
    // trick that turns to mush once the font is proportional.
    const leader = line.match(/^(.{2,}?)\s*\.{3,}\s*(.+?)$/)
    if (leader) {
      flushParagraph()
      list.push(`${leader[1]!.trim()} — ${leader[2]!.trim()}`)
      continue
    }

    // Bullets, written as `* text` or `• text`.
    const bullet = line.match(/^\s*[*•]\s+(.*)$/)
    if (bullet) {
      flushParagraph()
      list.push(bullet[1]!.trim())
      continue
    }
    // Continuation of the previous bullet, indented under it.
    if (list.length && /^\s{2,}\S/.test(line)) {
      list[list.length - 1] += ' ' + line.trim()
      continue
    }

    // An ALL-CAPS line with no lowercase is a heading.
    const t = line.trim()
    if (t.length > 2 && t === t.toUpperCase() && /[A-Z]/.test(t) && !/[a-z]/.test(t)) {
      flush()
      const heading = titleCase(t)
      // Skip a heading that just repeats the section it is already inside.
      if (heading.toLowerCase() !== sectionName.toLowerCase()) {
        out.push(`<h3>${escapeHtml(heading)}</h3>`)
      }
      continue
    }

    flushList()
    paragraph.push(t)
  }

  flush()
  return out.join('\n')
}

/** Walk the authored tree, emitting every piece of readable content. */
function renderNode(name: string, node: Node, sectionName = ''): string {
  switch (node.kind) {
    case 'folder':
      return [
        `<section><h2>${escapeHtml(name)}</h2>`,
        ...Object.entries(node.children).map(([n, c]) => renderNode(n, c, name)),
        '</section>',
      ].join('\n')

    case 'text':
      return textToHtml(node.body, sectionName)

    // Project write-ups are already authored as semantic HTML in content.ts.
    case 'page':
      return `<article>${node.html}</article>`

    case 'image':
      return node.caption
        ? `<figure><img src="${escapeHtml(node.src)}" alt="${escapeHtml(node.caption)}" width="320" loading="lazy"><figcaption>${escapeHtml(node.caption)}</figcaption></figure>`
        : ''

    // Apps, links and the PDF carry no prose worth indexing.
    default:
      return ''
  }
}

export function renderSeoHtml(): string {
  const sections = ['About Me', 'Experience', 'Projects']
    .map((key) => {
      const node = filesystem[key]
      return node ? renderNode(key, node) : ''
    })
    .filter(Boolean)
    .join('\n')

  const skillList = skills
    .map(
      (g) =>
        `<li><strong>${escapeHtml(g.group)}:</strong> ${escapeHtml(g.items.join(', '))}</li>`,
    )
    .join('')

  // Replaced by React on mount; the only thing visitors without JavaScript see.
  return `
<article class="seo-fallback">
  <header>
    <h1>${escapeHtml(profile.name)}</h1>
    <p><strong>${escapeHtml(profile.role)}</strong> — ${escapeHtml(profile.location)}</p>
    <p>
      <a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a> ·
      <a href="${escapeHtml(profile.linkedinHref)}" rel="me noreferrer">LinkedIn</a> ·
      <a href="${escapeHtml(profile.resume)}" download>Download resume (PDF)</a>
    </p>
    <p><em>This page is an interactive desktop. If you are seeing this plain
    version, JavaScript has not loaded — everything below is the same content.</em></p>
  </header>
  ${sections}
  <section>
    <h2>Skills</h2>
    <ul>${skillList}</ul>
  </section>
</article>`.trim()
}

export function renderJsonLd(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    email: `mailto:${profile.email}`,
    url: `${SITE}/`,
    image: `${SITE}/assets/photos/portrait.jpg`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Podgorica',
      addressCountry: 'ME',
    },
    worksFor: { '@type': 'Organization', name: 'SynergySuite' },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'University of Montenegro',
    },
    knowsAbout: skills.flatMap((g) => g.items),
    knowsLanguage: ['Montenegrin', 'English'],
    sameAs: [profile.linkedinHref],
  }
  return JSON.stringify(schema, null, 2)
}
