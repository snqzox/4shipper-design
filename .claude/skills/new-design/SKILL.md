---
name: new-design
description: Start a 4Shipper design task from a brief — a new screen, a form, an edit to an existing page, or page cleanup. Use when the user says "design…", "build a form for…", "update the … screen", or "organize the pages". Prepares context from the design system, then hands the brief to the designer agent.
---

# New Design

This skill kicks off design work that is executed by the **designer** agent, ensuring the design system is in sync first.

## Steps
1. **Make sure the system data is fresh.** If `data/components.json` is missing or older than a day, run `npm run sync` (or tell the user to set up `.env` if the token is missing).

2. **Capture the brief.** Confirm in one line: what to design, where (which app section / page from `platform-structure.md`), and any constraints. Ask only if the brief is genuinely ambiguous.

3. **Hand off to the designer agent** via the Agent tool (`subagent_type: designer`) with:
   - the brief,
   - the target page/section,
   - a reminder to use only published UI Kit components (`data/components.json`) and the rules in `docs/design-system/guidelines/`.

4. **Relay the result**: what was created, on which page/node, and which components were used. Include the screenshot the designer produced.

## Notes
- The designer only consumes the UI Kit; it never edits the library. If it reports a missing component, route that to the **design-system-manager**.
