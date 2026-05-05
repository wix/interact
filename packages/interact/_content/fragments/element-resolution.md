<!-- #intro -->
For simple use cases, `key` on the interaction matches the element, and the same element is both trigger source and animation target. The fields below are only needed for advanced patterns (lists, delegated triggers, child targeting).
<!-- #source -->
### Source element resolution (Interaction level)

The source element is what the trigger attaches to. Resolved in priority order:

1. **`listContainer` + `listItemSelector`** — trigger attaches to each element matching `listItemSelector` within the `listContainer`. Use `listItemSelector` only when you need to **filter** which children participate (e.g. select only `.active` items). If all immediate children should participate, omit `listItemSelector`.
2. **`listContainer` only** — trigger attaches to each immediate child of the container. This is the common case for lists.
3. **`listContainer` + `selector`** — trigger attaches to the element found via `querySelector` within each immediate child of the container.
4. **`selector` only** — trigger attaches to all elements matching `querySelectorAll` within the root `<interact-element>`.
5. **Fallback** — first child of `<interact-element>` (web) or the root element (react/vanilla).
<!-- #target -->
### Target element resolution (Effect level)

The target element is what the effect animates. Resolved in priority order:

1. **`Effect.key`** — the `<interact-element>` with matching `data-interact-key`.
2. **Registry Effect's `key`** — if the effect is an `EffectRef`, the `key` from the referenced registry entry is used.
3. **Fallback to `Interaction.key`** — the same `key` is used for the source will be used for the target.
4. After resolving the root target, `selector`, `listContainer`, and `listItemSelector` on the effect further refine which child elements within that target are animated (same priority order as source resolution).
<!-- #source-integration -->
#### Source element resolution (Interaction level)

The source element is what the trigger attaches to. Resolved in priority order:

1. **`listContainer` + `listItemSelector`** — matches only the elements matching `listItemSelector` within the the `listContainer`.
2. **`listContainer` only** — trigger attaches to all immediate children of the container (common case).
3. **`listContainer` + `selector`** — matches via `querySelector` within each immediate child of the container.
4. **`selector` only** — matches via `querySelectorAll` within the root element.
5. **Fallback** — first child of `<interact-element>` (web) or the root element (react/vanilla).
<!-- #target-integration -->
#### Target element resolution (Effect level)

The target element is what the effect animates. Resolved in priority order:

1. **`Effect.key`** — the root with matching `data-interact-key`.
2. **Registry Effect's `key`** — if the effect is an `EffectRef`, the `key` from the referenced registry entry is used.
3. **Fallback to `Interaction.key`** — the source element acts as the target's root.
4. After resolving the target's root, `selector`, `listContainer`, and `listItemSelector` on the effect further refine which child elements within that target are animated (same priority order as source resolution).
