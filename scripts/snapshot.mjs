import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const DATA_DIR = 'data'
const SNAP_DIR = `${DATA_DIR}/snapshots`
const LATEST = `${DATA_DIR}/latest.json`

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback
  return JSON.parse(readFileSync(path, 'utf8'))
}

function byKey(items, pick) {
  return Object.fromEntries((items || []).map((item) => [item.key, pick(item)]))
}

// Build a compact fingerprint of the current design state from the pulled data files.
// Keyed maps make diffing cheap and order-independent.
export function buildSnapshot() {
  const components = readJson(`${DATA_DIR}/components.json`, { components: [], componentSets: [], file: {} })
  const styles = readJson(`${DATA_DIR}/styles.json`, { styles: [] })
  const pages = readJson(`${DATA_DIR}/pages.json`, { design: { pages: [] } })

  return {
    takenAt: new Date().toISOString(),
    library: {
      file: components.file,
      version: components.file?.version,
      lastModified: components.file?.lastModified,
      components: byKey(components.components, (c) => ({ name: c.name, updatedAt: c.updatedAt, description: c.description, set: c.set })),
      componentSets: byKey(components.componentSets, (c) => ({ name: c.name, updatedAt: c.updatedAt })),
      styles: byKey(styles.styles, (s) => ({ name: s.name, type: s.type, updatedAt: s.updatedAt })),
    },
    design: {
      version: pages.design?.version,
      lastModified: pages.design?.lastModified,
      pages: (pages.design?.pages || []).map((p) => ({ name: p.name, screens: (p.screens || []).length })),
    },
  }
}

export function readLatest() {
  return readJson(LATEST, null)
}

export function saveSnapshot(snapshot) {
  mkdirSync(SNAP_DIR, { recursive: true })
  const stamp = snapshot.takenAt.slice(0, 19).replace(/[:T]/g, '-')
  const path = `${SNAP_DIR}/${stamp}.json`
  const body = `${JSON.stringify(snapshot, null, 2)}\n`
  writeFileSync(path, body)
  writeFileSync(LATEST, body)
  return path
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  const path = saveSnapshot(buildSnapshot())
  console.log(`✓ Snapshot saved: ${path}`)
}
