# Shipper/Contract/List Entry

**Component set key:** `d97ad6bb6da15a7aac2ce42a36d2f9efd24c3b7a`
**Figma page:** `Tenders - Shipper`
**Variants in set:** 4

## Description

Shipper/Contract/List Entry is the row component for the shipper's contract list view. Each row represents a freight contract and displays the carrier name, route, validity period, and contract status. Use it exclusively in the shipper-facing contracts list.

## Variants / Properties

### Status axis
| Status | Description |
|---|---|
| `Active` | Contract is in force. |
| `Scheduled` | Contract is agreed but not yet in effect (start date in the future). |
| `Expired` | Contract end date has passed. |
| `Canceled` | Contract was terminated early. |

## Related components

- `Status/Contract` — the embedded status badge.

## Usage rules

- Use only in the shipper contracts list view.
- The status must match the backend contract state exactly.
