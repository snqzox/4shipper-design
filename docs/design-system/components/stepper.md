# Stepper

**Component set key:** `6ee31571c705f9b4da0520dfef197b341c7c7b7b`
**Figma page:** `Tenders - Shipper`
**Variants in set:** 4

## Description

Stepper is the multi-step progress indicator used in wizard-style flows, most prominently in the New Tender creation form. It renders a numbered sequence of steps and visually communicates which step is currently active. Use it at the top of any multi-page form or guided workflow to orient the user within the process.

## Variants / Properties

### Step axis
| Step | Description |
|---|---|
| `1` | First step is active; all subsequent steps are upcoming. |
| `2` | Second step is active; step 1 is completed. |
| `3` | Third step is active; steps 1–2 are completed. |
| `4` | Fourth step is active; steps 1–3 are completed. |

## Related components

- `Step Progress Tabs` — tab-based variant of step navigation used on the tender detail page.

## Usage rules

- Always show all steps in the sequence upfront so the user understands the full scope of the form.
- Completed steps should be visually distinct from the active step and upcoming steps.
- Do not allow the user to jump to a future step that has unsatisfied prerequisites.
