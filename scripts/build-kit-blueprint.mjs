import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

// Build the target information-architecture blueprint for the Transportly UI Kit 2.0 file.
//
// Reads the pulled library state (data/components.json) and projects it onto a functional-category
// page structure (see CATEGORY MAP below). Emits:
//   - data/kit-blueprint.json                                  machine-readable target tree (drives the Figma reorg)
//   - docs/design-system/proposals/ui-kit-structure-blueprint.md   human-readable tree + flags
//   - data/description-backlog.json                            sets missing a Figma description (backfill worklist)
//
// Pure read of data/*.json — no Figma calls, zero model tokens. The CATEGORY MAP is the single source
// of truth for both this report and the execution wave (plan §3). Org-only: pages may be re-ordered or
// re-prefixed, component SETS are never renamed.

const DATA_DIR = 'data'
const COMPONENTS = `${DATA_DIR}/components.json`
const BLUEPRINT_JSON = `${DATA_DIR}/kit-blueprint.json`
const BACKLOG_JSON = `${DATA_DIR}/description-backlog.json`
const PROPOSAL_MD = 'docs/design-system/proposals/ui-kit-structure-blueprint.md'

// Recognized page-name prefixes. A page that starts with none of these is flagged for an emoji fix.
const PREFIXES = ['⚛️', '📦', '🧩', '✉️', '🏠', '🧭', '🎨']

// ──────────────────────────────────────────────────────────────────────────────
// CATEGORY MAP — the target structure. Order here IS the target page order.
// A page entry is either a string (current name == target name) or
// { current, target, renameReason } when an org-only page rename is needed.
// `new: true` marks a meta/foundations page that does not exist yet and must be created.
// ──────────────────────────────────────────────────────────────────────────────
const STRUCTURE = [
  {
    divider: null, // meta pages sit above the first divider
    pages: [
      { target: '🏠 Cover', new: true },
      { target: '🧭 Index & Changelog', new: true },
    ],
  },
  { divider: '──  FOUNDATIONS  ──', pages: [{ target: '🎨 Foundations', new: true }] },
  { divider: '──  ACTIONS  ──', pages: ['⚛️ Button'] },
  {
    divider: '──  FORMS & INPUTS  ──',
    pages: [
      '⚛️ Input & Form Control',
      '⚛️ Checkbox, Radio, Switch (Toggle)',
      '⚛️ Dropdown',
      '⚛️ Fileupload',
      '⚛️ Attachment',
      '⚛️ Option Cards',
    ],
  },
  {
    divider: '──  DATA DISPLAY  ──',
    pages: [
      '⚛️ Table',
      '⚛️ Badge',
      '⚛️ Price',
      '⚛️ Status',
      '⚛️ Progress Bar',
      '⚛️ Item',
      '⚛️ Separator',
      '⚛️ Section Title',
      '⚛️ No Data Placeholder',
    ],
  },
  { divider: '──  FEEDBACK  ──', pages: ['⚛️ Notification (Alert)'] },
  {
    divider: '──  OVERLAYS & SURFACES  ──',
    pages: ['⚛️ Dialog', '⚛️ Alert Dialog', '⚛️ Popover', '⚛️ Tooltip'],
  },
  {
    divider: '──  NAVIGATION  ──',
    pages: [
      '⚛️ Tabs',
      '⚛️ Step Progress Tabs',
      '⚛️ Stepper', // emoji-prefix fix already applied in the live file
      '⚛️ Breadcrumbs',
      '⚛️ Pagination',
    ],
  },
  {
    divider: '──  LAYOUT & STRUCTURE  ──',
    pages: ['📦 Page', '📦 Page Header', '📦 Page Footer', '📦 Content Box', '📦 Content Header', '📦 Form Header'],
  },
  {
    divider: '──  DOMAIN (LOGISTICS)  ──',
    pages: ['⚛️ Route Entry', '⚛️ Carrier Selection', '⚛️ Location Pointer'],
  },
  { divider: '──  ASSETS  ──', pages: ['🧩 Assets', '✉️ E-mail templates'] },
]

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback
  return JSON.parse(readFileSync(path, 'utf8'))
}

function writeOut(path, content) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
}

function normalizePage(entry) {
  if (typeof entry === 'string') return { current: entry, target: entry, new: false }
  return { current: entry.current ?? null, target: entry.target, new: !!entry.new, renameReason: entry.renameReason }
}

function hasKnownPrefix(name) {
  return PREFIXES.some((p) => name.startsWith(p))
}

// ── Build the current state from the pulled library ──
const data = readJson(COMPONENTS, { components: [], componentSets: [] })
const components = data.components || []
const componentSets = data.componentSets || []

// page -> { count, sets:Set }
const livePages = new Map()
for (const c of components) {
  const page = c.page || '(no page)'
  if (!livePages.has(page)) livePages.set(page, { count: 0, sets: new Set() })
  const rec = livePages.get(page)
  rec.count += 1
  if (c.set) rec.sets.add(c.set)
}

// set -> page (a set lives on the page of its member components)
const setPage = new Map()
for (const c of components) {
  if (c.set && !setPage.has(c.set)) setPage.set(c.set, c.page || '(no page)')
}

// sets missing a description (the backfill worklist)
const describedSets = new Set(componentSets.filter((s) => (s.description || '').trim()).map((s) => s.name))
const backlog = componentSets
  .filter((s) => !(s.description || '').trim())
  .map((s) => ({ name: s.name, key: s.key, nodeId: s.nodeId, page: setPage.get(s.name) || null }))
  .sort((a, b) => a.name.localeCompare(b.name))

// ── Project the structure, collecting flags ──
const mappedCurrent = new Set()
const flags = { emojiFix: [], missingExpectedPage: [], unmappedPages: [], setsMissingDescription: backlog.length }

let order = 0
const sections = STRUCTURE.map((section) => {
  const pages = section.pages.map((raw) => {
    const p = normalizePage(raw)
    const live = p.current ? livePages.get(p.current) : null
    if (p.current) mappedCurrent.add(p.current)
    if (!p.new && !live) flags.missingExpectedPage.push(p.current)
    if (p.renameReason) flags.emojiFix.push({ from: p.current, to: p.target, why: p.renameReason })
    return {
      order: order++,
      current: p.current,
      target: p.target,
      isNew: p.new,
      renamed: p.current !== p.target && !p.new,
      renameReason: p.renameReason || null,
      componentCount: live ? live.count : 0,
      sets: live ? [...live.sets].sort() : [],
    }
  })
  return { divider: section.divider, pages }
})

// pages present in the library but not placed anywhere in the structure
for (const [name, rec] of livePages) {
  if (!mappedCurrent.has(name)) flags.unmappedPages.push({ name, count: rec.count })
}
// any live page without a known emoji prefix (and not already getting a rename) is an emoji-fix candidate
for (const [name] of livePages) {
  if (!hasKnownPrefix(name) && name !== '(no page)' && !flags.emojiFix.some((f) => f.from === name)) {
    flags.emojiFix.push({ from: name, to: null, why: 'no recognized emoji prefix' })
  }
}

const generatedAt = new Date().toISOString()
const totalLivePages = livePages.size

const blueprint = {
  generatedAt,
  source: COMPONENTS,
  library: data.file || null,
  summary: {
    liveComponentPages: totalLivePages,
    placedPages: [...mappedCurrent].filter((n) => livePages.has(n)).length,
    categories: STRUCTURE.filter((s) => s.divider).length,
    newMetaPages: sections.flatMap((s) => s.pages).filter((p) => p.isNew).length,
    setsTotal: componentSets.length,
    setsDescribed: describedSets.size,
    setsMissingDescription: backlog.length,
  },
  sections,
  flags,
}

writeOut(BLUEPRINT_JSON, JSON.stringify(blueprint, null, 2) + '\n')
writeOut(BACKLOG_JSON, JSON.stringify({ generatedAt, count: backlog.length, sets: backlog }, null, 2) + '\n')
writeOut(PROPOSAL_MD, renderMarkdown(blueprint))

console.log(`✓ blueprint        → ${BLUEPRINT_JSON}`)
console.log(`✓ description gaps  → ${BACKLOG_JSON} (${backlog.length} sets)`)
console.log(`✓ proposal          → ${PROPOSAL_MD}`)
console.log(
  `  ${blueprint.summary.placedPages}/${totalLivePages} live pages placed · ` +
    `${blueprint.summary.categories} categories · ${flags.unmappedPages.length} unmapped · ` +
    `${flags.emojiFix.length} emoji-fix · ${backlog.length} undescribed sets`,
)

// ──────────────────────────────────────────────────────────────────────────────
function renderMarkdown(bp) {
  const L = []
  L.push('# UI Kit 2.0 — Structure Blueprint (generated)')
  L.push('')
  L.push(`_Generated by \`npm run blueprint\` from \`${bp.source}\` at ${bp.generatedAt}._`)
  L.push('')
  L.push('Target functional-category page structure for the Transportly UI Kit 2.0 file. This is the')
  L.push('execution map for the Figma reorg (organization only — no component-set renames).')
  L.push('See [ui-kit-file-structure.md](../guidelines/ui-kit-file-structure.md) for the rationale.')
  L.push('')
  L.push('## Summary')
  L.push('')
  L.push('| Metric | Value |')
  L.push('|---|---|')
  L.push(`| Live component pages | ${bp.summary.liveComponentPages} |`)
  L.push(`| Placed into a category | ${bp.summary.placedPages} |`)
  L.push(`| Categories | ${bp.summary.categories} |`)
  L.push(`| New meta pages to create | ${bp.summary.newMetaPages} |`)
  L.push(`| Component sets | ${bp.summary.setsTotal} |`)
  L.push(`| Sets with a description | ${bp.summary.setsDescribed} |`)
  L.push(`| Sets missing a description | ${bp.summary.setsMissingDescription} |`)
  L.push('')
  L.push('## Target page order')
  L.push('')
  for (const section of bp.sections) {
    if (section.divider) L.push(`### ${section.divider}`)
    else L.push('### (top — meta pages)')
    L.push('')
    for (const p of section.pages) {
      const tags = []
      if (p.isNew) tags.push('🆕 new')
      if (p.renamed) tags.push(`✏️ rename from \`${p.current}\` (${p.renameReason})`)
      if (!p.isNew && p.componentCount) tags.push(`${p.componentCount} components`)
      if (p.sets.length) tags.push(`sets: ${p.sets.join(', ')}`)
      L.push(`- **${p.target}**${tags.length ? ` — ${tags.join(' · ')}` : ''}`)
    }
    L.push('')
  }
  L.push('## Flags')
  L.push('')
  if (bp.flags.emojiFix.length) {
    L.push('### Emoji / prefix fixes')
    for (const f of bp.flags.emojiFix) L.push(`- \`${f.from}\`${f.to ? ` → \`${f.to}\`` : ''} — ${f.why}`)
    L.push('')
  }
  if (bp.flags.unmappedPages.length) {
    L.push('### Unmapped live pages (need a category)')
    for (const u of bp.flags.unmappedPages) L.push(`- \`${u.name}\` (${u.count} components)`)
    L.push('')
  } else {
    L.push('_Every live component page maps to exactly one category._')
    L.push('')
  }
  if (bp.flags.missingExpectedPage.length) {
    L.push('### Expected pages not found in the current pull')
    for (const m of bp.flags.missingExpectedPage) L.push(`- \`${m}\``)
    L.push('')
  }
  L.push('### Description backlog')
  L.push(`${bp.flags.setsMissingDescription} component sets have no Figma description — see \`data/description-backlog.json\`.`)
  L.push('')
  return L.join('\n')
}
