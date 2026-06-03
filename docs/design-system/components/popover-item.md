# Popover Item

**Component set key:** `73c5795f0f8d8c4d2cc75712a81bc2e74900cc52`
**Figma page:** `⚛️ Popover`
**Variants in set:** 4

## Description

Popover Item is a single row within a `Popover` overlay panel. It functions similarly to `Dropdown Item` but is used inside a popover rather than a standard dropdown menu — typically for contextual action menus, filter panels, or more complex selection surfaces where the popover has additional chrome around the list.

## Variants / Properties

### State axis
| State | Description |
|---|---|
| `Default` | Resting state — visible and interactive. |
| `Hover` | Cursor is over the row — highlighted background. |

### Selected axis
| Value | Description |
|---|---|
| `False` | Item is not the active selection. |
| `True` | Item is the current selection — renders a checked or highlighted state. |

## Related components

- `Dropdown Item` — equivalent row component inside a `Dropdown` menu.
- `Popover` — the container that houses multiple `Popover Item` rows.

## Usage rules

- Use `Popover Item` only inside a `Popover` container; use `Dropdown Item` inside a `Dropdown`.
- Follow the same single/multi-select logic as `Dropdown Item`.
