# Custom Effects

`@wix/motion` gives you three mutually-exclusive ways to describe what an animation does
(`keyframeEffect` / `customEffect` / `namedEffect`), plus a registry for sharing named effects, and a
scrub-scene contract for driving scroll/pointer effects yourself. This guide covers everything beyond
inline keyframes: the `customEffect` callback, authoring and registering your own effect modules, and
manually driving scrub scenes.

> **Gotchas**
>
> - There is no top-level `type` field on the options object — see [Core Concepts](../core-concepts.md).
> - `customEffect` only does something when it's a **function**. The `{ ranges }` object form is accepted
>   by the type but is inert in `@wix/motion` alone.
> - An unregistered `namedEffect.type` makes `getRegisteredEffect` warn and return `null` — which makes
>   `getWebAnimation`/`getCSSAnimation`/`getScrubScene` return `null` (or `[]`) too.

## 1. Inline keyframes (recap)

The zero-registration path is `keyframeEffect: { name, keyframes }` — a `name` for the animation/
`@keyframes`, and a standard WAAPI `Keyframe[]`. See [Getting Started](../getting-started.md) for a full
walkthrough; this guide focuses on the other two modes.

```typescript
getWebAnimation(element, {
  keyframeEffect: {
    name: 'fade-up',
    keyframes: [
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
  duration: 600,
});
```

## 2. The `customEffect` callback

`customEffect` is the only **programmatic** mode — a per-frame JavaScript callback instead of CSS/WAAPI
keyframes:

```typescript
type CustomEffect =
  | { ranges: { name: string; min: number; max: number; step?: number }[] } // inert in @wix/motion
  | ((element: Element | null, progress: number | null) => void); // the working form
```

When `customEffect` is a function, `getWebAnimation` builds a `CustomAnimation` internally instead of a
plain `KeyframeEffect`. `CustomAnimation` wraps a real `Animation` (so `play`/`pause`/`cancel`/`finished`/
`playState` all behave normally) and runs a `requestAnimationFrame` loop that calls
`customEffect(target, progress)` whenever the animation's computed progress changes. On `cancel()`, it
calls `customEffect(target, null)` once — **`progress === null` signals cancellation**, and your callback
should treat it as a reset/cleanup instruction, not just another frame.

The returned value is still a plain `AnimationGroup` — `CustomAnimation` is an internal implementation
detail and isn't exported from the package.

### Example: driving a CSS custom property

```typescript
import { getWebAnimation } from '@wix/motion';

function paintGauge(element: Element | null, progress: number | null) {
  const target = element as HTMLElement | null;
  if (!target) return;

  if (progress === null) {
    // Cancelled — reset to a known state.
    target.style.removeProperty('--gauge-progress');
    return;
  }

  target.style.setProperty('--gauge-progress', String(progress));
}

const gauge = document.getElementById('gauge');

const animation = getWebAnimation(gauge, {
  customEffect: paintGauge,
  duration: 2000,
  iterations: 0, // 0 ⇒ Infinity
  easing: 'linear',
});

animation?.play();

// later, e.g. on teardown:
// animation?.cancel(); // paintGauge(target, null) fires, clearing the custom property
```

```css
#gauge {
  background: conic-gradient(steelblue calc(var(--gauge-progress, 0) * 360deg), #eee 0);
}
```

The same pattern works for driving a `<canvas>` render loop, a WebGL uniform, or any other per-frame
side effect that CSS/WAAPI keyframes can't express directly — `customEffect` gets called on the engine's
own rAF cadence rather than one you manage yourself.

## 3. `registerEffects()` and the `EffectModule` contract

For effects you want to reuse by name — `namedEffect: { type: 'MyEffect', ...params }` — author a module
matching `AnimationEffectAPI` and register it with `registerEffects()`.

```typescript
type AnimationEffectAPI<Enum> = {
  web: (options, dom?: DomApi, config?: Record<string, any>) => AnimationData[];
  getNames: (options) => string[];
  style?: (options) => AnimationData[]; // enables the CSS path (getCSSAnimation)
  prepare?: (options, dom?: DomApi) => void; // measure/mutate before animating
};

type DomApi = { measure: MeasureCallback; mutate: MeasureCallback };
type MeasureCallback = (fn: (target: HTMLElement | null) => void) => void;
```

- `web` is required — it returns the `AnimationData[]` used to build the WAAPI `KeyframeEffect`(s).
- `getNames` is required — it returns the animation/`@keyframes` name(s) the module produces, used to
  look up existing CSS animations on an element (`getElementCSSAnimation`).
- `style` is optional — implement it (same return shape as `web`) to opt into the `getCSSAnimation()` /
  SSR path. See [SSR & CSS Generation](./ssr-css.md).
- `prepare` is optional — a measure/mutate hook run by `prepareAnimation()` before the animation plays,
  useful when the effect needs a real layout measurement it can't express purely in CSS.

### Example: a module that measures before animating

This effect reveals an element's width by measuring its natural rendered width in `prepare` (via
`dom.measure`), writing it as a CSS custom property (via `dom.mutate`), and animating toward that
variable in both the WAAPI and CSS paths:

```typescript
import type { AnimationEffectAPI, AnimationData } from '@wix/motion';

export const RevealWidth: AnimationEffectAPI<'time'> = {
  getNames: () => ['RevealWidth'],

  prepare(_options, dom) {
    dom?.measure((target) => {
      const width = target?.getBoundingClientRect().width ?? 0;

      dom.mutate((mutateTarget) => {
        (mutateTarget as HTMLElement | null)?.style.setProperty('--reveal-width', `${width}px`);
      });
    });
  },

  web(options): AnimationData[] {
    return [
      {
        ...options,
        name: 'RevealWidth',
        keyframes: [{ width: '0px' }, { width: 'var(--reveal-width)' }],
      },
    ];
  },

  style(options): AnimationData[] {
    return [
      {
        ...options,
        name: 'RevealWidth',
        keyframes: [{ width: '0px' }, { width: 'var(--reveal-width)' }],
      },
    ];
  },
};
```

Register it, then reference it anywhere via `namedEffect`:

```typescript
import { registerEffects, prepareAnimation, getWebAnimation } from '@wix/motion';
import { RevealWidth } from './effects/RevealWidth';

registerEffects({ RevealWidth });

const bar = document.getElementById('bar')!;

prepareAnimation(bar, { namedEffect: { type: 'RevealWidth' } }, () => {
  const animation = getWebAnimation(bar, {
    namedEffect: { type: 'RevealWidth' },
    duration: 600,
    easing: 'ease-out',
  });

  animation?.play();
});
```

If `'RevealWidth'` were never registered, `getRegisteredEffect` would warn to the console and
`getWebAnimation` would return `null`.

`@wix/motion-presets` ships a large catalog of effects built to this exact contract — reach for it before
authoring your own module when a suitable preset already exists.

## 4. Driving scrub scenes manually

`getScrubScene()` is for the cases where nothing drives progress for you automatically: the
`view-progress` polyfill (no native `window.ViewTimeline`) and `pointer-move` effects. It returns scene
objects exposing `effect(_, progress)` and `destroy()`, which **you** call from your own listener.

```typescript
function getScrubScene(
  target: HTMLElement | string | null,
  animationOptions: AnimationOptions,
  trigger: Partial<TriggerVariant> & { element?: HTMLElement },
  sceneOptions?: Record<string, any>,
): ScrubScrollScene[] | ScrubPointerScene | ScrubPointerScene[] | null;
```

`@wix/interact` automates both of the cases below via its bundled scroll polyfill,
[`fizban`](https://github.com/wix-incubator/fizban) — reach for `getScrubScene` directly only when you
need to drive progress yourself outside of `@wix/interact`.

### Scroll (`view-progress` polyfill)

When `window.ViewTimeline` is unavailable, `getScrubScene` returns a `ScrubScrollScene[]` — one entry per
partial animation, each exposing `viewSource`, `getProgress()`, `effect(_, progress)`, and `destroy()`.

```typescript
import { getScrubScene } from '@wix/motion';

const scrollRoot = document.getElementById('scrollRoot')!;
const target = document.getElementById('parallax')!;

const scenes = getScrubScene(
  target,
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

// getScrubScene can return null if the underlying animation couldn't be created.
if (Array.isArray(scenes)) {
  scenes.forEach((scene) => {
    function onScroll() {
      const progress = computeProgress(scene.viewSource); // your own 0..1 calculation
      scene.effect(null, progress);
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // on teardown:
    // window.removeEventListener('scroll', onScroll);
    // scene.destroy();
  });
}
```

### Pointer (`pointer-move`)

For pointer-driven effects, `getScrubScene` returns a single `ScrubPointerScene`. Drive it from your own
`pointermove` listener with normalized `{ x, y }` coordinates:

```typescript
import { getScrubScene } from '@wix/motion';

const card = document.getElementById('card')!;

const scene = getScrubScene(
  card,
  {
    keyframeEffect: {
      name: 'tilt',
      keyframes: [{ transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }],
    },
  },
  { trigger: 'pointer-move', element: card, axis: 'x' }, // axis lives on the trigger, not the effect
);

if (scene && !Array.isArray(scene)) {
  function onPointerMove(event: PointerEvent) {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    scene!.effect(null, { x, y });
  }

  card.addEventListener('pointermove', onPointerMove);

  // on teardown:
  // card.removeEventListener('pointermove', onPointerMove);
  // scene.destroy();
}
```

## 5. `data-motion-part` sub-targeting

An effect's `AnimationData` can target a descendant of the animated element instead of the element
itself, via the `part` field:

```typescript
web(options): AnimationData[] {
  return [{ ...options, part: 'BG_LAYER', name: 'bg-zoom', keyframes: [/* ... */] }];
}
```

At runtime this resolves against `[data-motion-part~="<part>"]` (matching the target element itself or a
descendant). On the CSS path (`getCSSAnimation`), the generated selector becomes
`#<id>[data-motion-part~="<part>"]`. Mark the intended sub-element in your markup:

```html
<div id="hero">
  <div data-motion-part="BG_LAYER">...</div>
</div>
```

## See also

- [Core Functions](../api/core-functions.md) — full signatures for `getWebAnimation`, `getScrubScene`,
  `registerEffects`, and friends.
- [Type Definitions](../api/types.md) — `AnimationEffectAPI`, `EffectModule`, `DomApi`, `ScrubScrollScene`,
  `ScrubPointerScene`, and the rest of the authoring types.
- [Core Concepts](../core-concepts.md) — the effect-definition modes and trigger model this guide builds
  on.
- [SSR & CSS Generation](./ssr-css.md) — the `style()` hook and the `getCSSAnimation()` path.
