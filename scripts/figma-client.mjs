import { existsSync } from 'node:fs'

// Load .env locally if present. On CI the token comes from the environment, so this is a no-op.
try {
  if (existsSync('.env') && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env')
  }
} catch {
  // .env is optional — ignore load errors.
}

const BASE = 'https://api.figma.com'

function requireToken() {
  const token = process.env.FIGMA_TOKEN
  if (!token) {
    throw new Error(
      'FIGMA_TOKEN is not set. Copy .env.example to .env and add your Figma token (see README.md).',
    )
  }
  return token
}

// GET a Figma REST endpoint and return parsed JSON. Throws on non-2xx.
export async function figmaGet(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Figma-Token': requireToken() },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Figma API ${res.status} ${res.statusText} — ${path}\n${body.slice(0, 300)}`)
  }
  return res.json()
}

// Like figmaGet, but never throws — used for plan-gated endpoints (e.g. Variables = Enterprise only).
export async function figmaGetOptional(path) {
  try {
    return await figmaGet(path)
  } catch (err) {
    return { __unavailable: true, reason: String(err?.message || err) }
  }
}
