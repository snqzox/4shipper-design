# Status/Requests

**Component set key:** `4b790686479e200cc09bc9c4b3295e70e576246b`
**Figma page:** `⚛️ Status`
**Variants in set:** 4

## Description

Status/Requests is a specialised status badge for transport request lifecycle states. Use it in any view that lists or details transport requests to communicate the current processing stage at a glance.

## Variants / Properties

### Status axis
| Status | Meaning |
|---|---|
| `Active` | Request is open and being processed. |
| `Bidding completed` | The bidding window has closed; a winner may be selected. |
| `Expired` | Request passed its deadline without completion. |
| `Rejected by carrier` | The carrier declined the request. Note: variant name contains a typo (`carrrier`) in Figma — use the component as-is. |

## Related components

- `Status/Transports` — status labels for transport executions.
- `Status/Tender` — status labels for tender lifecycle.
- `Status/Contract` — status labels for contract states.
- `Status` (generic) — broader status set used when a domain-specific set does not apply.

## Usage rules

- Do not substitute a `Badge` for a `Status/Requests` chip — status components carry domain-specific colour semantics.
- Always use the exact status value that maps to the backend state; do not invent intermediate states.
