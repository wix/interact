# Getting Started

`@wix/motion` is a low-level animation engine built directly on the Web Animations API and CSS Animations. This guide gets you from install to a working animation in each of its four modes.

## Install

```bash
npm install @wix/motion
```

Requires Node.js `>=18`.

## Your first animation

The fastest path is a time-based Web Animations API (WAAPI) animation, driven by `getWebAnimation()` with an inline `keyframeEffect` — no preset registration required.

```typescript
import { getWebAnimation } from '@wix/motion';

const element = document.getElementById('hero');

const animation = getWebAnimation(element, {
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

// getWebAnimation can return null (e.g. an unregistered namedEffect, or a
// multi-iteration animation dropped by reduced motion) — always guard it.
animation?.play();
```

`play()` resolves once playback has **started**, not once the animation finishes. See [Observing completion](#observing-completion) below for how to react when it's actually done.

## Generating CSS instead

For simple, fire-and-forget effects you can generate CSS `@keyframes`/`animation` descriptors instead of driving WAAPI directly. `getCSSAnimation()` returns an **array** of descriptors — not a string — so you inject them into a stylesheet yourself:

```typescript
import { getCSSAnimation } from '@wix/motion';

const cssAnimations = getCSSAnimation('hero', {
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

const style = document.createElement('style');

style.textContent = cssAnimations
  .map(({ target, animation, name, keyframes }) => {
    const steps = keyframes
      .map((keyframe, i) => {
        const percent = (i / (keyframes.length - 1)) * 100;
        const declarations = Object.entries(keyframe)
          .map(([property, value]) => `${property}: ${value};`)
          .join(' ');
        return `${percent}% { ${declarations} }`;
      })
      .join('\n');

    return `@keyframes ${name} { ${steps} }\n${target} { animation: ${animation}; }`;
  })
  .join('\n');

document.head.appendChild(style);
```

Generated `animation` shorthand values are paused by default — toggle `animation-play-state` (e.g. by adding a class) when you want the animation to run.

## Scroll-driven animations

Pass a `view-progress` trigger as the third argument to link an animation to scroll. When `window.ViewTimeline` is available, `getWebAnimation()` returns a WAAPI animation linked directly to the timeline — it plays automatically, no `.play()` call needed:

```typescript
import { getWebAnimation } from '@wix/motion';

const scrollRoot = document.getElementById('scrollRoot');
const parallax = document.getElementById('parallax');

getWebAnimation(
  parallax,
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

`startOffset`/`endOffset` live on the animation options, not the trigger.

### Without `ViewTimeline` (polyfill)

When `window.ViewTimeline` isn't available, use `getScrubScene()` instead. With a `view-progress` trigger it returns `ScrubScrollScene[]` — plain objects you drive yourself from an `IntersectionObserver` or scroll listener:

```typescript
import { getScrubScene } from '@wix/motion';

const scenes = getScrubScene(
  parallax,
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

// Drive each scene yourself from a scroll/IntersectionObserver listener,
// then clean up with `scene.destroy()` when you're done.
scenes?.forEach((scene) => {
  scene.effect(scene, getScrollProgressFor(scene)); // your own 0..1 progress calculation
});
```

If you're using `@wix/interact`, its bundled scroll polyfill, [`fizban`](https://github.com/wix-incubator/fizban), drives this automatically.

## Pointer-driven animations

Pass a `pointer-move` trigger to map cursor position to an effect. The axis to read (`'x'` or `'y'`) is set on the **trigger**, not on the effect options:

```typescript
import { getScrubScene } from '@wix/motion';

const card = document.getElementById('card');

const scene = getScrubScene(
  card,
  {
    keyframeEffect: {
      name: 'tilt',
      keyframes: [{ transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }],
    },
    transitionDuration: 200,
    transitionEasing: 'easeOut',
  },
  { trigger: 'pointer-move', axis: 'x', element: card },
);

card?.addEventListener('pointermove', (event) => {
  const rect = card.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  scene?.effect(scene, { x, y: 0 });
});
```

## Observing completion

`await animation.play()` only tells you playback has started. To react when an animation actually finishes, use `onFinish()` or await the `finished` promise:

```typescript
animation?.onFinish(() => {
  console.log('animation finished');
});

// or:
await animation?.finished; // resolves with Animation[]
console.log('animation finished');
```

## Next steps

- [Core Concepts](./core-concepts.md) — the options shape, effect-definition modes, triggers, and easing system.
- [API Reference](./api/README.md) — full function signatures and types.
- Ready-made effects live in [`@wix/motion-presets`](https://github.com/wix/interact/tree/master/packages/motion-presets); register them with `registerEffects()` and reference them via `namedEffect`.
- For declarative, config-driven trigger→effect wiring (including React and Web Component bindings), see [`@wix/interact`](https://github.com/wix/interact/tree/master/packages/interact).
