import { existsSync, readFileSync } from 'node:fs'
import { writeJsonStable } from './json-store.mjs'

const DATA_DIR = 'data'

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback
  return JSON.parse(readFileSync(path, 'utf8'))
}

// Figma colors are 0..1 floats. Convert to #rrggbb (+ alpha kept separately).
function toHex(c) {
  if (!c) return null
  const h = (n) => Math.round((n ?? 0) * 255).toString(16).padStart(2, '0')
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`.toUpperCase()
}

function rgbaString(c) {
  if (!c) return null
  const v = (n) => Math.round((n ?? 0) * 255)
  const a = Math.round((c.a ?? 1) * 1000) / 1000
  return `rgba(${v(c.r)}, ${v(c.g)}, ${v(c.b)}, ${a})`
}

// Build a CSS box-shadow string from a Figma effects array (drop/inner shadow).
function effectsToCss(effects = []) {
  return effects
    .filter((e) => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW')
    .map((e) => {
      const inset = e.type === 'INNER_SHADOW' ? 'inset ' : ''
      const x = e.offset?.x ?? 0
      const y = e.offset?.y ?? 0
      const blur = e.radius ?? 0
      const spread = e.spread ?? 0
      return `${inset}${x}px ${y}px ${blur}px ${spread}px ${rgbaString(e.color)}`
    })
    .join(', ')
}

function typographyToken(style) {
  const v = style.value || {}
  return {
    name: style.name,
    fontFamily: v.fontFamily ?? null,
    fontWeight: v.fontWeight ?? null,
    fontSize: v.fontSize ?? null,
    lineHeight: v.lineHeight ?? null,
    letterSpacing: v.letterSpacing ?? 0,
    textCase: v.textCase ?? 'ORIGINAL',
    description: style.description || '',
  }
}

function shadowToken(style) {
  const effects = style.value?.effects || []
  return { name: style.name, css: effectsToCss(effects), effects, description: style.description || '' }
}

function colorToken(style) {
  const fill = (style.value?.fills || []).find((f) => f.type === 'SOLID')
  return {
    name: style.name,
    hex: toHex(fill?.color),
    rgba: rgbaString(fill?.color),
    description: style.description || '',
  }
}

const isHex = (v) => typeof v === 'string' && /^#([0-9a-f]{3,8})$/i.test(v)

function classifyValue(value) {
  if (isHex(value)) return 'color'
  if (/^-?\d+(\.\d+)?$/.test(value)) return 'number'
  if (/^Font\(/.test(value)) return 'font'
  return 'text'
}

// Normalize the desktop-MCP variable map (flat name→resolved value) into prefix groups.
function normalizeDesktopVariables(desktop) {
  const entries = Object.entries(desktop.variables || {})
  const groupsMap = {}
  for (const [name, value] of entries) {
    const group = name.includes('/') ? name.split('/')[0] : 'other'
    ;(groupsMap[group] ||= []).push({ name, value, kind: classifyValue(value) })
  }
  const groups = Object.entries(groupsMap)
    .map(([name, items]) => ({ name, items: items.sort((a, b) => a.name.localeCompare(b.name)) }))
    .sort((a, b) => b.items.length - a.items.length)
  return { available: true, source: desktop.source || 'figma-desktop-mcp', count: entries.length, groups }
}

// Normalize Figma local-variables payload (Enterprise) into collections → modes → variables.
function normalizeVariables(raw) {
  if (!raw || raw.__unavailable) {
    const is403 = /\b403\b/.test(raw?.reason || '')
    const reason = is403
      ? 'The Figma Variables REST endpoint needs the file_variables:read scope, which is only granted on an Enterprise plan. The current token/plan does not include it.'
      : raw?.reason || 'Variables REST API is unavailable.'
    return { available: false, reason }
  }
  const meta = raw.meta || {}
  const collections = Object.values(meta.variableCollections || {}).map((col) => ({
    name: col.name,
    modes: (col.modes || []).map((m) => ({ id: m.modeId, name: m.name })),
    variables: Object.values(meta.variables || {})
      .filter((vr) => vr.variableCollectionId === col.id)
      .map((vr) => ({ name: vr.name, type: vr.resolvedType, valuesByMode: vr.valuesByMode })),
  }))
  return { available: true, collections }
}

export function buildTokens() {
  const stylesData = readJson(`${DATA_DIR}/styles.json`, { styles: [], file: {} })
  const variablesData = readJson(`${DATA_DIR}/variables.json`, { raw: { __unavailable: true } })
  const desktop = readJson(`${DATA_DIR}/variables-desktop.json`, null)
  const styles = stylesData.styles || []

  // Prefer real variables pulled via the desktop Dev Mode MCP; fall back to the REST state.
  const variables = desktop ? normalizeDesktopVariables(desktop) : normalizeVariables(variablesData.raw)

  // Color tokens: paint styles if any, otherwise the color-typed variables (the real palette).
  const styleColors = styles.filter((s) => s.type === 'FILL').map(colorToken)
  const variableColors = desktop
    ? Object.entries(desktop.variables || {})
        .filter(([, v]) => isHex(v))
        .map(([name, v]) => ({ name, hex: v.toUpperCase(), rgba: null, description: '' }))
    : []

  const tokens = {
    generatedAt: stylesData.generatedAt || new Date().toISOString(),
    file: stylesData.file || {},
    typography: styles.filter((s) => s.type === 'TEXT').map(typographyToken),
    shadows: styles.filter((s) => s.type === 'EFFECT').map(shadowToken),
    colors: styleColors.length ? styleColors : variableColors,
    variables,
  }
  writeJsonStable('tokens.json', tokens)
  return tokens
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  const t = buildTokens()
  console.log(
    `✓ Tokens: ${t.typography.length} type, ${t.shadows.length} shadow, ${t.colors.length} color; variables ${t.variables.available ? 'available' : 'unavailable'}`,
  )
}
