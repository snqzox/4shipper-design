# Status

**Component set key:** `9b4e31abdd930c8f349ecc2b409663d79a468ddb`
**Figma page:** `⚛️ Status`
**Variants in set:** 8

## Description

Status is the generic status badge for entities that do not have a dedicated domain-specific status component. Use it for states that cut across domains or for new entity types before a domain-specific set is established. Where a domain-specific set exists (`Status/Tender`, `Status/Transports`, `Status/Requests`, `Status/Contract`), prefer that component instead.

## Variants / Properties

### Status axis
| Status | Meaning |
|---|---|
| `Active` | Entity is currently active and valid. |
| `Draft` | Entity has been created but not yet published or submitted. |
| `Collecting offers` | Open for submissions or bids. |
| `Evaluation` | Submissions received; under review. |
| `Expired` | Passed its validity period. |
| `Finished` | Process completed successfully. |
| `Canceled` | Process terminated before completion. |
| `Status8` | Placeholder — check Figma for the intended value before using. |

## Usage rules

- Prefer domain-specific `Status/*` components over this generic set when the entity domain is known.
- Do not use `Status8` in production screens until it carries a defined meaning.
