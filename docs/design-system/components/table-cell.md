# Table Cell

**Component set key:** `cf0997e6ec79e032395dfa682fbaeff7a93a58a3`
**Figma page:** `⚛️ Table`
**Variants in set:** 6

## Description

Table Cell is the atomic building block of data tables in 4Shipper / Transportly. It exists in two roles — `Head` (column header) and `Cell` (data row) — and supports three horizontal alignments. Compose Table Cell instances into rows within the `Table` layout component.

## Variants / Properties

### Variant axis
| Variant | Description |
|---|---|
| `Head` | Column header cell — renders label text with sorting affordance if needed. |
| `Cell` | Data row cell — renders the row value. |

### Align axis
| Align | When to use |
|---|---|
| `Left` | Default for text content (labels, names, descriptions). |
| `Center` | Short categorical values (flags, icons, status indicators). |
| `Right` | Numeric values (prices, quantities, percentages) so decimal points align. |

## Usage rules

- Always right-align numeric columns; always left-align text columns.
- Use `Head` cells only in the first (header) row of a table.
- Do not mix alignments within a column — the `Head` and all `Cell` entries for the same column must share the same `Align` value.
