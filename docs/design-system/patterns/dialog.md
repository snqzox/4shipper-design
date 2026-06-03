# Pattern: Dialog / Modal

> **Always build dialogs from the `Dialog` component — never assemble dialog chrome from frames.**
> The component owns the header, close button, separators, padding, and footer. You only set the
> title, fill the content slot, and set the footer button labels.

## Component
- **`Dialog`** (component set) — key `b7b4cddbe894cd06225d17a25d1c720709322145`.
- Structure: `_Dialog/Header` (Title + Subtitle) · `Holder` (SLOT — your content) · `_Dialog/Footer`
  (left `Button` + right `Primary Button`, `Secondary Button` hidden) · close `Button` (X).
- Props: `Holder#5250:3` (SLOT), `Has Headline#6972:163`, `Show Top/Bottom Separator`.
- For an **alert/confirmation** dialog use the **`Alert Dialog`** component instead (key `5a1f98ea3a5219cd13f0e42d46363d163596885d`).

## Recipe (use_figma)
1. `const set = await figma.importComponentSetByKeyAsync('b7b4cddbe894cd06225d17a25d1c720709322145');`
   `const inst = set.defaultVariant.createInstance();` → place on the target page; `inst.resize(width, inst.height)`.
2. **Header / footer text FIRST, while the tree is pristine:**
   - Title: `header.findOne(n => n.type==='TEXT' && n.name==='Title')` → `setText(...)`; hide `Subtitle` (`.visible=false`) if unused.
   - Footer: set the text node inside `Primary Button` and the visible left `Button`; the rest are pre-styled.
3. **Fill the `Holder` slot LAST.** Build a content frame (vertical auto-layout, field gap `layout-gap/md` 20,
   padding `spacing/6` 24 / sides 32), add `Form Control` instances, then `holder.appendChild(content)`.
   The Holder is auto-layout → set `content.layoutAlign = 'STRETCH'`.

## Gotchas (learned the hard way)
- **Never empty the slot** (`remove` all its children before adding) — an empty slot collapses and its
  node disappears. Append your content first, *then* remove/hide the default placeholder.
- **Do all `findOne` lookups before mutating the slot.** Slot edits invalidate tree traversal, so a
  `findOne` after a slot change can crash. Cache header/footer/button refs up front.
- Set button labels via the nested button's **text node** (`.characters`) — robust across nested instances.

## Form content inside a dialog
- Use **`Form Control`** for each field (label/hint/error built in) — see [../guidelines/README.md](../guidelines/README.md).
- One column; gap between fields = `layout-gap/md` (20).
