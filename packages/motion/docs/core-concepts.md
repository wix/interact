# Core Concepts

The mental model behind `@wix/motion`: how it decides what to build from the options you pass in, and how effects, triggers, and easings fit together. Start with [Getting Started](./getting-started.md) if you haven't run your first animation yet.

## The options shape

`AnimationOptions` is a union of two shapes — there is **no top-level `type` field** to discriminate between them. The engine branches structurally: on which effect-definition field is present (`keyframeEffect` / `namedEffect` / `customEffect`) and on whether a `trigger` argument was passed.

```typescript
// ✅ correct
getWebAnimation(element, {
  namedEffect: { type: 'FadeIn' },
  duration: 1000,
});

// ❌ wrong — there is no top-level `type` on the options object
getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 1000,
});
```

`namedEffect` itself **does** have a `type` field — that's the registered preset name. It's only the top-level options object that has none.

**Time-based options** (used when no `trigger` is passed): `duration` (ms), `delay`, `endDelay`, `easing`, `iterations` (`0` ⇒ `Infinity`, `undefined` ⇒ `1`), `alternate`, `fill`, `reversed` — plus one of the three effect fields below.

**Scrub options** (used with a `view-progress` or `pointer-move` trigger): `startOffset` / `endOffset` (scroll range), `playbackRate`, `transitionDuration` / `transitionEasing` / `centeredToTarget` (pointer smoothing), `easing`, `iterations`, `fill`, `alternate`, `reversed` — plus one of the three effect fields. Note `duration` here is a `{ value, unit }` length/percentage, not milliseconds.

## The three effect-definition modes

Exactly one of these fields tells the engine what to animate:

1. **`keyframeEffect: { name, keyframes }`** — inline WAAPI/CSS keyframes. Zero registration.

   ```typescript
   { keyframeEffect: { name: 'fade-up', keyframes: [{ opacity: 0 }, { opacity: 1 }] } }
   ```

2. **`customEffect: (element, progress) => void`** — a per-frame JS callback, run on a `requestAnimationFrame` loop. This is the only programmatic mode. On cancel, the callback is invoked with `progress === null`, so handle it:

   ```typescript
   {
     customEffect: (element, progress) => {
       if (progress === null) {
         // cancelled — reset/cleanup here
         return;
       }
       element.style.opacity = String(progress);
     },
   }
   ```

   > `CustomEffect`'s type also allows a `{ ranges: [...] }` object form, but only the function form does anything — the object form is inert on its own.

3. **`namedEffect: { type, ...params }`** — references an effect registered via `registerEffects()`. If the name isn't registered, `getWebAnimation` returns `null`.

   ```typescript
   import { registerEffects } from '@wix/motion';
   import { FadeIn } from '@wix/motion-presets';

   registerEffects({ FadeIn });

   getWebAnimation(element, { namedEffect: { type: 'FadeIn' }, duration: 600 });
   ```

   `@wix/motion` only owns the registry contract (`registerEffects()` and the structural `EffectModule` shape) — the effect catalog itself lives in [`@wix/motion-presets`](https://github.com/wix/interact/tree/master/packages/motion-presets). See the [Custom Effects guide](./guides/custom-effects.md) for authoring your own registered effects.

## Triggers

The trigger is the third argument to `getWebAnimation()` / `getScrubScene()`:

```typescript
{ trigger?: 'view-progress' | 'pointer-move', id?: string, componentId?: string, element?: HTMLElement, axis?: 'x' | 'y' }
```

- **Omitted** (or neither value) → time-based animation.
- **`'view-progress'`** → scroll-driven; paired with scrub options. `startOffset`/`endOffset` live on the **options**, not the trigger.
- **`'pointer-move'`** → pointer-driven; the `axis` (`'x' | 'y'`) to read lives on the **trigger**, not on the effect options.

## Native ViewTimeline vs. the scrub polyfill

`view-progress` behaves differently depending on browser support:

- **`window.ViewTimeline` available** — `getWebAnimation()` returns a WAAPI animation linked directly to a `ViewTimeline` (`duration: 'auto'`). It auto-plays as the element scrolls through view; you don't call `.play()`.
- **Not available** — the underlying animation gets `duration: 99.99ms` / `delay: 0.01ms` so its progress is externally scrubbable. `getScrubScene()` is what turns that into `ScrubScrollScene[]` — plain objects (`start`, `end`, `effect(scene, progress)`, `destroy()`) that you drive from your own `IntersectionObserver`/scroll listener.
- **`getCSSAnimation()`** always generates `duration: 'auto'` for `view-progress`, regardless of runtime `ViewTimeline` support — it's the SSR/FOUC-free path.

If you're using `@wix/interact`, its bundled scroll polyfill, [`fizban`](https://github.com/wix-incubator/fizban), automates driving the polyfill path.

## Easing system

`getEasing` and `getJsEasing` are exported from `@wix/motion`:

```typescript
function getEasing(easing?: string): string; // CSS easing string, default 'linear'
function getJsEasing(easing?: string): ((t: number) => number) | undefined; // JS easing fn
function getJsEasingInCSS(easing?: string): ((t: string) => string) | undefined; // calc() builder
```

- **JS easings** (Penner functions — used by `getJsEasing` and as a `Sequence`'s `offsetEasing`): `linear`, `sineIn`, `sineOut`, `sineInOut`, `quadIn`, `quadOut`, `quadInOut`, `cubicIn`, `cubicOut`, `cubicInOut`, `quartIn`, `quartOut`, `quartInOut`, `quintIn`, `quintOut`, `quintInOut`, `expoIn`, `expoOut`, `expoInOut`, `circIn`, `circOut`, `circInOut`, `backIn`, `backOut`, `backInOut`.
- **CSS easings** (used by `getEasing` / the `easing` option): `linear`, `ease`, `easeIn`, `easeOut`, `easeInOut`, plus every JS key above (except `linear`/`ease*`) resolving to a `cubic-bezier(...)` string.
- Both also accept a raw `cubic-bezier(x1, y1, x2, y2)` string (hyphenated — not `cubicBezier(...)`), and `getJsEasing` additionally parses CSS `linear(...)` strings.
- Standard CSS timing-function keywords (like `ease-out`) work as-is wherever `easing` is accepted — they don't need to match one of the named keys above.
- **CSS-expression easings** (`getJsEasingInCSS`): the same curves as `getJsEasing`, plus `ease`/`easeIn`/`easeOut`/`easeInOut`, emitted as `calc()` string fragments rather than functions. Used to compile a `Sequence`'s `offsetEasing` into generated CSS — see [SSR & CSS Generation](./guides/ssr-css.md#staggering-a-list-from-one-rule).

There is no `easeOutCubic`, `elasticOut`, `bounceOut`, or `bounceIn` — those names don't exist. (`elastic`/`bounce` exist only as `transitionEasing` values for pointer smoothing, a separate field.)

## Reduced motion

Pass `{ reducedMotion: true }` as the 4th argument to `getWebAnimation()` (or `context.reducedMotion` for `getAnimation()`/`getSequence()`). It only affects **time-based** (non-scrub) animations:

```typescript
// single-iteration → collapsed to duration: 1 (still runs, effectively instant)
getWebAnimation(element, { namedEffect: { type: 'FadeIn' }, duration: 600 }, undefined, {
  reducedMotion: true,
});

// multi-iteration → dropped entirely, returns null
getWebAnimation(
  element,
  { namedEffect: { type: 'Spin' }, duration: 2000, iterations: 0 },
  undefined,
  { reducedMotion: true },
); // → null
```

## Sequences

`getSequence()` coordinates multiple `AnimationGroup`s under one staggered timeline, distributing start-time offsets across the group with an easing function:

```typescript
import { getSequence } from '@wix/motion';

const sequence = getSequence(
  { offset: 150, offsetEasing: 'quadIn' },
  Array.from(document.querySelectorAll('.card')).map((el) => ({
    target: el,
    options: {
      duration: 600,
      keyframeEffect: { name: 'fade-up', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
    },
  })),
);

sequence.play();
```

See [`getSequence` API reference](./api/get-sequence.md) for the full stagger model.

## Package boundary

| Need                                                                                                              | Use                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Declarative trigger→effect wiring, config-driven orchestration, React/Web Component bindings                      | [`@wix/interact`](https://github.com/wix/interact/tree/master/packages/interact)                                                |
| Ready-made effect catalog (entrance/scroll/ongoing/mouse presets)                                                 | [`@wix/motion-presets`](https://github.com/wix/interact/tree/master/packages/motion-presets) — register via `registerEffects()` |
| Custom render callbacks, manual scrub-scene driving, programmatic sequences, SSR/CSS generation, inline keyframes | `@wix/motion` (this package)                                                                                                    |

## Next steps

- [Getting Started](./getting-started.md) — install and run your first animations.
- [API Reference](./api/README.md) — full function signatures and types.
- [Custom Effects guide](./guides/custom-effects.md) — the `registerEffects()`/`EffectModule` contract, authoring `customEffect` callbacks, and driving scrub scenes.
