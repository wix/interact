# Sequence

The `Sequence` class coordinates multiple `AnimationGroup` instances as a unified timeline with staggered delay offsets. It extends `AnimationGroup` to inherit the playback control API while distributing easing-driven delays across child groups.

## Overview

`Sequence` is returned by `getSequence()` and used internally by `@wix/interact` to manage staggered list animations, multi-element orchestrations, and any pattern where multiple animations should play with coordinated timing offsets.

### Key Features

- **Staggered Delays** - Distribute timing offsets across groups using customizable easing
- **Dynamic Groups** - Add or remove groups at runtime with automatic offset recalculation
- **Unified Playback** - Play, pause, reverse, and cancel all child animations together
- **Easing-Driven Offsets** - Use named easings (`quadIn`, `sineOut`) or custom functions to shape stagger curves

## Class Definition

```typescript
class Sequence extends AnimationGroup {
  animationGroups: AnimationGroup[];
  delay: number;
  offset: number;
  offsetEasing: (p: number) => number;

  constructor(animationGroups: AnimationGroup[], options?: SequenceOptions);

  // Group management
  addGroups(entries: IndexedGroup[]): void;
  removeGroups(predicate: (group: AnimationGroup) => boolean): AnimationGroup[];

  // Event handling (overridden)
  async onFinish(callback: () => void): Promise<void>;

  // Inherited from AnimationGroup
  async play(callback?: () => void): Promise<void>;
  pause(): void;
  async reverse(callback?: () => void): Promise<void>;
  cancel(): void;
  getProgress(): number;
  progress(p: number): void;
  setPlaybackRate(rate: number): void;
  get finished(): Promise<Animation>;
  get playState(): AnimationPlayState;
}
```

## Constructor

### Signature

```typescript
constructor(
  animationGroups: AnimationGroup[],
  options?: SequenceOptions
)
```

### Parameters

#### `animationGroups` (required)

Array of `AnimationGroup` instances to coordinate. Each group typically represents one element's animation. The constructor flattens all child animations into the inherited `animations` array for unified playback control.

#### `options` (optional)

```typescript
type SequenceOptions = {
  delay?: number;
  offset?: number;
  offsetEasing?: string | ((p: number) => number);
};
```

- **`delay`** - Base delay (ms) applied to all groups on top of their stagger offset. Default: `0`.
- **`offset`** - Stagger interval (ms) between consecutive groups. Default: `0`.
- **`offsetEasing`** - Easing function or named string that shapes the distribution of offsets. Accepts a `(p: number) => number` function, a named easing string (`'linear'`, `'quadIn'`, `'sineOut'`, etc.), or a `cubic-bezier(...)` string. Default: `linear`.

### Examples

```typescript
import { Sequence, AnimationGroup } from '@wix/motion';

// Sequence with linear 200ms stagger
const sequence = new Sequence(groups, {
  offset: 200,
  offsetEasing: 'linear',
});

// Sequence with quadratic-in easing (slow start, then rapid)
const eased = new Sequence(groups, {
  delay: 100,
  offset: 200,
  offsetEasing: 'quadIn',
});

// Sequence with custom easing function
const custom = new Sequence(groups, {
  offset: 300,
  offsetEasing: (p) => p * p * p, // cubic easing
});
```

## Properties

### `animationGroups`

```typescript
animationGroups: AnimationGroup[]
```

Array of child `AnimationGroup` instances managed by this Sequence. Modified by `addGroups()` and `removeGroups()`.

### `delay`

```typescript
delay: number;
```

Base delay in milliseconds applied to every group's animations on top of their calculated stagger offset.

### `offset`

```typescript
offset: number;
```

Stagger interval in milliseconds. Combined with `offsetEasing`, this determines how much delay each successive group receives.

### `offsetEasing`

```typescript
offsetEasing: (p: number) => number;
```

Easing function that distributes stagger offsets. Receives a normalized progress value (0–1) representing the group's position in the sequence and returns a normalized output. Named strings are resolved via `getJsEasing()` at construction time.

### `animations`

```typescript
animations: Animation[]
```

Flattened array of all `Animation` instances across all child groups (inherited from `AnimationGroup`). Updated when groups are added or removed.

### `ready`

```typescript
ready: Promise<void>;
```

Promise that resolves when all child group `ready` promises have settled and offsets have been applied. Reset after `addGroups()` or `removeGroups()`.

## Offset Calculation

Offsets are calculated using the formula:

```
offset[i] = easing(i / last) * last * offset | 0
```

Where `i` is the group index, `last` is the index of the final group, and the `| 0` truncates to an integer.

### Examples by Easing

Given 5 groups with `offset: 200`:

| Easing    | Offsets                   | Distribution             |
| --------- | ------------------------- | ------------------------ |
| `linear`  | `[0, 200, 400, 600, 800]` | Even spacing             |
| `quadIn`  | `[0, 50, 200, 450, 800]`  | Slow start, accelerating |
| `sineOut` | `[0, 306, 565, 739, 800]` | Fast start, decelerating |

Single-group sequences always produce `[0]` regardless of offset or easing.

Each calculated offset is added to the group's animation `delay` timing. An `endDelay` is also computed so that all groups share the same total active duration, enabling the `finished` promise to resolve at the correct time.

## Group Management

### `addGroups()`

Inserts new `AnimationGroup` instances at specified indices, then recalculates stagger offsets for all groups.

#### Signature

```typescript
addGroups(entries: IndexedGroup[]): void
```

#### Parameters

- **`entries`** - Array of `{ index: number, group: AnimationGroup }` objects. Each `index` specifies where in `animationGroups` the new group should be inserted.

#### Examples

```typescript
import { AnimationGroup, Sequence } from '@wix/motion';

const sequence = new Sequence(existingGroups, { offset: 150 });

// Add a new group at position 2
const newGroup = new AnimationGroup(newAnimations);
sequence.addGroups([{ index: 2, group: newGroup }]);
// Offsets are automatically recalculated for all groups
```

```typescript
// Add multiple groups (e.g. new list items)
sequence.addGroups([
  { index: 3, group: groupA },
  { index: 5, group: groupB },
]);
```

### `removeGroups()`

Removes groups matching a predicate, cancels their animations, recalculates offsets for remaining groups, and returns the removed groups.

#### Signature

```typescript
removeGroups(predicate: (group: AnimationGroup) => boolean): AnimationGroup[]
```

#### Parameters

- **`predicate`** - Function that receives each `AnimationGroup` and returns `true` for groups to remove.

#### Returns

Array of removed `AnimationGroup` instances. Empty array if nothing matched.

#### Examples

```typescript
// Remove groups whose animations target a specific element
const removed = sequence.removeGroups((group) =>
  group.animations.some((a) => (a.effect as KeyframeEffect)?.target === removedElement),
);
console.log(`Removed ${removed.length} groups`);
```

```typescript
// Remove all groups (clear the sequence)
sequence.removeGroups(() => true);
```

## Event Handling

### `onFinish()`

Registers a callback to be invoked when all child animation groups have finished. Overrides the `AnimationGroup` implementation to await each group's `finished` promise individually.

#### Signature

```typescript
async onFinish(callback: () => void): Promise<void>
```

#### Parameters

- **`callback`** - Function called when all groups finish playing.

#### Examples

```typescript
const sequence = new Sequence(groups, { offset: 200 });
await sequence.play();

await sequence.onFinish(() => {
  console.log('All staggered animations complete');
});
```

If any animation is interrupted (cancelled or replaced), the callback is not invoked and a warning is logged to the console.

## Inherited Playback API

All playback methods operate on the flattened `animations` array, controlling every animation across all child groups simultaneously.

### `play()`

```typescript
async play(callback?: () => void): Promise<void>
```

Starts playback of all animations. Stagger offsets cause each group to visually start at different times via their `delay` timing.

### `pause()`

```typescript
pause(): void
```

Pauses all animations at their current position.

### `reverse()`

```typescript
async reverse(callback?: () => void): Promise<void>
```

Reverses all animations. Groups that started later (higher stagger offset) will visually finish reversing first.

### `cancel()`

```typescript
cancel(): void
```

Cancels all animations and resets elements to their initial state.

### `progress()`

```typescript
progress(p: number): void
```

Manually scrubs all animations to progress value `p` (0–1).

### `setPlaybackRate()`

```typescript
setPlaybackRate(rate: number): void
```

Changes the playback speed of all animations.

### `playState`

```typescript
get playState(): AnimationPlayState
```

Returns the current playback state from the first animation (`'idle'`, `'running'`, `'paused'`, `'finished'`).

### `finished`

```typescript
get finished(): Promise<Animation>
```

Promise that resolves when the last animation completes.

---

**Next**: See [Sequence Creation](get-sequence.md) for factory functions, or return to [API Reference](README.md).
