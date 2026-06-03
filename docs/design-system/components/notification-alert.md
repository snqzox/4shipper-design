# Notification (Alert)

**Component set key:** `7e4c36aa161d270b0960cd4dbbb89995c2588486`
**Figma page:** `⚛️ Notification (Alert)`
**Variants in set:** 5

## Description

Notification (Alert) is an inline banner used to communicate system-level feedback, warnings, or informational messages directly within a page or form context. Unlike a toast, it is persistent and positioned near the relevant content rather than floating at the edge of the viewport.

## Variants / Properties

### Property 1 axis
| Variant | When to use |
|---|---|
| `Default` | Neutral informational message with no urgency. |
| `Primary` | Branded informational message or tip aligned with a key action. |
| `Warning` | Cautionary message — action may have consequences or something needs attention. |
| `Danger Subtle` | Soft error or failure state where the message is important but not alarming. |
| `Success Subtle` | Confirmation that an action completed successfully. |

## Usage rules

- Place the Notification above or below the content it relates to, not at random positions.
- Do not stack multiple Notifications of the same type — consolidate messages.
- Use `Danger Subtle` for form-level validation summaries; use inline error states for field-level errors.
- Provide a dismiss action unless the message is critical and must persist until resolved.
