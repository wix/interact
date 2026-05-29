<!-- AI: full docs index at https://wix.github.io/interact/llms.txt -->

# @wix/motion-presets

Ready-made animation presets for @wix/motion — entrance, scroll, pointer, loop, and background effects.

[![npm version](https://img.shields.io/npm/v/@wix/motion-presets.svg)](https://www.npmjs.com/package/@wix/motion-presets)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@wix/motion-presets)](https://bundlephobia.com/package/@wix/motion-presets)
[![license](https://img.shields.io/npm/l/@wix/motion-presets.svg)](https://github.com/wix/interact/blob/master/LICENSE)

## What's Included

75 ready-made animation presets across 5 categories:

| Category                                | Count | Description                                     |
| --------------------------------------- | ----- | ----------------------------------------------- |
| [Entrance](#entrance)                   | 19    | Play once when an element enters the viewport   |
| [Scroll](#scroll)                       | 19    | Progress tied to the element's scroll position  |
| [Ongoing](#ongoing)                     | 14    | Continuous looping animations                   |
| [Mouse](#mouse)                         | 11    | Real-time response to cursor position           |
| [Background Scroll](#background-scroll) | 12    | Parallax and depth effects for background media |

## Install

```bash
npm install @wix/motion-presets
```

`@wix/motion` is included as a dependency — no separate install needed.

## Quick Start — Registration

Presets are passive modules. Register them with `registerEffects()` from `@wix/motion` before calling `getWebAnimation()`, `getScrubScene()`, or `generate()`.

### Register all presets

```typescript
import { registerEffects } from '@wix/motion';
import * as presets from '@wix/motion-presets';

registerEffects(presets);
```

### Register selectively

Import only the presets you use to keep your bundle smaller:

```typescript
import { registerEffects } from '@wix/motion';
import { FadeIn, SlideIn, ParallaxScroll } from '@wix/motion-presets';

registerEffects({ FadeIn, SlideIn, ParallaxScroll });
```

## Usage with @wix/interact

Pass a `namedEffect` to any effect in an [`@wix/interact`](https://github.com/wix/interact/tree/master/packages/interact) config. Call `registerEffects()` before `generate()` and `Interact.create()`.

```typescript
import { Interact, generate } from '@wix/interact/web';
import * as presets from '@wix/motion-presets';

Interact.registerEffects(presets);

const config = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [{ effectId: 'fade-in' }],
    },
  ],
  effects: {
    'fade-in': {
      duration: 800,
      easing: 'ease-out',
      namedEffect: { type: 'FadeIn' },
      triggerType: 'once',
    },
  },
};

const css = generate(config, true);
const instance = Interact.create(config);
```

## Usage with @wix/motion

### Time-based entrance

```typescript
import { getWebAnimation, registerEffects } from '@wix/motion';
import * as presets from '@wix/motion-presets';

registerEffects(presets);

const animation = getWebAnimation(document.getElementById('hero'), {
  namedEffect: { type: 'FadeIn' },
  duration: 800,
  easing: 'ease-out',
});

animation.play();
```

### Scroll-driven

```typescript
import { getScrubScene, registerEffects } from '@wix/motion';
import * as presets from '@wix/motion-presets';

registerEffects(presets);

const scrollRoot = document.getElementById('scroll-root')!;

const scenes = getScrubScene(
  document.getElementById('card'),
  {
    namedEffect: { type: 'FadeScroll' },
    startOffset: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
    endOffset: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
    fill: 'both',
    easing: 'linear',
  },
  { trigger: 'view-progress', element: scrollRoot },
);
```

## Preset Categories

### Entrance

Animations optimized for when an element enters the viewport. Used with the `viewEnter` trigger (intersection observer), but can be wired to any trigger.

**Presets (19):** ArcIn, BlurIn, BounceIn, CurveIn, DropIn, ExpandIn, FadeIn, FlipIn, FloatIn, FoldIn, GlideIn, RevealIn, ShapeIn, ShuttersIn, SlideIn, SpinIn, TiltIn, TurnIn, WinkIn

→ [Entrance Preset Reference](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/entrance-presets.md)

### Scroll

Animations driven by an element's scroll progress through the viewport via ViewTimeline. Used with the `viewProgress` trigger.

**Presets (19):** ArcScroll, BlurScroll, FadeScroll, FlipScroll, GrowScroll, MoveScroll, PanScroll, ParallaxScroll, RevealScroll, ShapeScroll, ShrinkScroll, ShuttersScroll, SkewPanScroll, SlideScroll, Spin3dScroll, SpinScroll, StretchScroll, TiltScroll, TurnScroll

→ [Scroll Preset Reference](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/scroll-presets.md)

### Ongoing

Continuous looping animations that run indefinitely until stopped. Used with any trigger — typically `viewEnter` or `hover`.

**Presets (14):** Bounce, Breathe, Cross, DVD, Flash, Flip, Fold, Jello, Poke, Pulse, Rubber, Spin, Swing, Wiggle

→ [Ongoing Preset Reference](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/ongoing-presets.md)

### Mouse

Animations driven by pointer position in real time. Transform values respond to the cursor's `(x, y)` coordinates. Used with the `pointerMove` trigger.

> Mouse presets may behave differently on touch devices.

**Presets (11):** AiryMouse, BlobMouse, BlurMouse, BounceMouse, ScaleMouse, SkewMouse, SpinMouse, SwivelMouse, Tilt3DMouse, Track3DMouse, TrackMouse

→ [Mouse Preset Reference](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/mouse-presets.md)

### Background Scroll

Parallax and depth effects optimized for full-bleed background images and videos. Progress is tied to scroll position.

**Presets (12):** BgCloseUp, BgFade, BgFadeBack, BgFake3D, BgPan, BgParallax, BgPullBack, BgReveal, BgRotate, BgSkew, BgZoom, ImageParallax

## Choosing a Preset

| Intent                       | Category          | Example Presets                        |
| ---------------------------- | ----------------- | -------------------------------------- |
| Reveal content on scroll     | Entrance          | FadeIn, SlideIn, FloatIn               |
| Animate through the viewport | Scroll            | FadeScroll, ParallaxScroll, MoveScroll |
| Draw continuous attention    | Ongoing           | Pulse, Breathe, Wiggle                 |
| Respond to cursor position   | Mouse             | TrackMouse, Tilt3DMouse, BlurMouse     |
| Depth on background media    | Background Scroll | BgParallax, ImageParallax, BgZoom      |

For selection by tone and atmosphere (playful, elegant, bold, soft, dramatic, modern, etc.), see the [Selection by Atmosphere](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/presets-main.md#selection-by-atmosphere) guide.

## Parameter Conventions

### `direction`

The `direction` parameter accepts different value sets depending on the preset:

| Values                                   | Example Presets                                                         |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| `'top' \| 'right' \| 'bottom' \| 'left'` | SlideIn, FloatIn, FlipIn, FoldIn                                        |
| `'horizontal' \| 'vertical'`             | WinkIn, ArcScroll, FlipScroll, Flip                                     |
| `'clockwise' \| 'counter-clockwise'`     | SpinIn, SpinScroll, Spin                                                |
| `0–360` (degrees, number)                | GlideIn, ExpandIn, MoveScroll                                           |
| Corner values                            | TurnIn (`'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`) |

**Angle convention:** `0° = right (east)`, angles increase counter-clockwise.

### Distance units

Prefer the `{ value, unit }` object notation:

```typescript
namedEffect: {
  type: 'GlideIn',
  distance: { value: 120, unit: 'px' },
}
```

Supported units: `px`, `em`, `rem`, `vh`, `vw`, `vmin`, `vmax`, `percentage`.

### `iterationDelay` (ongoing only)

Adds an idle pause between loop cycles. Set on the `namedEffect`:

```typescript
namedEffect: { type: 'Bounce', iterationDelay: 1000 } // 1 s pause after each cycle
```

Available on all ongoing presets except DVD.

For full parameter standards and the coordinate system reference, see [Parameter Standards](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/presets-main.md#parameter-standards) in `presets-main.md`.

## Accessibility

Interact's `conditions` system lets you define media-query gates. Define a condition for `(prefers-reduced-motion: reduce)` and attach it to interactions or effects that use high-risk presets — when the query matches, those effects are skipped or replaced with safer alternatives.

See [Accessibility](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/presets-main.md#accessibility) in `presets-main.md` for full guidance and LLM principles.

### Preset risk levels

| Risk       | Presets                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| High       | SpinIn, Spin, BounceIn, Bounce, ArcIn, ArcScroll, FlipIn, FlipScroll, Spin3dScroll, Tilt3DMouse, Flash, DVD, Jello, Wiggle |
| Medium     | TurnIn, ParallaxScroll (at high speed values)                                                                              |
| Low / safe | FadeIn, FadeScroll, BlurIn, BlurScroll, Pulse, Breathe                                                                     |

### Reduced-motion fallbacks (subset)

| Original              | Fallback                  |
| --------------------- | ------------------------- |
| BounceIn, SpinIn      | FadeIn                    |
| ArcIn, FlipIn, TurnIn | FadeIn                    |
| Spin, Bounce, Wiggle  | Stop or subtle Pulse      |
| Flash                 | Reduce frequency (<3/sec) |
| ParallaxScroll        | Static position           |
| All mouse presets     | Static state              |

## AI & Agent Support

**Rules files** ship with the package under [`rules/presets/`](https://github.com/wix/interact/tree/master/packages/motion-presets/rules/presets) — point your agent at them:

| File                                                                                                                           | Contents                                                       |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| [`presets-main.md`](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/presets-main.md)         | Overview, parameter standards, atmosphere guide, accessibility |
| [`entrance-presets.md`](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/entrance-presets.md) | Entrance preset parameters and defaults                        |
| [`scroll-presets.md`](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/scroll-presets.md)     | Scroll preset parameters and defaults                          |
| [`ongoing-presets.md`](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/ongoing-presets.md)   | Ongoing preset parameters and defaults                         |
| [`mouse-presets.md`](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/mouse-presets.md)       | Mouse preset parameters and defaults                           |

**Generation constraints** for agents:

- Use only the preset names listed in this README as `namedEffect.type` values — do not invent types.
- When uncertain about a preset's parameters, omit them — the defaults will apply.
- Always call `registerEffects()` before `generate()` and `Interact.create()` (or before `getWebAnimation()`/`getScrubScene()`) when using `namedEffect`.
- Presets are JSON-serializable config objects.

## Related Packages

- [`@wix/motion`](https://github.com/wix/interact/tree/master/packages/motion) — the animation engine; provides `registerEffects()`, `getWebAnimation()`, and `getScrubScene()`
- [`@wix/interact`](https://github.com/wix/interact/tree/master/packages/interact) — declarative interaction layer; the recommended way to use presets in production

## License

[MIT](https://github.com/wix/interact/blob/master/LICENSE)
