<!-- AI: full docs index at https://wix.github.io/interact/llms.txt -->

# Wix Interact

Web-native animation and interaction libraries — declarative, AI-ready, framework-agnostic.

[![npm version](https://img.shields.io/npm/v/@wix/interact)](https://www.npmjs.com/package/@wix/interact)
[![npm version](https://img.shields.io/npm/v/@wix/motion)](https://www.npmjs.com/package/@wix/motion)
[![npm version](https://img.shields.io/npm/v/@wix/motion-presets)](https://www.npmjs.com/package/@wix/motion-presets)
[![license](https://img.shields.io/npm/l/@wix/interact)](https://github.com/wix/interact/blob/master/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@wix/interact)](https://bundlephobia.com/package/@wix/interact)

## What is Interact?

**Wix Interact** (`@wix/interact`) is a declarative interaction layer on top of **@wix/motion**. You describe _when_ something should animate and _what_ should happen in a JSON config — no manual event listeners, no imperative animation wiring.

- **Config-driven** — bind triggers (`viewEnter`, `click`, `hover`, `viewProgress`, `pointerMove`, and more) to effects in one `InteractConfig` object
- **Built on native browser APIs** — Web Animations API, `ViewTimeline`, pointer tracking, and CSS.
- **Three entry points** — Web Components (`@wix/interact/web`), React (`@wix/interact/react`), and vanilla JS (`@wix/interact`)
- **Ready-made presets** — entrance, scroll, pointer, loop, and micro-interactions from `@wix/motion-presets`
- **SSR-friendly CSS** — `generate(config)` emits complete CSS for the whole config (keyframes, view-timeline, transitions, FOUC rules) so animations can be ready before JS runs

**Live site:** [wix.github.io/interact](https://wix.github.io/interact/) · **Examples gallery:** [wix.github.io/interact/examples.html](https://wix.github.io/interact/examples.html)

## Packages

| Package                                                                                            | Description                                  | Links                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@wix/interact`](https://github.com/wix/interact/blob/master/packages/interact/)                  | Declarative interaction layer (main package) | [README](https://github.com/wix/interact/blob/master/packages/interact/README.md) · [npm](https://www.npmjs.com/package/@wix/interact)                   |
| [`@wix/motion`](https://github.com/wix/interact/blob/master/packages/motion/)                      | Low-level animation engine                   | [README](https://github.com/wix/interact/blob/master/packages/motion/README.md) · [npm](https://www.npmjs.com/package/@wix/motion)                       |
| [`@wix/motion-presets`](https://github.com/wix/interact/tree/master/packages/motion-presets)       | Ready-made animation presets                 | [README](https://github.com/wix/interact/blob/master/packages/motion-presets/README.md) [npm](https://www.npmjs.com/package/@wix/motion-presets)                                                                                                 |
| [`@wix/interact-validate`](https://github.com/wix/interact/tree/master/packages/interact-validate) | Static validation for `InteractConfig`       | [README](https://github.com/wix/interact/blob/master/packages/interact-validate/README.md) · [npm](https://www.npmjs.com/package/@wix/interact-validate) |
| [`@wix/splittext`](https://github.com/wix/interact/blob/master/packages/splittext/)                | Accessible text splitting for animations     | [README](https://github.com/wix/interact/blob/master/packages/splittext/README.md) · [npm](https://www.npmjs.com/package/@wix/splittext)                 |

```
@wix/motion ← @wix/interact (declarative layer)
@wix/motion ← @wix/motion-presets (ready-made effects)
@wix/splittext (standalone — pairs with @wix/motion for staggered animations)
```

## Quick Start

Install the interaction layer and presets (presets are required when using `namedEffect`):

```bash
npm install @wix/interact @wix/motion-presets
```

All examples below share this config — a `viewEnter` entrance using the `FadeIn` preset:

```typescript
import type { InteractConfig } from '@wix/interact';

const config: InteractConfig = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      effects: [{ effectId: 'hero-fade' }],
    },
  ],
  effects: {
    'hero-fade': {
      duration: 800,
      easing: 'ease-out',
      fill: 'both',
      namedEffect: { type: 'FadeIn' },
    },
  },
};
```

### Web Components (recommended)

Pre-render CSS with `generate()` to avoid a flash of unstyled content on entrance animations:

```typescript
import { generate } from '@wix/interact';

const css = generate(config, true); // `true` = use :first-child as default selectors

// then inject into <head>
```

In HTML template add:

```html
<head>
  <style>
    ${css}
    /* Optional — keep the custom element from affecting layout */
    interact-element {
      display: contents;
    }
  </style>
</head>
```

Then boot the runtime:

```typescript
import { Interact } from '@wix/interact/web';
import * as presets from '@wix/motion-presets';

Interact.registerEffects(presets);

Interact.create(config);
```

```html
<interact-element data-interact-key="hero">
  <section class="hero">
    <h1>Hello, Interact</h1>
  </section>
</interact-element>
```

### React

Wrap `Interact.create()` in `useEffect` and destroy on cleanup. Use `<Interaction>` instead of raw elements:

```tsx
import { useEffect } from 'react';
import { Interact, Interaction } from '@wix/interact/react';
import * as presets from '@wix/motion-presets';

Interact.registerEffects(presets);

function App() {
  useEffect(() => {
    const instance = Interact.create(config);

    return () => {
      instance.destroy();
    };
  }, []);

  return (
    <Interaction tagName="section" interactKey="hero" className="hero">
      <h1>Hello, Interact</h1>
    </Interaction>
  );
}
```

Inject `generate(config, false)` output into your document's `<head>` (e.g. Remix `links`, Next.js layout `<head>`) the same way as the Web Components example.

### Vanilla JS

```typescript
import { Interact, add } from '@wix/interact';
import * as presets from '@wix/motion-presets';

Interact.registerEffects(presets);
Interact.create(config);

const hero = document.querySelector('.hero') as HTMLElement;
add(hero, 'hero');
```

```html
<section data-interact-key="hero" class="hero">
  <h1>Hello, Interact</h1>
</section>
```

Call `add(element, key)` after the element exists in the DOM. Use `remove(key)` to unregister a key.

## Common Patterns

Config-only recipes — each is a valid `InteractConfig` shape. Register presets before `Interact.create()` when using `namedEffect`.

### Entrance animation

```typescript
const config: InteractConfig = {
  interactions: [
    {
      key: 'card',
      trigger: 'viewEnter',
      params: { threshold: 0.15 },
      effects: [{ effectId: 'card-float' }],
    },
  ],
  effects: {
    'card-float': {
      duration: 900,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      namedEffect: { type: 'FloatIn', direction: 'bottom' },
    },
  },
};
```

FOUC prevention requires injecting the output of `generate(config)` into `<head>`.

### Click effect

```typescript
const config: InteractConfig = {
  interactions: [
    {
      key: 'button',
      trigger: 'activate',
      effects: [
        {
          triggerType: 'repeat',
          duration: 400,
          easing: 'ease-out',
          keyframeEffect: {
            name: 'button-pop',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(0.92)' },
              { transform: 'scale(1)' },
            ],
          },
        },
      ],
    },
  ],
};
```

Use `trigger: 'activate'` instead of `click` for keyboard-accessible activation (Enter / Space).

### Scroll-driven parallax

```typescript
const config: InteractConfig = {
  interactions: [
    {
      key: 'parallax-bg',
      trigger: 'viewProgress',
      effects: [
        {
          namedEffect: { type: 'ParallaxScroll', parallaxFactor: 0.5 },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
  ],
};
```

Replace `overflow: hidden` with `overflow: clip` on ancestors between the element and the scroll container — `hidden` breaks `ViewTimeline`.

### Hover toggle (CSS transition)

```typescript
const config: InteractConfig = {
  interactions: [
    {
      key: 'card',
      trigger: 'interest',
      effects: [
        {
          key: 'card-figure',
          stateAction: 'toggle',
          transition: {
            duration: 200,
            easing: 'ease-out',
            styleProperties: [
              { name: 'transform', value: 'translateY(-10px)' },
              { name: 'boxShadow', value: '0 12px 24px rgb(0 0 0 / 0.12)' },
            ],
          },
        },
      ],
    },
  ],
};
```

Use `trigger: 'interest'` for accessible hover (mouse + keyboard focus).

### Pointer-driven custom effect

```typescript
const config: InteractConfig = {
  interactions: [
    {
      key: 'card',
      trigger: 'pointerMove',
      params: { hitArea: 'root' },
      effects: [
        {
          key: 'spotlight',
          customEffect: (element: HTMLElement, progress: { x: number; y: number }) => {
            const x = progress.x * 100;
            const y = progress.y * 100;
            element.style.background = `radial-gradient(circle at ${x}% ${y}%, rgb(255 255 255 / 0.15), transparent 50%)`;
          },
        },
      ],
    },
  ],
};
```

## Configuration Schema

```typescript
type InteractConfig = {
  interactions: Interaction[]; // REQUIRED
  effects?: Record<string, Effect>;
  sequences?: Record<string, SequenceConfig>;
  conditions?: Record<string, Condition>;
};

type Interaction = {
  key: string;
  listContainer?: string;
  listItemSelector?: string;
  trigger:
    | 'hover'
    | 'click'
    | 'interest'
    | 'activate'
    | 'viewEnter'
    | 'viewProgress'
    | 'pointerMove'
    | 'animationEnd';
  params?: TriggerParams;
  conditions?: string[];
  selector?: string;
  effects?: (Effect | EffectRef)[];
  sequences?: (SequenceConfig | SequenceConfigRef)[];
};
```

- Each `Interaction` needs at least one of `effects` or `sequences`.
- Each `Effect` needs exactly one of `namedEffect` | `keyframeEffect` | `customEffect` | `transition` | `transitionProperties`.
- Full spec: [`full-lean.md`](https://wix.github.io/interact/rules/full-lean.md)

## AI and Agent Support

AI agents can discover @wix/interact documentation through:

- **[llms.txt](https://wix.github.io/interact/llms.txt)** — structured docs index ([llms.txt standard](https://llmstxt.org/))
- **[llms-full.txt](https://wix.github.io/interact/llms-full.txt)** — all rules in a single file

### Rules files

**@wix/interact**:

- [`integration.md`](https://wix.github.io/interact/rules/integration.md) — entry points, FOUC, static API
- [`full-lean.md`](https://wix.github.io/interact/rules/full-lean.md) — complete config spec
- [`validate.md`](https://wix.github.io/interact/rules/validate.md) — validating configs with `@wix/interact-validate`
- [`viewenter.md`](https://wix.github.io/interact/rules/viewenter.md)
- [`hover.md`](https://wix.github.io/interact/rules/hover.md)
- [`click.md`](https://wix.github.io/interact/rules/click.md)
- [`viewprogress.md`](https://wix.github.io/interact/rules/viewprogress.md)
- [`pointermove.md`](https://wix.github.io/interact/rules/pointermove.md)

**@wix/motion-presets**:

- [`presets-main.md`](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/presets-main.md) · [`entrance-presets.md`](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/entrance-presets.md) · [`scroll-presets.md`](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/scroll-presets.md) · [`ongoing-presets.md`](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/ongoing-presets.md) · [`mouse-presets.md`](https://github.com/wix/interact/blob/master/packages/motion-presets/rules/presets/mouse-presets.md)

### AI generation guidelines

- Always call `Interact.registerEffects(presets)` before `Interact.create()` when using `namedEffect`
- Do not invent `namedEffect` types — use only registered presets (see preset rules above)
- Do not attach DOM event listeners manually — express behavior through `trigger` and config
- For `viewProgress`, avoid `overflow: hidden` on ancestors; use `overflow: clip` instead
- Call `generate(config)` at build time or on the server and inject CSS into `<head>`
- `effects` at the config top level is a reusable `Record<string, Effect>`
- `<interact-element>` should wrap exactly one child (the library targets `.firstElementChild` by default).
- Validate every generated config with [`@wix/interact-validate`](https://github.com/wix/interact/blob/master/packages/interact-validate/README.md) (`validateInteractConfig`) and fix all errors before emitting

### Repository agent context for dev

For monorepo layout, dependency graph, and CLI conventions, see [`AGENTS.md`](https://github.com/wix/interact/blob/master/AGENTS.md) and [`CLAUDE.md`](https://github.com/wix/interact/blob/master/CLAUDE.md).

## Live Demo and Documentation

- [Website](https://wix.github.io/interact/)
- [Examples gallery](https://wix.github.io/interact/examples.html)
- [Documentation](https://wix.github.io/interact/docs/)
- [Playground](https://wix.github.io/interact/playground/)

## Development

**Prerequisites:** Node.js ≥ 18. Use the repo’s Node version:

```bash
nvm use
yarn install
yarn build
yarn test
```

**Local apps:**

```bash
yarn dev:website    # landing + examples (http://localhost:3000)
yarn dev:docs       # documentation app
yarn dev:demo       # test demo app
yarn workspace @wix/interact-playground run dev   # interactive playground
```

See [CONTRIBUTING.md](https://github.com/wix/interact/blob/master/CONTRIBUTING.md) for contribution workflow and standards.

## License

[MIT](https://github.com/wix/interact/blob/master/LICENSE)
