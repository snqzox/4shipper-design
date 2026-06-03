import { existsSync, readFileSync, writeFileSync } from 'node:fs'

// Build data/variables-desktop.json from a raw figma-mcp-bridge variable dump, resolving
// VARIABLE_ALIAS chains to concrete values. This is the **bridge** path — independent of the
// (rate-limited) Dev Mode MCP server used by pull-variables-desktop.mjs.
//
// Why a two-step flow? The figma-mcp-bridge MCP server talks to Claude over **stdio** (no HTTP/WS
// endpoint a script can call), so a script cannot pull from the bridge on its own. The agent makes
// ONE bridge call and saves the result; this script does the (token-free) alias resolution.
//
// USAGE
//   1. Ask the agent (in a session with the figma-mcp-bridge plugin connected to UI Kit 2.0) to dump
//      all local variables in COMPACT form and write them to `data/_bridge-vars-raw.json` as a JSON
//      array of objects shaped like:
//        { "id": "VariableID:5:46", "name": "blue/500", "type": "COLOR", "hex": "#105BFF" }          // concrete colour
//        { "id": "VariableID:15:729", "name": "spacing/4", "type": "FLOAT", "value": 16 }            // concrete float
//        { "id": "VariableID:6:27", "name": "font-family/...", "type": "STRING", "value": "Mulish" } // concrete string
//        { "id": "VariableID:11:178", "name": "button-primary/background", "type": "COLOR",
//          "value": { "aliasOf": "VariableID:5:46" } }                                               // alias (any type)
//      (e.g. `figma_search_variables` with namePattern "*" / compact:true, or `figma_get_local_variables`
//      transformed to this shape.)
//   2. Run `npm run variables:bridge` (this script).
//
// Output matches the Dev Mode format so tokens.mjs consumes it unchanged: colours = lowercase hex,
// numbers = strings, strings = as-is. Because the bridge returns only LOCAL variables, foreign/library
// leaks (e.g. an old Uixmate `button/primary/bg`) can never appear here by construction.
//
// LIMITATION — MULTI-MODE TOKENS (verified 2026-06-03). `figma_search_variables` compact returns ONE
// value per variable: the collection's FIRST/default mode. For multi-mode collections this differs from
// the Dev Mode `get_variable_defs` output (pull-variables-desktop.mjs), which resolves the mode actually
// USED in context on the scanned pages. Concretely, the `input-sizes` collection has 4 size modes
// (sm/md/lg/xl) — e.g. `button/size` = 28/34/42/48 — so the bridge yields 28 where Dev Mode yielded 42.
// Colours (theme-colors, light/dark) match because both pick light. ⇒ This bridge path is RELIABLE for
// COLOURS (and the leak-proofing that motivated it) but WRONG for multi-mode layout/size tokens, so it
// is a fallback, NOT a drop-in replacement for the Dev Mode pull as the primary source.
const DATA_DIR = 'data'
const RAW = `${DATA_DIR}/_bridge-vars-raw.json`
const OUT = process.argv[2] || `${DATA_DIR}/variables-desktop.json`

function loadRaw() {
  if (!existsSync(RAW)) {
    throw new Error(`${RAW} not found. Have the agent dump bridge variables there first (see header).`)
  }
  const parsed = JSON.parse(readFileSync(RAW, 'utf8'))
  const list = Array.isArray(parsed) ? parsed : parsed.variables
  if (!Array.isArray(list)) throw new Error(`${RAW} must be an array (or { variables: [...] }).`)
  return list
}

function formatConcrete(entry) {
  if (entry.type === 'COLOR') {
    const hex = entry.hex ?? (typeof entry.value === 'string' ? entry.value : null)
    return hex ? String(hex).toLowerCase() : null
  }
  const v = entry.value
  if (v == null || typeof v === 'object') return null
  return String(v)
}

function buildResolver(byId) {
  const cache = new Map()
  function resolve(entry, seen) {
    if (!entry) return null
    if (cache.has(entry.id)) return cache.get(entry.id)
    const alias = entry.value && typeof entry.value === 'object' ? entry.value.aliasOf : null
    let out
    if (alias) {
      if (seen.has(entry.id)) return null // cycle guard
      seen.add(entry.id)
      out = resolve(byId.get(alias), seen)
    } else {
      out = formatConcrete(entry)
    }
    cache.set(entry.id, out)
    return out
  }
  return resolve
}

function main() {
  const list = loadRaw()
  const byId = new Map(list.map((e) => [e.id, e]))
  const resolve = buildResolver(byId)

  const variables = {}
  let unresolved = 0
  for (const e of list) {
    if (!e.name) continue
    const val = resolve(e, new Set())
    if (val == null) { unresolved += 1; continue }
    variables[e.name] = val
  }

  const out = {
    generatedAt: new Date().toISOString(),
    source: 'figma-mcp-bridge (alias-resolved)',
    count: Object.keys(variables).length,
    variables,
  }
  writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`)
  console.log(`✓ ${out.count} variables (${unresolved} unresolved) → ${OUT}`)
}

main()
