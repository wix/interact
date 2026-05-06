<!-- #short -->
> **CRITICAL:** You MUST replace all usage of `overflow: hidden` with `overflow: clip` on every element between the trigger source element and the scroll container. `overflow: hidden` creates a new scroll context that breaks the ViewTimeline; `overflow: clip` clips overflow visually without affecting scroll ancestry. If using Tailwind, replace all `overflow-hidden` classes with `overflow-clip`.
<!-- #long -->
- **CRITICAL — `overflow: hidden` breaks `viewProgress`**: Replace with `overflow: clip` on all ancestors between source and scroll container. In Tailwind, replace `overflow-hidden` with `overflow-clip`.
<!-- #full-lean -->
**CRITICAL:** Replace ALL `overflow: hidden` with `overflow: clip` on every element between the trigger source and the scroll container. `overflow: hidden` creates a new scroll context that breaks ViewTimeline. In Tailwind replace `overflow-hidden` with `overflow-clip`.
