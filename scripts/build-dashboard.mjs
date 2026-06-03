import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { readDocMap } from './stale-docs.mjs'

const DATA_DIR = 'data'
const OUT_DIR = 'dashboard'
const REPO_URL = 'https://github.com/snqzox/4shipper-design'
const COMPONENTS_DIR = 'docs/design-system/components'
// Figma page whose components (icons, logos, flags, illustrations) get their own Assets section.
const ASSETS_PAGE = '🧩 Assets'

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback
  return JSON.parse(readFileSync(path, 'utf8'))
}

function readText(path, fallback) {
  return existsSync(path) ? readFileSync(path, 'utf8') : fallback
}

// Parse a variant component name ("Size=Large, State=Default") into [axis, value] pairs.
function parseVariantProps(variantName) {
  return String(variantName)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pair) => {
      const i = pair.indexOf('=')
      return i >= 0 ? [pair.slice(0, i).trim(), pair.slice(i + 1).trim()] : [pair, '']
    })
}

// Collapse a set's variants into property axes: [{ axis, values:[...] }], preserving first-seen order.
function deriveProperties(variants) {
  const props = {}
  for (const v of variants) {
    for (const [axis, value] of parseVariantProps(v.name)) {
      if (!axis) continue
      ;(props[axis] ||= new Set()).add(value)
    }
  }
  return Object.entries(props).map(([axis, values]) => ({ axis, values: [...values] }))
}

// Enrich a component with documentation/health signals + outbound links, all derived from data
// (zero Figma round-trips): markdown doc presence, Figma description, an in-Figma showcase page,
// staleness flag, a deep link to the node in Figma, a GitHub link to the doc, and a thumbnail.
function componentHealth(item, ctx) {
  const doc = ctx.docMap[item.name] || null
  const hasDoc = Boolean(doc && existsSync(`${COMPONENTS_DIR}/${doc}`))
  const docContent = hasDoc ? readText(`${COMPONENTS_DIR}/${doc}`, null) : null
  const hasDescription = Boolean(item.description && String(item.description).trim())
  const hasShowcase = ctx.showcaseNames.has(item.name)
  const stale = ctx.staleNames.has(item.name)
  const nodeId = item.nodeId || null
  return {
    ...item,
    hasDoc,
    hasDescription,
    hasShowcase,
    stale,
    docUrl: doc ? `${REPO_URL}/blob/main/${COMPONENTS_DIR}/${doc}` : null,
    docContent,
    figmaUrl: nodeId ? `https://www.figma.com/design/${ctx.fileKey}/?node-id=${nodeId.replace(/:/g, '-')}` : null,
    thumb: nodeId ? ctx.thumbs[nodeId] || null : null,
    nested: nodeId ? ctx.nested[nodeId] || [] : [],
    usedBy: nodeId ? ctx.usedBy[nodeId] || [] : [],
    needsAttention: !hasDoc || !hasDescription || stale,
  }
}

// Turn the flat component list (mostly variants) into meaningful units:
// component sets (with variant counts) + standalone components, grouped by Figma page,
// each enriched with health signals and links.
function buildComponentsModel(componentsData, ctx) {
  const components = componentsData.components || []
  const sets = componentsData.componentSets || []

  const variantsOfSet = {}
  for (const c of components) {
    if (c.set) (variantsOfSet[c.set] ||= []).push({ name: c.name, nodeId: c.nodeId })
  }
  const pageOfSet = {}
  for (const c of components) {
    if (c.set && !pageOfSet[c.set] && c.page) pageOfSet[c.set] = c.page
  }

  const setItems = sets.map((s) => {
    const variants = variantsOfSet[s.name] || []
    return componentHealth(
      {
        kind: 'set',
        name: s.name,
        description: s.description,
        nodeId: s.nodeId,
        page: pageOfSet[s.name] || null,
        variants: variants.length,
        variantNames: variants.map((v) => v.name),
        properties: deriveProperties(variants),
      },
      ctx,
    )
  })
  const standaloneItems = components
    .filter((c) => !c.set)
    .map((c) =>
      componentHealth(
        { kind: 'component', name: c.name, description: c.description, nodeId: c.nodeId, page: c.page || null },
        ctx,
      ),
    )

  const allItems = [...setItems, ...standaloneItems]
  // The "🧩 Assets" page (icons, logos, flags, illustrations) is split into its own Assets
  // section so the Components view stays focused on real UI components.
  const assetItems = allItems
    .filter((it) => it.page === ASSETS_PAGE)
    .sort((a, b) => a.name.localeCompare(b.name))
  const items = allItems.filter((it) => it.page !== ASSETS_PAGE)

  const groups = {}
  for (const it of items) {
    const page = it.page || 'Other'
    ;(groups[page] ||= []).push(it)
  }
  const grouped = Object.entries(groups)
    .map(([page, list]) => ({
      page,
      items: list.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => b.items.length - a.items.length)

  const health = {
    total: items.length,
    documented: items.filter((i) => i.hasDoc).length,
    described: items.filter((i) => i.hasDescription).length,
    showcased: items.filter((i) => i.hasShowcase).length,
    stale: items.filter((i) => i.stale).length,
    needsAttention: items.filter((i) => i.needsAttention).length,
  }

  return {
    raw: components.length,
    sets: items.filter((i) => i.kind === 'set').length,
    standalone: items.filter((i) => i.kind === 'component').length,
    meaningful: items.length,
    health,
    groups: grouped,
    assets: assetItems,
    assetsPage: ASSETS_PAGE,
  }
}

function collect() {
  const componentsData = readJson(`${DATA_DIR}/components.json`, { components: [], componentSets: [], file: {} })
  const tokens = readJson(`${DATA_DIR}/tokens.json`, { typography: [], shadows: [], colors: [], variables: { available: false } })
  const pages = readJson(`${DATA_DIR}/pages.json`, { design: { pages: [] } })
  const changelog = readText('docs/design-system/changelog.md', '# Design System Changelog\n\n_No changes recorded yet._')
  const staleDocs = readJson(`${DATA_DIR}/stale-docs.json`, { items: [] })
  const thumbnails = readJson(`${DATA_DIR}/thumbnails.json`, { thumbs: {} })
  const nested = readJson(`${DATA_DIR}/nested.json`, { units: {} })

  // Invert the nested graph into a "used in" map (reverse usage) — zero extra Figma calls.
  // For each unit U that nests a resolved target T, record U as a consumer of T, keyed by T's nodeId.
  const nameByNode = {}
  for (const s of componentsData.componentSets || []) if (s.nodeId) nameByNode[s.nodeId] = s.name
  for (const c of componentsData.components || []) if (!c.set && c.nodeId) nameByNode[c.nodeId] = c.name
  const usedBy = {}
  for (const [unitNode, list] of Object.entries(nested.units || {})) {
    const userName = nameByNode[unitNode]
    if (!userName) continue
    for (const n of list || []) {
      if (!n.resolved || !n.nodeId) continue
      ;(usedBy[n.nodeId] ||= []).push({ name: userName, nodeId: unitNode, count: n.count || 1 })
    }
  }
  for (const node of Object.keys(usedBy)) {
    usedBy[node].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }

  // Component names that have an in-Figma showcase page ("📖 Docs / <Name>") in the UI Kit.
  const showcaseNames = new Set(
    (componentsData.file?.pages || [])
      .map((p) => /^📖\s*Docs\s*\/\s*(.+)$/u.exec(p.name)?.[1]?.trim())
      .filter(Boolean),
  )
  const ctx = {
    docMap: readDocMap(),
    staleNames: new Set((staleDocs.items || []).map((i) => i.name)),
    showcaseNames,
    thumbs: thumbnails.thumbs || {},
    nested: nested.units || {},
    usedBy,
    fileKey: componentsData.file?.key || 'XVou4XJ4rWbt4oXoSxO7hO',
  }
  const comps = buildComponentsModel(componentsData, ctx)
  const screensTotal = (pages.design?.pages || []).reduce((sum, p) => sum + (p.screens?.length || 0), 0)
  const varCount = tokens.variables?.available
    ? tokens.variables.count
      || (tokens.variables.groups || []).reduce((n, g) => n + (g.items?.length || 0), 0)
      || (tokens.variables.collections || []).reduce((n, c) => n + (c.variables?.length || 0), 0)
    : 0

  return {
    generatedAt: componentsData.generatedAt || new Date().toISOString(),
    uiKit: componentsData.file || {},
    counts: {
      meaningful: comps.meaningful,
      sets: comps.sets,
      standalone: comps.standalone,
      assets: comps.assets.length,
      variants: comps.raw,
      typography: tokens.typography.length,
      shadows: tokens.shadows.length,
      colors: tokens.colors.length,
      variables: varCount,
      pages: pages.design?.pages?.length || 0,
      screens: screensTotal,
    },
    components: comps,
    tokens,
    design: pages.design || { pages: [] },
    changelog,
  }
}

function render(model) {
  const json = JSON.stringify(model).replace(/</g, '\\u003c')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>4Shipper · Design System</title>
<style>
  :root {
    --bg:#0b0e14; --panel:#121722; --panel2:#0f141d; --line:#222a38; --line2:#2c3647;
    --fg:#e8ecf3; --muted:#8a95a8; --faint:#5d6678; --accent:#6ea8fe; --accent2:#caa9ff;
    --ok:#54d18c; --warn:#f0b860; --radius:12px;
    --mono:"SF Mono",ui-monospace,"JetBrains Mono",Menlo,monospace;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,sans-serif;
  }
  * { box-sizing:border-box; }
  html,body { margin:0; height:100%; }
  body { background:var(--bg); color:var(--fg); font:14px/1.55 var(--sans); display:flex; min-height:100vh; }
  a { color:var(--accent); }
  ::-webkit-scrollbar { width:10px; height:10px; }
  ::-webkit-scrollbar-thumb { background:var(--line2); border-radius:8px; }

  /* Sidebar */
  aside { width:248px; flex:0 0 248px; background:var(--panel2); border-right:1px solid var(--line);
    position:sticky; top:0; height:100vh; padding:22px 16px; display:flex; flex-direction:column; gap:4px; }
  .brand { display:flex; align-items:center; gap:10px; padding:0 8px 18px; }
  .brand .dot { width:26px; height:26px; border-radius:7px; background:linear-gradient(135deg,var(--accent),var(--accent2)); }
  .brand b { font-size:14px; letter-spacing:.2px; }
  .brand span { display:block; color:var(--faint); font-size:11px; font-weight:400; }
  nav.side { display:flex; flex-direction:column; gap:2px; }
  nav.side button { all:unset; cursor:pointer; display:flex; align-items:center; justify-content:space-between;
    padding:9px 12px; border-radius:9px; color:var(--muted); font-size:13px; }
  nav.side button:hover { background:#161c28; color:var(--fg); }
  nav.side button.active { background:#18202e; color:var(--fg); box-shadow:inset 2px 0 0 var(--accent); }
  nav.side .cnt { font:11px/1 var(--mono); color:var(--faint); background:#1a2230; padding:3px 7px; border-radius:20px; }
  nav.side button.active .cnt { color:var(--accent); }
  .side-foot { margin-top:auto; padding:12px 10px 0; color:var(--faint); font-size:11px; border-top:1px solid var(--line); }

  /* Main */
  main { flex:1; min-width:0; padding:28px 34px 60px; max-width:1680px; }
  .topline { color:var(--faint); font:12px/1.4 var(--mono); margin-bottom:6px; }
  h1.view-title { font-size:22px; margin:0 0 2px; letter-spacing:-.2px; }
  .sub { color:var(--muted); margin:0 0 22px; font-size:13px; }

  /* Stat cards */
  .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin-bottom:26px; }
  .stat { background:var(--panel); border:1px solid var(--line); border-radius:var(--radius); padding:16px 18px; }
  .stat .n { font:600 28px/1 var(--sans); letter-spacing:-.5px; }
  .stat .l { color:var(--muted); font-size:11px; text-transform:uppercase; letter-spacing:.06em; margin-top:7px; }
  .stat .hint { color:var(--faint); font-size:11px; margin-top:3px; }

  .card { background:var(--panel); border:1px solid var(--line); border-radius:var(--radius); padding:18px 20px; margin-bottom:14px; }
  .card h3 { margin:0 0 12px; font-size:13px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); }

  /* Search */
  .search { width:100%; padding:11px 14px; background:var(--panel); border:1px solid var(--line2); border-radius:10px;
    color:var(--fg); margin-bottom:16px; font-size:13px; }
  .search:focus { outline:none; border-color:var(--accent); }

  /* Collapsible groups */
  .group { border:1px solid var(--line); border-radius:var(--radius); margin-bottom:10px; overflow:hidden; background:var(--panel); }
  .group > .ghead { all:unset; cursor:pointer; display:flex; align-items:center; gap:10px; width:100%;
    padding:13px 16px; box-sizing:border-box; }
  .group > .ghead:hover { background:#161c28; }
  .group .chev { color:var(--faint); transition:transform .15s; font-size:11px; }
  .group.open .chev { transform:rotate(90deg); }
  .group .gname { font-weight:600; font-size:13px; }
  .group .gcount { margin-left:auto; font:11px/1 var(--mono); color:var(--faint); }
  .group .gbody { display:none; border-top:1px solid var(--line); padding:6px; }
  .group.open .gbody { display:block; }

  .row { display:flex; align-items:center; gap:12px; padding:9px 11px; border-radius:8px; }
  .row:hover { background:#141b27; }
  .row .nm { font-size:13px; }
  .row .ds { color:var(--faint); font-size:12px; margin-left:6px; }
  .row .tag { font:10px/1 var(--mono); padding:3px 7px; border-radius:6px; margin-left:auto; white-space:nowrap; }
  .tag.set { background:#1c2740; color:var(--accent); }
  .tag.comp { background:#1d2530; color:var(--muted); }
  .tag.scr { background:#16241c; color:var(--ok); }

  /* Typography tokens */
  .typ { display:flex; align-items:baseline; justify-content:space-between; gap:20px; padding:16px 4px; border-bottom:1px solid var(--line); }
  .typ:last-child { border-bottom:none; }
  .typ .prev { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--fg); }
  .typ .meta { flex:0 0 auto; text-align:right; }
  .typ .meta .tn { font:12px/1.3 var(--mono); color:var(--accent); }
  .typ .meta .tv { font:11px/1.4 var(--mono); color:var(--faint); }

  /* Shadow tokens */
  .shadows { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:16px; }
  .shadow-card { background:var(--panel); border:1px solid var(--line); border-radius:var(--radius); padding:20px; }
  .shadow-swatch { height:88px; border-radius:10px; background:#1a2230; margin-bottom:14px; }
  .shadow-card .tn { font:12px/1.3 var(--mono); color:var(--accent); }
  .shadow-card .tv { font:10px/1.4 var(--mono); color:var(--faint); margin-top:6px; word-break:break-all; }

  /* Colors */
  .colors { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:14px; }
  .swatch { border:1px solid var(--line); border-radius:10px; overflow:hidden; }
  .swatch .fill { height:64px; }
  .swatch .info { padding:9px 11px; }
  .swatch .tn { font:12px/1.3 var(--sans); word-break:break-all; }
  .swatch .tv { font:11px/1.3 var(--mono); color:var(--faint); }

  /* Variable rows */
  .vchip { width:16px; height:16px; border-radius:4px; border:1px solid var(--line2); flex:0 0 auto; }
  .vval { margin-left:auto; font-size:12px; color:var(--muted); white-space:nowrap; }
  .vval.mono { font-family:var(--mono); font-size:11px; }

  /* Variables / empty states */
  .empty { background:var(--panel); border:1px dashed var(--line2); border-radius:var(--radius); padding:26px; color:var(--muted); }
  .empty h4 { margin:0 0 8px; color:var(--fg); font-size:15px; }
  .empty ol { margin:12px 0 0; padding-left:20px; }
  .empty code { font:12px/1.5 var(--mono); background:#0c1019; padding:2px 6px; border-radius:5px; color:var(--accent2); }
  .badge-soft { display:inline-block; font:10px/1 var(--mono); color:var(--warn); background:#241d10; padding:4px 8px; border-radius:6px; margin-bottom:14px; }

  /* Changelog */
  .changelog h2 { font-size:15px; margin:22px 0 8px; }
  .changelog strong { color:var(--fg); }
  .changelog ul { margin:6px 0 14px; padding-left:18px; color:var(--muted); }
  .changelog li { margin:2px 0; }

  /* Actions */
  .actstatus { display:flex; flex-direction:column; gap:8px; }
  .srow { display:flex; justify-content:space-between; gap:16px; font-size:13px; }
  .srow span { color:var(--muted); }
  .srow b.ok { color:var(--ok); } .srow b.warn { color:var(--warn); }
  .actgrid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:12px; margin-bottom:14px; }
  .actbtn { all:unset; cursor:pointer; display:flex; flex-direction:column; gap:3px; background:var(--panel);
    border:1px solid var(--line2); border-radius:var(--radius); padding:15px 17px; transition:border-color .15s, background .15s; }
  .actbtn:hover { border-color:var(--accent); background:#161d2a; }
  .actbtn.primary { border-color:#2b3d63; background:#13203a; }
  .actbtn.primary:hover { border-color:var(--accent); }
  .actbtn[disabled] { opacity:.45; cursor:not-allowed; }
  .actbtn.running { border-color:var(--accent); animation:pulse 1s ease-in-out infinite; }
  @keyframes pulse { 50% { opacity:.6; } }
  .actbtn .al { font-weight:600; font-size:14px; }
  .actbtn .ad { color:var(--muted); font-size:12px; }
  .actlog { max-height:340px; overflow:auto; margin:0; font:11px/1.5 var(--mono); color:var(--muted); }
  .links { display:flex; flex-wrap:wrap; gap:16px; }
  .links a { font-size:13px; }
  .pill { display:inline-block; background:var(--line); border-radius:6px; padding:2px 8px; font:11px/1.4 var(--mono); color:var(--muted); }
  .muted { color:var(--muted); } .faint { color:var(--faint); }

  /* Component cards (health view) */
  .attn-toggle { display:inline-flex; align-items:center; gap:7px; color:var(--muted); font-size:12px; margin:-6px 0 14px; cursor:pointer; }
  .attn-toggle input { accent-color:var(--accent); }
  .cgrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:10px; }
  .ccard { display:flex; gap:12px; background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:11px; }
  .ccard:hover { border-color:var(--line2); }
  .cthumb { flex:0 0 88px; height:60px; border-radius:7px; background:#fff; border:1px solid var(--line2);
    display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .cthumb img { max-width:100%; max-height:100%; object-fit:contain; }
  .cthumb .cph { color:#9aa; font:600 20px/1 var(--sans); }
  .cmeta { min-width:0; flex:1; display:flex; flex-direction:column; gap:6px; }
  .ctop { display:flex; align-items:baseline; gap:8px; }
  .cnm { font-weight:600; font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .cvar { color:var(--faint); font:10px/1 var(--mono); flex:0 0 auto; }
  .cpills { display:flex; flex-wrap:wrap; gap:4px; }
  .hp { font:10px/1.4 var(--mono); padding:2px 6px; border-radius:5px; }
  .hp.on { color:var(--ok); background:#16241c; }
  .hp.off { color:var(--faint); background:#171c26; }
  .hp.warn { color:var(--warn); background:#241d10; }
  .clinks { display:flex; gap:14px; margin-top:auto; }
  .clinks a { font-size:11px; }

  /* Components toolbar (search + filters + view toggle) */
  .ctoolbar { display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-bottom:14px; }
  .ctoolbar .search { flex:1; min-width:200px; margin-bottom:0; }
  .seg { display:inline-flex; border:1px solid var(--line2); border-radius:9px; overflow:hidden; flex:0 0 auto; }
  .seg button { all:unset; cursor:pointer; padding:9px 14px; font-size:13px; color:var(--muted); }
  .seg button:hover { color:var(--fg); background:#161c28; }
  .seg button.active { background:#18202e; color:var(--fg); }
  .fsel { padding:10px 12px; background:var(--panel); border:1px solid var(--line2); border-radius:9px;
    color:var(--fg); font-size:13px; cursor:pointer; }
  .fsel:focus { outline:none; border-color:var(--accent); }
  .ctoolbar .attn-toggle { margin:0; }
  .ccount { margin-left:auto; font:11px/1 var(--mono); color:var(--faint); }

  /* Components table */
  .twrap { border:1px solid var(--line); border-radius:var(--radius); overflow:auto; background:var(--panel); }
  .ctable { width:100%; border-collapse:collapse; font-size:13px; }
  .ctable th { text-align:left; padding:10px 12px; border-bottom:1px solid var(--line2); color:var(--muted);
    font-size:11px; text-transform:uppercase; letter-spacing:.05em; white-space:nowrap; cursor:pointer;
    user-select:none; position:sticky; top:0; background:var(--panel2); z-index:1; }
  .ctable th.nosort { cursor:default; }
  .ctable th:not(.nosort):hover { color:var(--fg); }
  .ctable th .sar { color:var(--accent); font-size:9px; margin-left:4px; }
  .ctable td { padding:8px 12px; border-bottom:1px solid var(--line); vertical-align:middle; white-space:nowrap; }
  .ctable tr:last-child td { border-bottom:none; }
  .ctable tbody tr:hover td { background:#141b27; }
  .ctable .tthumb { width:54px; height:36px; border-radius:5px; background:#fff; border:1px solid var(--line2);
    display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .ctable .tthumb img { max-width:100%; max-height:100%; object-fit:contain; }
  .ctable .tthumb .cph { color:#9aa; font:600 14px/1 var(--sans); }
  .ctable .tnm { font-weight:600; }
  .ctable .tdesc { color:var(--faint); font-size:11px; max-width:320px; overflow:hidden; text-overflow:ellipsis; }
  .ctable .tlinks a { font-size:11px; margin-right:10px; }
  .tick { color:var(--ok); font-weight:600; } .cross { color:var(--faint); }
  .ctable tbody tr { cursor:pointer; }
  .ctable tbody tr.sel td { background:#17243b; }
  .ccard { cursor:pointer; }

  /* Assets gallery */
  .agrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(116px,1fr)); gap:10px; }
  .atile { all:unset; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:9px;
    background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:14px 10px; text-align:center; }
  .atile:hover { border-color:var(--accent); background:#161d2a; }
  .athumb { width:52px; height:52px; border-radius:8px; background:#fff; border:1px solid var(--line2);
    display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .athumb img { max-width:100%; max-height:100%; object-fit:contain; }
  .athumb .cph { color:#9aa; font:600 18px/1 var(--sans); }
  .aname { font-size:11px; color:var(--muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:100%; }

  /* Detail drawer */
  .drawer { position:fixed; inset:0; z-index:50; display:none; }
  .drawer.open { display:block; }
  .drawer-back { position:absolute; inset:0; background:rgba(4,7,12,.55); opacity:0; transition:opacity .18s; }
  .drawer.open .drawer-back { opacity:1; }
  .drawer-panel { position:absolute; top:0; right:0; height:100%; width:min(520px,92vw); background:var(--panel2);
    border-left:1px solid var(--line2); box-shadow:-18px 0 48px rgba(0,0,0,.4); overflow-y:auto;
    transform:translateX(100%); transition:transform .2s cubic-bezier(.4,0,.2,1); padding:0; }
  .drawer.open .drawer-panel { transform:translateX(0); }
  .dhead { position:sticky; top:0; background:var(--panel2); border-bottom:1px solid var(--line); padding:20px 24px 16px; z-index:1; }
  .dhead .dclose { all:unset; cursor:pointer; position:absolute; top:16px; right:18px; color:var(--muted);
    font-size:20px; line-height:1; width:30px; height:30px; display:flex; align-items:center; justify-content:center; border-radius:8px; }
  .dhead .dclose:hover { background:#1a2230; color:var(--fg); }
  .dhead .dpage { color:var(--faint); font:11px/1.4 var(--mono); margin-bottom:6px; }
  .dhead h2 { margin:0 0 10px; font-size:19px; letter-spacing:-.2px; padding-right:36px; }
  .dhead .cpills { gap:5px; }
  .dbody { padding:18px 24px 40px; display:flex; flex-direction:column; gap:22px; }
  .dsec h4 { margin:0 0 9px; font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); }
  .ddesc { color:var(--fg); font-size:13px; line-height:1.6; }
  .ddesc.none { color:var(--faint); font-style:italic; }
  .axes { display:flex; flex-direction:column; gap:11px; }
  .axis .an { font:11px/1.4 var(--mono); color:var(--accent); margin-bottom:5px; }
  .axis .av { display:flex; flex-wrap:wrap; gap:5px; }
  .achip { font:11px/1.4 var(--sans); background:#1a2230; border:1px solid var(--line2); color:var(--fg);
    padding:3px 9px; border-radius:6px; }
  .achip.empty { color:var(--faint); font-style:italic; }
  .vnames { display:flex; flex-wrap:wrap; gap:5px; max-height:168px; overflow:auto; }
  .vname { font:10px/1.4 var(--mono); background:#141a25; border:1px solid var(--line); color:var(--muted); padding:3px 7px; border-radius:5px; }
  .dlinks { display:flex; flex-wrap:wrap; gap:14px; }
  .dlinks a { font-size:13px; }

  /* Nested components */
  .nlist { display:flex; flex-direction:column; gap:6px; }
  .nrow { display:flex; align-items:center; gap:8px; background:#141a25; border:1px solid var(--line); border-radius:7px; padding:6px 10px; }
  .nrow .nname { font-size:13px; color:var(--fg); }
  .nrow a.nname { cursor:pointer; color:var(--accent2); text-decoration:none; }
  .nrow a.nname:hover { text-decoration:underline; }
  .nrow .ncount { font:10px/1 var(--mono); color:var(--muted); background:#0c1019; border:1px solid var(--line); padding:2px 6px; border-radius:5px; }
  .nrow .nvia { font:10px/1.4 var(--mono); color:var(--faint); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .nrow .next { font:9px/1.4 var(--sans); text-transform:uppercase; letter-spacing:.05em; color:var(--faint); border:1px solid var(--line2); padding:2px 5px; border-radius:4px; }
  .nrow .nfig { margin-left:auto; font-size:12px; flex:none; }

  /* Rendered doc markdown */
  .doc { font-size:13px; line-height:1.65; color:var(--fg); }
  .doc h3 { font-size:14px; margin:18px 0 8px; color:var(--fg); }
  .doc h4 { font-size:12px; margin:14px 0 6px; color:var(--muted); text-transform:none; letter-spacing:0; }
  .doc p { margin:8px 0; color:var(--muted); }
  .doc ul { margin:8px 0; padding-left:18px; color:var(--muted); }
  .doc li { margin:3px 0; }
  .doc code { font:11px/1.5 var(--mono); background:#0c1019; padding:1px 5px; border-radius:4px; color:var(--accent2); }
  .doc strong { color:var(--fg); }
  .doc table.dtable { width:100%; border-collapse:collapse; margin:10px 0; font-size:12px; }
  .doc .dtable th, .doc .dtable td { text-align:left; padding:6px 9px; border:1px solid var(--line); vertical-align:top; }
  .doc .dtable th { background:var(--panel); color:var(--muted); font-weight:600; }
  .doc .dtable td { color:var(--muted); }
  .doc .docnote { color:var(--faint); font-style:italic; }

  @media (max-width:760px){ body{flex-direction:column} aside{width:auto;flex:none;height:auto;position:static;flex-direction:row;flex-wrap:wrap} main{padding:20px} }
</style>
</head>
<body>
<aside>
  <div class="brand"><div class="dot"></div><div><b>4Shipper DS</b><span id="brandsub">design system</span></div></div>
  <nav class="side" id="nav"></nav>
  <div class="side-foot" id="foot"></div>
</aside>
<main>
  <div class="topline" id="topline"></div>
  <h1 class="view-title" id="vtitle"></h1>
  <p class="sub" id="vsub"></p>
  <div id="view"></div>
</main>
<div id="drawer" class="drawer" aria-hidden="true">
  <div class="drawer-back" id="drawerback"></div>
  <aside class="drawer-panel" id="drawerpanel" role="dialog" aria-modal="true"></aside>
</div>
<script id="model" type="application/json">${json}</script>
<script>
const M = JSON.parse(document.getElementById('model').textContent);
const esc = (s) => String(s ?? '').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

// Flat component list + derived facets for the Components table/cards views.
const COMP_MAIN = (M.components.groups||[]).flatMap(g => g.items);
const COMP_ASSETS = M.components.assets || [];
// COMP_ALL indexes both so the detail drawer (keyed by _i) works for components and assets alike.
const COMP_ALL = COMP_MAIN.concat(COMP_ASSETS);
COMP_ALL.forEach((it,i)=>{ it._i=i; });
const COMP_PAGES = [...new Set(COMP_MAIN.map(it => it.page || 'Other'))].sort((a,b)=>a.localeCompare(b));
const compState = { view:'table', q:'', page:'all', kind:'all', attn:false, sort:'name', dir:1 };
const assetState = { q:'' };

document.getElementById('brandsub').textContent = (M.uiKit.name || 'design system');
document.getElementById('topline').textContent =
  (M.uiKit.name || 'UI Kit') + '  ·  v' + (M.uiKit.version || '?');
document.getElementById('foot').innerHTML =
  'Synced ' + new Date(M.generatedAt).toLocaleString() + '<br>via Figma REST API';

// ---- Sections ----
const SECTIONS = [
  { id:'overview',   title:'Overview',   sub:'Current state of the 4Shipper design system.', count:null, render:overview },
  { id:'actions',    title:'Actions',    sub:'Refresh data and publish — no terminal needed.', count:null, render:actions },
  { id:'components', title:'Components',  sub:M.components.meaningful+' components ('+M.components.sets+' sets · '+M.components.standalone+' standalone), grouped by Figma page.', count:M.counts.meaningful, render:components },
  { id:'assets',     title:'Assets',      sub:M.counts.assets+' icons, logos, flags & illustrations from the '+(M.components.assetsPage||'Assets')+' page.', count:M.counts.assets, render:assetsView },
  { id:'typography', title:'Typography',  sub:M.counts.typography+' text styles with live previews.', count:M.counts.typography, render:typography },
  { id:'shadows',    title:'Shadows',     sub:M.counts.shadows+' effect styles.', count:M.counts.shadows, render:shadows },
  { id:'colors',     title:'Colors',      sub:M.counts.colors+' color tokens.', count:M.counts.colors, render:colors },
  { id:'variables',  title:'Variables',   sub:M.counts.variables+' design tokens (color, spacing, sizing, typography).', count:M.counts.variables, render:variables },
  { id:'pages',      title:'Pages',       sub:M.counts.pages+' pages · '+M.counts.screens+' screens in the design file.', count:M.counts.pages, render:pages },
  { id:'changelog',  title:'Changelog',   sub:'Recorded library changes over time.', count:null, render:changelog },
];

document.getElementById('nav').innerHTML = SECTIONS.map((s,i) =>
  '<button data-i="'+i+'" class="'+(i===0?'active':'')+'">'+esc(s.title)+
  (s.count!=null?'<span class="cnt">'+s.count+'</span>':'')+'</button>').join('');
document.querySelectorAll('#nav button').forEach(b => b.onclick = () => show(+b.dataset.i));

function show(i){
  document.querySelectorAll('#nav button').forEach((b,j)=>b.classList.toggle('active',i===j));
  const s = SECTIONS[i];
  document.getElementById('vtitle').textContent = s.title;
  document.getElementById('vsub').textContent = s.sub;
  document.getElementById('view').innerHTML = s.render();
  bindGroups();
  if (s.id==='components') initComponents();
  if (s.id==='assets') initAssets();
  if (s.id==='actions') initActions();
  if (location.hash !== '#'+s.id) history.replaceState(null,'','#'+s.id);
}

function statCards(list){
  return '<div class="stats">'+list.map(([n,l,h])=>
    '<div class="stat"><div class="n">'+n+'</div><div class="l">'+esc(l)+'</div>'+
    (h?'<div class="hint">'+esc(h)+'</div>':'')+'</div>').join('')+'</div>';
}

function overview(){
  const c=M.counts;
  let html = statCards([
    [c.meaningful,'Components', c.sets+' sets · '+c.standalone+' standalone'],
    [c.assets,'Assets','icons · logos · illustrations'],
    [c.variants,'Total variants','published in library'],
    [c.typography+c.shadows+c.colors,'Style tokens', c.typography+' type · '+c.shadows+' shadow'],
    [c.variables||'—','Variables', c.variables?'':'Enterprise-gated'],
    [c.pages,'Design pages', c.screens+' screens'],
  ]);
  // latest changelog entry preview
  const m = M.changelog.match(/##\\s.+?(?=\\n##\\s|$)/s);
  html += '<div class="card"><h3>Latest change</h3>'+(m?mdToHtml(m[0]):'<span class="muted">No changes recorded yet.</span>')+'</div>';
  return html;
}

const LINKS = {
  uiKit:'https://www.figma.com/design/XVou4XJ4rWbt4oXoSxO7hO',
  design:'https://www.figma.com/design/Xol48qmGXL8hIqA42jbHno',
  repo:'https://github.com/snqzox/4shipper-design',
  live:'https://snqzox.github.io/4shipper-design/'
};
function isLocal(){ return ['localhost','127.0.0.1'].includes(location.hostname); }

function actions(){
  const links='<div class="card"><h3>Links</h3><div class="links">'+
    '<a href="'+LINKS.uiKit+'" target="_blank">UI Kit ↗</a>'+
    '<a href="'+LINKS.design+'" target="_blank">4Shipper Design ↗</a>'+
    '<a href="'+LINKS.repo+'" target="_blank">GitHub repo ↗</a>'+
    '<a href="'+LINKS.live+'" target="_blank">Live dashboard ↗</a></div></div>';
  if(!isLocal()){
    return '<div class="empty"><h4>Open the control panel locally to use actions</h4>'+
      '<p class="muted">This is the published, read-only dashboard. To refresh data and publish with buttons:</p>'+
      '<ol><li>Double-click <code>4shipper-design.command</code> in the project folder (or run <code>npm run serve</code>).</li>'+
      '<li>Your browser opens <code>http://localhost:4178</code> with these actions enabled.</li></ol></div>'+links;
  }
  const btn=(a,l,d,c)=>'<button class="actbtn '+(c||'')+'" onclick="runAction(\\''+a+'\\',this)"><span class="al">'+l+'</span><span class="ad">'+d+'</span></button>';
  return '<div id="actstatus" class="card actstatus">Loading status…</div>'+
    '<div class="actgrid">'+
      btn('sync','↻ Refresh all','Pull components, styles & pages, then rebuild')+
      btn('variables','🎨 Refresh variables','From Figma desktop (Dev Mode MCP must be on)')+
      btn('dashboard','⟳ Rebuild dashboard','Regenerate from current data')+
      btn('publish','▲ Publish to GitHub','Commit & push → updates the live site','primary')+
    '</div>'+
    '<div class="card"><h3>Output</h3><pre id="actlog" class="actlog">Idle. Pick an action above.</pre></div>'+
    links;
}

async function initActions(){
  const el=document.getElementById('actstatus'); if(!el) return;
  try{
    const s=await (await fetch('/api/status',{headers:{'x-ds-control':'1'}})).json();
    const when=s.generatedAt?new Date(s.generatedAt).toLocaleString():'—';
    const refreshed=s.refreshedAt?new Date(s.refreshedAt).toLocaleString():'—';
    const dirty=s.git&&s.git.dirty;
    el.innerHTML=
      '<div class="srow"><span>Last change</span><b>'+esc(when)+'</b></div>'+
      '<div class="srow"><span>Last refreshed</span><b>'+esc(refreshed)+'</b></div>'+
      '<div class="srow"><span>Components · Variables · Colors</span><b>'+s.components+' · '+s.variables+' · '+s.colors+'</b></div>'+
      '<div class="srow"><span>Uncommitted changes</span><b class="'+(dirty?'warn':'ok')+'">'+(dirty?(s.git.changes+' files — Publish to deploy'):'none — up to date')+'</b></div>';
  }catch(e){ el.textContent='Status unavailable ('+e.message+'). Is the control panel running (npm run serve)?'; }
}

async function runAction(action,btn){
  const log=document.getElementById('actlog');
  document.querySelectorAll('.actbtn').forEach(b=>{ b.disabled=true; });
  btn.classList.add('running');
  log.textContent='▶ '+action+' — running…\\n';
  try{
    const r=await fetch('/api/run',{method:'POST',headers:{'content-type':'application/json','x-ds-control':'1'},body:JSON.stringify({action})});
    const j=await r.json();
    log.textContent=(j.output||'(no output)').trim();
    if(j.ok){
      log.textContent+='\\n\\n✓ Done.';
      if(action!=='publish'){ log.textContent+=' Reloading with fresh data…'; setTimeout(()=>location.reload(),1400); return; }
    } else { log.textContent+='\\n\\n✗ Failed — see output above.'; }
  }catch(e){ log.textContent='✗ '+e.message; }
  document.querySelectorAll('.actbtn').forEach(b=>{ b.disabled=false; });
  btn.classList.remove('running');
  initActions();
}

function ccard(it){
  const pill=(on,label)=>'<span class="hp '+(on?'on':'off')+'">'+label+'</span>';
  const thumb = it.thumb
    ? '<div class="cthumb"><img loading="lazy" src="'+esc(it.thumb)+'" alt=""></div>'
    : '<div class="cthumb"><span class="cph">'+esc((it.name[0]||'?').toUpperCase())+'</span></div>';
  const links='<div class="clinks">'+
    (it.figmaUrl?'<a href="'+esc(it.figmaUrl)+'" target="_blank">Figma ↗</a>':'')+
    (it.docUrl?'<a href="'+esc(it.docUrl)+'" target="_blank">Doc ↗</a>':'<span class="faint">no doc</span>')+'</div>';
  return '<div class="ccard citem" data-id="'+it._i+'" data-attn="'+(it.needsAttention?1:0)+'" data-n="'+esc((it.name+' '+(it.description||'')).toLowerCase())+'">'+
    thumb+
    '<div class="cmeta">'+
      '<div class="ctop"><span class="cnm">'+esc(it.name)+'</span><span class="cvar">'+(it.kind==='set'?it.variants+' var':'comp')+'</span></div>'+
      '<div class="cpills">'+pill(it.hasDoc,'doc')+pill(it.hasDescription,'desc')+pill(it.hasShowcase,'showcase')+(it.stale?'<span class="hp warn">stale</span>':'')+'</div>'+
      links+
    '</div></div>';
}

function components(){
  const h=M.components.health;
  let html=statCards([
    [h.documented+'/'+h.total,'Documented','have a markdown doc'],
    [h.described+'/'+h.total,'Figma described','have a component description'],
    [h.showcased,'Showcased','have a 📖 Docs page'],
    [(h.stale||0),'Stale', h.stale?'flagged by last sync':'all fresh'],
  ]);
  const pageOpts=COMP_PAGES.map(p=>'<option value="'+esc(p)+'">'+esc(p)+'</option>').join('');
  html+='<div class="ctoolbar">'+
    '<div class="seg" id="compview"><button data-v="table">▦ Table</button><button data-v="cards">▤ Cards</button></div>'+
    '<input class="search" id="compsearch" placeholder="Filter by name or description…">'+
    '<select class="fsel" id="comppage"><option value="all">All pages</option>'+pageOpts+'</select>'+
    '<select class="fsel" id="compkind"><option value="all">All kinds</option><option value="set">Sets</option><option value="component">Components</option></select>'+
    '<label class="attn-toggle"><input type="checkbox" id="compattn"> Needs attention ('+h.needsAttention+')</label>'+
    '<span class="ccount" id="compcount"></span>'+
  '</div>'+
  '<div id="compbody"></div>';
  return html;
}

// ---- Components table/cards: filtering, sorting, rendering ----
function filteredComponents(){
  const s=compState, q=s.q.toLowerCase();
  return COMP_MAIN.filter(it=>{
    if(q && !((it.name+' '+(it.description||'')).toLowerCase().includes(q))) return false;
    if(s.page!=='all' && (it.page||'Other')!==s.page) return false;
    if(s.kind!=='all' && it.kind!==s.kind) return false;
    if(s.attn && !it.needsAttention) return false;
    return true;
  });
}
const COMP_SORT={
  name:it=>it.name.toLowerCase(),
  page:it=>(it.page||'').toLowerCase(),
  kind:it=>it.kind,
  variants:it=>it.kind==='set'?(it.variants||0):-1,
  desc:it=>it.hasDescription?1:0,
  doc:it=>it.hasDoc?1:0,
  showcase:it=>it.hasShowcase?1:0,
  stale:it=>it.stale?1:0,
};
function sortComponents(items){
  const f=COMP_SORT[compState.sort]||COMP_SORT.name, d=compState.dir;
  return items.slice().sort((a,b)=>{
    const va=f(a),vb=f(b);
    if(va<vb)return -d; if(va>vb)return d;
    return a.name.localeCompare(b.name);
  });
}
const COMP_COLS=[
  {k:'name',label:'Component',tip:'Component or component-set name. Click a row for full detail'},
  {k:'page',label:'Page',tip:'Figma page the component lives on'},
  {k:'kind',label:'Kind',tip:'Set = has variants · comp = standalone component'},
  {k:'variants',label:'Variants',tip:'Number of variants in the set'},
  {k:'desc',label:'Desc',tip:'Has a component description written in Figma'},
  {k:'doc',label:'Doc',tip:'Has a Markdown doc in the repo (docs/design-system/components)'},
  {k:'showcase',label:'Showcase',tip:'Has a 📖 Docs showcase page in the Figma UI Kit'},
  {k:'stale',label:'Stale',tip:'Doc may be out of date — flagged by the last sync'},
];
function compTable(items){
  const s=compState, yes='<span class="tick">✓</span>', no='<span class="cross">✗</span>';
  const head='<tr><th class="nosort" title="Component preview"></th>'+COMP_COLS.map(c=>
    '<th data-k="'+c.k+'" title="'+esc(c.tip)+' · Click to sort">'+esc(c.label)+(s.sort===c.k?'<span class="sar">'+(s.dir>0?'▲':'▼')+'</span>':'')+'</th>'
  ).join('')+'<th class="nosort" title="Open in Figma · Doc on GitHub">Links</th></tr>';
  const rows=items.map(it=>{
    const thumb=it.thumb
      ? '<div class="tthumb"><img loading="lazy" src="'+esc(it.thumb)+'" alt=""></div>'
      : '<div class="tthumb"><span class="cph">'+esc((it.name[0]||'?').toUpperCase())+'</span></div>';
    const links=(it.figmaUrl?'<a href="'+esc(it.figmaUrl)+'" target="_blank">Figma ↗</a>':'')+
      (it.docUrl?'<a href="'+esc(it.docUrl)+'" target="_blank">Doc ↗</a>':'');
    return '<tr data-id="'+it._i+'">'+
      '<td>'+thumb+'</td>'+
      '<td><div class="tnm">'+esc(it.name)+'</div>'+(it.description?'<div class="tdesc">'+esc(it.description)+'</div>':'')+'</td>'+
      '<td class="muted">'+esc(it.page||'—')+'</td>'+
      '<td>'+(it.kind==='set'?'<span class="tag set">set</span>':'<span class="tag comp">comp</span>')+'</td>'+
      '<td class="muted">'+(it.kind==='set'?it.variants:'—')+'</td>'+
      '<td>'+(it.hasDescription?yes:no)+'</td>'+
      '<td>'+(it.hasDoc?yes:no)+'</td>'+
      '<td>'+(it.hasShowcase?yes:no)+'</td>'+
      '<td>'+(it.stale?'<span class="hp warn">stale</span>':no)+'</td>'+
      '<td class="tlinks">'+(links||'<span class="faint">—</span>')+'</td>'+
    '</tr>';
  }).join('');
  return '<div class="twrap"><table class="ctable"><thead>'+head+'</thead><tbody>'+
    (rows||'<tr><td colspan="11" class="muted" style="padding:24px;text-align:center">No components match.</td></tr>')+
    '</tbody></table></div>';
}
function compCards(items){
  if(!items.length) return '<div class="empty">No components match.</div>';
  const groups={};
  for(const it of items){ (groups[it.page||'Other'] ||= []).push(it); }
  const list=Object.entries(groups).map(([page,its])=>({page,its})).sort((a,b)=>b.its.length-a.its.length);
  const openAll=items.length<=40;
  return list.map((g,gi)=>groupBlock(g.page, g.its.length, openAll||gi<2,
    '<div class="cgrid">'+g.its.map(ccard).join('')+'</div>'
  )).join('');
}
function renderComponents(){
  const items=sortComponents(filteredComponents());
  const cnt=document.getElementById('compcount');
  if(cnt) cnt.textContent=items.length+' / '+COMP_MAIN.length;
  const body=document.getElementById('compbody'); if(!body) return;
  body.innerHTML = compState.view==='table' ? compTable(items) : compCards(items);
  if(compState.view==='table'){
    body.querySelectorAll('th[data-k]').forEach(th=>th.onclick=()=>{
      const k=th.dataset.k;
      if(compState.sort===k){ compState.dir*=-1; }
      else { compState.sort=k; compState.dir=['name','page','kind'].includes(k)?1:-1; }
      renderComponents();
    });
  } else {
    body.querySelectorAll('.group .ghead').forEach(h=>h.onclick=()=>h.parentElement.classList.toggle('open'));
  }
  body.querySelectorAll('[data-id]').forEach(el=>el.onclick=ev=>{
    if(ev.target.closest('a')) return;
    openDetail(+el.dataset.id);
  });
}
function initComponents(){
  const seg=document.getElementById('compview'); if(!seg) return;
  seg.querySelectorAll('button').forEach(b=>{
    b.classList.toggle('active', b.dataset.v===compState.view);
    b.onclick=()=>{ compState.view=b.dataset.v;
      seg.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b)); renderComponents(); };
  });
  const q=document.getElementById('compsearch'); q.value=compState.q; q.oninput=()=>{ compState.q=q.value; renderComponents(); };
  const pg=document.getElementById('comppage'); pg.value=compState.page; pg.onchange=()=>{ compState.page=pg.value; renderComponents(); };
  const kd=document.getElementById('compkind'); kd.value=compState.kind; kd.onchange=()=>{ compState.kind=kd.value; renderComponents(); };
  const at=document.getElementById('compattn'); at.checked=compState.attn; at.onchange=()=>{ compState.attn=at.checked; renderComponents(); };
  renderComponents();
}

// ---- Assets gallery (icons, logos, flags, illustrations) ----
function assetsView(){
  return '<div class="ctoolbar">'+
      '<input class="search" id="assetsearch" placeholder="Filter assets by name…">'+
      '<span class="ccount" id="assetcount"></span>'+
    '</div>'+
    '<div id="assetgrid" class="agrid"></div>';
}
function assetTile(it){
  const shortName=it.name.replace(/^icon\\//,'');
  const thumb=it.thumb
    ? '<div class="athumb"><img loading="lazy" src="'+esc(it.thumb)+'" alt=""></div>'
    : '<div class="athumb"><span class="cph">'+esc((shortName[0]||'?').toUpperCase())+'</span></div>';
  return '<button class="atile" data-id="'+it._i+'" data-n="'+esc(it.name.toLowerCase())+'" title="'+esc(it.name)+'">'+
    thumb+'<span class="aname">'+esc(shortName)+'</span></button>';
}
function renderAssets(){
  const q=assetState.q.toLowerCase();
  const items=COMP_ASSETS.filter(it=>!q || it.name.toLowerCase().includes(q));
  const grid=document.getElementById('assetgrid'); if(!grid) return;
  grid.innerHTML = items.length ? items.map(assetTile).join('') : '<div class="empty">No assets match.</div>';
  const cnt=document.getElementById('assetcount'); if(cnt) cnt.textContent=items.length+' / '+COMP_ASSETS.length;
  grid.querySelectorAll('[data-id]').forEach(el=>el.onclick=()=>openDetail(+el.dataset.id));
}
function initAssets(){
  const q=document.getElementById('assetsearch'); if(!q) return;
  q.value=assetState.q; q.oninput=()=>{ assetState.q=q.value; renderAssets(); };
  renderAssets();
}

// ---- Component detail drawer ----
function detailPanel(it){
  const pill=(on,label)=>'<span class="hp '+(on?'on':'off')+'">'+label+'</span>';
  const kindTag = it.kind==='set'
    ? '<span class="tag set">set · '+it.variants+' var</span>'
    : '<span class="tag comp">component</span>';
  const headPills='<div class="cpills">'+kindTag+pill(it.hasDoc,'doc')+pill(it.hasDescription,'desc')+
    pill(it.hasShowcase,'showcase')+(it.stale?'<span class="hp warn">stale</span>':'')+'</div>';

  let body='<div class="dsec"><h4>Description</h4>'+
    (it.hasDescription?'<div class="ddesc">'+esc(it.description)+'</div>':'<div class="ddesc none">No Figma description.</div>')+'</div>';

  if(it.kind==='set' && (it.properties||[]).length){
    body+='<div class="dsec"><h4>Properties</h4><div class="axes">'+
      it.properties.map(ax=>'<div class="axis"><div class="an">'+esc(ax.axis)+'</div><div class="av">'+
        ax.values.map(v=>'<span class="achip'+(v===''?' empty':'')+'">'+(v===''?'(empty)':esc(v))+'</span>').join('')+
      '</div></div>').join('')+'</div></div>';
  }
  if(it.kind==='set' && (it.variantNames||[]).length){
    body+='<div class="dsec"><h4>Variants ('+it.variantNames.length+')</h4><div class="vnames">'+
      it.variantNames.map(n=>'<span class="vname">'+esc(n)+'</span>').join('')+'</div></div>';
  }
  if((it.nested||[]).length){
    const rows=it.nested.map(n=>{
      const figUrl=n.nodeId?'https://www.figma.com/design/'+(M.uiKit.key||'')+'/?node-id='+n.nodeId.replace(/:/g,'-'):null;
      const nameHtml=n.resolved
        ? '<a class="nname nlink" data-nnode="'+esc(n.nodeId||'')+'" data-nname="'+encodeURIComponent(n.name)+'">'+esc(n.name)+'</a>'
        : '<span class="nname">'+esc(n.name)+'</span>';
      const cnt=n.count>1?'<span class="ncount">×'+n.count+'</span>':'';
      const tag=n.resolved?'':'<span class="next">'+(String(n.name).charAt(0)==='_'?'private':'external')+'</span>';
      const via=n.viaVariant?'<span class="nvia">'+esc(n.viaVariant)+'</span>':'';
      const fig=figUrl?'<a class="nfig" href="'+esc(figUrl)+'" target="_blank">Figma ↗</a>':'';
      return '<div class="nrow">'+nameHtml+cnt+tag+via+fig+'</div>';
    }).join('');
    body+='<div class="dsec"><h4>Nested components ('+it.nested.length+')</h4><div class="nlist">'+rows+'</div></div>';
  }
  if((it.usedBy||[]).length){
    const rows=it.usedBy.map(u=>{
      const figUrl=u.nodeId?'https://www.figma.com/design/'+(M.uiKit.key||'')+'/?node-id='+u.nodeId.replace(/:/g,'-'):null;
      const cnt=u.count>1?'<span class="ncount">×'+u.count+'</span>':'';
      const fig=figUrl?'<a class="nfig" href="'+esc(figUrl)+'" target="_blank">Figma ↗</a>':'';
      return '<div class="nrow"><a class="nname nlink" data-nnode="'+esc(u.nodeId||'')+'" data-nname="'+encodeURIComponent(u.name)+'">'+esc(u.name)+'</a>'+cnt+fig+'</div>';
    }).join('');
    body+='<div class="dsec"><h4>Used in ('+it.usedBy.length+')</h4><div class="nlist">'+rows+'</div></div>';
  }
  if(it.docContent){
    body+='<div class="dsec"><h4>Documentation</h4><div class="doc">'+mdDoc(it.docContent)+'</div></div>';
  }
  const links=[];
  if(it.figmaUrl) links.push('<a href="'+esc(it.figmaUrl)+'" target="_blank">Open in Figma ↗</a>');
  if(it.docUrl) links.push('<a href="'+esc(it.docUrl)+'" target="_blank">Doc on GitHub ↗</a>');
  if(links.length) body+='<div class="dsec"><h4>Links</h4><div class="dlinks">'+links.join('')+'</div></div>';

  return '<div class="dhead"><button class="dclose" aria-label="Close">×</button>'+
    '<div class="dpage">'+esc(it.page||'—')+'</div><h2>'+esc(it.name)+'</h2>'+headPills+'</div>'+
    '<div class="dbody">'+body+'</div>';
}
function openDetail(i){
  const it=COMP_ALL[i]; if(!it) return;
  const panel=document.getElementById('drawerpanel');
  panel.innerHTML=detailPanel(it);
  const dr=document.getElementById('drawer');
  dr.classList.add('open'); dr.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden'; panel.scrollTop=0;
  panel.querySelector('.dclose').onclick=closeDetail;
  // Clicking a nested / used-in component jumps the drawer to that component's detail.
  // Match by nodeId first (exact — names can collide), fall back to name.
  panel.querySelectorAll('.nlink').forEach(a=>a.onclick=()=>{
    const node=a.dataset.nnode||'';
    const name=decodeURIComponent(a.dataset.nname||'');
    let j=node?COMP_ALL.findIndex(c=>c.nodeId===node):-1;
    if(j<0) j=COMP_ALL.findIndex(c=>c.name===name);
    if(j>=0) openDetail(j);
  });
  document.querySelectorAll('.ctable tbody tr.sel').forEach(r=>r.classList.remove('sel'));
  const row=document.querySelector('.ctable tbody tr[data-id="'+i+'"]'); if(row) row.classList.add('sel');
}
function closeDetail(){
  const dr=document.getElementById('drawer');
  dr.classList.remove('open'); dr.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  document.querySelectorAll('.ctable tbody tr.sel').forEach(r=>r.classList.remove('sel'));
}
document.getElementById('drawerback').onclick=closeDetail;
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeDetail(); });

// Minimal Markdown → HTML for the doc preview (headings, lists, tables, bold, inline code).
function dsplitRow(ln){ return ln.trim().replace(/^\\||\\|$/g,'').split('|').map(s=>s.trim()); }
function dinline(s){ return esc(s).replace(/\`([^\`]+)\`/g,'<code>$1</code>').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>'); }
function mdDoc(md){
  const lines=String(md).split('\\n'); const out=[]; let i=0; let inList=false;
  const closeList=()=>{ if(inList){ out.push('</ul>'); inList=false; } };
  while(i<lines.length){
    const ln=lines[i];
    if(/^\\s*\\|/.test(ln) && i+1<lines.length && /^[\\s|:-]*-[\\s|:-]*$/.test(lines[i+1])){
      closeList();
      const header=dsplitRow(ln); i+=2; const rows=[];
      while(i<lines.length && /^\\s*\\|/.test(lines[i])){ rows.push(dsplitRow(lines[i])); i++; }
      out.push('<table class="dtable"><thead><tr>'+header.map(h=>'<th>'+dinline(h)+'</th>').join('')+
        '</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+dinline(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table>');
      continue;
    }
    if(/^###\\s/.test(ln)){ closeList(); out.push('<h4>'+dinline(ln.replace(/^###\\s/,''))+'</h4>'); i++; continue; }
    if(/^##\\s/.test(ln)){ closeList(); out.push('<h3>'+dinline(ln.replace(/^##\\s/,''))+'</h3>'); i++; continue; }
    if(/^#\\s/.test(ln)){ i++; continue; }
    if(/^[-*]\\s/.test(ln)){ if(!inList){ out.push('<ul>'); inList=true; } out.push('<li>'+dinline(ln.replace(/^[-*]\\s/,''))+'</li>'); i++; continue; }
    if(!ln.trim()){ closeList(); i++; continue; }
    closeList(); out.push('<p>'+dinline(ln)+'</p>'); i++;
  }
  closeList();
  return out.join('');
}

function typography(){
  if(!M.tokens.typography.length) return '<div class="empty">No text styles found.</div>';
  return '<div class="card">'+M.tokens.typography.map(t=>{
    const px=(t.fontSize||16);
    const style='font-family:'+(t.fontFamily?("'"+t.fontFamily+"',"):"")+'sans-serif;font-weight:'+(t.fontWeight||400)+
      ';font-size:'+Math.min(px,30)+'px;line-height:1.2;'+(t.textCase==='UPPER'?'text-transform:uppercase;':'');
    return '<div class="typ"><div class="prev" style="'+style+'">'+esc(t.name)+'</div>'+
      '<div class="meta"><div class="tn">'+esc(t.name)+'</div>'+
      '<div class="tv">'+esc(t.fontFamily||'?')+' · '+(t.fontWeight||'')+' · '+(t.fontSize||'?')+'/'+(t.lineHeight||'?')+'</div></div></div>';
  }).join('')+'</div>';
}

function shadows(){
  if(!M.tokens.shadows.length) return '<div class="empty">No effect styles found.</div>';
  return '<div class="shadows">'+M.tokens.shadows.map(s=>
    '<div class="shadow-card"><div class="shadow-swatch" style="box-shadow:'+esc(s.css||'none')+'"></div>'+
    '<div class="tn">'+esc(s.name)+'</div><div class="tv">'+esc(s.css||'—')+'</div></div>').join('')+'</div>';
}

function groupByPrefix(items, key){
  const m={};
  for(const it of items){ const g=(it[key]||'').includes('/')?it[key].split('/')[0]:'other'; (m[g]||=[]).push(it); }
  return Object.entries(m).map(([name,list])=>({name,items:list})).sort((a,b)=>b.items.length-a.items.length);
}

function colors(){
  if(!M.tokens.colors.length) return '<div class="empty"><h4>No color tokens found</h4>'+
    'Colors are defined as Figma Variables — pull them with <code>npm run variables:desktop</code>.</div>';
  const groups=groupByPrefix(M.tokens.colors,'name');
  return '<input class="search" id="csearch" placeholder="Filter colors…">'+
    groups.map((g,i)=>groupBlock(g.name, g.items.length, i<3,
      '<div class="colors">'+g.items.map(c=>
        '<div class="swatch citem" data-n="'+esc(c.name.toLowerCase())+'"><div class="fill" style="background:'+esc(c.hex||'#000')+'"></div>'+
        '<div class="info"><div class="tn">'+esc(c.name)+'</div><div class="tv">'+esc(c.hex||'')+'</div></div></div>').join('')+'</div>'
    )).join('');
}

function variables(){
  const v=M.tokens.variables;
  if(v && v.available && (v.groups||[]).length){
    return '<input class="search" id="vsearch" placeholder="Filter variables…">'+
      v.groups.map((g,i)=>groupBlock(g.name, g.items.length, i<2,
        g.items.map(it=>'<div class="row vitem" data-n="'+esc(it.name.toLowerCase())+'">'+
          (it.kind==='color'?'<span class="vchip" style="background:'+esc(it.value)+'"></span>':'')+
          '<span class="nm">'+esc(it.name)+'</span>'+
          '<span class="vval '+(it.kind==='color'?'mono':'')+'">'+esc(it.value)+'</span></div>').join('')
      )).join('');
  }
  return '<div class="empty"><span class="badge-soft">UNAVAILABLE ON CURRENT PLAN</span>'+
    '<h4>Variables aren\\'t exposed by the REST API here</h4>'+
    '<p class="muted">'+esc(v?.reason||'The Figma Variables REST endpoint requires an Enterprise plan.')+'</p>'+
    '<p class="muted">Pull them via the desktop Dev Mode MCP instead: open the UI Kit in Figma desktop and run <code>npm run variables:desktop</code>.</p></div>';
}

function pages(){
  if(!M.design.pages.length) return '<div class="empty">No pages found.</div>';
  let html = '<input class="search" id="psearch" placeholder="Filter screens…">';
  html += M.design.pages.map((p,i)=>groupBlock(p.name, (p.screens||[]).length, false,
    (p.screens||[]).map(s=>'<div class="row sitem" data-n="'+esc(s.name.toLowerCase())+'"><span class="nm">'+esc(s.name)+'</span><span class="tag scr">'+esc(s.type)+'</span></div>').join('')
      || '<div class="row faint">No top-level frames.</div>'
  )).join('');
  return html;
}

function changelog(){ return '<div class="changelog card">'+mdToHtml(M.changelog)+'</div>'; }

// ---- helpers ----
function groupBlock(name, count, open, bodyHtml){
  return '<div class="group'+(open?' open':'')+'"><button class="ghead"><span class="chev">▶</span>'+
    '<span class="gname">'+esc(name)+'</span><span class="gcount">'+count+'</span></button>'+
    '<div class="gbody">'+bodyHtml+'</div></div>';
}
function bindGroups(){
  document.querySelectorAll('.group .ghead').forEach(h=> h.onclick=()=>h.parentElement.classList.toggle('open'));
  const cs=document.getElementById('csearch'); if(cs) cs.oninput=()=>filter(cs,'.citem');
  const ps=document.getElementById('psearch'); if(ps) ps.oninput=()=>filter(ps,'.sitem');
  const vs=document.getElementById('vsearch'); if(vs) vs.oninput=()=>filter(vs,'.vitem');
  const attn=document.getElementById('attnonly'); if(attn&&cs) attn.onchange=()=>filter(cs,'.citem');
}
function filter(input, sel){
  const q=(input?input.value:'').toLowerCase();
  const attnOnly=!!(document.getElementById('attnonly')&&document.getElementById('attnonly').checked);
  document.querySelectorAll('.group').forEach(g=>{
    let any=false;
    g.querySelectorAll(sel).forEach(r=>{
      const hit=r.dataset.n.includes(q) && (!attnOnly || r.dataset.attn==='1');
      r.style.display=hit?'':'none'; if(hit)any=true;
    });
    if(g.querySelector(sel)){ g.style.display=any?'':'none'; if((q||attnOnly)&&any) g.classList.add('open'); }
  });
}
function mdToHtml(md){
  const lines=md.split('\\n'); let out=[]; let inList=false;
  for(let ln of lines){
    if(/^##\\s/.test(ln)){ if(inList){out.push('</ul>');inList=false;} out.push('<h2>'+esc(ln.replace(/^##\\s/,''))+'</h2>'); }
    else if(/^#\\s/.test(ln)){ /* skip top title */ }
    else if(/^[-*]\\s/.test(ln)){ if(!inList){out.push('<ul>');inList=true;} out.push('<li>'+inline(ln.replace(/^[-*]\\s/,''))+'</li>'); }
    else { if(inList){out.push('</ul>');inList=false;} if(ln.trim()) out.push('<p class="muted">'+inline(ln)+'</p>'); }
  }
  if(inList)out.push('</ul>');
  return out.join('');
}
function inline(s){ return esc(s).replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>'); }

// init from hash
const start = SECTIONS.findIndex(s=>'#'+s.id===location.hash);
show(start>=0?start:0);
</script>
</body>
</html>
`
}

export function buildDashboard() {
  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(`${OUT_DIR}/index.html`, render(collect()))
  return `${OUT_DIR}/index.html`
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  console.log(`✓ Dashboard built: ${buildDashboard()}`)
}
