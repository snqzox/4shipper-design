# Route Entry

**Component set key:** `0435debb38ad77e167b74da63766b0fe81d0e45f`
**Figma page:** `⚛️ Route Entry`
**Variants in set:** 11

## Description

Route Entry is a single waypoint row in a read-only or interactive route display. It renders stop information (location, date/time) with a visual connector indicating its position in the sequence (First, Middle, Last). It supports both selectable (for carrier route browsing) and non-selectable (for shipper summary display) modes.

## Variants / Properties

### Order axis
| Order | Description |
|---|---|
| `First` | First stop in the route — renders the start node of the route connector. |
| `Middle` | An intermediate stop — renders a mid-connector node. |
| `Last` | Final stop in the route — renders the end node. |

### Selected axis
| Value | Description |
|---|---|
| `False` | Stop is not highlighted. |
| `True` | Stop is selected/active — highlighted state. |

### Expanded axis
| Value | Description |
|---|---|
| `False` | Compact view — shows location and date only. |
| `True` | Expanded view — reveals additional stop details. |

### Selectable axis
| Value | Description |
|---|---|
| `False` | Row is display-only — no selection interaction. |
| `True` | Row can be selected by the user. |

## Related components

- `Route Entry 2` — alternative/supplementary route entry style.
- `Waypoint Entry` — the editable counterpart used in form creation flows.

## Usage rules

- Use `First` and `Last` only once per route; all intermediate stops use `Middle`.
- Use `Selectable=False` in read-only tender/transport detail views.
