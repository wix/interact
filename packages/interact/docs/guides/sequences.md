# Sequences & Staggering

Sequences let you coordinate multiple effects as a single timeline with staggered delay offsets. Built on the `@wix/motion` `Sequence` class, they provide easing-driven timing distribution across effects — ideal for list entrances, multi-element orchestrations, and any pattern requiring coordinated animation timing.

## What is a Sequence?

A Sequence groups multiple effects and applies calculated delay offsets to each one, so they play back in a staggered pattern. The stagger timing is shaped by an easing function, producing natural-feeling cascades rather than uniform delays.

```
offset[i] = easing(i / last) * last * offsetMs
```

For example, with 5 effects and `offset: 200`:

| Easing    | Computed delays       | Feel                     |
| --------- | --------------------- | ------------------------ |
| `linear`  | 0, 200, 400, 600, 800 | Even spacing             |
| `quadIn`  | 0, 50, 200, 450, 800  | Slow start, then rapid   |
| `sineOut` | 0, 306, 565, 739, 800 | Fast start, then gradual |

## Config Structure

Sequences can be defined at two levels:

### Reusable Sequences (`InteractConfig.sequences`)

Define named sequences in the top-level `sequences` map, then reference them by ID from any interaction:

```typescript
const config: InteractConfig = {
  sequences: {
    'card-stagger': {
      offset: 150,
      offsetEasing: 'quadIn',
      effects: [{ effectId: 'fade-up' }],
    },
  },
  interactions: [
    {
      key: 'cards',
      trigger: 'viewEnter',
      listContainer: '.card-grid',
      sequences: [{ sequenceId: 'card-stagger' }],
    },
  ],
  effects: {
    'fade-up': {
      duration: 600,
      easing: 'ease-out',
      keyframeEffect: {
        name: 'fade-up',
        keyframes: [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
      },
    },
  },
};
```

### Inline Sequences (`Interaction.sequences`)

Define sequences directly on an interaction:

```typescript
const config: InteractConfig = {
  interactions: [
    {
      key: 'items',
      trigger: 'viewEnter',
      listContainer: '.item-list',
      sequences: [
        {
          offset: 100,
          offsetEasing: 'sineOut',
          effects: [
            {
              duration: 500,
              keyframeEffect: {
                name: 'slide-in',
                keyframes: [
                  { opacity: 0, transform: 'translateX(-30px)' },
                  { opacity: 1, transform: 'translateX(0)' },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  effects: {},
};
```

### Combining Effects and Sequences

An interaction can have both `effects` and `sequences`:

```typescript
{
  key: 'hero',
  trigger: 'viewEnter',
  effects: [{ effectId: 'background-fade' }],
  sequences: [{
    offset: 200,
    effects: [
      { key: 'hero-title', effectId: 'slide-down' },
      { key: 'hero-subtitle', effectId: 'fade-in' },
    ],
  }],
}
```

## Types Reference

### `SequenceOptionsConfig`

Shared options for sequence timing and identity:

```typescript
type SequenceOptionsConfig = {
  delay?: number; // Base delay (ms). Default: 0
  offset?: number; // Stagger interval (ms). Default: 0
  offsetEasing?: string | ((p: number) => number); // Easing for offset distribution
  sequenceId?: string; // ID for reusable sequence reference
  conditions?: string[]; // Media query condition IDs
};
```

### `SequenceConfig`

Inline sequence definition (extends `SequenceOptionsConfig`):

```typescript
type SequenceConfig = SequenceOptionsConfig & {
  effects: (Effect | EffectRef)[];
};
```

### `SequenceConfigRef`

Reference to a reusable sequence with optional overrides:

```typescript
type SequenceConfigRef = {
  sequenceId: string;
  delay?: number;
  offset?: number;
  offsetEasing?: string | ((p: number) => number);
  conditions?: string[];
};
```

Overrides in the ref merge on top of the referenced sequence's values.

## Cross-Element Sequences

Effects within a sequence can target different elements using the `key` property:

```typescript
{
  key: 'trigger-element',
  trigger: 'click',
  params: { type: 'alternate' },
  sequences: [{
    offset: 150,
    offsetEasing: 'sineOut',
    effects: [
      { key: 'heading', effectId: 'slide-down' },
      { key: 'body-text', effectId: 'fade-in' },
      { key: 'hero-image', effectId: 'scale-in' },
    ],
  }],
}
```

Cross-element sequences are resolved at add-time. When a sequence effect targets a `key` different from the source interaction, Interact waits for both elements to be registered before creating the Sequence. The effects are processed via `addEffectsForTarget()` when the target controller connects.

## Sequences with `listContainer`

The most common use case: staggering list item animations.

### Initial Load

When the source element connects, all existing list items are gathered and a Sequence is created with one `AnimationGroup` per item:

```typescript
{
  key: 'product-grid',
  trigger: 'viewEnter',
  listContainer: '.products',
  params: { type: 'once' },
  sequences: [{
    offset: 80,
    offsetEasing: 'quadIn',
    effects: [{
      key: 'product-grid',
      listContainer: '.products',
      effectId: 'card-entrance',
    }],
  }],
}
```

### Dynamic Additions (`addListItems`)

When new items are appended to the DOM (detected by MutationObserver), `addListItems` is called. For sequences, this calls `Interact.addToSequence()` with `IndexedGroup` entries at the correct indices, triggering automatic offset recalculation across the entire Sequence.

Each `addListItems` invocation uses a unique cache key to manage its Sequence independently.

### Dynamic Removals (`removeListItems`)

When items are removed from the DOM, `removeListItems` automatically calls `Interact.removeFromSequences(elements)`. This:

1. Looks up associated Sequences via the `elementSequenceMap` WeakMap (O(1) per element)
2. Calls `sequence.removeGroups()` to cancel and remove the matching groups
3. Recalculates offsets for remaining groups
4. Cleans up the element from the map

No manual cleanup is needed — MutationObserver handles it automatically.

## Conditions on Sequences

### Sequence-Level Conditions

Gate an entire sequence with media query conditions:

```typescript
{
  key: 'hero',
  trigger: 'viewEnter',
  sequences: [{
    conditions: ['desktop-only'],
    offset: 200,
    effects: [
      { key: 'hero-title', effectId: 'slide-down' },
      { key: 'hero-body', effectId: 'fade-in' },
    ],
  }],
}
```

When the condition doesn't match, the entire sequence is skipped. Interact sets up `matchMedia` listeners so the sequence is added/removed dynamically when the condition changes.

### Effect-Level Conditions

Individual effects within a sequence can have their own conditions:

```typescript
sequences: [
  {
    offset: 150,
    effects: [
      { effectId: 'base-entrance' },
      { effectId: 'fancy-entrance', conditions: ['desktop-only'] },
    ],
  },
];
```

When an effect-level condition doesn't match, that effect is excluded from the Sequence's animation groups, and offsets are calculated for the remaining effects only.

## Sequence Caching

Interact caches Sequences to avoid recreating them:

- **`Interact.sequenceCache`** (`Map<string, Sequence>`) — maps cache keys to Sequence instances
- **`Interact.elementSequenceMap`** (`WeakMap<HTMLElement, Set<Sequence>>`) — maps elements to their Sequences for efficient removal

Cache keys are derived from the interaction key, sequence index, and context. Cleanup happens automatically:

- `Interact.destroy()` clears both `sequenceCache` and `elementSequenceMap`
- `clearInteractionStateForKey()` removes cache entries by key prefix
- Element removal cleans up `elementSequenceMap` entries via the WeakMap

## Examples

### Staggered Card Grid Entrance

```typescript
const config: InteractConfig = {
  interactions: [
    {
      key: 'cards',
      trigger: 'viewEnter',
      listContainer: '.card-grid',
      params: { type: 'once', threshold: 0.1 },
      sequences: [
        {
          offset: 80,
          offsetEasing: 'quadIn',
          effects: [
            {
              key: 'cards',
              listContainer: '.card-grid',
              effectId: 'card-entrance',
            },
          ],
        },
      ],
    },
  ],
  effects: {
    'card-entrance': {
      duration: 600,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      keyframeEffect: {
        name: 'card-entrance',
        keyframes: [
          { opacity: 0, transform: 'translateY(40px) scale(0.95)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ],
      },
    },
  },
};
```

### Click-Triggered Multi-Element Orchestration

```typescript
const config: InteractConfig = {
  interactions: [
    {
      key: 'reveal-btn',
      trigger: 'click',
      params: { type: 'alternate' },
      sequences: [
        {
          offset: 150,
          offsetEasing: 'sineOut',
          effects: [
            { key: 'section-heading', effectId: 'slide-down' },
            { key: 'section-body', effectId: 'fade-in' },
            { key: 'section-image', effectId: 'scale-in' },
          ],
        },
      ],
    },
  ],
  effects: {
    'slide-down': {
      duration: 400,
      keyframeEffect: {
        name: 'slide-down',
        keyframes: [
          { transform: 'translateY(-20px)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 },
        ],
      },
    },
    'fade-in': {
      duration: 500,
      keyframeEffect: {
        name: 'fade-in',
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
      },
    },
    'scale-in': {
      duration: 600,
      keyframeEffect: {
        name: 'scale-in',
        keyframes: [
          { transform: 'scale(0.9)', opacity: 0 },
          { transform: 'scale(1)', opacity: 1 },
        ],
      },
    },
  },
};
```

### Sequence with Media-Query Conditions

```typescript
const config: InteractConfig = {
  conditions: {
    'desktop-only': { type: 'media', predicate: '(min-width: 1024px)' },
    'no-reduced-motion': { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
  },
  interactions: [
    {
      key: 'features',
      trigger: 'viewEnter',
      listContainer: '.feature-list',
      conditions: ['no-reduced-motion'],
      sequences: [
        {
          conditions: ['desktop-only'],
          offset: 120,
          offsetEasing: 'quadIn',
          effects: [{ effectId: 'feature-entrance' }],
        },
      ],
    },
  ],
  effects: {
    'feature-entrance': {
      duration: 700,
      easing: 'ease-out',
      keyframeEffect: {
        name: 'feature-entrance',
        keyframes: [
          { opacity: 0, transform: 'translateY(30px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
      },
    },
  },
};
```

## See Also

- [Lists and Dynamic Content](./lists-and-dynamic-content.md) — `listContainer`, `addListItems`, mutation tracking
- [Conditions and Media Queries](./conditions-and-media-queries.md) — conditional interactions
- [Effects and Animations](./effects-and-animations.md) — effect types and properties
- [Interact Class API](../api/interact-class.md) — `getSequence()`, `addToSequence()`, `removeFromSequences()`
- [Type Definitions](../api/types.md) — `SequenceConfig`, `SequenceConfigRef`, `SequenceOptionsConfig`
