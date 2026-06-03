# Attachment entry

**Component set key:** `14d219a03dddd8ef66cdaf9d708890d40b99fa92`
**Figma page:** `⚛️ Attachment`
**Variants in set:** 2

## Description

Attachment entry is a single file row within the `Attachment` list component. It displays a file name, file type indicator, and action controls (download, delete). Use it to represent an uploaded or attached document — for example, cargo manifests, compliance certificates, or transport confirmation PDFs — in tender and transport detail views.

## Variants / Properties

### State axis
| State | Description |
|---|---|
| `Default` | Standard resting state for the attachment row. |
| `Hover` | Cursor is over the row — action controls become more prominent. |

## Usage rules

- Always show the file name and a file-type badge or icon so the user can identify the attachment type.
- Provide a download action on every attachment entry; provide a delete action only when the user has permission to remove the file.
- Do not use `Attachment entry` for images displayed inline — use it for document-type attachments only.
