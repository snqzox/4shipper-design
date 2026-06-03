# Separator

**Component set key:** `a3fb12818666b571f7258308e28c363caac57ee1`
**Figma page:** `⚛️ Separator`
**Variants in set:** 8

## Description

Separator is a visual dividing line used to group related content and create clear section boundaries within a layout. It supports both horizontal and vertical orientations and four spacing sizes to accommodate different layout densities.

## Variants / Properties

### Orientation axis
| Orientation | Description |
|---|---|
| `Horizontal` | Horizontal rule — divides stacked content vertically on the page. |
| `Vertical` | Vertical rule — divides side-by-side content within a row. |

### Spacing axis
| Spacing | Description |
|---|---|
| `0` | No margin around the separator — flush against adjacent content. |
| `SM` | Small margin. |
| `MD` | Default/medium margin. |
| `LG` | Large margin — use when more breathing room is needed between sections. |

## Usage rules

- Use `MD` spacing as the default unless the layout has explicit density requirements.
- Do not use a Separator purely for decoration — it should mark a meaningful logical boundary.
- Prefer `Vertical` separators inside horizontal flex rows (e.g., toolbar button groups).
- Prefer `Horizontal` separators between stacked card sections or form groups.
