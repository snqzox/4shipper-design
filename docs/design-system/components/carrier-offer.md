# Carrier Offer

**Component set key:** `afe75433038bd3e1b44898cefb56d1cf496558eb`
**Figma page:** `Tenders - Shipper`
**Variants in set:** 14

## Description

Carrier Offer is the card component representing a single carrier's price submission in the shipper's tender evaluation view. It shows the carrier identity, submitted price, submission date, and the current offer state (default, selected, sent to carrier, confirmed, rejected, or removed). The shipper uses this component to compare and act on competing offers during the evaluation phase.

## Variants / Properties

### Property 1 axis (offer state)
| State | Description |
|---|---|
| `Default` | Offer received — no action taken yet. |
| `Seleted` | Offer is selected by the shipper for further action. (Note: variant name has a typo in Figma.) |
| `Sent to carrier` | Shipper has sent a counter-offer or acceptance to the carrier. |
| `Confirmed` | Carrier has confirmed the offer — a contract will be created. |
| `Rejected` | Shipper rejected this offer. |
| `Rejected - Selected` | A rejected offer that is also selected (mass action context). |
| `Removed` | Offer has been removed from the comparison set. |

### Style axis
| Value | Description |
|---|---|
| `Compact` | Condensed layout — used in the multi-offer comparison table. |

### State axis
| Value | Description |
|---|---|
| `Default` | Standard resting state. |

### Disabled axis
| Value | Description |
|---|---|
| `False` | Interactive — actions available. |
| `True` | Actions disabled — e.g., during a loading or locked state. |

## Usage rules

- Use only in the shipper tender evaluation (Price Offers) view.
- Always show all received offers, including `Rejected` and `Removed` ones, so the shipper has a complete audit trail.
- The `Confirmed` state should appear at most once per tender.
