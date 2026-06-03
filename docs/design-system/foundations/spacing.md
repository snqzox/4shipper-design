# Spacing, Sizing & Radius

All values are tokens (`data/tokens.json`). Never use off-scale numbers.

## Spacing scale (px)
Base unit **4**, with half-steps where needed:

| Token | px | Typical use |
|---|---|---|
| `spacing/0` | 0 | reset |
| `spacing/0-5` | 2 | hairline gaps |
| `spacing/1` | 4 | icon ↔ label |
| `spacing/1-5` | 6 | chip padding |
| `spacing/2` | 8 | tight stacks |
| `spacing/2-5` | 10 | — |
| `spacing/3` | 12 | control padding |
| `spacing/4` | 16 | default block gap |
| `spacing/5` | 20 | — |
| `spacing/6` | 24 | section padding |
| `spacing/8` | 32 | section gaps |
| `spacing/16` | 64 | page-level spacing |

**Layout gaps** (auto-layout between regions): `layout-gap/xs 6 · sm 12 · md 20 · lg 32`.

## Border radius (px)
`border-radius/2xs 2 · xs 4 · sm 8 · md 12 · lg 20 · xl 32 · full 999`
- **Components carry their own radius token** — e.g. **each button size has its own radius**; use the
  component default, don't override it.
- Containers you build yourself: **cards & dialogs → `lg` (20)**. Pills/avatars → `full`.

**Form field spacing:** gap between fields = `layout-gap/md` (20). Use the `Form Control` component
(label + hint + error built in) — see [../guidelines/README.md](../guidelines/README.md).

## Icon sizes (px)
`10 · 12 · 16 · 18 · 20 · 22 · 24` (`icon-size/*`). Default inline icon **20**; small **16**.

## Text sizes / line-heights (px)
Sizes: `2xs 10 · xs 12 · sm 13 · md 14 · lg 16 · 2xl 19 · 3xl 23`.
Line-heights: `2xs 15 · xs 17 · sm 18 · md 20 · lg 24 · 2xl 28 · 3xl 30`.
(Use the named **text styles** in [typography.md](typography.md) rather than raw sizes.)

## Rules
- Use **auto-layout** with these gaps/paddings; no arbitrary offsets.
- Match the spacing of the nearest existing screen for consistency.
