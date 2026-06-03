# Contracts/Entry

**Component set key:** `8d1a74cc8274c168adbdbbf21cf978671911735f`
**Figma page:** `Tenders - Carrier`
**Variants in set:** 2

## Description

Contracts/Entry is the row component for the carrier's contracts list view. It displays contract details visible from the carrier's perspective — shipper identity, route, validity period, and contract status. Use it exclusively in the carrier-facing contracts list.

## Variants / Properties

### Property 1 axis
| Variant | Description |
|---|---|
| `Default` | Standard contract row. |
| `Variant2` | Alternative state or layout — verify in Figma for the current treatment. |

## Related components

- `Shipper/Contract/List Entry` — equivalent component for the shipper role.

## Usage rules

- Use only in the carrier-facing contracts list view.
- Do not use `Shipper/Contract/List Entry` in carrier-facing screens — the data model and actions differ by role.
