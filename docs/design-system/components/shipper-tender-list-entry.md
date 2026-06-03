# Shipper/Tender/List Entry

**Component set key:** `5d6bf46e05d2574670870cc5018c2e6724b854dc`
**Figma page:** `Tenders - Shipper`
**Variants in set:** 5

## Description

Shipper/Tender/List Entry is the row component used in the shipper's tender list view. Each row represents one tender and surfaces key information: tender name, route summary, date range, number of offers, and the current lifecycle status. The row's visual treatment changes based on the tender status.

## Variants / Properties

### Status axis
| Status | Description |
|---|---|
| `Draft` | Tender is unpublished — dimmed or draft treatment. |
| `Collecting` | Tender is live and collecting carrier offers. |
| `Evaluation` | Offer collection closed; shipper is evaluating. |
| `Finished` | Tender process complete. |
| `Canceled` | Tender was cancelled. |

## Related components

- `Status/Tender` — the status badge embedded within this row.
- `Shipper - Price Offers - Action Stripe` — the action bar shown when rows are in mass-selection mode.

## Usage rules

- Use only on shipper-facing tender list screens.
- The status variant must always reflect the actual backend tender state.
