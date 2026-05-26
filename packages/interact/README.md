# @wix/interact

Declarative, configuration-driven interaction library — web-native, AI-ready, and framework-agnostic.

[![npm version](https://img.shields.io/npm/v/@wix/interact.svg)](https://www.npmjs.com/package/@wix/interact)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@wix/interact)](https://bundlephobia.com/package/@wix/interact)
[![license](https://img.shields.io/npm/l/@wix/interact.svg)](https://github.com/wix/interact/blob/master/LICENSE)
[![downloads](https://img.shields.io/npm/dm/@wix/interact.svg)](https://www.npmjs.com/package/@wix/interact)

## Why Interact?

- **Declerative** — Define trigger-to-effect bindings in JSON; no imperative event wiring
- **Web-native** — Built on CSS, WAAPI, ViewTimeline, and DOM APIs; supports DOM management via Custom Elements
- **Framework-agnostic** — Web Components and vanilla JS integrations; React integration included
- **AI-ready** — JSON configs are machine-readable and provide guardrails; LLMs can generate and agents can validate them
- **CSS generation** — `generate(config)` emits complete CSS for the whole config (`@keyframes`, `view-timeline`, transitions, FOUC rules)
- **Preset ecosystem** — Plug in [`@wix/motion-presets`](../motion-presets/README.md) for 80+ ready-made effects.
- **Accessible** — Built-in `activate` (click + keyboard) and `interest` (hover + focus) trigger variants

## Install

```bash
npm install @wix/interact
```

### Use pre-made presets

```bash
npm install @wix/motion-presets
```

`@wix/motion-presets` is optional but recommended — it provides the `namedEffect` library used in most examples below.

## Quick Start

### Using Web Components (recommended)

**Web Components** — wrap the target element with `<interact-element>`:

```ts
import { Interact, generate, type InteractConfig } from '@wix/interact/web';
import * as presets from '@wix/motion-presets'; // optional

Interact.registerEffects(presets); // optional

const config: InteractConfig = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [{ effectId: 'hero-in' }],
    },
  ],
  effects: {
    'hero-in': {
      duration: 800,
      easing: 'ease-out',
      namedEffect: { type: 'FadeIn' }, // requires motion-presets
      triggerType: 'once',
    },
  },
};

// render styles  - e.g. for SSR
const interactCSS = generate(config, false);

// run on client - e.g. on pagereveal event
const instance = Interact.create(config);
```

In `<head>` add:

```html
<style>
  ${interactCSS}
  /* Optional — keep the custom element from affecting layout */
  interact-element {
    display: contents;
  }
</style>
```

In the `<body>` add:

```html
<interact-element data-interact-key="hero">
  <section class="hero">Hello, animated world!</section>
</interact-element>
```

### Using React

A complete React example: register presets, generate CSS, mount the component, clean up on unmount.

```tsx
import { useEffect } from 'react';
import { Interact, Interaction, generate } from '@wix/interact/react';
import * as presets from '@wix/motion-presets'; // optional

Interact.registerEffects(presets); // optional

const config = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [{ effectId: 'hero-in' }],
    },
  ],
  effects: {
    'hero-in': {
      duration: 800,
      easing: 'ease-out',
      namedEffect: { type: 'FadeIn' }, // requires motion-presets
      triggerType: 'once',
    },
  },
};

export function App () {
  const interactCSS = generate(config, false);
  // rest of App logic ...

  useEffect(() => {
    const instance = Interact.create(config);
    return () => instance.destroy();
  }, []);

  return (
    // can go to <head>
    <style>{interactCSS}</style>
    // ...
    <Hero/>
    // ...
  )
}

// in components/Hero.jsx
export function Hero() {
  return (
    <Interaction tagName="section" interactKey="hero">
      Hello, animated world!
    </Interaction>
  );
}
```

### Using vaniall JS - no handling for DOM changes

**Vanilla JS** — bind elements after they exist in the DOM:

```ts
import { Interact, add } from '@wix/interact';

const instance = Interact.create(config);

add(document.querySelector('#hero'), 'hero');
```

## Entry Points

| Import                | Use When                                                    |
| --------------------- | ----------------------------------------------------------- |
| `@wix/interact`       | Vanilla JS — manual element binding via `add()`/`remove()`. |
| `@wix/interact/web`   | Web Components — `<interact-element>` custom element.       |
| `@wix/interact/react` | React — `<Interaction>` component with lifecycle.           |

All three entry points export the same `Interact` class, `generate()` function, and types.

## How It Works

```
Config ─┬─► Interact.create() ─► Trigger Observers ─► Effect Engine ─► Animation (via @wix/motion)
        └─► generate() ────────► CSS (@keyframes, view-timeline, animations, transitions) ─► <head>
```

`generate(config)` runs at build time or on the server to emit complete CSS for the entire config — maximizing offload of effect creation, binding, and running to the browser.
Interact also uses native effect triggering, i.e. `view-timeline`, as it becomes more widely supported

The `InteractConfig` shape:

```ts
type InteractConfig = {
  interactions: Interaction[]; // trigger → effect bindings
  effects: Record<string, Effect>; // reusable effect definitions
  sequences?: Record<string, SequenceConfig>; // staggered multi-effect timelines
  conditions?: Record<string, Condition>; // media / selector gates
};
```

## Triggers

| Trigger        | Fires On                                     | Params                                  |
| -------------- | -------------------------------------------- | --------------------------------------- |
| `viewEnter`    | Element enters viewport                      | `threshold?`, `inset?`                  |
| `viewProgress` | While element scrolls through viewport       | (use `rangeStart`/`rangeEnd` on effect) |
| `hover`        | Pointer enters/leaves element                | —                                       |
| `click`        | Element is clicked                           | —                                       |
| `activate`     | Click + keyboard (a11y variant of `click`)   | —                                       |
| `interest`     | Hover + focus (a11y variant of `hover`)      | —                                       |
| `pointerMove`  | While pointer moves over element or viewport | `hitArea?`, `axis?`                     |
| `animationEnd` | Another specified effect is finished         | `effectId`                              |

## Effects

| Effect Type                           | Use For                                                                    |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `keyframeEffect`                      | Inline keyframes — self-contained, no preset needed.                       |
| `namedEffect`                         | Registered presets from `@wix/motion-presets` (e.g. `{ type: 'FadeIn' }`). |
| `customEffect`                        | Programmatic `(element, progress) => void` callback.                       |
| `transition` / `transitionProperties` | CSS state changes driven by `stateAction` (`add`/`remove`/`toggle`).       |

## Recipes

Each example is a complete `InteractConfig` — pass it to `Interact.create(config)`.

### Entrance animation

```ts
{
  interactions: [{
    key: 'hero',
    trigger: 'viewEnter',
    effects: [{ effectId: 'float-in' }],
  }],
  effects: {
    'float-in': {
      duration: 800,
      easing: 'ease-out',
      namedEffect: { type: 'FloatIn', direction: 'bottom' },
    },
  },
}
```

### Click effect

```ts
{
  interactions: [{
    key: 'cta',
    trigger: 'click',
    effects: [{ effectId: 'pulse' }],
  }],
  effects: {
    'pulse': {
      duration: 300,
      keyframeEffect: {
        name: 'pulse',
        keyframes: [
          { transform: 'scale(1.08)', offset: 0.5 }
        ],
      },
      triggerType: 'repeat',
    },
  },
}
```

### Scroll-driven parallax

```ts
{
  interactions: [{
    key: 'card',
    trigger: 'viewProgress',
    effects: [{ effectId: 'parallax' }],
  }],
  effects: {
    'parallax': {
      keyframeEffect: {
        name: 'parallax',
        keyframes: [
          { transform: 'translateY(-120px)' },
          { transform: 'translateY(120px)' },
        ],
      },
      rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
      rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
      fill: 'both',
      easing: 'linear',
    },
  },
}
```

### Hover toggle (CSS transition)

```ts
{
  interactions: [{
    key: 'card',
    trigger: 'hover',
    effects: [{ effectId: 'lift', stateAction: 'toggle', key: 'card-figure' }],
  }],
  effects: {
    'lift': {
      transition: {
        duration: 200,
        easing: 'ease-out',
        styleProperties: [
          { name: 'transform', value: 'scale(1.08)' },
          { name: 'box-shadow', value: '0 8px 16px rgb(0 0 0 / 0.15)' },
        ],
      },
    },
  },
}
```

### Pointer-tracking custom effect

```ts
{
  interactions: [{
    key: 'spotlight',
    trigger: 'pointerMove',
    params: { hitArea: 'root' },
    effects: [{ effectId: 'follow' }],
  }],
  effects: {
    'follow': {
      customEffect: (element: HTMLElement, progress: { x: number, y: number }) => {
        element.style.setProperty('--x', `${progress.x * 100}%`);
        element.style.setProperty('--y', `${progress.y * 100}%`);
      },
    },
  },
}
```

## Common Pitfalls

- **`overflow: hidden` breaks `viewProgress`** — Use `overflow: clip` on all ancestors between the source and the scroll container.
- **Same element as source and target with `viewEnter`** — Must use `triggerType: 'once'`. Other types cause re-entry loops.
- **Hit-area shift on `hover` / `pointerMove`** — Animating size/position of the hovered element shifts the hit area and causes jitter. Animate a child via `selector` instead.
- **`registerEffects()` must run before `Interact.create()`** when using `namedEffect`.
- **FOUC prevention requires both** — `generate(config)` injected into `<head>`.
- **`generate(config, useFirstChild)`** — Pass `true` for `<interact-element>` (web), `false` for vanilla and React `<Interaction>`.
- **`<interact-element>` must wrap exactly one child** — the library targets `:first-child` by default.

## AI & Agent Support

Interact's JSON-config surface is the differentiator: configs are serializable, schema-typed, and validate-able (guardrails) — no imperative DOM logic for an LLM to hallucinate.

**Rules files** ship with the package under [`rules/`](https://github.com/wix/interact/tree/master/packages/interact/rules) — point your agent at them:

- [`rules/full-lean.md`](https://wix.github.io/interact/rules/full-lean.md) — complete config spec, pitfalls, and constraints
- [`rules/integration.md`](https://wix.github.io/interact/rules/integration.md) — integration entry points, lifecycle, style generation
- [`rules/viewenter.md`](https://wix.github.io/interact/rules/viewenter.md) — viewport entrance triggers (scroll-triggered animations)
- [`rules/viewprogress.md`](https://wix.github.io/interact/rules/viewprogress.md) — scroll-driven animations
- [`rules/click.md`](https://wix.github.io/interact/rules/click.md) — click and activate triggers
- [`rules/hover.md`](https://wix.github.io/interact/rules/hover.md) — hover and interest triggers
- [`rules/pointermove.md`](https://wix.github.io/interact/rules/pointermove.md) — pointer-driven animations

**Generation constraints** for agents producing configs:

- Do not invent `namedEffect` types — use only registered presets.
- Do not attach DOM event listeners manually — use triggers.
- Do not use `overflow: hidden` on scroll-tracked ancestors — use `overflow: clip`.
- Always pre-render CSS with `generate(config)` and inject into `<head>`.
- Always call `Interact.registerEffects(presets)` before `generate()` and `Interact.create()` when using `namedEffect`.

## Browser Support

- Modern browsers with the Web Animations API (Baseline).
- `adoptedStyleSheets` (used by `transition` / `transitionProperties`): Chrome 73+, Firefox 101+, Safari 16.4+, Edge 79+.
- ViewTimeline: Chrome 115+; polyfilled via [`fizban`](https://github.com/wix/fizban) elsewhere.

## Related Packages

- [`@wix/motion`](https://github.com/wix/interact/tree/master/packages/motion) — low-level animation engine underneath Interact.
- [`@wix/motion-presets`](https://github.com/wix/interact/tree/master/packages/motion-presets) — ready-made effect catalog (entrance, scroll, hover, pointer).
- [`fizban`](https://github.com/wix/fizban) — scroll-driven animation polyfill (bundled dependency).
- [`kuliso`](https://github.com/wix/kuliso) — pointer-driven animation polyfill (bundled dependency).

## Documentation

- [**Getting Started**](https://wix.github.io/interact/docs/guides/getting-started.md)
- [**API Reference**](https://wix.github.io/interact/docs/api/README.md) — `Interact` class, `InteractionController`, standalone functions, types
- [**Guides**](https://wix.github.io/interact/docs/guides/README.md) — triggers, effects, configuration, state, conditions, sequences
- [**Examples**](https://wix.github.io/interact/docs/examples/README.md) — entrance, click, hover, list patterns
- [**Web Components**](https://wix.github.io/interact/docs/guides/custom-elements.md) - integration via custom elements
- [**React Integration**](https://wix.github.io/interact/docs/integration/react.md) - React integration

## License

[MIT](https://github.com/wix/interact/blob/master/LICENSE)
