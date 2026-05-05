<!-- #hover -->
- **CRITICAL**: MUST AVOID using the same element as both trigger source and effect target with effects that change size or position (e.g. `transform: translate(…)`, `scale(…)`). The transform shifts the hit area, causing jittery re-entry cycles. Instead, use `selector` to target a child element for the animation.
<!-- #pointermove -->
- **CRITICAL**: MUST AVOID using the same element as both source and target with effects that change size or position (e.g. `transform: translate(…)`, `scale(…)`). The transform shifts the hit area, causing jittery re-entry cycles. Instead, use `selector` to target a child element for the animation.
<!-- #detailed-hover -->
- **CRITICAL - Hit-area shift**: When a hover effect changes the size or position of the hovered element (e.g., `transform: scale(…)`), MUST use a separate source and target elements. Otherwise the hit-area shifts, causing rapid enter/leave.
  events and flickering. Use `selector` to target a child element, or set the effect's `key` to a different element.
<!-- #detailed-pointermove -->
- **CRITICAL**: For `pointerMove` trigger MUST AVOID using the same element as both source and target with `hitArea: 'self'` and effects that change size or position (e.g. `transform: translate(…)`, `scale(…)`). The transform shifts the hit area, causing jittery re-entry cycles. Instead, use `selector` to target a child element for the animation.
<!-- #pointermove-source -->
When using `hitArea: 'self'`, the source element is the hit area for pointer tracking:

- The source element **MUST NOT** have `pointer-events: none` — it needs to receive pointer events.
- **CRITICAL**: MUST AVOID using the same element as both source and target with effects that change size or position (e.g. `transform: translate(…)`, `scale(…)`). The transform shifts the hit area, causing jittery re-entry cycles. Instead, use `selector` to target a child element for the animation.
