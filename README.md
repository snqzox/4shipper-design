# 4Shipper Design

Design-ops workspace for the **4Shipper** design system (Transportly): Figma sync, reporting,
documentation, and AI-assisted design. Heavy lifting is done by scripts to keep model token use low.

See [CLAUDE.md](CLAUDE.md) for the full project guide.

## Setup

1. **Create a Figma token** at <https://www.figma.com/settings> → *Personal access tokens*.
   Give it read scopes: *File content* and *Library content*.

2. **Configure locally:**
   ```bash
   cp .env.example .env
   # paste your token into FIGMA_TOKEN
   ```

3. **First sync** (no install needed — scripts use only Node ≥ 20.12 built-ins):
   ```bash
   npm run sync
   ```
   This pulls the UI Kit + Design file, writes `data/*.json`, stores a baseline snapshot, and
   builds `dashboard/index.html`. Open that file in a browser to see the dashboard.

## Daily use

| You want to… | Do this |
|---|---|
| Sync after publishing a new UI Kit version | `npm run sync` or `/ds-sync` |
| See the current DS state / component list | open the dashboard (GitHub Pages or `dashboard/index.html`) |
| Start a design task | `/new-design` (hands off to the **designer** agent) |
| Audit / document the DS | ask the **design-system-manager** agent |

## Automation (GitHub)

The workflow `.github/workflows/sync-and-deploy.yml` runs `npm run sync` on a schedule, commits any
design-system changes, and deploys the dashboard to **GitHub Pages**. To enable it:

1. Add the token as a repo secret:
   ```bash
   gh secret set FIGMA_TOKEN
   ```
2. Enable Pages with the **GitHub Actions** source (Settings → Pages), then run the workflow once:
   ```bash
   gh workflow run "Figma Sync & Dashboard"
   ```

The dashboard URL will be `https://<owner>.github.io/4shipper-design/`.

> Note: the Figma **Variables** endpoint requires an Enterprise plan; if unavailable the sync still
> works and simply records variables as unavailable. Color/text styles come through on any plan.
