# Status/Contract

**Component set key:** `a5e9a696b4b111dd1ffe19398e4e69fad893c995`
**Figma page:** `⚛️ Status`
**Variants in set:** 4

## Description

Status/Contract is the status badge for contract lifecycle states. Use it in contract list rows, contract detail headers, and any view that surfaces the current standing of a freight contract.

## Variants / Properties

### Status axis
| Status | Meaning |
|---|---|
| `Active` | Contract is in force and valid. |
| `Expired` | Contract end date has passed. |
| `Canceled` | Contract was terminated before its end date. |
| `Status8` | Placeholder variant — check Figma for the intended status value before using in designs. |

## Related components

- `Shipper/Contract/List Entry` — list row component that embeds this status.
- `Status/Tender`, `Status/Requests`, `Status/Transports` — parallel status sets for other domains.

## Usage rules

- Do not use `Status8` in production designs until it has a defined semantic meaning.
- Always use the domain-specific `Status/Contract` component rather than generic `Badge` for contract states.
