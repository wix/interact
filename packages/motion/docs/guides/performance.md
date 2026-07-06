# Performance

`@wix/motion` is built on the Web Animations API and CSS Animations, which already run off the main
thread where possible. The guidance below is what actually affects performance in this package — nothing
more.

## Prefer `transform` and `opacity`

Both are compositor-only properties in modern browsers — animating them avoids layout and paint. Animate
`transform: translate()/scale()/rotate()` instead of `top`/`left`/`width`/`height`, and `opacity` instead
of `visibility`-style fades.

## Let `fastdom` batch your DOM reads and writes

`@wix/motion`'s only runtime dependency is [`fastdom`](https://github.com/wilsonpage/fastdom), which
batches DOM reads (`measure`) and writes (`mutate`) into separate animation-frame phases to avoid layout
thrashing. `prepareAnimation()` uses it to run an effect's optional `prepare(options, domApi)` hook —
measure, then mutate — before the animation is created:

```typescript
import { prepareAnimation, getWebAnimation } from '@wix/motion';

prepareAnimation(element, animationOptions, () => {
  // Runs inside a fastdom.mutate — safe to read layout-affecting styles
  // without triggering an extra reflow.
  getWebAnimation(element, animationOptions)?.play();
});
```

If you're animating many elements at once, prefer registering one effect module (with a single
`prepare` hook) over triggering many individual measurements — `fastdom` can only batch what's scheduled
through it.

## Use the CSS path for fire-and-forget effects

`getCSSAnimation()` generates `@keyframes`/`animation` descriptors instead of a live `Animation`
instance. Once the resulting CSS is in a stylesheet, the browser drives the animation on the compositor
thread with no per-frame JavaScript involvement — see [SSR & CSS Generation](./ssr-css.md). Reach for
`getWebAnimation()` (WAAPI) when you need playback control (`pause`, `reverse`, `setPlaybackRate`,
`onFinish`) or dynamic, runtime-computed keyframes.

## No animation loop unless you ask for one

Neither `getWebAnimation()` nor `getCSSAnimation()` runs a `requestAnimationFrame` loop. The only case
that does is a `customEffect` callback (see [Custom Effects](./custom-effects.md)) — `CustomAnimation`
runs an rAF loop for the lifetime of that animation to call your function on progress changes. If you use
`customEffect` for an infinite or scroll/pointer-driven effect, `cancel()` it (or otherwise stop the
underlying `Animation`) when the element leaves the viewport or unmounts, rather than leaving the loop
running.

## Respect reduced motion

Pass `{ reducedMotion: true }` as the 4th argument to `getWebAnimation()` (or via `context.reducedMotion`
to `getAnimation()` / `getSequence()`) to apply the user's `prefers-reduced-motion` preference. It only
affects time-based (non-scrub) animations:

- Single-iteration animations (`iterations: 1` or unset) collapse to a `1ms` duration.
- Multi-iteration animations (`iterations: 0` or `> 1`) are dropped entirely — `getWebAnimation()` returns
  `null`.

Guard the return value accordingly:

```typescript
const animation = getWebAnimation(element, animationOptions, undefined, {
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
});

animation?.play();
```

## See also

- [Custom Effects](./custom-effects.md) — authoring `customEffect` callbacks and registered effect
  modules.
- [SSR & CSS Generation](./ssr-css.md) — the `getCSSAnimation()` path in depth.
- [Core Functions](../api/core-functions.md) — full signatures for every function mentioned above.
