# Content Box

**Component set key:** `6ccd09b5a1a4a49c2e203f991100b08b43aaf75f`
**Figma page:** `📦 Content Box`
**Variants in set:** 4

## Description

Content Box is a layout container that groups related content into a visually distinct section. It comes in a `Boxed` style (with a border/card treatment) and a `Simple` style (without the card border), and in two sizes to accommodate different amounts of content. Use it to divide a page or panel into clear content regions.

## Variants / Properties

### Style axis
| Style | Description |
|---|---|
| `Boxed` | Renders with a visible card border — creates strong visual separation between sections. |
| `Simple` | No border — creates softer grouping suitable for sections already within a parent card. |

### Size axis
| Size | Description |
|---|---|
| `LG` | Larger internal padding — use for prominent content areas or primary page sections. |
| `MD` | Standard padding — use for secondary sections or when vertical space is limited. |

## Usage rules

- Use `Boxed` for top-level page sections; use `Simple` for sub-sections within an already-boxed area.
- Do not nest `Boxed` Content Boxes — this creates visual noise and confuses the hierarchy.
- Choose `LG` for sections that contain forms or complex content; choose `MD` for compact display sections.
