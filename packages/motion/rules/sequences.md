---
name: sequences
description: Reference for getSequence, createAnimationGroups, and the Sequence class — building staggered/coordinated multi-group time-based animations in @wix/motion. Read when animating a list of elements (or several different elements) with timing offsets between them, or when working with Sequence.addGroups/removeGroups.
---

# Sequences (`getSequence` / `Sequence`)

`Sequence` coordinates multiple `AnimationGroup` instances as a single timeline with staggered `delay`
offsets. It extends `AnimationGroup`, so it inherits the full playback API (`play`, `pause`, `reverse`,
`cancel`, `progress`, `setPlaybackRate`, `finished`, `playState`, …) while distributing an
easing-shaped delay across its child groups. `getSequence` is the factory most callers use; `@wix/interact`
uses it internally for staggered list animations.

## Table of Contents

- [Package Boundary](#package-boundary)
- [`getSequence` / `createAnimationGroups` Signatures](#getsequence--createanimationgroups-signatures)
- [`SequenceOptions` / `AnimationGroupArgs`](#sequenceoptions--animationgroupargs)
- [Target Resolution](#target-resolution)
- [Stagger Offset Formula](#stagger-offset-formula)
- [CSS-Driven Stagger (`sequenceId`)](#css-driven-stagger-sequenceid)
- [`Sequence` Class Surface](#sequence-class-surface)
- [Reduced Motion](#reduced-motion)
- [Gotchas / Rules](#gotchas--rules)
- [See Also](#see-also)

## Package Boundary

| Need                                                                   | Use                       |
| ---------------------------------------------------------------------- | ------------------------- |
| Declarative `sequences` config, list/stagger wiring via triggers       | `@wix/interact`           |
| Ready-made preset catalog for the individual effects inside a sequence | `@wix/motion-presets`     |
| Programmatic multi-group stagger orchestration                         | `@wix/motion` (this file) |

This file documents the imperative engine only — it does not document preset params.

## `getSequence` / `createAnimationGroups` Signatures

```typescript
function getSequence(
  options: SequenceOptions,
  animationGroups: AnimationGroupArgs[],
  context?: Record<string, any>, // supports { reducedMotion: boolean }
): Sequence;
```

(`../src/motion.ts:261-268`) — resolves every `AnimationGroupArgs` entry into one or more `AnimationGroup`s
via `createAnimationGroups`, then wraps them in `new Sequence(groups, options)`.

```typescript
function createAnimationGroups(
  animationGroupArgs: AnimationGroupArgs[],
  context?: Record<string, any>,
): AnimationGroup[];
```

(`../src/motion.ts:232-256`) — builds groups without wrapping them in a `Sequence`. Used internally by
`getSequence`; call it directly if you want the raw groups (e.g. to build your own `Sequence` yourself, or
to feed some other coordination). Entries whose resolved animation is not an `AnimationGroup` (e.g. a
`MouseAnimationInstance`) are silently skipped.

## `SequenceOptions` / `AnimationGroupArgs`

```typescript
type SequenceOptions = {
  delay?: number; // ms base delay, default 0
  offset?: number; // ms stagger interval, default 0
  offsetEasing?: string | ((p: number) => number); // default 'linear'
  sequenceId?: string; // opts CSS-driven groups into the CSS stagger path
};
```

```typescript
type AnimationGroupArgs = {
  target: HTMLElement | HTMLElement[] | string | null;
  options: AnimationOptions;
  context?: Record<string, any>;
};
```

(`../src/types.ts:274-278`)

> **Gotcha**: the per-entry `AnimationGroupArgs.context` field is declared but **not read** by
> `createAnimationGroups` — only the top-level `context` argument (the function's own 3rd/2nd parameter)
> is used, and only its `reducedMotion` field (`../src/motion.ts:238-247`). Don't rely on per-entry
> context.

## Target Resolution

`AnimationGroupArgs.target` is resolved per entry via `resolveTargets` (`../src/motion.ts:217-227`):

| `target` type   | Resolves to                                     | Groups created                                                                           |
| --------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `HTMLElement`   | `[target]`                                      | one `AnimationGroup`                                                                     |
| `HTMLElement[]` | `target` as-is                                  | one `AnimationGroup` per element                                                         |
| `string`        | `Array.from(document.querySelectorAll(target))` | one `AnimationGroup` per match (zero if none match — not an error)                       |
| `null`          | `[null]`                                        | one `AnimationGroup` for an element-less/`null` target, passed through to `getAnimation` |

## Stagger Offset Formula

```
offset[i] = (offsetEasing(i / last) * last * offset) | 0
```

where `i` is the (0-based) group index and `last` is the index of the final group (`count - 1`). Single-
group sequences (`count <= 1`) always produce `[0]`, regardless of `offset`/`offsetEasing`.

Each group's calculated offset is added to its animations' `delay` timing, and the sequence-level
`delay` is added on top of that. An `endDelay` is also computed per group so that **all groups share the
same total active duration** — this is what lets `finished` / `onFinish` resolve at the correct overall
time regardless of per-group stagger.

> **Rule**: the sequence-level `delay` shifts the whole timeline, so it is deliberately **excluded** from
> the `endDelay` computation — `endDelay = sequenceDuration - (baseDelay + offset[i] + duration × iterations)`.
> Folding `delay` into that subtraction produces negative `endDelay`s and breaks reverse playback.

## CSS-Driven Stagger (`sequenceId`)

When the child animations are **CSS Animations** (`AnimationGroup.isCSS`, i.e. picked up from
already-rendered CSS via `getElementCSSAnimation`) their `delay` comes from the generated `animation`
shorthand, not from the WAAPI. Overwriting it with `updateTiming({ delay })` would detach the animation
from its CSS declaration. So for that combination `Sequence` takes a different route:

| Condition                  | How the stagger delay is applied                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `sequenceId` set + `isCSS` | Sets `--motion-<sequenceId>-index` (the group index) and `--motion-<sequenceId>-last` on the group's target element |
| otherwise                  | `effect.updateTiming({ delay: baseDelay + offset[i] + sequence.delay })`                                            |

The matching `calc()` that consumes those custom properties is emitted by `getCSSAnimation` when it is
passed the same `SequenceOptions` — see [`./css-generation.md`](./css-generation.md#sequence-stagger-in-css).
`endDelay` is applied in **both** routes, so `finished`/`onFinish` behave identically.

- **MUST** pass the same `sequenceId` to `getCSSAnimation` (at CSS-generation time) and to
  `getSequence`/`new Sequence` (at runtime) — they are the two halves of one contract, joined only by
  the custom-property name. A mismatch silently yields no stagger: the `var()` fallbacks resolve
  `index` to `0` and every element animates at the base delay.
- **Rule**: a `Sequence` without a `sequenceId`, or one whose groups are WAAPI animations, behaves exactly
  as before — the CSS path is purely additive.
- **Rule**: the target must be an `HTMLElement` for the custom properties to be set; other targets fall
  through with `endDelay` applied but no stagger.

### Offsets by Easing

Given 5 groups with `offset: 200`:

| Easing    | Offsets                   | Distribution             |
| --------- | ------------------------- | ------------------------ |
| `linear`  | `[0, 200, 400, 600, 800]` | Even spacing             |
| `quadIn`  | `[0, 50, 200, 450, 800]`  | Slow start, accelerating |
| `sineOut` | `[0, 306, 565, 739, 800]` | Fast start, decelerating |

### Example

```typescript
import { getSequence } from '@wix/motion';

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
await sequence.onFinish(() => console.log('all staggered animations complete'));
```

## `Sequence` Class Surface

```typescript
class Sequence extends AnimationGroup {
  animationGroups: AnimationGroup[];
  delay: number;
  offset: number;
  offsetEasing: (p: number) => number;
  sequenceId: string | undefined;

  constructor(animationGroups: AnimationGroup[], options?: SequenceOptions);

  addGroups(entries: IndexedGroup[]): void;
  removeGroups(predicate: (group: AnimationGroup) => boolean): AnimationGroup[];
  async onFinish(callback: () => void): Promise<void>; // overridden

  // inherited from AnimationGroup — see ./waapi.md
  async play(callback?: () => void): Promise<void>;
  pause(): void;
  async reverse(callback?: () => void): Promise<void>;
  cancel(): void;
  progress(p: number): void;
  setPlaybackRate(rate: number): void;
  getProgress(): number;
  async onAbort(callback: () => void): Promise<void>;
  get finished(): Promise<Animation[]>;
  get playState(): AnimationPlayState;
  hasAnimationName(name: string): boolean;
  hasAnimationId(id: string): boolean;
  getTimingOptions(): { delay: number; duration: number; iterations: number }[];
}
```

```typescript
type IndexedGroup = { index: number; group: AnimationGroup };
```

- **`addGroups(entries)`** — inserts groups at the given indices (processed
  highest-index-first so earlier insertion indices stay valid), splices the new groups' animations into the
  flattened `animations` array at the matching position, recalculates offsets for **all** groups, and
  resets `ready` to `Promise.all(animationGroups.map(g => g.ready))`.
- **`removeGroups(predicate)`** — cancels and removes every group for which
  `predicate(group)` returns `true`, rebuilds the flattened `animations` array, recalculates offsets for
  the remaining groups, resets `ready`, and returns the removed groups (`[]` if none matched).
- **`onFinish(callback)`** (overridden) — awaits each child group's own
  `finished` promise individually (`Promise.all(animationGroups.map(g => g.finished))`), not the flattened
  `AnimationGroup.finished`. On any rejection it logs a warning via `console.warn` and does **not** invoke
  `callback`.
- **`delay` / `offset` / `offsetEasing` / `animationGroups`** are public fields set at construction. They
  can be read back, but mutating them after construction does **not** retrigger offset recalculation —
  `applyOffsets()` is private and only runs from the constructor, `addGroups`, and `removeGroups`. To
  change stagger timing, construct a new `Sequence`.
- **`offsetEasing` resolution**: if `options.offsetEasing` is a function, it's
  used as-is; if it's a string, it's resolved via `getJsEasing(string)`; otherwise (or if resolution fails)
  it falls back to the local `linear` easing. Valid string keys are the `jsEasings` set —
  `linear, sineIn, sineOut, sineInOut, quadIn, quadOut, quadInOut, cubicIn, cubicOut, cubicInOut, quartIn,
quartOut, quartInOut, quintIn, quintOut, quintInOut, expoIn, expoOut, expoInOut, circIn, circOut,
circInOut, backIn, backOut, backInOut`
  (`../src/easings.ts:187-213`) — or a raw `cubic-bezier(x1, y1, x2, y2)` string, or a custom
  `(p: number) => number` function.

### `addGroups` / `removeGroups` Examples

```typescript
import { AnimationGroup, Sequence } from '@wix/motion';

const sequence = new Sequence(existingGroups, { offset: 150 });

// insert a new group at position 2; offsets recompute for every group
sequence.addGroups([{ index: 2, group: new AnimationGroup(newAnimations) }]);

// remove groups targeting a specific element
const removed = sequence.removeGroups((group) =>
  group.animations.some((a) => (a.effect as KeyframeEffect)?.target === removedElement),
);
```

## Reduced Motion

`context.reducedMotion` (the 3rd arg to `getSequence`, 2nd arg to `createAnimationGroups`) is forwarded to
every `getAnimation(...)` call as its `reducedMotion` parameter, which forwards it to
`getWebAnimation`'s `options.reducedMotion` (see `./waapi.md`): single-iteration time-based animations
collapse to `duration: 1`; multi-iteration ones are dropped entirely (`getAnimation` returns `null` and
that entry is excluded from `createAnimationGroups`'s output). Stagger offsets are then computed over
whatever count of groups actually survived.

## Gotchas / Rules

- **MUST NOT** rely on scroll/pointer triggers inside a sequence: `createAnimationGroups` always calls
  `getAnimation(element, options, undefined, context?.reducedMotion)` — the `trigger` argument is
  hard-coded to `undefined`. Every group a sequence produces is a plain **time-based** animation,
  regardless of what scrub-specific fields (`startOffset`, `transitionDuration`, …) are present in the
  `AnimationOptions` you pass. For scroll/pointer-driven coordinated groups, drive individual
  `getScrubScene` results yourself instead (`./scrub-scenes.md`).
- **MUST** call `sequence.play()` (or `.reverse()`) to start playback — the constructor only computes
  offsets and applies timing; it does not auto-play.
- **MUST** use `sequence.onFinish(cb)` or `await sequence.finished` for completion — like the inherited
  `AnimationGroup.play()`, `play()` resolves once playback **starts**, not when it finishes.
- **Rule**: to change stagger timing after construction, build a new `Sequence` — mutating
  `delay`/`offset`/`offsetEasing` in place has no effect until `addGroups`/`removeGroups` runs.
  `applyOffsets()` is private.
- **Rule**: a `string` target with zero DOM matches, or an unresolved `namedEffect`, silently yields zero
  groups for that entry — not an error. Check `sequence.animationGroups.length` if you need to detect
  this.
- There is **no top-level `type` field** on `AnimationOptions` — discrimination is structural
  (`keyframeEffect` / `namedEffect` / `customEffect`). See `./motion-main.md`.

## See Also

- [`./motion-main.md`](./motion-main.md) — entry point, function map, package boundary, easing reference.
- [`./scrub-scenes.md`](./scrub-scenes.md) — for scroll/pointer-driven coordinated groups (not covered by
  `Sequence`).
- [`./waapi.md`](./waapi.md) — full `AnimationGroup` surface (`play`, `onFinish`, `finished`, `playState`,
  …) that `Sequence` extends, and the full `AnimationOptions` field tables.
