---
name: custom-effects
description: Read when authoring custom effects for @wix/motion — customEffect callbacks, registered effect modules via registerEffects, and data-motion-part sub-targeting.
---

# Custom Effects & `registerEffects`

Covers the two **programmatic** effect-definition modes in `@wix/motion`: a per-frame JS callback
(`customEffect`) and a reusable, named effect module registered via `registerEffects()` — plus
sub-element targeting via `data-motion-part`. For the third, non-programmatic mode
(`keyframeEffect`) and the full structural-discrimination mental model, see
[`./motion-main.md`](./motion-main.md). For driving a registered/`customEffect` animation from
scroll or pointer input, see `./scrub-scenes.md`. For the ready-made preset catalog — which is
itself built on the `registerEffects` contract documented here — see `@wix/motion-presets`.

## Table of Contents

- [Package Boundary](#package-boundary)
- [Effect-Definition Modes](#effect-definition-modes)
- [Authoring a `customEffect` Callback](#authoring-a-customeffect-callback)
- [Authoring a Registered Effect Module](#authoring-a-registered-effect-module)
- [`registerEffects`](#registereffects)
- [Using a Registered Effect](#using-a-registered-effect)
- [`data-motion-part` Sub-Targeting](#data-motion-part-sub-targeting)
- [Gotchas / Rules](#gotchas--rules)
- [See Also](#see-also)

## Package Boundary

| Need                                                                                               | Use                       |
| -------------------------------------------------------------------------------------------------- | ------------------------- |
| Declarative trigger→effect wiring, config-driven orchestration                                     | `@wix/interact`           |
| Ready-made effect catalog (entrance/scroll/ongoing/mouse presets) — already built on this contract | `@wix/motion-presets`     |
| Authoring a new custom callback or a new registered effect module                                  | `@wix/motion` (this file) |

This file documents the authoring contract only — it does not list presets, preset parameters, or
angle/direction conventions (a `@wix/motion-presets` concern).

## Effect-Definition Modes

Exactly one of three fields on `AnimationOptions` drives what animates (`../src/api/common.ts:64-86`).
There is **no top-level `type` field** — see [`./motion-main.md`](./motion-main.md#core-mental-model).

| #   | Field            | Shape                                                          | Registration required?                   |
| --- | ---------------- | -------------------------------------------------------------- | ---------------------------------------- |
| 1   | `keyframeEffect` | `{ name: string; keyframes: Keyframe[] }`                      | No — see `./motion-main.md`              |
| 2   | `customEffect`   | `(element: Element \| null, progress: number \| null) => void` | No — this file                           |
| 3   | `namedEffect`    | `{ type: string } & Record<string, unknown>`                   | Yes, via `registerEffects()` — this file |

This file covers modes 2 and 3.

## Authoring a `customEffect` Callback

```typescript
// ../src/types.ts:101-105
type CustomEffect =
  | { ranges: { name: string; min: number; max: number; step?: number }[] } // INERT — see gotcha below
  | ((element: Element | null, progress: number | null) => void); // the only mode that runs code
```

**MUST:** author `customEffect` as a **function** `(element, progress) => void`. The `{ ranges }`
object form type-checks but does nothing on its own — see [the gotcha below](#gotcha-the--ranges--object-form-is-inert).

### Runtime behavior

- A function `customEffect` is wrapped in `CustomAnimation` (`../src/CustomAnimation.ts`), built only
  when `typeof effect.customEffect === 'function'` (`../src/api/webAnimations.ts:145-153`).
- `CustomAnimation` wraps an inner `Animation` (its `KeyframeEffect` is forced to `composite: 'add'`
  so it isn't auto-removed) and runs a `requestAnimationFrame` loop that calls
  `customEffect(target, progress)` whenever the animation's computed progress changes
  (`../src/CustomAnimation.ts:45-63`).
- **On `cancel()`, the loop calls `customEffect(target, null)`** — your callback receives
  `progress === null` to signal cancellation (`../src/CustomAnimation.ts:155-163`). Handle `null` to
  reset/clean up whatever the callback previously mutated.
- `CustomAnimation` mirrors the `Animation` interface (`play`, `pause`, `cancel`, `reverse`,
  `finished`, `playState`, `currentTime`, …), so a `customEffect`-based `AnimationGroup` is driven the
  same way as a keyframe-based one — see `./waapi.md`.

### Minimal correct example

```typescript
import { getWebAnimation } from '@wix/motion';

const group = getWebAnimation(el, {
  customEffect: (element, progress) => {
    if (progress === null) {
      // cancelled — undo whatever this callback applied
      (element as HTMLElement | null)?.style.removeProperty('opacity');
      return;
    }
    (element as HTMLElement | null)?.style.setProperty('opacity', String(progress));
  },
  duration: 1000,
});

group?.play();
```

### Gotcha: the `{ ranges }` object form is inert

Passing `customEffect: { ranges: [...] }` satisfies the `CustomEffect` type but produces **no
visible effect on its own**:

- `getNamedEffect` (`../src/api/common.ts:82-84`) turns _any_ `customEffect` value — function or
  object — into `[{ ...options, keyframes: [] }]`, i.e. an `AnimationData` with **no keyframes**.
- Only when `typeof effect.customEffect === 'function'` does `getWebAnimation` build a
  `CustomAnimation` that actually calls your code (`../src/api/webAnimations.ts:145-153`). For the
  object form that check fails, so the engine instead builds a plain `Animation` from an **empty**
  `KeyframeEffect` — nothing animates.

**Rule:** always author `customEffect` as a function; do not rely on `{ ranges }` to do anything in
`@wix/motion` alone.

## Authoring a Registered Effect Module

The contract you implement for `registerEffects()` is `AnimationEffectAPI` (`../src/types.ts:57-66`):

```typescript
type AnimationEffectAPI<Enum extends keyof AnimationOptionsTypes> = {
  web: (
    animationOptions: AnimationOptionsTypes[Enum],
    dom?: DomApi,
    options?: Record<string, any>,
  ) => AnimationData[];
  getNames: (animationOptions: AnimationOptionsTypes[Enum]) => string[];
  style?: (options: AnimationOptionsTypes[Enum]) => AnimationData[];
  prepare?: (options: AnimationOptionsTypes[Enum], dom?: DomApi) => void;
};
```

| Member     | Required | Called from                                                                       | Returns / does                                                                                                                                                                                                                              |
| ---------- | -------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `web`      | Yes      | `getWebAnimation` (`../src/api/webAnimations.ts:52-54`)                           | Builds the `AnimationData[]` used to construct the runtime WAAPI `Animation`(s). Receives a `DomApi` (only when `target` resolves to an `HTMLElement`) for measuring before returning keyframes.                                            |
| `getNames` | Yes      | `getElementCSSAnimation` (`../src/motion.ts:41`)                                  | Returns the `@keyframes`/animation names this effect can produce, so `getAnimation`/`getElementCSSAnimation` can find a matching CSS animation **already running** on the element (by `animationName`) instead of creating a new WAAPI one. |
| `style`    | No       | `getCSSAnimation` → `getCSSAnimationEffect` (`../src/api/cssAnimations.ts:39-46`) | Same return shape as `web`, but for the CSS-generation/SSR path — see [`./css-generation.md`](./css-generation.md). If omitted, `getCSSAnimation` produces no descriptors for this effect.                                                  |
| `prepare`  | No       | `prepareAnimation` (`../src/api/prepare.ts:13-17`)                                | Runs measure/mutate work (via the `DomApi`) before the animation plays — e.g. reading layout to compute a keyframe value. No return value.                                                                                                  |

`DomApi` (`../src/types.ts:122-123`):

```typescript
type DomApi = { measure: MeasureCallback; mutate: MeasureCallback };
type MeasureCallback = (fn: (target: HTMLElement | null) => void) => void;
```

Both `measure`/`mutate` batch through `fastdom` (`../src/api/common.ts:56-62`) — use `dom.measure(...)`
for reads and `dom.mutate(...)` for writes to avoid layout thrashing.

### `AnimationData` — what `web`/`style` must return

```typescript
// ../src/types.ts:184-199
type AnimationData = (TimeAnimationOptions | AnimationDataForScrub) & {
  name?: string; // @keyframes / animation name
  keyframes: Record<string, string | number | undefined>[]; // WAAPI-style keyframe list
  custom?: Record<string, string | number | undefined>; // CSS custom properties the effect needs
  composite?: CompositeOperation;
  part?: string; // sub-target — see below
  timing?: Partial<EffectTiming>;
};
```

`web`/`style` return an **array** — one entry per animation the effect needs (e.g. a multi-part
effect drives one `AnimationData` per `part`).

### Other `EffectModule` shapes

`registerEffects` accepts the union `EffectModule` (`../src/types.ts:261-266`):

```typescript
type EffectModule =
  | AnimationEffectAPI<'time'>
  | AnimationEffectAPI<'scrub'>
  | ScrollEffectModule // { web(options, dom?): AnimationData[] } — ../src/types.ts:249-251
  | MouseEffectModule // { web(options): (element: HTMLElement) => object } — ../src/types.ts:253-255
  | WebAnimationEffectFactory<'scrub'>; // bare function, same signature as AnimationEffectAPI.web — ../src/types.ts:68-72
```

`ScrollEffectModule`/`MouseEffectModule`/`WebAnimationEffectFactory` are lower-level factory shapes
used internally by scroll/pointer preset authors. `AnimationEffectAPI` above is the shape to target
for a standard authored effect.

**`@wix/motion-presets` modules are exactly this shape.** For the full ready-made catalog
(entrance/scroll/ongoing/mouse), see `@wix/motion-presets` — do not re-derive preset params here.

## `registerEffects`

```typescript
// ../src/api/registry.ts:5-7
function registerEffects(effects: Record<string, EffectModule>): void;
```

- Merges the given map into a single **global** registry (`Object.assign(registry, effects)`) —
  later calls add to, and can overwrite, earlier registrations by name.
- Call it **before** any `getWebAnimation`/`getCSSAnimation`/`getScrubScene` call whose options
  reference the name via `namedEffect.type`.
- An unregistered name logs a `console.warn` and resolves to `null`
  (`../src/api/registry.ts:9-18`), which propagates: `getWebAnimation` returns `null` for that
  animation, and `getCSSAnimation` produces no descriptor for it.

```typescript
import { registerEffects } from '@wix/motion';
import type { AnimationEffectAPI, AnimationData } from '@wix/motion';

const FadeInLite: AnimationEffectAPI<'time'> = {
  getNames: () => ['fade-in-lite'],
  web: () =>
    [{ name: 'fade-in-lite', keyframes: [{ opacity: 0 }, { opacity: 1 }] }] as AnimationData[],
};

registerEffects({ FadeInLite });
```

## Using a Registered Effect

```typescript
import { getWebAnimation } from '@wix/motion';

getWebAnimation(el, { namedEffect: { type: 'FadeInLite' }, duration: 800, easing: 'ease-out' });
```

`namedEffect.type` is the **only** valid `type` in `@wix/motion` — it is the registered effect's
name, not a discriminator for the options object (no such field exists; see
[`./motion-main.md`](./motion-main.md#core-mental-model)).

## `data-motion-part` Sub-Targeting

An effect can target a sub-element instead of the animation root by setting `part` on the
`AnimationData` it returns. Resolution (`../src/api/common.ts:19-24`):

```typescript
function getElementMotionPart(element: Element | null, part: string) {
  if (element?.matches(`[data-motion-part~="${part}"]`)) {
    return element;
  }
  return element?.querySelector(`[data-motion-part~="${part}"]`);
}
```

- Matches the element itself, or the first matching descendant, carrying
  `data-motion-part~="<part>"` (space-separated attribute match, so one element can carry multiple
  part names).
- Used at runtime in `getWebAnimation` to pick the actual `KeyframeEffect` target
  (`../src/api/webAnimations.ts:130`): `part ? getElementMotionPart(element, part) : element`.
- In the CSS path (`./css-generation.md`), the target selector becomes
  `#<id>[data-motion-part~="<part>"]` (`../src/api/cssAnimations.ts:10-12`).

```html
<div id="card" data-motion-part="glow">
  <span data-motion-part="label">Hi</span>
</div>
```

```typescript
// one AnimationData returned by an effect's web()/style():
{ name: 'pulse-glow', part: 'glow', keyframes: [{ offset: 0, opacity: 0.4 }, { offset: 1, opacity: 1 }] }
```

## Gotchas / Rules

- **MUST** author `customEffect` as a **function** `(element, progress) => void` — the `{ ranges }`
  object form is inert in `@wix/motion` alone.
- **MUST** handle `progress === null` inside a `customEffect` callback — it is called with `null` on
  cancel, not skipped.
- **MUST** call `registerEffects()` before any options reference that name via `namedEffect.type` —
  otherwise `getWebAnimation`/`getCSSAnimation` silently drop the animation (`console.warn` plus an
  effective `null`/no descriptor).
- **MUST** implement both `web` and `getNames` on a registered effect module — `style` and `prepare`
  are optional.
- **Rule:** `namedEffect.type` is the registered effect's **name** — it is unrelated to the
  (nonexistent) top-level `type` field on `AnimationOptions`.
- **Rule:** for the ready-made effect catalog, install `@wix/motion-presets` and register it with
  `registerEffects(presets)` — do not hand-author what already exists there.

## See Also

- [`./motion-main.md`](./motion-main.md) — entry point, package boundary, structural discrimination,
  function map, easing reference.
- `./scrub-scenes.md` — driving a `customEffect`/registered scrub effect from your own scroll or
  pointer loop via `getScrubScene`.
- [`./css-generation.md`](./css-generation.md) — how a registered effect's `style()` output becomes
  SSR-safe CSS via `getCSSAnimation`.
