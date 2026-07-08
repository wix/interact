---
name: waapi
description: Read when creating time-based or WAAPI animations with getWebAnimation, or controlling playback via the returned AnimationGroup (play/pause/reverse/progress/onFinish/onAbort).
---

# `getWebAnimation` & `AnimationGroup`

Entry point for creating a single WAAPI animation (or getting back a `MouseAnimationInstance` on the
pointer path) and the object you get back to control it. For the router and the shared mental model
(structural discrimination, effect-definition modes, easings), see [`./motion-main.md`](./motion-main.md).
For the scroll/pointer scrubbing layer built on top of this function, see `./scrub-scenes.md`.

## Table of Contents

- [`getWebAnimation` Signature](#getwebanimation-signature)
- [Return Cases](#return-cases)
- [`view-progress`: Native ViewTimeline vs Polyfill](#view-progress-native-viewtimeline-vs-polyfill)
- [`TimeAnimationOptions`](#timeanimationoptions)
- [`ScrubAnimationOptions`](#scrubanimationoptions)
- [`AnimationGroup`](#animationgroup)
- [Gotchas](#gotchas)

---

## `getWebAnimation` Signature

```typescript
// ../src/api/webAnimations.ts:60-66
function getWebAnimation(
  target: HTMLElement | string | null,
  animationOptions: AnimationOptions,
  trigger?: Partial<TriggerVariant> & { element?: HTMLElement },
  options?: Record<string, any>, // engine reads { reducedMotion }
  ownerDocument?: Document,
): AnimationGroup | MouseAnimationInstance | null;
```

| Arg                | Type                                                  | Notes                                                                                                                                                                                                           |
| ------------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `target`           | `HTMLElement \| string \| null`                       | A string is treated as an element `id` and resolved via `getElementById` (`ownerDocument` or `document`).                                                                                                       |
| `animationOptions` | `AnimationOptions`                                    | **Single** object — see [Core Mental Model](./motion-main.md#core-mental-model). Never an array; use `getSequence` to coordinate multiple elements/effects.                                                     |
| `trigger?`         | `Partial<TriggerVariant> & { element?: HTMLElement }` | `TriggerVariant = { id: string; trigger: 'view-progress' \| 'pointer-move'; componentId: string }` (`../src/types.ts:207-211`). Also read for pointer: `axis?: 'x' \| 'y'`. Omitted/neither value ⇒ time-based. |
| `options?`         | `Record<string, any>`                                 | Engine only reads `{ reducedMotion }` here; passed through to the registered effect's `web()` as its 3rd arg.                                                                                                   |
| `ownerDocument?`   | `Document`                                            | Used to resolve a string `target` in a different document (e.g. an iframe).                                                                                                                                     |

## Return Cases

- **`AnimationGroup`** — the default result for `keyframeEffect`/`namedEffect` (time or scrub trigger)
  and for `customEffect` on a non-pointer trigger.
- **`MouseAnimationInstance`** — returned **only** on the `pointer-move` trigger when
  `animationOptions.keyframeEffect` is **not** set (i.e. `namedEffect` or `customEffect` on
  `pointer-move`). Shape: `{ target, play(), progress(p: Progress), cancel() }`
  (`../src/types.ts:81-86`).
- **`null`** — returned when no effect data could be generated:
  - `namedEffect.type` isn't registered (`getRegisteredEffect` warns and returns `null`).
  - Reduced motion dropped a multi-iteration time-based animation (see [Gotchas](#gotchas)).
  - The pointer factory couldn't be built (`typeof mouseAnimationFactory !== 'function'`).
  - The effect's `web()` returned an empty array.

## `view-progress`: Native ViewTimeline vs Polyfill

`getWebAnimation` branches on runtime `ViewTimeline` support for `trigger: { trigger: 'view-progress' }`
(`../src/api/webAnimations.ts:116-190`):

- **`window.ViewTimeline` present** — a native `ViewTimeline` is constructed (`subject` = `trigger.element`
  or the element resolved from `trigger.componentId`), the animation's `duration` is set to `'auto'`,
  it is linked to that timeline, and it **auto-plays** immediately (`animation.play()` is called inside
  a `fastdom.mutate`).
- **`window.ViewTimeline` absent** — no timeline is attached. Instead `duration: 99.99ms` /
  `delay: 0.01ms` are used so the animation's progress can be driven externally by setting
  `currentTime`, and `start`/`end` range info (`{ name, offset, add }`, from `startOffset`/`endOffset`)
  is written directly onto each `Animation` object. This is the data `getScrubScene` reads to build
  `ScrubScrollScene[]` — see `./scrub-scenes.md`.

## `TimeAnimationOptions`

Used when `trigger` is omitted (time-based). `duration`/`delay`/`endDelay` are **milliseconds**.

```typescript
// ../src/types.ts:143-156
type TimeAnimationOptions = {
  id?: string;
  keyframeEffect?: MotionKeyframeEffect; // see Effect-Definition Modes in motion-main.md
  namedEffect?: NamedEffect;
  customEffect?: CustomEffect;
  duration?: number; // ms
  delay?: number; // ms
  endDelay?: number; // ms
  easing?: string; // named key or CSS easing string — see motion-main.md Easing Reference
  iterations?: number; // 0 ⇒ Infinity; undefined ⇒ 1
  alternate?: boolean;
  fill?: AnimationFillMode; // 'none' | 'backwards' | 'forwards' | 'both'
  reversed?: boolean;
};
```

## `ScrubAnimationOptions`

Used when `trigger.trigger` is `'view-progress'` or `'pointer-move'`.

```typescript
// ../src/types.ts:160-182
type ScrubAnimationOptions = {
  id?: string;
  keyframeEffect?: MotionKeyframeEffect;
  namedEffect?: NamedEffect;
  customEffect?: CustomEffect;
  startOffset?: RangeOffset; // { name?: 'entry'|'exit'|'contain'|'cover'|'entry-crossing'|'exit-crossing'; offset?: LengthPercentage }
  endOffset?: RangeOffset;
  playbackRate?: number;
  easing?: string;
  iterations?: number;
  fill?: AnimationFillMode;
  alternate?: boolean;
  reversed?: boolean;
  transitionDuration?: number; // pointer smoothing (ms)
  transitionDelay?: number;
  transitionEasing?: ScrubTransitionEasing; // 'linear' | 'hardBackOut' | 'easeOut' | 'elastic' | 'bounce'
  centeredToTarget?: boolean;
  duration?: LengthPercentage; // NOTE: length/percentage, NOT ms — unlike TimeAnimationOptions.duration
};
```

> ⚠️ `duration` means two different things depending on which options type is in play:
> `TimeAnimationOptions.duration` is a `number` of milliseconds; `ScrubAnimationOptions.duration` is a
> `LengthPercentage` (`{ value: number; unit: 'px'|'em'|'rem'|'vh'|'vw'|'vmin'|'vmax' } | { value: number; unit: 'percentage' }`).
> `startOffset`/`endOffset` (not the trigger) are where scroll-range boundaries live.

## `AnimationGroup`

A wrapper that simulates a WAAPI `GroupEffect` over one or more native `Animation` objects
(`../src/AnimationGroup.ts`). `getWebAnimation` returns one whenever it doesn't return a
`MouseAnimationInstance` or `null`.

**Constructor:** `new AnimationGroup(animations: Animation[], options?: AnimationGroupOptions)`.

**Properties:**

| Property           | Type                                                         | Notes                                                                                          |
| ------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `animations`       | `(Animation & { start?: RangeOffset; end?: RangeOffset })[]` | The wrapped native animations; `start`/`end` are written for the no-`ViewTimeline` scrub path. |
| `options?`         | `AnimationGroupOptions`                                      | The `AnimationOptions` this group was built from, plus `trigger`/offset-add fields.            |
| `ready`            | `Promise<void>`                                              | Resolves once targets are measured/mutated (`fastdom`). `play()`/`reverse()` await this first. |
| `isCSS`            | `boolean`                                                    | `true` if `animations[0] instanceof CSSAnimation`.                                             |
| `longestAnimation` | `Animation`                                                  | The animation with the greatest computed `effect.getComputedTiming().endTime`.                 |

**Methods:**

| Method             | Signature                                                                       | Behavior                                                                                                                                                                                                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `play`             | `async play(callback?: () => void): Promise<void>`                              | Awaits `ready`, calls `.play()` on every animation, awaits each `animation.ready`, then calls `callback`. **Resolves once playback has STARTED, not when it finishes** (`../src/AnimationGroup.ts:39-53`).                                                                                                                                |
| `pause`            | `pause(): void`                                                                 | Calls `.pause()` on every animation.                                                                                                                                                                                                                                                                                                      |
| `reverse`          | `async reverse(callback?: () => void): Promise<void>`                           | Same shape as `play`, but calls `.reverse()`.                                                                                                                                                                                                                                                                                             |
| `progress`         | `progress(p: number): void`                                                     | Sets `currentTime` on every animation to `(delay + duration*iterations) * p`, scrubbing all of them to progress `p`.                                                                                                                                                                                                                      |
| `cancel`           | `cancel(): void`                                                                | Calls `.cancel()` on every animation.                                                                                                                                                                                                                                                                                                     |
| `setPlaybackRate`  | `setPlaybackRate(rate: number): void`                                           | Sets `playbackRate` on every animation.                                                                                                                                                                                                                                                                                                   |
| `getProgress`      | `getProgress(): number`                                                         | `longestAnimation.effect.getComputedTiming().progress`, or `0` if unavailable.                                                                                                                                                                                                                                                            |
| `onFinish`         | `async onFinish(callback: () => void): Promise<void>`                           | Awaits `Promise.all(animations.map(a => a.finished))`. On success, if the group isn't CSS, dispatches `new CustomEvent('animationend', { detail: { effectId } })` on the first animation's target, then calls `callback`. On interruption/rejection, logs a warning and does **not** call `callback` (`../src/AnimationGroup.ts:99-119`). |
| `onAbort`          | `async onAbort(callback: () => void): Promise<void>`                            | Awaits the same `finished` promise; if it rejects with `AbortError`, dispatches `new Event('animationcancel')` on the first non-CSS target and calls `callback` (`../src/AnimationGroup.ts:121-140`).                                                                                                                                     |
| `hasAnimationName` | `hasAnimationName(name: string): boolean`                                       | `true` if any animation is a `CSSAnimation` with that `animationName`.                                                                                                                                                                                                                                                                    |
| `hasAnimationId`   | `hasAnimationId(id: string): boolean`                                           | `true` if any animation has that `id`.                                                                                                                                                                                                                                                                                                    |
| `getTimingOptions` | `getTimingOptions(): { delay: number; duration: number; iterations: number }[]` | One entry per animation, read from `effect.getTiming()`.                                                                                                                                                                                                                                                                                  |

**Getters:**

| Getter      | Type                   | Behavior                                                                                                                                                                                         |
| ----------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `finished`  | `Promise<Animation[]>` | `Promise.all(animations.map(a => a.finished))`. **Plural — an array of `Animation`, not a single one.** This (or `onFinish`) is the correct way to observe completion — `await play()` does not. |
| `playState` | `AnimationPlayState`   | `'running'` if **any** wrapped animation is `'running'`; otherwise the first animation's `playState`.                                                                                            |

## Gotchas

- **MUST** treat `await group.play()` as "playback started", not "playback finished" — use
  `group.onFinish(callback)` or `await group.finished` to react to completion.
- **MUST** account for `AnimationGroup.finished` being `Promise<Animation[]>` — don't destructure it
  as a single `Animation`.
- **MUST** pass `getWebAnimation` a single `AnimationOptions` object, never an array — use
  `getSequence`/`createAnimationGroups` (see `./sequences.md`) to drive multiple elements together.
- **MUST** type the result of `getWebAnimation` as nullable (`AnimationGroup | MouseAnimationInstance | null`)
  — an unregistered `namedEffect`, a dropped reduced-motion animation, or a failed pointer factory all
  produce `null`.
- **Rule:** `iterations: 0` means `Infinity`, not zero iterations; `undefined` means `1`
  (`../src/api/common.ts:100`). This applies to both `TimeAnimationOptions.iterations` and
  `ScrubAnimationOptions.iterations`.
- **Rule — reduced motion** (`options.reducedMotion`, threaded through `getAnimation`/`getSequence`'s
  `context.reducedMotion`; only affects **time-based**, non-scrub animations,
  `../src/api/webAnimations.ts:38-44`):
  - single-iteration (`iterations === 1` or `undefined`) ⇒ collapsed to `duration: 1`.
  - multi-iteration ⇒ the effect returns `[]`, so `getWebAnimation` returns `null` (animation dropped
    entirely, not just shortened).
- **Rule:** on `pointer-move`, the `axis` (`'x' | 'y'`) that selects which pointer coordinate drives
  progress lives on the **trigger** object, not on `animationOptions`.

## See Also

- [`./motion-main.md`](./motion-main.md) — package boundary, structural discrimination, effect-definition
  modes, function map, easing reference.
- `./scrub-scenes.md` — `getScrubScene`, `ScrubScrollScene`/`ScrubPointerScene`, and how the no-`ViewTimeline`
  polyfill path drives `AnimationGroup.progress()` from scroll/pointer events.
