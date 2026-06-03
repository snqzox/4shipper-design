# Fix P2 — Duplicate Button-primary token namespace

**Severity:** HIGH (live defect — two different blues for "primary button")
**Where:** Transportly UI Kit 2.0 Figma library (`XVou4XJ4rWbt4oXoSxO7hO`).
**Owner:** design-system-manager / Jakub (the `designer` agent never edits the library).
**Status:** proposed — locate the leaking node(s), then rebind.

## Problem
There are **two parallel token namespaces** for the primary button, using **different blues**:

| Namespace | Prefix | Background value | Hover tokens? | Where it lives |
|---|---|---|---|---|
| **A — canonical** | `button-primary/*` (hyphen, `/background`) | `#105BFF` | ✅ full hover set | **local** collection `theme-colors` (UI Kit 2.0) |
| **B — orphan** | `button/primary/*` (slash, `/bg`) | `#0048E3` | ❌ none | **NOT local** — foreign/remote library variable (see below) |

`#105BFF` is the brand primary (it equals `background/primary`, `text/primary`, `blue/500`).
`#0048E3` matches **no** semantic/ramp token — it is off-brand.

### Key finding — B is not a UI Kit variable
Searched the UI Kit 2.0 **local** variables via the bridge plugin (`figma_search_variables`):
78 `button*` tokens exist, **all** under collections `theme-colors` (colours) and `input-sizes`
(layout). **None** of them contains `/bg` — the local naming convention is `…/background`, never
`…/bg`. Two searches (`primary/bg`, `/bg`) returned **0 local matches**.

➡️ `button/primary/bg` (#0048E3) and `button/primary-subtle/*` are **not editable variables in
UI Kit 2.0**. They are variables from a **different / older library** that leaked into
`data/variables-desktop.json` only because some node on a scanned UI Kit page still *references*
them (`get_variable_defs` reports remote variables used by nodes, not just local ones). The
different naming convention (`button/primary/bg` vs `button-primary/background`) confirms a
different library of origin.

Collections in UI Kit 2.0 (for reference):
- **`theme-colors`** (`VariableCollectionId:9:98`) — all semantic button colours (`button-primary/*`,
  `button-secondary/*`, `button-danger/*`, `button-ghost/*`, `button-link/*`, `button-inverted/*`,
  `button-warning/*`, + `-subtle` families). 2 modes (light `9:0`, dark `11:1`).
- **`input-sizes`** (`VariableCollectionId:6:17`) — `button/size`, `button/radius`, `button/x-padding`,
  `button/x-gap`, `button/font-*`, `button/icon-size`, `button/chevron-size`. 4 size modes.

## Evidence — which namespace is live
Queried the real Button component variants in Figma (`get_variable_defs`):

| Button variant | Node | Binds to |
|---|---|---|
| Primary / Default | `15:86` | `button-primary/background` #105bff · `button-primary/text` · `button-primary/border` |
| Primary / Hover | `6072:77419` | `button-primary/background-hover` #0043d5 · `…/border-hover` · `…/text-hover` |
| Primary Subtle / Default | `15:755` | `button-primary-subtle/background` #e6eeff · `…/border` · `…/text` |

➡️ **Every** Button variant binds to **Namespace A**. **No** Button variant binds to Namespace B.
Namespace B is an orphan (likely a leftover from an earlier token pass).

> Note: the shared layout tokens under the `button/` collection — `button/x-padding`, `button/radius`,
> `button/size`, `button/icon-size`, `button/font-*`, `button/x-gap` — **are live**. Do **not** touch
> those. Only the **`button/primary/*` and `button/primary-subtle/*` colour sub-tokens** are orphaned.

## Recommendation — find the leaking node(s), rebind to A
Because B is **not a UI Kit 2.0 variable**, there is nothing to delete in the Variables panel. The fix
is to find whatever still *references* the foreign `button/primary/*` and rebind it to the canonical
`button-primary/*` token in `theme-colors`. Rebind mapping:

| Foreign reference (Namespace B) | Value | Rebind to (Namespace A, `theme-colors`) | Value |
|---|---|---|---|
| `button/primary/bg` | `#0048E3` | `button-primary/background` | `#105BFF` |
| `button/primary/border` | `#003CBE` | `button-primary/border` | `#004CF2` |
| `button/primary/text` | `#FFFFFF` | `button-primary/text` | `#FFFFFF` |
| `button/primary-subtle/bg` | `#DFEDFF` | `button-primary-subtle/background` | `#E6EEFF` |
| `button/primary-subtle/border` | `#A9CCF6` | `button-primary-subtle/border` | `#CFDEFF` |
| `button/primary-subtle/text` | `#0048E3` | `button-primary-subtle/text` | `#004CF2` |

Namespace B has **no hover states**, so anything bound to it is also missing hover styling — another
reason A (which has `background-hover`, `border-hover`, `text-hover`) is the correct survivor.

## Steps
1. **Locate the leaking node(s).** The published Button component is clean (it already binds A — verified
   on nodes `15:86`, `6072:77419`, `15:755`). The `#0048E3` reference is on some *other* node on a UI Kit
   page. To find it: scan the UI Kit pages for any fill/stroke = `#0048E3` that is bound to a variable
   whose name starts `button/primary` (a detached/old instance, a stray example frame, or a node still
   linked to an old library). The design-system-manager agent can sweep this via the bridge / Dev Mode MCP.
2. **Rebind** each such node's fill/stroke/text to the matching `button-primary/*` variable above
   (Variables → `theme-colors`).
3. **Detach the stale library** if one is still linked: Assets panel → Libraries → remove the old
   "button/primary" library so its variables can no longer be referenced.
4. **Publish** UI Kit 2.0. The scheduled `npm run sync` (or `/ds-sync`) logs the change to the changelog.
5. **Verify:** re-run `npm run variables:desktop` — `data/variables-desktop.json` should no longer
   contain `button/primary/bg` or `button/primary-subtle/*`, and `#0048E3` should disappear from button
   tokens. (If it persists, a node is still referencing the old library — repeat step 1.)

## Note
Since B is not a real DS variable, the practical severity is lower than a true in-component conflict:
the **published Button is already correct**. The risk is that a designer could still pick the stale
`#0048E3` reference off the leaking node. Cleaning it removes that trap and stops the noise in the
synced token data.
