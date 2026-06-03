import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const DATA_DIR = 'data'

export function readJson(path, fallback) {
  if (!existsSync(path)) return fallback
  return JSON.parse(readFileSync(path, 'utf8'))
}

function serialize(obj) {
  return `${JSON.stringify(obj, null, 2)}\n`
}

// Write data/<name> only when its *non-volatile* content changes.
//
// Per-run fields like `generatedAt` would otherwise rewrite the file on every sync and produce
// spurious git diffs even when the design system is unchanged. We compare the new object against
// the file on disk after copying the volatile keys over from the old file: if the result is
// byte-identical, the meaningful content is unchanged, so we keep the old file (and its old
// timestamp) untouched. Only when real content differs do we write `obj` as-is with its fresh
// volatile values. Returns true when the file was written, false when skipped.
export function writeJsonStable(nameOrPath, obj, volatileKeys = ['generatedAt']) {
  // Bare names (e.g. "components.json") resolve under data/; a path with a slash is used as-is.
  const path = nameOrPath.includes('/') ? nameOrPath : `${DATA_DIR}/${nameOrPath}`
  mkdirSync(dirname(path), { recursive: true })

  if (existsSync(path)) {
    const existing = readFileSync(path, 'utf8')
    const candidate = { ...obj }
    const old = JSON.parse(existing)
    for (const key of volatileKeys) {
      if (key in old) candidate[key] = old[key]
    }
    if (serialize(candidate) === existing) return false
  }

  writeFileSync(path, serialize(obj))
  return true
}
