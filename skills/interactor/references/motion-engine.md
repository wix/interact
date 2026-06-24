# Motion engine reference (@wix/motion) — escape hatch

`@wix/motion` is the engine `@wix/interact` is built on. **On the interact-first
path you almost never call it directly** — the declarative config covers triggers,
presets, scroll, pointer, sequences, and CSS generation. Reach for the engine only
when you need imperative control the config can't express: driving an animation from
custom JS, building a one-off scripted timeline, or generating CSS descriptors
yourself.

`@wix/motion` ships *inside* `@wix/interact`, so it's already installed. Import from
`@wix/motion` directly. Single entry point (ESM: `dist/es/motion.js`).

> **Trust the source, not the bundled `docs/`.** The package's `docs/` folder
> contains several inaccuracies — this file reflects the actual source. In
> particular: there is **no** `type: 'TimeAnimationOptions'` discriminator field;
> `getCSSAnimation` returns an **array of descriptor objects**, not a string;
> `getWebAnimation`/`getCSSAnimation` take a **single** options object (never an
> array); `easeOutCubic`/`elasticOut` are **not** valid easings; the ESM path is
> `dist/es/motion.js` (not `dist/esm/index.js`).

## Public functions

| Function | Purpose |
| :-- | :-- |
| `getWebAnimation(target, options, trigger?, opts?, ownerDoc?)` | Build a WAAPI-backed `AnimationGroup` (time or scroll/ViewTimeline) or a mouse instance. |
| `getScrubScene(target, options, trigger, sceneOpts?)` | Build scroll-polyfill or pointer-driven "scenes" you drive yourself. |
| `getSequence(options, groups[], context?)` | Coordinate multiple `AnimationGroup`s with eased stagger offsets. |
| `getCSSAnimation(target, options, trigger?)` | Generate CSS animation **descriptor objects** (array) for stylesheet injection / SSR. |
| `getAnimation(...)` | Auto-pick CSS vs WAAPI. |
| `createAnimationGroups(...)` | Build `AnimationGroup[]` without wrapping in a `Sequence`. |
| `prepareAnimation(target, options, cb?)` | Run an effect's measure/mutate `prepare()` phase via fastdom, then a callback. |
| `getEasing(name)` | Map an easing name → CSS easing string. |
| `registerEffects(map)` | Register named-effect modules (same fn re-exported as `Interact.registerEffects`). |

## AnimationOptions

`AnimationOptions = TimeAnimationOptions | ScrubAnimationOptions`. Discriminated by
trigger + which effect field is present — **not** by a `type` field.

```ts
// time-based
{ keyframeEffect?: { name, keyframes[] };  namedEffect?: { type, ...params };  customEffect?: fn;
  duration?: number /*ms*/; delay?; endDelay?; easing?; iterations? /*0|Infinity = infinite*/;
  alternate?; fill?; reversed?; id? }

// scrub (scroll/pointer)
{ keyframeEffect? | namedEffect? | customEffect?;
  startOffset?: RangeOffset; endOffset?: RangeOffset; playbackRate?;
  easing?; iterations?; alternate?; fill?; reversed?;
  transitionDuration?; transitionDelay?; transitionEasing?; centeredToTarget?;
  duration?: LengthPercentage /* scrub duration is length/%, NOT ms */ }
```

Three ways to define the effect, resolved in this priority: `namedEffect` (needs
`registerEffects` first; unregistered → warn + null) → `keyframeEffect` (inline, no
registration) → `customEffect` `(element, progress) => void`.

## Time-based animation

```ts
import { getWebAnimation } from '@wix/motion';

const anim = getWebAnimation(document.getElementById('hero'), {
  keyframeEffect: { name: 'fade-up', keyframes: [
    { opacity: 0, transform: 'translateY(20px)' },
    { opacity: 1, transform: 'translateY(0)' },
  ]},
  duration: 600, easing: 'ease-out',
});
await anim.play();   // play/reverse await internal fastdom 'ready' first
```

**`AnimationGroup`**: `play(cb?)`, `pause()`, `reverse(cb?)`, `progress(p)` (scrub by
0–1), `cancel()`, `setPlaybackRate(r)`, `onFinish(cb)`/`onAbort(cb)`, `finished`
(Promise), `playState`, `getProgress()`. `onFinish` dispatches a
`CustomEvent('animationend', { detail: { effectId } })` on the target.

## Scroll-driven

If native `ViewTimeline` exists, `getWebAnimation(target, { startOffset, endOffset },
{ trigger: 'view-progress', element: scrollRoot })` links the timeline for you. Where
it's absent, `getScrubScene(...)` returns `ScrubScrollScene[]` you drive from your own
scroll/IntersectionObserver listener via `scene.effect(scene, progress0to1)` (await
`scene.ready` first). (When using `@wix/interact`, its bundled `fizban` polyfill does
this automatically — another reason to prefer the config.)

## Pointer-driven

`getScrubScene(target, options, { trigger: 'pointer-move', element, axis })` →
`ScrubPointerScene`. Drive with `scene.effect(scene, { x, y })` (0–1 within the hit
area). `centeredToTarget`, `transitionDuration`, `transitionEasing` smooth the follow.

## Sequences / stagger

```ts
import { getSequence } from '@wix/motion';
const seq = getSequence(
  { offset: 150, offsetEasing: 'quadIn' },
  [...document.querySelectorAll('.card')].map((el) => ({
    target: el,
    options: { duration: 600, easing: 'ease-out', keyframeEffect: { name: 'fade-up', keyframes: [
      { opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' } ] } },
  })),
);
seq.play();
```

`offset[i] = offsetEasing(i / last) * last * offsetMs`; the sequence rewrites each
group's delay so all end together.

## Easings — three separate namespaces (don't mix)

1. **`easing`** (time/scrub option) → `cssEasings`: `linear, ease, easeIn/Out/InOut, sineIn/Out/InOut, quadIn…, cubicIn…, quartIn…, quintIn…, expoIn…, circIn…, backIn/Out/InOut`, or any raw CSS `cubic-bezier(...)`/`linear(...)`. Unknown strings pass through unchanged (so a typo silently does nothing).
2. **`offsetEasing`** (sequence) → `jsEasings` function map, or a `cubic-bezier(...)`/`linear(...)` string; falls back to `linear`.
3. **`transitionEasing`** (scrub smoothing) → `'linear' | 'hardBackOut' | 'easeOut' | 'elastic' | 'bounce'` (note: `hardBackOut`/`elastic`/`bounce` fall back to `linear` internally).

## Engine gotchas

- **fastdom batching** makes setup async: `play()`/`reverse()` await `ready`; await `scene.ready` before reading `currentTime`/`progress`. Use `prepareAnimation()` to pre-measure layout values CSS can't compute.
- **Reduced motion** (`options.reducedMotion` / `context.reducedMotion`): time-based collapses `duration` to 1ms (single iteration); multi-iteration animations are dropped entirely (returns `[]`).
- **`customEffect`** is the only path with a rAF loop; it forces `composite: 'add'` and calls `customEffect(target, null)` on cancel (teardown signal).
- **Effect modules** (`AnimationEffectAPI`): `{ web(options, dom?) => AnimationData[], getNames(options) => string[], style?(options) => AnimationData[], prepare?(options, dom?) }`. Mouse presets instead export a factory `(options) => (target) => instance`.
- `iterations: 0` or `Infinity` → infinite. Generated animation ids: `${effectId}-${index+1}`. `part` in `AnimationData` targets a sub-element via `[data-motion-part~="…"]`.

## Registering inline custom effect modules

```ts
import { registerEffects } from '@wix/motion';
registerEffects({
  MyFade: {
    web:      (o) => [{ ...o, name: 'MyFade', keyframes: [{ opacity: 0 }, { opacity: 1 }] }],
    style:    (o) => [{ ...o, name: 'MyFade', keyframes: [{ opacity: 0 }, { opacity: 1 }] }],
    getNames: () => ['MyFade'],
  },
});
// now usable as namedEffect: { type: 'MyFade' } in either motion or interact
```
