import { existsSync, readFileSync, writeFileSync } from 'node:fs'

// Maps a library change (from diff.mjs) to the documentation artifacts that depend on the changed
// component, so a sync can FLAG which docs need a refresh. Pure Node, zero model tokens.
//
// Two artifacts per component:
//   1. the markdown doc  → docs/design-system/components/<file>.md
//   2. the in-Figma showcase page → "📖 Docs / <name>" in the UI Kit (rebuilt by the
//      design-system-manager agent; a sync can only FLAG it, not rebuild it — that needs the MCP).
//
// Detection is automatic (this module); regeneration stays a triggered agent action.

const COMPONENTS_DIR = 'docs/design-system/components'
const README = `${COMPONENTS_DIR}/README.md`
const OUT = 'data/stale-docs.json'

// Build { componentName -> docFileName } from the components README table. Parsing the table
// (rather than slugifying names) honours the custom file names already in use
// (e.g. "Assets (Icons & Helper Components)" -> assets-icons.md).
function readDocMap() {
  if (!existsSync(README)) return {}
  const map = {}
  const rowRe = /^\|\s*(.+?)\s*\|\s*\[[^\]]+\]\(([^)]+\.md)\)\s*\|/gm
  const text = readFileSync(README, 'utf8')
  let m
  while ((m = rowRe.exec(text))) map[m[1].trim()] = m[2].trim()
  return map
}

// Given a diff (from diffSnapshots), return the docs whose component was added or changed.
// Removed components are intentionally excluded — deleting a doc is a separate, deliberate action.
export function computeStaleDocs(diff) {
  if (!diff || diff.firstRun) return []
  const docMap = readDocMap()
  const items = []
  const add = (name, kind, change) => {
    const doc = docMap[name] || null
    items.push({
      name,
      kind,
      change,
      doc,
      hasDoc: Boolean(doc && existsSync(`${COMPONENTS_DIR}/${doc}`)),
    })
  }
  for (const name of diff.componentSets?.added || []) add(name, 'set', 'added')
  for (const name of diff.componentSets?.changed || []) add(name, 'set', 'changed')
  for (const name of diff.components?.added || []) add(name, 'component', 'added')
  for (const name of diff.components?.changed || []) add(name, 'component', 'changed')
  return items
}

// Persist the flag list so the dashboard (or a later regeneration pass) can read it.
export function writeStaleDocs(items, snapshot) {
  const payload = {
    generatedAt: snapshot?.takenAt || null,
    libraryVersion: snapshot?.library?.version || null,
    count: items.length,
    items,
  }
  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`)
  return payload
}

// A markdown section for the changelog entry. Empty string when nothing is stale.
export function staleDocsSection(items) {
  if (!items.length) return ''
  const lines = items.map((it) => {
    const target = it.hasDoc
      ? `\`components/${it.doc}\` + rebuild 📖 Docs / ${it.name}`
      : '_(no markdown doc yet — consider documenting)_'
    return `- **${it.name}** (${it.change}) → refresh ${target}`
  })
  return `\n**⚠️ Docs to refresh** (${items.length})\n${lines.join('\n')}\n`
}
