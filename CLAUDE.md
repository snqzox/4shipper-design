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
| `npm run serve` | Local static preview of the dashboard at http://localhost:4178. |
| `npm run variables:desktop` | Pull Figma **variables** via the local Dev Mode MCP (needs UI Kit open + active in Figma desktop). Writes `data/variables-desktop.json`, which `tokens` prefers over the Enterprise-gated REST variables. |

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
