# Breadcrumb Item

**Component set key:** `1a1c02db3c3004ebb53e9fa294c079592ed8043e`
**Figma page:** `⚛️ Breadcrumbs`
**Variants in set:** 2

## Description

Breadcrumb Item is a single node in the breadcrumb trail navigation component. Multiple Breadcrumb Items are composed in sequence to show the user's location within the app hierarchy and provide a way to navigate back to parent levels. The last item in the trail represents the current page and is rendered without a navigation link.

## Variants / Properties

### LastChild axis
| Value | Description |
|---|---|
| `False` | Item is an ancestor page — renders as a link with a separator after it. |
| `True` | Item is the current page — renders as plain text without a link, no separator. |

## Usage rules

- Always set `LastChild=True` on the final breadcrumb item representing the current page.
- Keep breadcrumb labels short — match the page or section title exactly.
- Do not show breadcrumbs on top-level pages that have no parent.
