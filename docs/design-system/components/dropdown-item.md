# Dropdown Item

**Component set key:** `009a129716b7d5afcb79fd41409095b5e63b84fe`
**Figma page:** `⚛️ Dropdown`
**Variants in set:** 5

## Description

Dropdown Item is a single option row inside a dropdown menu or select popover. It renders a label and optionally a leading icon or trailing check mark. Multiple Dropdown Item instances are stacked vertically inside the `Dropdown` container. Use this component whenever the user needs to pick one value from a list of discrete options.

## Variants / Properties

### State axis
| State | Description |
|---|---|
| `Default` | Resting state — item is visible and interactive. |
| `Hover` | Cursor is over the item — highlighted background. |
| `Disabled` | Item cannot be selected in the current context — visually dimmed. |

### Selected axis
| Value | Description |
|---|---|
| `False` | Item is not the active selection. |
| `True` | Item represents the current selection — renders a check mark or similar indicator. |

## Usage rules

- Use `Disabled` only when the option exists but is contextually unavailable — not to hide options.
- Only one item in a single-select dropdown should have `Selected=True` at any time.
- In a multi-select context, multiple items may carry `Selected=True` simultaneously.
- Keep item labels short (ideally under 40 characters) to prevent truncation in narrow dropdowns.
