# Sequence Creation

Factory functions for creating `Sequence` and `AnimationGroup` instances from declarative target/options pairs.

## `getSequence()`

Creates a `Sequence` that coordinates multiple `AnimationGroup` instances with staggered delays.

### Signature

```typescript
function getSequence(
  options: SequenceOptions,
  animationGroups: AnimationGroupArgs[],
  context?: Record<string, any>,
): Sequence;
```

### Parameters

#### `options` (required)

Stagger timing configuration passed to the `Sequence` constructor.

```typescript
type SequenceOptions = {
  delay?: number; // Base delay (ms), default 0
  offset?: number; // Stagger interval (ms), default 0
  offsetEasing?: string | ((p: number) => number); // Easing for offset distribution
};
```

#### `animationGroups` (required)

Array of target/options pairs. Each entry is resolved into one or more `AnimationGroup` instances:

```typescript
type AnimationGroupArgs = {
  target: HTMLElement | HTMLElement[] | string | null;
  options: AnimationOptions;
  context?: Record<string, any>;
};
```

**Target resolution:**

- `HTMLElement` — creates one `AnimationGroup` for that element
- `HTMLElement[]` — creates one `AnimationGroup` per element
- `string` — resolved via `document.querySelectorAll`, one group per matched element
- `null` — passed through to `getAnimation` (element-less animation)

#### `context` (optional)

Context object forwarded to the animation creation pipeline. Supports `{ reducedMotion: boolean }` to respect reduced-motion preferences.

### Returns

A `Sequence` instance containing all resolved `AnimationGroup` instances.

### Examples

```typescript
import { getSequence } from '@wix/motion';

// Staggered entrance for a list of elements
const items = document.querySelectorAll('.card');

const sequence = getSequence(
  { offset: 150, offsetEasing: 'quadIn' },
  Array.from(items).map((el) => ({
    target: el,
    options: {
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
  })),
);

sequence.play();
```

```typescript
// Using a CSS selector target (each matched element becomes a group)
const sequence = getSequence({ offset: 100, offsetEasing: 'sineOut' }, [
  {
    target: '.grid-item',
    options: {
      duration: 500,
      keyframeEffect: {
        name: 'scale-in',
        keyframes: [
          { transform: 'scale(0.8)', opacity: 0 },
          { transform: 'scale(1)', opacity: 1 },
        ],
      },
    },
  },
]);
```

```typescript
// Multiple different effects in one sequence
const sequence = getSequence({ offset: 200, delay: 100 }, [
  {
    target: heading,
    options: {
      duration: 400,
      keyframeEffect: {
        name: 'slide-down',
        keyframes: [
          { transform: 'translateY(-30px)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 },
        ],
      },
    },
  },
  {
    target: body,
    options: {
      duration: 600,
      keyframeEffect: {
        name: 'fade-in',
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
      },
    },
  },
]);
```

---

## `createAnimationGroups()`

Builds `AnimationGroup` instances from the same `AnimationGroupArgs` format without wrapping them in a `Sequence`. Used internally by `getSequence()` and by `Interact.addToSequence()` when appending groups to an existing cached Sequence.

### Signature

```typescript
function createAnimationGroups(
  animationGroupArgs: AnimationGroupArgs[],
  context?: Record<string, any>,
): AnimationGroup[];
```

### Parameters

Same as `getSequence()` except without `SequenceOptions`:

- **`animationGroupArgs`** — array of target/options pairs
- **`context`** — optional context (e.g. `{ reducedMotion: true }`)

### Returns

Array of `AnimationGroup` instances. Entries where `getAnimation` returns a non-`AnimationGroup` result (e.g. `MouseAnimationInstance`) are skipped.

### Examples

```typescript
import { createAnimationGroups } from '@wix/motion';

// Build groups without a Sequence wrapper
const groups = createAnimationGroups(
  items.map((el) => ({
    target: el,
    options: fadeOptions,
  })),
);

// Use the groups directly or pass to a Sequence constructor
const sequence = new Sequence(groups, { offset: 200 });
```

---

**Next**: Explore [Sequence](sequence.md) for the class API, or return to [API Reference](README.md).
