import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

// Tiny static file server for local dashboard preview. Dev-only; not used in CI.
const ROOT = 'dashboard'
const PORT = Number(process.env.PORT) || 4178
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' }

createServer(async (req, res) => {
  try {
    const rel = normalize(decodeURIComponent((req.url || '/').split('?')[0])).replace(/^(\.\.[/\\])+/, '')
    const path = join(ROOT, rel === '/' || rel === '.' ? 'index.html' : rel)
    const body = await readFile(path)
    res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
}).listen(PORT, () => console.log(`Dashboard preview on http://localhost:${PORT}`))
