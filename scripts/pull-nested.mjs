import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { figmaGet } from './figma-client.mjs'

// Extract *which other components each component is built from* (its direct nested instances)
// straight from the Figma node tree, and write data/nested.json. Zero model tokens — this is
// mechanical extraction, so it belongs in a script. The dashboard reads the result and renders
// a "Nested components" section (with links) in the component detail drawer.

const DATA_DIR = 'data'
const ASSETS_PAGE = '🧩 Assets'
// Node trees can be large; request a handful of roots per call to keep payloads sane.
const BATCH = 10
// Auto-named layers (renamed instances whose published master we can't resolve) carry no signal.
const GENERIC_NAME = /^(Frame|Group|Rectangle|Ellipse|Vector|Line|Component|Instance|Slice|Union|Subtract|Mask|Intersect|Exclude)(\s|$)/i

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback
  return JSON.parse(readFileSync(path, 'utf8'))
}

function writeJson(name, obj) {
  mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(`${DATA_DIR}/${name}`, `${JSON.stringify(obj, null, 2)}\n`)
}

function isGenericName(name) {
  return !name || GENERIC_NAME.test(String(name).trim())
}

// Collect DIRECT nested instances: record every INSTANCE node but do not descend into it, so we
// surface what a component is composed of (Button, Icon, …) rather than the whole transitive tree.
function collectDirectInstances(root) {
  const out = []
  const visit = (node) => {
    for (const child of node.children || []) {
      if (child.type === 'INSTANCE') {
        out.push(child)
      } else {
        visit(child)
      }
    }
  }
  visit(root)
  return out
}

export async function pullNested() {
  const data = readJson(`${DATA_DIR}/components.json`, null)
  if (!data) throw new Error('data/components.json not found — run `npm run pull` first.')

  const fileKey = data.file?.key
  const components = data.components || []
  const sets = data.componentSets || []

  // node id → component record (variants are individual components here).
  const compByNode = new Map(components.map((c) => [c.nodeId, c]))
  // set name → set record, so a nested variant resolves to its displayable set unit.
  const setByName = new Map(sets.map((s) => [s.name, s]))

  // Resolve an instance's target component into the unit the dashboard actually shows:
  // a variant resolves to its parent set; a standalone resolves to itself. Unknown ids are
  // components from other libraries (or unpublished/private) — kept by name, but not linkable.
  function resolveTarget(componentId) {
    const comp = compByNode.get(componentId)
    if (!comp) return null
    if (comp.set) {
      return { name: comp.set, nodeId: setByName.get(comp.set)?.nodeId || null, viaVariant: comp.name }
    }
    return { name: comp.name, nodeId: comp.nodeId, viaVariant: null }
  }

  // Displayable units we want nested info for: every set + non-asset standalone components.
  // Asset leaves (icons, flags, logos) hold no nested components, so we skip them to save bandwidth.
  const setUnits = sets.filter((s) => s.nodeId).map((s) => ({ name: s.name, nodeId: s.nodeId }))
  const standaloneUnits = components
    .filter((c) => !c.set && c.page !== ASSETS_PAGE && c.nodeId)
    .map((c) => ({ name: c.name, nodeId: c.nodeId }))
  const units = [...setUnits, ...standaloneUnits]
  const nodeIds = units.map((u) => u.nodeId)

  // Fetch node trees in batches.
  const trees = {}
  for (let i = 0; i < nodeIds.length; i += BATCH) {
    const slice = nodeIds.slice(i, i + BATCH)
    const res = await figmaGet(`/v1/files/${fileKey}/nodes?ids=${slice.join(',')}`)
    Object.assign(trees, res.nodes || {})
    console.error(`  …trees ${Math.min(i + BATCH, nodeIds.length)}/${nodeIds.length}`)
  }

  // For each unit, build a deduped list of nested targets with usage counts.
  const unitsOut = {}
  let withNested = 0
  for (const unit of units) {
    const doc = trees[unit.nodeId]?.document
    if (!doc) continue
    const instances = collectDirectInstances(doc)
    if (!instances.length) continue

    const acc = new Map()
    for (const inst of instances) {
      const target = resolveTarget(inst.componentId)
      // Skip self-references (a set whose variant instances point back to the same set).
      if (target && target.name === unit.name) continue
      // Drop unresolvable, auto-named layers — they carry no useful signal for the reader.
      if (!target && isGenericName(inst.name)) continue

      const key = target?.nodeId
        ? `node:${target.nodeId}`
        : `ext:${(target?.name || inst.name || 'Unknown').trim()}`
      const existing = acc.get(key)
      if (existing) {
        existing.count += 1
        continue
      }
      acc.set(key, {
        name: (target?.name || inst.name || 'Unknown').trim(),
        nodeId: target?.nodeId || null,
        resolved: Boolean(target),
        viaVariant: target?.viaVariant || null,
        count: 1,
      })
    }

    if (!acc.size) continue
    unitsOut[unit.nodeId] = [...acc.values()].sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    )
    withNested += 1
  }

  writeJson('nested.json', {
    generatedAt: new Date().toISOString(),
    file: { key: fileKey, version: data.file?.version },
    units: unitsOut,
  })

  return { units: units.length, withNested }
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  pullNested()
    .then((r) => console.log(`✓ Nested components: ${r.withNested}/${r.units} units have nested instances → data/nested.json`))
    .catch((e) => {
      console.error('✗', e.message)
      process.exit(1)
    })
}
