# Button

**Component set key:** `1486c9a8e275e63d11e9f333cc1d8000d4226070`
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

## Usage rules

- Never place two `Primary` buttons side by side on the same surface.
- Use `Danger` / `Danger Subtle` for any action that is destructive or hard to reverse.
- `Link` buttons should only appear inline with text or in dense toolbars — do not use them as standalone page-level CTAs.
- Always pair a `Danger` confirmation with an `Alert Dialog` before executing.
