# Routes

**Component set key:** `09b98ef14f856efe42052955fb333e9aac7ee7f5`
**Figma page:** `Tenders - Shipper`
**Variants in set:** 2

## Description

Routes is a composite component that displays the full route overview for a tender — the complete list of waypoints in sequence. It is used in tender detail and summary views to give a condensed overview of the transport route. It has two data states: populated (showing actual route data) and empty (showing a placeholder when no route has been defined yet).

## Variants / Properties

### Data axis
| Value | Description |
|---|---|
| `Data2` | Route data is present — renders waypoints in sequence. |
| `Empty` | No route defined — renders a placeholder or empty state. |

## Related components

- `Route Entry` — the individual waypoint rows rendered inside this component.
- `Waypoint Entry` — the editable waypoint used in route creation.

## Usage rules

- Always show the empty state when a tender is in `Draft` status and no route has been entered.
- Use `Routes` for summary display; for detailed editing use `Waypoint Entry` components.
