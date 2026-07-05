# API Reference

Index of everything `@wix/motion` exports — functions, classes, and types — with links to the full reference for each.

## Functions

| Function                    | Purpose                                                                          | Returns                                                              | Reference                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `getWebAnimation()`          | Create a WAAPI-backed animation — time-based, scroll-linked, or pointer-driven    | `AnimationGroup \| MouseAnimationInstance \| null`                    | [core-functions.md#getwebanimation](./core-functions.md#getwebanimation)        |
| `getCSSAnimation()`          | Generate CSS animation descriptors for stylesheet / SSR rendering                | `Array<{ target, animation, name, keyframes, ... }>`                 | [core-functions.md#getcssanimation](./core-functions.md#getcssanimation)        |
| `getScrubScene()`            | Build scroll-polyfill or pointer-driven scrub scenes                             | `ScrubScrollScene[] \| ScrubPointerScene \| ScrubPointerScene[] \| null` | [core-functions.md#getscrubscene](./core-functions.md#getscrubscene)            |
| `getAnimation()`             | Reuse an existing CSS animation if present, else fall back to `getWebAnimation()` | `AnimationGroup \| MouseAnimationInstance \| null`                    | [core-functions.md#getanimation](./core-functions.md#getanimation)              |
| `prepareAnimation()`         | Run an effect's `prepare()` hook (measure/mutate via `fastdom`) before animating  | `void`                                                                | [core-functions.md#prepareanimation](./core-functions.md#prepareanimation)      |
| `registerEffects()`          | Register named effect modules into the global registry                          | `void`                                                                | [core-functions.md#registereffects](./core-functions.md#registereffects)        |
| `getEasing()`                | Resolve a named/raw easing to a CSS easing string                               | `string`                                                              | [core-functions.md#geteasing--getjseasing](./core-functions.md#geteasing--getjseasing) |
| `getJsEasing()`              | Resolve a named/raw easing to a JS easing function                              | `((t: number) => number) \| undefined`                                | [core-functions.md#geteasing--getjseasing](./core-functions.md#geteasing--getjseasing) |
| `getSequence()`              | Coordinate multiple `AnimationGroup`s with staggered offsets                     | `Sequence`                                                            | [get-sequence.md#getsequence](./get-sequence.md#getsequence)                    |
| `createAnimationGroups()`    | Build `AnimationGroup`s from target/options pairs without a `Sequence` wrapper   | `AnimationGroup[]`                                                    | [get-sequence.md#createanimationgroups](./get-sequence.md#createanimationgroups) |

## Classes

| Class            | Purpose                                                                            | Reference                              |
| ---------------- | ------------------------------------------------------------------------------------- | --------------------------------------- |
| `AnimationGroup` | Controls one or more `Animation`s as a unit — play, pause, reverse, cancel, progress   | [animation-group.md](./animation-group.md) |
| `Sequence`       | Extends `AnimationGroup` to stagger multiple groups using easing-driven delay offsets  | [sequence.md](./sequence.md)            |

## Types

See [Type Definitions](./types.md) for the full `AnimationOptions`, trigger, and scrub-scene type reference.

## Guides

- [Custom Effects](../guides/custom-effects.md) — the `registerEffects()` / `EffectModule` contract, authoring `customEffect` callbacks, and driving scrub scenes.
- [SSR & CSS Generation](../guides/ssr-css.md) — `getCSSAnimation()` descriptors and the FOUC-free rendering contract.
- [Performance](../guides/performance.md) — `fastdom` batching and choosing between the CSS and WAAPI paths.

## Core mental model

> Every `AnimationOptions` object is discriminated **structurally** — there is no top-level `type` field. Pick exactly one effect mode:
>
> - **`keyframeEffect: { name, keyframes }`** — inline WAAPI/CSS keyframes, zero registration.
> - **`customEffect: (element, progress) => void`** — a per-frame JS callback; the only programmatic mode. Called with `progress: null` on cancel.
> - **`namedEffect: { type, ...params }`** — references an effect registered via `registerEffects()`. `type` here is the *preset name*, not a discriminator on the options object.
>
> Combine with a **trigger** (the 3rd argument to `getWebAnimation()` / `getScrubScene()`):
>
> - trigger omitted → time-based (`duration` / `easing` / `iterations`).
> - `{ trigger: 'view-progress' }` → scroll-driven.
> - `{ trigger: 'pointer-move' }` → pointer-driven.

## See also

- [Getting Started](../getting-started.md) — install and build your first animation.
- [Core Concepts](../core-concepts.md) — effect modes, triggers, and the mental model in depth.
- [Package README](../../README.md) — overview and quick start.
