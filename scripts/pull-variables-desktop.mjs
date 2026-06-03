import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { connect, callTool } from './figma-desktop.mjs'

// Pull Figma variables (design tokens) via the local Dev Mode MCP server by walking every
// page and unioning the resolved variable maps. Writes data/variables-desktop.json, which
// tokens.mjs prefers over the (Enterprise-gated) REST variables. Run manually with the UI Kit
// open and active in the Figma desktop app:  node scripts/pull-variables-desktop.mjs
const DATA_DIR = 'data'

// UI Kit page list comes from data/components.json (file.pages), produced by `npm run pull`.
function listPageIds() {
  const path = `${DATA_DIR}/components.json`
  if (!existsSync(path)) {
    throw new Error('data/components.json not found — run `npm run pull` first.')
  }
  const pages = JSON.parse(readFileSync(path, 'utf8')).file?.pages || []
  return pages.map((p) => ({ id: p.id, name: p.name }))
}

async function variablesForNode(nodeId) {
  const text = await callTool('get_variable_defs', { nodeId, clientLanguages: 'unknown', clientFrameworks: 'unknown' })
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

async function main() {
  await connect()
  const pages = listPageIds()
  console.log(`→ Walking ${pages.length} pages for variables…`)

  const union = {}
  let pagesWithVars = 0
  for (const page of pages) {
    try {
      const vars = await variablesForNode(page.id)
      const n = Object.keys(vars).length
      if (n) {
        pagesWithVars += 1
        Object.assign(union, vars)
      }
      console.log(`  ${n.toString().padStart(3)}  ${page.name}`)
    } catch (e) {
      console.log(`    !  ${page.name} — ${e.message}`)
    }
  }

  mkdirSync(DATA_DIR, { recursive: true })
  const out = {
    generatedAt: new Date().toISOString(),
    source: 'figma-desktop-mcp',
    pagesScanned: pages.length,
    pagesWithVariables: pagesWithVars,
    count: Object.keys(union).length,
    variables: union,
  }
  writeFileSync(`${DATA_DIR}/variables-desktop.json`, `${JSON.stringify(out, null, 2)}\n`)
  console.log(`✓ ${out.count} unique variables → data/variables-desktop.json`)
}

main().catch((e) => {
  console.error('✗', e.message)
  process.exit(1)
})
