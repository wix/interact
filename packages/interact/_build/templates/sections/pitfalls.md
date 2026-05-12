## hit-area-trigger
When using `hitArea: 'self'`, the source element is the hit area for pointer tracking:

- The source element **MUST NOT** have `pointer-events: none` — it needs to receive pointer events.
- **CRITICAL**: MUST AVOID using the same element as both source and target with effects that change size or position (e.g. `transform: translate(…)`, `scale(…)`). The transform shifts the hit area, causing jittery re-entry cycles. Instead, use `selector` to target a child element for the animation.
## hit-area-hover-rule
- **CRITICAL**: MUST AVOID using the same element as both trigger source and effect target with effects that change size or position (e.g. `transform: translate(…)`, `scale(…)`). The transform shifts the hit area, causing jittery re-entry cycles. Instead, use `selector` to target a child element for the animation.
## hit-area-full-lean-hover
- **CRITICAL**: MUST AVOID using the same element as both trigger source and effect target with effects that change size or position (e.g. `transform: translate(…)`, `scale(…)`). The transform shifts the hit area, causing jittery re-entry cycles. Instead, use `selector` to target a child element for the animation.
- **CRITICAL - Hit-area shift**: When a hover effect changes the size or position of the hovered element (e.g., `transform: scale(…)`), MUST use a separate source and target elements. Otherwise the hit-area shifts, causing rapid enter/leave events and flickering. Use `selector` to target a child element, or set the effect's `key` to a different element.
## hit-area-full-lean-pointermove
- **CRITICAL**: MUST AVOID using the same element as both source and target with effects that change size or position (e.g. `transform: translate(…)`, `scale(…)`). The transform shifts the hit area, causing jittery re-entry cycles. Instead, use `selector` to target a child element for the animation.
- **CRITICAL**: For `pointerMove` trigger MUST AVOID using the same element as both source and target with `hitArea: 'self'` and effects that change size or position (e.g. `transform: translate(…)`, `scale(…)`). The transform shifts the hit area, causing jittery re-entry cycles. Instead, use `selector` to target a child element for the animation.
## same-element-viewenter-short
> **CRITICAL:** When the source (trigger) and target (effect) elements are the **same element**, use ONLY `triggerType: 'once'`. For all other types (`'repeat'`, `'alternate'`, `'state'`), MUST use **separate** source and target elements — animating the observed element itself can cause it to leave/re-enter the viewport, leading to rapid re-triggers or the animation never firing.
## same-element-viewenter-long
- **CRITICAL**: When using `viewEnter` trigger and source (trigger) and target (effect) elements are the **same element**, use ONLY `triggerType: 'once'`. For all other types (`'repeat'`, `'alternate'`, `'state'`) MUST use **separate** source and target elements — animating the observed element itself can cause it to leave/re-enter the viewport, leading to rapid re-triggers or the animation never firing.

**CRITICAL:** When source and target are the **same element**, MUST use `triggerType: 'once'`. For `'repeat'` / `'alternate'` / `'state'`, ALWAYS use **separate** source and target elements — animating the observed element can cause it to leave/re-enter the viewport, causing rapid re-triggers.
## overflow-clip-short
> **CRITICAL:** You MUST replace all usage of `overflow: hidden` with `overflow: clip` on every element between the trigger source element and the scroll container. `overflow: hidden` creates a new scroll context that breaks the ViewTimeline; `overflow: clip` clips overflow visually without affecting scroll ancestry. If using Tailwind, replace all `overflow-hidden` classes with `overflow-clip`.
## overflow-clip-long
- **CRITICAL — `overflow: hidden` breaks `viewProgress`**: Replace with `overflow: clip` on all ancestors between source and scroll container. In Tailwind, replace `overflow-hidden` with `overflow-clip`.

**CRITICAL:** Replace ALL `overflow: hidden` with `overflow: clip` on every element between the trigger source and the scroll container. `overflow: hidden` creates a new scroll context that breaks ViewTimeline. In Tailwind replace `overflow-hidden` with `overflow-clip`.
## dont-guess-presets
- **CRITICAL — Do NOT guess preset options**: If you don't know the expected type/structure for a `namedEffect` param, omit it — rely on defaults rather than guessing.
## reduced-motion
- **Reduced motion**: Use conditions to provide gentler alternatives (shorter durations, fewer transforms, no perpetual motion) for users who prefer reduced motion. You can also set `Interact.forceReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches` to force a global reduced-motion behavior programmatically.
## perspective
- **Perspective**: Prefer `transform: perspective(...)` inside keyframes. Use the CSS `perspective` property only when multiple children share the same `perspective-origin`.
