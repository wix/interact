---
name: scrub-scenes
description: Reference for getScrubScene — the manual/polyfill path for driving scroll- or pointer-driven scrub animations from your own listener loop, when no native ViewTimeline is available or you need to drive progress yourself. Read when calling getScrubScene directly, writing a custom scroll/pointer driver, or debugging why a scrub animation isn't progressing.
---

# Scrub Scenes (`getScrubScene`)

`getScrubScene` is `@wix/motion`'s differentiator: it hands you a small, stateless "scene" object whose
`effect(_, progress)` method you call from **your own** scroll/pointer listener. It does not attach any
listeners itself — this is the manual/polyfill path, used when there is no native `ViewTimeline` to link
to, or for pointer-follow effects (which have no native browser equivalent). `@wix/interact` builds its
scroll and pointer triggers on top of exactly this function, using the bundled `fizban` scroll polyfill to
drive `ScrubScrollScene`s — reach for `@wix/interact` before hand-rolling a driver in application code.

## Table of Contents

- [Package Boundary](#package-boundary)
- [`getScrubScene` Signature](#getscrubscene-signature)
- [Return Cases](#return-cases)
- [`ScrubScrollScene` Contract](#scrubscrollscene-contract)
- [`ScrubPointerScene` Contract](#scrubpointerscene-contract)
- [Driving a Scroll Scene](#driving-a-scroll-scene)
- [Driving a Pointer Scene](#driving-a-pointer-scene)
- [Pointer Specifics](#pointer-specifics)
- [Native vs. Polyfill Duration](#native-vs-polyfill-duration)
- [Gotchas / Rules](#gotchas--rules)
- [See Also](#see-also)

## Package Boundary

| Need                                                                                                      | Use                                                    |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Declarative scroll/pointer triggers, automatic driving via `fizban`                                       | `@wix/interact`                                        |
| Ready-made scroll/mouse preset catalog                                                                    | `@wix/motion-presets` (register via `registerEffects`) |
| Manual scrub-scene driving, custom scroll/pointer loops, SSR fallback for browsers without `ViewTimeline` | `@wix/motion` (this file)                              |

This file documents the imperative engine only. It does not document preset params or angle/direction
conventions — those belong to `@wix/motion-presets`.

## `getScrubScene` Signature

```typescript
function getScrubScene(
  target: HTMLElement | string | null,
  animationOptions: AnimationOptions,
  trigger: Partial<TriggerVariant> & { element?: HTMLElement }, // may also carry `axis`
  sceneOptions: Record<string, any> = {}, // { disabled, allowActiveEvent, ...rest→getWebAnimation }
): ScrubScrollScene[] | ScrubPointerScene | ScrubPointerScene[] | null;
```

(`../src/motion.ts:74-196`)

| Arg                | Type                                                  | Notes                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `target`           | `HTMLElement \| string \| null`                       | An element, an element `id` (resolved via `getElementById`), or `null`.                                                                                                                                                                                                                                                                                                   |
| `animationOptions` | `AnimationOptions`                                    | Same structurally-discriminated options as `getWebAnimation` — `keyframeEffect` \| `namedEffect` \| `customEffect`, **no top-level `type` field**. For a real scrub effect this is typically the `ScrubAnimationOptions` shape (`startOffset`, `endOffset`, `transitionDuration`, `transitionEasing`, `centeredToTarget`, …) — see `./waapi.md` for the full field table. |
| `trigger`          | `Partial<TriggerVariant> & { element?: HTMLElement }` | 3rd arg. Set `trigger: 'view-progress'` or `trigger: 'pointer-move'` to get scrub behavior. Also carries `id`, `componentId`, `element`, and — pointer only — `axis?: 'x' \| 'y'`.                                                                                                                                                                                        |
| `sceneOptions`     | `Record<string, any>` (default `{}`)                  | Destructured as `{ disabled, allowActiveEvent, ...rest }`. `rest` is forwarded as the 4th arg (`options`) to `getWebAnimation` — e.g. pass `{ reducedMotion: true }` here to respect reduced motion.                                                                                                                                                                      |

> The declared return type includes `ScrubPointerScene[]`, but the current implementation never actually
> returns an array of pointer scenes — only a single `ScrubPointerScene`, an array of `ScrubScrollScene`,
> or `null`. Don't rely on the array-of-pointer-scenes case existing at runtime.

## Return Cases

| Condition                                                                               | Returns                                                                                                               | Notes                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Underlying animation couldn't be built (e.g. unregistered `namedEffect`)                | `null`                                                                                                                | Always guard for `null` before using the result.                                                                                                                                              |
| `trigger: 'view-progress'` and `window.ViewTimeline` is **absent**                      | `ScrubScrollScene[]` — one entry per partial animation in the group                                                   | The **only** branch that emits scroll scenes. This is the polyfill path.                                                                                                                      |
| `trigger: 'view-progress'` and `window.ViewTimeline` **exists**                         | a `ScrubPointerScene`-shaped wrapper around the native, timeline-linked `AnimationGroup`                              | The native `ViewTimeline` already drives this animation on scroll; there is nothing to scrub manually. Use `getWebAnimation` directly for the native path instead of calling `getScrubScene`. |
| `trigger: 'pointer-move'` and `animationOptions.keyframeEffect` is set                  | single `ScrubPointerScene` wrapping an `AnimationGroup`                                                               | `effect(_, p)` computes `linearProgress = axis === 'x' ? p.x : p.y` and calls `animationGroup.progress(linearProgress)`.                                                                      |
| `trigger: 'pointer-move'` and `namedEffect`/`customEffect` is set (no `keyframeEffect`) | single `ScrubPointerScene` wrapping a `MouseAnimationInstance` (or `CustomMouseAnimationInstance` for `customEffect`) | `effect(_, p)` calls the instance's `progress(p)`.                                                                                                                                            |

(`../src/motion.ts:90-195`)

## `ScrubScrollScene` Contract

```typescript
interface ScrubScrollScene {
  start: RangeOffset;
  end: RangeOffset;
  viewSource: HTMLElement;
  ready: Promise<void>;
  getProgress(): number;
  effect(__: any, p: number): void; // p is 0..1 scroll progress
  disabled: boolean;
  destroy(): void;
  groupId?: string;
}
```

(`../src/types.ts:222-232`)

- **`start` / `end`** — getters returning the resolved `RangeOffset` (`{ name?, offset? }`) for this
  partial animation, read lazily at access time rather than eagerly at scene creation
  (`../src/motion.ts:99-104`). Use these to align your own scroll-progress calculation to the same
  named range the animation was authored against.
- **`viewSource`** — the element to observe: `trigger.element`, or the element resolved from
  `trigger.componentId` via `getElementById`.
- **`ready`** — resolves once the animation's target has been measured/mutated (same `AnimationGroup.ready`
  promise underneath).
- **`getProgress()`** — reads back `AnimationGroup.getProgress()` (0 if no computed timing yet).
- **`effect(_, p)`** — call with `p` as a `0..1` scroll-progress number. Internally sets
  `partialAnimation.currentTime = (delay + activeDuration) * p`.
- **`disabled`** — pass-through of `sceneOptions.disabled` (not read internally by the scene itself — it's
  informational for your driver loop to skip disabled scenes).
- **`destroy()`** — cancels the underlying partial `Animation`. **Always call for every scene on
  teardown/unmount.**
- **`groupId?`** — declared on the type but not populated by `getScrubScene`.

`RangeOffset` (referenced by `start`/`end` and by `ScrubAnimationOptions.startOffset`/`endOffset`):

```typescript
type RangeOffset = {
  name?: 'entry' | 'exit' | 'contain' | 'cover' | 'entry-crossing' | 'exit-crossing';
  offset?: LengthPercentage; // { value: number; unit: 'px'|'em'|'rem'|'vh'|'vw'|'vmin'|'vmax' } | { value: number; unit: 'percentage' }
};
```

(`../src/types.ts:133-136`, `../src/types.ts:3-13`)

## `ScrubPointerScene` Contract

```typescript
interface ScrubPointerScene {
  target?: HTMLElement;
  centeredToTarget?: boolean;
  transitionDuration?: number;
  transitionEasing?: ScrubTransitionEasing;
  getProgress(): Progress | number;
  effect(__: any, p: Progress): void;
  disabled: boolean;
  destroy(): void;
  allowActiveEvent?: boolean;
  ready?: Promise<void>;
}

type Progress = { x: number; y: number; v?: { x: number; y: number }; active?: boolean };
```

(`../src/types.ts:234-245`, `../src/types.ts:74-79`)

- **`effect(_, p)`** — call with `p` as a `Progress` payload: `{ x, y }` at minimum, plus optional
  `v` (velocity `{x, y}`) and `active` (pointer-down/active state) for smoothing.
- **`destroy()`** — cancels the underlying `AnimationGroup`/`MouseAnimationInstance`. **Always call on
  teardown.**
- Which optional fields are actually populated depends on which branch produced the scene:

| Field                | `keyframeEffect` pointer path                   | `namedEffect`/`customEffect` pointer path                                |
| -------------------- | ----------------------------------------------- | ------------------------------------------------------------------------ |
| `target`             | `undefined`                                     | the wrapped `MouseAnimationInstance.target`                              |
| `centeredToTarget`   | from `animationOptions.centeredToTarget`        | from `animationOptions.centeredToTarget`                                 |
| `transitionDuration` | not set                                         | set only if `customEffect` **and** `transitionDuration` are both present |
| `transitionEasing`   | not set                                         | set only in that same case — see gotcha below                            |
| `allowActiveEvent`   | not set                                         | from `sceneOptions.allowActiveEvent`                                     |
| `ready`              | `animationGroup.ready`                          | not set (`undefined`)                                                    |
| `getProgress()`      | returns an internally-tracked last-driven value | delegates to the wrapped instance's own `getProgress()`                  |

- **Gotcha — `transitionEasing` is resolved, not raw**: when set, `scene.transitionEasing` is assigned
  `getJsEasing(transitionEasing)` — a **resolved JS easing function** `(t: number) => number` — despite the
  type declaring `transitionEasing?: ScrubTransitionEasing` (a string union). Don't treat it as a string at
  runtime (`../src/motion.ts:161-165`).
- **Gotcha — `getProgress()` may not exist**: the bottom fallback calls
  `(animation as AnimationGroup | CustomMouseAnimationInstance).getProgress()`. A plain
  `MouseAnimationInstance` (the base interface, `../src/types.ts:81-86`) does **not** declare
  `getProgress`; only `AnimationGroup` and `CustomMouseAnimationInstance` do. If a `namedEffect` mouse
  preset's factory returns a plain `MouseAnimationInstance`, calling `scene.getProgress()` can throw at
  runtime — verify with the specific preset (`@wix/motion-presets`) before relying on it.

## Driving a Scroll Scene

`getScrubScene` performs no observation — you own the scroll loop. This is a minimal illustration; a
spec-accurate implementation must resolve each scene's `start`/`end` named ranges the way the CSS
scroll-timeline spec (and `fizban`, which `@wix/interact` uses) does — this example uses a naive linear
approximation instead:

```javascript
const scenes = getScrubScene(
  target,
  animationOptions, // ScrubAnimationOptions with startOffset/endOffset
  { trigger: 'view-progress', id, componentId },
);

if (!scenes) {
  // animation could not be created, or the native ViewTimeline path was used instead
} else {
  const computeProgress = (viewSource) => {
    const rect = viewSource.getBoundingClientRect();
    const vh = window.innerHeight;
    // naive linear approximation — a real driver resolves start/end named ranges (cover/entry/exit/…)
    return Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
  };

  const onScroll = () => {
    scenes.forEach((scene) => {
      if (scene.disabled) return;
      scene.effect(null, computeProgress(scene.viewSource));
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // teardown
  function destroy() {
    window.removeEventListener('scroll', onScroll);
    scenes.forEach((scene) => scene.destroy());
  }
}
```

## Driving a Pointer Scene

```javascript
const scene = getScrubScene(
  target,
  animationOptions, // e.g. { keyframeEffect: {...} }
  { trigger: 'pointer-move', axis: 'y' },
);

if (!scene) {
  // animation could not be created
} else {
  const onPointerMove = (e) => {
    const rect = target.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    scene.effect(null, { x, y, active: true });
  };

  window.addEventListener('pointermove', onPointerMove);

  // teardown
  function destroy() {
    window.removeEventListener('pointermove', onPointerMove);
    scene.destroy();
  }
}
```

## Pointer Specifics

- **`axis: 'x' | 'y'`** lives on the **trigger** (3rd arg), not on `animationOptions`. In the
  `keyframeEffect` pointer path, `axis === 'x'` reads `p.x`, otherwise `p.y` (`../src/motion.ts:143`).
- **`centeredToTarget`** — on `ScrubAnimationOptions`; surfaced onto the returned scene for the driver to
  read.
- **Transition smoothing** — `transitionDuration` (ms) and `transitionEasing` on `ScrubAnimationOptions`:

  ```typescript
  type ScrubTransitionEasing = 'linear' | 'hardBackOut' | 'easeOut' | 'elastic' | 'bounce';
  ```

  (`../src/types.ts:131`) — these are **not** the same set as `jsEasings`/`cssEasings` (no `elasticOut`,
  `bounceOut`, etc. — see `./motion-main.md`'s easing reference for the general easing keys).

- **`allowActiveEvent`** — passed via `sceneOptions` (4th arg to `getScrubScene`), not via
  `animationOptions`.
- **`startOffset` / `endOffset`** — properties of the **`animationOptions`** (`ScrubAnimationOptions`),
  NOT of the trigger.
- **`ScrubAnimationOptions.duration` is a `LengthPercentage`, not milliseconds** — the core engine's own
  `KeyframeEffect` timing for scrub triggers is always either `'auto'` or the fixed `99.99ms`/`0.01ms` pair
  (see below); this field exists for a preset's own `web()` logic to interpret, not for engine timing.

## Native vs. Polyfill Duration

With `trigger: 'view-progress'` (`../src/api/common.ts:106-120`):

- If `window.ViewTimeline` exists (or `forCSS` is set, i.e. the `getCSSAnimation`/SSR path) →
  `duration: 'auto'`, timeline-linked, and it auto-plays.
- Otherwise → `duration: 99.99`, `delay: 0.01` (ms) so the animation's progress is externally scrubbable
  via `currentTime`, and `start`/`end` range info is written onto each animation for `getScrubScene` to
  read.

## Gotchas / Rules

- **MUST** check for `null` before using the result of `getScrubScene`.
- **MUST** drive `effect(...)` yourself, from your own scroll/pointer listener — `getScrubScene` attaches
  no listeners.
- **MUST** call `destroy()` on every scene (loop over the array for `ScrubScrollScene[]`) on teardown.
- **Rule**: pointer `axis` goes on the trigger (3rd arg), not inside `animationOptions`.
- **Rule**: `startOffset`/`endOffset` belong on `animationOptions`, not on the trigger.
- **Rule**: if `window.ViewTimeline` exists, don't call `getScrubScene` for `view-progress` — call
  `getWebAnimation` directly and let the native timeline drive it.
- **Rule**: `@wix/interact` (with its bundled `fizban` scroll polyfill) already implements a
  spec-accurate scroll driver and pointer driver on top of `getScrubScene` — prefer it over a hand-rolled
  driver in application code.
- There is **no top-level `type` field** on `animationOptions` — discrimination is structural
  (`keyframeEffect` / `namedEffect` / `customEffect`). See `./motion-main.md`.

## See Also

- [`./motion-main.md`](./motion-main.md) — entry point, function map, package boundary, easing reference.
- [`./waapi.md`](./waapi.md) — full `AnimationOptions` field tables and the `AnimationGroup` surface that
  scroll/keyframe pointer scenes wrap.
