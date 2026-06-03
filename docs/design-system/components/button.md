# Button

**Component set key:** `20ca3f58e52ca60646e8a283cd2b3218285c1d4a` (node `15:105`)
**Figma page:** `⚛️ Button`
**Variants in set:** 27

## Description

Button is the primary interactive trigger for actions in the 4Shipper / Transportly UI. Use it whenever the user needs to submit a form, confirm a dialog, navigate to a next step, or trigger any immediate action. Choose the variant that conveys the appropriate weight and intent of the action.

## Variants / Properties

### Variant axis
| Variant | When to use |
|---|---|
| `Primary` | The single most important action on a surface — confirm, submit, proceed. |
| `Primary Subtle` | A softer alternative to Primary; use when a full-weight Primary would compete with other elements. |
| `Secondary` | Supporting or alternative actions alongside a Primary button. |
| `Ghost` | Low-emphasis actions or toolbar-style controls that should not draw attention. |
| `Body` | Neutral, body-weight action that sits inline with content. |
| `Link` | In-context hyperlink-style action; lowest visual weight. |
| `Danger` | Destructive actions (delete, cancel, reject). Filled, high attention. |
| `Danger Subtle` | Destructive actions where a softer treatment is preferred (e.g., inline removes). |
| `Inverted` | Use on dark or coloured backgrounds where the standard palette would not contrast. |

### State axis
| State | Description |
|---|---|
| `Default` | Resting, ready for interaction. |
| `Hover` | Cursor is over the button. |
| `Disabled` | Action is not currently available; non-interactive. |

### Component properties (non-variant)
| Property | Type | Default | Effect |
|---|---|---|---|
| `hasLeftIcon` | boolean | `true` | Leading (left) icon slot. |
| `hasRightIcon` | boolean | `false` | Trailing (right) icon slot. |
| `hasText` | boolean | `true` | Shows the label; set `false` for an icon-only button. |
| `hasBadge` | boolean | `false` | Trailing count badge. |
| `isDropdown` | boolean | `false` | Adds a chevron for menu / dropdown triggers. |
| `text` | text | `"Button"` | The button label. |

### Size (not a property)
Size is **not** a variant or component property — it is driven by the **`input-sizes` variable mode** on the
enclosing frame: `xs 28 / sm 34 / md 42 / lg 48` px (variable `button/size`). The collection's default mode is
`xs`; the component bakes `md` onto each instance. To render another size, set the frame's `input-sizes` mode
and clear the instance's baked override (see `design-system-manager` → *Writing to Figma* for the pattern).

A live in-Figma showcase of all of the above (properties, variant×state in light/dark, sizes) lives on the
**`📖 Docs / Button`** page in the UI Kit file.

## Usage rules

- Never place two `Primary` buttons side by side on the same surface.
- Use `Danger` / `Danger Subtle` for any action that is destructive or hard to reverse.
- `Link` buttons should only appear inline with text or in dense toolbars — do not use them as standalone page-level CTAs.
- Always pair a `Danger` confirmation with an `Alert Dialog` before executing.
