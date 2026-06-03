# Tender/Draft Status

**Component set key:** `b036747bf9b7febea2ae855632be5a47e3888459`
**Figma page:** `Tenders - Carrier`
**Variants in set:** 3

## Description

Tender/Draft Status is a carrier-facing status indicator used in the carrier's tender browsing view to communicate the state of a tender from the carrier's perspective. It may differ from the shipper-facing `Status/Tender` in the labels or visual treatment appropriate for the carrier role.

## Variants / Properties

### Property 1 axis
| Variant | Description |
|---|---|
| `Default` | Primary/default tender status. |
| `Variant2` | Secondary status variant — verify in Figma. |
| `Variant3` | Tertiary status variant — verify in Figma. |

## Related components

- `Status/Tender` — the library-level tender status badge (shipper-facing).

## Usage rules

- Use only in carrier-facing tender views.
- Align labels with the backend API status values returned to the carrier role.
