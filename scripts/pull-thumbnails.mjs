import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { figmaGet } from './figma-client.mjs'
import { FILES } from './config.mjs'

// Render a PNG thumbnail for every meaningful component (component sets + standalone components)
// via the Figma REST images endpoint, download them into dashboard/thumbs/, and write a manifest
// the dashboard reads. Pure Node (scripts-first, zero model tokens). Needs FIGMA_TOKEN.
//   npm run thumbnails
//
// The REST /v1/images URLs are short-lived, so we download the bytes and commit the PNGs — that
// keeps the published GitHub Pages dashboard self-contained. For a SET we render a single
// representative variant (the first one) rather than the whole variant grid, for a cleaner preview.

const DATA = 'data'
const THUMBS_DIR = 'dashboard/thumbs'
const MANIFEST = `${DATA}/thumbnails.json`
const KEY = FILES.uiKit.key
const SCALE = 1
const BATCH = 60 // node ids per /v1/images request

const safe = (id) => id.replace(/:/g, '-')

// { ownId, renderId } per meaningful component. ownId identifies the component in the dashboard;
// renderId is the node actually rendered (a representative variant for sets).
function meaningful(componentsData) {
  const sets = componentsData.componentSets || []
  const comps = componentsData.components || []
  const firstVariant = {}
  for (const c of comps) if (c.set && !firstVariant[c.set]) firstVariant[c.set] = c.nodeId
  const items = []
  for (const s of sets) items.push({ ownId: s.nodeId, renderId: firstVariant[s.name] || s.nodeId })
  for (const c of comps) if (!c.set) items.push({ ownId: c.nodeId, renderId: c.nodeId })
  return items
}

async function imageUrls(renderIds) {
  const urls = {}
  for (let i = 0; i < renderIds.length; i += BATCH) {
    const batch = renderIds.slice(i, i + BATCH)
    const path = `/v1/images/${KEY}?ids=${encodeURIComponent(batch.join(','))}&format=png&scale=${SCALE}`
    const res = await figmaGet(path)
    Object.assign(urls, res.images || {})
    process.stdout.write(`  rendered ${Math.min(i + BATCH, renderIds.length)}/${renderIds.length}\r`)
  }
  return urls
}

async function download(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  const componentsData = JSON.parse(readFileSync(`${DATA}/components.json`, 'utf8'))
  const items = meaningful(componentsData)
  mkdirSync(THUMBS_DIR, { recursive: true })

  const renderIds = [...new Set(items.map((it) => it.renderId).filter(Boolean))]
  console.log(`→ Rendering ${renderIds.length} node thumbnails from Figma (${items.length} components)…`)
  const urls = await imageUrls(renderIds)

  const thumbs = {}
  let ok = 0
  let missing = 0
  for (const it of items) {
    const url = urls[it.renderId]
    if (!url) { missing += 1; continue }
    try {
      const buf = await download(url)
      const file = `${safe(it.ownId)}.png`
      writeFileSync(`${THUMBS_DIR}/${file}`, buf)
      thumbs[it.ownId] = `thumbs/${file}`
      ok += 1
    } catch {
      missing += 1
    }
  }

  const payload = { generatedAt: componentsData.generatedAt || null, fileKey: KEY, count: ok, thumbs }
  writeFileSync(MANIFEST, `${JSON.stringify(payload, null, 2)}\n`)
  console.log(`\n✓ ${ok} thumbnails saved to ${THUMBS_DIR}/ (${missing} skipped) → ${MANIFEST}`)
}

main().catch((err) => {
  console.error('✗ thumbnails failed:', err.message)
  process.exit(1)
})
