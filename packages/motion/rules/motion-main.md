---
name: motion-main
description: Read when working directly with @wix/motion — creating WAAPI/CSS/scroll/pointer animations imperatively, driving scrub scenes, building sequences, or generating CSS. For preset selection see @wix/motion-presets; for declarative trigger wiring see @wix/interact.
---

# `@wix/motion` Reference

`@wix/motion` is a low-level, web-first animation toolkit built on the native Web Animations API
(WAAPI) and CSS `@keyframes`, with scroll-driven (`ViewTimeline`) and pointer-tracking support.
It is the **imperative engine only** — it has no trigger system, no declarative config schema, and
ships no preset catalog of its own.

Package: `@wix/motion` · ESM entry (`module`): `dist/es/motion.js` · CJS (`main`): `dist/cjs/motion.js`
· types: `dist/types/index.d.ts` · `engines.node`: `>=18` · sole runtime dependency: `fastdom` ·
`sideEffects: false`. Install with `npm install @wix/motion`.

## Table of Contents

- [Package Boundary](#package-boundary)
- [Core Mental Model](#core-mental-model)
- [Effect-Definition Modes](#effect-definition-modes)
- [Function Map](#function-map)
- [Easing Reference](#easing-reference)
- [Gotchas](#gotchas)
- [Spoke Files](#spoke-files)

---

## Package Boundary

| Need | Use |
| --- | --- |
| Declarative trigger→effect wiring, config-driven orchestration, React/Web components | `@wix/interact` |
| Ready-made effect catalog (entrance/scroll/ongoing/mouse presets) | `@wix/motion-presets` (register via `registerEffects`) |
| Custom render callbacks, manual scrub-scene driving, programmatic sequences, SSR/CSS generation, inline keyframes | `@wix/motion` (this package) |

`@wix/motion`'s only contract with presets is the **registry** (`registerEffects`) and the structural
`EffectModule` shape it accepts. These motion rules document that contract only — they do **not**
list presets, preset parameters, category counts, or angle/direction conventions (those are a
`@wix/motion-presets` concern; see `@wix/motion-presets`'s `presets-main.md`). Trigger wiring,
`InteractConfig`, and CSS generation for a declarative page are a `@wix/interact` concern; see
`@wix/interact`'s `integration.md`.

## Core Mental Model

**`AnimationOptions` is discriminated STRUCTURALLY, not by a `type` field.**

```typescript
// src/types.ts:113-117 — no top-level `type` field anywhere on this union
type AnimationOptions = (TimeAnimationOptions | ScrubAnimationOptions) & AnimationExtraOptions;
```

The engine branches on which of `keyframeEffect` / `namedEffect` / `customEffect` is present on the
options object (`../src/api/common.ts:64-86`), and separately on the `trigger` argument passed to
`getWebAnimation`/`getScrubScene`:

- `trigger` **omitted** (or its `trigger` field is neither of the two values below) ⇒ **time-based**
  animation — options are `TimeAnimationOptions`.
- `trigger: { trigger: 'view-progress' }` ⇒ scroll-driven — options are `ScrubAnimationOptions`.
- `trigger: { trigger: 'pointer-move' }` ⇒ pointer-driven — options are `ScrubAnimationOptions`.

> ⚠️ **There is no top-level `type` field on the options object.** Do not write
> `{ type: 'TimeAnimationOptions', namedEffect: {...} }` — that field does not exist and is never read.
> This was the single most common historical error in hand-written/generated configs.
>
> ✅ `getWebAnimation(el, { namedEffect: { type: 'FadeIn' }, duration: 1000 })`
> ❌ `getWebAnimation(el, { type: 'TimeAnimationOptions', namedEffect: { type: 'FadeIn' }, duration: 1000 })`
>
> The **only** `type` field that legitimately exists is on `namedEffect` itself — and there it means
> "the registered preset name", not a discriminant for the outer options object:
> `NamedEffect = { type: string } & Record<string, unknown>` (`../src/types.ts:99`).

## Effect-Definition Modes

Exactly one of these three fields drives what actually animates (`../src/api/common.ts:64-86`):

| Mode | Field | Shape | Behavior |
| --- | --- | --- | --- |
| Inline keyframes | `keyframeEffect` | `{ name: string; keyframes: Keyframe[] }` (`MotionKeyframeEffect`, `../src/types.ts:138-141`) — **no `type` field** | WAAPI/CSS keyframes with zero registration required. `name` becomes the `@keyframes`/animation name. |
| Custom JS callback | `customEffect` | `(element: Element \| null, progress: number \| null) => void` | Per-frame callback driven by `CustomAnimation`'s `requestAnimationFrame` loop. The **only** programmatic mode — see the union caveat below. |
| Registered preset | `namedEffect` | `{ type: string } & Record<string, unknown>` (`NamedEffect`) | References an effect registered via `registerEffects()`. `type` is the registered name; other keys are preset-specific params owned by the preset package. Unregistered ⇒ `getWebAnimation` returns `null`. |

`CustomEffect` is itself a union (`../src/types.ts:101-105`):

```typescript
type CustomEffect =
  | { ranges: { name: string; min: number; max: number; step?: number }[] }   // INERT alone — no visible effect
  | ((element: Element | null, progress: number | null) => void);              // WORKS — the function form
```

Only the **function** form does anything at runtime in `@wix/motion`; the `{ ranges }` object form is
passed through as a keyframe-less animation and produces no visible effect on its own
(`../src/api/common.ts:82-84`). Always author `customEffect` as a function.

## Function Map

All functions below are exported from `@wix/motion`'s root (`../src/index.ts`, re-exporting
`../src/motion.ts:270-281`). Every return type that includes `| null` genuinely returns `null` at
runtime — type your consts accordingly.

| Function | Signature | Returns | Source |
| --- | --- | --- | --- |
| `getWebAnimation` | `(target, animationOptions, trigger?, options?, ownerDocument?)` | `AnimationGroup \| MouseAnimationInstance \| null` | `../src/api/webAnimations.ts:60` |
| `getCSSAnimation` | `(target, animationOptions, trigger?)` | `Array<{ target, animation, composition?, custom?, name, keyframes, id, animationTimeline, animationRange }>` — **an array of descriptors, never a string** | `../src/api/cssAnimations.ts:51` |
| `getScrubScene` | `(target, animationOptions, trigger, sceneOptions?)` | `ScrubScrollScene[] \| ScrubPointerScene \| ScrubPointerScene[] \| null` | `../src/motion.ts:74` |
| `getAnimation` | `(target, animationOptions, trigger?, reducedMotion?)` | `AnimationGroup \| MouseAnimationInstance \| null` | `../src/motion.ts:198` |
| `prepareAnimation` | `(target, animation, callback?)` | `void` | `../src/api/prepare.ts:5` |
| `getSequence` | `(options, animationGroups, context?)` | `Sequence` | `../src/motion.ts:261` |
| `createAnimationGroups` | `(animationGroupArgs, context?)` | `AnimationGroup[]` | `../src/motion.ts:232` |
| `registerEffects` | `(effects: Record<string, EffectModule>)` | `void` | `../src/api/registry.ts:5` |
| `getEasing` | `(easing?: string)` | `string` — CSS easing string, default `'linear'` | `../src/utils.ts:7` |
| `getJsEasing` | `(easing?: string)` | `((t: number) => number) \| undefined` | `../src/utils.ts:177` |

Also exported (not detailed here): `getElementCSSAnimation`, `getElementAnimation` — look for an
existing CSS animation already running on an element (used internally by `getAnimation`).

For full argument tables, return-case breakdowns, and the `AnimationGroup`/`AnimationOptions`
surfaces behind `getWebAnimation`, see [`./waapi.md`](./waapi.md).

## Easing Reference

`easing` fields accept a named key or a raw CSS easing string. There are two separate key sets —
do not mix them up:

**JS easings** (`jsEasings`, `../src/easings.ts:187-213`) — Penner functions, resolved by
`getJsEasing` (used internally for `offsetEasing` and `transitionEasing`):

`linear`, `sineIn`, `sineOut`, `sineInOut`, `quadIn`, `quadOut`, `quadInOut`, `cubicIn`, `cubicOut`,
`cubicInOut`, `quartIn`, `quartOut`, `quartInOut`, `quintIn`, `quintOut`, `quintInOut`, `expoIn`,
`expoOut`, `expoInOut`, `circIn`, `circOut`, `circInOut`, `backIn`, `backOut`, `backInOut`.

**CSS easings** (`cssEasings`, `../src/easings.ts:218-248`) — named → `cubic-bezier(...)` (or a
plain CSS keyword), resolved by `getEasing` for the `easing` option:

`linear`, `ease`, `easeIn`, `easeOut`, `easeInOut`, plus every JS key above except
`linear`/`ease*`, each mapped to a `cubic-bezier(...)` string.

Both helpers also accept a raw `cubic-bezier(x1, y1, x2, y2)` string (hyphenated — **not**
`cubicBezier(...)`), and `getJsEasing` additionally parses a CSS `linear(...)` string. `getEasing`
falls back to the raw string if it isn't a known key, else `'linear'`. `getJsEasing` returns
`undefined` only when `easing` is falsy, and otherwise falls back to `jsEasings.linear` if nothing
else parses.

**Easing names that DO NOT EXIST — never use:** `easeOutCubic`, `elasticOut`, `bounceOut`, `bounceIn`.

`elastic` and `bounce` **do** exist, but only as `ScrubTransitionEasing` values
(`'linear' | 'hardBackOut' | 'easeOut' | 'elastic' | 'bounce'`) for pointer-smoothing
(`transitionEasing` on `ScrubAnimationOptions`) — a completely different field from `easing`. Do not
pass `elastic`/`bounce` to `easing`.

## Gotchas

1. **No top-level `type` field on options** — discrimination is structural (see Core Mental Model).
2. `getCSSAnimation` returns an **array of descriptor objects**, not a string.
3. `customEffect` must be a **function** to do anything; the `{ ranges }` object form is inert.
4. `await group.play()` resolves once playback has **started**, not when it finishes — use
   `onFinish(callback)` or the `finished` promise for completion (see `./waapi.md`).
5. `AnimationGroup.finished` is `Promise<Animation[]>` (plural), not `Promise<Animation>`.
6. Pointer `axis` (`'x' | 'y'`) lives on the **trigger**, not on the effect options.
7. `iterations: 0` ⇒ `Infinity`; `iterations: undefined` ⇒ `1` (`../src/api/common.ts:100`).
8. `getWebAnimation` / `getScrubScene` / `getAnimation` can all return `null` — type consts accordingly.
9. `getWebAnimation` takes **one** `AnimationOptions` object, never an array. Use `getSequence` to
   coordinate multiple elements/effects.
10. `startOffset` / `endOffset` are fields on the **animation options** (`ScrubAnimationOptions`),
    not on the trigger.
11. The ESM import resolves to `dist/es/motion.js` (not `dist/esm/index.js`); requires Node `>=18`.
12. Use `Array.from(el.querySelectorAll(...))` before `.map` — a `NodeList` has no `.map`.
13. `cubic-bezier(...)` is hyphenated, not `cubicBezier(...)`.

## Spoke Files

- [`./waapi.md`](./waapi.md) — `getWebAnimation` full signature/return cases, `TimeAnimationOptions` /
  `ScrubAnimationOptions` field tables, and the complete `AnimationGroup` surface (play/pause/reverse/
  progress/onFinish/onAbort/finished/playState).
- `./scrub-scenes.md` — `getScrubScene`, `ScrubScrollScene`/`ScrubPointerScene`, and the
  native-`ViewTimeline`-vs-polyfill scroll/pointer driving loop.
- `./sequences.md` — `getSequence`, `createAnimationGroups`, `Sequence`'s stagger-offset formula, and
  `AnimationGroupArgs`.
- `./custom-effects.md` — authoring `customEffect` functions and `CustomAnimation`'s rAF loop/cancel
  semantics.
- `./css-generation.md` — `getCSSAnimation`'s descriptor shape and the SSR/FOUC-free CSS generation path.
