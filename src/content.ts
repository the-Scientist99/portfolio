/**
 * ═══════════════════════════════════════════════════════════════════════
 *  THE ONLY FILE YOU NEED TO EDIT.
 *
 *  Everything on the desktop — folders, documents, projects, links — is
 *  declared below. Add a key, it appears. Delete a key, it is gone.
 *  Nothing else in the codebase needs to change.
 *
 *  Drop images in  public/assets/photos/  and reference them as
 *  './assets/photos/your-file.jpg'.
 * ═══════════════════════════════════════════════════════════════════════
 */

export type AppId =
  | 'explorer' | 'text' | 'image' | 'pdf' | 'browser'
  | 'notepad' | 'paint' | 'calculator' | 'terminal'
  | 'minesweeper' | 'mediaplayer'
  | 'sysprops' | 'displayprops' | 'recyclebin'

export type IconName =
  | 'folder' | 'folderOpen' | 'textFile' | 'pdf' | 'image' | 'computer'
  | 'notepad' | 'paint' | 'calculator' | 'terminal' | 'mine' | 'media'
  | 'ie' | 'mail' | 'link' | 'recycle' | 'settings' | 'info'
  | 'speaker' | 'speakerMuted' | 'shutdown' | 'refresh'

export type Node =
  | { kind: 'folder'; icon?: IconName; children: Record<string, Node> }
  | { kind: 'text'; icon?: IconName; body: string }
  | { kind: 'image'; icon?: IconName; src: string; caption?: string }
  | { kind: 'pdf'; icon?: IconName; src: string }
  | { kind: 'page'; icon?: IconName; title: string; html: string }
  | { kind: 'app'; icon?: IconName; appId: AppId }
  | { kind: 'link'; icon?: IconName; href: string }

export const profile = {
  name: 'Emir Kardović',
  role: 'Backend Software Engineer',
  location: 'Podgorica, Montenegro',
  email: 'emirbest1999@gmail.com',
  // The handle contains 'ć'; the href must be percent-encoded.
  linkedinLabel: 'linkedin.com/in/emir-kardović-15143a1b0',
  linkedinHref: 'https://www.linkedin.com/in/emir-kardovi%C4%87-15143a1b0',
  resume: './assets/resume.pdf',
} as const

/** Rendered by System Properties as a Device Manager tree. */
export const skills: { group: string; items: string[] }[] = [
  { group: 'Languages', items: ['Java', 'SQL'] },
  { group: 'Frameworks', items: ['Spring Boot'] },
  {
    group: 'Cloud (AWS)',
    items: ['SQS', 'SNS', 'S3', 'EC2', 'ECS', 'Lambda', 'CloudWatch'],
  },
  { group: 'Databases', items: ['MySQL'] },
  {
    group: 'Architecture and APIs',
    items: ['Microservices', 'Event-driven design', 'REST APIs'],
  },
  { group: 'Tools', items: ['Git', 'Bitbucket', 'Docker'] },
  { group: 'AI-assisted development', items: ['Claude Code', 'Gemini', 'Junie'] },
]

const ABOUT = `ABOUT ME
${'='.repeat(56)}

${profile.name}
${profile.role} — ${profile.location}

Backend software engineer with 3+ years building and scaling Java
services for a restaurant back-office SaaS platform.

I work on the unglamorous half of software: the integrations that have
to be right every single time. Point-of-sale systems that speak seven
different dialects of "a sale happened". Financial data that has to
reconcile. Event pipelines that cannot drop a message at 2am on a
Saturday, because Saturday at 2am is exactly when a restaurant chain
is busiest.

WHAT I FOCUS ON
${'-'.repeat(56)}

  * Third-party POS and financial-system integrations
  * Event-driven workflows on AWS (SQS, SNS, Lambda)
  * Breaking monoliths into services that can be deployed and
    debugged independently
  * Production incident diagnosis — reading CloudWatch until the
    story makes sense

Currently at SynergySuite. Based in Podgorica, Montenegro.
`

const EDUCATION = `EDUCATION
${'='.repeat(56)}

University of Montenegro                                     2021
B.Sc. in Computer Software Engineering
Podgorica, Montenegro
`

const LANGUAGES = `LANGUAGES
${'='.repeat(56)}

Montenegrin ....................................... Native
English ........................... Professional working
Java ................................ Fluent, 3+ years   ;)
`


const HOBBIES = `HOBBIES
${'='.repeat(56)}

HIKING
${'-'.repeat(56)}
Mostly the Montenegrin mountains — Prokletije, Komovi, Durmitor.
Snow-line treks in spring, long ridge days in summer. It is the
one activity where the feedback loop is completely honest: you
either get to the top or you turn around, and the mountain does
not care how you felt about the plan.

Also the only reliable way I have found to stop thinking about
a bug. Something about five hours of walking uphill clears the
stack.

BASKETBALL
${'-'.repeat(56)}
Pickup games, mostly. I like that it is a sport where the
individually best player does not automatically win — spacing
and passing beat raw talent more often than people expect.

Reasonable analogy for a codebase, if you want one.

VIDEO GAMES
${'-'.repeat(56)}
Strategy and RPGs, the kind with systems deep enough to be worth
poking at. I have a weakness for games that let you break them
in ways the designers clearly did not intend — which is, more or
less, the same instinct that makes integration work interesting.
`

const SYNERGYSUITE = `SOFTWARE ENGINEER — SYNERGYSUITE
${'='.repeat(56)}

Podgorica, Montenegro                  January 2023 – Present

* Built integrations with third-party point-of-sale (POS) and
  financial systems including CBS NorthStar, Toast, and Qu to
  synchronize sales, inventory, transaction, and employee-management
  data for enterprise restaurant clients

* Developed and maintained backend Java and Spring Boot services
  powering a restaurant back-office platform that unifies POS and
  financial-operations data

* Designed asynchronous, event-driven workflows using AWS SQS and
  SNS, along with scheduled and batch jobs, to process high-volume
  POS data reliably

* Migrated legacy monolithic code to a microservice architecture,
  improving deployability, fault isolation, and maintainability of
  core services

* Diagnosed and resolved production incidents across AWS-hosted
  services, using CloudWatch metrics and logs to identify root
  causes and restore service

* Deployed and operated containerized services with Docker on
  AWS ECS, Lambda, and S3

${'-'.repeat(56)}
TECHNOLOGIES
Java, Spring Boot, AWS (SQS, SNS, S3, EC2, ECS, Lambda,
CloudWatch), MySQL, Docker, Git, Bitbucket, REST APIs
`

const CONTACT = `CONTACT
${'='.repeat(56)}

Email      ${profile.email}
LinkedIn   ${profile.linkedinLabel}
Location   ${profile.location}

Open to backend and platform engineering conversations.
Fastest way to reach me is email.
`

/* ── Project write-ups. These open in Internet Explorer. ──────────────── */

const POS_INTEGRATIONS = `
<h1>POS &amp; Financial System Integrations</h1>
<p class="lede">Making seven vendors agree on what a sale is.</p>

<h2>The problem</h2>
<p>An enterprise restaurant group does not run one point-of-sale system.
It runs whatever each acquired brand was already running. The back-office
platform has to present one coherent view of sales, inventory,
transactions, and employee data across all of them.</p>

<h2>What I built</h2>
<p>Integrations against <b>CBS NorthStar</b>, <b>Toast</b>, and <b>Qu</b>,
each with its own API shape, auth model, pagination behaviour, and
opinion about time zones. Every integration normalizes into the
platform's internal domain model, so everything downstream — reporting,
inventory reconciliation, labour cost — stays vendor-agnostic.</p>

<h2>What made it hard</h2>
<ul>
  <li><b>Nobody's data is clean.</b> Voided items, partial refunds, and
  tips applied after close all need handling that the vendor docs
  do not mention.</li>
  <li><b>Reconciliation is unforgiving.</b> Financial data either ties
  out or it does not. There is no "mostly correct" sales total.</li>
  <li><b>Vendors change things.</b> Integrations need to fail loudly and
  in one place, not quietly and in forty.</li>
</ul>

<p class="tech">Java &middot; Spring Boot &middot; REST APIs &middot; MySQL</p>
`

const EVENT_PIPELINE = `
<h1>Event-Driven POS Ingestion</h1>
<p class="lede">High-volume restaurant data, processed without dropping any of it.</p>

<h2>The shape of the load</h2>
<p>POS data does not arrive evenly. It arrives in a wall at close of
business, across every location, at once. Synchronous processing either
times out or holds a connection open long enough to become somebody
else's problem.</p>

<h2>The design</h2>
<p>Asynchronous, event-driven workflows built on <b>AWS SQS</b> and
<b>SNS</b>. Ingestion accepts and acknowledges; processing happens off
a queue where it can be retried, throttled, and observed independently.
Scheduled and batch jobs handle the periodic pulls that vendors expose
no webhook for.</p>

<h2>Properties that mattered</h2>
<ul>
  <li><b>Backpressure is free.</b> A slow consumer grows a queue instead
  of dropping messages.</li>
  <li><b>Retries are boring.</b> Transient vendor failures resolve
  themselves without a human.</li>
  <li><b>Fan-out is cheap.</b> SNS means a new consumer of sales events
  costs a subscription, not a refactor.</li>
</ul>

<p class="tech">AWS SQS &middot; SNS &middot; Lambda &middot; CloudWatch &middot; Java &middot; Spring Boot</p>
`

const MONOLITH = `
<h1>Monolith to Microservices</h1>
<p class="lede">Decomposing a back-office platform without stopping it.</p>

<h2>Why bother</h2>
<p>A monolith is fine right up until the moment a one-line change to
inventory logic requires redeploying the billing code. Then it is a
deployment bottleneck, a blast radius, and a reason nobody wants to
touch anything on a Friday.</p>

<h2>The approach</h2>
<p>Incremental extraction of core services out of legacy monolithic
code. Not a rewrite — a rewrite is how you spend eighteen months
arriving at the same bugs. Seams were identified where the domain
already had natural boundaries, and services were carved out along
them one at a time, with the monolith still serving traffic.</p>

<h2>What improved</h2>
<ul>
  <li><b>Deployability.</b> Services ship on their own schedule.</li>
  <li><b>Fault isolation.</b> One service degrading no longer takes the
  platform with it.</li>
  <li><b>Maintainability.</b> Smaller surfaces that one person can hold
  in their head.</li>
</ul>

<h2>Operating it</h2>
<p>Containerized with <b>Docker</b>, running on <b>AWS ECS</b> with
<b>Lambda</b> and <b>S3</b> alongside. When something breaks in
production, <b>CloudWatch</b> metrics and logs are where the
investigation starts.</p>

<p class="tech">Java &middot; Spring Boot &middot; Docker &middot; AWS ECS &middot; Lambda &middot; S3 &middot; CloudWatch</p>
`

// TODO(emir): add side projects here. Copy one of the blocks above,
// change the text, and add an entry to Projects/children below.

/* ── The filesystem. What you see on the desktop. ─────────────────────── */

export const filesystem: Record<string, Node> = {
  'My Computer': { kind: 'app', appId: 'sysprops', icon: 'computer' },

  'About Me': {
    kind: 'folder',
    icon: 'folder',
    children: {
      'readme.txt': { kind: 'text', body: ABOUT },
      'education.txt': { kind: 'text', body: EDUCATION },
      'languages.txt': { kind: 'text', body: LANGUAGES },
      'hobbies.txt': { kind: 'text', body: HOBBIES },
      'Photos': {
        kind: 'folder',
        children: {
          'portrait.jpg': {
            kind: 'image',
            src: './assets/photos/portrait.jpg',
            caption: `${profile.name} — ${profile.role}`,
          },
          'prokletije-ridge.jpg': {
            kind: 'image',
            src: './assets/photos/prokletije-ridge.jpg',
            caption: 'Prokletije, looking across the range',
          },
          'plav-from-above.jpg': {
            kind: 'image',
            src: './assets/photos/plav-from-above.jpg',
            caption: 'Lake Plav from the ridge above it',
          },
          'summit-flag.jpg': {
            kind: 'image',
            src: './assets/photos/summit-flag.jpg',
            caption: 'Montenegrin flag at the top',
          },
          'peak-in-cloud.jpg': {
            kind: 'image',
            src: './assets/photos/peak-in-cloud.jpg',
            caption: 'A peak taking its own weather personally',
          },
          'meadow-trail.jpg': {
            kind: 'image',
            src: './assets/photos/meadow-trail.jpg',
            caption: 'Summer approach, single file through the meadow',
          },
          'winter-treeline.jpg': {
            kind: 'image',
            src: './assets/photos/winter-treeline.jpg',
            caption: 'Spring snow still sitting in the treeline',
          },
          'frozen-lake.jpg': {
            kind: 'image',
            src: './assets/photos/frozen-lake.jpg',
            caption: 'Break on a lake that had not thawed yet',
          },
          'river-canyon.jpg': {
            kind: 'image',
            src: './assets/photos/river-canyon.jpg',
            caption: 'Canyon river, somewhere below the trail',
          },
          'road-to-the-trailhead.jpg': {
            kind: 'image',
            src: './assets/photos/road-to-the-trailhead.jpg',
            caption: 'The drive out, which is half the trip',
          },
        },
      },
    },
  },

  'Experience': {
    kind: 'folder',
    icon: 'folder',
    children: {
      'SynergySuite.txt': { kind: 'text', body: SYNERGYSUITE },
    },
  },

  'Projects': {
    kind: 'folder',
    icon: 'folder',
    children: {
      'POS Integrations': {
        kind: 'page',
        icon: 'ie',
        title: 'POS & Financial System Integrations',
        html: POS_INTEGRATIONS,
      },
      'Event Pipeline': {
        kind: 'page',
        icon: 'ie',
        title: 'Event-Driven POS Ingestion',
        html: EVENT_PIPELINE,
      },
      'Monolith to Microservices': {
        kind: 'page',
        icon: 'ie',
        title: 'Monolith to Microservices',
        html: MONOLITH,
      },
    },
  },

  'resume.pdf': { kind: 'pdf', icon: 'pdf', src: profile.resume },
  'Contact.txt': { kind: 'text', icon: 'mail', body: CONTACT },
  'Recycle Bin': { kind: 'app', appId: 'recyclebin', icon: 'recycle' },
}

/** Desktop icon order. Anything omitted still exists, just not on the desktop. */
export const desktopOrder = [
  'My Computer',
  'About Me',
  'Experience',
  'Projects',
  // Not declared in `filesystem` above: fs.ts injects it, holding whatever
  // the visitor saved from Notepad and Paint.
  'My Documents',
  'resume.pdf',
  'Contact.txt',
  'Recycle Bin',
]
