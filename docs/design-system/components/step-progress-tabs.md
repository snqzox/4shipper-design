# Step Progress Tabs

**Component key:** `f78504a8d023e7c87220778790205a014ebdf61c`
**Figma page:** `⚛️ Step Progress Tabs`
**Variants in set:** 1 (single component, no variant axes)

## Description

Step Progress Tabs is the tab-strip variant of multi-step navigation used on detail pages such as the tender detail view. Unlike `Stepper`, which is used inside creation wizards, Step Progress Tabs is used to navigate between named sections of an already-created entity. Each tab represents a section and may carry a completion or activity indicator to show how far through the workflow the user has progressed.

## Related components

- `Stepper` — linear step indicator for wizard-style creation flows.
- `Tabs` — generic horizontal or vertical tab navigation without progress semantics.

## Usage rules

- Use Step Progress Tabs only when the sections have a defined order or dependency.
- For non-sequential content grouping, use the generic `Tabs` component instead.
- Do not duplicate this component for flat navigation where no progress tracking is needed.
