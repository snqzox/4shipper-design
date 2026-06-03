# Status/Transports

**Component set key:** `5c14a532c94f1d0a37b4b51d0d7a8124efaab4d6`
**Figma page:** `⚛️ Status`
**Variants in set:** 4

## Description

Status/Transports is the status badge for transport execution lifecycle states. Place it in transport list rows, transport detail headers, and any summary view where the execution status of a transport needs to be visible at a glance.

## Variants / Properties

### Status axis
| Status | Meaning |
|---|---|
| `In progress` | Transport is currently being executed (en route). |
| `Processing` | Transport has been confirmed and is being prepared. |
| `Bidding completed` | Bidding phase is over; transport is awaiting assignment. |
| `Canceled` | Transport was cancelled before or during execution. |

## Related components

- `Status/Requests` — for transport request states.
- `Status/Tender` — for tender lifecycle states.
- `Status/Contract` — for contract states.

## Usage rules

- Use this component exclusively for transport execution states — not for tender or contract states.
- Do not substitute a generic `Badge` or `Status` component when a domain-specific `Status/Transports` variant exists.
