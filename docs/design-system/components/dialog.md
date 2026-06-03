# Dialog

**Component set key:** `177928463ea079f89dd74ed1a32fb705303401c7`
**Figma page:** `⚛️ Dialog`
**Variants in set:** 1

## Description

Dialog is the modal overlay used for focused interactions that require the user's full attention before returning to the main workflow. It blocks the background content and forces a decision or input before it can be dismissed. Use Dialog for multi-field forms, confirmations with context, or any interaction where navigating away would lose important state.

For simple yes/no destructive confirmations use `Alert Dialog` instead.

## Variants / Properties

### Headline property
| Value | Meaning |
|---|---|
| `True` | Dialog renders with a title headline at the top of the panel. |

## Related components

- **Alert Dialog** — lightweight confirmation overlay for destructive or irreversible actions.
- **Button** — always used inside Dialog for primary and secondary actions.
- **Input / Textarea** — placed inside Dialog for inline form interactions.

## Usage rules

- Always provide a clear, action-oriented headline (e.g., "Edit shipment details", not "Dialog").
- Every Dialog must have at least one explicit close action (a cancel button or a close icon).
- Do not nest dialogs — open a new Dialog only after the previous one has been dismissed.
- Keep Dialog content focused; if content requires scrolling, consider a dedicated page or panel instead.
