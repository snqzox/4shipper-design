# Route entry (form)

**Component set key:** `0241ecfe0ead3dd425670f0099c0fae4143ae781`
**Figma page:** `Tenders - Shipper`
**Variants in set:** 6

## Description

Route entry (form) is a selectable or read-only route stop row used in the tender creation/editing form context — specifically in route selection or review steps. Unlike the atomic `Route Entry` component (on the `⚛️ Route Entry` page), this component is domain-specific to the Tenders - Shipper flow and includes radio/check selection affordances.

Note: The exact Figma component set name is `Route entry` (lowercase 'e') — distinguish it from `Route Entry` (the library component on `⚛️ Route Entry`).

## Variants / Properties

### Selected axis
| Value | Description |
|---|---|
| `False` | Stop is not selected. |
| `True` | Stop is selected. |
| `N/A` | Selection state is not applicable (read-only rows). |

### Type axis
| Type | Description |
|---|---|
| `Radio` | Stop row with a radio button for single selection. |
| `Check` | Stop row with a checkbox for multi-selection. |
| `Read Only` | Stop row displayed as non-interactive. |
| `Read Only 2` | Alternative read-only treatment. |

## Usage rules

- Use this component only within tender creation and editing forms in the shipper flow.
- For read-only display of routes in tender detail views, use the library `Route Entry` component instead.
