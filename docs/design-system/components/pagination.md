# Pagination

**Component set key:** `5030aa01c62a20539f842271f707c4c1cb0e05c6`
**Figma page:** `⚛️ Pagination`
**Variants in set:** 2

## Description

Pagination provides the navigation controls for moving through multi-page datasets such as tender lists, transport tables, and contract records. It renders page number buttons, previous/next arrows, and optionally an ellipsis for large page counts. Place it at the bottom of any table or list that may produce more results than fit on a single screen.

## Variants / Properties

### Variant axis
| Variant | Description |
|---|---|
| `First` | The pagination bar as it appears on the first page — previous arrow is inactive. |
| `Middle` | The pagination bar on any page that is neither first nor last — both arrows active. |

## Usage rules

- Always pair Pagination with a page-size selector if the dataset is large.
- Do not use Pagination for content that should load continuously — use infinite scroll instead.
- The `First` variant is used to initialise the pagination state; switch to `Middle` as soon as page 2 or beyond is active.
