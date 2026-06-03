import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { figmaGet } from './figma-client.mjs'
import { FILES } from './config.mjs'

// Render a PNG thumbnail for every top-level screen (frame/section/component) of the
// "Transportly 4Shipper — Design" file via the Figma REST images endpoint, download them into
// dashboard/thumbs-pages/, and write a manifest the dashboard's Pages detail reads. Pure Node
// (scripts-first, zero model tokens). Needs FIGMA_TOKEN.
//   npm run thumbnails:pages
//
// Mirrors pull-thumbnails.mjs (which does the UI Kit components). The REST /v1/images URLs are
// short-lived, so we download the bytes and commit the PNGs — that keeps the published GitHub
// Pages dashboard self-contained. Frames can be wide, so we render at scale 0.5 and let the
// dashboard box them; thumbnails only need to be recognisable, not pixel-perfect.

const DATA = 'data'
const THUMBS_DIR = 'dashboard/thumbs-pages'
const MANIFEST = `${DATA}/page-thumbnails.json`
const KEY = FILES.design.key
// Thumbnails render at ~64px in the dashboard, so a low scale keeps the committed PNGs small with
// no visible loss: a 2000px frame → 500px PNG.
const SCALE = 0.25
// Design frames are large (some 2000px wide), so the /v1/images render budget is hit far sooner
// than for the small UI Kit components. Keep batches small, and if one still times out, fall back
// to single-id requests so one giant frame can't sink the whole batch.
const BATCH = 8

const safe = (id) => id.replace(/:/g, '-')

// Every top-level screen across every page becomes one thumbnail, keyed by its node id.
function screenIds(pagesData) {
  const ids = []
  for (const page of pagesData.design?.pages || []) {
    for (const screen of page.screens || []) if (screen.id) ids.push(screen.id)
  }
  return [...new Set(ids)]
}

async function renderBatch(ids) {
  const path = `/v1/images/${KEY}?ids=${encodeURIComponent(ids.join(','))}&format=png&scale=${SCALE}`
  const res = await figmaGet(path)
  return res.images || {}
}

async function imageUrls(ids) {
  const urls = {}
  let done = 0
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH)
    try {
      Object.assign(urls, await renderBatch(batch))
    } catch {
      // Batch timed out — retry each id alone, skipping any that still fail to render.
      for (const id of batch) {
        try {
          Object.assign(urls, await renderBatch([id]))
        } catch {
          /* leave this id unrendered; main() counts it as missing */
        }
      }
    }
    done = Math.min(i + BATCH, ids.length)
    process.stdout.write(`  rendered ${done}/${ids.length}\r`)
  }
  return urls
}

async function download(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  const pagesData = JSON.parse(readFileSync(`${DATA}/pages.json`, 'utf8'))
  const ids = screenIds(pagesData)
  if (!ids.length) {
    console.log('No screens found in data/pages.json — run `npm run pull` first.')
    return
  }
  mkdirSync(THUMBS_DIR, { recursive: true })

  console.log(`→ Rendering ${ids.length} screen thumbnails from the design file…`)
  const urls = await imageUrls(ids)

  const thumbs = {}
  let ok = 0
  let missing = 0
  for (const id of ids) {
    const url = urls[id]
    if (!url) { missing += 1; continue }
    try {
      const buf = await download(url)
      const file = `${safe(id)}.png`
      writeFileSync(`${THUMBS_DIR}/${file}`, buf)
      thumbs[id] = `thumbs-pages/${file}`
      ok += 1
    } catch {
      missing += 1
    }
  }

  const payload = { generatedAt: pagesData.generatedAt || null, fileKey: KEY, count: ok, thumbs }
  writeFileSync(MANIFEST, `${JSON.stringify(payload, null, 2)}\n`)
  console.log(`\n✓ ${ok} thumbnails saved to ${THUMBS_DIR}/ (${missing} skipped) → ${MANIFEST}`)
}

main().catch((err) => {
  console.error('✗ page thumbnails failed:', err.message)
  process.exit(1)
})
