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
  linkedinLabel: 'linkedin.com/in/emir-kardovic',
  linkedinHref: 'https://www.linkedin.com/in/emir-kardovic/',
  resume: './assets/resume.pdf',
} as const

/** Rendered by System Properties as a Device Manager tree. */
export const skills: { group: string; items: string[] }[] = [
  { group: 'Languages', items: ['Java', 'SQL'] },
  { group: 'Frameworks', items: ['Spring Boot'] },
  {
    group: 'Cloud (AWS)',
    items: ['SQS', 'SNS', 'ECS', 'Lambda', 'S3', 'CloudWatch'],
  },
  { group: 'Databases', items: ['MySQL'] },
  {
    group: 'Architecture and APIs',
    items: [
      'Microservices',
      'Event-Driven Architecture',
      'System Integration',
      'REST APIs',
    ],
  },
  { group: 'Tools', items: ['Git', 'Bitbucket'] },
  { group: 'AI-assisted development', items: ['Claude Code', 'Gemini', 'Junie'] },
]

const ABOUT = `ABOUT ME
${'='.repeat(56)}

${profile.name}
${profile.role} — ${profile.location}

Backend engineer with nearly 4 years building Java services in
production for a multi-tenant restaurant back-office SaaS —
4,000+ active POS sites, ~900,000 checks a day.

I work on the unglamorous half of software: the integrations that
have to be right every single time. Point-of-sale systems that
speak sixteen different dialects of "a sale happened". Financial
data that has to reconcile. Event pipelines that cannot drop a
message at 2am on a Saturday, because Saturday at 2am is exactly
when a restaurant chain is busiest.

WHAT I FOCUS ON
${'-'.repeat(56)}

  * Third-party POS and financial-system integrations
  * Event-driven workflows on AWS (SQS, SNS)
  * Breaking monoliths into services that can be deployed and
    debugged independently
  * Production defect investigation — reading CloudWatch until
    the story makes sense

Previously at SynergySuite (2023 – 2026). Based in Podgorica,
Montenegro.
`

const EDUCATION = `EDUCATION
${'='.repeat(56)}

University of Montenegro                           2021 - 2023
M.Sc. studies, Computer Software Engineering
Coursework completed, thesis in progress
Podgorica, Montenegro

University of Montenegro                           2018 - 2021
B.Sc. in Computer Software Engineering
Podgorica, Montenegro
`

const LANGUAGES = `LANGUAGES
${'='.repeat(56)}

Montenegrin ....................................... Native
English ................................................. C1
Java ................................ Fluent, ~4 years   ;)
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

Podgorica, Montenegro             January 2023 – September 2026

* Built and owned the CBS NorthStar POS integration end to end —
  menu and inventory sync from the POS, employee records written
  back out to it, and sales ingestion covering POS reads, checks,
  sales lines and payments

* Delivered it in ~2 months using Claude to analyze NorthStar's
  API and documentation, map their DTOs to our domain model, plan
  the fetch-and-mapping flow, and draft unit and integration tests
  that confirmed the mapping, while owning the final design and
  code

* Worked across 15 further POS integrations including Toast and
  Qu, shipping features and defect fixes against vendor APIs
  differing in auth scheme, data model and delivery method

* Developed and maintained backend Java and Spring Boot services
  on AWS for a multi-tenant restaurant back-office platform —
  4,000+ active POS sites, ~900,000 checks processed a day

* Designed asynchronous, event-driven workflows on AWS SQS and
  SNS, with scheduled and batch jobs, to process high-volume POS
  data reliably

* Moved POS processing out of the monolith into a standalone
  microservice, cutting processing time by 20% and improving
  deployability and fault isolation; contributed to further
  extractions as the platform decomposed

* Shipped features and defect fixes in financial reporting: the
  POS sales and payments feeding every outlet's daily summary,
  and cashsheet generation for the ~1,000 locations with the
  setting enabled

* Investigated and fixed production defects across the
  integration pipelines, from vendor-side failures to data landing
  incorrectly in the platform, using CloudWatch logs and metrics
  and MySQL analysis of high-volume sales and payment tables

${'-'.repeat(56)}
TECHNOLOGIES
Java, Spring Boot, AWS (SQS, SNS, ECS, Lambda, S3, CloudWatch),
MySQL, Git, Bitbucket, REST APIs, Claude
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
<p class="lede">Making sixteen vendors agree on what a sale is.</p>

<h2>The problem</h2>
<p>An enterprise restaurant group does not run one point-of-sale system.
It runs whatever each acquired brand was already running. The back-office
platform has to present one coherent view of sales, inventory,
transactions, and employee data across all of them — at
<b>4,000+ active POS sites</b> processing roughly
<b>900,000 checks a day</b>.</p>

<h2>What I built</h2>
<p>I built the <b>CBS NorthStar</b> integration end to end and owned it —
about two months including testing. I used Claude to analyze NorthStar's
API and documentation, map their DTOs to our domain model, plan the
fetch-and-mapping flow, and draft the unit and integration tests that
confirmed the mapping; the final design and code were mine. Beyond that I
worked across <b>15 further POS integrations</b>, including
<b>Toast</b> and <b>Qu</b>, shipping features and defect fixes against
vendor APIs that differ in auth scheme, data model and delivery method.</p>

<h2>The part people underestimate: it goes both ways</h2>
<p>Most integration work is read-only — you pull data out of a system and
leave it alone. This is not that.</p>
<ul>
  <li><b>In from the POS:</b> menus and inventory, plus sales ingestion
  covering POS reads, checks, sales lines and payments.</li>
  <li><b>Back out to the POS:</b> employee records, written into the
  vendor's system.</li>
</ul>
<p>Writing into someone else's point-of-sale is a materially harder
problem than reading from it. A bad read shows a wrong number on a
report. A bad write corrupts the system a restaurant is actively
ringing sales on. The tolerance for error is not the same.</p>

<h2>What made it hard</h2>
<ul>
  <li><b>Nobody's data is clean.</b> Voided items, partial refunds, and
  tips applied after close all need handling that the vendor docs
  do not mention.</li>
  <li><b>Reconciliation is unforgiving.</b> Financial data either ties
  out or it does not. There is no "mostly correct" sales total.</li>
  <li><b>Vendors change things.</b> Integrations need to fail loudly and
  in one place, not quietly and in sixteen.</li>
</ul>

<p class="tech">Java &middot; Spring Boot &middot; REST APIs &middot; MySQL</p>
`

const EVENT_PIPELINE = `
<h1>Event-Driven POS Ingestion</h1>
<p class="lede">High-volume restaurant data, processed without dropping any of it.</p>

<h2>The shape of the load</h2>
<p>POS data does not arrive evenly. Across <b>4,000+ active sites</b> it
adds up to roughly <b>900,000 checks a day</b>, and it arrives in a wall
at close of business, across every location, at once. Synchronous
processing either times out or holds a connection open long enough to
become somebody else's problem.</p>

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

<p class="tech">AWS SQS &middot; SNS &middot; CloudWatch &middot; Java &middot; Spring Boot</p>
`

const MONOLITH = `
<h1>Monolith to Microservices</h1>
<p class="lede">Decomposing a back-office platform without stopping it.</p>

<h2>Why bother</h2>
<p>A monolith is fine right up until the moment a one-line change to
inventory logic requires redeploying the billing code. Then it is a
deployment bottleneck, a blast radius, and a reason nobody wants to
touch anything on a Friday.</p>

<h2>The piece I moved</h2>
<p>I took <b>POS processing</b> out of the monolith and into a standalone
microservice. It was a good first candidate: high volume, a clear domain
boundary, and the part of the system under the most load. Moving it
<b>cut processing time by 20%</b>.</p>
<p>After that I contributed to further extractions as the platform
continued to decompose — but the POS service is the one I moved.</p>

<h2>The approach</h2>
<p>Incremental extraction, not a rewrite — a rewrite is how you spend
eighteen months arriving at the same bugs. Seams were identified where
the domain already had natural boundaries, and services were carved out
along them one at a time, with the monolith still serving traffic.</p>

<h2>What improved</h2>
<ul>
  <li><b>Throughput.</b> 20% faster POS processing, on the path that
  carries the most volume.</li>
  <li><b>Deployability.</b> Services ship on their own schedule.</li>
  <li><b>Fault isolation.</b> One service degrading no longer takes the
  platform with it.</li>
  <li><b>Maintainability.</b> Smaller surfaces that one person can hold
  in their head.</li>
</ul>

<h2>Operating it</h2>
<p>Running on <b>AWS ECS</b> with <b>S3</b> alongside. When something
breaks in production, <b>CloudWatch</b> metrics and logs are where the
investigation starts.</p>

<p class="tech">Java &middot; Spring Boot &middot; AWS ECS &middot; S3 &middot; CloudWatch</p>
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
