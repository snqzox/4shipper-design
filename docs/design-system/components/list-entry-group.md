# List Entry Group

**Component set key:** `0d5fa8714c77d8b442233f27f1a7dee4e3330267`
**Figma page:** `⚛️ Checkbox, Radio, Switch (Toggle)`
**Variants in set:** 6

## Description

List Entry Group is a collapsible category header that wraps a set of `List Entry` rows. It allows long selection lists to be organised into named groups that can be expanded or collapsed to reduce cognitive load. Use it when a selection list contains more than ~8 options that naturally fall into categories.

## Variants / Properties

### Expanded axis
| Value | Description |
|---|---|
| `False` | Group is collapsed — child entries are hidden; only the group header is visible. |
| `True` | Group is expanded — all child `List Entry` rows are visible. |

### Selected axis
| Value | Description |
|---|---|
| `False` | No child entry in this group is selected. |
| `True` | At least one child entry is selected — the group header shows an indeterminate or selected indicator. |

### Selectable axis
| Value | Description |
|---|---|
| `True` | The group header itself acts as a select-all control for its children. |
| `False` | Group header is a label only — individual rows must be selected independently. |

## Related components

- `List Entry` — the individual selectable rows inside the group.

## Usage rules

- Use `Selectable=True` on the group header when select-all behaviour is appropriate for the use case.
- Always start groups in the `Expanded=True` state on first load unless the list is very long (>20 total options).
