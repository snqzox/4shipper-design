# Badge

**Component set key:** `153fa52b820dff673cf46e3f59b36bcd0bcc2f83`
**Figma page:** `⚛️ Badge`
**Variants in set:** 7

## Description

Badge is a compact inline label used to classify, tag, or count items. It appears alongside text, inside table cells, or on top of other elements to communicate a categorical attribute or a numeric count. Badges do not trigger actions — they are purely informational.

## Variants / Properties

### Variant axis
| Variant | When to use |
|---|---|
| `Primary` | Highlight or featured classification using the brand primary colour. |
| `Secondary` | Neutral classification — default choice for most tags. |
| `Body` | Minimal-style badge that blends with body text. |
| `Body Inverted` | `Body` style rendered on dark backgrounds. |
| `Warning` | Classification that requires attention but is not critical (e.g., pending, near expiry). |
| `Danger` | Critical or failed classification (e.g., rejected, overdue). |
| `Variant7` | Reserved — check Figma for the current visual definition before using. |

## Usage rules

- Use `Warning` and `Danger` variants only for genuinely meaningful status information, not for decoration.
- Do not use a Badge as a button or to trigger navigation.
- For lifecycle statuses (tender, transport, contract) use the dedicated `Status/*` components instead of Badge.
- Keep badge text short — one or two words maximum.
