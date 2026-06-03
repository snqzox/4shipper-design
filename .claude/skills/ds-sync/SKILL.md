---
name: ds-sync
description: Sync the 4Shipper design system from Figma — pull current components/styles/pages, detect changes since the last publish, update the changelog, rebuild the dashboard, and commit. Use when the user says "sync the design system", "I published a new UI Kit version", "update the dashboard", or "what changed in the DS". Runs scripts (no model tokens); only summarizes the result.
---

# Design System Sync

Token-cheap workflow: the heavy lifting is done by Node scripts. Your job is to run them, then summarize.

## Steps
1. Run the sync script (this does pull → snapshot → diff → dashboard in one go):
   ```bash
   npm run sync
   ```
   - If it fails with "FIGMA_TOKEN is not set", tell the user to create `.env` from `.env.example` (see README) and stop.

2. Read what changed:
   - Look at the script output (it prints "changes detected" or "no changes").
   - If changed, read the newest entry in `docs/design-system/changelog.md`.

3. Summarize for the user in plain English: components/styles added, changed, removed, and the new library version. Flag anything likely to break existing screens.

4. Commit and push the result (data, docs, dashboard) so the GitHub Pages dashboard updates:
   ```bash
   git add data docs dashboard
   git commit -m "chore: sync design system from Figma"
   git push
   ```
   - Skip the commit if `git status --porcelain` is empty (nothing changed).

## Notes
- For a deeper audit or documentation pass after syncing, hand off to the **design-system-manager** agent.
- The same `npm run sync` runs automatically in CI on a schedule — this skill is the manual / on-demand path.
