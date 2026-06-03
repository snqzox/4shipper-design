# Content

**Component set key:** `364c3c7e918497ac616e26a9e48f0a6f799d71ae`
**Figma page:** `Tenders - Shipper`
**Variants in set:** 3

## Description

Content is a page-level content area container for the tender detail view in the shipper flow. It holds the main content panel and switches between the two primary tabs of the tender detail: Tender Details and Price Offers. An additional variant (`Variant3`) provides a third content arrangement. Use this component when framing the full content body of a tender detail page.

## Variants / Properties

### Property 1 axis
| Variant | Description |
|---|---|
| `Tender Details` | Shows the tender information tab — route, cargo, dates, and settings. |
| `Price Offers` | Shows the price offers tab — the list of carrier offer cards and the action stripe. |
| `Variant3` | A third content configuration — verify in Figma for its specific purpose. |

## Related components

- `Shipper - Price Offers - Action Stripe` — the action bar rendered within `Price Offers` content.
- `Carrier Offer` — the offer cards rendered in the `Price Offers` content variant.
- `Step Progress Tabs` — the tab navigation that switches between these content variants.

## Usage rules

- Use only in the shipper-facing tender detail page.
- The active `Content` variant must match the selected tab in `Step Progress Tabs`.
