# Status/Tender

**Component set key:** `78fa65f4c6a21fc2b1d4005f485c1758e6c65295`
**Figma page:** `⚛️ Status`
**Variants in set:** 5

## Description

Status/Tender is the status badge for tender lifecycle states. Use it in tender list rows, tender detail headers, and anywhere the stage of a tender process needs to be communicated visually.

## Variants / Properties

### Status axis
| Status | Meaning |
|---|---|
| `Draft` | Tender has been created but not yet published. |
| `Collecting offers` | Tender is live — carriers can submit price offers. |
| `Evaluation` | Offer collection has ended; shipper is reviewing submissions. |
| `Finished` | Tender completed — a carrier was selected. |
| `Canceled` | Tender was cancelled and is no longer active. |

## Related components

- `Status/Requests` — request-level status.
- `Status/Transports` — transport execution status.
- `Status/Contract` — contract status.
- `Shipper/Tender/List Entry` — list row that embeds this status.

## Usage rules

- Mirror the exact backend tender state in the status component — do not approximate or merge states.
- The `Draft` status should only be visible to the shipper who created the tender, not to carriers.
