# Address entry

**Component set key:** `2d7256afe9b9b7baeaccf395caae1d50a0c13d47`
**Figma page:** `Tenders - Shipper`
**Variants in set:** 5

## Description

Address entry is a structured address display and selection row used within route and waypoint contexts. It renders a formatted address and provides different interaction models depending on whether the user is browsing a list, selecting a saved address, or viewing a read-only summary.

## Variants / Properties

### Property 1 axis
| Variant | Description |
|---|---|
| `List item` | Address appears in a scrollable list — no selection affordance, used for display. |
| `Selectable` | Address can be selected from a list — renders a hover/focus state. |
| `Selected` | Address has been chosen — renders a highlighted selected state. |
| `Radio` | Address is selectable via a radio button — one-of-many selection in a group. |
| `Read Only` | Address is displayed as non-interactive text — used in summaries and confirmations. |

## Related components

- `Waypoint Entry` — the parent component that embeds an Address entry.
- `Input` (Type=Location) — the search/lookup field used before an address is confirmed.

## Usage rules

- Use `Selectable` + `Selected` pair in lists where the user chooses from previously saved addresses.
- Use `Radio` when the address is one option in a clearly bounded set (e.g., pickup from warehouse A or B).
- Use `Read Only` in order confirmations and detail views where the address cannot be changed.
