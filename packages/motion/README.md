# @wix/motion

Low-level, web-native animation engine — WAAPI, CSS, scroll-driven, and pointer-tracking animations with a single dependency.

[![npm version](https://img.shields.io/npm/v/@wix/motion.svg)](https://www.npmjs.com/package/@wix/motion)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@wix/motion)](https://bundlephobia.com/package/@wix/motion)
[![license](https://img.shields.io/npm/l/@wix/motion.svg)](./LICENSE)

## Why Motion?

- **Native-first** — Built directly on the Web Animations API and CSS Animations.
- **ViewTimeline** — First-class scroll-driven animations via the ViewTimeline API, with a scrub fallback when the API is unavailable.
- **Pointer-driven** — `pointer-move` animations map cursor `(x, y)` progress to effects, with optional transition smoothing.
- **Custom effects** — Plug in programmatic render callbacks — no preset registration required.
- **Dual rendering** — Choose CSS for declarative effects or WAAPI for fine-grained control, using the same options shape.
- **Performance** — `fastdom` batches DOM reads/writes; no `requestAnimationFrame` loop unless a custom callback opts in.
- **Pluggable presets** — `registerEffects()` accepts any effect module. Use [`@wix/motion-presets`](../motion-presets) or roll your own.

Motion is the engine layer. [`@wix/interact`](../interact) is the declarative configuration layer built on top of it.

## Install

```bash
npm install @wix/motion
```

## Quick Start

### Time-based animation (WAAPI)

```typescript
import { getWebAnimation } from '@wix/motion';

const animation = getWebAnimation(document.getElementById('hero'), {
  keyframeEffect: {
    name: 'fade-up',
    keyframes: [
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
  duration: 600,
  easing: 'ease-out',
});

animation.play();
```

### Scroll-driven (ViewTimeline)

```typescript
import { getWebAnimation } from '@wix/motion';

const scrollRoot = document.getElementById('viewport')!;

const animation = getWebAnimation(
  document.getElementById('parallax'),
  {
    keyframeEffect: {
      name: 'parallax',
      keyframes: [{ transform: 'translateY(80px)' }, { transform: 'translateY(-80px)' }],
    },
    startOffset: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
    endOffset: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
  },
  { trigger: 'view-progress', element: scrollRoot },
);
```

### Scroll-driven (polyfill / custom scrubbing)

```typescript
import { getScrubScene } from '@wix/motion';

const scrollRoot = document.getElementById('viewport')!;

const scenes = getScrubScene(
  document.getElementById('parallax'),
  {
    keyframeEffect: {
      name: 'parallax',
      keyframes: [{ transform: 'translateY(80px)' }, { transform: 'translateY(-80px)' }],
    },
    startOffset: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
    endOffset: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
  },
  { trigger: 'view-progress', element: scrollRoot },
);
// Drive each scene's `effect(scene, progress)` from your own scroll/IO listener
// when ViewTimeline is unavailable.
```

Quickstart examples use `keyframeEffect` (inline keyframes) so they run without registering presets.

## Animation Modes

| Mode           | Driver                        | API                                            |
| -------------- | ----------------------------- | ---------------------------------------------- |
| Time-based     | Duration + easing             | `getWebAnimation()` / `getCSSAnimation()`      |
| Scroll-driven  | ViewTimeline / external scrub | `getScrubScene()` with `view-progress` trigger |
| Pointer-driven | Mouse / touch position        | `getScrubScene()` with `pointer-move` trigger  |

## Core API

| Function             | Purpose                                                     |
| -------------------- | ----------------------------------------------------------- |
| `getWebAnimation()`  | Create WAAPI-backed animations (time- or scroll-linked)     |
| `getCSSAnimation()`  | Generate CSS animation descriptors for stylesheet injection |
| `getScrubScene()`    | Build scroll-polyfill or pointer-driven scrub scenes        |
| `prepareAnimation()` | Pre-measure / mutate DOM via `fastdom` before animating     |
| `getAnimation()`     | Auto-select CSS (if present) or WAAPI path                  |
| `getSequence()`      | Coordinate staggered groups with easing-based offsets       |
| `registerEffects()`  | Register named effect modules into the global registry      |

See [`docs/api/`](./docs/api/) for full signatures and options.

## Custom Effects

Three ways to define what an animation does:

1. **Inline keyframes** — pass `keyframeEffect: { name, keyframes }` directly. Zero registration.
2. **Custom callback** — pass `customEffect: (element, progress) => void` for full programmatic control per frame.
3. **Named presets** — pass `namedEffect: { type: '…', …params }` referencing effects you've registered via `registerEffects()` (use [`@wix/motion-presets`](../motion-presets) or your own modules).

## Sequences and Staggering

`getSequence()` coordinates multiple `AnimationGroup`s with staggered offsets. The stagger interval can be eased so groups bunch toward the start or end of the sequence.

```typescript
import { getSequence } from '@wix/motion';

const sequence = getSequence(
  { offset: 150, offsetEasing: 'quadIn' },
  Array.from(document.querySelectorAll('.card')).map((el) => ({
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
```

See [`docs/api/get-sequence.md`](./docs/api/get-sequence.md) for the full stagger model.

## ViewTimeline and Polyfills

Motion is built around progressive enhancement:

- **Native path** — when `window.ViewTimeline` is available, `getWebAnimation()` with a `view-progress` trigger returns a WAAPI animation linked to the scroll timeline.
- **Polyfill path** — `getScrubScene()` with `view-progress` returns `ScrubScrollScene[]` objects exposing `start`, `end`, `viewSource`, and `effect(scene, progress)`. Drive these from your own IntersectionObserver/scroll listener (or use the scroll driver in `@wix/interact`).
- **Pointer smoothing** — `ScrubPointerScene` accepts `transitionDuration` and `transitionEasing` so pointer-tracking effects don't snap to the cursor.

## Performance Notes

- `prepareAnimation()` runs `fastdom` measure/mutate phases before the animation starts, avoiding layout thrash.
- The CSS rendering path (`getCSSAnimation`) offloads work to the compositor thread.
- No `requestAnimationFrame` loop runs unless a `customEffect` callback is used.

## Browser Support

Modern evergreen browsers with Web Animations API support (Chrome, Edge, Firefox, Safari). The ViewTimeline API is used where available; pair `getScrubScene()` with an external driver for older browsers.

## Related Packages

- [`@wix/interact`](../interact) — declarative, config-driven interaction layer built on Motion.
- [`@wix/motion-presets`](../motion-presets) — ready-made effect catalog (entrance, ongoing, scroll, mouse, background-scroll).

## Documentation

- [Getting Started](./docs/getting-started.md)
- [Core Concepts](./docs/core-concepts.md)
- [API Reference](./docs/api/)
- [Category Guides](./docs/categories/)
- [Advanced Patterns](./docs/guides/)

## License

MIT
