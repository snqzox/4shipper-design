# Input

**Component set key:** `099f28920bd6afafaf67b52308c4e72e89d6d351`
**Figma page:** `⚛️ Input & Form Control`
**Variants in set:** 24

## Description

Input is the single-line data-entry field used across all forms in the 4Shipper / Transportly product. It handles free text, structured date values, location lookups, combo-box selections, multi-value tag entry, and dropdown-style select controls. Each type presents an appropriately specialised affordance while sharing the same visual shell.

## Variants / Properties

### Type axis
| Type | When to use |
|---|---|
| `Text` | Free-form single-line text (names, notes, references). |
| `Date` | Date entry; renders a calendar picker affordance. |
| `Location` | Address or place lookup with geographic autocomplete. |
| `Combo` | Combobox — searchable dropdown with free-text fallback. |
| `Select` | Dropdown-only selection; user cannot type a custom value. |
| `Tags` | Multi-value input; each confirmed value becomes a removable tag chip. |

### Empty axis
| Value | Meaning |
|---|---|
| `True` | Field has no value — shows placeholder text. |
| `False` | Field is populated — shows entered value. |

### Disabled axis
| Value | Meaning |
|---|---|
| `False` | Interactive — user can focus and edit. |
| `True` | Non-interactive — value is read-only; field is visually dimmed. |

## Usage rules

- Always pair an Input with a `Form Control` wrapper to get the label, helper text, and error state.
- Use `Location` type for any address or waypoint field so the geographic autocomplete is available.
- Use `Tags` when the user may supply multiple values for a single field (e.g., commodity types).
- Never disable an Input that the user has not seen in an enabled state first — prefer hiding the field or providing context about why it is locked.
