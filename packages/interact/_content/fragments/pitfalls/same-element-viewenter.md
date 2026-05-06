<!-- #short -->
> **CRITICAL:** When the source (trigger) and target (effect) elements are the **same element**, use ONLY `triggerType: 'once'`. For all other types (`'repeat'`, `'alternate'`, `'state'`), MUST use **separate** source and target elements — animating the observed element itself can cause it to leave/re-enter the viewport, leading to rapid re-triggers or the animation never firing.
<!-- #long -->
- **CRITICAL**: When using `viewEnter` trigger and source (trigger) and target (effect) elements are the **same element**, use ONLY `triggerType: 'once'`. For all other types (`'repeat'`, `'alternate'`, `'state'`) MUST use **separate** source and target elements — animating the observed element itself can cause it to leave/re-enter the viewport, leading to rapid re-triggers or the animation never firing.
<!-- #full-lean -->
**CRITICAL:** When source and target are the **same element**, MUST use `triggerType: 'once'`. For `'repeat'` / `'alternate'` / `'state'`, ALWAYS use **separate** source and target elements — animating the observed element can cause it to leave/re-enter the viewport, causing rapid re-triggers.
