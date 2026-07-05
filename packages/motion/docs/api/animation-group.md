# AnimationGroup

The `AnimationGroup` class wraps a set of native Web Animations API `Animation` instances and lets you control them as one unit — play, pause, reverse, scrub, and observe completion together. It's the return type of `getWebAnimation()` and `getAnimation()` for time-based and scroll-driven (non-pointer) animations.

## Overview

`AnimationGroup` is a plain wrapper: it doesn't create animations itself, it just holds an array of `Animation` objects and fans out control calls to each of them. `Sequence` (see [`sequence.md`](./sequence.md)) extends `AnimationGroup` to additionally stagger the animations' delays.

### Key Features

- **Unified control** — `play`, `pause`, `reverse`, `cancel`, `setPlaybackRate`, and `progress` operate on every animation in the group at once.
- **Completion events** — `onFinish` / `onAbort` dispatch DOM events on the target element and invoke a callback.
- **Progress inspection** — `getProgress()` / `getTimingOptions()` read back computed timing from the group's longest-running animation.

## Class Definition

```typescript
class AnimationGroup {
  animations: (Animation & { start?: RangeOffset; end?: RangeOffset })[];
  options?: AnimationGroupOptions;
  ready: Promise<void>;
  isCSS: boolean;
  longestAnimation: Animation;

  constructor(animations: Animation[], options?: AnimationGroupOptions);

  play(callback?: () => void): Promise<void>;
  pause(): void;
  reverse(callback?: () => void): Promise<void>;
  progress(p: number): void;
  cancel(): void;
  setPlaybackRate(rate: number): void;
  getProgress(): number;
  onFinish(callback: () => void): Promise<void>;
  onAbort(callback: () => void): Promise<void>;
  hasAnimationName(name: string): boolean;
  hasAnimationId(id: string): boolean;
  getTimingOptions(): { delay: number; duration: number; iterations: number }[];

  get finished(): Promise<Animation[]>;
  get playState(): AnimationPlayState;
}
```

## Constructor

### Signature

```typescript
constructor(animations: Animation[], options?: AnimationGroupOptions)
```

### Parameters

#### `animations` (required)

Array of native Web Animations API `Animation` instances (e.g. from `element.animate(...)`, or `CSSAnimation`s already running on the element).

#### `options` (optional)

```typescript
type AnimationGroupOptions = AnimationOptions & {
  trigger?: Partial<TriggerVariant> | undefined;
  startOffsetAdd?: string | undefined;
  endOffsetAdd?: string | undefined;
  measured?: Promise<void>;
};
```

`options.measured`, if provided, becomes the group's `ready` promise (see below).

### Example

```typescript
import { AnimationGroup } from '@wix/motion';

const el = document.querySelector('#box') as HTMLElement;

const fade = el.animate({ opacity: [0, 1] }, { duration: 600, fill: 'both' });
const move = el.animate(
  { transform: ['translateY(20px)', 'translateY(0)'] },
  { duration: 600, fill: 'both' },
);

const group = new AnimationGroup([fade, move]);
```

## Properties

### `animations`

```typescript
animations: (Animation & { start?: RangeOffset; end?: RangeOffset })[]
```

The wrapped animations, in the order passed to the constructor. For scroll-driven animations, `start` / `end` carry the resolved [`RangeOffset`](./types.md#rangeoffset) for that animation.

### `options`

```typescript
options?: AnimationGroupOptions
```

The options object passed to the constructor, stored as-is. `options.effectId` (inherited from `AnimationExtraOptions`) is used as the `detail.effectId` on the `animationend` event dispatched by `onFinish` (falling back to the first animation's `id`).

### `ready`

```typescript
ready: Promise<void>
```

Resolves once the group's targets have been measured/mutated. Set from `options?.measured`, or `Promise.resolve()` if no `measured` promise was supplied. `play()` and `reverse()` both `await ready` before starting playback.

### `isCSS`

```typescript
isCSS: boolean
```

`true` if `animations[0]` is a `CSSAnimation` (i.e. the group wraps an existing CSS `animation` rather than a WAAPI `KeyframeEffect`). Used internally to decide whether `onFinish`/`onAbort` can safely read `effect.target` off a `KeyframeEffect`.

### `longestAnimation`

```typescript
longestAnimation: Animation
```

The animation in `animations` with the greatest computed `effect.getComputedTiming().endTime`, computed once in the constructor. `getProgress()` reads from this animation.

## Methods

### `play()`

```typescript
async play(callback?: () => void): Promise<void>
```

Awaits `ready`, calls `.play()` on every animation in the group, then awaits each animation's `.ready`, then invokes `callback` (if given).

> **`play()` resolves once playback has STARTED, not once it has finished.** It does not wait for the animations to complete. To observe completion, use [`onFinish(cb)`](#onfinish) or `await group.finished` — never `await group.play()`.

```typescript
import { getWebAnimation } from '@wix/motion';

const group = getWebAnimation('#hero', {
  keyframeEffect: { name: 'fade-in', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
  duration: 800,
  fill: 'both',
});

await group?.play();
console.log('playback has started (not finished)');
```

### `pause()`

```typescript
pause(): void
```

Calls `.pause()` on every animation in the group.

### `reverse()`

```typescript
async reverse(callback?: () => void): Promise<void>
```

Same shape as `play()`: awaits `ready`, calls `.reverse()` on every animation, awaits each animation's `.ready`, then invokes `callback`. Also resolves once reverse playback has **started**, not finished.

### `progress()`

```typescript
progress(p: number): void
```

Scrubs every animation in the group to normalized progress `p` (`0`–`1`) by directly setting each animation's `currentTime` based on its own `delay`, `duration`, and `iterations`.

### `cancel()`

```typescript
cancel(): void
```

Calls `.cancel()` on every animation in the group, resetting elements to their pre-animation state.

### `setPlaybackRate()`

```typescript
setPlaybackRate(rate: number): void
```

Sets `playbackRate` on every animation in the group (`1` = normal speed, `2` = double speed, `0.5` = half speed).

### `getProgress()`

```typescript
getProgress(): number
```

Returns `longestAnimation.effect.getComputedTiming().progress`, or `0` if unavailable.

### `onFinish()`

```typescript
async onFinish(callback: () => void): Promise<void>
```

Awaits `Promise.all(animations.map(a => a.finished))`. On success:

- If the group is **not** CSS-backed (`!isCSS`) and the first animation's effect has a `target`, dispatches a `CustomEvent('animationend', { detail: { effectId } })` on that target (`effectId` is `options?.effectId ?? animations[0].id`).
- Then calls `callback`.

If any animation's `finished` promise rejects (the animation was interrupted), `onFinish` logs a warning and does **not** call `callback`.

```typescript
await group.onFinish(() => {
  console.log('every animation in the group finished');
});
```

### `onAbort()`

```typescript
async onAbort(callback: () => void): Promise<void>
```

Awaits `Promise.all(animations.map(a => a.finished))`. If that rejects with an error whose `name` is `'AbortError'` (i.e. the animation was cancelled), and the group is not CSS-backed, dispatches an `Event('animationcancel')` on the first animation's target and calls `callback`. Any other rejection is swallowed without calling `callback`.

```typescript
await group.onAbort(() => {
  console.log('animation was cancelled');
});

group.cancel(); // triggers the AbortError path above
```

### `hasAnimationName()`

```typescript
hasAnimationName(name: string): boolean
```

`true` if any animation in the group is a `CSSAnimation` whose `animationName` matches `name`.

### `hasAnimationId()`

```typescript
hasAnimationId(id: string): boolean
```

`true` if any animation in the group has `id === id`.

### `getTimingOptions()`

```typescript
getTimingOptions(): { delay: number; duration: number; iterations: number }[]
```

Maps every animation to its effective `{ delay, duration, iterations }`, read from `effect.getTiming()` (defaulting `delay` to `0`, `duration` to `0` if not numeric, `iterations` to `1`).

## Getters

### `finished`

```typescript
get finished(): Promise<Animation[]>
```

`Promise.all(animations.map(a => a.finished))` — **resolves to an array of `Animation`, not a single `Animation`.** This is the primary way to `await` full completion of a group:

```typescript
await group.play();
await group.finished; // resolves once every animation in the group has finished
```

### `playState`

```typescript
get playState(): AnimationPlayState
```

`'running'` if **any** animation in the group is currently running; otherwise, the `playState` of `animations[0]`. This means a group can report `'running'` even while some of its animations have already finished, and a group with zero running animations reports whatever state the *first* animation happens to be in — it is not a strict aggregate of all animations.

## How to observe completion

Because `play()` and `reverse()` resolve as soon as playback **starts**, don't await them to know when an animation is done. Use one of:

```typescript
// Callback style
await group.onFinish(() => {
  // all animations in the group have finished
});

// Promise style
await group.play();
await group.finished;
```

## See also

- [`Sequence`](./sequence.md) — an `AnimationGroup` subclass that coordinates multiple groups with staggered offsets.
- [`Types`](./types.md) — `AnimationOptions`, `RangeOffset`, `TriggerVariant`, and the other types referenced above.

---

Return to [API Reference](./README.md).
