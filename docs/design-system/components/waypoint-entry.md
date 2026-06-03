# Waypoint Entry

**Component set key:** `1354b96d50550f644fb43f648f86c504203463e2`
**Figma page:** `Tenders - Shipper`
**Variants in set:** 2

## Description

Waypoint Entry is a single stop in a route definition — it captures the location, date/time window, and any special instructions for a pickup or delivery point. It is composed inside the route-building section of the New Tender form. A complete route consists of at least two Waypoint Entry instances (origin and destination), with optional intermediate stops between them.

## Variants / Properties

### Property 1 axis
| Value | Description |
|---|---|
| `Default` | Standard waypoint entry with all editable fields visible. |
| `Variant2` | Alternative layout or condensed state — verify in Figma for the exact visual treatment. |

## Related components

- `Address entry` — the address lookup field embedded within a Waypoint Entry.
- `Input` (Type=Location) — the underlying location field.
- `Route Entry` — read-only display of a waypoint within a route summary.
- `Waypoint combinations` — composite showing multiple waypoints in a sequence.

## Usage rules

- Every Waypoint Entry must have a location — date/time window may be optional depending on the tender type.
- Always display waypoints in order (first to last) and use sequence indicators to communicate order.
- Do not use Waypoint Entry in read-only route summaries — use `Route Entry` instead.
