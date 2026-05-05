<!-- #full-lean -->
Coordinate multiple effects with staggered timing. Prefer sequences over manual delay stagger.

### Sequence As type

```ts
{
  effects: (Effect | EffectRef)[];      // REQUIRED
  delay?: number;                       // ms before sequence starts
  offset?: number;                      // ms between each child's animation start
  offsetEasing?: string;                // easing curve for staggering offsets
  sequenceId?: string;                  // for caching/referencing
  conditions?: string[];                // ids referencing the top-level conditions map
}
```

### Template

```ts
{
  interactions: [
    {
      key: '[SOURCE_KEY]',
      trigger: '[TRIGGER]',
      params: [TRIGGER_PARAMS],
      sequences: [
        {
          offset: [OFFSET_MS],           // optional
          offsetEasing: '[OFFSET_EASING]', // optional
          delay: [DELAY_MS],             // optional
          effects: [
            // if used `listContainer` each item in the list is a target of a child effect
            {
              effectId: '[EFFECT_ID]',
              listContainer: '[LIST_CONTAINER_SELECTOR]',
            },
            // if multiple effects are given each generated effect is added to the sequence
          ],
        },
      ],
    },
  ],
  effects: {
    '[EFFECT_ID]': {
      // effect definition (namedEffect, keyframeEffect, or customEffect)
    },
  },
}
```

### Variables

- `[SOURCE_KEY]` — identifier matching the element's key (`data-interact-key` for /vanilla, `interactKey` for React).
- `[TRIGGER]` — any trigger for time-based animation effects (e.g., `'viewEnter'`, `'activate'`, `'interest'`).
- `[TRIGGER_PARAMS]` — trigger-specific parameters (e.g., `{ type: 'once', threshold: 0.3 }`).
- `[OFFSET_MS]` — ms between each child's animation start.
- `[OFFSET_EASING]` — CSS easing string or named easing from `@wix/motion`.
- `[DELAY_MS]` — optional. Base delay (ms) before the entire sequence starts.
- `[EFFECT_ID]` — string key referencing an entry in the top-level `effects` map.
- `[LIST_CONTAINER_SELECTOR]` — optional. CSS selector for the container whose children will be staggered.

Reusable sequences can be defined in `InteractConfig.sequences` and referenced by `sequenceId`.

<!-- #integration -->
Sequences coordinate multiple effects with staggered timing.

```typescript
{
  offset: number,           // ms between consecutive items
  offsetEasing: string,     // Any valid easing string for stagger distribution curve
  delay: number,            // ms base delay before the sequence starts
  effects: [
    /* ... effect definitions */,
  ],
}
```

Define reusable sequences in `InteractConfig.sequences` and reference by `sequenceId`:

```typescript
{
  sequences: {
    'stagger-fade': {
      /* ... sequence definition */
    },
  },
  interactions: [
    {
      key: '[SOURCE_KEY]',
      trigger: '[TRIGGER]',
      params: [TRIGGER_PARAMS],
      sequences: [{ sequenceId: 'stagger-fade' }],
    },
  ],
}
```
