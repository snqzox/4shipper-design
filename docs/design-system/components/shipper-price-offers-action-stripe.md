# Shipper - Price Offers - Action Stripe

**Component set key:** `307ad833bb01b344891b309e907c86b01606cbcc`
**Figma page:** `Tenders - Shipper`
**Variants in set:** 3

## Description

Shipper - Price Offers - Action Stripe is the contextual action bar that appears at the top of the carrier offers list in the tender evaluation view. It provides bulk/mass-selection controls and status-appropriate actions (e.g., "Accept", "Reject all selected") depending on the current tender status. It is only shown on the Price Offers tab.

## Variants / Properties

### Status axis
| Status | Description |
|---|---|
| `Collecting Offers` | Tender is still open — the stripe shows limited actions appropriate for this phase. |
| `Evaluation` | Offer collection is closed — full evaluation actions (accept, reject) are available. |

### Mass Selection axis
| Value | Description |
|---|---|
| `False` | No items selected — action stripe shows default state without bulk-action controls. |
| `True` | One or more offers are selected — bulk-action controls are active. |

## Usage rules

- Only display this stripe on the Price Offers tab of a tender in `Collecting Offers` or `Evaluation` status.
- Show `Mass Selection=True` state only when the user has checked at least one offer row.
