import { figmaGet, figmaGetOptional } from './figma-client.mjs'
import { writeJsonStable } from './json-store.mjs'
import { FILES } from './config.mjs'

// Figma's Variables REST endpoint is Enterprise-gated, so the token usually gets a 403 whose body
// (scope list order, statusText) varies run-to-run. Collapse that into a deterministic payload so
// the committed variables.json doesn't churn. Keeps "403" in the reason so tokens.mjs still maps it
// to the full Enterprise message.
function canonicalUnavailable(value) {
  if (!value?.__unavailable) return value
  if (/\b403\b/.test(value.reason || '')) {
    return {
      __unavailable: true,
      status: 403,
      reason: 'Figma API 403 — Variables REST endpoint requires the file_variables:read scope (Enterprise plan only).',
    }
  }
  return { __unavailable: true, reason: value.reason }
}

// depth=1 keeps the payload small: document + its pages, no nested layers.
async function fileMeta(key) {
  const data = await figmaGet(`/v1/files/${key}?depth=1`)
  return {
    key,
    name: data.name,
    version: data.version,
    lastModified: data.lastModified,
    pages: (data.document?.children || []).map((p) => ({ id: p.id, name: p.name })),
  }
}

async function publishedLibrary(key) {
  const [comps, sets, styles] = await Promise.all([
    figmaGet(`/v1/files/${key}/components`),
    figmaGet(`/v1/files/${key}/component_sets`),
    figmaGet(`/v1/files/${key}/styles`),
  ])
  return {
    components: (comps.meta?.components || []).map((c) => ({
      key: c.key,
      name: c.name,
      nodeId: c.node_id,
      description: c.description || '',
      updatedAt: c.updated_at,
      set: c.containing_frame?.containingStateGroup?.name || null,
      page: c.containing_frame?.pageName || null,
    })),
    componentSets: (sets.meta?.component_sets || []).map((s) => ({
      key: s.key,
      name: s.name,
      nodeId: s.node_id,
      description: s.description || '',
      updatedAt: s.updated_at,
    })),
    styles: (styles.meta?.styles || []).map((s) => ({
      key: s.key,
      name: s.name,
      nodeId: s.node_id,
      type: s.style_type,
      description: s.description || '',
      updatedAt: s.updated_at,
    })),
  }
}

// Enrich each style with its real value by reading the underlying node.
// TEXT → typography props, EFFECT → shadow list, FILL → color/gradient.
async function fetchStyleValues(key, styles) {
  const ids = styles.map((s) => s.nodeId).filter(Boolean)
  if (!ids.length) return styles
  const data = await figmaGet(`/v1/files/${key}/nodes?ids=${ids.join(',')}`)
  const nodes = data.nodes || {}

  const valueFor = (style) => {
    const doc = nodes[style.nodeId]?.document
    if (!doc) return null
    if (style.type === 'TEXT' && doc.style) {
      const t = doc.style
      return {
        fontFamily: t.fontFamily,
        fontWeight: t.fontWeight,
        fontSize: t.fontSize,
        lineHeight: t.lineHeightPx ?? null,
        letterSpacing: t.letterSpacing ?? 0,
        textCase: t.textCase || 'ORIGINAL',
      }
    }
    if (style.type === 'EFFECT') {
      return { effects: (doc.effects || []).filter((e) => e.visible !== false) }
    }
    if (style.type === 'FILL') {
      return { fills: doc.fills || [] }
    }
    return null
  }

  return styles.map((s) => ({ ...s, value: valueFor(s) }))
}

// depth=3 gives pages → their direct frame children (the screens) → each screen's immediate
// children. We keep metadata only (id/name/type + bounding-box size) and cap the child preview so
// pages.json stays lean and diff-stable. snapshot.mjs only reads name + screens.length, so the
// extra per-screen fields never churn the change-tracking fingerprint.
const SCREEN_TYPES = new Set(['FRAME', 'SECTION', 'COMPONENT', 'COMPONENT_SET'])
const CHILD_PREVIEW_CAP = 60

function boxSize(node) {
  const b = node.absoluteBoundingBox
  if (!b || b.width == null || b.height == null) return null
  return { w: Math.round(b.width), h: Math.round(b.height) }
}

function screenSummary(node) {
  const kids = node.children || []
  const size = boxSize(node)
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    ...(size ? { w: size.w, h: size.h } : {}),
    childCount: kids.length,
    children: kids.slice(0, CHILD_PREVIEW_CAP).map((c) => ({ name: c.name, type: c.type })),
  }
}

async function designScreens(key) {
  const data = await figmaGet(`/v1/files/${key}?depth=3`)
  const pages = (data.document?.children || []).map((page) => ({
    id: page.id,
    name: page.name,
    screens: (page.children || []).filter((n) => SCREEN_TYPES.has(n.type)).map(screenSummary),
  }))
  return { key, name: data.name, version: data.version, lastModified: data.lastModified, pages }
}

export async function pullAll() {
  const generatedAt = new Date().toISOString()

  const uiKitMeta = await fileMeta(FILES.uiKit.key)
  const library = await publishedLibrary(FILES.uiKit.key)
  const styles = await fetchStyleValues(FILES.uiKit.key, library.styles)
  const variables = await figmaGetOptional(`/v1/files/${FILES.uiKit.key}/variables/local`)
  const design = await designScreens(FILES.design.key)

  writeJsonStable('components.json', {
    generatedAt,
    file: uiKitMeta,
    count: library.components.length,
    setCount: library.componentSets.length,
    components: library.components,
    componentSets: library.componentSets,
  })
  writeJsonStable('styles.json', {
    generatedAt,
    file: uiKitMeta,
    count: styles.length,
    styles,
  })
  writeJsonStable('variables.json', { generatedAt, file: uiKitMeta, raw: canonicalUnavailable(variables) })
  writeJsonStable('pages.json', { generatedAt, design })

  return { uiKitMeta, library: { ...library, styles }, design, generatedAt }
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  pullAll()
    .then((r) => {
      console.log(
        `✓ UI Kit: ${r.library.components.length} components, ${r.library.componentSets.length} sets, ${r.library.styles.length} styles`,
      )
      console.log(`✓ Design: ${r.design.pages.length} pages`)
    })
    .catch((e) => {
      console.error('✗', e.message)
      process.exit(1)
    })
}
