import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { extname, join, normalize } from 'node:path'

// Local control panel for the dashboard: serves the static dashboard AND exposes a small
// localhost-only API so refresh/publish can be triggered from buttons (no terminal needed).
// Dev-only; never used in CI. The GitHub Pages copy has no server, so its buttons stay inert.
const ROOT = 'dashboard'
const PORT = Number(process.env.PORT) || 4178
const HOST = '127.0.0.1'
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' }

// Allowed actions → fixed command pipelines. No request data ever reaches the shell.
const GIT_ID = ['-c', 'user.name=Jakub Bielesch', '-c', 'user.email=jakub.bielesch@gmail.com']
// Committed data files only advance their `generatedAt` when the design system actually changes, so
// this sidecar (git-ignored) records when the dashboard last *ran* a refresh — surfaced as a live
// "Last refreshed" indicator without dirtying the working tree.
const LAST_REFRESH = 'data/_last-refresh.json'
const ACTIONS = {
  sync: { refresh: true, cmds: [['node', 'scripts/sync.mjs']] },
  variables: {
    refresh: true,
    cmds: [
      ['node', 'scripts/pull-variables-desktop.mjs'],
      ['node', 'scripts/tokens.mjs'],
      ['node', 'scripts/build-dashboard.mjs'],
    ],
  },
  dashboard: { refresh: true, cmds: [['node', 'scripts/build-dashboard.mjs']] },
  publish: {
    lenient: true, // `git commit` exits 1 when there's nothing to commit — keep going
    cmds: [
      ['git', 'add', '-A'],
      ['git', ...GIT_ID, 'commit', '-m', 'chore: refresh design system from dashboard'],
      ['git', 'push'],
    ],
  },
}

function runCmds(cmds, lenient) {
  return new Promise((resolve) => {
    let out = ''
    const step = (i) => {
      if (i >= cmds.length) return resolve({ ok: true, output: out })
      const [cmd, ...args] = cmds[i]
      out += `$ ${cmd} ${args.join(' ')}\n`
      const p = spawn(cmd, args, { cwd: process.cwd() })
      p.stdout.on('data', (d) => { out += d })
      p.stderr.on('data', (d) => { out += d })
      p.on('error', (e) => resolve({ ok: false, output: `${out}\n${e.message}` }))
      p.on('close', (code) => {
        if (code !== 0) {
          if (lenient) { out += `\n[exit ${code}, continuing]\n`; return step(i + 1) }
          return resolve({ ok: false, output: `${out}\n[exit ${code}]` })
        }
        step(i + 1)
      })
    }
    step(0)
  })
}

function gitStatus() {
  return new Promise((resolve) => {
    const p = spawn('git', ['status', '--porcelain'], { cwd: process.cwd() })
    let o = ''
    p.stdout.on('data', (d) => { o += d })
    p.on('close', () => {
      const lines = o.trim().split('\n').filter(Boolean)
      resolve({ dirty: lines.length > 0, changes: lines.length })
    })
    p.on('error', () => resolve({ dirty: false, changes: 0 }))
  })
}

async function status() {
  const read = (path, fb) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : fb)
  const comps = read('data/components.json', {})
  const tokens = read('data/tokens.json', {})
  const lastRefresh = read(LAST_REFRESH, {})
  const git = await gitStatus()
  return {
    generatedAt: comps.generatedAt || null,
    refreshedAt: lastRefresh.refreshedAt || null,
    components: comps.count || 0,
    variables: tokens.variables?.count || 0,
    colors: tokens.colors?.length || 0,
    git,
  }
}

// Only same-machine callers may use the API: require a custom header (blocks cross-site
// requests via CORS preflight) and a localhost Origin when present.
function allowed(req) {
  if (req.headers['x-ds-control'] !== '1') return false
  const o = req.headers.origin
  return !o || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)
}

async function handleApi(req, res) {
  if (!allowed(req)) { res.writeHead(403); return res.end('forbidden') }
  const url = req.url.split('?')[0]
  const json = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)) }

  if (url === '/api/status' && req.method === 'GET') return json(200, await status())

  if (url === '/api/run' && req.method === 'POST') {
    let body = ''
    for await (const chunk of req) body += chunk
    let action
    try { action = JSON.parse(body).action } catch { /* ignore */ }
    const def = ACTIONS[action]
    if (!def) return json(400, { ok: false, output: `Unknown action: ${action}` })
    const result = await runCmds(def.cmds, def.lenient)
    if (result.ok && def.refresh) {
      try { writeFileSync(LAST_REFRESH, `${JSON.stringify({ refreshedAt: new Date().toISOString() }, null, 2)}\n`) } catch { /* best effort */ }
    }
    return json(200, result)
  }
  json(404, { ok: false, output: 'not found' })
}

const server = createServer(async (req, res) => {
  if (req.url.startsWith('/api/')) return handleApi(req, res)
  try {
    const rel = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '')
    const path = join(ROOT, rel === '/' || rel === '.' ? 'index.html' : rel)
    const body = await readFile(path)
    res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream', 'cache-control': 'no-store' })
    res.end(body)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
})

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`
  console.log(`4Shipper DS control panel → ${url}`)
  if (process.env.DS_OPEN === '1' && process.platform === 'darwin') {
    try { spawn('open', [url]) } catch { /* ignore */ }
  }
})
