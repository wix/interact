# About Interact

Interact is a web animation and interaction library for building interactive experiences with motion. It helps developers, designers, and anyone building websites or apps create responsive, high-performance motion experiences.

## What is Interact?

Interact provides a structured way to connect user actions with visual changes — from simple UI animations to complex, coordinated page experiences.

Interact uses a declarative JavaScript API that describes interactions as structured configuration rather than imperative animation code. This makes interactions easier to write, review, and maintain as projects grow.

The same structure is also easy for large language models (LLMs) to understand and generate. Because interactions are expressed as intent rather than low-level animation instructions, AI can reliably create, modify, and extend them while keeping the configuration predictable and readable. Interact ships [agent rules](https://github.com/wix/interact/tree/master/packages/interact/rules) that teach a coding agent the configuration format and the available triggers and effects.

An `InteractConfig` is plain data and fully JSON-serializable, with one exception: a `customEffect` holds a JavaScript function, so any configuration that uses one cannot round-trip through JSON. The same applies to `offsetEasing` when you pass a function instead of an easing name.

With Interact, you define the relationship between:

- **Triggers** — what starts the interaction
- **Effects** — what animation should happen
- **Elements** — what should respond

Instead of implementing each animation and coordinating it with triggers in imperative code, you describe the relationship between triggers, effects, and elements in a structured configuration.

### Example: a hero section that animates on entry

Start from the intent. When a visitor scrolls the hero section into view:

- Reveal the headline
- Animate the image
- Stagger the cards

Interact translates that behavior into a structured configuration:

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [
        { key: 'hero-headline', effectId: 'headline-reveal' },
        { key: 'hero-image', effectId: 'hero-image-animate' },
      ],
      sequences: [
        {
          effects: [
            {
              key: 'hero-cards',
              listContainer: '.cards-list',
              listItemSelector: '.card',
              effectId: 'card-reveal',
            },
          ],
          offset: 120,
        },
      ],
    },
  ],
  effects: {
    'headline-reveal': {
      namedEffect: { type: 'RevealIn', direction: 'bottom' },
      duration: 600,
      triggerType: 'once',
    },
    'hero-image-animate': {
      namedEffect: { type: 'FadeIn' },
      duration: 800,
      easing: 'ease-out',
      triggerType: 'once',
    },
    'card-reveal': {
      namedEffect: { type: 'FloatIn', direction: 'bottom' },
      duration: 500,
      triggerType: 'once',
    },
  },
};
```

Every `effectId` in `interactions` points at an entry in the top-level `effects` registry, which is where the animation itself is defined once and reused. The `namedEffect` values above come from `@wix/motion-presets`.

**Result:** When the hero section scrolls into view, the headline reveals upward, the image fades in over 800 ms, and each card floats up in turn, 120 ms apart.

This is an interaction: a reusable definition of behavior that describes when something happens, what should happen, and which elements should respond.

## From motion infrastructure to motion intelligence

Animation libraries gave developers powerful tools to create motion. Interact introduces a structured interaction model that makes motion easier to create, understand, and scale.

The same structure that makes Interact easier for developers also makes it easier for AI systems to work with. Interact configurations are predictable, semantic, and based on intent. This allows large language models to generate, modify, and reason about interactions without having to reconstruct complex imperative animation code.

This predictable, declarative structure gives developers and AI a shared way to describe interactive behavior. Given a plain-language prompt:

> Create a hero animation. When the section enters the viewport, reveal the headline, animate the image, and stagger the feature cards.

An agent produces the same configuration shape you would write by hand:

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [
        { key: 'hero-headline', effectId: 'headline-reveal' },
        { key: 'hero-image', effectId: 'hero-image-animate' },
      ],
      sequences: [
        {
          effects: [{ key: 'hero-cards', effectId: 'card-reveal' }],
          offset: 120,
        },
      ],
    },
  ],
  effects: {
    'headline-reveal': {
      namedEffect: { type: 'RevealIn', direction: 'bottom' },
      duration: 600,
      triggerType: 'once',
    },
    'hero-image-animate': {
      namedEffect: { type: 'FadeIn' },
      duration: 800,
      easing: 'ease-out',
      triggerType: 'once',
    },
    'card-reveal': {
      namedEffect: { type: 'FloatIn', direction: 'bottom' },
      duration: 500,
      triggerType: 'once',
    },
  },
};
```

## Built for modern web motion

Interact combines:

- Powerful animation capabilities
- A declarative way to define interactions
- Reusable effects and sequences
- Responsive behavior across devices
- High-performance execution through `@wix/motion`

Interact describes the interaction; `@wix/motion` executes the animation. Together, they provide a foundation for building the next generation of motion experiences.

Ready to build? [Create your first interaction](/my-first-interaction).

## See also

- [Installation and entry points](/installation-and-entry-points)
- [My first interaction](/my-first-interaction)
- [The config object](/the-config-object)
- [Named effects](/named-effects)

# Getting started

# Installation and entry points

Interact ships as one package with three entry points. Install `@wix/interact`, pick the entry point that matches your stack, and write the same configuration either way.

## Install

Install `@wix/interact` using your project's package manager:

```bash
npm install @wix/interact
```

Use `yarn add @wix/interact` or `pnpm add @wix/interact` instead when appropriate.

`@wix/motion` is a dependency of `@wix/interact` and is installed automatically. Do not install it separately.

## Optional: ready-made named effects

Install [`@wix/motion-presets`](https://github.com/wix/interact/tree/master/packages/motion-presets) to use the ready-made named effect library:

```bash
npm install @wix/motion-presets
```

Register the presets once, before creating an Interact instance:

```ts
import { Interact } from '@wix/interact/web';
import * as presets from '@wix/motion-presets';

Interact.registerEffects(presets);
```

You do not need this package when you use only `keyframeEffect` or `customEffect`.

## Entry points

Choose the entry point that matches your project:

| Entry point           | Import                                                                   | Binding mechanism                                                      | Use when                                                       |
| :-------------------- | :----------------------------------------------------------------------- | :--------------------------------------------------------------------- | :------------------------------------------------------------- |
| `@wix/interact/web`   | `import { Interact, generate } from '@wix/interact/web';`                | `<interact-element data-interact-key="hero">` custom element           | Static HTML, Web Components, SSR, or most non-React frameworks |
| `@wix/interact/react` | `import { Interact, Interaction, generate } from '@wix/interact/react';` | `<Interaction interactKey="hero">` component, or `createInteractRef()` | React, Next.js, or Remix                                       |
| `@wix/interact`       | `import { Interact, add, remove, generate } from '@wix/interact';`       | `add(element, 'hero')` and `remove('hero')` called by you              | Vanilla JavaScript or manual DOM management                    |

### Web Components

```ts
import { Interact, generate } from '@wix/interact/web';
```

```html
<interact-element data-interact-key="hero">
  <section class="hero">Hello, animated world!</section>
</interact-element>
```

### React

```tsx
import { Interact, Interaction, generate } from '@wix/interact/react';
```

```tsx
<Interaction tagName="section" interactKey="hero">
  Hello, animated world!
</Interaction>
```

### Vanilla JavaScript

```ts
import { Interact, add, remove, generate } from '@wix/interact';

add(document.querySelector('#hero'), 'hero');
```

All three entry points use the same configuration format, triggers, and effects, and all three export the same `Interact` class, the same `generate()` function for build-time or server-side CSS, and the same types. They differ only in how elements are connected to interactions.

## Optional: configuration validation

For agent-generated configurations, or for build-time and CI checks, install [`@wix/interact-validate`](https://github.com/wix/interact/tree/master/packages/interact-validate) as a development dependency:

```bash
npm install --save-dev @wix/interact-validate
```

The validator checks configurations statically, without a browser or a DOM.

## See also

- [About Interact](/about-interact)
- [My first interaction](/my-first-interaction)
- [HTML integration](/html-integration)
- [The config object](/the-config-object)
- [`@wix/interact-validate`](https://github.com/wix/interact/tree/master/packages/interact-validate)

# My first interaction

An interaction connects something the visitor does to something on the page that animates. This page builds the smallest complete one: a card whose logo grows slightly while the pointer is over it.

The same interaction is built three times below, once per entry point, so you can follow the variant that matches your stack. Each variant runs through the same four steps: add the markup, define the config, create the runtime, clean up.

## Set up an interaction

An interaction is a plain object with three parts:

- `key` — the string that binds the interaction to an element on the page.
- `trigger` — what starts it.
- `effects` — an array of what animates, and for how long.

Interactions live in the `interactions` array of an `InteractConfig`, which you hand to `Interact.create()`. Nothing else is required: the `effects`, `sequences`, and `conditions` registries are optional and can stay out of the config until you need them.

### Types of triggers

Interact ships eight triggers: `hover` and `click`, their keyboard-accessible counterparts `interest` and `activate`, `viewEnter` for entrance animations, `viewProgress` and `pointerMove` for effects that follow scroll or pointer position, and `animationEnd` for chaining one effect after another. This page uses `hover`. See [What is a trigger?](/what-is-a-trigger).

### Types of effects

An effect describes what animates. Pick exactly one kind per effect: `keyframeEffect` for keyframes you write yourself, `namedEffect` for a ready-made animation from `@wix/motion-presets`, `customEffect` for a callback you drive frame by frame, or `transition` / `transitionProperties` for CSS transitions between style states. This page uses `keyframeEffect`. See [What are effects?](/what-are-effects).

> **Warning:** Do not scale or move the element a `hover` trigger is bound to. As it grows it slides out from under the pointer, the browser fires a leave event, the animation reverses, the element settles back under the pointer, and the whole thing flickers. Keep the hovered element still and animate a child instead — every example below scales the inner `.logo` and leaves the `.logo-card` that listens for hover exactly where it is. See [Source and target resolving](/source-and-target-resolving).

All three variants share the same styles:

```css
.logo-card {
  display: inline-block;
  padding: 24px;
}

.logo {
  display: block;
  width: 120px;
}
```

## React (`@wix/interact/react`)

### 1. Add the markup

Wrap the element you want to bind in the `Interaction` component. It renders the tag you pass in `tagName` and sets `data-interact-key` from `interactKey`, so `<Interaction tagName="div" interactKey="logo-card">` renders a `<div data-interact-key="logo-card">`.

```tsx
import { Interaction } from '@wix/interact/react';

function LogoCard() {
  return (
    <Interaction tagName="div" interactKey="logo-card" className="logo-card">
      <img className="logo" src="logo.png" alt="Logo" />
    </Interaction>
  );
}
```

### 2. Define the config

```ts
import type { InteractConfig } from '@wix/interact/react';

const config: InteractConfig = {
  interactions: [
    {
      key: 'logo-card', // SOURCE — stays put, so the hover area never moves
      trigger: 'hover',
      effects: [
        {
          selector: '.logo', // TARGET — the child that scales
          keyframeEffect: {
            name: 'logo-grow',
            keyframes: [{ scale: 1 }, { scale: 1.05 }],
          },
          duration: 300,
          easing: 'ease-out',
          fill: 'both',
        },
      ],
    },
  ],
};
```

`fill: 'both'` keeps the last frame applied for as long as the pointer stays over the card.

### 3. Create the runtime

Call `Interact.create()` inside a `useEffect()` hook so it only ever runs in the browser, never during server rendering.

```tsx
import { useEffect } from 'react';
import { Interact, Interaction } from '@wix/interact/react';

export default function App() {
  useEffect(() => {
    Interact.create(config);
  }, []);

  return (
    <Interaction tagName="div" interactKey="logo-card" className="logo-card">
      <img className="logo" src="logo.png" alt="Logo" />
    </Interaction>
  );
}
```

### 4. Clean up

Keep the instance `Interact.create()` returns and destroy it from the effect's cleanup function, so the interaction is torn down when the component unmounts — and re-created cleanly when React remounts it in `<StrictMode>`.

```tsx
useEffect(() => {
  const instance = Interact.create(config);

  return () => instance.destroy();
}, []);
```

**Result:** Moving the pointer anywhere over the card grows the logo by 5% over 300ms, and moving it away reverses the animation. The card itself never moves, so the pointer stays inside it and the effect does not flicker.

## Web Components (`@wix/interact/web`)

### 1. Add the markup

Wrap the content in `<interact-element>` and give it a `data-interact-key`. The element binds itself as soon as it connects to the DOM, so there is no binding call to write. It must contain at least one child element.

```html
<body>
  <interact-element data-interact-key="logo-card">
    <div class="logo-card">
      <img class="logo" src="logo.png" alt="Logo" />
    </div>
  </interact-element>

  <script type="module" src="./main.js"></script>
</body>
```

### 2. Define the config

```ts
import type { InteractConfig } from '@wix/interact/web';

const config: InteractConfig = {
  interactions: [
    {
      key: 'logo-card', // SOURCE — stays put, so the hover area never moves
      trigger: 'hover',
      effects: [
        {
          selector: '.logo', // TARGET — the child that scales
          keyframeEffect: {
            name: 'logo-grow',
            keyframes: [{ scale: 1 }, { scale: 1.05 }],
          },
          duration: 300,
          easing: 'ease-out',
          fill: 'both',
        },
      ],
    },
  ],
};
```

### 3. Create the runtime

Importing from `@wix/interact/web` is what registers the `<interact-element>` custom element; `Interact.create()` starts the runtime and returns the instance.

```ts
import { Interact } from '@wix/interact/web';

const instance = Interact.create(config);
```

### 4. Clean up

Hold on to the instance and call `instance.destroy()` when the markup goes away — on a client-side route change, for example. `Interact.destroy()` tears down every instance at once.

```ts
instance.destroy();
```

**Result:** The logo inside the card scales to 1.05 while the pointer is over the card and scales back when it leaves. Because `<interact-element>` binds on connect, markup added later — by a template, a partial, or another framework — starts working without any extra wiring.

## Vanilla JavaScript (`@wix/interact`)

The vanilla entry point leaves binding to you: call `add(element, key)` once the element exists in the DOM.

### 1. Add the markup

No wrapper element is needed here — a plain container is enough.

```html
<body>
  <div class="logo-card">
    <img class="logo" src="logo.png" alt="Logo" />
  </div>

  <script type="module" src="./main.js"></script>
</body>
```

### 2. Define the config

```ts
import type { InteractConfig } from '@wix/interact';

const config: InteractConfig = {
  interactions: [
    {
      key: 'logo-card', // SOURCE — stays put, so the hover area never moves
      trigger: 'hover',
      effects: [
        {
          selector: '.logo', // TARGET — the child that scales
          keyframeEffect: {
            name: 'logo-grow',
            keyframes: [{ scale: 1 }, { scale: 1.05 }],
          },
          duration: 300,
          easing: 'ease-out',
          fill: 'both',
        },
      ],
    },
  ],
};
```

### 3. Create the runtime

```ts
import { Interact, add } from '@wix/interact';

const instance = Interact.create(config);
const card = document.querySelector<HTMLElement>('.logo-card');

if (card) {
  add(card, 'logo-card');
}
```

### 4. Clean up

`remove(key)` unbinds a single key, which is what you want when one element disappears. `instance.destroy()` tears down everything the config bound.

```ts
import { remove } from '@wix/interact';

remove('logo-card');
instance.destroy();
```

**Result:** The same hover animation runs, but you decide exactly when the element is bound — useful when the markup arrives from a fetch, a template engine, or another framework's render.

> **Tip:** Instead of writing your own keyframes, you can use [named effects](/named-effects) — ready-made animations from the [`@wix/motion-presets`](https://github.com/wix/interact/tree/master/packages/motion-presets) package. Register them with `Interact.registerEffects()` before calling `Interact.create()`, then swap `keyframeEffect` for `namedEffect`.

## See also

- [Installation and entry points](/installation-and-entry-points)
- [HTML integration](/html-integration)
- [The config object](/the-config-object)
- [Click and hover](/click-and-hover)
- [Source and target resolving](/source-and-target-resolving)

# HTML integration

Interact ships three entry points so you can drop it into any stack — a framework-free page, a React app, or a Web Components setup. All three share the same `Interact` class, the same `generate()` CSS helper, the same [`InteractConfig`](/the-config-object) shape, and the same [triggers](/what-is-a-trigger) and [effects](/what-are-effects). The only thing that changes between them is **how a DOM element gets bound to an interaction `key`**.

Install the package and compare the entry points on [Installation and entry points](/installation-and-entry-points); this page picks up once it is installed.

> **Note:** `@wix/motion` is a runtime dependency of `@wix/interact` — your package manager installs it for you, so you never add it yourself. [Named effects](/named-effects) are the exception: they live in the optional `@wix/motion-presets` package, which you install alongside Interact.

## The integration lifecycle

Regardless of the entry point, every integration follows the same four steps — the second one only when your config uses named effects:

1. **Define a config** — an [`InteractConfig`](/the-config-object) object describing your interactions.
2. **Register named effects** _(optional)_ — if your config uses [`namedEffect`](/named-effects), call `Interact.registerEffects(...)` **before** the next two steps. Both `generate()` and `Interact.create()` read the `effects` registry at the moment they run. See [Named effects](#named-effects-registereffects).
3. **Generate CSS** — call `generate(config, options)` at build time or on the server, and inject the result into `<head>`. This prepares `@keyframes`, `view-timeline` declarations, transitions, and — for entrance animations — prevents a flash of unstyled content (FOUC).
4. **Create the runtime** — call `Interact.create(config)` on the client to start observing triggers and running effects.

The only per-framework difference is how each keyed element is bound to the runtime.

```text
config ─┬─► generate(config, options) ─► CSS → <head>          (build time / SSR)
        └─► Interact.create(config) ───► triggers → effects    (client)
```

### `generate()` options

`generate()` takes the config plus one optional options bag:

```ts
import { generate } from '@wix/interact';

const css = generate(config, { useFirstChild: false });
```

| Option          | Type                   | Default | Description                                                                                                                                                                                                                       |
| :-------------- | :--------------------- | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useFirstChild` | `boolean`              | `true`  | Emit rules that target the first child of the keyed element. `true` for the web entry point, where `<interact-element>` wraps the content; `false` for React and vanilla, where the keyed element is the animated element itself. |
| `plugins`       | `InteractPluginStyles` | —       | Map of plugin name → SSR style generator. For every `$<name>` field in the config, the matching generator is called and its CSS is appended. See [Plugins](/plugins).                                                             |

> **Warning:** `useFirstChild` defaults to `true`. In React and vanilla integrations you have to pass `{ useFirstChild: false }` explicitly — otherwise every generated rule is scoped to `> :first-child` of the keyed element, nothing matches, and no CSS applies.

> **Note:** Passing a bare boolean — `generate(config, false)` — is a legacy alias for `{ useFirstChild: false }`. It still works; new code should use the options bag.

---

## Web (Custom Elements)

The `@wix/interact/web` entry point registers the `<interact-element>` custom element. Wrap each interactive region in `<interact-element>` and give it a `data-interact-key` that matches your interaction's `key`. Binding happens automatically when the element connects — no manual `add()` call needed.

```ts
import { Interact, generate, type InteractConfig } from '@wix/interact/web';
// Optional — only if your config uses namedEffect
import * as presets from '@wix/motion-presets';

const config: InteractConfig = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [
        {
          duration: 1000,
          keyframeEffect: {
            name: 'fade',
            keyframes: [{ opacity: 0 }, { opacity: 1 }],
          },
        },
      ],
    },
  ],
};

// Optional — register named effects before generate()/create()
Interact.registerEffects(presets);

// Render CSS (e.g. during SSR) — web keeps the `useFirstChild: true` default
const interactCSS = generate(config, { useFirstChild: true });

// Start the runtime on the client
Interact.create(config);
```

```html
<head>
  <style>
    ${interactCSS}

    /* Optional — keep the wrapper from affecting layout */
    interact-element {
      display: contents;
    }
  </style>
</head>

<body>
  <interact-element data-interact-key="hero">
    <section class="hero">
      <h1>Welcome</h1>
    </section>
  </interact-element>
</body>
```

### Key points

- `data-interact-key` **must** be unique within the page and match the interaction's `key`.
- `<interact-element>` **must** wrap at least one child element — Interact targets its `:first-child` by default.
- Pass `generate(config, { useFirstChild: true })` for the web entry point so `:first-child` selectors are emitted correctly. It is the default, but spelling it out keeps the contrast with your React and vanilla call sites obvious.

### Loading from a CDN

For environments without a package manager or build step, load the pre-bundled module straight from a CDN with a native ES module `<script>`. This uses the web (`<interact-element>`) entry point — no bundler required.

```html
<script type="module">
  import { Interact, generate } from 'https://esm.sh/@wix/interact@2/web';
  // optional — for namedEffect
  import * as presets from 'https://esm.sh/@wix/motion-presets@1';

  const config = {
    /* your InteractConfig */
  };

  Interact.registerEffects(presets); // only needed when using namedEffect

  document.head.insertAdjacentHTML(
    'beforeend',
    `<style>${generate(config, { useFirstChild: true })}</style>`,
  );

  Interact.create(config);
</script>
```

```html
<interact-element data-interact-key="hero">
  <section class="hero">Hello, animated world!</section>
</interact-element>
```

> **Tip:** A major-version range such as `@wix/interact@2` lets the CDN serve patches and new features while holding back breaking changes. Pin an exact version instead when you need byte-for-byte reproducible output.

> **Warning:** A `type="module"` script is deferred, so CSS generated this way lands after the first paint. Keep entrance content hidden until then — see [preventing FOUC](/html-integration#preventing-fouc).

---

## React

The `@wix/interact/react` entry point adds the `<Interaction>` component. It renders the tag you specify, stamps the `data-interact-key` attribute, and binds/unbinds the element automatically through a ref — so you don't call `add()`/`remove()` yourself. It is the preferred way to bind elements in React.

Generate the CSS **once, outside the component**: `generate()` walks the entire config, and calling it in the component body repeats that work on every render. Create the runtime inside `useEffect`, so it only runs on the client, and tear it down on cleanup.

```tsx
import { useEffect } from 'react';
import { Interact, Interaction, generate } from '@wix/interact/react';
import type { InteractConfig } from '@wix/interact/react';

const config: InteractConfig = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [
        {
          duration: 1000,
          keyframeEffect: {
            name: 'fade',
            keyframes: [{ opacity: 0 }, { opacity: 1 }],
          },
        },
      ],
    },
  ],
};

// Module scope — runs once. React renders the keyed element directly, so `useFirstChild` is false.
const interactCSS = generate(config, { useFirstChild: false });

export function App() {
  useEffect(() => {
    const instance = Interact.create(config);
    return () => instance.destroy();
  }, []);

  return (
    <>
      <style>{interactCSS}</style>

      {/* <Interaction> renders <section data-interact-key="hero"> and binds it */}
      <Interaction tagName="section" interactKey="hero" className="hero">
        <h1>Welcome</h1>
      </Interaction>
    </>
  );
}
```

> **Note:** `Interact.create()` is a no-op during server rendering. It calls `init()` internally, which returns immediately when `typeof window === 'undefined'` — and also when `window.customElements` is unavailable, so nothing binds in an environment without custom-element support even on the client. Calling `create()` from `useEffect` keeps it on the client, where both checks pass.

> **Tip:** If the config is built at runtime (from per-page data, for example), wrap the call in `useMemo(() => generate(config, { useFirstChild: false }), [config])` rather than hoisting it. Better still, run `generate()` in your build step or SSR pass and ship the result as a stylesheet.

### `<Interaction>` props

| Prop          | Type                          | Default      | Description                                                              |
| :------------ | :---------------------------- | :----------- | :----------------------------------------------------------------------- |
| `tagName`     | `keyof JSX.IntrinsicElements` | **Required** | The HTML tag to render (e.g. `'section'`, `'div'`).                      |
| `interactKey` | `string`                      | **Required** | Unique key matching an interaction's `key`.                              |
| `children`    | `React.ReactNode`             | —            | Content rendered inside the tag.                                         |
| `ref`         | `React.Ref<any>`              | —            | Forwarded to the rendered DOM element, alongside Interact's binding ref. |
| `...rest`     | —                             | —            | Any valid props for `tagName` (`className`, `style`, event handlers).    |

### Manual binding with `createInteractRef`

Reach for `createInteractRef` only when you must render the element yourself — for example when passing a `ref` into a third-party component. Otherwise use `<Interaction>`.

`createInteractRef(key)` returns a **new** ref callback every time it is called. Creating it during render therefore hands React a different callback on each render, so React detaches the old ref (which calls `remove(key)`) and attaches the new one (which calls `add(element, key)`) — churning the binding on every render. Keep the callback stable with `useRef` or `useMemo`:

```tsx
import { useRef } from 'react';
import { createInteractRef } from '@wix/interact/react';

function Hero() {
  const interactRef = useRef(createInteractRef('hero'));

  return (
    <section ref={interactRef.current} data-interact-key="hero" className="hero">
      <h1>Welcome</h1>
    </section>
  );
}
```

Write `data-interact-key` into your own markup, as above. The generated CSS is scoped to `[data-interact-key="hero"]`, and while `add()` sets the attribute when it binds, that happens only once the ref runs — an attribute already in your JSX is there from the first paint. `<Interaction>` handles this for you.

### Key points

- `<Interaction>` is the preferred binding mechanism; `createInteractRef` is the escape hatch.
- Always call `Interact.create()` inside `useEffect` and `instance.destroy()` in its cleanup function.
- Pass `generate(config, { useFirstChild: false })` for React — the keyed element is rendered directly, without an `<interact-element>` wrapper.
- `tagName` must be a valid HTML tag; `interactKey` must be unique within the page.

---

## Vanilla JS

Use the base `@wix/interact` entry point when you manage your own DOM. After the elements exist on the page, bind each one to its interaction `key` with `add()`.

```ts
import { Interact, add, generate, type InteractConfig } from '@wix/interact';

const config: InteractConfig = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [
        {
          duration: 1000,
          keyframeEffect: {
            name: 'fade',
            keyframes: [{ opacity: 0 }, { opacity: 1 }],
          },
        },
      ],
    },
  ],
};

// 1. Inject generated CSS (ideally done at build time / on the server)
document.head.insertAdjacentHTML(
  'beforeend',
  `<style>${generate(config, { useFirstChild: false })}</style>`,
);

// 2. Start the runtime
const instance = Interact.create(config);

// 3. Bind each element to its key
add(document.querySelector('.hero'), 'hero');
```

```html
<section class="hero">
  <h1>Welcome</h1>
</section>
```

### API

| Function            | Description                                                                                                                                                                                        |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `add(element, key)` | Binds a DOM element to an interaction `key`. Call it **after** the element is in the DOM.                                                                                                          |
| `remove(key)`       | Tears down the whole controller registered for `key` — every interaction bound to that element, not a single one — and disconnects its triggers. To bind it again, call `add(element, key)` again. |

### Key points

- `add()` must run after the target element exists in the DOM.
- For content that appears later (modals, infinite lists, route changes), call `add()` when the element mounts and `remove()` when it unmounts.
- `remove()` has no partial form: you cannot detach one interaction from a key while leaving the others attached.

---

## Named effects (`registerEffects`)

`namedEffect` animations ship in `@wix/motion-presets` and have to be registered before Interact can resolve them:

```ts
import { Interact } from '@wix/interact/web';
import * as presets from '@wix/motion-presets';

Interact.registerEffects(presets);
```

Three rules matter when wiring this into a build:

- **Register before you generate or create.** The registry is a module-level singleton that both `generate()` and `Interact.create()` read when they run. CSS generated before a preset was registered simply omits that animation — Interact logs a console warning rather than throwing.
- **Re-run `generate()` for every config after registering.** Registering more effects later does not update CSS you have already produced.
- **Register in both processes.** Your build/SSR step and your client bundle are separate JavaScript environments with separate registries. Registering only at build time leaves the runtime unable to resolve the effect, and registering only on the client leaves the CSS incomplete.

> **Tip:** Import only the effects your config uses — `Interact.registerEffects({ FadeIn, ParallaxScroll })` — so your bundler can drop the rest.

For the full catalog and each effect's options, see [Named effects](/named-effects).

---

## Generating CSS

`generate(config, options?)` produces the complete CSS for **all** interactions in a config in one pass — `@keyframes`, animation and transition custom properties, `view-timeline` declarations, state-selector rules, and, for entrance animations, the FOUC-prevention rules described below. Run it at build time or on the server and embed the output before first paint.

```ts
import { generate } from '@wix/interact/web';

const css = generate(config, { useFirstChild: true });
```

`generate()` is exported from all three entry points and needs no DOM, so it is safe to call from a build script or a server renderer.

### Parameters

The second argument is a `GenerateOptions` bag.

| Name                    | Type                   | Default | Description                                                                                                                                                        |
| :---------------------- | :--------------------- | :------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config`                | `InteractConfig`       | —       | The same config you pass to `Interact.create()`.                                                                                                                   |
| `options.useFirstChild` | `boolean`              | `true`  | `true` for the web (`<interact-element>`) entry point; `false` for the vanilla and React integrations. Must match `useCustomElement` on `Interact.create()`.       |
| `options.plugins`       | `InteractPluginStyles` | —       | Map of plugin name to a build-time style generator. Required to server-render the styles for any `$`-prefixed plugin field in the config. See [Plugins](/plugins). |

> **Note:** `generate(config, true)` — a bare boolean as the second argument — is still supported as the legacy `useFirstChild` signature.

> **Tip:** When the config uses `namedEffect`, call `Interact.registerEffects()` before `generate()`, otherwise the named effect cannot be resolved into keyframes.

### Embedding the generated CSS

The generated CSS must reach the browser before the elements it guards are painted. Any of these three placements works:

```html
<!-- Option 1: inline in <head> — preferred -->
<head>
  <style>
    /* generated css */
  </style>
</head>

<!-- Option 2: linked stylesheet in <head> -->
<head>
  <link rel="stylesheet" href="interact.css" />
</head>

<!-- Option 3: render-blocking, at the start of <body> -->
<body>
  <style blocking="render">
    /* generated css */
  </style>
  <!-- or -->
  <link rel="stylesheet" href="interact.css" blocking="render" />
</body>
```

`blocking="render"` is the strongest guarantee: the browser will not paint until that stylesheet has been applied. Use it when the CSS cannot be inlined in `<head>`.

> **Warning:** If you generate CSS in the browser at runtime, inject it before the matching `Interact.create()` call and before you reveal any initially hidden content. Runtime generation cannot fully prevent FOUC on its own.

---

## Preventing FOUC

An entrance animation starts from a hidden or offset frame — `opacity: 0`, a `translateY`, a `scale`. Between first paint and the moment the animation engine applies that first frame, the element renders in its final, visible state: a **flash of unstyled content (FOUC)**. The CSS from `generate()` closes that window by holding the element in a neutral hidden state until the animation actually starts.

FOUC prevention is fully automatic. You do not add an attribute, a class, or an inline style to opt in — generating the CSS and embedding it before first paint is the whole mechanism.

### What the generated CSS emits

For a qualifying entrance animation, `generate()` emits two guarded rules alongside the normal ones. For an interaction keyed `hero` with a fade-in:

<!-- prettier-ignore -->
```css
[data-interact-key="hero"]:not([data-interact-enter]) {
  visibility: hidden;
  transform: none !important;
  translate: none !important;
  scale: none !important;
  rotate: none !important;
}
[data-interact-key="hero"]:not([data-interact-enter="done"]) {
  --animation-0-8diz7tv2pl: fadeIn 600ms 0ms ease-out 1 paused;
  /* … */
}
```

The first rule is the guard. It hides the element and neutralizes the four transform properties so nothing renders in a half-applied position. The four `!important` flags are deliberate: without them an author stylesheet could re-apply a `transform` and defeat the guard. They are expected in DevTools and are not a bug.

The second rule carries the animation custom properties and stops applying once the animation reports `done`, so a finished entrance leaves no animation shorthand behind.

### `data-interact-enter`

`data-interact-enter` is written by the runtime and read by the generated CSS. It is **read-only for authors** — never set it in your markup or your own JavaScript.

| Value      | Set when                                       | Consequence                                                                                    |
| :--------- | :--------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| _(absent)_ | Initial state, before the animation plays.     | Both rules apply — the element is hidden and the animation is staged.                          |
| `start`    | The runtime plays the animation.               | The hide rule stops matching, so the element becomes visible and animates.                     |
| `done`     | A CSS-driven animation finishes or is aborted. | Both rules stop matching; the element retains whatever the animation's `fill` leaves in place. |

It is not exclusive to `viewEnter`. Event-triggered time effects with `triggerType: 'repeat'` or `'once'` also clear the attribute each time they replay and re-set it to `done` when the animation finishes or aborts — clearing it is what re-arms the animation custom properties in the second rule so a CSS animation can run again.

### When FOUC prevention does not apply

The guard rules are emitted only when all three of these hold:

- the trigger is `viewEnter`,
- the effect's `triggerType` is `once` (the default), and
- the effect targets the same element the interaction is keyed to.

Everything else — `repeat`, `alternate`, `state`, and any `viewEnter` effect that animates a different element — gets no guard rule, and the target renders in its natural state until the animation runs.

If that first frame would be visibly wrong, apply the starting keyframe yourself and set `fill: 'both'` so the animation holds both ends of the range:

```html
<div data-interact-key="card" style="opacity: 0">…</div>
```

```ts
// inside interactions[]
{
  key: 'card',
  trigger: 'viewEnter',
  effects: [
    {
      duration: 600,
      fill: 'both',
      triggerType: 'repeat',
      keyframeEffect: {
        name: 'fadeIn',
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
      },
    },
  ],
}
```

**Result:** the card is transparent from first paint, fades in each time it scrolls into view, and stays transparent between repeats instead of flashing to full opacity.

> **Note:** Scroll-driven effects (`viewProgress`) need no FOUC handling. Their progress is bound to scroll position, so the first painted frame is already the correct one.

> **Note:** `generate()` covers the whole config, not just entrance triggers. Always embed its output, even on a page that only uses hover and click.

---

## Static API reference

Each `Interact.create(config)` call returns an `Interact` instance. Keep a reference if you need to dynamically bind elements, or to destroy that instance later.

| Member                              | Type                            | Default | Description                                                                                                                                  |
| :---------------------------------- | :------------------------------ | :------ | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `Interact.create(config, options?)` | `Interact`                      | —       | Initializes a runtime for the config and returns the instance. Multiple configs create separate instances.                                   |
| `Interact.registerEffects(effects)` | `void`                          | —       | Registers `namedEffect` presets into the `effects` registry. Call before `generate()` and `create()` when using named effects.               |
| `Interact.setup(options)`           | `void`                          | —       | Sets global defaults for `viewProgress`, `pointerMove` and `viewEnter`, and toggles the accessible trigger upgrades. Call before `create()`. |
| `Interact.use(name, plugin)`        | `void`                          | —       | Registers a plugin under `name`, invoked for a matching `$<name>` config field. Call before `create()`.                                      |
| `Interact.getPlugin(name)`          | `InteractPlugin` \| `undefined` | —       | Returns the plugin registered under `name`.                                                                                                  |
| `Interact.getPluginsNames()`        | `Set<string>`                   | —       | Returns the names of all registered plugins.                                                                                                 |
| `Interact.destroy()`                | `void`                          | —       | Tears down **all** instances (e.g. on full page navigation).                                                                                 |
| `instance.destroy()`                | `void`                          | —       | Tears down a single instance created by `Interact.create()`.                                                                                 |
| `Interact.forceReducedMotion`       | `boolean`                       | `false` | force reduced-motion behavior regardless of the OS setting.                                                                                  |
| `Interact.allowA11yTriggers`        | `boolean`                       | `true`  | Upgrades `hover` to `interest` and `click` to `activate` when triggers are bound. See below.                                                 |

### `Interact.create(config, options)`

```ts
const instance = Interact.create(config, { useCustomElement: true });
```

| Name                       | Type             | Default            | Description                                                                               |
| :------------------------- | :--------------- | :----------------- | :---------------------------------------------------------------------------------------- |
| `config`                   | `InteractConfig` | —                  | The config to run.                                                                        |
| `options.useCustomElement` | `boolean`        | entry-point driven | Selects custom-element mode. Must match the `useFirstChild` value passed to `generate()`. |

`useCustomElement` defaults to `true` when the `@wix/interact/web` entry point has been imported — importing it is what registers `<interact-element>` — and `false` otherwise. Pass it explicitly only when you import the web entry point but do not wrap your markup in `<interact-element>`.

> **Note:** `Interact.create()` is a no-op where there is no `window` (server rendering) or no `window.customElements`. Generating CSS on the server and creating the runtime in the browser is the intended split.

### `Interact.setup(options)`

Configure global trigger defaults before creating any instances:

```ts
Interact.setup({
  viewEnter: { threshold: 0.25, inset: '10%' },
  scrollOptionsGetter: () => ({
    /* … */
  }),
  pointerOptionsGetter: () => ({
    /* … */
  }),
  allowA11yTriggers: true,
});
```

| Name                   | Type                           | Default | Description                                                                              |
| :--------------------- | :----------------------------- | :------ | :--------------------------------------------------------------------------------------- |
| `viewEnter`            | `Partial<ViewEnterParams>`     | `{}`    | Default `threshold`, `inset` and `useSafeViewEnter` for every `viewEnter` trigger.       |
| `scrollOptionsGetter`  | `() => Partial<scrollConfig>`  | —       | Returns options merged into every scroll controller Interact creates for `viewProgress`. |
| `pointerOptionsGetter` | `() => Partial<PointerConfig>` | —       | Returns options merged into every pointer controller Interact creates for `pointerMove`. |
| `allowA11yTriggers`    | `boolean`                      | `true`  | Toggles the accessible trigger upgrades described below.                                 |

The two getters are called each time Interact builds a scroll or pointer controller, and their result is spread last — so they also override Interact's own defaults, such as the scroll `root`. Use them for global smoothing, velocity or a custom scroll root. The full option lists belong to the underlying `fizban` (scroll) and `kuliso` (pointer) controllers; see the [`@wix/motion` package](https://github.com/wix/interact/tree/master/packages/motion) for how Interact drives them.

> **Warning:** `Interact.setup()` **replaces**, it does not merge. Every key you pass overwrites the previous value for that key outright — a second call with `{ viewEnter: { inset: '10%' } }` discards a `threshold` set by the first call, and a second `scrollOptionsGetter` replaces the earlier getter. Keys you omit are left untouched. Pass the complete set of defaults in a single call.

Per-effect `params` still win: a `viewEnter` trigger that declares its own `threshold` overrides the global default for that trigger only.

### Accessible trigger upgrades (`allowA11yTriggers`)

`hover` and `click` are pointer-only. With `Interact.allowA11yTriggers` left at its default `true`, Interact substitutes the accessible variant when it binds those triggers:

| Declared trigger | Bound as   | Listens to                                                 |
| :--------------- | :--------- | :--------------------------------------------------------- |
| `hover`          | `interest` | `mouseenter` / `focusin` in, `mouseleave` / `focusout` out |
| `click`          | `activate` | `click`, plus `keydown` filtered to `Enter` and `Space`    |

The `interest` upgrade also sets `tabIndex = 0` on the source element so it can receive keyboard focus, and it ignores focus moves that stay inside the source. The `activate` upgrade does not add focusability — the source still needs to be natively focusable or carry its own `tabindex`.

Set `allowA11yTriggers: false` when the upgrade fights your own markup: for example when the source already contains a real `<button>` that handles keyboard interaction, or when adding it to the tab order would disturb a deliberately authored focus order.

> **Note:** `allowA11yTriggers` only affects the `hover` and `click` triggers. Declaring `trigger: 'interest'` or `trigger: 'activate'` explicitly always binds the accessible behavior, regardless of the flag.

> **Warning:** `allowA11yTriggers` is read when triggers are bound, so it must be set before `Interact.create()`.

### Plugins

`Interact.use(name, plugin)` registers an extension that runs whenever an interaction or effect carries a matching `$<name>` field. Interact never inspects the field's value — it just routes it to the plugin.

```ts
import { Interact } from '@wix/interact';

Interact.use('splitText', (value, context) => {
  /* … */
  return () => {
    /* cleanup, run on disconnect */
  };
});
```

> **Warning:** Register every plugin **before** `Interact.create()`. A `$<name>` field with no registered plugin is silently ignored.

To style plugin-owned elements before the plugin has run — which is what prevents FOUC on, say, pre-split text — pass a matching build-time generator in `generate()`'s `plugins` option. That is a separate callback from the one given to `Interact.use()`. See [Plugins](/plugins) for the full contract.

---

## Browser support

Interact targets evergreen browsers and degrades where a platform feature is missing.

| Feature                            | Behavior                                                                                                                                                      |
| :--------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ViewTimeline` (scroll-driven CSS) | Feature-detected. Where it exists, `viewProgress` runs as a native scroll-driven animation; otherwise Interact falls back to the `fizban` scroll polyfill.    |
| `:state()` custom state selectors  | Generated state rules list `:state(x)`, the legacy `:--x` syntax, and a `[data-interact-effect~="x"]` attribute fallback, so one rule works across all three. |
| Custom Elements                    | Required. `Interact.create()` returns without binding anything when `window.customElements` is unavailable — including during server rendering.               |

Because the fallbacks live in the generated CSS and the runtime, no configuration or feature flag is needed on your side.

---

## Choosing an entry point

- **Server-rendered HTML or a design tool output?** Use **web** (`<interact-element>`) — binding is automatic and works without hydration.
- **React app?** Use **react** (`<Interaction>`) — lifecycle and binding are handled for you.
- **Full control over the DOM, or a non-React framework?** Use **vanilla** — call `add()`/`remove()` at the right moments in your own lifecycle.

All three produce identical animations from the same config; pick the one that matches how you render markup.

## See also

- [Set up your first interaction](/my-first-interaction)
- [The config object](/the-config-object)
- [Named effects](/named-effects)
- [What is a trigger?](/what-is-a-trigger)
- [Plugins](/plugins)

# The final result

This page is the capstone of the getting-started track: one working page that puts an entrance animation, a hover state effect, and a scroll-driven effect into a single `InteractConfig`. Copy the four files below and you have the finished result.

It is written end-to-end against the **web (Custom Elements)** entry point, `@wix/interact/web` — you wrap each interactive region in `<interact-element>`, give it a `data-interact-key`, and the runtime binds it for you. That is the shortest path from a config to a running page. React and vanilla JS take the exact same config and the exact same `generate()` output; only the way an element is bound to a key differs. See [HTML integration](/html-integration) for those two.

```bash
npm install @wix/interact @wix/motion-presets
```

## What you are building

- A hero that floats up as the page loads, with no flash of unstyled content (FOUC) — because the CSS is generated ahead of time.
- A feature card whose image lifts and gains a shadow while the pointer is over the card.
- A gallery image that drifts against the scroll as it passes through the viewport.

Three interactions, three kinds of effect payload: a named effect, a `transition`, and a named scroll preset.

## 1. The markup

Each keyed region is wrapped in `<interact-element>` with a `data-interact-key` that matches an interaction's `key`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Interact — the final result</title>

    <!-- Generated in step 3. Must be parsed before first paint. -->
    <style>
      /* …paste the output of generate() here… */
    </style>

    <style>
      /* Your own page styles */
      interact-element {
        display: contents;
      }
      .hero {
        min-height: 70vh;
        display: grid;
        place-content: center;
      }
      .card {
        max-width: 320px;
        margin: 12vh auto;
      }
      .card-media {
        display: block;
        width: 100%;
        border-radius: 12px;
      }
      .gallery {
        display: grid;
        height: 70vh;
        overflow: clip; /* never overflow: hidden — see the warning below */
      }
      .gallery img {
        width: 100%;
        height: 110vh;
        object-fit: cover;
      }
    </style>
  </head>

  <body>
    <interact-element data-interact-key="hero">
      <section class="hero">
        <h1>Everything, together</h1>
      </section>
    </interact-element>

    <interact-element data-interact-key="feature-card">
      <article class="card">
        <img class="card-media" src="/feature.jpg" alt="" />
        <h2>One config, three behaviours</h2>
      </article>
    </interact-element>

    <section class="gallery">
      <interact-element data-interact-key="gallery-image">
        <img src="/landscape.jpg" alt="A wide mountain landscape" />
      </interact-element>
    </section>

    <script type="module" src="./main.js"></script>
  </body>
</html>
```

- Every `data-interact-key` must be unique on the page and match an interaction's `key`.
- `<interact-element>` must wrap at least one element.
- `interact-element { display: contents; }` is optional — it keeps the wrapper from taking part in layout.

> **Critical:** Use `overflow: clip`, never `overflow: hidden`, on any element between a `viewProgress` element and the scroll container. `overflow: hidden` creates a new scroll context and breaks the ViewTimeline. In Tailwind, replace `overflow-hidden` with `overflow-clip`.

## 2. The config

One `InteractConfig`, three interactions — this is the whole behaviour of the page.

```ts
// interactions.ts
import type { InteractConfig } from '@wix/interact/web';

export const config: InteractConfig = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      params: { threshold: 0.25 },
      effects: [
        {
          namedEffect: { type: 'FloatIn', direction: 'bottom' },
          duration: 800,
          fill: 'backwards',
          triggerType: 'once',
        },
      ],
    },
    {
      key: 'feature-card', // SOURCE
      trigger: 'hover',
      effects: [
        {
          selector: '.card-media', // TARGET
          stateAction: 'toggle',
          transition: {
            duration: 250,
            easing: 'ease-out',
            styleProperties: [
              { name: 'transform', value: 'scale(1.06)' },
              { name: 'box-shadow', value: '0 12px 32px rgb(0 0 0 / 0.18)' },
            ],
          },
        },
      ],
    },
    {
      key: 'gallery-image',
      trigger: 'viewProgress',
      effects: [
        {
          namedEffect: { type: 'ParallaxScroll', parallaxFactor: 0.4, range: 'continuous' },
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
  ],
};
```

**The entrance.** `triggerType: 'once'` is mandatory here, because the observed element and the animated element are the same one — any other trigger type would let the animation move the element out of the viewport and re-fire itself. `fill: 'backwards'` applies the first keyframe before the animation starts. There is no `easing` on this effect because `FloatIn` supplies its own curve — some presets accept an `easing` override, this one does not.

**The hover.** A `transition` payload makes this a state effect: `stateAction: 'toggle'` applies the styles on pointer enter and removes them on leave, and the browser transitions between them. Property names are written in kebab-case (`box-shadow`), the form they take in CSS.

**The scrub.** `rangeStart` and `rangeEnd` are required for `viewProgress` — here `cover` from 0% to 100%, the full span from the element's first pixel entering the viewport to its last pixel leaving. Scroll presets (every `*Scroll` preset) additionally require `range`; `'continuous'` passes through the element's resting state, rather than ending at it (`'in'`) or starting from it (`'out'`). `fill: 'both'` keeps the effect applied at both ends.

> **Critical:** The hover effect targets the card's image, not the card itself. A hover effect that changes the size or position of the hovered element shifts its own hit area, which makes the pointer enter and leave repeatedly and the animation flicker. Point the effect at a child, or at a different `key`.

> **Tip:** Swap `trigger: 'hover'` for `trigger: 'interest'` to respond to keyboard focus as well as the pointer. See [Click and hover](/click-and-hover).

## 3. Generate and embed the CSS

`generate()` turns the whole config into CSS: `@keyframes` for the entrance and the parallax, the `view-timeline` declaration and `animation-range` for the scroll effect, the transition custom properties for the hover state — and the FOUC rule that hides the hero until its entrance begins. Run it at build time or during SSR; generating it in the browser is a fallback, not the default.

```ts
// build-css.ts — run at build time or during SSR
import { writeFileSync } from 'node:fs';
import { Interact, generate } from '@wix/interact/web';
import { FloatIn, ParallaxScroll } from '@wix/motion-presets';
import { config } from './interactions';

// Presets must be registered before generate() — and before create()
Interact.registerEffects({ FloatIn, ParallaxScroll });

const css = generate(config, { useFirstChild: true });

writeFileSync('interact.css', css);
```

`useFirstChild: true` is the right value for this page because it uses the web entry point: the keyed element is the `<interact-element>` wrapper, so the generated rules have to reach the element inside it. Pass `false` for React and vanilla JS, where the keyed element is the animated element itself.

Embed the result before first paint, using whichever fits your build:

- inline in `<head>`, in the empty `<style>` from step 1 (preferred);
- `<link rel="stylesheet" href="interact.css" />` in `<head>`;
- `<style blocking="render">` or `<link rel="stylesheet" href="interact.css" blocking="render" />` at the start of `<body>`.

This is what prevents FOUC. Without it, the hero paints at full opacity in its final position for a frame or two, then jumps back to the start of its animation once JS boots. The generated rule keeps it hidden until the entrance actually starts.

## 4. Create the runtime

```ts
// main.ts
import { Interact } from '@wix/interact/web';
import { FloatIn, ParallaxScroll } from '@wix/motion-presets';
import { config } from './interactions';

Interact.registerEffects({ FloatIn, ParallaxScroll });

const instance = Interact.create(config);
```

Bundle this to the `./main.js` the page loads in step 1. `Interact.create()` defines the `<interact-element>` custom element, binds every keyed element already in the DOM, and starts observing. Keep the returned instance and call `instance.destroy()` when the page or component goes away, so nothing is left observing.

**Result:** The hero never flashes — it is hidden by the generated CSS from the first paint, and once a quarter of it is visible it slides up 120px from below while fading in, over 800ms, exactly once. Moving the pointer onto the feature card scales its image to 106% and adds a soft drop shadow over 250ms; moving away transitions both back. The card itself never moves, so the pointer never loses it. Scrolling on to the gallery, the image drifts vertically against the scroll for the whole time it is on screen — `parallaxFactor: 0.4` puts it roughly 20vh either side of its resting position — and because the effect is driven by scroll position rather than by time, scrolling back up rewinds it exactly.

## See also

- [What are effects?](/what-are-effects) — the effect kinds and how to choose between them
- [Named effects](/named-effects) — the full preset catalog and their options
- [Transition effects](/transition-effects) — state effects in depth
- [Scroll-driven animations](/viewprogress) — ranges, offsets, and the sticky-container pattern
- [Understanding conditions](/understanding-conditions) — gate any of these by media query or selector

# Configuration

# The config object

`InteractConfig` is the single object that describes every interaction on a page. You build the whole thing up front and hand it to `Interact.create()`, which wires up the triggers, observers, and timelines — or to `generate()`, which turns it into static CSS at build time.

It has one required field, `interactions`, plus three optional registries of reusable pieces that those interactions reference by id.

## Structure

```ts
type InteractConfig = {
  interactions: Interaction[]; // REQUIRED
  effects?: Record<string, Effect>; // reusable effects, referenced by effectId
  sequences?: Record<string, SequenceConfig>; // reusable sequences, referenced by sequenceId
  conditions?: Record<string, Condition>; // named conditions; the keys are the condition ids
};
```

## Fields

| Field          | Type                             | Default | Description                                                                                                                                                                                                                                                                                                                                                                                              |
| :------------- | :------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `interactions` | `Interaction[]`                  | —       | **Required.** Every interaction on the page. Each one binds a trigger on a source element to one or more effects.                                                                                                                                                                                                                                                                                        |
| `effects`      | `Record<string, Effect>`         | omitted | Reusable effects. The key is the `effectId` that an interaction, a sequence, or an `animationEnd` trigger refers to.                                                                                                                                                                                                                                                                                     |
| `sequences`    | `Record<string, SequenceConfig>` | omitted | Reusable sequences. The key is the `sequenceId` that an interaction refers to.                                                                                                                                                                                                                                                                                                                           |
| `conditions`   | `Record<string, Condition>`      | omitted | Named conditions. The key is the id listed in a `conditions` array on an interaction, an effect, or a sequence.                                                                                                                                                                                                                                                                                          |
| `$<name>`      | `unknown`                        | omitted | Plugin config. Not a top-level key: a `$`-prefixed field sits on an individual interaction or effect and routes its value to the plugin registered under `<name>`. Interact never inspects the value, and it is the only unknown key [`@wix/interact-validate`](https://github.com/wix/interact/tree/master/packages/interact-validate) accepts on an interaction or an effect. See [Plugins](/plugins). |

## Interactions

An interaction binds a trigger — `hover`, `click`, `interest`, `activate`, `viewEnter`, `viewProgress`, `pointerMove`, or `animationEnd` — on a source element to one or more effects that play in response. It is the only required part of a config: a config with no registries still works, a config with no interactions does nothing.

See [What is an interaction?](/what-is-an-interaction).

## Effects

An effect is a single visual change applied to a target element when its interaction's trigger fires. Each effect carries exactly one of:

- `namedEffect` — a registered named effect
- `keyframeEffect` — your own keyframes
- `customEffect` — an imperative per-frame callback
- `transition` or `transitionProperties` — a CSS style toggle

Declaring an effect inline on an interaction is fine. Putting it in the `effects` registry instead lets several interactions share one definition, and gives `animationEnd` an `effectId` to wait on.

See [What are effects?](/what-are-effects).

## Sequences

A sequence coordinates several effects, optionally with staggered timing, so that they fire and are controlled as one orchestrated group instead of as separate effects.

See [What is a sequence?](/what-is-a-sequence).

## Conditions

A condition is a named predicate that decides whether something applies. There are two types:

- `media` — a CSS media query, evaluated against the environment: `{ type: 'media', predicate: '(min-width: 768px)' }`
- `selector` — a CSS selector, evaluated against the DOM: `{ type: 'selector', predicate: '.dark-theme &' }`

Conditions are attached by id: to an interaction (gating the whole trigger), to an individual effect (skipping just that effect), or to a sequence. Every id listed must pass.

See [Understanding conditions](/understanding-conditions).

## Example: a staggered card row on desktop

```ts
import { Interact } from '@wix/interact/web';
import * as presets from '@wix/motion-presets';

import type { InteractConfig } from '@wix/interact';

const config: InteractConfig = {
  interactions: [
    {
      key: 'card-row',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      conditions: ['desktop'], // references the conditions map below
      sequences: [{ sequenceId: 'cards-in' }], // references the sequences map below
    },
  ],

  effects: {
    'card-fade': {
      duration: 600,
      easing: 'ease-out',
      fill: 'both',
      namedEffect: { type: 'FloatIn', direction: 'bottom' },
    },
  },

  sequences: {
    'cards-in': {
      offset: 120, // ms between each card starting
      effects: [
        { effectId: 'card-fade', listContainer: '.cards' }, // references card-fade, staggered across list children
      ],
    },
  },

  conditions: {
    desktop: { type: 'media', predicate: '(min-width: 768px)' },
  },
};

Interact.registerEffects(presets); // required before create() when using namedEffect
Interact.create(config);
```

```html
<interact-element data-interact-key="card-row">
  <div class="cards">
    <article class="card">One</article>
    <article class="card">Two</article>
    <article class="card">Three</article>
  </div>
</interact-element>
```

**Result:** On viewports 768px and wider, the three cards float up into place one after another, 120 ms apart, as soon as the row is 20% visible. Each card takes 600 ms and holds its final position. Below 768px the condition fails, the trigger never binds, and the cards simply render in place.

## See also

- [What is an interaction?](/what-is-an-interaction)
- [What are effects?](/what-are-effects)
- [What is a sequence?](/what-is-a-sequence)
- [Understanding conditions](/understanding-conditions)
- [Plugins](/plugins)

# Triggers

# What is a trigger?

A trigger is the event that starts — or continuously drives — an interaction. It's the bridge between something that happens (a hover, a click, a scroll, the cursor moving, an element entering the screen) and the effects Interact plays in response.

In Interact you don't wire up your own event listeners or observers. Instead you describe interactions declaratively: each interaction binds one trigger to one or more effects on a keyed element, and the library handles the listening, observing, and cleanup for you.

```ts
// inside interactions[]
{
  key: 'my-element',    // which element (its data-interact-key)
  trigger: 'viewEnter', // the event that fires the effects
  effects: [{ effectId: 'fade-in' }],
}
```

## Trigger list and overview

Interact ships with eight triggers, spanning pointer input, the viewport, scrolling, and animation chaining:

| Trigger                         | Fires when…                                   | `params`                                                           |
| :------------------------------ | :-------------------------------------------- | :----------------------------------------------------------------- |
| [`hover`](/click-and-hover)     | the pointer enters or leaves the element      | none                                                               |
| [`click`](/click-and-hover)     | the element is clicked                        | none                                                               |
| [`interest`](/click-and-hover)  | accessible hover — pointer or keyboard focus  | none                                                               |
| [`activate`](/click-and-hover)  | accessible click — click, Enter, or Space     | none                                                               |
| [`viewEnter`](/viewenter)       | the element scrolls into the viewport         | `ViewEnterParams`, optional                                        |
| [`viewProgress`](/viewprogress) | continuously, mapped to scroll position       | none — the range lives on the effect, as `rangeStart` / `rangeEnd` |
| [`pointerMove`](/pointermove)   | continuously, mapped to the cursor's position | `PointerMoveParams`, optional                                      |
| [`animationEnd`](/animationend) | another effect finishes (for chaining)        | `AnimationEndParams`, required — the `effectId` to wait on         |

> **Note:** `hover`, `click`, `interest` and `activate` take no `params` at all. What they do is configured entirely on the effect — for example `triggerType: 'once'` on a time effect, or `stateAction` on a state effect.

Each trigger has its own chapter with its full options and examples. The four pointer triggers share one: [Click and hover](/click-and-hover) covers `interest` and `activate` alongside `hover` and `click`, because they are the accessibility-aware counterparts of the same two gestures. `interest` adds keyboard focus to hover, `activate` adds Enter and Space to click, and while `Interact.allowA11yTriggers` is on — it is on by default — `hover` and `click` already behave that way too.

## See also

- [The config object](/the-config-object)
- [What is an interaction?](/what-is-an-interaction)
- [Click and hover](/click-and-hover)
- [Entrance animations (`viewEnter`)](/viewenter)
- [Multi-interaction compositions](/multi-interaction-compositions)

# Entrance animations (`viewEnter`)

Entrance animations play when an element becomes visible in the viewport. Scroll down, and content introduces itself — it is a common pattern for reveal-on-scroll sections, staggered grids, visual reveals, and ambient loops that should run only while they are on screen.

## How it works: `IntersectionObserver`

Interact's `viewEnter` trigger is built on the native [`IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) — the browser API that reports when an element crosses in and out of the viewport. The browser tells the library when the source element becomes visible, and the library plays the animation.

### An event trigger

The `viewEnter` trigger is an event trigger: something happens — the element enters the viewport — and an animation plays over its duration. Once triggered, the animation runs on its own clock; scrolling faster doesn't speed it up, and scrolling back doesn't rewind it. If you want motion that tracks the scroll position itself, that's [`viewProgress`](/viewprogress). If you want a self-contained animation to play the moment content appears, that's `viewEnter`.

Because the animation plays over time, `viewEnter` works with the time effect payloads — `keyframeEffect`, `namedEffect`, and `customEffect` — each paired with a `duration`, plus the usual timing controls: `delay`, `easing`, `fill`, `iterations`, `alternate`, `reversed`, and `composite`. It does not drive state effects (`transition` / `transitionProperties`); those respond to user input and are covered in [click and hover](/click-and-hover).

`alternate` appears in two different places in the API. `triggerType: 'alternate'` controls what happens when the source enters and exits. The timing option `alternate: true` alternates the direction of successive animation iterations. They can be used together, but they solve different problems.

`reversed: true` makes the animation's initial playback direction run from its end toward its start. `composite` controls how animated values combine with other animations affecting the same properties: `'replace'` (the default), `'add'`, or `'accumulate'`.

Give every `keyframeEffect` a unique `name` within the config so its generated `@keyframes` rule cannot collide with another effect.

## Choosing a behavior with `triggerType`

The most important decision for a `viewEnter` animation is what happens on repeat visits — because unlike a click, scrolling past an element can happen many times. That behavior is chosen with `triggerType`, set **on each effect** or on a sequence (the interaction's `params` only holds observer tuning — see the next section). The table shows the enter/exit behavior; see the threshold note below when the exact trigger point matters.

| triggerType      | When the element enters                 | When the element exits                                |
| :--------------- | :-------------------------------------- | :---------------------------------------------------- |
| `once` (default) | Plays once; the trigger is then removed | —                                                     |
| `repeat`         | Restarts from the beginning             | Resets, once the element is fully out of view         |
| `alternate`      | Plays forward                           | Plays in reverse                                      |
| `state`          | Plays or resumes                        | Pauses (keeping its progress), once fully out of view |

- `once` is the classic entrance: the element reveals itself the first time the visitor reaches it, and stays put. This is the default, and the right choice for most content reveals.
- `repeat` replays the animation on every visit — the element resets when it has scrolled completely out of view, ready to play again on the next encounter. Good for counters and attention moments that should feel fresh each time.
- `alternate` makes visibility reversible: the animation plays as the element enters and reverses as it exits. Note the boundary: alternate reverses as soon as the element crosses back below the trigger threshold, while repeat and state wait until the element is completely out of view before resetting or pausing.
- `state` treats the animation as something that's running while the element is on screen — typically a loop with `iterations: Infinity`. It resumes where it left off on entry and pauses off-screen. Like all the re-triggering types, it should use a separate source and target when the animation can change the source's intersection geometry (see the caveat below). Here a stable wrapper is observed while the orb inside it animates:

```ts
// inside interactions[]
{
  key: 'orb-section', // SOURCE — the stable wrapper is observed
  trigger: 'viewEnter',
  params: { threshold: 0.2 },
  effects: [
    {
      key: 'ambient-orb', // TARGET — only the orb animates
      triggerType: 'state',
      keyframeEffect: {
        name: 'float',
        keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(-16px)' }],
      },
      duration: 3000,
      iterations: Infinity,
      alternate: true,
      easing: 'ease-in-out',
      fill: 'both',
    },
  ],
}
```

### Choosing a `fill` mode

- `repeat`, `alternate`, and `state` want `fill: 'both'`, so their endpoints remain applied and the animation stays available for replay.
- `once` entrances want `fill: 'backwards'`, so the starting keyframe applies before the animation starts and throughout any `delay`. Every entrance named effect in `@wix/motion-presets` already defaults to `'backwards'`; an inline `keyframeEffect` entrance should set it explicitly.
- Use `fill: 'forwards'` or `'both'` instead when a `once` effect ends in a look that differs from the element's normal CSS and that look must persist.

> **Tip:** [`@wix/interact-validate`](https://github.com/wix/interact/tree/master/packages/interact-validate) reports an `info`-level `RECOMMENDED_FILL` nudge when a `viewEnter` + `once` `namedEffect` or `keyframeEffect` omits `'backwards'` or `'both'`, and a matching nudge when a re-triggering effect omits `'both'`.

## Tuning the observer: `threshold` and `inset`

The interaction's `params` holds the observer options:

| Option             | Type      | Default | Description                                                                                                                     |
| :----------------- | :-------- | :------ | :------------------------------------------------------------------------------------------------------------------------------ |
| `threshold`        | `number`  | `0.2`   | Fraction of the source element that must be visible, from 0 to 1, passed to `IntersectionObserver`.                             |
| `inset`            | `string`  | `'0px'` | A length (`'100px'`, `'10%'`) that shrinks or grows the trigger area at the top and bottom of the viewport.                     |
| `useSafeViewEnter` | `boolean` | `false` | Falls back to a safe entry point when the configured `threshold` is unreachable because the source is taller than the viewport. |

A positive `inset` contracts the trigger area inward, so the trigger fires late — only once the element is that far inside the viewport (useful when triggering at the very edge feels premature). A negative inset extends the area beyond the viewport, so the trigger fires early — before the element is actually visible (useful for preparing content just off-screen). Two space-separated values set top and bottom independently (`'10% 30%'`).

> **Note:** `threshold` is a fraction of the source element's own box, not of the viewport. When the height it asks for (source height × threshold) is greater than the viewport height, the ratio can never be reached and the animation never plays. Keep the threshold low on sources taller than the viewport, or enable `useSafeViewEnter`.

### `useSafeViewEnter`

With `useSafeViewEnter: true`, the library measures the source the first time the observer reports it — and only while it is still outside the trigger area. If the required visible height exceeds the viewport height, it stops observing the source with the configured options and re-observes it with a safe fallback: a threshold of 0, firing once the source reaches 10% above the bottom of the viewport. The animation runs instead of being silently skipped.

Reach for it on full-bleed sections, tall hero panels, and any source whose height is content-driven and could outgrow a short viewport on mobile — cases where you still want a meaningful `threshold` on ordinary screens.

> **Warning:** Supply an explicit `threshold` when enabling this option. The fallback check reads the configured value only; it does not evaluate the `0.2` default, so `useSafeViewEnter` on its own does nothing. Note also that the fallback replaces the whole observer configuration, so a configured `inset` no longer applies once it kicks in.

If your whole site shares the same tuning, set it once with `Interact.setup({ viewEnter: { threshold: 0.2, inset: '-50px', useSafeViewEnter: true } })` before calling `Interact.create(config)` — this example starts every entrance 50px before its element scrolls into view, and keeps oversized sources from being skipped. Per-interaction `params` still override the global defaults. Setup changes affect handlers created afterward; they do not rebuild handlers that are already installed.

## Keep the observed element stable

For `repeat`, `alternate`, and `state`, prefer a stable source element and animate a separate target. This matters most when the effect translates, scales, clips, or otherwise changes the source's visible geometry.

The interaction's `key` identifies the keyed root used to resolve the source. Without further selection, that resolves to the keyed element itself in vanilla JS and React, or the first child of `<interact-element>` in the Custom Elements integration. An interaction-level `selector` or `listContainer` can instead resolve one or more actual source elements inside that root. An effect's `key` identifies its target root; when it is omitted, the effect uses the source root, and effect-level selection can narrow the target further. If source and target ultimately resolve to the same element, a geometry-changing animation can affect the visibility signal that controls its own playback, causing repeated or skipped triggers.

With `once`, self-targeting is fine and common because the trigger detaches after its first play. For a re-triggering type, observe a stable wrapper or sibling and animate the content inside it. The optional `@wix/interact-validate` package also warns about same-source/target re-triggering effects.

Also avoid mixing an `alternate` effect with `repeat` or `state` effects on the same observed source in the current release. `repeat` and `state` install an additional full-exit observer whose signal is shared by the source's handlers; an `alternate` effect can therefore reverse once at its threshold and again when the source becomes fully out of view. Use separate stable source elements for those behaviors until this limitation is removed.

Also make sure the source is actually observable. A source with no rendered box (`display: none`), one fully clipped by ancestor overflow, `clip-path`, or a mask, or one transformed entirely outside the viewport may never intersect, so its trigger never fires. When the visual effect needs those techniques, observe a stable wrapper and apply them to a separate target.

## Preventing the entrance flash

An element with an entrance animation is authored in its final, visible state, so it paints at full opacity for an instant before Interact applies the first keyframe — a flash of unstyled content (FOUC). Calling `generate(config)` at build time and embedding the CSS before first paint hides those elements from the first render. For the full mechanism, embedding options, and generation script, see [preventing FOUC](/html-integration#preventing-fouc).

> **Critical:** The generated initial rules cover `viewEnter` + `once` only, and only where source and target are the same element. Nothing else gets them.

For `repeat`, `alternate`, and `state` effects, apply the starting keyframe yourself — as inline styles or a CSS rule on the target — and set `fill: 'both'` so the animation holds both endpoints once it takes over.

A `once` effect whose target is not the observed element also misses the generated rules. `fill: 'backwards'` keeps the first keyframe applied through any `delay`, but anything that must be hidden from the very first paint has to be styled by hand.

## Example: a feature card reveal

Trigger a single `viewEnter` interaction to reveal a feature card. Here, the card serves as both the observed source and the animated target. This self-targeting is safe because `once` is the default behavior, and the library's generation logic handles the initial hiding automatically.

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'feature-card',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      effects: [
        {
          key: 'feature-card',
          keyframeEffect: {
            name: 'card-rise',
            keyframes: [
              { opacity: 0, transform: 'translateY(40px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          duration: 800,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'backwards',
        },
      ],
    },
  ],
};
```

```html
<section class="features">
  <interact-element data-interact-key="feature-card">
    <article class="feature-card">
      <h2>Built for motion</h2>
      <p>Create declarative interactions with a simple configuration.</p>
      <a href="#learn-more">Learn more</a>
    </article>
  </interact-element>
</section>
```

**Result:** The feature card fades in and rises as a unified element once it crosses the 0.2 `threshold`. The animation is restricted to a single playback; it remains in its final state even if the visitor leaves and returns to the section.

## Example: a counter that plays on every visit

`customEffect` receives `(element, progress)`, with progress eased from 0 → 1 during playback. Cancellation or cleanup can report `null`, so callbacks should handle it. Here the observed source (the section) and the animated target (the number) are separate elements, as recommended for `repeat`:

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'stats-section', // SOURCE — the stable wrapper is observed
      trigger: 'viewEnter',
      params: { threshold: 0.5 },
      effects: [
        {
          key: 'customers-count', // TARGET — only the number animates
          triggerType: 'repeat',
          customEffect: (element, progress) => {
            if (progress === null) return;
            element.textContent = Math.round(12500 * progress).toLocaleString();
          },
          duration: 1800,
          easing: 'ease-out',
          fill: 'both',
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="stats-section">
  <section class="stats">
    <interact-element data-interact-key="customers-count">
      <span class="stat-number">0</span>
    </interact-element>
    <span class="stat-label">happy customers</span>
  </section>
</interact-element>
```

**Result:** Each time the stats section enters the configured observer area, the number counts up from 0 to 12,500 over 1.8 seconds. Scroll it fully out of view and back, and it counts again. Swap to `triggerType: 'once'` if it should only ever count once.

## See also

- [What is a trigger?](/what-is-a-trigger)
- [Scroll-driven animations](/viewprogress)
- [Named effects](/named-effects)
- [HTML integration: preventing FOUC](/html-integration#preventing-fouc)
- [`@wix/interact-validate`](https://github.com/wix/interact/tree/master/packages/interact-validate)

# Click and hover

Click and hover are the triggers of direct manipulation: the visitor does something, and the interface answers — a card lifts to meet the cursor, a menu unfolds on tap, a button pulses to confirm. They use the same declarative config as everything else in Interact, so the library owns animation playback, event listeners, and cleanup. Application state that carries meaning — whether a menu is open, for example — still belongs to your UI code and accessibility layer.

## One trigger, two kinds of payloads

Here's the key mental model for this page. Click and hover can drive both effect families:

- Time effects — `keyframeEffect`, `namedEffect`, or `customEffect` with a `duration`. A choreographed piece of motion that plays, reverses, restarts, or pauses when the trigger fires.
- State effects — `transition` / `transitionProperties`. A set of target CSS values the element should move to, animated by a CSS transition. Firing the trigger switches the state on or off; think of it as a class toggle that comes with its transition built in.

The rule of thumb: if you're describing motion — keyframes, a bounce, a multi-step sequence — use a time effect. If you're describing a second look for the element — "while hovered, the button is dark and lifted" — use a state effect, and let the transition handle getting there and back.

Both behaviors are configured on the effect itself: time effects with `triggerType` (how the animation behaves across repeated triggers), state effects with `stateAction` (how the state is switched). Both are covered below.

As with `viewEnter`, the interaction's `key` identifies the keyed root used to resolve the source, and each effect's `key` identifies its target root. Interaction-level `selector` or `listContainer` fields can resolve descendant or list-item sources; effect-level selection does the same for targets. Omit the effect key to use the source root as the target root, or add `selector` to target descendants inside it.

Time effects can also be grouped into a sequence when one click or hover should coordinate several targets. See [using sequences](/using-sequences).

## Accessibility upgrades: interest and activate

Pointer-only interactions exclude keyboard users, so Interact ships an accessible counterpart for each pointer trigger and swaps them in by default:

| Pointer trigger | Accessible upgrade | Events it listens to                                                  |
| :-------------- | :----------------- | :-------------------------------------------------------------------- |
| `hover`         | `interest`         | `mouseenter` + `focusin` on enter; `mouseleave` + `focusout` on leave |
| `click`         | `activate`         | `click` + `keydown`                                                   |

`interest` adds focus to the hover pair. The source element gets `tabIndex = 0` so it can receive focus at all, focus in maps to pointer enter, and focus out maps to pointer leave. Focus moving between descendants of the source does not re-fire the effect — only focus crossing the source's own boundary counts.

`activate` adds keyboard activation to click. `Enter` fires the effect; `Space` fires it too, and its default page scroll is suppressed with `preventDefault()`. This is not redundant with the plain `click` trigger: that listener only responds to click events that carry a `pointerType`, and clicks that browsers synthesize from keyboard activation carry none.

Both upgrades are on by default and cost you nothing to configure — writing `trigger: 'hover'` or `trigger: 'click'` is enough. Writing `trigger: 'interest'` or `trigger: 'activate'` explicitly is also valid, and is the way to opt a single interaction in regardless of the global setting.

> **Warning:** `Interact.allowA11yTriggers` (default `true`) gates the automatic upgrade. Setting it to `false`, either directly or through `Interact.setup({ allowA11yTriggers: false })`, makes `hover` listen for `mouseenter`/`mouseleave` only and `click` for pointer clicks only. Keyboard users then get no animation at all, and hover sources are no longer made focusable. Turn it off only when you are wiring keyboard behavior yourself.

Two things about configuring them:

- They take no `params`. Like `hover` and `click`, everything about their behavior is configured per effect, with `triggerType` for time effects or `stateAction` for state effects.
- Their default `triggerType` is `alternate`, the same default `hover` and `click` use.

Two things remain your responsibility: semantic state (a toggled menu must still update `aria-expanded` — Interact only animates), and respecting `prefers-reduced-motion`.

## Use conditions for input capabilities and motion preferences

Hover is not a dependable interaction on coarse-pointer touch devices. For decorative pointer-only effects, add a media condition so the interaction is installed only on devices that can hover accurately. Don't use this condition to suppress a focus treatment keyboard users need — use [`interest`](#accessibility-upgrades-interest-and-activate) for that.

```ts
const config: InteractConfig = {
  conditions: {
    'fine-hover': {
      type: 'media',
      predicate: '(hover: hover) and (pointer: fine)',
    },
  },
  interactions: [
    {
      key: 'decorative-card', // SOURCE
      trigger: 'hover',
      conditions: ['fine-hover'],
      effects: [
        {
          selector: '.artwork', // TARGET
          keyframeEffect: {
            name: 'decorative-tilt',
            keyframes: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(2deg)' }],
          },
          duration: 250,
          easing: 'ease-out',
          fill: 'both',
        },
      ],
    },
  ],
};
```

**Result:** On a laptop with a mouse, hovering the card tilts the artwork inside it. On a phone, the interaction is never installed, so nothing is bound and nothing can get stuck mid-tilt.

## Hover

The pointer path for hover uses enter and leave; with the default accessibility upgrade, focus in and focus out follow the same playback behavior. For time effects, `triggerType` decides how those paired events map onto playback:

| `triggerType`         | On enter (pointer in, focus in)                                           | On leave (pointer out, focus out)                       |
| :-------------------- | :------------------------------------------------------------------------ | :------------------------------------------------------ |
| `alternate` (default) | Plays forward                                                             | Reverses from wherever it is                            |
| `repeat`              | Restarts from the first keyframe                                          | Cancels — the target snaps back to its unanimated state |
| `once`                | Plays once, then the listener is removed                                  | No leave listener is attached                           |
| `state`               | Plays, or resumes if paused; does nothing once the animation has finished | Pauses, keeping its progress                            |

`alternate` is the natural hover feel and the default: the effect builds up while the pointer arrives and unwinds when it leaves. It's fully interruption-safe — if the pointer leaves mid-animation, the direction simply flips from wherever it is, with no jumps or restarts. Give alternate effects `fill: 'both'` so the target holds the hovered look while the pointer stays, and holds the rest look after unwinding.

`repeat` replays an attention effect — a wiggle, a pulse — from the top on every enter. Use `fill: 'both'` for repeat effects as well, so the animation remains available for efficient replay. `state` turns hover into a play/pause control for a loop (`iterations: Infinity`): spinning while hovered, frozen when not. Once a finite `state` animation finishes, it is not restarted by later hover entries, so use an infinite iteration count when ongoing play/pause behavior is required.

> **Note:** With the default accessibility upgrade, `once` applies independently to pointer entry and keyboard focus — each gets its own one-shot listener. A pointer entry and a later focus can therefore each play the effect once. Do not use this mode as a global exactly-once business guard.

> **Warning:** Keep the hover hit area stable. If an animation moves, scales, or rotates the hovered element itself, the element can slide out from under the pointer, fire leave, reverse, and settle back under the pointer again — a flicker loop. Prefer a stationary source with a separate animated child; see [source and target resolving](/source-and-target-resolving) for the full treatment.

### Example: a product card that responds in layers

One hover, three targets: the card surface lifts, the photo zooms inside its frame, and a quick-add button reveals itself a beat later. The outer `.product-card-hit-area` stays still as the hover/focus source; the animated card surface is a child. All three effects rely on `alternate` being the default, and `selector` narrows effects to descendants of the keyed element.

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'product-card', // SOURCE — the stable outer hit-area
      trigger: 'hover',
      effects: [
        {
          key: 'product-card',
          selector: '.product-card', // TARGET — move the inner surface, not the hit-area
          keyframeEffect: {
            name: 'card-lift',
            keyframes: [
              { transform: 'translateY(0)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
              { transform: 'translateY(-6px)', boxShadow: '0 16px 32px rgba(0,0,0,0.14)' },
            ],
          },
          duration: 200,
          easing: 'ease-out',
          fill: 'both',
        },
        {
          key: 'product-card',
          selector: '.product-photo', // TARGET — narrow to the photo
          keyframeEffect: {
            name: 'photo-zoom',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }],
          },
          duration: 350,
          easing: 'ease-out',
          fill: 'both',
        },
        {
          key: 'quick-add', // TARGET — a separate keyed element
          keyframeEffect: {
            name: 'quick-add-reveal',
            keyframes: [
              { opacity: 0, transform: 'translateY(8px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          duration: 200,
          delay: 50,
          easing: 'ease-out',
          fill: 'both',
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="product-card">
  <div class="product-card-hit-area">
    <article class="product-card">
      <div class="photo-frame">
        <img class="product-photo" src="chair.jpg" alt="Lounge chair" />
      </div>
      <h3>Lounge chair</h3>
      <interact-element data-interact-key="quick-add">
        <button class="quick-add-btn">Add to cart</button>
      </interact-element>
    </article>
  </div>
</interact-element>
```

```css
.photo-frame {
  overflow: clip; /* keep the zooming photo inside its frame */
}
.quick-add-btn {
  opacity: 0; /* matches the reveal's first keyframe — see the warning below */
  transform: translateY(8px);
}
```

**Result:** Hovering anywhere on the card lifts it, zooms the photo, and fades the button in — three effects with independent timing, all from one trigger. Moving the pointer away runs everything smoothly in reverse.

> **Warning:** Match your CSS to the first keyframe. The reveal animation only exists after the first hover — before that, the button renders exactly as your stylesheet says. For reveal-style effects, the element's stylesheet state (here both `opacity` and `transform`) must equal the animation's first keyframe, or it can flash or jump when the first interaction begins. This is the pointer-trigger cousin of the flash of unstyled content (FOUC) covered in [entrance animations](/viewenter).

## Click

Click fires once per activation — there's no natural "opposite" event like leave — so `triggerType` decides what successive activations mean:

| `triggerType`         | On each activation (click, or Enter/Space with `activate`)                                      |
| :-------------------- | :---------------------------------------------------------------------------------------------- |
| `alternate` (default) | The first activation plays forward; each later one reverses direction — a toggle                |
| `repeat`              | Restarts from the first keyframe                                                                |
| `once`                | Plays once, then the listener is removed                                                        |
| `state`               | Plays; pauses while running, resumes while paused; does nothing once the animation has finished |

`alternate` turns any animation into an open/close toggle: click to play forward, click again to reverse — even mid-animation, where the direction just flips in place. `repeat` is for feedback bursts that confirm an action. `state` makes the click a play/pause button while the animation is unfinished; once a finite animation reaches its finished state, later clicks do not restart it. Use `iterations: Infinity` for a persistent play/pause control. If your element starts in the "open" pose and the first click should close it, add `reversed: true` to the effect to flip the initial direction.

Use `fill: 'both'` for alternate and repeat click effects so their endpoints remain applied and the animation can be replayed or reversed efficiently. For a once-only effect with a delay, `fill: 'backwards'` holds the first keyframe during that delay.

> **Warning:** As with hover, `once` installs independent pointer and keyboard listeners, so it is not a global exactly-once guard across input methods. The keyboard listener is itself one-shot, so pressing any key while the source is focused consumes it — even a key that is neither Enter nor Space. Do not use this mode as an exactly-once business guard.

### Example: a mobile menu toggle

The nav starts closed in CSS (matching the first keyframe), and each tap of the hamburger reverses the animation direction without application-level playback bookkeeping, since `alternate` is the default. A second effect rotates the hamburger icon in sync. Semantic open/closed state is still the application's responsibility, as noted after the example.

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'menu-button', // SOURCE
      trigger: 'click',
      effects: [
        {
          key: 'mobile-nav', // TARGET — the panel
          keyframeEffect: {
            name: 'nav-slide',
            keyframes: [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }],
          },
          duration: 300,
          easing: 'ease-out',
          fill: 'both',
        },
        {
          key: 'menu-button',
          selector: '.menu-icon', // TARGET — the icon inside the source
          keyframeEffect: {
            name: 'icon-turn',
            keyframes: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(90deg)' }],
          },
          duration: 300,
          easing: 'ease-out',
          fill: 'both',
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="menu-button">
  <button class="menu-button" aria-label="Menu" aria-controls="mobile-nav" aria-expanded="false">
    <span class="menu-icon" aria-hidden="true">☰</span>
  </button>
</interact-element>

<interact-element data-interact-key="mobile-nav">
  <nav class="mobile-nav" id="mobile-nav">…</nav>
</interact-element>
```

```css
.mobile-nav {
  transform: translateX(-100%); /* starts closed — matches the first keyframe */
}
```

**Result:** Tapping the button slides the nav in and turns the icon; tapping again runs both in reverse. Because the trigger is upgraded to `activate` by default — and the source is a native `<button>` — Enter and Space on the focused button do the same.

This config controls the visuals only — keeping `aria-expanded` and the closed panel's focusability in sync is still your application's job.

## State effects: toggle a look, not a timeline

State effects flip the target between its stylesheet look and a declared alternate look. Instead of keyframes, you declare the destination values, and a transition carries the element there:

```ts
// inside interactions[]
{
  key: 'pricing-card', // SOURCE
  trigger: 'hover',
  effects: [
    {
      key: 'pricing-card',
      selector: '.cta-button', // TARGET — hovering the card highlights its button
      transition: {
        duration: 250,
        easing: 'ease-out',
        styleProperties: [
          { name: 'background-color', value: '#111' },
          { name: 'color', value: '#fff' },
        ],
      },
    },
  ],
}
```

> **Note:** Property names in `styleProperties` are written in kebab-case here — `background-color`, not `backgroundColor` — because that is literally what the browser receives in the generated CSS rule. Both casings are accepted: Interact normalizes every state-effect property name to its CSS form before writing the rule (`getStateStyleProperties()` calls `toCSSPropertyName()`). Kebab-case is the idiomatic choice for state effects; camelCase is the idiomatic choice for `keyframeEffect` keyframes, because those are handed to the Web Animations API, which expects camelCase. Custom properties (`--accent-color`) are case-sensitive and pass through untouched.

This is `:hover` with superpowers: it can target a different element than the one being hovered, it can be switched by clicks as well as hovers, and its on/off behavior is configurable via `stateAction` on the effect:

| `stateAction`      | On hover / interest enter                          | On each click / activate                          |
| :----------------- | :------------------------------------------------- | :------------------------------------------------ |
| `toggle` (default) | Adds the state on enter and removes it on leave    | Flips the state on and off                        |
| `add`              | Adds the state on enter; leave does not remove it  | Adds the state; repeat activations are a no-op    |
| `remove`           | Removes the state on enter; leave does nothing     | Removes the state; repeat activations are a no-op |
| `clear`            | Removes every active state on the target, on enter | Removes every active state on the target          |

`remove` only has something stable to remove when it refers to the same `effectId` that was previously added. `clear` is not scoped to this effect — it empties the target's whole set of active states.

Under the hood, Interact generates the CSS for you: your `styleProperties` are applied while the state is on, and the transition rule lives on the target — so both directions animate, into the state and back out. States persist until something removes them. If you pre-generate the CSS, apply the reduced-motion guidance above. Custom properties (`--accent-color`) can be set as state values; register them with CSS `@property` if they must interpolate smoothly. If you need different timing per property, use `transitionProperties` instead of `transition` — each entry carries its own `duration`, `delay`, and `easing`.

> **Warning:** A state effect declared inline inside `interactions[]` is given a randomly generated `effectId` the first time the config is resolved, and that id is baked into the generated CSS selector (`[data-interact-effect~="…"]`). That is fine when `generate(config)` and `Interact.create(config)` run against the same in-memory config object, because the id is written back onto it. A server or build process and a separately evaluated client bundle are two different objects, so they mint two different ids and the pre-generated CSS never matches the state the client toggles. For deterministic pre-generated state CSS, declare the state effect in the top-level `effects` map and reference it by a stable `effectId`, as in the cart example below.

Because a state outlives the interaction that set it, several interactions can drive the same state. Declare the effect once in the top-level `effects` map, and reference it by `effectId`:

### Example: a cart drawer with separate open and close buttons

```ts
const config: InteractConfig = {
  effects: {
    'cart-open': {
      key: 'cart-panel', // TARGET
      transition: {
        duration: 400,
        easing: 'ease-in-out',
        styleProperties: [{ name: 'transform', value: 'translateX(0)' }],
      },
    },
  },
  interactions: [
    {
      key: 'open-cart-button', // SOURCE
      trigger: 'click',
      effects: [{ effectId: 'cart-open', stateAction: 'add' }], // opening an open cart is a no-op
    },
    {
      key: 'close-cart-button', // SOURCE
      trigger: 'click',
      effects: [{ effectId: 'cart-open', stateAction: 'remove' }],
    },
  ],
};
```

```html
<interact-element data-interact-key="open-cart-button">
  <button>Cart (2)</button>
</interact-element>

<interact-element data-interact-key="cart-panel">
  <aside class="cart-panel">
    <interact-element data-interact-key="close-cart-button">
      <button aria-label="Close cart">×</button>
    </interact-element>
    …
  </aside>
</interact-element>
```

```css
.cart-panel {
  position: fixed;
  inset: 0 0 0 auto;
  transform: translateX(100%); /* the "off" look — off-screen to the right */
}
```

**Result:** The cart button slides the panel in; the × slides it out. Because `add` and `remove` are idempotent, mashing either button never gets the drawer into a broken half-state — the two interactions just converge on the same shared cart-open state.

## Presets from `@wix/motion-presets`

For pointer feedback, reach for ongoing presets from [`@wix/motion-presets`](https://github.com/wix/interact/tree/master/packages/motion-presets) that return to a neutral pose: Bounce, Breathe, Cross, Flash, Flip, Fold, Jello, Poke, Pulse, Rubber, Spin, Swing, and Wiggle. They pair naturally with `triggerType: 'repeat'` for a fresh burst per interaction. For play/pause looping with `triggerType: 'state'`, also set `iterations: Infinity`.

```ts
// inside interactions[]
{
  key: 'notification-bell', // SOURCE
  trigger: 'hover',
  effects: [
    {
      key: 'notification-bell',
      selector: '.bell-icon', // TARGET — keep the hover source stationary
      triggerType: 'repeat',
      namedEffect: { type: 'Wiggle' },
      duration: 500,
      easing: 'ease-in-out',
      fill: 'both',
    },
  ],
}
```

The entrance presets (FadeIn, SlideIn, ExpandIn, …) work here too: after registering them with `Interact.registerEffects(...)`, combine them with `triggerType: 'alternate'` and `fill: 'both'` to create reveal toggles for tooltips, menus, and overlays. Remember to match the target's stylesheet state to the hidden first keyframe, as covered above.

## See also

- [What is a trigger?](/what-is-a-trigger)
- [Transition effects](/transition-effects)
- [Source and target resolving](/source-and-target-resolving)
- [Entrance animations (`viewEnter`)](/viewenter)
- [Understanding conditions](/understanding-conditions)

# Scroll-driven animations (`viewProgress`)

Scroll-driven animations tie an animation's progress directly to the scroll position, rather than to elapsed time. As you scroll, the animation advances; as you scroll back, it rewinds; when you stop, it holds. This is the technique behind parallax layers, reading-progress bars, reveal-on-scroll galleries, pinned "sticky" sections, and full scrolly-telling experiences.

Once the domain of heavy JavaScript scroll listeners, this class of effect has become a first-class web platform feature and a growing design trend. The browser can now drive these animations natively — off the main thread, without a single scroll event handler. For the wider platform picture, see [MDN: CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations).

## How it works: `ViewTimeline`

Interact's `viewProgress` trigger is built on the native [`ViewTimeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-timeline) — a timeline whose progress is defined by a subject element's position as it passes through its scroll container. `ViewTimeline` is supported across most modern browsers; where it isn't available natively, Interact ships a built-in polyfill, so you can author the same configuration everywhere and let the library pick the native path when it can.

### A continuous trigger, not an event trigger

This is the key mental shift from the time-based triggers (`hover`, `click`, `viewEnter`). Those are **event triggers**: something happens, and an animation plays over a fixed `duration`. `viewProgress` is a **continuous trigger**: there is no duration and nothing "plays." Instead, the scroll position continuously drives — _scrubs_ — the effect's progress from `0` to `1`.

- When the user isn't scrolling, the effect is **static** — frozen at whatever progress the current scroll position maps to.
- Scrolling forward advances the effect; scrolling back reverses it.

Because the progress is scrubbed rather than played, `viewProgress` works with the animation payloads that expose a progress timeline — `keyframeEffect`, `namedEffect`, and `customEffect` — but it **cannot** be used with state effects (`transition` / `transitionProperties`). Those describe a discrete state change over a time-based transition, which has no meaning on a scrubbed timeline.

## Trigger parameters

`viewProgress` takes no `params`. There is no threshold, hit area, or event to configure — the interaction is just a key and the trigger name, and everything tunable lives on the effects.

```ts
// inside interactions[]
{
  key: 'article',
  trigger: 'viewProgress',
  effects: [
    /* … */
  ],
}
```

## Effect options

The scroll window that maps to progress `0 → 1` is defined **per effect** with `rangeStart` and `rangeEnd`. Each is a named range plus an offset:

```ts
// inside an effect
rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
```

Every effect also carries exactly one animation payload — `keyframeEffect`, `namedEffect`, or `customEffect` — plus the options below.

| Option       | Type                                                  | Default                                                       | Description                                                                                                      |
| :----------- | :---------------------------------------------------- | :------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------- |
| `rangeStart` | `RangeOffset`                                         | `{ name: 'cover', offset: { unit: 'percentage', value: 0 } }` | The scroll position that maps to progress `0`.                                                                   |
| `rangeEnd`   | `RangeOffset`                                         | Same `name` as `rangeStart`, offset `100%`                    | The scroll position that maps to progress `1`.                                                                   |
| `easing`     | `string`                                              | `'linear'`                                                    | Easing applied across the range. Keep `'linear'` unless you want the motion to lag or lead the scroll.           |
| `fill`       | `'none'` \| `'forwards'` \| `'backwards'` \| `'both'` | `'none'`                                                      | How the target looks outside the range. Use `'both'` — see below.                                                |
| `iterations` | `number`                                              | `1`                                                           | How many times the effect repeats across the range. Must be finite; `Infinity` is rejected on a scrubbed effect. |
| `alternate`  | `boolean`                                             | `false`                                                       | With `iterations` above `1`, every other pass runs backwards.                                                    |
| `reversed`   | `boolean`                                             | `false`                                                       | Runs the keyframes from last to first.                                                                           |
| `composite`  | `'replace'` \| `'add'` \| `'accumulate'`              | `'replace'`                                                   | How this effect's values combine with the target's underlying values.                                            |

### Range names

The `name` selects a phase of the subject's pass through the scroll container:

| Range name       | Meaning                                                                                                                                                                                                                      |
| :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cover`          | The full pass, from the first pixel entering the viewport to the last pixel leaving.                                                                                                                                         |
| `entry`          | While the element is entering the viewport — from its first pixel appearing until it is fully in view, or, for elements taller than the viewport, until it fully covers the viewport.                                        |
| `contain`        | While the element is fully inside the viewport — or, for elements taller than the viewport, while it fully covers it. This is the phase a `position: sticky` child stays pinned, which is why it pairs with scrolly-telling. |
| `exit`           | While the element is leaving the viewport — from the moment it stops being fully in view (or stops fully covering it) until its last pixel disappears.                                                                       |
| `entry-crossing` | Extends `entry` for elements taller than the viewport, running on until the element's trailing edge has entered the viewport.                                                                                                |
| `exit-crossing`  | Extends `exit` for elements taller than the viewport, starting from where the element's leading edge left the viewport.                                                                                                      |

The `offset` shifts a boundary within that phase — `{ unit: 'percentage', value: 0–100 }` for relative positions, or absolute lengths like `{ unit: 'px', value: 200 }` (`px`, `em`, `rem`, `vh`, `vw`, `vmin`, and `vmax` are all accepted). These compile down to the CSS `animation-range` property; see [MDN: `animation-range`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-range) for the platform-level reference.

> **Note:** `rangeEnd.name` falls back to `rangeStart.name` when you omit it, so setting `rangeStart: { name: 'entry', … }` and giving `rangeEnd` only an offset keeps both boundaries inside the `entry` phase.

> **Note:** On `rangeEnd`, an absolute-length offset is measured from the **end** of the named range rather than from its start as plain CSS `animation-range` would. Percentage offsets behave identically in both models.

### `triggerType` and `stateAction` do not apply

`triggerType` belongs to time effects and `stateAction` to state effects. A `viewProgress` effect is a scrub effect and has neither: scroll position is the only thing that advances it, so there is no playback to start once, repeat, alternate, or toggle, and no state to add, remove, or clear. `duration` and `delay` are likewise unavailable — the range replaces them.

### Hold the effect in place with `fill: 'both'`

Notice that every scroll-driven effect in this chapter sets `fill: 'both'` — and as a rule, you should too. `fill` maps to the CSS [`animation-fill-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode), which decides how the target looks _outside_ the active range: before `rangeStart` and after `rangeEnd`.

With the default, `fill: 'none'`, the effect only applies while the scroll position is inside the range; on either side the target snaps back to its un-animated state. For a scrubbed animation that almost always looks wrong — the element would pop into its start value as the range begins and pop back out once it ends. `fill: 'both'` instead pins the first keyframe before the range starts and holds the last keyframe after it finishes, so the target stays exactly where the scroll left it at either boundary. That continuity is what you want in virtually every `viewProgress` effect, so reach for `fill: 'both'` by default.

## Caveats

### `overflow: hidden` breaks the timeline

> **Critical:** `overflow: hidden` on **any** element between the source and its scroll container silently breaks the timeline.

`overflow: hidden` establishes a new scroll container. When one appears between your source element and the scroll container the timeline expected, the `ViewTimeline` no longer resolves the way you intended and the animation won't track scroll correctly. Nothing throws and nothing warns — the effect simply sits at a fixed progress, which is why this is the first thing to check when a scroll-driven animation "does nothing."

The fix is to use [`overflow: clip`](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow) instead. It clips overflowing content visually — just like `hidden` — but does **not** create a new scroll container, so the scroll ancestry the timeline depends on stays intact.

```css
/* ❌ Breaks the ViewTimeline */
.wrapper {
  overflow: hidden;
}

/* ✅ Clips visually without affecting scroll ancestry */
.wrapper {
  overflow: clip;
}
```

Audit every ancestor between your `viewProgress` source and its scroll container.

> **Tip:** Using Tailwind? Replace every `overflow-hidden` class with `overflow-clip`.

### Sequences have no meaning on a scrubbed timeline

A sequence distributes _time-based_ delay offsets across its effects, so it has nothing to work with on a scroll-scrubbed timeline — a `viewProgress` interaction accepts an `effects` array but no `sequences`. To stagger or coordinate multiple items, give each effect its own `rangeStart` / `rangeEnd` window, or drive a whole collection at once with `listContainer`.

## Examples

### Example: a reading-progress bar with a live percentage

A single `viewProgress` interaction can drive several effects from the same scroll position. Here the article's scroll fills a progress bar (`keyframeEffect`) and, above it, updates a label to the current percentage (`customEffect`):

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'article', // SOURCE — the article's scroll position drives everything
      trigger: 'viewProgress',
      effects: [
        {
          key: 'progress-bar', // TARGET — fills from empty to full
          keyframeEffect: {
            name: 'fill-bar',
            keyframes: [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
          easing: 'linear',
          fill: 'both',
        },
        {
          key: 'progress-label', // TARGET — the text above the bar
          customEffect: (element, progress) => {
            element.textContent = `${Math.round(progress * 100)}%`;
          },
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

```html
<header class="reading-indicator">
  <interact-element data-interact-key="progress-label">
    <span class="progress-label">0%</span>
  </interact-element>
  <interact-element data-interact-key="progress-bar">
    <div class="progress-bar"></div>
  </interact-element>
</header>

<interact-element data-interact-key="article">
  <article class="article">... long-form content ...</article>
</interact-element>
```

```css
.reading-indicator {
  position: fixed;
  inset: 0 0 auto 0;
}
.progress-bar {
  height: 4px;
  transform: scaleX(0);
  transform-origin: left; /* so scaleX fills left → right */
}
```

**Result:** As the article scrolls through the viewport, the bar fills and the label counts up in lockstep — both scrubbed by the same scroll position. A `customEffect` receives `(element, progress)` where `progress` runs `0 → 1`, which is ideal for anything CSS keyframes can't express (text, SVG attributes, canvas, WebGL).

## Working with scroll presets

`@wix/motion-presets` ships ready-made scroll effects — every preset whose name ends in `Scroll` (`FadeScroll`, `ParallaxScroll`, `RevealScroll`, `GrowScroll`, `SlideScroll`, `BlurScroll`, and more). Use them via `namedEffect`, just like any other named effect.

### Scroll presets require `range`

Scroll presets have one required option: **`range`**, which declares how the animation relates to the element's **idle state** — its natural, at-rest layout and styling:

- **`'in'`** — the animation **ends** at the idle state. The element animates _into_ its natural look as it enters.
- **`'out'`** — the animation **starts** from the idle state. The element animates _away_ from its natural look as it exits.
- **`'continuous'`** — the animation **passes through** the idle state, animating from one side, through the natural look, and out the other.

Omit `range` and the preset falls back to its own default rather than the one you meant; supply a value outside these three and it is invalid. `@wix/interact-validate` flags both cases, and prefers `'continuous'` when you are unsure.

The same preset produces different behaviour depending on `range`. Fading in on entry:

```ts
// inside interactions[] — 'in': fades in as the panel enters, settling at its natural state
{
  key: 'panel',
  trigger: 'viewProgress',
  effects: [
    {
      namedEffect: { type: 'FadeScroll', range: 'in' },
      rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 0 } },
      rangeEnd: { name: 'entry', offset: { unit: 'percentage', value: 100 } },
      easing: 'linear',
      fill: 'both',
    },
  ],
}
```

…versus the same preset fading out on exit:

```ts
// inside interactions[] — 'out': starts at the natural state and fades away as the panel leaves
{
  key: 'panel',
  trigger: 'viewProgress',
  effects: [
    {
      namedEffect: { type: 'FadeScroll', range: 'out' },
      rangeStart: { name: 'exit', offset: { unit: 'percentage', value: 0 } },
      rangeEnd: { name: 'exit', offset: { unit: 'percentage', value: 100 } },
      easing: 'linear',
      fill: 'both',
    },
  ],
}
```

**Result:** Scrolling the first panel into view fades it up from transparent to its normal appearance, and it then stays put. The second panel is fully visible while it sits in the viewport and only fades away as it scrolls off the top. Same preset, same scroll, opposite halves of the pass.

> **Warning:** Don't guess a preset's other options — omit anything you aren't sure of and rely on its defaults. See [named effects](/named-effects).

## Advanced pattern: scrolly-telling with lists and `position: sticky`

Scrolly-telling puts the story on the scrollbar. Rather than the page merely revealing content as it moves past, the scroll position itself becomes the timeline of a narrative — copy, imagery, and motion are choreographed to advance exactly as fast as the reader scrolls. Because the reader is in control, the result feels physical and responsive: stop scrolling and the scene holds; scroll back and it plays in reverse. This is where scroll-driven animation is at its most expressive, and it shines brightest when `viewProgress` is paired with two companions — [`position: sticky`](https://developer.mozilla.org/en-US/docs/Web/CSS/position), which pins a scene in place while the surrounding page keeps scrolling, and [lists](/what-is-a-list), which let a single interaction animate a whole collection of items in sync.

The canonical demonstration is turning vertical scroll into horizontal motion — a **horizontal-scroll gallery**. It combines three ingredients: a **tall wrapper** that provides the scroll distance, a **`position: sticky`** child that pins to the viewport while that wrapper scrolls past, and scroll-driven effects that run during the pinned (`contain`) phase.

The layout works like this:

- **`h-scroll`** — a tall wrapper (e.g. `height: 400vh`). Its height _is_ the horizontal scroll distance, and it's the `ViewTimeline` source.
- **`.sticky-viewport`** — a `position: sticky; top: 0; height: 100vh` child that stays pinned while the wrapper scrolls. It uses **`overflow: clip`** (never `hidden`) to hide the off-screen cards without breaking the timeline.
- **`.track`** — a horizontal flex row of cards. We translate it along X as the wrapper scrolls.

A single **`viewProgress`** interaction on `h-scroll` drives everything — its scroll timeline scrubs two effects at once:

1. The first effect targets the whole **track** and translates it along X during the pinned `contain` phase — this is the horizontal scroll itself.
2. The second is a **list effect**: `listContainer: '.track'` applies it to every card and `selector: '.card-media'` narrows it to the media inside each one, giving them a gentle counter-parallax drift as the track pans. Because it animates the cards' inner media — a different target from the track — it never competes with the pan over the same property. See [using lists](/using-lists) for more on `listContainer`.

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'h-scroll', // SOURCE — tall wrapper, the single ViewTimeline source
      trigger: 'viewProgress',
      effects: [
        // 1. Pan the whole track horizontally as the wrapper scrolls.
        {
          key: 'h-track', // TARGET — the flex row of cards
          keyframeEffect: {
            name: 'horizontal-pan',
            keyframes: [
              { transform: 'translateX(0)' },
              // move the track left until its right edge meets the viewport's
              { transform: 'translateX(calc(-100% + 100vw))' },
            ],
          },
          // animate only while the sticky section is pinned (fully contained)
          rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 0 } },
          rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 100 } },
          easing: 'linear',
          fill: 'both',
        },
        // 2. List effect: counter-parallax the media inside every card.
        {
          key: 'h-track', // TARGET
          listContainer: '.track', // every card is a list item…
          selector: '.card-media', // …animate the media inside each one
          keyframeEffect: {
            name: 'card-parallax',
            // the media is scaled up so its drift never exposes an edge
            keyframes: [
              { transform: 'translateX(-10%) scale(1.25)' },
              { transform: 'translateX(10%) scale(1.25)' },
            ],
          },
          rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 0 } },
          rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 100 } },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="h-scroll">
  <div class="h-scroll">
    <div class="sticky-viewport">
      <interact-element data-interact-key="h-track">
        <ul class="track">
          <li class="card">
            <div class="card-media"></div>
            <h3 class="card-title">One</h3>
          </li>
          <li class="card">
            <div class="card-media"></div>
            <h3 class="card-title">Two</h3>
          </li>
          <li class="card">
            <div class="card-media"></div>
            <h3 class="card-title">Three</h3>
          </li>
          <li class="card">
            <div class="card-media"></div>
            <h3 class="card-title">Four</h3>
          </li>
          <li class="card">
            <div class="card-media"></div>
            <h3 class="card-title">Five</h3>
          </li>
        </ul>
      </interact-element>
    </div>
  </div>
</interact-element>
```

```css
.h-scroll {
  height: 400vh; /* scroll distance ≈ 3 extra viewport-heights of horizontal travel */
}
.sticky-viewport {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: clip; /* NOT hidden — see the ViewTimeline caveat above */
  display: flex;
  align-items: center;
}
.track {
  display: flex;
  gap: 2rem;
  padding-inline: 2rem;
  margin: 0;
  list-style: none;
  will-change: transform;
}
.card {
  position: relative;
  flex: 0 0 80vw; /* each card fills most of the viewport width */
  height: 70vh;
  overflow: clip; /* keep the oversized, drifting media inside the card */
}
.card-media {
  width: 100%;
  height: 100%;
  will-change: transform;
}
```

**Result:** As the user scrolls, the section pins to the viewport and the vertical scroll is scrubbed into the track's horizontal movement — the cards glide sideways until the last one lands. At the same time, the media inside every card drifts in the opposite direction, adding a subtle sense of depth. Both effects are driven by the same scroll position, and because the pan targets the track while the parallax targets the cards' media, they animate independently without stepping on each other.

> **Tip:** The taller `.h-scroll` is relative to the viewport, the longer and gentler the horizontal scroll. Tune `height` to trade scroll distance for pacing.

## See also

- [What is a trigger?](/what-is-a-trigger) — how triggers fit into a config
- [`pointerMove`](/pointermove) — the other continuous trigger
- [Time and scrub effects](/time-and-scrub-effects) — why scrub effects have no `duration`
- [Named effects](/named-effects) — the full preset inventory and their options
- [Using lists](/using-lists) — driving a whole collection from one interaction

# Pointer-driven animations (`pointerMove`)

`pointerMove` drives an effect continuously from the pointer's position. Reach for it when the animation has to react the instant the pointer moves: card tilts, cursor followers, spotlights, magnetic buttons, and pointer parallax.

Like [scroll-driven animations](/viewprogress), `pointerMove` is a continuous trigger — the pointer position sets the effect's progress directly, so there is no duration to configure. Unlike every other trigger, its progress is two-dimensional.

> **Warning:** `pointerMove` effects are skipped when reduced-motion mode is enabled.

## How it works

Interact attaches a passive `pointermove` listener to the hit area — either the source element or the viewport — and recomputes progress once per animation frame. `(0, 0)` is the top-left corner of the hit area and `(1, 1)` is its bottom-right corner, and both coordinates are clamped to the `0–1` range.

There is no pointer timeline in CSS, so pointer effects are always driven from JavaScript rather than handed off to the browser's compositor like a scroll-driven `ViewTimeline` can be.

The progress passed to an effect is an object, not a single number:

```ts
{
  x: number;                    // horizontal progress, clamped to 0–1
  y: number;                    // vertical progress, clamped to 0–1
  v?: { x: number; y: number }; // pointer velocity per axis, signed
  active?: boolean;             // whether the pointer is inside the hit area
}
```

A `namedEffect` or a `customEffect` receives the whole object. A `keyframeEffect` interpolates a single number, so it uses only the axis selected by the trigger's `axis` param.

## Trigger parameters

These go in `params` on the `pointerMove` interaction. This is the canonical reference for both — other pages link here.

| Name      | Type                 | Default  | Description                                                              |
| :-------- | :------------------- | :------- | :----------------------------------------------------------------------- |
| `hitArea` | `'root'` \| `'self'` | `'root'` | Where pointer movement is tracked and what progress is measured against. |
| `axis`    | `'x'` \| `'y'`       | `'y'`    | Which axis a `keyframeEffect` maps onto its `0–1` progress.              |

### `hitArea`

- `'self'` tracks the pointer inside the **source element's** box. Progress is measured against that element's width and height, and `active` is `false` while the pointer is outside it. The source has to receive pointer events, so never give it `pointer-events: none`.
- `'root'` tracks the pointer anywhere in the **viewport**, and progress is measured against the viewport's width and height. It is also the effective default: when `hitArea` is omitted, Interact passes no root element to the pointer tracker and the tracker falls back to the viewport.

`'root'` never means "the nearest ancestor" or "the element the interaction is keyed to". The only way to scope tracking to the source element is `hitArea: 'self'`.

> **Tip:** Set `hitArea` explicitly even when you want the default, so the tracked area is obvious to the next reader.

### `axis`

- `'x'` maps horizontal position to progress, `'y'` maps vertical position. Omitting `axis` gives `'y'`.
- `axis` only affects a `keyframeEffect`. A `namedEffect` and a `customEffect` receive both coordinates and ignore it.
- To drive keyframes from both axes, declare two interactions — one per axis — and combine their output with `composite`. See [the two-axis example](#example-composing-two-keyframe-effects).

## Effect-level options

Pointer effects are scrub effects, so they take the usual scrub fields (`easing`, `fill`, `iterations`, `alternate`, `reversed`, `composite`) plus four options that only mean something under `pointerMove`. All four are set on the **effect**, not in the trigger `params`.

| Name                 | Type                                                              | Default    | Description                                                                                        |
| :------------------- | :---------------------------------------------------------------- | :--------- | :------------------------------------------------------------------------------------------------- |
| `centeredToTarget`   | `boolean`                                                         | `false`    | Remap progress so that `(0.5, 0.5)` lands on the target's center instead of the hit area's center. |
| `transitionDuration` | `number`                                                          | `0`        | Milliseconds the effect takes to catch up with the pointer. `0` follows the pointer immediately.   |
| `transitionDelay`    | `number`                                                          | `0`        | Milliseconds to wait before the catch-up transition starts.                                        |
| `transitionEasing`   | `'linear'`, `'hardBackOut'`, `'easeOut'`, `'elastic'`, `'bounce'` | `'linear'` | How that catch-up transition progresses.                                                           |

`centeredToTarget: false` measures progress against the hit area alone, so `0.5` on each axis is the center of the source element or of the viewport. `centeredToTarget: true` keeps the ends of the range on the hit area's edges but pins the midpoint to the target's center — which is what you want when the source is a large hit area and the target is a smaller element sitting off-center inside it.

Short `transitionDuration` values of `100–300` soften movement; larger values produce noticeable, deliberate lag.

> **Note:** `centeredToTarget` and the `transition*` smoothing options apply to `namedEffect` and `customEffect`, which receive the full two-dimensional progress. A `keyframeEffect` maps one axis linearly across the hit area and is neither re-centered nor smoothed.

## Caveats

A **flash of unstyled content (FOUC)** can appear when the target first renders in its base style and only snaps into place once the pointer interaction starts. For a `keyframeEffect`, set `fill: 'both'` and give the target a base style that matches the effect's first keyframe, so it never jumps between states.

Jitter happens when an effect moves its own hit area: the target shifts out from under the pointer, the pointer leaves the hit area, the effect resets, and the cycle repeats.

> **Critical:** Never use the same element as both source and target with `hitArea: 'self'` when the effect changes size or position (`transform: translate(…)`, `scale(…)`). Keep the hit area stationary and animate a child element or a separate target instead.

`pointerMove` also has nothing to track on a touch-only device. Gate the interaction behind a `(hover: hover)` media condition so it never registers there, and fall back to `viewEnter` or `viewProgress` if the page needs motion on touch.

## Examples

### Example: 3D tilt on a card

The card is the hit area, and the visual inside it is the target — so the tilt never moves the box being tracked.

```html
<interact-element data-interact-key="card-hit-area">
  <div class="card">
    <interact-element data-interact-key="card-visual">
      <article class="card__visual">
        <h3>Interact</h3>
        <p>Declarative interactions on the Web Animations API.</p>
      </article>
    </interact-element>
  </div>
</interact-element>
```

```css
.card {
  perspective: 800px;
}

.card__visual {
  transform-style: preserve-3d;
  will-change: transform;
}
```

```ts
const config: InteractConfig = {
  conditions: {
    'can-hover': {
      type: 'media',
      predicate: '(hover: hover)',
    },
  },
  interactions: [
    {
      key: 'card-hit-area', // SOURCE
      trigger: 'pointerMove',
      conditions: ['can-hover'],
      params: {
        hitArea: 'self',
      },
      effects: [
        {
          key: 'card-visual', // TARGET
          namedEffect: {
            type: 'Tilt3DMouse',
          },
          centeredToTarget: true,
          transitionDuration: 160,
          transitionEasing: 'easeOut',
        },
      ],
    },
  ],
};
```

**Result:** the card leans toward the pointer as it crosses the card, lying flat when the pointer is over its center and tilting further toward the corners. The tilt trails the pointer by about a sixth of a second, so the motion reads as weight rather than as a jump. On touch-only devices the interaction never registers and the card stays flat.

### Example: composing two keyframe effects

A `keyframeEffect` follows one axis. To respond to both, declare two interactions on the same source and target pair and combine their transforms with `composite: 'add'`.

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'card-hit-area', // SOURCE
      trigger: 'pointerMove',
      params: {
        hitArea: 'self',
        axis: 'x',
      },
      effects: [
        {
          key: 'card-visual', // TARGET
          effectId: 'tilt-x',
        },
      ],
    },
    {
      key: 'card-hit-area', // SOURCE
      trigger: 'pointerMove',
      params: {
        hitArea: 'self',
        axis: 'y',
      },
      effects: [
        {
          key: 'card-visual', // TARGET
          effectId: 'tilt-y',
        },
      ],
    },
  ],
  effects: {
    'tilt-x': {
      keyframeEffect: {
        name: 'tilt-x',
        keyframes: [{ transform: 'rotateY(-12deg)' }, { transform: 'rotateY(12deg)' }],
      },
      easing: 'linear',
      composite: 'add',
      fill: 'both',
    },
    'tilt-y': {
      keyframeEffect: {
        name: 'tilt-y',
        keyframes: [{ transform: 'rotateX(12deg)' }, { transform: 'rotateX(-12deg)' }],
      },
      easing: 'linear',
      composite: 'add',
      fill: 'both',
    },
  },
};
```

**Result:** the card rotates around the vertical axis as the pointer moves left to right and around the horizontal axis as it moves top to bottom. Because both effects use `composite: 'add'`, the two rotations combine into one transform instead of overwriting each other, and `fill: 'both'` holds the last computed angle once the pointer leaves.

### Example: pointer spotlight with a custom effect

Use a `customEffect` when the behavior depends on data keyframes cannot express — pointer velocity, for instance — or when it has to drive something other than CSS, such as a canvas or an SVG.

```ts
const config: InteractConfig = {
  conditions: {
    'can-hover': {
      type: 'media',
      predicate: '(hover: hover)',
    },
  },
  interactions: [
    {
      key: 'spotlight-area', // SOURCE
      trigger: 'pointerMove',
      conditions: ['can-hover'],
      params: {
        hitArea: 'self',
      },
      effects: [
        {
          key: 'spotlight-visual', // TARGET
          customEffect: (element, progress) => {
            const x = progress.x * 100;
            const y = progress.y * 100;
            const velocity = Math.hypot(progress.v?.x ?? 0, progress.v?.y ?? 0);
            const radius = 120 + Math.min(velocity / 40, 1) * 80;

            element.style.backgroundImage =
              `radial-gradient(circle ${radius}px at ${x}% ${y}%, ` +
              `rgb(255 255 255 / 0.45), transparent 70%)`;
          },
          centeredToTarget: true,
        },
      ],
    },
  ],
};
```

**Result:** a soft light follows the pointer across the section and swells as the pointer moves faster, settling back to its resting size when the pointer slows. The media condition keeps the interaction from registering on touch-only devices, where there is no pointer to follow.

## Working with presets

For two-dimensional pointer animations, prefer a registered mouse **named effect** over hand-written keyframes. Pointer timelines do not exist in CSS, and composing both axes accurately from separate keyframe animations is fiddly, so mouse named effects update the target's styles from JavaScript and emit their own CSS transition for the smoothing options.

`@wix/motion-presets` ships a `mouse` library with `AiryMouse`, `BlobMouse`, `BlurMouse`, `BounceMouse`, `CustomMouse`, `ScaleMouse`, `SkewMouse`, `SpinMouse`, `SwivelMouse`, `Tilt3DMouse`, `Track3DMouse`, and `TrackMouse`. Register them once, then name one in `namedEffect.type`:

```ts
import { Interact } from '@wix/interact';
import * as presets from '@wix/motion-presets';

Interact.registerEffects(presets);
```

## See also

- [Scroll-driven animations (`viewProgress`)](/viewprogress) — the other continuous trigger
- [Named effects](/named-effects) — registering and configuring `namedEffect`
- [Custom effects](/custom-effects) — writing a `customEffect` callback
- [Understanding conditions](/understanding-conditions) — gating an interaction behind `(hover: hover)`
- [`@wix/motion-presets`](https://github.com/wix/interact/tree/master/packages/motion-presets) — the full preset inventory

# Chaining animations (`animationEnd`)

`animationEnd` starts an effect or a sequence once another animation has finished. Reach for it whenever one animation should follow another: a panel that settles before its label fades in, a staged hero, a multi-step reveal.

It replaces hand-calculated delays. The chain stays correct when an earlier animation's duration changes, because each step waits for the real end of the previous one rather than for a number you wrote down.

## How it works

The link between the two animations is an `effectId`. Interact attaches an `animationend` listener to the **source element** — the element named by the interaction's `key` — and plays this interaction's effects when that event fires.

If the awaited `effectId` resolves in the top-level `effects` registry to a CSS-backed time effect, the handler also filters the event: it ignores an `animationend` whose animation name or effect id does not belong to that effect, and ignores events while that animation is still running.

## Trigger parameters

| Name       | Type     | Default    | Description                                                    |
| :--------- | :------- | :--------- | :------------------------------------------------------------- |
| `effectId` | `string` | _required_ | Key of the awaited effect in the top-level `effects` registry. |

`effectId` has to name an effect declared in the top-level `effects` registry. [`@wix/interact-validate`](https://github.com/wix/interact/tree/master/packages/interact-validate) reports `ANIMATION_END_EFFECT_NOT_FOUND` when it does not.

The interaction's `key` has to identify the element on which the awaited effect **runs**, which is not always the element that triggered it. The effects started by `animationEnd` can then target that same element or a different one.

## Effect-level options

`animationEnd` starts time effects, so the effects in its `effects` array take the usual time-effect options — `duration`, `delay`, `easing`, `fill`, `iterations`, `alternate`, `reversed`, `composite`, and `triggerType`. See [time and scrub effects](/time-and-scrub-effects).

Give a started effect its own `effectId` if you want a further step to wait for it. That is all chaining is: each link is a new `animationEnd` interaction keyed to the element the previous step animated.

## Caveats

Only a time effect can anchor a chain, and only through an `effectId`. A scrub effect is driven by scroll or pointer position rather than played to an end, and a state effect renders as a CSS transition, so neither produces the `animationend` the handler listens for.

The filtering described above depends on the awaited effect being resolvable to a CSS animation. Back it with a `keyframeEffect` or a `namedEffect` that renders as CSS; if the handler cannot resolve one, any `animationend` reaching the source starts the chain — including events that bubble up from descendants. The same applies to a chain that starts a sequence, since the handler receives the pre-built sequence instead of a resolvable source effect.

> **Warning:** A canceled or interrupted animation never fires `animationend`, so a chain that depends on it silently stops. Do not chain from an effect that a competing interaction can cancel mid-flight.

> **Warning:** Never wait for an effect produced by the same `animationEnd` interaction — it can never start. Circular chains, where two effects each wait for the other, never start either.

## Examples

### Example: reveal a panel then its label

```html
<interact-element data-interact-key="panel">
  <section class="panel">
    <h2>Pricing</h2>
    <interact-element data-interact-key="panel-label">
      <p class="panel__label">Updated monthly</p>
    </interact-element>
  </section>
</interact-element>
```

```css
.panel {
  opacity: 0;
}

.panel__label {
  opacity: 0;
}
```

```ts
const config: InteractConfig = {
  effects: {
    'panel-enter': {
      keyframeEffect: {
        name: 'panel-enter-animation',
        keyframes: [
          { opacity: 0, transform: 'translateY(24px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
      },
      duration: 400,
      easing: 'ease-out',
      fill: 'both',
      triggerType: 'once',
    },
    'label-enter': {
      keyframeEffect: {
        name: 'label-enter-animation',
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
      },
      duration: 250,
      fill: 'both',
    },
  },
  interactions: [
    {
      key: 'panel',
      trigger: 'viewEnter',
      effects: [
        {
          key: 'panel',
          effectId: 'panel-enter',
        },
      ],
    },
    {
      // Keyed to the element that "panel-enter" animates.
      key: 'panel', // SOURCE
      trigger: 'animationEnd',
      params: {
        effectId: 'panel-enter',
      },
      effects: [
        {
          key: 'panel-label', // TARGET
          effectId: 'label-enter',
        },
      ],
    },
  ],
};
```

**Result:** the panel rises and fades in as it scrolls into view. Only once that 400 ms animation has finished does the label underneath begin its own 250 ms fade, so the visitor reads the two steps as one deliberate sequence instead of two animations competing for attention. Because `panel-enter` lives in the `effects` registry, other animations finishing on the panel are ignored.

### Example: adding a third step

Chain further by keying the next `animationEnd` interaction to the element the previous step animated and waiting on that step's `effectId`.

```ts
// inside interactions[]
{
  key: 'panel-label', // SOURCE
  trigger: 'animationEnd',
  params: {
    effectId: 'label-enter',
  },
  effects: [
    {
      key: 'panel-cta', // TARGET
      effectId: 'cta-enter',
    },
  ],
}
```

**Result:** the call to action appears last, after the label has finished fading in — a three-step reveal with no delays written by hand. Change the panel's duration and every later step still lands in the right order.

## Working with sequences

`animationEnd` can start a **sequence** as well as an effect. Declare the sequence on the interaction as usual and it plays when the awaited animation ends, which is the tidiest way to hang a staggered group off the end of a single entrance animation.

Sequences started this way are not filtered, since the handler receives the pre-built sequence rather than a resolvable source effect. Key the interaction to an element that only runs the animation you mean to wait for.

## See also

- [What is a trigger?](/what-is-a-trigger) — the full trigger list and how triggers are chosen
- [Entrance animations (`viewEnter`)](/viewenter) — the usual first link in a chain
- [Time and scrub effects](/time-and-scrub-effects) — the options a chained effect accepts
- [Using sequences](/using-sequences) — staggering a group instead of chaining one at a time
- [Effects array and cascading logic](/effects-array-and-cascading-logic) — how `effectId` resolves against the registry

# Effects

# What are effects?

An effect is the visual change an interaction produces — what actually animates, and how. Every interaction connects a trigger to one or more effects; the trigger decides the _when_, the effect decides the _what_.

## Two ways to classify an effect

Effects vary along two independent axes. Keep them separate in your head — they answer different questions.

**1. What drives the effect** (its timing model):

| Kind             | Driven by                                                     | Used with triggers                                                    |
| :--------------- | :------------------------------------------------------------ | :-------------------------------------------------------------------- |
| **time effect**  | a fixed `duration` — it plays from start to finish            | `hover`, `click`, `interest`, `activate`, `viewEnter`, `animationEnd` |
| **scrub effect** | continuous progress, from scroll position or pointer movement | `viewProgress`, `pointerMove`                                         |
| **state effect** | a CSS state toggle, transitioned over time                    | `hover`, `click`, `interest`, `activate`                              |

`viewProgress` and `pointerMove` are the **continuous triggers**; everything else is an **event trigger**.

> **Note:** `hover`, `click`, `interest` and `activate` can drive **either** a time effect or a state effect — you choose by which fields you set (see `triggerType` vs `stateAction` below). Scrub effects are the only kind bound to specific triggers. `interest` and `activate` are the accessibility-upgraded forms of `hover` and `click` (focus as well as pointer, keyboard Enter/Space as well as click); they take the same effects.

**2. How you describe the change** (its _payload_). Every effect carries **exactly one**:

- **`namedEffect`**: a ready-made named effect from `@wix/motion-presets` (e.g. `FadeIn`, `Pulse`, `ParallaxScroll`). Tuned and GPU-friendly. See [named effects](/named-effects).
- **`keyframeEffect`**: your own WAAPI keyframes (`{ name, keyframes }`).
- **`customEffect`**: an imperative callback run every frame; for things CSS can't express (canvas, SVG attributes, text).
- **`transition` / `transitionProperties`**: CSS style toggles; these _are_ what makes an effect a state effect.

Time and scrub effects animate using `@wix/motion` under the hood and can pull in presets from `@wix/motion-presets`. State effects use plain CSS transitions.

---

## Common fields

These fields apply to any effect:

```ts
{
  key?: string;              // target element key; omit to target the source element
  effectId?: string;         // reference an entry in the top-level effects registry (EffectRef)
  conditions?: string[];     // ids from the conditions map; all must pass or the effect is skipped
  selector?: string;         // CSS selector to refine the target to a child element
  listContainer?: string;    // CSS selector for a list container (stagger across its children)
  listItemSelector?: string; // filter which children of listContainer are targeted
  composite?: 'replace' | 'add' | 'accumulate'; // animation effects only
  fill?: 'none' | 'forwards' | 'backwards' | 'both'; // animation effects only
}
```

`composite` and `fill` apply to **animation** effects (time and scrub), not to state effects.

### `fill` guidance

- **`'both'`**: for scroll-driven (`viewProgress`), pointer-driven (`pointerMove`), and any toggling effect (`triggerType` of `alternate`, `repeat`, or `state`). Keeps the effect applied while finished and prevents it from being garbage-collected.
- **`'backwards'`**: for one-shot entrances (`triggerType: 'once'`) when the element's own resting CSS already matches the final keyframe.

### `composite`

Controls how this effect combines with other animations on the same property: `'replace'` (the default) overrides the value beneath it, while `'add'` and `'accumulate'` stack onto it. It maps to the CSS `animation-composition` property — see [multi-interaction compositions](/multi-interaction-compositions) for the full treatment.

---

## Time effects

Play over a fixed duration. Used with `hover`, `click`, `interest`, `activate`, `viewEnter`, and `animationEnd`.

```ts
{
  duration: number;     // REQUIRED, ms
  easing?: string;      // CSS easing or a named easing from @wix/motion; default 'linear'
  delay?: number;       // ms; default 0
  iterations?: number;  // default 1; Infinity for a perpetual loop
  alternate?: boolean;  // default false — reverse direction every other iteration (within one playback)
  reversed?: boolean;   // default false — start in the finished state
  fill?: 'none' | 'forwards' | 'backwards' | 'both';  // default 'none'
  composite?: 'replace' | 'add' | 'accumulate';       // default 'replace'
  triggerType?: 'once' | 'repeat' | 'alternate' | 'state';
  // + exactly one payload (namedEffect | keyframeEffect | customEffect)
}
```

> **Warning:** `iterations: 0` is treated as `Infinity`, not as "don't play". If you want a perpetual loop, write `Infinity` and mean it; if you want the effect skipped, remove it or gate it with a condition.

### `triggerType` — playback behaviour

`triggerType` decides what repeated firings of the trigger mean. It defaults to `'alternate'` for `hover`, `click`, `interest` and `activate`, and to `'once'` for `viewEnter` and `animationEnd`.

| `triggerType` | `hover` / `interest`                                                               | `click` / `activate`                                          | `viewEnter`                                                                    |
| :------------ | :--------------------------------------------------------------------------------- | :------------------------------------------------------------ | :----------------------------------------------------------------------------- |
| `'alternate'` | Plays forward on enter, in reverse on leave                                        | First click plays; every further click reverses direction     | Plays forward on entry, in reverse on exit                                     |
| `'repeat'`    | Restarts from the beginning on enter; cancels on leave                             | Restarts from the beginning                                   | Restarts on each entry; resets once the element is fully out of view           |
| `'once'`      | Plays once per input method                                                        | Plays once per input method                                   | Plays once; the trigger is then removed                                        |
| `'state'`     | Plays or resumes on enter (unless finished); pauses on leave, keeping its progress | Plays or toggles play/pause while the animation is unfinished | Plays or resumes on entry; pauses once fully out of view, keeping its progress |

For details of each trigger's behaviour, see [click and hover](/click-and-hover) and [entrance animations](/viewenter).

> **Warning:** For `viewEnter`, `repeat`/`alternate`/`state` require **separate** source and target elements. Animating the observed element itself can make it leave/re-enter the viewport and re-trigger. Same source-and-target is safe only with `once`.

## Scrub effects

Driven continuously by progress rather than time. Used with `viewProgress` (scroll) and `pointerMove`.

```ts
{
  rangeStart?: RangeOffset; // REQUIRED for viewProgress
  rangeEnd?: RangeOffset;   // REQUIRED for viewProgress
  easing?: string;          // default 'linear', which is what you usually want for scroll
  iterations?: number;      // default 1; do not use Infinity on a scrub effect
  alternate?: boolean;      // default false — reverse direction every other iteration
  reversed?: boolean;       // default false — start from the finished state
  fill?: 'none' | 'forwards' | 'backwards' | 'both'; // default 'none'; usually 'both'
  composite?: 'replace' | 'add' | 'accumulate';      // default 'replace'
  centeredToTarget?: boolean;     // pointerMove: 0.5 progress = target center; default false
  transitionDuration?: number;    // ms, smoothing on progress jumps (pointerMove inertia)
  transitionDelay?: number;       // ms, delay on that smoothing (pointerMove)
  transitionEasing?: 'linear' | 'hardBackOut' | 'easeOut' | 'elastic' | 'bounce';
  // + exactly one payload
}
```

A scrub effect has no `duration` or `delay` — progress comes from the timeline, not the clock. `RangeOffset` mirrors the CSS `animation-range` model:

```ts
type RangeOffset = {
  name?: 'entry' | 'exit' | 'contain' | 'cover' | 'entry-crossing' | 'exit-crossing';
  offset?: {
    value: number;
    unit: 'percentage' | 'px' | 'em' | 'rem' | 'vh' | 'vw' | 'vmin' | 'vmax';
  };
};
```

### Example: parallax on a hero background

```ts
// inside interactions[]
{
  key: 'hero-bg',
  trigger: 'viewProgress',
  effects: [
    {
      keyframeEffect: {
        name: 'parallax',
        keyframes: [{ transform: 'translateY(-40px)' }, { transform: 'translateY(40px)' }],
      },
      rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
      rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
      easing: 'linear',
      fill: 'both',
    },
  ],
}
```

**Result:** The hero background drifts from 40px above its resting position to 40px below it, exactly in step with the section's travel across the viewport — scroll back up and it rewinds.

> **Warning:** `overflow: hidden` on any ancestor between the source and its scroll container silently breaks `viewProgress` — it establishes a new scroll container that the timeline does not expect. Use `overflow: clip` instead. See [scroll-driven animations](/viewprogress).

---

## State effects

State effects — also called transition effects, after the `transition` field — toggle CSS styles instead of running keyframes. Used with `hover`, `click`, `interest` and `activate`.

Use `transition` when all properties share timing; use `transitionProperties` when each property needs its own `duration`/`delay`/`easing`. Control behaviour with **`stateAction`**.

```ts
{
  key?: string;
  stateAction?: 'toggle' | 'add' | 'remove' | 'clear'; // default 'toggle'
  transition?: {
    duration?: number;  // optional in the type, required in practice — see below
    delay?: number;
    easing?: string;
    styleProperties: { name: string; value: string }[];
  };
  // OR
  transitionProperties?: {
    name: string;
    value: string;
    duration?: number;  // same: an entry with no duration produces no transition
    delay?: number;
    easing?: string;
  }[];
}
```

> **Warning:** Set one or the other. If both are present, `transition` wins and `transitionProperties` is ignored.

> **Warning:** `duration` is optional in the type, but required in practice — without it the state change is applied with no transition. The styles still land; they just land instantly. With `transitionProperties`, each entry needs its own `duration`, and entries without one are dropped.

| `stateAction`        | hover                               | click            |
| :------------------- | :---------------------------------- | :--------------- |
| `'toggle'` (default) | add state on enter, remove on leave | toggle per click |
| `'add'`              | add on enter; leave does not remove | add on click     |
| `'remove'`           | remove on enter                     | remove on click  |
| `'clear'`            | reset all states on enter           | reset all states |

### Property names

State-effect property names end up in CSS, so write them as standard **kebab-case** CSS properties (`background-color`, `border-radius`). camelCase (`backgroundColor`) is accepted too — Interact normalises either form. `keyframeEffect` keyframes are the mirror image: **camelCase** is idiomatic there (it is what WAAPI uses), and kebab-case is likewise accepted.

CSS custom properties (`--*`) are the exception on both surfaces: they are used verbatim and are case-sensitive, so `--accent-color` and `--accentColor` are two different properties.

> **Note:** The two surfaces have opposite idiomatic forms — kebab-case for state effects, camelCase for `keyframeEffect` keyframes — and both accept either. Nothing breaks if you pick the other one. [Click and hover](/click-and-hover) holds the reference state-effect example.

```ts
// inside interactions[]
{
  key: 'menu-button',
  trigger: 'click',
  effects: [
    {
      transition: {
        duration: 200,
        easing: 'ease-out',
        styleProperties: [
          { name: 'background-color', value: '#2563eb' },
          { name: 'color', value: '#ffffff' },
        ],
      },
    },
  ],
}
```

**Result:** Clicking the button eases it to blue with white text over 200 ms; clicking again eases it back to its stylesheet look.

---

## Keyframe property names and reserved keys

`keyframeEffect.keyframes` uses the WAAPI keyframe format, so property names are idiomatically camelCase (`backgroundColor`, `borderRadius`). Kebab-case is accepted and normalised, so `background-color` works too.

Three keys inside a keyframe are **not** CSS property names — they keep their WAAPI meaning:

| Key         | WAAPI meaning                                          | Generated CSS               |
| :---------- | :----------------------------------------------------- | :-------------------------- |
| `offset`    | this keyframe's position along the timeline, `0`–`1`   | the `@keyframes` percentage |
| `easing`    | the easing for the segment starting at this keyframe   | `animation-timing-function` |
| `composite` | how this keyframe composites with the value beneath it | `animation-composition`     |

Because `offset` is taken, the CSS `offset` shorthand has to be written **`cssOffset`**. Writing `offset: '10px 20px'` and expecting the CSS shorthand will not work — it is read as a (malformed) timeline position instead. The CSS `float` property follows the same convention and is written `cssFloat`.

```ts
// inside interactions[].effects[]
{
  keyframeEffect: {
    name: 'blink',
    keyframes: [
      { opacity: 0, easing: 'ease-out' }, // per-keyframe easing, not a CSS property
      { opacity: 1, offset: 0.6 },        // timeline position, not the CSS `offset` shorthand
      { opacity: 0 },
    ],
  },
  duration: 900,
}
```

---

## Targeting

By default an effect animates its interaction's **source** element. Override the target with `key` (another keyed element) or narrow it with `selector` (a child).

**Same element (most common)** — omit `key`:

```ts
// inside interactions[]
{
  key: 'cta',
  trigger: 'hover',
  effects: [
    {
      keyframeEffect: { name: 'grow', keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }] },
      triggerType: 'alternate',
      fill: 'both',
      duration: 200,
      easing: 'ease-out',
    },
  ],
}
```

**A different element** — set `key`:

```ts
// inside interactions[]
{
  key: 'menu-trigger', // SOURCE
  trigger: 'click',
  effects: [
    {
      key: 'mobile-menu', // TARGET
      namedEffect: { type: 'SlideIn', direction: 'bottom' }, // top | right | bottom | left
      triggerType: 'alternate',
      fill: 'both',
      duration: 300,
    },
  ],
}
```

## Combining multiple effects

A single interaction's `effects` array can hold several effects on different targets. They share the trigger and fire together:

```ts
// inside interactions[]
{
  key: 'card', // SOURCE
  trigger: 'hover',
  effects: [
    {
      // the card lifts (animate a child so the hovered card's hit-area doesn't shift)
      selector: '.card-body', // TARGET
      keyframeEffect: {
        name: 'card-lift',
        keyframes: [
          { transform: 'translateY(0)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
          { transform: 'translateY(-8px)', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' },
        ],
      },
      triggerType: 'alternate',
      fill: 'both',
      duration: 200,
      easing: 'ease-out',
    },
    {
      // the title changes color
      key: 'card-title', // TARGET
      keyframeEffect: { name: 'title-color', keyframes: [{ color: '#374151' }, { color: '#2563eb' }] },
      triggerType: 'alternate',
      fill: 'both',
      duration: 150,
    },
  ],
}
```

**Result:** Hovering the card lifts its body and deepens its shadow while the title shifts to blue slightly faster; moving away runs both in reverse.

> **Warning:** Hover and click effects that change an element's **size or position** should target a **child** (`selector`) rather than the hovered element itself — otherwise the hit-area shifts and the pointer rapidly re-enters/leaves, causing jitter.

---

## Inline vs. the effects registry

Write an effect inline, or define it once in the top-level `effects` registry and reference it by `effectId` (an `EffectRef`). A reference can override any field from the registry entry (target `key`, `duration`, etc.).

```ts
const config: InteractConfig = {
  effects: {
    'fade-in': {
      namedEffect: { type: 'FadeIn' },
      duration: 600,
      easing: 'ease-out',
      fill: 'backwards',
    },
  },
  interactions: [
    { key: 'item-1', trigger: 'viewEnter', effects: [{ effectId: 'fade-in' }] },
    { key: 'item-2', trigger: 'viewEnter', effects: [{ effectId: 'fade-in', duration: 800 }] }, // overrides duration to 800
  ],
};
```

**Result:** Both items fade in as they scroll into view, from one shared definition — the second one just takes 200 ms longer.

---

## Chaining with `animationEnd`

Start one effect when another finishes. Give the first effect an `effectId`, then reference it from an `animationEnd` trigger.

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'logo',
      trigger: 'viewEnter',
      effects: [
        {
          keyframeEffect: {
            name: 'logo-in',
            keyframes: [
              { opacity: 0, transform: 'scale(0.8)' },
              { opacity: 1, transform: 'scale(1)' },
            ],
          },
          duration: 600,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          fill: 'backwards',
          effectId: 'logo-entrance',
        },
      ],
    },
    {
      key: 'logo', // SOURCE
      trigger: 'animationEnd',
      params: { effectId: 'logo-entrance' }, // wait for the effect above
      effects: [
        {
          key: 'tagline', // TARGET
          namedEffect: { type: 'SlideIn', direction: 'top' },
          duration: 400,
          fill: 'backwards',
        },
      ],
    },
  ],
};
```

**Result:** The logo scales up as it enters the viewport; the moment it settles, the tagline slides down into place beneath it.

## `customEffect` for non-CSS animation

Use a `customEffect` callback when CSS can't express the change. It receives the target and a `progress` value (0–1 for time/scroll triggers; a `{ x, y, … }` object for `pointerMove`).

```ts
// inside interactions[]
{
  key: 'stats', // SOURCE
  trigger: 'viewEnter',
  params: { threshold: 0.5 }, // playback type goes on the effect, not here
  effects: [
    {
      key: 'counter', // TARGET
      customEffect: (element, progress) => {
        element.textContent = Math.floor(1000 * progress).toLocaleString();
      },
      triggerType: 'once',
      duration: 2000,
      easing: 'ease-out',
    },
  ],
}
```

**Result:** When the stats block is half visible, the counter element ticks from 0 to 1,000 over two seconds and stops there.

---

## Performance

Animate properties the browser can composite cheaply — `transform` (translate, scale, rotate), `opacity` and `filter`. Avoid layout- and paint-triggering properties such as `width`, `height`, `margin`, `padding`, `top` and `left`: they force a reflow on every frame.

For 3D, prefer `transform: perspective(…)` inside your keyframes. Reach for the CSS `perspective` property only when several children need to share one `perspective-origin`.

Prefer a `namedEffect` over hand-written keyframes where one fits — they're tuned by `@wix/motion`:

```ts
// inside interactions[].effects[] — preferred, when a named effect fits
{ namedEffect: { type: 'FadeIn' }, duration: 300 }
```

```ts
// inside interactions[].effects[] — when you need motion no named effect covers
{ keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] }, duration: 300 }
```

> **Warning:** Don't guess preset options. If you're unsure of a named effect's option names or accepted values, omit them and rely on defaults rather than inventing keys.

---

## Reduced motion

Provide a gentler alternative for users who prefer reduced motion: gate the full animation behind `(prefers-reduced-motion: no-preference)` and offer a calmer fallback for `reduce`. Conditions on an effect skip just that effect when they don't pass.

```ts
const config: InteractConfig = {
  conditions: {
    'motion-ok': { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
    'reduced-motion': { type: 'media', predicate: '(prefers-reduced-motion: reduce)' },
  },
  interactions: [
    {
      key: 'panel',
      trigger: 'viewEnter',
      effects: [
        {
          // full motion — only when the user has NOT requested reduced motion
          namedEffect: { type: 'SlideIn', direction: 'bottom' },
          duration: 600,
          fill: 'backwards',
          conditions: ['motion-ok'],
        },
        {
          // gentle fallback — only when the user prefers reduced motion
          namedEffect: { type: 'FadeIn' },
          duration: 400,
          fill: 'backwards',
          conditions: ['reduced-motion'],
        },
      ],
    },
  ],
};
```

You can also force this globally: `Interact.forceReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches`.

---

## Timing and easing reference

Rough starting points (tune to taste):

| Use                               | Duration    |
| :-------------------------------- | :---------- |
| Micro-interactions (hover, click) | 100–300 ms  |
| Page transitions                  | 300–500 ms  |
| Entrance animations               | 500–800 ms  |
| Complex sequences                 | 800–1200 ms |

| Use                 | Easing                                                                |
| :------------------ | :-------------------------------------------------------------------- |
| Entrances           | `ease-out`, `cubic-bezier(0.16, 1, 0.3, 1)`                           |
| Exits               | `ease-in`, `cubic-bezier(0.4, 0, 1, 1)`                               |
| Interactions        | `ease-in-out`                                                         |
| Elastic / overshoot | `cubic-bezier(0.34, 1.56, 0.64, 1)`, or a named easing like `backOut` |

### Named easings

`easing` accepts any CSS easing value — the keywords, `cubic-bezier(…)`, `steps(…)` and `linear(…)` — and passes anything it doesn't recognise straight through to CSS. On top of that, `@wix/motion` resolves a catalogue of named easings, most of them to a tuned `cubic-bezier()`:

| Family      | Names                                    |
| :---------- | :--------------------------------------- |
| Linear      | `linear`                                 |
| CSS keyword | `ease`, `easeIn`, `easeOut`, `easeInOut` |
| Sine        | `sineIn`, `sineOut`, `sineInOut`         |
| Quadratic   | `quadIn`, `quadOut`, `quadInOut`         |
| Cubic       | `cubicIn`, `cubicOut`, `cubicInOut`      |
| Quartic     | `quartIn`, `quartOut`, `quartInOut`      |
| Quintic     | `quintIn`, `quintOut`, `quintInOut`      |
| Exponential | `expoIn`, `expoOut`, `expoInOut`         |
| Circular    | `circIn`, `circOut`, `circInOut`         |
| Back        | `backIn`, `backOut`, `backInOut`         |

The `easeIn`/`easeOut`/`easeInOut` names are camelCase aliases for the CSS `ease-in`/`ease-out`/`ease-in-out` keywords; both spellings work. `backIn`, `backOut` and `backInOut` overshoot, which is what makes `backOut` the go-to for a bit of bounce at the end of an entrance.

> **Note:** On time and scrub effects, `easing` defaults to `linear` when you leave it out. That is right for scroll, but mechanical-looking for a time effect, so set one explicitly on anything a visitor watches. State effects default to `ease` instead.

The separate `transitionEasing` field on scrub effects is a different, much shorter list — `'linear'`, `'hardBackOut'`, `'easeOut'`, `'elastic'`, `'bounce'` — and it eases the smoothing between progress values, not the animation itself.

## See also

- [Named effects](/named-effects)
- [Time and scrub effects](/time-and-scrub-effects)
- [Transition effects](/transition-effects)
- [Custom effects](/custom-effects)
- [Effects array and cascading logic](/effects-array-and-cascading-logic)

# Named effects

Named effects are pre-built animations from the [`@wix/motion-presets`](https://github.com/wix/interact/tree/master/packages/motion-presets) package. They let you add polished motion to an interaction by name (`FadeIn`, `Pulse`, `ParallaxScroll`…) without writing keyframes. Under the hood they run on [`@wix/motion`](https://github.com/wix/interact/tree/master/packages/motion), so they are GPU-friendly and consistent across browsers.

You use one by giving an effect a `namedEffect` payload instead of a `keyframeEffect` or `customEffect`:

```ts
// inside interactions[].effects[]
{ namedEffect: { type: 'FadeIn' }, duration: 800 }
```

## Categories

Presets come in four categories, each built for a particular kind of motion, and therefore a particular kind of trigger:

| Category     | Built for                         | Typical trigger                                                                                         | Count |
| :----------- | :-------------------------------- | :------------------------------------------------------------------------------------------------------ | :---- |
| **Entrance** | An element appearing              | `viewEnter` (also `hover`, `click`, `animationEnd`)                                                     | 19    |
| **Scroll**   | Motion tied to scroll position    | `viewProgress`                                                                                          | 19    |
| **Ongoing**  | A continuous, looping animation   | any **time-based** trigger (`viewEnter`, `hover`, `click`, `animationEnd`), with `iterations: Infinity` | 13    |
| **Mouse**    | Real-time response to the pointer | `pointerMove`                                                                                           | 11    |

### All available named effects

**Entrance (19):** `ArcIn`, `BlurIn`, `BounceIn`, `CurveIn`, `DropIn`, `ExpandIn`, `FadeIn`, `FlipIn`, `FloatIn`, `FoldIn`, `GlideIn`, `RevealIn`, `ShapeIn`, `ShuttersIn`, `SlideIn`, `SpinIn`, `TiltIn`, `TurnIn`, `WinkIn`

**Scroll (19):** `ArcScroll`, `BlurScroll`, `FadeScroll`, `FlipScroll`, `GrowScroll`, `MoveScroll`, `PanScroll`, `ParallaxScroll`, `RevealScroll`, `ShapeScroll`, `ShrinkScroll`, `ShuttersScroll`, `SkewPanScroll`, `SlideScroll`, `Spin3dScroll`, `SpinScroll`, `StretchScroll`, `TiltScroll`, `TurnScroll`

**Ongoing (13):** `Bounce`, `Breathe`, `Cross`, `Flash`, `Flip`, `Fold`, `Jello`, `Poke`, `Pulse`, `Rubber`, `Spin`, `Swing`, `Wiggle`

**Mouse (11):** `AiryMouse`, `BlobMouse`, `BlurMouse`, `BounceMouse`, `ScaleMouse`, `SkewMouse`, `SpinMouse`, `SwivelMouse`, `Tilt3DMouse`, `Track3DMouse`, `TrackMouse`

> **Note:** The mouse category exports one more name, `CustomMouse`, which is deliberately left out of the list above. It is not a preset in the usual sense — it carries no motion of its own. It is the base class the other mouse presets extend, exposed as an extension point for direct `@wix/motion` use, and it renders whatever a `customEffect` callback in its options does. An Interact effect cannot carry a `namedEffect` and a `customEffect` at the same time (the two are mutually exclusive payloads), so `CustomMouse` has nothing to run when it is used through Interact. For a hand-written pointer effect, use a [custom effect](/custom-effects) on `pointerMove` instead.

> **Warning:** `@wix/motion-presets` also exports a set of experimental background-scroll presets — `BgCloseUp`, `BgFade`, `BgFadeBack`, `BgFake3D`, `BgPan`, `BgParallax`, `BgPullBack`, `BgReveal`, `BgRotate`, `BgSkew`, `BgZoom` and `ImageParallax`. They are marked **not production ready** in source, are unsupported, and may change or disappear without notice. `import * as presets from '@wix/motion-presets'` pulls them into the registry along with everything else, so register selectively if you want to keep them out.

For each preset's specific options (`direction`, `distance`, `range`, and so on), see the [`@wix/motion-presets` source](https://github.com/wix/interact/tree/master/packages/motion-presets).

---

## Registering named effects

Named effects are opt-in: Interact resolves a `namedEffect` by looking its `type` up in the `effects` registry, and the registry starts empty. Three steps, in this order.

### 1. Install the package

```bash
npm install @wix/motion-presets
```

### 2. Register the presets you use

Registering tells Interact which presets exist. Import selectively (smaller bundles) or register everything:

```ts
// Selective — recommended
import { Interact } from '@wix/interact';
import { FadeIn, BounceIn } from '@wix/motion-presets';

Interact.registerEffects({ FadeIn, BounceIn });
```

```ts
// Everything — this also registers the experimental Bg* presets
import { Interact } from '@wix/interact';
import * as presets from '@wix/motion-presets';

Interact.registerEffects(presets);
```

> **Warning:** `Interact.registerEffects()` must run **before** both `generate()` and `Interact.create()`. Each of them reads the `effects` registry at the moment it runs, and a `namedEffect` whose `type` was never registered does not animate.

If you pre-render CSS, register first and then call `generate()`. Pass `useFirstChild` explicitly: it defaults to `true`, which is correct only for the `@wix/interact/web` custom-elements entry point. A bare `generate(config)` in a vanilla or React integration emits `> :first-child` selectors that never match anything.

```ts
import { Interact, generate } from '@wix/interact';
import { FadeIn } from '@wix/motion-presets';

Interact.registerEffects({ FadeIn });

// Vanilla and React: the keyed element is the animated element.
const css = generate(config, { useFirstChild: false });

// @wix/interact/web: the keyed element is <interact-element>, so target its first child.
const cssForCustomElements = generate(config, { useFirstChild: true });
```

### 3. Reference the preset by name

Set `type` inside the `namedEffect` object to the preset's name.

```tsx
// React — @wix/interact/react
import React, { useEffect } from 'react';
import { Interact, Interaction, InteractConfig } from '@wix/interact/react';
import { FadeIn } from '@wix/motion-presets';

Interact.registerEffects({ FadeIn });

const config: InteractConfig = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [{ namedEffect: { type: 'FadeIn' }, duration: 1000, fill: 'backwards' }],
    },
  ],
};

function App() {
  useEffect(() => {
    const instance = Interact.create(config);
    return () => instance.destroy();
  }, []);

  return (
    <Interaction tagName="div" interactKey="hero">
      <h1>Welcome</h1>
    </Interaction>
  );
}

export default App;
```

```ts
// Custom elements — @wix/interact/web
import { Interact } from '@wix/interact/web';
import { FadeIn } from '@wix/motion-presets';

Interact.registerEffects({ FadeIn });

const config = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [{ namedEffect: { type: 'FadeIn' }, duration: 1000, fill: 'backwards' }],
    },
  ],
};

Interact.create(config);
```

```html
<interact-element data-interact-key="hero">
  <h1>Welcome</h1>
</interact-element>
```

```ts
// Vanilla — @wix/interact
import { Interact, add } from '@wix/interact';
import { FadeIn } from '@wix/motion-presets';

Interact.registerEffects({ FadeIn });

const config = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [{ namedEffect: { type: 'FadeIn' }, duration: 1000, fill: 'backwards' }],
    },
  ],
};

Interact.create(config);

// Bind the element to its key after it exists in the DOM.
// add() is a standalone export, not a method on the instance.
const hero = document.querySelector('.hero');
add(hero, 'hero');
```

**Result:** the hero heading is hidden until it scrolls into view, then fades up to full opacity over one second and stays there.

---

## Configuring a named effect

There are **two distinct groups of options**, and mixing them up is the most common mistake.

**Animation options** live on the **effect**, next to `namedEffect`. They control timing and playback, and apply to any effect type:

```ts
// inside interactions[].effects[]
{
  namedEffect: { type: 'FadeIn' },
  duration: 800,        // ms
  delay: 100,           // ms
  easing: 'ease-out',
  iterations: 1,        // or Infinity for ongoing presets
  fill: 'backwards',
  triggerType: 'once',
}
```

**Preset options** live **inside** the `namedEffect` object alongside `type`. They are specific to that preset — a direction, a distance, a scroll `range`, and so on:

```ts
// inside interactions[].effects[]
{
  namedEffect: { type: 'SlideIn', direction: 'bottom' }, // direction is a preset option
  duration: 600,
  fill: 'backwards',
}
```

## Do not guess preset options

Option names and accepted values differ per preset, and an unrecognised key is silently ignored — the preset falls back to its default and you get motion you did not ask for. Nothing catches this for you: `namedEffect` accepts any extra keys, so neither TypeScript nor [`@wix/interact-validate`](https://github.com/wix/interact/tree/master/packages/interact-validate) reports a misspelled or invented option.

If you are unsure, **omit the option and rely on the preset's default**. Never invent a key, and never copy an option name from one preset to another without checking it. The authority is the preset's own type in [`@wix/motion-presets`](https://github.com/wix/interact/tree/master/packages/motion-presets).

Two cross-preset conventions are worth knowing:

- **`direction` is overloaded.** It means something different in almost every preset. `SlideIn`, `FloatIn` and `FoldIn` take cardinal values (`'top'`, `'right'`, `'bottom'`, `'left'`); `TurnIn` takes corners (`'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`); `TiltIn` takes a side (`'left'`, `'right'`); `WinkIn` takes an axis (`'horizontal'`, `'vertical'`); `GlideIn` takes an angle in degrees (a plain number); `SpinIn` takes `'clockwise'` or `'counter-clockwise'`. Check the preset before you set it.
- **Distances use object notation.** Write `distance: { value: 120, unit: 'px' }`. The accepted units are `'px'`, `'em'`, `'rem'`, `'vh'`, `'vw'`, `'vmin'`, `'vmax'` and `'percentage'`. Object notation is the only form in the public type — a flat string such as `'120px'` fails type-checking.

---

## Entrance presets (`viewEnter`)

Entrance presets play once as the element scrolls into view. `triggerType` defaults to `once`.

> **Note:** All 19 entrance presets default to `fill: 'backwards'`, so the element sits at its first keyframe before the animation starts. Set `fill` explicitly on the effect anyway — [`@wix/interact-validate`](https://github.com/wix/interact/tree/master/packages/interact-validate) raises an `info`-level `RECOMMENDED_FILL` nudge when a `viewEnter` effect with `triggerType: 'once'` omits `'backwards'` or `'both'`. Use `'both'` when the final keyframe must also persist after the animation ends.

> **Note:** An entrance preset starts from a hidden first keyframe (for example `opacity: 0`), but the element is authored in its final, visible state — so it can paint at full opacity for an instant before Interact applies that first keyframe, a flash of unstyled content (FOUC). Prevention is fully automatic: `generate()` emits the guarded initial-state rules itself, and the runtime sets and clears the `data-interact-enter` attribute on the target as the animation starts and finishes. You never add an attribute yourself. See [preventing FOUC](/html-integration#preventing-fouc).

### Example: a card floating up as it scrolls into view

```ts
// inside interactions[]
{
  key: 'card',
  trigger: 'viewEnter',
  params: { threshold: 0.3 },
  effects: [
    {
      namedEffect: { type: 'FloatIn', direction: 'bottom' },
      duration: 700,
      easing: 'ease-out',
      fill: 'backwards',
    },
  ],
}
```

**Result:** the card stays invisible until 30% of it is in the viewport, then drifts up into place over 700 ms and settles.

## Scroll presets (`viewProgress`)

Progress is driven by scroll position, not by time, so a scroll preset takes no `duration`. Use `rangeStart` and `rangeEnd` on the effect to control the active scroll window.

> **Critical:** Every scroll preset (`*Scroll`) MUST include a `range` option — `'in'` (ends at the idle state), `'out'` (starts from the idle state) or `'continuous'` (passes through the idle state). Prefer `'continuous'`.

> **Warning:** `overflow: hidden` on any ancestor between the source and the scroll container breaks `viewProgress`. Use `overflow: clip` instead.

### Example: a hero image parallaxing across the whole scroll pass

```ts
// inside interactions[]
{
  key: 'hero-image',
  trigger: 'viewProgress',
  effects: [
    {
      namedEffect: { type: 'ParallaxScroll', range: 'continuous' },
      rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
      rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
      fill: 'both',
    },
  ],
}
```

**Result:** the hero image drifts at a different rate from the surrounding content for the entire time it overlaps the viewport, and it tracks the scrollbar exactly — scrolling back up rewinds it.

## Ongoing presets (looping)

Ongoing presets loop indefinitely. Start one with any **time-based** trigger (`viewEnter`, `hover`, `click`, `animationEnd`) and set `iterations: Infinity`. The ongoing-only preset option `iterationDelay` (ms) inserts a pause between repetitions.

> **Warning:** `iterations: Infinity` is only meaningful on a time effect. On a scrub effect — anything driven by `viewProgress` or `pointerMove` — the iteration count must be finite, because a scrubbed timeline has no notion of running forever.

### Example: a badge pulsing forever once it appears

```ts
// inside interactions[]
{
  key: 'badge',
  trigger: 'viewEnter',
  effects: [
    {
      namedEffect: { type: 'Pulse', iterationDelay: 400 },
      duration: 800,
      iterations: Infinity,
      triggerType: 'once',
      fill: 'both',
    },
  ],
}
```

**Result:** as soon as the badge scrolls into view it swells and shrinks over 800 ms, waits 400 ms, and repeats for as long as the page is open.

## Mouse presets (`pointerMove`)

Transform values are driven by the cursor in real time. Mouse presets handle two-dimensional pointer input internally, so prefer them over `keyframeEffect` for pointer effects.

> **Warning:** Mouse presets only make sense on hover-capable devices and may behave differently on touch. Gate them with a `(hover: hover)` media condition and consider a `viewEnter` or `viewProgress` fallback for touch.

### Example: a feature card tilting toward the cursor

```ts
// inside interactions[]
{
  key: 'feature-card',
  trigger: 'pointerMove',
  params: { hitArea: 'self' },
  effects: [{ namedEffect: { type: 'Tilt3DMouse' }, fill: 'both', transitionDuration: 400 }],
}
```

**Result:** while the pointer is over the card, the card tilts in 3D to follow it, easing toward each new position over 400 ms rather than snapping.

---

## Accessibility

Presets supply the motion; your config decides when to apply it. For users who prefer reduced motion, swap a high-motion preset for a calmer one using `conditions` (these re-evaluate automatically when the user's preference changes):

```ts
{
  conditions: {
    'motion-ok':      { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
    'reduced-motion': { type: 'media', predicate: '(prefers-reduced-motion: reduce)' },
  },
  interactions: [
    {
      key: 'panel',
      trigger: 'viewEnter',
      effects: [
        { namedEffect: { type: 'SpinIn' }, duration: 700, fill: 'backwards', conditions: ['motion-ok'] },
        { namedEffect: { type: 'FadeIn' }, duration: 400, fill: 'backwards', conditions: ['reduced-motion'] },
      ],
    },
  ],
}
```

Common reduced-motion fallbacks: `BounceIn`/`SpinIn`/`ArcIn`/`FlipIn`/`TurnIn` → `FadeIn`; `ParallaxScroll` → static; mouse presets → static. Lowest-risk presets are opacity/blur-based (`FadeIn`, `BlurIn`, `Pulse`, `Breathe`).

## See also

- [What are effects?](/what-are-effects)
- [Entrance animations (`viewEnter`)](/viewenter)
- [Scroll-driven animations](/viewprogress)
- [HTML integration: preventing FOUC](/html-integration#preventing-fouc)
- [`@wix/motion-presets` on GitHub](https://github.com/wix/interact/tree/master/packages/motion-presets)

# Time and scrub effects

Time effects and scrub effects are the two animated effect kinds. A time effect plays over a fixed `duration` and is started by an event trigger (`viewEnter`, `click`, `hover`, `animationEnd`). A scrub effect has no duration: its progress is driven continuously by a continuous trigger (`viewProgress`, `pointerMove`).

Both kinds carry exactly one payload — a `namedEffect`, a `keyframeEffect`, or a `customEffect`. This page covers the first two, with an emphasis on writing keyframes by hand.

## Time effects

Time effects are traditional time-based animations, suited to entrance effects, hover interactions, and click responses.

| Field         | Type                                            | Default                                                         | Description                                                       |
| :------------ | :---------------------------------------------- | :-------------------------------------------------------------- | :---------------------------------------------------------------- |
| `duration`    | `number`                                        | required                                                        | Playback length in milliseconds.                                  |
| `easing`      | `string`                                        | `'linear'`                                                      | CSS easing string, or a named easing from `@wix/motion`.          |
| `delay`       | `number`                                        | `0`                                                             | Milliseconds to wait before the animation starts.                 |
| `iterations`  | `number`                                        | `1`                                                             | How many times to repeat. `Infinity` loops forever.               |
| `alternate`   | `boolean`                                       | `false`                                                         | Reverse direction on every other iteration.                       |
| `reversed`    | `boolean`                                       | `false`                                                         | Start from the finished state and play backwards.                 |
| `fill`        | `'none'`, `'forwards'`, `'backwards'`, `'both'` | `'none'`                                                        | Which end state persists outside the active period.               |
| `triggerType` | `'once'`, `'repeat'`, `'alternate'`, `'state'`  | `'once'` for `viewEnter`, `'alternate'` for `hover` and `click` | Playback behaviour on re-trigger.                                 |
| `composite`   | `'replace'`, `'add'`, `'accumulate'`            | `'replace'`                                                     | How this effect combines with others animating the same property. |

### Named effects

Named effects are pre-built animations from [`@wix/motion-presets`](https://github.com/wix/interact/tree/master/packages/motion-presets), or effects registered with `Interact.registerEffects()`:

```ts
// inside an interaction's effects[]
{
  key: 'my-element',
  namedEffect: { type: 'FadeIn' }, // predefined animation
  duration: 800,
  easing: 'ease-out',
  delay: 200,
  iterations: 1,
  fill: 'forwards',
}
```

See [Named effects](/named-effects) for the preset inventory and each preset's options.

### Keyframe effects

Use a `keyframeEffect` when you need a custom animation that no named effect covers. The payload takes a `name`, used to generate the underlying CSS keyframes rule, and a `keyframes` array of WAAPI-style keyframe objects.

```ts
// inside an interaction's effects[]
{
  key: 'custom-animation',
  keyframeEffect: {
    name: 'custom-animation',
    keyframes: [
      { transform: 'scale(1) rotate(0deg)', opacity: 1, backgroundColor: '#ff0000' },
      { transform: 'scale(1.2) rotate(180deg)', opacity: 0.8, backgroundColor: '#0000ff' },
    ],
  },
  duration: 600,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
}
```

> **Warning:** Give every `keyframeEffect` a unique `name` within the config, so its generated keyframes rule does not collide with another effect. `@wix/interact-validate` reports a reused name as a warning.

### Example: card entrance on scroll

A `viewEnter` trigger with a custom `keyframeEffect`: the card fades and scales in the first time it enters the viewport, using a custom easing curve instead of a named effect.

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'product-card',
      trigger: 'viewEnter',
      params: { threshold: 0.3 },
      effects: [
        {
          keyframeEffect: {
            name: 'card-entrance',
            keyframes: [
              { opacity: 0, transform: 'translateY(60px) scale(0.9)' },
              { opacity: 1, transform: 'translateY(0) scale(1)' },
            ],
          },
          duration: 800,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // custom easing
          fill: 'forwards',
        },
      ],
    },
  ],
};
```

```html
<article class="product-card" data-interact-key="product-card">
  <img src="/trail-runner.jpg" alt="Trail runner sneaker" />
  <h3>Trail Runner</h3>
  <p>$120</p>
</article>
```

**Result:** Nothing happens until 30% of the card is inside the viewport. From that moment the card takes 800ms to fade from transparent to opaque while rising 60px and growing from 90% to full size, decelerating sharply at the end. `fill: 'forwards'` holds the final frame, and the default `triggerType` of `'once'` means it never replays.

> **Note:** **Accessibility** — wrap `keyframeEffect`-driven entrance animations in a condition that checks `prefers-reduced-motion`, the same technique used for named effects. Define two conditions – one matching users who are fine with motion and one matching `prefers-reduced-motion` – and register a reduced or instant version of the effect (for example, a plain opacity fade or immediate `fill: 'forwards'` state) for the reduced-motion condition instead of the transform-heavy keyframes.

## Writing keyframes

Property names inside `keyframes` may be written in **camelCase** (`backgroundColor`) or **kebab-case** (`background-color`); both are accepted and normalised. Prefer camelCase here — it is the form the Web Animations API uses.

This is the mirror image of [state effects](/transition-effects), where the same two forms are accepted but kebab-case is idiomatic because those values are written straight into CSS. See [What are effects?](/what-are-effects) for how the two surfaces relate.

CSS custom properties (`--*`) are used verbatim and are case-sensitive: `--Brand-Hue` and `--brand-hue` are different properties.

### Keys that are not CSS properties

Four keys inside a keyframe object keep their WAAPI meaning instead of being treated as CSS properties:

| Key         | Meaning                                                   | In the generated CSS        |
| :---------- | :-------------------------------------------------------- | :-------------------------- |
| `offset`    | Position of this keyframe in the timeline, `0`–`1`        | the keyframe percentage     |
| `easing`    | Timing function for the segment starting at this keyframe | `animation-timing-function` |
| `composite` | How this keyframe composites with underlying values       | `animation-composition`     |
| `cssOffset` | The CSS `offset` shorthand (motion path)                  | `offset`                    |

`float` is the fifth special case: write it as `cssFloat`, exactly as WAAPI requires.

> **Warning:** `offset: '10px 20px'` does not set a motion path. `offset` is read as this keyframe's position in the timeline, so a value that is not a number between `0` and `1` produces a broken keyframes rule. Write the CSS shorthand as `cssOffset: '10px 20px'`.

Offsets you do supply are interpolated: the first keyframe defaults to `0`, the last to `1`, and keyframes between two given offsets are spread evenly. Offsets must not decrease from one keyframe to the next.

## Scrub effects

Scrub effects are progress-based animations that follow scroll position (`viewProgress`) or pointer position (`pointerMove`) instead of a clock. They take no `duration` and no `delay`.

| Field                | Type                                                              | Default                     | Description                                                             |
| :------------------- | :---------------------------------------------------------------- | :-------------------------- | :---------------------------------------------------------------------- |
| `rangeStart`         | `RangeOffset`                                                     | required for `viewProgress` | Where in the scroll range the effect begins.                            |
| `rangeEnd`           | `RangeOffset`                                                     | required for `viewProgress` | Where in the scroll range the effect ends.                              |
| `easing`             | `string`                                                          | `'linear'`                  | Usually left at `'linear'` for scroll.                                  |
| `fill`               | `'none'`, `'forwards'`, `'backwards'`, `'both'`                   | `'none'`                    | Use `'both'` to hold the end state outside the range.                   |
| `composite`          | `'replace'`, `'add'`, `'accumulate'`                              | `'replace'`                 | How this effect combines with others on the same property.              |
| `centeredToTarget`   | `boolean`                                                         | `false`                     | `pointerMove` only: `0.5` progress lands on the target's centre.        |
| `transitionDuration` | `number`                                                          | none                        | `pointerMove` only: milliseconds of smoothing between progress updates. |
| `transitionEasing`   | `'linear'`, `'hardBackOut'`, `'easeOut'`, `'elastic'`, `'bounce'` | `'linear'`                  | Easing for that smoothing transition.                                   |

### Basic scrub effect

```ts
// inside an interaction's effects[]
{
  key: 'parallax-bg',
  keyframeEffect: {
    name: 'parallax',
    keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(-200px)' }],
  },
  // no duration — progress comes from the trigger
  easing: 'linear',
  rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
  rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
}
```

### Range configuration

`rangeStart` and `rangeEnd` both take a `{ name, offset }` shape. `name` selects which part of the scroll range to anchor to:

| `name`           | Anchors to                                                                                         |
| :--------------- | :------------------------------------------------------------------------------------------------- |
| `cover`          | The full visibility span, from the first pixel entering to the last pixel leaving.                 |
| `contain`        | While the element is fully contained in the viewport. Typical with a `position: sticky` container. |
| `entry`          | The phase while the element is entering the viewport.                                              |
| `exit`           | The phase while the element is leaving the viewport.                                               |
| `entry-crossing` | From the element's leading edge entering to its leading edge reaching the opposite side.           |
| `exit-crossing`  | From the element's trailing edge reaching the start to its trailing edge leaving.                  |

`name` defaults to `cover` when omitted. `offset` is `{ unit, value }` and shifts the anchor point within that named range: `unit` is `'percentage'` or a length unit (`'px'`, `'em'`, `'rem'`, `'vh'`, `'vw'`, `'vmin'`, `'vmax'`). The pair maps to the CSS `animation-range` syntax.

> **Tip:** The default `fill` is `'none'`, so the effect snaps back to the element's own styles once `rangeEnd` is passed. Add `fill: 'both'` to hold the end state.

```ts
// inside an interaction's effects[]
{
  key: 'fade-element',
  keyframeEffect: {
    name: 'fade',
    keyframes: [{ opacity: 1 }, { opacity: 0 }],
  },
  rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 30 } }, // start at 30% of the range
  rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 80 } },   // end at 80% of the range
  fill: 'both',
}
```

### Pointer-driven scrub effects

A `pointerMove` trigger drives a scrub effect from pointer position. Its `params` — `hitArea` and `axis` — are documented in full on [`pointerMove`](/pointermove), along with `centeredToTarget` and the `transitionDuration` / `transitionEasing` smoothing fields. What is specific to a `keyframeEffect` here:

- A `keyframeEffect` maps a **single** pointer axis to `0`–`1` progress. That axis comes from `params.axis`, which defaults to `'y'`. The first keyframe sits at the start edge of the hit area and the last at the opposite edge.
- For two-dimensional tracking, use a mouse `namedEffect` or a `customEffect` — both receive the full 2D progress object — or pair two interactions, one per axis, and combine them with `composite: 'add'`.
- Pointer effects ignore `duration`, `delay`, `triggerType`, `rangeStart`, and `rangeEnd` — the pointer position is the timeline. Smoothing is configured with `transitionDuration` and `transitionEasing` on the effect; see [`pointerMove`](/pointermove).
- Prefer `fill: 'both'` so the effect holds its position between updates.

> **Note:** The library skips pointer-driven effects entirely when reduced motion is preferred.

### Example: parallax hero section

A single `viewProgress` trigger drives two keyframe effects at different range offsets, so the background moves more slowly than the foreground text.

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'hero-section', // SOURCE
      trigger: 'viewProgress',
      effects: [
        {
          key: 'hero-bg', // TARGET — background image, moves slower
          keyframeEffect: {
            name: 'image-parallax',
            keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(-150px)' }],
          },
          easing: 'linear',
          fill: 'both',
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
        },
        {
          key: 'hero-text', // TARGET — headline, fades out faster
          keyframeEffect: {
            name: 'text-fade',
            keyframes: [
              { opacity: 1, transform: 'translateY(0)' },
              { opacity: 0, transform: 'translateY(-50px)' },
            ],
          },
          easing: 'linear',
          fill: 'both',
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 20 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 60 } },
        },
      ],
    },
  ],
};
```

```html
<section class="hero" data-interact-key="hero-section">
  <img class="hero__bg" src="/mountains.jpg" alt="" data-interact-key="hero-bg" />
  <div class="hero__text" data-interact-key="hero-text">
    <h1>Above the clouds</h1>
    <p>Trails for every season.</p>
  </div>
</section>
```

```css
.hero {
  position: relative;
  min-height: 90vh;
  overflow: clip; /* never `overflow: hidden` — it breaks viewProgress */
}

.hero__bg {
  position: absolute;
  inset: -10% 0;
  width: 100%;
  height: 120%;
  object-fit: cover;
}

.hero__text {
  position: relative;
  padding: 6rem 2rem;
}
```

**Result:** As the visitor scrolls the hero through the viewport, the mountain image drifts up by 150px across the whole pass, while the headline starts fading and lifting only a fifth of the way in and is gone by 60%. Because the two elements move at different rates, the image reads as sitting further back. `fill: 'both'` keeps both elements at their end positions once the section has passed.

## See also

- [What are effects?](/what-are-effects) — how the effect kinds and payloads fit together
- [Named effects](/named-effects) — the preset inventory
- [Scroll-driven animations](/viewprogress) — the trigger behind scroll scrub effects
- [`pointerMove`](/pointermove) — pointer parameters, smoothing, and 2D progress
- [Transition effects](/transition-effects) — the CSS-state alternative to keyframes

# Transition effects

State effects are also called transition effects, after the `transition` field that declares them. Instead of playing a keyframe timeline from start to finish, a state effect flips the target between its normal CSS look and a declared alternate look, and lets the browser's native CSS transition animate the change.

Reach for a state effect when you are describing a second look for an element — "while hovered, the button is dark and lifted" — rather than motion across a run.

## How it works

When the trigger fires, Interact toggles a state on the target and applies your `styleProperties` (or `transitionProperties`) values while that state is active. The transition itself lives on the target, so both directions — turning the state on and turning it off — animate using the same `duration`, `delay`, and `easing`. There is no separate "reverse" to define and no timeline to restart: firing the trigger again mid-transition reverses smoothly from wherever the value currently is.

Interact writes two CSS rules for you:

- a state rule carrying your style property values, matched by `:state(<effectId>)`, `:--<effectId>`, and `[data-interact-effect~="<effectId>"]`
- a `transition:` shorthand on the keyed element, so the change animates in both directions

Because the effect describes a state rather than a run, that state persists until something removes it.

## Which triggers drive a state effect

State effects run only under the event triggers that switch something on and off:

| Trigger    | Switches the state                                                     |
| :--------- | :--------------------------------------------------------------------- |
| `click`    | On each click                                                          |
| `hover`    | On pointer enter, off on pointer leave                                 |
| `activate` | The keyboard-accessible upgrade of `click` — also Enter and Space      |
| `interest` | The keyboard-accessible upgrade of `hover` — also focus in / focus out |

`viewEnter`, `viewProgress`, `pointerMove`, and `animationEnd` drive keyframe, named, and custom effects instead, because those describe motion across a run rather than an on/off look.

## Parameters

| Name                   | Type                                                       | Default                 | Description                                                                |
| :--------------------- | :--------------------------------------------------------- | :---------------------- | :------------------------------------------------------------------------- |
| `key`                  | `string`                                                   | the interaction's `key` | The keyed element the state is applied to.                                 |
| `effectId`             | `string`                                                   | generated at runtime    | Identity of the state. Effects sharing an `effectId` drive the same state. |
| `stateAction`          | `'toggle'` \| `'add'` \| `'remove'` \| `'clear'`           | `'toggle'`              | How the trigger changes the state.                                         |
| `transition`           | `TransitionOptions & { styleProperties: StyleProperty[] }` | —                       | One shared set of timing values for every property.                        |
| `transitionProperties` | `TransitionProperty[]`                                     | —                       | Per-property values, each carrying its own timing.                         |

> **Note:** Set one or the other. If both are present, `transition` wins and `transitionProperties` is ignored.

### `transition`

| Name              | Type              | Default  | Description                                                                                                 |
| :---------------- | :---------------- | :------- | :---------------------------------------------------------------------------------------------------------- |
| `duration`        | `number` (ms)     | —        | Optional in the type, but required in practice — without it the state change is applied with no transition. |
| `delay`           | `number` (ms)     | `0`      | Delay before the transition starts, in both directions.                                                     |
| `easing`          | `string`          | `'ease'` | A CSS easing keyword or function, or a `@wix/motion` easing name such as `easeInOut`.                       |
| `styleProperties` | `StyleProperty[]` | required | `{ name, value }` pairs applied while the state is on.                                                      |

### `transitionProperties[]`

| Name       | Type          | Default    | Description                                                                                                                                                     |
| :--------- | :------------ | :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`     | `string`      | required   | CSS property name.                                                                                                                                              |
| `value`    | `string`      | required   | Value applied while the state is on.                                                                                                                            |
| `duration` | `number` (ms) | —          | Optional in the type, but required in practice — entries without one are dropped from the generated `transition:`, so that property snaps instead of animating. |
| `delay`    | `number` (ms) | `0`        | Delay for this property only.                                                                                                                                   |
| `easing`   | `string`      | `'linear'` | Note the different default from `transition`.                                                                                                                   |

## Choosing between `transition` and `transitionProperties`

Use `transition` when every property shares identical timing — that is the common case, and it keeps the config to a single timing block. Reach for `transitionProperties` as soon as different properties need independent timing, for example a background fade that should be slower than an accompanying scale bounce.

| You want                                            | Use                    |
| :-------------------------------------------------- | :--------------------- |
| One duration, delay, and easing for all properties  | `transition`           |
| A different duration, delay, or easing per property | `transitionProperties` |

## `stateAction`

| `stateAction`      | On `click` / `activate`                            | On `hover` / `interest`                             |
| :----------------- | :------------------------------------------------- | :-------------------------------------------------- |
| `toggle` (default) | Each click flips the state on and off              | On while hovered — added on enter, removed on leave |
| `add`              | Switches the state on (repeat clicks are harmless) | Entering switches it on; it stays on                |
| `remove`           | Switches the state off                             | Entering switches it off                            |
| `clear`            | Clears every active state on the target            | Same, on enter                                      |

`add` and `remove` are useful when two different elements should independently open and close the same target — give both effects the same `effectId`, declared once in the top-level `effects` map, so they drive the same shared state.

## Property names

Every CSS-property name in a state effect accepts either kebab-case or camelCase; Interact normalises the name to kebab-case before writing the CSS. Kebab-case is the house style for state effects, because it is literally what the browser receives — the config then reads the same as the rule it produces.

> **Note:** State effects and `keyframeEffect` keyframes have opposite idiomatic forms. Keyframes are written in camelCase, because that is the form the Web Animations API uses; state effects are written in kebab-case, because that is the form CSS uses. Both surfaces accept either. CSS custom properties (`--*`) are used verbatim and are case-sensitive.

The reference state-effect example lives on [Click and hover](/click-and-hover), in kebab-case.

## Examples

### Example: a button that recolours on click

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'theme-button',
      trigger: 'click',
      effects: [
        {
          transition: {
            duration: 300,
            delay: 0,
            easing: 'ease-in-out',
            styleProperties: [
              { name: 'background-color', value: '#2563eb' },
              { name: 'color', value: '#ffffff' },
              { name: 'border-radius', value: '12px' },
            ],
          },
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="theme-button">
  <button class="theme-button">Switch theme</button>
</interact-element>
```

```css
.theme-button {
  background-color: #e5e7eb;
  color: #111827;
  border-radius: 4px;
}
```

**Result:** Clicking the button eases it over 300 ms from its light grey resting look to blue with white text and rounder corners. Clicking again eases it back along the same curve. Clicking mid-transition reverses from wherever the colour currently is.

### Example: a card whose background and scale run on different timings

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'pricing-card',
      trigger: 'hover',
      effects: [
        {
          transitionProperties: [
            {
              name: 'background-color',
              value: '#ef4444',
              duration: 200,
              delay: 0,
              easing: 'ease-out',
            },
            {
              name: 'transform',
              value: 'scale(1.05)',
              duration: 300,
              delay: 100,
              easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
          ],
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="pricing-card">
  <article class="pricing-card">…</article>
</interact-element>
```

```css
.pricing-card {
  background-color: #ffffff;
  transform: scale(1);
}
```

**Result:** Hovering the card flushes it red over 200 ms; the scale starts 100 ms later, overshoots slightly, and settles at 1.05 after 300 ms. Moving the pointer away reverses both on the same per-property timings.

### Example: a theme switcher driven by CSS custom properties

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'theme-toggle', // SOURCE
      trigger: 'click',
      effects: [
        {
          key: 'page-body', // TARGET
          effectId: 'theme-switch',
          stateAction: 'toggle',
          transition: {
            duration: 400,
            easing: 'ease-in-out',
            styleProperties: [
              { name: '--bg-color', value: '#1a1a1a' },
              { name: '--text-color', value: '#ffffff' },
              { name: '--accent-color', value: '#3b82f6' },
            ],
          },
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="theme-toggle">
  <button>Dark mode</button>
</interact-element>

<interact-element data-interact-key="page-body">
  <div class="page-body">…</div>
</interact-element>
```

```css
.page-body {
  --bg-color: #ffffff;
  --text-color: #111827;
  --accent-color: #2563eb;

  background-color: var(--bg-color);
  color: var(--text-color);
}

.page-body a {
  color: var(--accent-color);
}
```

**Result:** Clicking the button switches the whole page to the dark palette over 400 ms. Because the stylesheet reads the three custom properties, one state effect drives every rule that references them — background, text, and link colour all change together. Clicking again switches back.

## CSS custom properties as transition targets

The theme switcher sets CSS custom properties (`--bg-color`, `--text-color`, `--accent-color`) as its state values rather than concrete style properties. That works because the rest of the stylesheet reads those custom properties, for example `background-color: var(--bg-color)`, so changing the custom property cascades into every rule that references it — one state effect can drive many computed styles at once.

Browsers do not interpolate custom properties smoothly by default — the value jumps instead of transitioning — unless you register the property's type with CSS `@property`:

```css
@property --accent-color {
  syntax: '<color>';
  inherits: true;
  initial-value: #3b82f6;
}
```

Register any custom property you want to transition smoothly this way.

> **Note:** When a `transition` block contains any custom property, Interact emits `transition: all <duration>ms <easing>, visibility 0s` instead of a per-property list, so every animatable property on the keyed element shares that timing.

## Caveats

- `fill` and `composite` are animation-only options and do not apply to state effects.
- `remove` only has something stable to remove when it targets a shared `effectId`.
- Interact only handles the visual toggle — keeping semantic state such as `aria-expanded` in sync with the target, and respecting `prefers-reduced-motion`, is still your application's responsibility.

> **Warning:** An effect with no `effectId` is assigned a randomly generated one at runtime, and that id is written straight into the state rule's selector. CSS pre-generated by `generate(config)` in a separate build will therefore not match the ids the client generates at runtime, and the state will never apply. Give any state effect whose CSS you pre-generate an explicit `effectId` — usually by declaring it once in the top-level `effects` map and referencing it.

## See also

- [Click and hover](/click-and-hover) — the triggers that drive state effects, with the reference example
- [What are effects?](/what-are-effects) — how state effects sit alongside the other effect kinds
- [Time and scrub effects](/time-and-scrub-effects) — keyframe and named effects, and their camelCase property names
- [Effects array and cascading logic](/effects-array-and-cascading-logic) — what happens when several effects share a target
- [The config object](/the-config-object) — the top-level `effects` map and `effectId` references

# Custom effects

`customEffect` is Interact's imperative escape hatch. Instead of describing an animation declaratively, you hand the runtime a JavaScript function, and it calls that function on every update with the target element and the current progress. Everything in between is up to you.

Reach for it last. `namedEffect`, `keyframeEffect`, and transition effects all compile down to CSS or to native Web Animations, they cost less at runtime, and they keep the config serializable. A custom effect is for the things those cannot express at all.

## When to use a custom effect

Prefer the declarative options first:

- `namedEffect` for a registered, reusable named effect.
- `keyframeEffect` for standard Web Animations or CSS keyframes.
- `transition` or `transitionProperties` for stateful CSS changes.

Reach for `customEffect` when you need JavaScript to run on every update, in cases such as:

- Animating SVG attributes such as `stroke-dashoffset`.
- Updating counters or text content.
- Driving canvas, WebGL, or a third-party renderer.
- Writing progress into CSS custom properties so other rules can react to it.

## The callback

A custom effect is a single function placed on an effect object:

```ts
// inside interactions[]
{
  customEffect: (element, progress) => {
    if (progress === null) {
      return;
    }
    (element as HTMLElement).style.opacity = String(progress);
  },
}
```

- The first argument is the resolved target element. It is typed as `Element`, so narrow it (`element as HTMLElement`, `element as HTMLCanvasElement`) when you need a more specific DOM API.
- The second argument is the current progress. Its type depends on the trigger — see [the progress argument](#the-progress-argument).
- The callback receives exactly these two arguments, and its return value is ignored.
- `customEffect` is mutually exclusive with `namedEffect` and `keyframeEffect`. An effect must define exactly one of the three.

Every other effect option still applies: `key`, `selector`, `conditions`, and `effectId` on any effect; `duration`, `delay`, `easing`, `fill`, and `triggerType` on time effects; `rangeStart`, `rangeEnd`, and `centeredToTarget` on scrub effects.

> **Note:** A `customEffect` holds a function, so a config that uses one is no longer JSON-serializable. If your config has to travel as JSON — stored in a CMS, sent over the wire, or produced by a model — stay with `namedEffect`, `keyframeEffect`, and transition effects, and keep `customEffect` for configs authored directly in JavaScript or TypeScript.

## The progress argument

| Trigger                                                               | Kind               | Progress argument                                   |
| :-------------------------------------------------------------------- | :----------------- | :-------------------------------------------------- |
| `viewEnter`, `hover`, `click`, `activate`, `interest`, `animationEnd` | event trigger      | `number \| null`, driven by the effect's `duration` |
| `viewProgress`                                                        | continuous trigger | `number \| null`, driven by scroll position         |
| `pointerMove`                                                         | continuous trigger | a 2D progress object, never `null`                  |

## Custom effects with event triggers

For `viewEnter`, `hover`, `click`, `activate`, `interest`, and `animationEnd`, the effect is a time effect and `progress` is a `number | null`:

- `0` — the effect is at its start.
- `1` — the effect is complete.
- `null` — the animation is not running: it has been cancelled, or it sits outside its active interval. Handle `null` before you treat `progress` as a number.

### Example: counting up to a number when a section scrolls into view

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'stat',
      trigger: 'viewEnter',
      effects: [
        {
          duration: 1200,
          easing: 'ease-out',
          customEffect: (element, progress) => {
            const value = progress === null ? 0 : Math.round(2500 * progress);
            element.textContent = value.toLocaleString();
          },
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="stat">
  <p class="stat-value">0</p>
</interact-element>
```

**Result:** The number reads `0` until the paragraph scrolls into view. It then ticks up to `2,500` over 1.2 seconds, decelerating as it approaches the final figure, and stays there.

## Custom effects with `viewProgress`

For `viewProgress` the effect is a scrub effect. `progress` is still a `number | null`, but it is driven by scroll position rather than by time, so it moves backwards when the visitor scrolls up. Use `rangeStart` and `rangeEnd` to choose which part of the scroll maps to `0`–`1`; see [scroll-driven animations](/viewprogress) for the range names and offsets.

### Example: drawing an SVG line as the visitor scrolls

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'chart',
      trigger: 'viewProgress',
      effects: [
        {
          fill: 'both',
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 10 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 90 } },
          customEffect: (element, progress) => {
            const path = element.querySelector('.chart-path') as SVGPathElement | null;
            if (!path) return;

            const drawn = progress === null ? 0 : progress;
            path.style.strokeDashoffset = String(100 * (1 - drawn));
          },
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="chart">
  <svg class="chart" viewBox="0 0 400 200">
    <path class="chart-path" pathLength="100" d="M0 180 L120 90 L260 130 L400 20" />
  </svg>
</interact-element>
```

```css
.chart-path {
  fill: none;
  stroke: currentColor;
  stroke-width: 3;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
}
```

**Result:** The chart line is invisible until the SVG is 10% of the way through its pass across the viewport. From there it draws itself from left to right, reaching full length at 90%, and it retracts again if the visitor scrolls back up.

## Custom effects with `pointerMove`

`pointerMove` hands the callback a 2D progress object instead of a number. This is the `Progress` type from `@wix/motion`:

```ts
type Progress = {
  x: number;
  y: number;
  v?: { x: number; y: number };
  active?: boolean;
};
```

- `x` and `y` — the normalized pointer position within the hit area, from `0` to `1`.
- `v` — the optional velocity vector.
- `active` — whether the pointer is currently inside the hit area.

Two things are specific to custom effects here:

- The callback is never called with `null`. Pointer effects have no cancellation signal — see [cancellation and reset](#cancellation-and-reset).
- The `axis` trigger param is ignored. It only narrows a `keyframeEffect` to one axis; a custom effect always receives both.

For the trigger's own options — `hitArea`, `axis`, `centeredToTarget`, and the smoothing options — see [`pointerMove`](/pointermove).

### Example: a canvas glow that follows the pointer

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'card',
      trigger: 'pointerMove',
      params: { hitArea: 'self' },
      effects: [
        {
          customEffect: (element, progress) => {
            const canvas = element as HTMLCanvasElement;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const x = canvas.width * progress.x;
            const y = canvas.height * progress.y;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const glow = ctx.createRadialGradient(x, y, 0, x, y, 120);
            glow.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
            glow.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          },
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="card">
  <canvas class="card-glow" width="600" height="400"></canvas>
</interact-element>
```

**Result:** A soft white halo tracks the pointer across the card, brightest directly under the cursor and fading out about 120 pixels away. The halo stops updating once the pointer leaves the card, leaving the last frame painted.

## Cancellation and reset

When a time effect or a `viewProgress` effect is cancelled, the runtime calls the callback one final time with `progress === null`. Treat that as your reset hook. It fires when:

- The interaction is torn down — the keyed element is disconnected, or `Interact.destroy()` runs.
- An effect with `triggerType: 'repeat'` rewinds, such as a hover that ends or a click that restarts the animation.

Use it to clear inline styles, restore text content, reset CSS custom properties, and return the element to a neutral visual state.

> **Warning:** `pointerMove` effects never receive `null`. Whatever a pointer-driven custom effect last wrote to the DOM stays there after the interaction is destroyed, so undo it yourself if that matters.

### Example: clearing a canvas when the effect is cancelled

```ts
// inside interactions[]
{
  customEffect: (element, progress) => {
    const canvas = element as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (progress === null) {
      return;
    }

    ctx.fillRect(0, 0, canvas.width * progress, 8);
  },
}
```

**Result:** A bar fills across the top of the canvas as the effect plays. The moment the effect is cancelled, the canvas is wiped and no bar remains.

## When a custom effect is not enough

A custom effect can only reach elements that already exist. When the markup you want to animate has to be created first — per-character spans for a staggered text animation, an injected overlay — a plugin is the next escape hatch. Plugins run at connect time, before the interaction's effects are set up, so the DOM they create is available to the effects that follow. See [plugins](/plugins).

## See also

- [What are effects?](/what-are-effects) — the effect kinds and how they differ.
- [Time and scrub effects](/time-and-scrub-effects) — which options apply to which kind.
- [`pointerMove`](/pointermove) — hit areas, axes, centering, and smoothing.
- [Scroll-driven animations](/viewprogress) — range names and offsets for `rangeStart` and `rangeEnd`.
- [Plugins](/plugins) — creating DOM before effects run.

# Plugins

A plugin is external code that Interact hands a piece of your configuration to. Reach for one when an effect needs DOM that does not exist yet — splitting a headline into per-character spans, wrapping content in an overlay, mounting a canvas — or when the behavior you need falls outside what triggers and effects can express. Where `customEffect` is the escape hatch _inside_ an animation, a plugin is the escape hatch _around_ it: it runs before the animations are wired up, so it can change the elements they will target.

Interact is a generic bridge here. It knows a plugin only by the name it was registered under, and it never inspects what the plugin does or what its configuration contains. `@wix/interact` ships no plugins and depends on no plugin package, and a plugin package (such as [`@wix/splittext`](https://github.com/wix/interact/tree/master/packages/splittext)) needs no dependency on `@wix/interact`.

## How it works

1. Register a callback under a name with `Interact.use()`.
2. Add a `$<name>` field to an interaction or an effect in the config.
3. When the keyed element connects, Interact calls the plugin with that field's value and a context describing where the field was found.
4. If the plugin returns a function, Interact keeps it and runs it as cleanup on teardown.

A `$` field naming a plugin that was never registered is ignored — no warning, no error.

## Registering a plugin

Register plugins before `Interact.create()`. Elements can connect as soon as the configuration is created, and only the plugins present in the registry at that moment run.

```ts
import { Interact } from '@wix/interact';

Interact.use('myPlugin', (value, context) => {
  // `value` is whatever the config put in the `$myPlugin` field
  // `context` describes where it was found
  // return an optional cleanup function
});
```

| Member                       | Description                                                                                    |
| :--------------------------- | :--------------------------------------------------------------------------------------------- |
| `Interact.use(name, plugin)` | Registers `plugin` under `name`. Registering the same name again replaces the previous plugin. |
| `Interact.getPlugin(name)`   | Returns the plugin registered under `name`, or `undefined`.                                    |
| `Interact.getPluginsNames()` | Returns a `Set` of every registered plugin name.                                               |

The registry is static and shared: the same three members exist on the `Interact` class exported from `@wix/interact`, `@wix/interact/web`, and `@wix/interact/react`, and a plugin registered through one entry point is visible to all of them.

## The `$<name>` field

Plugin configuration lives in fields whose names start with `$`. The rest of the field name is the registered plugin name, so `$splitText` routes to the plugin registered as `splitText`. Because `$` is a valid identifier start in JavaScript, TypeScript, and JSON, the key needs no quotes.

The value is opaque. Interact passes it through untouched, so it can be any shape the plugin understands.

A `$` field is valid on an **interaction** and on an **effect**, and its placement decides which element the plugin acts on:

| Placement         | `context.root`                    | `context.key`                                                           | `context.scope` |
| :---------------- | :-------------------------------- | :---------------------------------------------------------------------- | :-------------- |
| On an interaction | the interaction's keyed element   | the interaction's `key`                                                 | `'interaction'` |
| On an effect      | the effect's target keyed element | the effect's `key`, or the interaction's `key` when the effect has none | `'effect'`      |

```ts
// inside interactions[]
{
  key: 'hero',
  trigger: 'viewEnter',
  $myPlugin: { any: 'value' },
  effects: [{ effectId: 'fade-in' }],
}
```

> **Warning:** plugin fields are recognized on interactions and effects only. A `$` field on a sequence or at the top level of the config is never routed to a plugin, and `@wix/interact-validate` rejects it.

### Typing plugin fields

`$` fields are typed through declaration merging on the `InteractPluginConfigMap` interface, keyed by the **unprefixed** plugin name. Interact ships it empty, and your app is usually the only place that knows about both packages:

```ts
declare module '@wix/interact' {
  interface InteractPluginConfigMap {
    myPlugin: { any: string };
  }
}
// `$myPlugin` is now typed as `{ any: string }` on interactions and effects
```

Fields for plugins you have not declared stay legal — any other `$`-prefixed key is accepted with an `unknown` value.

## When plugins run

Plugins run at connect time, **before** Interact resolves the effect targets. DOM that a plugin creates is therefore already in place when an effect's `selector` runs, which is what lets an effect animate elements that only the plugin knows how to produce.

Two further rules:

- Each distinct plugin value is applied at most once per connect, even when several triggers on the same element carry it.
- A `$` field on an interaction runs only while that interaction's `conditions` match, so a plugin scoped to a media condition does not run outside it.

## Teardown

A plugin that changes the DOM should return a cleanup function that undoes the change:

```ts
Interact.use('overlay', (value, { root }) => {
  const el = document.createElement('div');
  el.className = 'overlay';
  root.appendChild(el);

  return () => el.remove();
});
```

Interact runs the stored cleanups when:

- the keyed element disconnects,
- `Interact.destroy()` tears everything down,
- the element reconnects after a media-query change — the cleanup runs on the way out, and the plugin runs again on the way back in.

Cleanups run after Interact has torn down the animations that were attached to the (possibly plugin-generated) elements. Each cleanup is called in isolation: one that throws is logged to the console, and the remaining cleanups still run.

> **Warning:** the cleanup must fully undo the plugin's work. Because a media-query change re-runs the plugin on reconnect, anything left behind is applied twice.

## Pre-generating plugin CSS

A runtime plugin can only touch the DOM once JavaScript has loaded. To style the element _before_ that — typically to hide content the plugin is about to replace, avoiding a flash of unstyled content (FOUC) — a plugin also supplies a build-time style generator. This is a **second, separate callback**, passed to `generate()` rather than to `Interact.use()`.

```ts
import { generate } from '@wix/interact/web';

const css = generate(config, {
  useFirstChild: true,
  plugins: { myPlugin: myPluginStyle },
});
```

`generate()`'s second argument is a `GenerateOptions` bag (it still accepts a bare boolean as the legacy `useFirstChild` form):

| Name            | Type                   | Default | Description                                                                                                                        |
| :-------------- | :--------------------- | :------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| `useFirstChild` | `boolean`              | `true`  | Whether to target the keyed element's first child. `true` for the web entry point; `false` for the vanilla and React integrations. |
| `plugins`       | `InteractPluginStyles` | none    | Map of plugin name to style generator. `InteractPluginStyles` is `Record<string, InteractPluginStyleGenerator>`.                   |

A style generator receives the same opaque value as the runtime plugin, plus a DOM-free context, and returns partial CSS rules:

```ts
type InteractPluginStyleGenerator = (
  value: unknown,
  context: {
    key: string;
    scope: 'interaction' | 'effect';
    config: Record<string, unknown>;
  },
) => { declarations: { name: string; value: string | number }[]; selectorSuffix?: string }[];
```

Each returned rule is emitted as `[data-interact-key="<key>"]<selectorSuffix> { … }`, with `declarations` written out as CSS property/value pairs. If the interaction or effect carries media `conditions`, the rule is wrapped in the matching `@media` query.

> **Note:** `generate()` never inspects a `$` field's value — it only routes it to the matching generator and appends whatever comes back. A `$` field with no matching entry in `plugins` is skipped, and calling `generate()` without the `plugins` option emits no plugin CSS at all.

The usual pairing is for the build-time rule to hide the element until a marker attribute appears, and for the runtime plugin to set that attribute once it has finished.

## Validation

[`@wix/interact-validate`](https://github.com/wix/interact/tree/master/packages/interact-validate) treats a `$`-prefixed key as opaque plugin configuration and does not look inside it — it has no knowledge of any plugin. This is the only unknown key it accepts on an interaction or an effect. Every other unrecognized key is reported as `SCHEMA_UNRECOGNIZED_KEYS`, so typos are still caught, including a plugin field that lost its `$`. The prefix must be followed by a name: a key of just `$` is not a plugin field.

## Example: splitting a headline and staggering its characters

`@wix/splittext` splits an element's text into `<span>` wrappers — `.split-c` for characters, `.split-w` for words, `.split-l` for lines, `.split-s` for sentences. Those spans do not exist in the markup, so nothing can target them until the split has run; the plugin ordering guarantee is what makes the pattern work.

Do not hand-roll the adapter. `@wix/splittext/plugin` ships both callbacks — `splitTextPlugin` for the runtime and `splitTextStyle` for build-time CSS — already paired on a `data-splittext-ready` marker.

```html
<interact-element data-interact-key="hero">
  <section class="hero">
    <h1 class="title">Motion, made declarative</h1>
    <p class="subtitle">Describe the interaction; the library runs the animation.</p>
  </section>
</interact-element>
```

```ts
const config: InteractConfig = {
  effects: {
    'char-rise': {
      keyframeEffect: {
        name: 'char-rise',
        keyframes: [
          { opacity: 0, transform: 'translateY(0.4em)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
      },
      duration: 400,
      easing: 'ease-out',
      fill: 'backwards',
    },
  },
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      // split `.title` into characters before the sequence resolves its targets
      $splitText: { container: '.title', type: 'chars', hideUntilReady: true },
      sequences: [
        {
          offset: 30,
          offsetEasing: 'quadIn',
          // stagger the generated character spans
          effects: [{ effectId: 'char-rise', selector: '.split-c' }],
        },
      ],
    },
  ],
};
```

Register the runtime plugin before creating the instance, and pass its style generator to `generate()`:

```ts
import { Interact, generate } from '@wix/interact/web';
import { splitTextPlugin, splitTextStyle } from '@wix/splittext/plugin';

Interact.use('splitText', splitTextPlugin);

// At build or server-render time — inject the result into <head>
const css = generate(config, {
  useFirstChild: true,
  plugins: { splitText: splitTextStyle },
});

Interact.create(config);
```

Type the `$splitText` field once, in the single module that imports both packages:

```ts
import type { SplitTextPluginConfig } from '@wix/splittext/plugin';

declare module '@wix/interact' {
  interface InteractPluginConfigMap {
    splitText: SplitTextPluginConfig;
  }
}
```

**Result:** On first paint the headline is invisible, because `hideUntilReady` made `splitTextStyle` emit `[data-interact-key="hero"] .title:not([data-splittext-ready]) { visibility: hidden; }` into the pre-generated CSS. As soon as the hero element connects, the plugin rewrites the headline into one `.split-c` span per character and marks the container ready, so the headline is revealed — now composed of one span per character — and the sequence has real elements to bind to. When the hero scrolls into view, each character fades and lifts into place 30 ms after the one before it, with the stagger interval eased by `quadIn`. If the element is later removed, the plugin's cleanup reverts the split and restores the original text.

## See also

- [Custom effects](/custom-effects)
- [The config object](/the-config-object)
- [HTML integration: preventing FOUC](/html-integration#preventing-fouc)
- [`@wix/splittext`](https://github.com/wix/interact/tree/master/packages/splittext)
- [`@wix/interact-validate`](https://github.com/wix/interact/tree/master/packages/interact-validate)

# Interactions

# What is an interaction?

An interaction is the connection between a trigger and the effects it runs. It is the unit you configure in Interact: you declare _when_ something should happen — a section scrolls into view, a button is clicked, the pointer moves across a card — and _what_ should happen in response. Interact keeps the two wired together.

Concretely, an interaction names one keyed element, one trigger, and a list of effects or sequences. There is no timeline to build by hand and no listener to attach: the configuration describes the behaviour, and the runtime produces it.

## How it works

An interaction is plain data — an object in the config's `interactions` array. At runtime Interact resolves its `key` to a DOM element, sets up whatever the trigger needs (an event listener for `click` and `hover`, an `IntersectionObserver` for `viewEnter`, a scroll-driven timeline for `viewProgress`), and hands each effect to `@wix/motion`, which plays it through the Web Animations API.

Because the trigger is described on the interaction and the animation is described on the effect, the element that listens does not have to be the element that animates. [Source and target resolving](/source-and-target-resolving) explains how each one is located.

## Anatomy of an interaction

| Field        | Required | What it does                                                                                                                       |
| :----------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `key`        | yes      | Identifies the element the trigger attaches to.                                                                                    |
| `trigger`    | yes      | What starts the interaction: `viewEnter`, `click`, `hover`, `viewProgress`, `pointerMove`, `animationEnd`, `activate`, `interest`. |
| `params`     | no       | Trigger-specific options, such as the `threshold` of a `viewEnter` observer.                                                       |
| `conditions` | no       | Names of conditions declared elsewhere in the config that must hold for the interaction to run.                                    |
| `effects`    | no       | The animations to run when the trigger fires.                                                                                      |
| `sequences`  | no       | Groups of effects that run together with a shared offset, for staggered motion.                                                    |

An interaction with neither `effects` nor `sequences` does nothing, so in practice at least one of the two is always present.

## A complete interaction

### Example: fading a headline in when it enters the viewport

The smallest useful interaction: one keyed element, one trigger, one effect, and the same element on both ends.

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'hero-headline',
      trigger: 'viewEnter',
      effects: [
        {
          namedEffect: { type: 'FadeIn' },
          duration: 600,
          triggerType: 'once',
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="hero-headline">
  <h1>Welcome</h1>
</interact-element>
```

The effect carries no `key` of its own, so it targets the same element the trigger is attached to.

**Result:** The headline is invisible until the visitor scrolls it into view, then fades up to full opacity over 600 ms. `triggerType: 'once'` means it plays on the first entry only — scrolling away and back does not replay it.

> **Note:** An entrance-animated element is styled in its final, visible state, so it can flash at full opacity before the runtime applies the first keyframe. See [preventing FOUC](/html-integration#preventing-fouc) for the CSS to emit alongside this config.

## One trigger, multiple effects

A single trigger can drive several effects at once, across several elements. A section entering the viewport is one trigger; revealing the headline, animating the image, staggering the cards, and transitioning the background are four effects. They all live in the same interaction's `effects` array.

That grouping is the point. Instead of four independent pieces of logic that each have to work out when to run, you describe one behaviour — when this section arrives, this is what happens — in one place.

Every effect in the array names its own target and its own animation, so the four can land on four different elements. [Effects array and cascading logic](/effects-array-and-cascading-logic) covers how a longer array behaves; when the effects should also be offset from one another, promote them to a sequence.

## See also

- [What is a trigger?](/what-is-a-trigger)
- [What are effects?](/what-are-effects)
- [Source and target resolving](/source-and-target-resolving)
- [Effects array and cascading logic](/effects-array-and-cascading-logic)
- [What is a sequence?](/what-is-a-sequence)

# Source and target resolving

Every interaction in Interact binds a **trigger** to one or more **effects**. That binding is the key to a lot of the library's flexibility: because the trigger and the effect are described separately, the element that _listens_ for the interaction (the **source**) does not have to be the element that gets _animated_ (the **target**).

- The **source** is where the trigger attaches — the element that is hovered, clicked, scrolled into view, or moved over.
- The **target** is where the effect runs — the element that fades, moves, scales, or changes color.

For the majority of interactions the source and the target are the same element, and you never have to think about the distinction. But when they differ, this chapter explains exactly how each element is located.

## Source and target can be different elements

Because the trigger lives on the interaction and the animation lives on the effect, one element can trigger/drive an animation on a completely different element. A classic example is a menu button that opens a sidebar:

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'menu-button', // SOURCE — the click is detected here
      trigger: 'click',
      effects: [
        {
          key: 'sidebar', // TARGET — the animation runs here
          namedEffect: { type: 'SlideIn' },
          duration: 300,
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="menu-button">
  <button>☰ Menu</button>
</interact-element>

<interact-element data-interact-key="sidebar">
  <aside class="sidebar">...</aside>
</interact-element>
```

**Result:** Clicking the button slides the sidebar in. The trigger and the effect refer to two different elements, wired together purely through configuration.

The same interaction can also fan out to several targets at once — a single trigger with multiple effects, each pointing at a different element — but the underlying idea is always the same: source and target are resolved independently. For more information about multiple effects on the same interaction see [Effects array and cascading logic](/effects-array-and-cascading-logic).

## The `ElementIdentifier`

Both the source (on the interaction) and the target (on the effect) are described with the same small shape, the `ElementIdentifier`:

```ts
type ElementIdentifier = {
  key: string; // the root element
  selector?: string; // refine to descendant(s) of the root
  listContainer?: string; // treat a container's children as a list
  listItemSelector?: string; // filter which children participate
};
```

These four fields appear on the interaction (describing the **source**) and on every effect (describing the **target**).

### `key` — the main identifier

`key` is the primary identifier and the only required field. It matches the value you assign when binding an element:

| Integration | How the key is assigned                                     |
| :---------- | :---------------------------------------------------------- |
| Web         | `data-interact-key="hero"` on `<interact-element>`          |
| React       | `interactKey="hero"` on `<Interaction>`                     |
| Vanilla JS  | `add(element, 'hero')` (or a `data-interact-key` attribute) |

On the interaction, `key` is mandatory — the trigger has to attach _somewhere_. On the effect, `key` is **optional**: when you omit it, the effect inherits the interaction's `key`, so the effect targets the same root as the source. This is what makes self-targeting effects so concise:

```ts
// inside interactions[]
{
  key: 'cta',
  trigger: 'hover',
  effects: [
    // No key → the effect targets 'cta', the same element as the trigger.
    { namedEffect: { type: 'Pulse' }, duration: 400 },
  ],
}
```

(If the effect is an `EffectRef` pointing at a shared entry in the `effects` registry, an omitted `key` falls back to the registry entry's `key` before finally falling back to the interaction's `key`.)

### The other selectors — granular selection

`selector`, `listContainer`, and `listItemSelector` narrow the identifier down from the root `key` to a more specific element (or set of elements). They are covered in detail in the [FOUC and refined targets](/source-and-target-resolving#when-source-and-target-differ-fouc-and-refined-targets) and [Lists](/source-and-target-resolving#lists-listcontainer-and-listitemselector) sections below.

### Identical identifiers mean the same element

Interact compares the **whole** `ElementIdentifier` — all four fields, not just `key` — to decide whether two references point at the same element. Two identifiers with the same `key`, `selector`, `listContainer`, and `listItemSelector` are treated as identifying the exact same element(s); if any field differs, they are treated as different elements.

## When source and target differ: FOUC and refined targets

Entrance animations are a good illustration of why you sometimes _want_ the source and target to differ. An element with an entrance effect (say `viewEnter` + `FadeIn`) is styled in its final, visible state. Before the runtime applies the animation's starting keyframe (e.g. `opacity: 0`), the element flashes at full opacity — a **flash of unstyled content (FOUC)**.

To prevent this, `generate()` emits the applied animation effect, plus initial-state CSS that may be required for first paint in special cases. The moment the identifiers diverge, Interact considers them separate elements and does not auto-generate that special initial state.

In some cases it is required to separate source and target elements. Animating the very element you observe or hover can be counter-productive:

- A `viewEnter` effect that moves or resizes the observed element can push it back out of (or into) the viewport, causing it to re-trigger.
- A `hover` or `pointerMove` effect that scales or translates the hovered element shifts its own hit-area, producing jittery enter/leave cycles. See [Hit-area shift](/source-and-target-resolving#hit-area-shift).

The fix is to keep the trigger on a stable outer element and refine the **target** down to an inner child with `selector`:

```ts
// inside interactions[]
{
  key: 'hero',            // SOURCE — observe the whole section entering the viewport
  trigger: 'viewEnter',
  effects: [
    {
      key: 'hero',        // same root element...
      selector: '.hero-content', // ...but the TARGET is refined to a child
      namedEffect: { type: 'FadeIn' },
      duration: 800,
    },
  ],
}
```

```html
<interact-element data-interact-key="hero">
  <section class="hero">
    <div class="hero-content">
      <!-- The animation runs here -->
      <h1>Welcome</h1>
      <p>Subtitle</p>
    </div>
  </section>
</interact-element>
```

**Result:** The section as a whole is observed for viewport entry, while only `.hero-content` fades in. Because the effect's identifier (`key: 'hero'` + `selector: '.hero-content'`) is no longer identical to the interaction's identifier (`key: 'hero'`), Interact treats them as different elements — so the automatic FOUC initial special state does not cover this split target, and you should apply the starting keyframe to it yourself (for example, an initial `opacity: 0` in the effect, together with `fill: 'both'`).

### These fields refine source and target independently

This is the most important rule to internalize: `selector`, `listContainer`, and `listItemSelector` **behave differently depending on where they appear**.

- On the **interaction**, they refine the **source** — which element the trigger attaches to.
- On the **effect**, they refine the **target** — which element the animation runs on.

And unlike `key`, they are **not inherited** from the interaction to the effect. Omitting `key` on an effect makes it fall back to the interaction's key; omitting `selector` on an effect does **not** make it fall back to the interaction's `selector`.

```ts
// inside interactions[]

// ❌ The effect has no selector, so its target is the ROOT of 'card',
//    NOT '.card-content'. The interaction's selector is not inherited.
{
  key: 'card',
  selector: '.card-content', // refines the SOURCE only
  trigger: 'hover',
  effects: [
    { key: 'card', namedEffect: { type: 'Pulse' }, duration: 300 },
  ],
}

// ✅ Refine the source and the target independently.
{
  key: 'card',
  selector: '.card-content', // SOURCE: hover is detected on .card-content
  trigger: 'hover',
  effects: [
    {
      key: 'card',
      selector: '.card-image', // TARGET: the animation runs on .card-image
      namedEffect: { type: 'Pulse' },
      duration: 300,
    },
  ],
}
```

> **Tip:** If you need `selector` / `listContainer` / `listItemSelector` on both the source and the target, specify them explicitly in both places.

## Hit-area shift

> **Critical:** Never let a `hover`, `click`, or `pointerMove` effect change the size or position of the element the pointer is tracking. Animate a child instead.

There is one failure mode that comes up often enough to deserve its own treatment, because the config that causes it looks perfectly reasonable: a `hover` or `click` effect that moves or resizes the very element the pointer is sitting on.

The loop is easy to picture. The pointer enters the element and the effect starts. The element scales up, or slides, or grows — and in doing so its box moves out from under the pointer. The browser fires a leave event, so the effect reverses. The element returns to its original geometry, which puts it back under the pointer, so the browser fires an enter event and the effect starts again. The element flickers for as long as the visitor's pointer rests anywhere near the boundary.

This is a geometry problem, not a configuration problem. Any property that changes the interactive element's box will do it:

- `transform` functions: `translate(…)`, `scale(…)`, `rotate(…)`, and `matrix(…)`.
- The individual transform properties `translate`, `scale`, and `rotate`.
- Box metrics: `width`, `height`, `padding`, `margin`, `inset`, `top` / `left`, and `font-size` on an auto-sized element.

It applies to every trigger that tracks the pointer against an element's own bounds: `hover`, `click`, `interest`, `activate`, and `pointerMove` with the default `hitArea: 'self'`. `pointerMove` with `hitArea: 'root'` is immune, because the hit area is the viewport rather than the element, so moving the element cannot change it.

The fix is always the same: keep the geometry of the element that receives the pointer fixed, and animate a child instead. The source element stays exactly where it is and keeps exactly its original size, so enter and leave fire once each; the child inside it is free to move as much as the design calls for.

### Example: zooming a card image on hover without flicker

```ts
// inside interactions[]

// ❌ The hovered element scales, so its own hit area moves with it.
{
  key: 'card',
  trigger: 'hover',
  effects: [
    {
      keyframeEffect: {
        name: 'card-zoom',
        keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }],
      },
      duration: 200,
      triggerType: 'alternate',
      fill: 'both',
    },
  ],
}

// ✅ The hovered element keeps its box; a child scales instead.
{
  key: 'card', // SOURCE — geometry never changes
  trigger: 'hover',
  effects: [
    {
      key: 'card',
      selector: '.card-image', // TARGET — a child is free to move
      keyframeEffect: {
        name: 'card-zoom',
        keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }],
      },
      duration: 200,
      triggerType: 'alternate',
      fill: 'both',
    },
  ],
}
```

```html
<interact-element data-interact-key="card">
  <article class="card">
    <img class="card-image" src="/thumb.jpg" alt="" />
    <h3>Card title</h3>
  </article>
</interact-element>
```

```css
.card {
  overflow: hidden;
}
```

**Result:** Hovering the card zooms the image inside it and un-zooms it on the way out. The card's own box never moves, so the pointer stays inside it for the whole gesture and the animation plays once in each direction instead of flickering. `overflow: hidden` keeps the enlarged image from spilling past the card's edge, which would otherwise re-introduce the same problem.

### What the validator catches — and what it misses

[`@wix/interact-validate`](https://github.com/wix/interact/tree/master/packages/interact-validate) has a rule for this, `HIT_AREA_SHIFT`, in `src/semantic/fouc.ts`. It raises a warning when an interaction uses one of the pointer-bound triggers, the effect resolves to the same element as the source, and one of the effect's keyframes carries a `transform` **string** containing `translate`, `scale`, or `matrix`.

> **Warning:** That rule only ever inspects `transform` **strings** inside an inline `keyframeEffect`. Everything else slips past it silently. In particular:
>
> - Bare `scale`, `translate`, and `rotate` keyframe properties — the individual transform properties, which real effects do use — are never examined.
> - `transform: 'rotate(…)'` is not in the pattern.
> - Box metrics such as `width`, `height`, and `padding` are not in the pattern.
> - Anything supplied through `namedEffect` or `customEffect` is not inspected at all, because the rule reads `keyframeEffect.keyframes` only.
>
> A clean validation run is therefore not evidence that the hit area is stable. Check the geometry yourself whenever a pointer-driven effect targets its own source.

## Lists: `listContainer` and `listItemSelector`

When you have a repeating structure — a grid of cards, a list of items — you rarely want to declare an interaction per item. `listContainer` tells Interact to treat the children of a container as a set, binding the same interaction (as source) or effect (as target) to each of them.

```ts
// inside interactions[]
{
  key: 'gallery',
  listContainer: '.gallery-grid', // each child of .gallery-grid is a source
  trigger: 'hover',
  effects: [
    {
      key: 'gallery',
      listContainer: '.gallery-grid', // each child of .gallery-grid is a target
      namedEffect: { type: 'Pulse' },
      duration: 300,
    },
  ],
}
```

```html
<interact-element data-interact-key="gallery">
  <div class="gallery-grid">
    <div class="gallery-item">Item 1</div>
    <div class="gallery-item">Item 2</div>
    <div class="gallery-item">Item 3</div>
  </div>
</interact-element>
```

**Result:** Every direct child of `.gallery-grid` gets its own hover interaction, independently. Items added or removed later are tracked automatically.

`listItemSelector` is an **optional** filter. Use it only when a subset of the container's children should participate — for example, animating only the `.active` items:

```ts
// inside interactions[]
{
  key: 'steps',
  listContainer: '.steps',
  listItemSelector: '.active', // only .active children become sources/targets
  trigger: 'viewEnter',
  effects: [
    {
      key: 'steps',
      listContainer: '.steps',
      listItemSelector: '.active',
      namedEffect: { type: 'FadeIn' },
      duration: 500,
    },
  ],
}
```

When `listItemSelector` is omitted, **all** immediate children of the container participate. When you combine `listContainer` with `selector` instead, Interact runs `querySelector` inside each direct child of the container — handy for animating one specific element within every list item.

Lists are also the foundation for staggered, coordinated animations. For the full picture — mutation tracking, staggered entrances, and using `listContainer` inside sequences — see [Using lists](/using-lists) and [Using sequences](/using-sequences).

## Recap: how an `ElementIdentifier` resolves to an element

Both the source (on the interaction) and the target (on the effect) resolve through the same steps. The only difference between them is the starting `key`:

1. **Determine the root `key`.**
   - On the **interaction**, `key` is required.
   - On the **effect**, use the effect's own `key`; if omitted, fall back to the referenced registry entry's `key` (for an `EffectRef`), and finally to the interaction's `key`.
   - Resolve that key to a root element: the element registered for the key (React / Vanilla), or its first child (Web `<interact-element>`).
2. **If `listContainer` is set**, find the container inside the root, then pick the elements within it:
   - with `listItemSelector` → every descendant matching `listItemSelector`;
   - with `selector` → `querySelector` within each direct child of the container;
   - alone → every direct child of the container.
3. **Else if `selector` is set**, use `querySelector` within the root to select first matching descendant.
4. **Else**, use the root itself (React / Vanilla) or the root's first child (Web).

The resulting element(s) become the **source** when the identifier is on an interaction, or the **target** when it is on an effect. Two identifiers that are equal across all four fields resolve to the same element(s); any difference makes them distinct.

## See also

- [What is an interaction?](/what-is-an-interaction)
- [Effects array and cascading logic](/effects-array-and-cascading-logic)
- [Click and hover](/click-and-hover)
- [`pointerMove`](/pointermove)
- [Using lists](/using-lists)

# Effects array and cascading logic

Because a trigger and its effects are described separately, a single trigger doesn't have to drive a single animation. An interaction holds an **array** of effects, and every effect in that array fires from the same trigger event. Since each effect resolves its own separate target, one trigger can orchestrate a whole set of animations across many different elements at once.

## One trigger, many targets

The `effects` array is how you compose a scene. Each entry is an independent effect with its own target and its own animation payload; they all fire together when the trigger activates.

### Example: one trigger animating four elements of a hero section

Here's a hero section that comes to life as a single unit when it scrolls into view — the background fades, the heading glides in, the subtitle follows, and the call-to-action pops — all from one `viewEnter` interaction:

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'hero', // SOURCE — one trigger observes the section entering the viewport
      trigger: 'viewEnter',
      effects: [
        {
          key: 'hero-bg', // TARGET 1 — the background image
          namedEffect: { type: 'FadeIn' },
          duration: 1000,
        },
        {
          key: 'hero-title', // TARGET 2 — the heading
          namedEffect: { type: 'GlideIn' },
          duration: 800,
        },
        {
          key: 'hero-subtitle', // TARGET 3 — the subtitle
          namedEffect: { type: 'FadeIn' },
          duration: 800,
          delay: 200,
        },
        {
          key: 'hero-cta', // TARGET 4 — the button
          namedEffect: { type: 'BounceIn' },
          duration: 600,
          delay: 400,
        },
      ],
    },
  ],
};
```

**Result:** A single trigger choreographs four elements. Each effect points at a different element, so they animate side by side without interfering with one another. This is the everyday use of the `effects` array — spreading one trigger across several distinct targets.

## Multiple effects on the same target override each other

Both `namedEffect` and `keyframeEffect` are ultimately compiled down to the CSS `animation` property on their target element. When two such effects in the same interaction land on the **exact same element**, the one applied last overrides the ones before it — the earlier animations do not show.

> **Note:** What counts as "the same element"? Interact compares the whole `ElementIdentifier` (`key` plus `selector` / `listContainer` / `listItemSelector`). Two effects with matching identifiers resolve to the same element; if any field differs, they are different elements. See [Source and target resolving](/source-and-target-resolving) for the details.

This means the `effects` array is **not** the tool for layering several animations onto a single element:

```ts
// inside interactions[]
// ❌ Both effects target the same element ('panel'). The 'grow' animation
//    overrides 'slide' — only the last one runs.
{
  key: 'panel',
  trigger: 'viewEnter',
  effects: [
    {
      keyframeEffect: {
        name: 'slide',
        keyframes: [{ transform: 'translateX(-40px)' }, { transform: 'translateX(0)' }],
      },
      duration: 600,
    },
    {
      keyframeEffect: {
        name: 'grow',
        keyframes: [{ transform: 'scale(0.8)' }, { transform: 'scale(1)' }],
      },
      duration: 600,
    },
  ],
}
```

To play multiple animations together on one element, use a sequence instead. The effects inside a sequence are coordinated into a single timeline and never override one another — they combine into one orchestrated animation. See [What is a sequence?](/what-is-a-sequence) and [Using sequences](/using-sequences).

## The `sequences` array works the same way, with one difference

An interaction can also hold an array of `sequences`, and it behaves just like the `effects` array at the top level: every sequence fires from the same trigger, and each sequence can carry its own `conditions`, so the array defines the same kind of conditional cascade.

The difference is what happens **inside** each entry. Where two effects targeting the same element in the `effects` array override each other, the effects _within a single sequence_ can coexist on the same target — they're merged into one coordinated timeline rather than competing for the element's `animation` property. That's exactly why sequences are the right choice for layering animations on one element.

## The array as a cascade: conditional, responsive effects

If stacking effects on one target overrides, why would you ever point two effects at the same element on purpose? For **responsive and conditional behavior**.

Each effect can carry its own `conditions`. Combined with the last-one-wins override, the `effects` array becomes an ordered **cascade** for a single target — much like the CSS cascade. You list variants of the same animation, each gated by a condition, and order them from the most general fallback to the most specific override. Whichever conditions match determine what runs, and when more than one matches, the effect placed later wins.

### Example: a responsive cascade on a single target

```ts
const config: InteractConfig = {
  conditions: {
    desktop: { type: 'media', predicate: '(min-width: 1024px)' },
    'reduced-motion': { type: 'media', predicate: '(prefers-reduced-motion: reduce)' },
  },
  interactions: [
    {
      key: 'panel',
      trigger: 'viewEnter',
      effects: [
        // Baseline for every device — no conditions, so it's the fallback.
        {
          namedEffect: { type: 'FadeIn' },
          duration: 400,
        },
        // Richer motion on larger screens — overrides the baseline when it matches.
        {
          namedEffect: { type: 'SlideIn' },
          duration: 700,
          conditions: ['desktop'],
        },
        // Accessibility override — wins wherever the user asked for reduced motion.
        {
          namedEffect: { type: 'FadeIn' },
          duration: 200,
          conditions: ['reduced-motion'],
        },
      ],
    },
  ],
};
```

**Result:** All three effects target the same `panel`, but only the ones whose conditions match are applied — and their order defines the cascade. Because a later applicable effect overrides an earlier one, place broad defaults first and the higher-priority overrides last. For everything you can express with conditions, see [Understanding conditions](/understanding-conditions).

## See also

- [What is an interaction?](/what-is-an-interaction)
- [Multi-interaction compositions](/multi-interaction-compositions)
- [Source and target resolving](/source-and-target-resolving)
- [Understanding conditions](/understanding-conditions)
- [What is a sequence?](/what-is-a-sequence)

# Multi-interaction compositions

[Effects array and cascading logic](/effects-array-and-cascading-logic) showed how one trigger can drive many effects across many targets. The separation of trigger and effect works just as well in the other direction: because an effect names its own target independently of any trigger, several **different triggers** can each drive their own animation on the **same** element.

This is what makes rich, layered motion possible. A single element can react to scrolling, to the pointer, and to hover — all at once — by being the target of several interactions, each built around a different trigger type. You compose the behavior not by cramming everything into one interaction, but by pointing multiple interactions at the same element.

## Combining trigger types on one target

Here is a feature card that is alive on three axes simultaneously:

- it **drifts upward as you scroll** (`viewProgress`),
- it **tilts in 3D toward the cursor** (`pointerMove`, driven from the surrounding section),
- and it **scales up on hover** (`hover`).

Each behavior is its own interaction, and all three effects target `feature-card`.

> **Tip:** For a 3D tilt like the one below, put `perspective()` inside the keyframes' `transform` value rather than setting the CSS `perspective` property on an ancestor. Reach for the CSS property only when several children need to share the same `perspective-origin`.

### Example: a card that reacts to scroll, pointer, and hover at once

```ts
const config: InteractConfig = {
  conditions: {
    'hover-device': { type: 'media', predicate: '(hover: hover)' },
  },
  interactions: [
    // 1. Scroll-driven — the card parallaxes as the section scrolls through the viewport.
    {
      key: 'feature-card',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'feature-card',
          namedEffect: { type: 'ParallaxScroll', range: 'continuous' },
          rangeStart: { name: 'entry' },
          rangeEnd: { name: 'exit' },
        },
      ],
    },
    // 2. Pointer-driven — the card tilts toward the cursor. Sourced from the whole
    //    showcase section, so the tilt reacts to the pointer around the card, not only over it.
    {
      key: 'showcase', // SOURCE differs from the target
      trigger: 'pointerMove',
      params: { hitArea: 'self' },
      conditions: ['hover-device'],
      effects: [
        {
          key: 'feature-card', // TARGET — the same card
          keyframeEffect: {
            name: 'card-tilt',
            keyframes: [
              { transform: 'perspective(800px) rotateX(-15deg)' },
              { transform: 'perspective(800px) rotateX(15deg)' },
            ],
          },
          centeredToTarget: true, // 0.5 progress = pointer over the card's center
          fill: 'both',
          composite: 'add',
        },
      ],
    },
    // 3. Hover — the card lifts and scales.
    {
      key: 'feature-card',
      trigger: 'hover',
      conditions: ['hover-device'],
      effects: [
        {
          key: 'feature-card',
          keyframeEffect: {
            name: 'card-lift',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }],
          },
          duration: 250,
          fill: 'both',
          composite: 'add',
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="showcase">
  <section class="showcase">
    <interact-element data-interact-key="feature-card">
      <article class="feature-card">...</article>
    </interact-element>
  </section>
</interact-element>
```

**Result:** Scroll position, pointer position, and hover state each animate the card independently and at the same time. Notice that the sources don't all have to be the card itself — the tilt is triggered from the enclosing `showcase` section but still targets `feature-card`, so the card leans toward the cursor as it moves anywhere in the section.

## Effects from different interactions live together

This is the crucial difference from stacking effects inside a single interaction. As covered in [Effects array and cascading logic](/effects-array-and-cascading-logic), two effects in the **same** interaction's `effects` array that hit the same element share one animation slot, so the later one overrides the earlier.

Effects that come from **separate** interactions behave the opposite way: each interaction contributes its own entry to the element's animation list, so the animations run **simultaneously without overriding one another** — even when they all target the same element. That's precisely why the scroll, tilt, and hover animations above coexist instead of the last one winning.

## The `composite` option

"Living together" is seamless when the coexisting animations touch **different** properties (say one animates `opacity` and another `filter`). But layered motion often means several animations touch the **same** property — in the example above, the parallax, the tilt, and the hover scale all animate `transform`.

`composite` decides how an animation's value for a property combines with the value already underneath it — the value contributed by other animations on the element, or the element's own static style. It is available on every effect, time and scrub alike, and Interact writes it through to the CSS [`animation-composition`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-composition) property on the target element, so the browser does the blending natively.

### Accepted values

| Value                 | What it does                                                                                                                                                   |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'replace'` (default) | The animation fully replaces the underlying value of the property. Only one contribution is visible at a time.                                                 |
| `'add'`               | The animation's functions are appended after the ones already there — an underlying `translateY(…)` plus an added `rotate(…)` and `scale(…)` all apply.        |
| `'accumulate'`        | Arguments of matching functions are merged (`translateX(10px)` + `translateX(20px)` → `translateX(30px)`); non-matching functions concatenate as with `'add'`. |

Blending is only meaningful for properties whose values are lists the browser can combine — in practice `transform` and `filter`. For a scalar property such as `opacity` or `color`, `'add'` and `'accumulate'` have nothing to concatenate, so treat those as `'replace'` territory.

### When you need it

Set `composite` whenever two contributions to the same property must both be visible:

- **Several interactions on one element animating the same property.** The parallax, tilt, and hover animations above all write `transform`; the tilt and hover effects use `composite: 'add'` so they layer onto the parallax rather than clobbering it. Pick one animation to be the base layer and leave it at the default `'replace'`.
- **Splitting one motion across two axes.** A common `pointerMove` pattern is two interactions on the same source and target, one per axis. The second effect needs `'add'` or `'accumulate'` so both axes apply.
- **Animating on top of a static transform.** If the element already carries a `transform` in its stylesheet, a `'replace'` animation discards it for the animation's duration; `'add'` keeps it as the base.

If every animation on the element touches a different property, you can leave `composite` alone — the default is already correct.

> **Note:** "The same element" means a matching `ElementIdentifier`. Interactions whose effects resolve to the same identifier stack on the same element; effects that resolve to different identifiers animate different elements and never interact. See [Source and target resolving](/source-and-target-resolving).

## See also

- [Effects array and cascading logic](/effects-array-and-cascading-logic)
- [Source and target resolving](/source-and-target-resolving)
- [`pointerMove`](/pointermove)
- [Scroll-driven animations](/viewprogress)
- [Click and hover](/click-and-hover)

# Conditions

---

# Understanding conditions

Conditions gate **when** an interaction, effect, or sequence is allowed to run. Use them to build responsive interactions that adapt to screen size, user preferences (like reduced motion), or the current state of the page — without duplicating configs or writing imperative checks.

A condition is a named, reusable rule defined once in the top-level `conditions` map and referenced by ID wherever you need it.

```ts
const config: InteractConfig = {
  conditions: {
    desktop: { type: 'media', predicate: '(min-width: 1024px)' },
  },
  effects: {
    lift: {
      duration: 300,
      easing: 'cubicOut',
      fill: 'both',
      keyframeEffect: {
        name: 'lift',
        keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }],
      },
    },
  },
  interactions: [
    {
      key: 'product-card',
      trigger: 'hover',
      conditions: ['desktop'], // only runs on viewports ≥ 1024px
      effects: [{ effectId: 'lift' }],
    },
  ],
};
```

> **Note:** Conditions never _cause_ an interaction — a trigger does. They only decide whether a triggered interaction is permitted to run in the current environment.

## Defining conditions

Every condition has two fields, and both are required:

| Field       | Type                      | Default  | Description                                                                                       |
| :---------- | :------------------------ | :------- | :------------------------------------------------------------------------------------------------ |
| `type`      | `'media'` \| `'selector'` | Required | How the condition is evaluated: `'media'` against the viewport, `'selector'` against the element. |
| `predicate` | `string`                  | Required | The media query or CSS selector to test, matching the `type`.                                     |

```ts
// inside InteractConfig
conditions: {
  'desktop':    { type: 'media',    predicate: '(min-width: 1024px)' },
  'can-hover':  { type: 'media',    predicate: '(hover: hover)' },
  'is-active':  { type: 'selector', predicate: '.is-active' },
},
```

## Media conditions

A `media` condition evaluates a standard CSS media query against the viewport. Use it to target device width, pointer capabilities, or user preferences.

```ts
// inside InteractConfig
conditions: {
  'desktop':        { type: 'media', predicate: '(min-width: 1024px)' },
  'mobile':         { type: 'media', predicate: '(max-width: 767px)' },
  'can-hover':      { type: 'media', predicate: '(hover: hover)' },
  'prefers-motion': { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
},
```

Write the predicate without the `@media` keyword — just the query itself, as it would appear inside the parentheses of a media rule.

Media conditions are evaluated with `window.matchMedia` at runtime and emitted as `@media` rules in the [generated CSS](/html-integration), so they re-evaluate automatically when the viewport changes. Interact also registers a `change` listener on each media query list: when the match state flips, the affected element is disconnected and reconnected, so a gated interaction is attached once the query starts matching and torn down when it stops.

## Selector conditions

A `selector` condition scopes an interaction or effect to when the element matches a CSS selector. Use it to make interactions depend on a state class (for example, only animate while an element carries `.is-active`, or when a `.dark-mode` theme is applied).

```ts
// inside InteractConfig
conditions: {
  'is-active': { type: 'selector', predicate: '.is-active' },
},
interactions: [
  {
    key: 'menu-item',
    trigger: 'hover',
    conditions: ['is-active'], // only when the element matches .is-active
    effects: [{ effectId: 'glow' }],
  },
],
```

Each predicate is wrapped in CSS `:is(...)` and applied to the selector Interact generates for the element, so the rule takes effect only while the element matches. Because it's expressed in CSS, it updates live as the element's classes or attributes change — there is no listener to register and no config to re-create.

### The `&` placeholder

A selector predicate may contain `&`, which stands for the element's own generated selector. It behaves exactly like the nesting selector in CSS:

- **Without `&`** — the predicate is appended to the element's selector, forming a compound selector. The keyed element itself has to match.
- **With `&`** — every `&` in the predicate is replaced by the element's selector, and the result becomes the whole selector. Use this for contextual rules, such as "only when this element sits inside a `.theme-dark` ancestor".

For an element keyed `menu-item`, whose base selector is `[data-interact-key="menu-item"]`:

| Predicate          | Resulting selector                                    | Matches when                             |
| :----------------- | :---------------------------------------------------- | :--------------------------------------- |
| `.is-active`       | `[data-interact-key="menu-item"]:is(.is-active)`      | the element itself carries `.is-active`  |
| `.theme-dark &`    | `:is(.theme-dark [data-interact-key="menu-item"])`    | the element has a `.theme-dark` ancestor |
| `&:nth-child(odd)` | `:is([data-interact-key="menu-item"]:nth-child(odd))` | the element is an odd-numbered child     |

> **Warning:** A predicate with no `&` is appended, not nested. `.theme-dark` on its own means "this element has class `theme-dark`", not "this element is inside `.theme-dark`". Add `&` whenever you mean an ancestor or sibling relationship.

### Example: gating a glow to a dark-theme ancestor

```ts
const config: InteractConfig = {
  conditions: {
    'dark-theme': { type: 'selector', predicate: '.theme-dark &' },
  },
  effects: {
    glow: {
      duration: 300,
      easing: 'quadOut',
      fill: 'both',
      keyframeEffect: {
        name: 'glow',
        keyframes: [
          { boxShadow: '0 0 0 0 rgba(120, 180, 255, 0)' },
          { boxShadow: '0 0 24px 4px rgba(120, 180, 255, 0.6)' },
        ],
      },
    },
  },
  interactions: [
    {
      key: 'menu-item',
      trigger: 'hover',
      conditions: ['dark-theme'],
      effects: [{ effectId: 'glow' }],
    },
  ],
};
```

```html
<nav class="theme-dark">
  <a data-interact-key="menu-item" href="/pricing">Pricing</a>
</nav>
```

**Result:** Hovering the link makes it glow, but only while it sits inside a `.theme-dark` ancestor. A theme switcher that adds or removes `theme-dark` on the `<nav>` turns the glow on and off immediately — no config change, and nothing to re-create.

## Where conditions can be applied

Reference conditions by ID from a `conditions: string[]` array at three levels. **All listed conditions must pass** (they combine with AND).

| Level       | Effect when it fails                                             |
| :---------- | :--------------------------------------------------------------- |
| interaction | The entire interaction (all its effects and sequences) is gated. |
| effect      | Only that individual effect is gated.                            |
| sequence    | The whole sequence is gated.                                     |

```ts
// inside interactions[]
{
  key: 'card',
  trigger: 'viewEnter',
  conditions: ['desktop'],        // interaction-level: gates everything below
  effects: [
    { effectId: 'reveal' },
    { effectId: 'extra', conditions: ['prefers-motion'] }, // effect-level: gates only this effect
  ],
},
```

## Combining conditions

List several IDs to require all of them — `conditions: ['desktop', 'can-hover']` runs only when **both** match. Interact groups the referenced conditions by type before applying them:

- Multiple `media` predicates are merged into a single `and`-joined media query, so `['desktop', 'can-hover']` becomes `((min-width: 1024px)) and ((hover: hover))`.
- Multiple `selector` predicates are each wrapped in `:is(...)` and concatenated, so `['is-active', 'is-open']` becomes `:is(.is-active):is(.is-open)` — the element must satisfy every one.
- Mixing the two types is fine. The media part gates the rule as an `@media` query, the selector part narrows the selector, and the effect runs only when both hold.

> **Warning:** A `conditions` array is always AND — there is no OR form. Each predicate is also wrapped in parentheses before being joined, so a comma-separated media query list in a single predicate does not work either. To express OR, declare two effects (or two interactions), each carrying one condition.

## Reduced motion

To respect users who prefer less motion, gate motion-heavy effects behind a `prefers-reduced-motion` media condition and provide a gentler alternative:

```ts
{
  conditions: {
    'ok-motion':  { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
    'less-motion':{ type: 'media', predicate: '(prefers-reduced-motion: reduce)' },
  },
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [
        { conditions: ['ok-motion'], effectId: 'full-reveal' },
        { conditions: ['less-motion'], effectId: 'simple-fade' },
      ],
    },
  ],
}
```

You can also force reduced-motion behavior globally, regardless of the OS setting:

```ts
Interact.forceReducedMotion = true;
```

## Validation

Condition IDs referenced from a `conditions: [...]` array must exist in the top-level `conditions` map, and `media` predicates must be valid media queries. [`@wix/interact-validate`](https://github.com/wix/interact/tree/master/packages/interact-validate) checks both. Invalid `media` predicates are reported as **errors**; unreferenced condition definitions are reported as **warnings**. Use `strict: true` to promote warnings to errors, or `severityOverrides` to tune them.

## See also

- [The config object](/the-config-object)
- [Responsive animation design](/responsive-animation-design)
- [What are effects?](/what-are-effects)
- [What is a sequence?](/what-is-a-sequence)
- [`@wix/interact-validate`](https://github.com/wix/interact/tree/master/packages/interact-validate)

# Responsive animation design

Conditions let you adapt interactions to different screen sizes and user preferences without duplicating your entire animation system. A condition is a named predicate you declare once in the config's `conditions` map and then reference by name from an interaction, a sequence, or a single effect entry.

This page covers the three patterns you reach for most often: cascading effect variants across breakpoints, gating one interaction behind several signals at once, and swapping the interaction model entirely between mobile and desktop. For the mechanics of conditions themselves, see [Understanding conditions](/understanding-conditions).

## Cascading effects

Effects in the same `effects` array cascade like CSS: when several of them target the same element and animate the same output, whichever conditions match decide what runs, and the entry placed later wins. [Effects array and cascading logic](/effects-array-and-cascading-logic) has the full rules.

For responsive variants this means writing the base effect first, with no conditions, then layering more specific breakpoint overrides after it.

> **Warning:** Cascading happens only between entries in one interaction's `effects` array. Put the conditions on the effect entries, not on the interaction — a condition on the interaction gates the whole interaction on or off instead of layering variants inside it.

### Example: mobile-first card slide-in

```ts
const responsiveConfig: InteractConfig = {
  conditions: {
    tablet: {
      type: 'media',
      predicate: '(min-width: 768px)',
    },
    desktop: {
      type: 'media',
      predicate: '(min-width: 1024px)',
    },
  },

  effects: {
    'slide-mobile': {
      keyframeEffect: {
        name: 'slide-mobile',
        keyframes: [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }],
      },
      duration: 600,
      easing: 'backOut',
    },
    'slide-tablet': {
      keyframeEffect: {
        name: 'slide-tablet',
        keyframes: [{ transform: 'translateY(50%)' }, { transform: 'translateY(0)' }],
      },
      duration: 400,
      easing: 'ease-in-out',
    },
    'slide-desktop': {
      keyframeEffect: {
        name: 'slide-desktop',
        keyframes: [{ transform: 'translateY(100px)' }, { transform: 'translateY(0)' }],
      },
      duration: 400,
      easing: 'ease-out',
    },
  },

  interactions: [
    {
      key: 'product-card',
      trigger: 'viewEnter',
      effects: [
        {
          effectId: 'slide-mobile',
        },
        {
          conditions: ['tablet'],
          effectId: 'slide-tablet',
        },
        {
          conditions: ['desktop'],
          effectId: 'slide-desktop',
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="product-card">
  <article class="product-card">
    <h3>Trail runner</h3>
    <p>Lightweight, all-terrain.</p>
  </article>
</interact-element>
```

**Result:** The card slides up into place the first time it scrolls into view. On a phone it travels its own full height over 600 ms with a springy overshoot. From `768px` the tablet entry takes over: the card starts halfway up and settles in 400 ms. From `1024px` the desktop entry wins in turn, moving a fixed `100px` with a plain ease-out. Exactly one variant plays at any given width — the last entry whose condition matches.

> **Note:** The order of the array is what makes this work. Reversing it so that `slide-desktop` comes first would leave the unconditional `slide-mobile` entry last, and it would win everywhere.

## Combining multiple responsive signals

Responsive animation design is not limited to viewport width. You can combine media conditions and user-preference conditions to gate more advanced effects. When an interaction lists several conditions, all of them must match before it runs.

### Example: gating a hero animation on viewport width

```ts
const complexConfig: InteractConfig = {
  conditions: {
    desktop: {
      type: 'media',
      predicate: '(min-width: 1024px)',
    },
    'motion-ok': {
      type: 'media',
      predicate: '(prefers-reduced-motion: no-preference)',
    },
  },

  interactions: [
    {
      key: 'hero-animation', // SOURCE
      trigger: 'viewEnter',
      conditions: ['desktop', 'motion-ok'],
      effects: [
        {
          key: 'hero-background', // TARGET
          keyframeEffect: {
            name: 'focus-background',
            keyframes: [
              { transform: 'scale(1.1)', filter: 'blur(2px)' },
              { transform: 'scale(1)', filter: 'blur(0)' },
            ],
          },
          duration: 1200,
          easing: 'ease-out',
        },
        {
          key: 'hero-content', // TARGET
          keyframeEffect: {
            name: 'slide-content',
            keyframes: [
              { opacity: 0, transform: 'translateY(80px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          duration: 800,
          delay: 400,
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="hero-animation">
  <section class="hero">
    <interact-element data-interact-key="hero-background">
      <img src="/hero.jpg" alt="" />
    </interact-element>
    <interact-element data-interact-key="hero-content">
      <div class="hero__copy">
        <h1>Built for the long run</h1>
        <a href="/shop">Shop the range</a>
      </div>
    </interact-element>
  </section>
</interact-element>
```

**Result:** On a wide screen, as the hero scrolls into view, the background image pulls back from a slightly blurred 110% crop to a sharp 100% over 1.2 seconds, and the headline and button fade up from `80px` below starting 400 ms in. Below `1024px` neither effect is created and the hero simply appears.

Use this pattern when the animation should only run in environments that can support it comfortably.

## Swapping interaction models by breakpoint

Sometimes the right responsive behavior is not just a milder or stronger version of the same animation. Sometimes the interaction model itself should change.

For example:

- On mobile, a menu should open on tap
- On desktop, navigation should respond to hover

In that case, use separate interactions rather than trying to cascade effect variants inside one interaction. Each interaction carries its own trigger and its own condition, so only one of them is ever active.

### Example: tap to open on mobile, hover to open on desktop

```ts
const navigationConfig: InteractConfig = {
  conditions: {
    mobile: {
      type: 'media',
      predicate: '(max-width: 767px)',
    },
    desktop: {
      type: 'media',
      predicate: '(min-width: 768px)',
    },
  },

  interactions: [
    {
      key: 'menu-toggle', // SOURCE
      trigger: 'activate',
      conditions: ['mobile'],
      effects: [
        {
          key: 'mobile-menu', // TARGET
          keyframeEffect: {
            name: 'mobile-menu-slide',
            keyframes: [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }],
          },
          duration: 300,
          easing: 'ease-out',
          triggerType: 'alternate',
          fill: 'both',
        },
        {
          key: 'menu-overlay', // TARGET
          keyframeEffect: {
            name: 'mobile-menu-overlay',
            keyframes: [{ opacity: 0 }, { opacity: 0.5 }],
          },
          duration: 300,
          triggerType: 'alternate',
          fill: 'both',
        },
      ],
    },

    {
      key: 'nav-item', // SOURCE
      trigger: 'hover',
      conditions: ['desktop'],
      effects: [
        {
          key: 'dropdown-menu', // TARGET
          keyframeEffect: {
            name: 'desktop-dropdown',
            keyframes: [
              { opacity: 0, transform: 'translateY(-10px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          duration: 200,
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="menu-toggle">
  <button type="button" aria-label="Menu">Menu</button>
</interact-element>

<interact-element data-interact-key="menu-overlay">
  <div class="overlay"></div>
</interact-element>

<interact-element data-interact-key="mobile-menu">
  <nav class="drawer">
    <a href="/shop">Shop</a>
    <a href="/about">About</a>
  </nav>
</interact-element>

<interact-element data-interact-key="nav-item">
  <div class="nav__item">
    <a href="/shop">Shop</a>
    <interact-element data-interact-key="dropdown-menu">
      <div class="dropdown">
        <a href="/shop/shoes">Shoes</a>
        <a href="/shop/packs">Packs</a>
      </div>
    </interact-element>
  </div>
</interact-element>
```

**Result:** Below `768px`, tapping the menu button slides the drawer in from the left over 300 ms while a dark overlay fades to 50% opacity; tapping again plays both in reverse. From `768px` the drawer interaction is never created — instead, hovering a navigation item fades its dropdown down into place over 200 ms, and moving the pointer away plays it back out. The two models never overlap, because their conditions are mutually exclusive.

Use this approach when different breakpoints need different triggers, not just different effect strengths.

## Best practices

Name conditions for what they mean, not for the number they contain. A name like `desktop-large` or `touch-primary` survives a breakpoint change and reads well at the call site; `min-width-1200` has to be renamed the moment the design shifts.

```ts
// inside conditions
'desktop-large': { type: 'media', predicate: '(min-width: 1200px)' },
'touch-primary': { type: 'media', predicate: '(pointer: coarse)' },
'motion-safe': { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
```

> **Tip:** Build by progressive enhancement. Start with a baseline interaction that works everywhere, then layer enhancements for devices and contexts that can support them. An effect entry with no `conditions` always matches, which makes it the natural base of a cascade.

> **Warning:** Put accessibility first. Always provide a motion-safe alternative when the primary interaction depends on animation (see [reduced motion](/understanding-conditions#reduced-motion)).

## See also

- [Understanding conditions](/understanding-conditions)
- [Effects array and cascading logic](/effects-array-and-cascading-logic)
- [Multi-interaction compositions](/multi-interaction-compositions)
- [Entrance animations (`viewEnter`)](/viewenter)
- [Click and hover](/click-and-hover)

# Sequences and lists

# What is a list?

A **list** is Interact's way of applying a single interaction definition to a whole collection of sibling elements at once — the children of a container — instead of writing a separate interaction for each one.

You point an interaction at a container with the **`listContainer`** property. Interact then finds that container, treats each of its children as a participant, and fans the trigger and effect out across all of them. Crucially, it keeps doing this as the DOM changes: children added later animate automatically, and removed children are cleaned up.

```ts
{
  key: 'gallery',
  listContainer: '.cards',   // ← every child of .cards participates
  trigger: 'viewEnter',
  effects: [
    {
      listContainer: '.cards',
      keyframeEffect: {
        name: 'fade-up',
        keyframes: [
          { opacity: '0', transform: 'translateY(20px)' },
          { opacity: '1', transform: 'translateY(0)' },
        ],
      },
      duration: 500,
      easing: 'ease-out',
    },
  ],
}
```

```html
<interact-element data-interact-key="gallery">
  <div class="cards">
    <article class="card">One</article>
    <article class="card">Two</article>
    <article class="card">Three</article>
    <!-- add more anytime — they animate automatically -->
  </div>
</interact-element>
```

Without a list, that would be one interaction per card. With a list, it's one definition that covers all of them — however many there are, now or later.

## Why lists exist

- **One definition, many elements.** Describe the behavior once; it applies to every item in the container.
- **Dynamic content.** Interact watches the container and applies interactions to items added later, and cleans up items that are removed — no re-wiring. This is what makes lists ideal for feeds, search results, carts, and infinite scroll.
- **Consistency.** Every item behaves identically because they share one definition.
- **Staggering.** Lists are the foundation for staggered, one-after-another animations (see [sequences](/what-is-a-sequence)).

## The container and its items

- **`listContainer`** — a CSS selector for the container element, resolved _within_ the keyed `<interact-element>`. So the keyed element wraps the container, and the container holds the items. **This is what establishes a list.**
- **Items** — by default, the container's **immediate children**.
- **`listItemSelector`** — an optional filter that narrows the list to the children matching it (`.container > .listItemSelector`). Omit it and every immediate child participates; provide it (e.g. `.active`) to include only those children.

Together, `listContainer` defines the list and `listItemSelector` refines which of its children take part:

```ts
{
  key: 'menu',
  listContainer: '.menu',
  listItemSelector: '.enabled',   // of .menu's children, only the enabled ones
  trigger: 'hover',
  effects: [ /* ... */ ],
}
```

### A list vs. a plain multi-select

`listContainer` isn't the only way to touch _several_ elements — a `selector` alone matches via `querySelectorAll`, so it also fans an interaction across every match. But that's a **static, one-time query**: it has none of the list semantics.

| Mechanism                            | Targets multiple elements?    | A managed list?                       |
| :----------------------------------- | :---------------------------- | :------------------------------------ |
| `listContainer`                      | the container's children      | dynamic tracking + stagger            |
| `listContainer` + `listItemSelector` | a filtered subset of children | (filtered)                            |
| `selector` only                      | `querySelectorAll` matches    | static — no tracking, no coordination |

The difference is what you get for free: a list is **dynamically tracked** (children added/removed are handled automatically) and can be **coordinated into a stagger** via a sequence. A `selector` multi-select is just "these elements, right now."

## `listContainer` works at two levels

Because both interactions and effects accept `listContainer`, you control the list on two axes:

- **On the interaction** (the _source_) — the trigger attaches to **each item**. e.g. `hover` fires per card, when you hover _that_ card.
- **On the effect** (the _target_) — the effect applies to **each item**.

The common case uses the same container for both: each item is its own trigger _and_ its own target (hover a card → that card animates). You can also combine `listContainer` with `selector` on the effect to animate a **child inside each item** — e.g. hovering a card zooms the `img` within it:

```ts
{
  key: 'products',
  listContainer: '.grid',
  trigger: 'hover',
  effects: [
    {
      listContainer: '.grid',
      selector: 'img',   // animate the image inside each hovered card
      keyframeEffect: {
        name: 'zoom',
        keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }],
      },
      triggerType: 'alternate',
      fill: 'both',
      duration: 300,
    },
  ],
}
```

## Dynamic content is automatic

When you use `listContainer`, Interact sets up a `MutationObserver` on the container and tracks its children. Append a new child and it gets the interaction; remove one and it's cleaned up.

For `viewEnter` entrance animations on a list that grows (e.g. loading more items), use `triggerType: 'repeat'` so each newly added item plays its entrance as it appears:

```ts
{
  key: 'feed',
  listContainer: '.feed',
  trigger: 'viewEnter',
  effects: [
    {
      listContainer: '.feed',
      triggerType: 'repeat',
      keyframeEffect: {
        name: 'slide-in',
        keyframes: [
          { opacity: '0', transform: 'translateY(20px)' },
          { opacity: '1', transform: 'translateY(0)' },
        ],
      },
      duration: 400,
    },
  ],
}
```

## Lists and sequences

A list applies the _same_ effect to every item, all firing together. To make items animate **one after another** (a staggered cascade) combine a list with a **sequence**: the sequence's `offset` spaces each item's start, and its `offsetEasing` shapes how that spacing is distributed. New items added to the DOM rejoin the sequence with recalculated offsets.

## Key points

- `listContainer` is resolved relative to the keyed element, so structure your markup as `<interact-element key> → container → items`.
- Prefer **one container** over many separate keys for large or dynamic lists — it's a single observer and a single definition, not one per item.
- `selector` targets a single child _within a root_; `listContainer` fans an interaction _across many children_. They compose (`listContainer` + `selector` = "a child inside each item").

## See also

- [Using lists](/using-lists)
- [What is a sequence?](/what-is-a-sequence)
- [Using sequences](/using-sequences)
- [Source and target resolving](/source-and-target-resolving)
- [Entrance animations (`viewEnter`)](/viewenter)

# Using lists

Most real interfaces repeat a shape many times: product grids, feeds, galleries, navigation menus, search results. Wiring an interaction to each item by hand is tedious and breaks the moment the data changes. Interact solves this with **lists** - you point one interaction at a _container_, and Interact applies the behavior to every child, keeps it in sync as items are added or removed, and can stagger them into a sequence.

## The three properties that define a list

A list is described by up to three properties, which appear **both** on the `Interaction` (the trigger side) and on the `Effect` (the target side):

| Property           | What it does                                                                                                                                                                                              |
| :----------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listContainer`    | A CSS selector, resolved **within the interaction's root element**, that finds the container holding the items. This is what turns an interaction into a list.                                            |
| `selector`         | Optional. With `listContainer`, Interact runs `querySelectorAll(selector)` **inside the container** and treats each match as the target. Without it, every **direct child** of the container is a target. |
| `listItemSelector` | Optional. Narrows which direct children count as list items when Interact generates CSS (for `transition` / state effects). Use it when the container also holds elements that are not items.             |

## Key points

1. **`listContainer` is not inherited from the interaction to its effects.** If the trigger uses `listContainer`, each effect that should also operate per item must repeat it (and `selector`, if used). An effect without `listContainer` falls back to normal single-element selection.
2. The container selector is resolved **relative to the interaction's root element** (the element identified by `key`), not the whole document. With the Web Components entry that root is the `<interact-element>`; the container must live inside it.

## A basic list entrance

The most common list interaction is a `viewEnter` entrance applied to each item. Note how `listContainer` appears on the interaction **and** on the effect.

### Example: a feature list that fades up as it scrolls into view

```html
<interact-element data-interact-key="feature-list">
  <ul class="features">
    <li>Fast</li>
    <li>Declarative</li>
    <li>Framework-agnostic</li>
    <li>Accessible</li>
  </ul>
</interact-element>
```

```ts
const config = {
  interactions: [
    {
      key: 'feature-list',
      listContainer: '.features', // turns this into a list
      trigger: 'viewEnter',
      params: { threshold: 0.15 },
      effects: [
        {
          key: 'feature-list',
          listContainer: '.features', // repeat on the effect
          keyframeEffect: {
            name: 'fade-up',
            keyframes: [
              { opacity: '0', transform: 'translateY(24px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 600,
          easing: 'ease-out',
          fill: 'both',
        },
      ],
    },
  ],
};

Interact.create(config);
```

**Result:** Each `<li>` now fades and slides up independently as the list scrolls into view. Add a fifth `<li>` to the markup and it animates too - no config change required.

> **Tip:** Avoid a flash of unstyled content (FOUC). For entrance effects, pass the config through `generate(config, { useFirstChild: true })` and inject the returned CSS into `<head>` so items start hidden before JavaScript runs. `useFirstChild` defaults to `true`, which is the mode that matches the `<interact-element>` markup used here; pass `false` when the keyed element itself is the animation target (vanilla JS or React).

## Targeting elements inside each item

Combine `listContainer` with `selector` to reach a specific descendant of every item. Here the hover trigger listens on each card, and the effect zooms only the image inside that card:

### Example: zooming the image inside each gallery card

```html
<interact-element data-interact-key="gallery">
  <div class="gallery-grid">
    <figure class="gallery-item">
      <img src="1.jpg" alt="" />
      <figcaption class="overlay">View</figcaption>
    </figure>
    <figure class="gallery-item">
      <img src="2.jpg" alt="" />
      <figcaption class="overlay">View</figcaption>
    </figure>
  </div>
</interact-element>
```

```ts
// inside interactions[]
{
  key: 'gallery',
  listContainer: '.gallery-grid',
  selector: '.gallery-item', // trigger on each item
  trigger: 'interest', // accessible hover (pointer + keyboard)
  effects: [
    {
      key: 'gallery',
      listContainer: '.gallery-grid',
      selector: '.gallery-item img', // effect on the image within the item
      keyframeEffect: {
        name: 'zoom',
        keyframes: [
          { transform: 'scale(1)' },
          { transform: 'scale(1.08)' },
        ],
      },
      duration: 300,
      easing: 'ease-out',
      fill: 'both',
    },
  ],
}
```

**Result:** Pointing at a gallery card — or reaching it with the keyboard — scales that card's image from 1 to 1.08 over 300 ms, easing out. The caption and the rest of the card stay put.

The interaction's `selector` and the effect's `selector` are independent - the trigger element and the animated element can differ within the same item.

## Dynamic lists: additions and removals are automatic

This is the part that makes lists worth using. When an interaction (or effect) declares a `listContainer`, Interact attaches a `MutationObserver` to that container. From then on:

- **Appending** a direct child to the container applies the list's interactions and effects to the new item automatically.
- **Removing** a direct child cleans up its listeners and removes it from any sequences.

You do **not** need to call any imperative "add item" API - mutating the DOM is enough.

### Example: a feed that animates posts appended after load

```ts
const config = {
  interactions: [
    {
      key: 'feed',
      listContainer: '.feed-items',
      trigger: 'viewEnter',
      effects: [
        {
          key: 'feed',
          listContainer: '.feed-items',
          triggerType: 'repeat', // re-arm so late arrivals animate too
          keyframeEffect: {
            name: 'slide-in',
            keyframes: [
              { opacity: 0, transform: 'translateY(16px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
        },
      ],
    },
  ],
};

Interact.create(config);

// Later - the new node animates automatically:
document.querySelector('.feed-items').appendChild(makeItem('New post'));
```

**Result:** The posts already in `.feed-items` slide up into place as the feed scrolls into view. A post appended afterwards plays the same entrance when it appears — the `appendChild` call is the only code you write for it.

> **Note:** Only **direct children** of the container are tracked. Wrapping items in an extra layer moves them out of view of the observer.

> **Tip:** Use `triggerType: 'repeat'` on the effect when items arrive after the initial trigger fired (infinite scroll, "load more", live feeds), so the animation is armed to run again rather than only once.

## See also

- [What is a list?](/what-is-a-list)
- [What is a sequence?](/what-is-a-sequence)
- [Using sequences](/using-sequences)
- [Entrance animations (`viewEnter`)](/viewenter)
- [HTML integration](/html-integration)

# What is a sequence?

A sequence coordinates several effects, optionally with staggered timing, so they are fired and controlled as one orchestrated group instead of as multiple independent effects.

Instead of manually wiring up independent timelines or guessing escalating delay values across elements, you describe the orchestration up front in the configuration. The sequence handles the timing, the offset math, and the lifecycle of the grouped effects for you.

## Why sequences exist

- **One orchestrated group.** Bundles multiple visual changes across the page and triggers them as a single cohesive unit.
- **Staggering made easy.** Creates waterfalls of motion — elements in a layout revealing one after another — from a single `offset` value.
- **Dynamic content recalculation.** When paired with lists, newly appended items automatically rejoin the sequence with recalculated offsets.

## Anatomy of a sequence config

Sequences live in the top-level `sequences` record as a registry of reusable configurations, each referenced by a unique id. The same shape can also be written inline inside an interaction.

```ts
type SequenceConfig = {
  effects: (Effect | EffectRef)[]; // required — the participants
  delay?: number; // ms before the whole sequence starts
  offset?: number; // ms between consecutive participants
  offsetEasing?: string | ((p: number) => number); // distributes the offsets
  sequenceId?: string; // id used for referencing and caching
  conditions?: string[]; // condition ids gating the whole sequence
  triggerType?: TimeAnimationTriggerType; // playback behaviour for the sequence
};
```

| Field          | Type                                                 | Default               | Description                                                                                                                                                       |
| :------------- | :--------------------------------------------------- | :-------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `effects`      | `(Effect \| EffectRef)[]`                            | — (required)          | The participants, in playback order. Must contain at least one entry. Sequences accept time effects only — scrub effects are rejected.                            |
| `delay`        | `number`                                             | `0`                   | Milliseconds to wait before the whole sequence starts. Added on top of each participant's own `delay`, so the two stack.                                          |
| `offset`       | `number`                                             | `0`                   | Milliseconds between the start of consecutive participants. `0` means every participant starts together.                                                          |
| `offsetEasing` | `string` \| `(p: number) => number`                  | `'linear'`            | Shapes how the offsets are distributed across the participants — front-loaded, back-loaded, or evenly. Accepts a named easing, a `cubic-bezier()`, or a function. |
| `sequenceId`   | `string`                                             | generated             | The id used to reference the sequence from an interaction and to cache it at runtime. When omitted, Interact generates one.                                       |
| `conditions`   | `string[]`                                           | `[]`                  | Ids from `config.conditions` that gate the whole sequence. They also cascade down to every effect inside it.                                                      |
| `triggerType`  | `'once'` \| `'repeat'` \| `'alternate'` \| `'state'` | the trigger's default | Playback behaviour for the sequence. Set on the sequence, it overrides `triggerType` on the effects inside it.                                                    |

When `triggerType` is omitted it falls back to the trigger's own default: `once` for `viewEnter` and `animationEnd`, `alternate` for `hover`, `click`, `interest` and `activate`.

> **Note:** `offsetEasing` distributes the offsets, it does not change the total span. With any standard easing the last participant still starts at `delay + (count - 1) × offset`; only the spacing in between changes.

## Sequences and lists

While a sequence can coordinate distinct target elements, it is most frequently paired with a `listContainer`.

Without a sequence, a list interaction applies the same effect to every item simultaneously. Introducing a sequence splits that simultaneous execution into a staggered cascade across the container's children.

## Example: staggering a hero's parts on entry

A sequence over three distinct targets. The hero is the source; each participant names its own target key, and `offset` spaces their starts.

```ts
import type { InteractConfig } from '@wix/interact';

const config: InteractConfig = {
  interactions: [
    {
      key: 'hero', // SOURCE
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      sequences: [{ sequenceId: 'hero-in' }],
    },
  ],

  effects: {
    'float-in': {
      duration: 600,
      easing: 'ease-out',
      fill: 'both',
      namedEffect: { type: 'FloatIn', direction: 'bottom' },
    },
  },

  sequences: {
    'hero-in': {
      delay: 200, // wait 200ms after the hero enters
      offset: 150, // then 150ms between each participant
      effects: [
        { effectId: 'float-in', key: 'hero-eyebrow' }, // TARGET
        { effectId: 'float-in', key: 'hero-title' }, // TARGET
        { effectId: 'float-in', key: 'hero-cta' }, // TARGET
      ],
    },
  },
};
```

```html
<interact-element data-interact-key="hero">
  <section class="hero">
    <interact-element data-interact-key="hero-eyebrow">
      <p class="eyebrow">New release</p>
    </interact-element>
    <interact-element data-interact-key="hero-title">
      <h1>Ship motion faster</h1>
    </interact-element>
    <interact-element data-interact-key="hero-cta">
      <a class="cta" href="/start">Get started</a>
    </interact-element>
  </section>
</interact-element>
```

**Result:** Once the hero is 20% visible, nothing happens for 200 ms. Then the eyebrow floats up over 600 ms, the headline starts 150 ms after it, and the call to action 150 ms after that. Each part holds its final position, and because the trigger defaults to `triggerType: 'once'` the cascade plays a single time.

For a config that combines a sequence with a list, named effects and conditions in one place, see [The config object](/the-config-object).

## Caveats

> **Warning:** When referencing an effect inside a sequence registry, ensure `listContainer` is explicitly declared on the effect entry so the sequence runtime knows which elements to stagger.

> **Warning:** Total run time grows with the number of participants. The last one starts at `delay + (count - 1) × offset`, and every participant is padded out to the sequence's full length, so the sequence does not report as finished until that tail has run. Twenty cards at `offset: 300` put the last start 5.7 seconds after the trigger — long enough that a scrolling visitor may never see it. Keep `delay + (count - 1) × offset` down to a second or two for anything driven by `viewEnter`.

## See also

- [What is a list?](/what-is-a-list)
- [The config object](/the-config-object)
- [What are effects?](/what-are-effects)
- [Using sequences](/using-sequences)

# Using sequences

Attach, configure, and trigger staggered sequences in a live Interact config.

Once you know what a sequence is, using one comes down to three decisions: whether to define it inline or as a reusable top-level entry, which trigger drives it, and whether it targets discrete elements or a `listContainer`.

## 1. Choose inline or reusable

For a one-off stagger, define the sequence directly inside the interaction's `sequences` array:

```ts
// inside interactions[]
{
  key: 'card-row',
  trigger: 'viewEnter',
  params: { threshold: 0.2 },
  sequences: [
    {
      offset: 120,
      effects: [{ effectId: 'card-fade', listContainer: '.cards' }],
    },
  ],
}
```

For a sequence reused across multiple interactions, define it once under the top-level `sequences` record and reference it by `sequenceId`:

```ts
import type { InteractConfig } from '@wix/interact';

const config: InteractConfig = {
  sequences: {
    'cards-in': {
      offset: 120,
      effects: [{ effectId: 'card-fade', listContainer: '.cards' }],
    },
  },
  interactions: [
    {
      key: 'card-row',
      trigger: 'viewEnter',
      sequences: [{ sequenceId: 'cards-in' }],
    },
  ],
};
```

A `sequenceId` must point to an existing key in `config.sequences`, or validation fails with `SEQUENCE_ID_NOT_FOUND`.

## 2. Pick a trigger

Sequences work with the same event triggers as single effects: `viewEnter`, `animationEnd`, `hover`, `click`, `interest` and `activate`.

Sequences are **not** supported on the continuous triggers `viewProgress` and `pointerMove`. Those handlers ignore a pre-created sequence, and a sequence distributes time-based delays that a scrubbed timeline has nothing to do with — so their interactions accept an `effects` array and no `sequences`.

For `hover` and `click` (and their accessible variants `interest` and `activate`), playback behaviour is controlled by setting `triggerType` on the sequence config itself, not on the individual effects inside it — a `triggerType` on the sequence overrides whatever the participating effects declare:

```ts
// inside interactions[]
{
  key: 'menu',
  trigger: 'click',
  sequences: [
    {
      triggerType: 'alternate', // or 'repeat' | 'once' | 'state'
      offset: 80,
      effects: [ /* ... */ ],
    },
  ],
}
```

For `viewEnter` and `animationEnd`, the same `triggerType` values apply and `'once'` is the default, with the usual rule: if any effect in the sequence shares its key with the source element, use `triggerType: 'once'` only.

## 3. Stagger a list

Sequences are most commonly paired with a `listContainer` so each child of the container gets its own offset animation start:

```ts
// inside a sequence config
effects: [{ effectId: 'card-fade', listContainer: '.cards' }];
```

Since the effect targets the list rather than a single key, newly added children are automatically picked up and animated with the correct recalculated offset — you don't need to re-register anything when the DOM changes.

## 4. Tune the timing

- `offset` — milliseconds between the start of each participant's animation. Must be zero or greater; a negative value raises `NEGATIVE_OFFSET`.
- `offsetEasing` — a CSS or `@wix/motion` easing name that reshapes how the offsets are distributed (front-loaded vs. back-loaded) rather than spacing them evenly. Defaults to `'linear'`.
- `delay` — a single base delay, in milliseconds, applied before the whole sequence starts. It stacks on top of each participant's own `delay` and is separate from `offset`. Must be zero or greater; a negative value raises `NEGATIVE_DELAY`.

## 5. Validate before shipping

Run the config through [`@wix/interact-validate`](https://github.com/wix/interact/tree/master/packages/interact-validate) before calling `Interact.create()`.

`validateInteractConfig(config)` returns every issue it finds, errors and warnings alike:

```ts
import { validateInteractConfig } from '@wix/interact-validate';

const result = validateInteractConfig(config);
// result.valid is false only when at least one issue has severity 'error'
result.errors.forEach(({ severity, code, path }) => {
  console.log(severity, code, path.join('.'));
});
```

`assertValidInteractConfig(config)` throws an `InteractValidationError` — but only on errors, never on warnings:

```ts
import { assertValidInteractConfig } from '@wix/interact-validate';

assertValidInteractConfig(config); // throws when result.valid === false
```

For sequences, the split is:

- **Errors** (these throw): a dangling `sequenceId` reference (`SEQUENCE_ID_NOT_FOUND`), and negative `offset` / `delay` values (`NEGATIVE_OFFSET`, `NEGATIVE_DELAY`).
- **Warnings** (these do not throw): a dangling `effectId` reference (`EFFECT_ID_NOT_FOUND`) and a sequence defined but never referenced (`UNUSED_SEQUENCE`).

> **Tip:** Read `result.errors` from `validateInteractConfig` in CI rather than relying on `assertValidInteractConfig` alone, or the warnings will pass silently. Passing `{ strict: true }` promotes every issue to an error if you want the assertion to cover them too.

## Example: staggering a card grid on view enter

```ts
import type { InteractConfig } from '@wix/interact';

const config: InteractConfig = {
  interactions: [
    {
      key: 'card-row',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      sequences: [{ sequenceId: 'cards-in' }],
    },
  ],

  effects: {
    'card-fade': {
      duration: 600,
      easing: 'ease-out',
      fill: 'both',
      namedEffect: { type: 'FadeIn' },
    },
  },

  sequences: {
    'cards-in': {
      offset: 120,
      offsetEasing: 'quadOut',
      effects: [{ effectId: 'card-fade', listContainer: '.cards' }],
    },
  },
};
```

```html
<interact-element data-interact-key="card-row">
  <div class="cards">
    <article class="card">One</article>
    <article class="card">Two</article>
    <article class="card">Three</article>
    <article class="card">Four</article>
  </div>
</interact-element>
```

**Result:** When the row is 20% visible, the four cards fade in one after another. `offsetEasing: 'quadOut'` front-loads the cascade, so the gap between the first two cards is wider than the gap between the last two; the fourth card starts 360 ms after the first and finishes 600 ms later. Cards appended to `.cards` afterwards join the same sequence with recalculated offsets.

## See also

- [What is a sequence?](/what-is-a-sequence)
- [Using lists](/using-lists)
- [Effects array and cascading logic](/effects-array-and-cascading-logic)
- [Understanding conditions](/understanding-conditions)
