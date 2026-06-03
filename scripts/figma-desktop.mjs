// Minimal MCP-over-HTTP client for the local Figma Dev Mode MCP server (127.0.0.1:3845).
// Reads the LIVE selection in the Figma desktop app — used to pull variables the REST
// API can't reach without Enterprise. Dev/manual tool, not part of the CI sync.
//
// Usage:
//   node scripts/figma-desktop.mjs                      # list available tools
//   node scripts/figma-desktop.mjs <tool> '<jsonArgs>'  # call a tool, print result

export const BASE = process.env.FIGMA_DESKTOP_MCP || 'http://127.0.0.1:3845/mcp'
let sessionId = null

async function rpc(method, params, notify = false) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  }
  if (sessionId) headers['mcp-session-id'] = sessionId
  const body = { jsonrpc: '2.0', method }
  if (!notify) body.id = Math.floor(Math.random() * 1e9) + 1
  if (params !== undefined) body.params = params

  const res = await fetch(BASE, { method: 'POST', headers, body: JSON.stringify(body) })
  const sid = res.headers.get('mcp-session-id')
  if (sid) sessionId = sid
  if (notify) return null

  const text = await res.text()
  // Responses are SSE framed: lines like `data: {json}`. Take the last data payload.
  const dataLines = text
    .split('\n')
    .filter((l) => l.startsWith('data:'))
    .map((l) => l.slice(5).trim())
    .filter(Boolean)
  const payload = dataLines.length ? dataLines[dataLines.length - 1] : text
  let parsed
  try {
    parsed = JSON.parse(payload)
  } catch {
    throw new Error(`Unparseable response for ${method}: ${text.slice(0, 200)}`)
  }
  if (parsed.error) throw new Error(`${method} → ${JSON.stringify(parsed.error)}`)
  return parsed.result
}

export async function connect() {
  await rpc('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: '4shipper-ds', version: '0.1.0' },
  })
  await rpc('notifications/initialized', undefined, true)
}

export async function listTools() {
  const { tools = [] } = await rpc('tools/list', {})
  return tools
}

// Call a tool and return the concatenated text content of the result.
export async function callTool(name, args = {}) {
  const result = await rpc('tools/call', { name, arguments: args })
  return (result.content || [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('\n')
}

async function main() {
  await connect()
  const [, , toolName, jsonArgs] = process.argv

  if (!toolName) {
    const tools = await listTools()
    console.log(`Connected to Figma Dev Mode MCP. ${tools.length} tools:`)
    for (const t of tools) {
      const req = (t.inputSchema?.required || []).join(', ')
      console.log(`  • ${t.name}${req ? `  (requires: ${req})` : ''}`)
    }
    return
  }

  const args = jsonArgs ? JSON.parse(jsonArgs) : {}
  process.stdout.write(`${await callTool(toolName, args)}\n`)
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  main().catch((e) => {
    console.error('✗', e.message)
    process.exit(1)
  })
}
