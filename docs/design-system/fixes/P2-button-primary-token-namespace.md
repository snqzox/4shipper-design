# Fix P2 — Duplicate Button-primary token namespace

**Severity:** HIGH (live defect — two different blues for "primary button")
**Where:** Transportly UI Kit 2.0 Figma library (`XVou4XJ4rWbt4oXoSxO7hO`) — variables only.
**Owner:** design-system-manager / Jakub (the `designer` agent never edits the library).
**Status:** proposed — verify usages in Figma, then execute.

## Problem
There are **two parallel token namespaces** for the primary button, using **different blues**:

| Namespace | Prefix | Background value | Hover tokens? |
|---|---|---|---|
| **A — canonical** | `button-primary/*` (hyphen, `/background`) | `#105BFF` | ✅ full hover set |
| **B — orphan** | `button/primary/*` (slash, `/bg`) | `#0048E3` | ❌ none |

`#105BFF` is the brand primary (it equals `background/primary`, `text/primary`, `blue/500`).
`#0048E3` matches **no** semantic/ramp token — it is off-brand.

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

## Recommendation — keep A, retire B
Delete the 6 orphan colour tokens below. If Figma reports usages when deleting (older screens in the
4Shipper Design file may still bind them directly), **rebind those usages to the A equivalent first**,
then delete. Use this mapping:

| Delete (Namespace B) | Value | Rebind to (Namespace A) | Value |
|---|---|---|---|
| `button/primary/bg` | `#0048E3` | `button-primary/background` | `#105BFF` |
| `button/primary/border` | `#003CBE` | `button-primary/border` | `#004CF2` |
| `button/primary/text` | `#FFFFFF` | `button-primary/text` | `#FFFFFF` |
| `button/primary-subtle/bg` | `#DFEDFF` | `button-primary-subtle/background` | `#E6EEFF` |
| `button/primary-subtle/border` | `#A9CCF6` | `button-primary-subtle/border` | `#CFDEFF` |
| `button/primary-subtle/text` | `#0048E3` | `button-primary-subtle/text` | `#004CF2` |

Namespace B has **no hover states**, so anything bound to it is also missing hover styling — another
reason A (which has `background-hover`, `border-hover`, `text-hover`) is the correct survivor.

## Steps (in Figma desktop, UI Kit 2.0)
1. Open **Variables** (the collection holding `button/primary/*`).
2. For each of the 6 tokens above: right-click → **"Show usages"** (or attempt delete to see the count).
   - **0 usages** → delete the token.
   - **>0 usages** → select each consumer, rebind the property to the Namespace-A token from the
     mapping, then delete the orphan.
3. **Publish** the library. The scheduled `npm run sync` (or `/ds-sync`) will pick up the change and
   log it to the changelog automatically.
4. Verify: re-run `npm run variables:desktop` — `data/variables-desktop.json` should no longer contain
   `button/primary/bg` or `button/primary-subtle/*`, and `#0048E3` should disappear from button tokens.

## Why not just alias B → A and keep both?
Aliasing removes the colour mismatch but leaves a confusing duplicate in the picker (P3-style noise)
and B still lacks hover tokens. Deleting is cleaner and there are no component bindings to break.
