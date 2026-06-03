# Waypoint combinations

**Component set key:** `c7429a4eccdd95961a68f9adf5c027477fcd78cd`
**Figma page:** `Tenders - Shipper`
**Variants in set:** 2

## Description

Waypoint combinations is a composite component that shows a complete set of waypoints arranged in sequence for the tender route-building form. It groups multiple `Waypoint Entry` instances together with add/remove controls and ordering connectors. Use it when designing the multi-waypoint editing surface in tender creation.

## Variants / Properties

### Property 1 axis
| Variant | Description |
|---|---|
| `Default` | Standard waypoint sequence with at least two stops. |
| `Variant2` | Alternative arrangement — verify in Figma for the specific layout. |

## Related components

- `Waypoint Entry` — the individual editable waypoint row.
- `Routes` — the read-only route summary used in detail views.

## Usage rules

- Use `Waypoint combinations` for the editing surface; use `Routes` for read-only display.
- Always enforce at minimum one origin and one destination stop.
