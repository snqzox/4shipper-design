# UI Kit 2.0 — File Structure & Organization

How the **Transportly UI Kit 2.0** Figma library is organized: page grouping, naming, in-canvas
layout, and descriptions. This is the **information-architecture (IA) companion** to
[audit-2026-06-03.md](../audit-2026-06-03.md) — the audit covers *what the components are* (naming,
tokens, completeness); this doc covers *how the file is laid out so people can find and understand them*.

The concrete target page list is generated, not hand-maintained: run `npm run blueprint` →
[proposals/ui-kit-structure-blueprint.md](../proposals/ui-kit-structure-blueprint.md).

> **Scope rule:** organization only. Pages may be created, re-ordered, or re-prefixed; **component
> sets are never renamed here** — set renames/consolidation are tracked in the audit's P-actions.

## Why this exists

The library started as **~30 flat component pages** (`⚛️ Button`, `⚛️ Status`, `📦 Page Header`, …)
with no grouping, **no descriptions** (2 / 40 sets), and no cover/index/legend. It works if you
already know it; it's opaque to everyone else and in Figma's component picker. The fixes below add a
**navigable category layer**, a **consistent per-component layout**, and a **description on every set**
— without touching component names.

## 1. Page information architecture

Figma has no page folders, so categories are expressed with **divider pages** (`──  ACTIONS  ──`)
followed by their member pages in order — the same pattern the 4Shipper product file already uses
(`SHIPPER ---------`). Top-to-bottom order:

```
🏠 Cover                 — title, library version, how-to-use, emoji legend, links
🧭 Index & Changelog     — category table of contents + recent changes
──  FOUNDATIONS  ──
   🎨 Foundations        — color / type / spacing / radius / icon token overview
──  ACTIONS  ──          — Button
──  FORMS & INPUTS  ──   — Input & Form Control, Checkbox/Radio/Switch, Dropdown, Fileupload, Attachment, Option Cards
──  DATA DISPLAY  ──     — Table, Badge, Price, Status, Progress Bar, Item, Separator, Section Title, No Data Placeholder
──  FEEDBACK  ──         — Notification (Alert)
──  OVERLAYS & SURFACES  ── — Dialog, Alert Dialog, Popover, Tooltip
──  NAVIGATION  ──       — Tabs, Step Progress Tabs, Stepper, Breadcrumbs, Pagination
──  LAYOUT & STRUCTURE  ── — Page, Page Header, Page Footer, Content Box, Content Header, Form Header
──  DOMAIN (LOGISTICS)  ── — Route Entry, Carrier Selection, Location Pointer
──  ASSETS  ──           — Assets (icons/flags/illustrations), E-mail templates
```

**Why functional, not atomic design?** Designers search by *what a thing does* ("I need a status
chip"), not by atomic tier. Functional categories also give the logistics-specific pieces
(Route Entry, Carrier Selection) an obvious home that "Molecules/Organisms" never does.

## 2. Naming & emoji legend

One emoji prefix per page signals its kind at a glance in the page list:

| Prefix | Meaning |
|---|---|
| `⚛️` | Atomic component (Button, Input, Badge, …) |
| `📦` | Layout / composite block (Page, Content Box, Page Header, …) |
| `🧩` | Assets — icons, flags, illustrations |
| `✉️` | Email templates |
| `🏠` `🧭` `🎨` | Meta pages — Cover, Index, Foundations |
| `──  …  ──` | Category divider (not a real content page) |

Rules:
- **Every content page carries exactly one prefix.** (Fix: the `Stepper` page is currently
  un-prefixed → `⚛️ Stepper`.)
- Page names match the component/family they hold; don't invent synonyms.
- Component **set** names are out of scope — leave them as-is (see audit §2 for the naming backlog).
- Optional: an internal-only sub-part (e.g. `Carrier Selection/Entry`, used only inside its parent)
  may be flagged "not for direct use" in its **description** — without renaming the set.

## 3. Per-component page anatomy

Each component page follows the same top-to-bottom layout, so any page is readable the same way.
It mirrors the markdown doc template ([button.md](../components/button.md)):

1. **Title + category tag** — component name and its category (e.g. `Actions`).
2. **About panel** — the description (what it is / when to use / avoid), same text as the Figma
   set description (§4).
3. **Variants & states grid** — every variant × state, light and dark where relevant.
4. **Tokens used** — the color / type / spacing tokens the component binds.
5. **Do / Don't** — one or two concrete rules.

Build rule: wrap the whole page in **one vertical auto-layout master frame** (prevents the overlap /
clipping failure modes documented in the `design-system-manager` agent). Apply this incrementally —
highest-traffic components first (Button, Input, Status, Badge, Dialog, Table).

## 4. Description standard

Set the Figma **component-set `description` field** on every set (currently 2 / 40). This is additive
and link-safe — it changes nothing about instances; it populates the component picker and this repo's
generated docs. Use the [ds-component-describer](../../../.claude/agents/ds-component-describer.md)
template, kept short and concrete:

```
What it is:   <one sentence — purpose>
When to use:  <one or two bullets of context>
Variants:     <key variants / states; "—" if none>
Avoid:        <one common misuse; "—" if none>
```

The backfill worklist is generated: `data/description-backlog.json` (run `npm run blueprint`). The
same text feeds the in-canvas About panel (§3), so write it once.

## 5. Improvement options (a few, smallest-first)

1. **Add the three meta pages** (`🏠 Cover`, `🧭 Index & Changelog`, `🎨 Foundations`) and the
   category dividers, then reorder. Pure orientation win, zero risk to instances.
2. **Fix the `Stepper` emoji prefix.** One-line consistency fix.
3. **Backfill all 38 missing set descriptions.** Biggest usability gain; unblocks the component picker
   and generated docs.
4. **Apply the page anatomy (§3) to the top-10 components**, then the long tail.
5. **(Deferred, audit-owned)** set renames/consolidation, token de-duplication, missing Focus/Error
   variants — see [audit-2026-06-03.md](../audit-2026-06-03.md) §2–§4.

## How to regenerate

```
npm run blueprint   # rebuilds the target page tree + description backlog from data/components.json
```

Execution of the Figma changes (creating pages, reordering, writing descriptions) is a triggered
`design-system-manager` pass — a script can't drive the Figma MCP. After any Figma change, run
`npm run sync` to re-pull and refresh the dashboard + changelog.
