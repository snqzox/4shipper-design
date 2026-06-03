# 4Shipper Design — Project Guide

Design-ops workspace for the **4Shipper** product (part of Transportly). It manages the
design system, keeps a versioned record of it in git, and produces designs — with AI doing
the thinking and **scripts doing the mechanical work** to save tokens.

## Core principle: scripts first, model second
- **Reading state from Figma = scripts** (`npm run …`). Zero model tokens.
- **Thinking work (docs, descriptions, designing) = agents.**
- If you catch yourself manually transcribing Figma data, stop and use/extend a script.

## The two Figma files
- **Transportly UI Kit 2.0** — the design-system library (components, styles, variables).
  Key: `XVou4XJ4rWbt4oXoSxO7hO`.
- **Transportly 4Shipper — Design** — the product design file (pages & screens).
  Key: `Xol48qmGXL8hIqA42jbHno`.

### figma-mcp-bridge dedicated ports
`.mcp.json` registers two `@magic-spells/figma-mcp-bridge` servers, each pinned to a fixed
`FIGMA_BRIDGE_PORT` so every file has a stable, dedicated bridge port (both usable at once —
one server holds one plugin connection):
- **`figma-uikit` → port `4444`** — open UI Kit 2.0, run the bridge plugin, set its port to `4444`.
- **`figma-4shipper` → port `3056`** — open 4Shipper — Design, run the plugin, set its port to `3056`.

The port lives on the *server process*, not the file — the bridge has no file→port mapping, so the
binding only holds if you type the matching port in each file's plugin. Tools are namespaced per
server: `mcp__figma-uikit__figma_*` vs `mcp__figma-4shipper__figma_*`. Note: the bridge's
in-use fallback only climbs to `3070`, so `3056` can shift if occupied but `4444` cannot fall back.

## Layout
```
scripts/        Node scripts — pull, tokens, snapshot, diff, dashboard, sync, serve (REST)
                + figma-desktop / pull-variables-desktop (local Dev Mode MCP, for variables)
data/           Versioned extracted state (components/styles/tokens/variables/pages + snapshots)
docs/design-system/   Documentation: components/, foundations/, guidelines/, changelog.md
dashboard/      Generated static dashboard (index.html) → deployed to GitHub Pages
.claude/agents/ design-system-manager, ds-component-describer, designer
.claude/skills/ ds-sync, new-design
.github/workflows/  Scheduled sync + Pages deploy
platform-overview.md / platform-structure.md   Product context
```

## Commands
| Command | What it does |
|---|---|
| `npm run sync` | Pull from Figma → diff vs last snapshot → update changelog → rebuild dashboard. The main command. |
| `npm run pull` | Just refresh `data/*.json` from Figma (components, styles+values, pages). |
| `npm run tokens` | Derive `data/tokens.json` (typography, shadows, colors, variables) from styles. |
| `npm run snapshot` | Save a fingerprint snapshot of current data. |
| `npm run dashboard` | Rebuild `dashboard/index.html` from `data/`. |
| `npm run serve` | **Local control panel** at http://localhost:4178 — the dashboard plus an Actions tab with Refresh/Publish buttons (no terminal needed). Double-click `4shipper-design.command` in Finder to launch it. |
| `npm run variables:desktop` | Pull Figma **variables** via the local Dev Mode MCP (needs UI Kit open + active in Figma desktop). Writes `data/variables-desktop.json`, which `tokens` prefers over the Enterprise-gated REST variables. **Subject to a daily rate limit** on the Dev Mode MCP server. |
| `npm run variables:bridge` | **Fallback when Dev Mode is rate-limited.** Resolves a **figma-mcp-bridge** variable dump (alias chains → concrete values) into `data/variables-desktop.json`. Two-step: the agent dumps local vars (compact) to `data/_bridge-vars-raw.json` via the bridge plugin, then this resolves them. The bridge MCP is stdio-only, so the agent must do the dump — a script can't reach it. Bonus: bridge returns only *local* vars, so library leaks can't appear. See `scripts/build-variables-from-bridge.mjs` header. |
| `npm run thumbnails` | Render a PNG preview of every component via REST `/v1/images` → `dashboard/thumbs/` + manifest `data/thumbnails.json`. The dashboard **Components** view shows them. PNGs are committed so the published Pages dashboard is self-contained. |
| `npm run thumbnails:pages` | Same idea for the **design file**: render a PNG of every top-level screen → `dashboard/thumbs-pages/` + manifest `data/page-thumbnails.json`. The dashboard **Pages** view + detail drawer show them. Rendered at a low scale (frames are large); large frames fall back to single-id requests if a batch render times out. |

Requires `.env` with `FIGMA_TOKEN` (see `.env.example` / README).

## Agents
- **design-system-manager** — owns the DS: reporting, maintenance, documentation, changelog.
  Reads `data/*.json` first; uses Figma MCP only when needed. Has a subagent:
  - **ds-component-describer** — writes component descriptions only.
- **designer** — given a brief, builds designs in the 4Shipper file using only published UI Kit
  components + the rules in `docs/design-system/guidelines/`.

## Skills
- **/ds-sync** — run a sync and summarize what changed (manual path).
- **/new-design** — start a design task; hands the brief to the `designer` agent.
- Plugin skills also available: **/design-system**, **/design-handoff**.

## Conventions
- Documentation in **English** (matches Figma names).
- Many small files; one markdown file per component under `docs/design-system/components/`.
- Never commit `.env` or tokens. CI reads `FIGMA_TOKEN` from repo secrets.

## How change-tracking works
`npm run sync` stores a snapshot in `data/snapshots/` and `data/latest.json`. On the next run it
diffs against `latest.json`; if the UI Kit library version or any component/style changed, it
prepends an entry to `docs/design-system/changelog.md`. The GitHub Action runs this on a schedule,
so publishing a new UI Kit version is detected automatically (within the schedule interval) and the
dashboard redeploys. For instant detection, a Figma `LIBRARY_PUBLISH` webhook can be added later (Phase 2).

When a component changes, `diff.mjs` also flags the docs that depend on it: it appends a **"Docs to refresh"**
section to the changelog and writes `data/stale-docs.json` (see `scripts/stale-docs.mjs`). The dashboard
**Components** view surfaces per-component **health** (📄 markdown doc · 📝 Figma description · 📖 in-Figma
showcase page · 🔄 fresh/stale), a deep **Figma link** and **Doc link** per component, and a **thumbnail**.
Detection is automatic; rebuilding a component's markdown + its `📖 Docs / <name>` Figma showcase stays a
triggered `design-system-manager` pass (a script can't drive the Figma MCP).
