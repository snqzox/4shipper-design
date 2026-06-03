# Badge

**Component set key:** `22ac6b48fd8d58b488643fa29de41607956ec4dc` (node `18:968`)
**Figma page:** `⚛️ Badge`
**Variants in set:** 7

## Description

Badge is a compact inline label used to classify, tag, or count items. It appears alongside text, inside table cells, or on top of other elements to communicate a categorical attribute or a numeric count. Badges do not trigger actions — they are purely informational.

## Variants / Properties

### Variant axis

Default variant: `Body Inverted`.

| Variant | When to use |
|---|---|
| `Body Inverted` | Default. Neutral badge for dark surfaces / high-contrast contexts. |
| `Body` | Minimal badge that blends with body text on light surfaces. |
| `Primary` | Highlighted or featured classification using the brand primary colour. |
| `Secondary` | Neutral classification — common default for general tags. |
| `Danger` | Critical or failed classification (e.g., rejected, overdue). |
| `Warning` | Needs attention but not critical (e.g., pending, near expiry). |
| `Success` | Positive / completed classification (e.g., delivered, approved). |

### Component properties (non-variant)

| Property | Type | Default | Effect |
|---|---|---|---|
| `dismissible` | boolean | `false` | Adds a trailing `×` remove control (e.g. removable filter chips). |
| `hasIcon` | boolean | `true` | Leading icon slot; set `false` for a text-only badge. |
| `text` | text | `"Badge"` | The badge label. Keep it to one or two words. |

### Size (not a property)

Size is **not** a variant or component property — it is driven by the **`badge` variable mode** on the
enclosing frame: `sm 20 / md 24` px (variable `badge/size`). To render another size, set the frame's `badge`
mode and clear the instance's baked override (see `design-system-manager` → *Writing to Figma*).

A live in-Figma showcase of all of the above (properties, variants in light/dark, sizes) lives on the
**`📖 Docs / Badge`** page in the UI Kit file.

## Usage rules

- Use `Warning`, `Danger`, and `Success` variants only for genuinely meaningful status information, not for decoration.
- Do not use a Badge as a button or to trigger navigation.
- For lifecycle statuses (tender, transport, contract) use the dedicated `Status/*` components instead of Badge.
- Keep badge text short — one or two words maximum.
