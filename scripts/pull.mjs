import { mkdirSync, writeFileSync } from 'node:fs'
import { figmaGet, figmaGetOptional } from './figma-client.mjs'
import { FILES } from './config.mjs'

const DATA_DIR = 'data'

function writeJson(name, obj) {
  mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(`${DATA_DIR}/${name}`, `${JSON.stringify(obj, null, 2)}\n`)
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
      type: s.style_type,
      description: s.description || '',
      updatedAt: s.updated_at,
    })),
  }
}

// depth=2 gives pages + their direct frame children (the screens), metadata only.
async function designScreens(key) {
  const data = await figmaGet(`/v1/files/${key}?depth=2`)
  const screenTypes = new Set(['FRAME', 'SECTION', 'COMPONENT'])
  const pages = (data.document?.children || []).map((page) => ({
    id: page.id,
    name: page.name,
    screens: (page.children || [])
      .filter((n) => screenTypes.has(n.type))
      .map((n) => ({ id: n.id, name: n.name, type: n.type })),
  }))
  return { key, name: data.name, version: data.version, lastModified: data.lastModified, pages }
}

export async function pullAll() {
  const generatedAt = new Date().toISOString()

  const uiKitMeta = await fileMeta(FILES.uiKit.key)
  const library = await publishedLibrary(FILES.uiKit.key)
  const variables = await figmaGetOptional(`/v1/files/${FILES.uiKit.key}/variables/local`)
  const design = await designScreens(FILES.design.key)

  writeJson('components.json', {
    generatedAt,
    file: uiKitMeta,
    count: library.components.length,
    setCount: library.componentSets.length,
    components: library.components,
    componentSets: library.componentSets,
  })
  writeJson('styles.json', {
    generatedAt,
    file: uiKitMeta,
    count: library.styles.length,
    styles: library.styles,
  })
  writeJson('variables.json', { generatedAt, file: uiKitMeta, raw: variables })
  writeJson('pages.json', { generatedAt, design })

  return { uiKitMeta, library, design, generatedAt }
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
