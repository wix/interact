# 🧑‍🌾 About Interact / Overview / Introduction

**Owner: [Adi Huri](mailto:adih@wix.com) Reviewer: [Marine Bretonniere](mailto:marinebr@wix.com)**

https://wix.github.io/interact/llms-full.txt

---

# **About Interact**

## **Build interactive experiences with motion**

## \[ A very cool visual example should be added here for a capabilities showoff\]

## This experience was built with Interact. 

---

## **What is Interact?**

Interact is a web animation and interaction library that helps developers, designers, and anyone building websites or apps create responsive, high-performance motion experiences.

It provides a structured way to connect user actions with visual changes \-  from simple UI animations to complex, coordinated page experiences.

Interact uses a declarative JavaScript API that describes interactions as structured configuration rather than imperative animation code. This makes interactions easier to write, review, and maintain as projects grow.

The same structure is also easy for Large Language Models (LLMs) to understand and generate. Because interactions are expressed as intent rather than low-level animation instructions, AI can reliably create, modify, and extend them while keeping the configuration predictable and readable.

\[Add link to Rules and/or Skills\]

With Interact, you define the relationship between:

* **Triggers** — what starts the interaction  
* **Effects** — what animation should happen  
* **Elements** — what should respond

Instead of implementing each animation and coordinating it with triggers in imperative code, you describe the relationship between triggers, effects, and elements in a structured configuration.

Example:

```
When a user enters the hero section

→ Reveal the headline
→ Animate the image
→ Stagger the cards
```

```
User intent

When a user enters the hero section
↓
Interact configuration
```

```
Interact translates that behavior into a structured configuration:
const config: InteractConfig = {
  interactions: [
    {
      key: "hero",
      trigger: "viewEnter",
      effects: [
        {
          key: "hero-headline",
          effectId: "headline-reveal",
        },
        {
          key: "hero-image",
          effectId: "hero-image-animate",
        },
      ],
      sequences: [
        {
          effects: [
            {
              key: "hero-cards",
              listContainer: ".cards-list",
              listItemSelector: ".card",
              effectId: "card-reveal",
            },
          ],
          offset: 120,
        },
      ],
    },
  ],
};


```

This is an **Interaction**\- a reusable definition of behavior that describes when something happens, what should happen, and which elements should respond.

---

## **From Motion Infrastructure to Motion Intelligence**

Animation libraries gave developers powerful tools to create motion.

Interact introduces a structured interaction model that makes motion easier to create, understand, and scale.

The same structure that makes Interact easier for developers also makes it easier for AI systems to work with.

Interact configurations are predictable, semantic, and based on intent. This allows Large Language Models to generate, modify, and reason about interactions without having to reconstruct complex imperative animation code.

This predictable, declarative structure gives developers and AI a shared way to describe interactive behavior.

```
Create a hero animation.

When the section enters the viewport:
• Reveal the headline
• Animate the image
• Stagger the feature cards
```

```
const config = {
 interactions: [
   {
     key: "hero",
     trigger: "viewEnter",
     effects: [
       {
         key: "headline",
         effectId: "headline-reveal",
       },
       {
         key: "image",
         effectId: "image-animate",
       },
     ],
     sequences: [
       {
         effects: [
           {
             key: "cards",
             effectId: "card-reveal",
           },
         ],
       },
     ],
   },
 ],
};
```

---

## **Built for modern web motion**

Interact combines:

* Powerful animation capabilities  
* A declarative way to define interactions  
* Reusable effects and sequences  
* Responsive behavior across devices  
* High-performance execution through `@wix/motion`

Interact describes the interaction.

`@wix/motion` executes the animation.

Together, they provide a foundation for building the next generation of motion experiences.

Ready to build?

Create your first Interaction.

## **See also**

- [Set up your first Interaction](http://ADDLINK)  
- [Named effects](http://ADDLINK)  
- [Configuration](http://ADDLINK)

# Getting Started

# Getting Started Tab

# 🧑‍💻 Installation and Entry points

## **Owner: [Idan Levi](mailto:idanlev@wix.com) Reviewer: [Monty Alon](mailto:montya@wix.com)**

# Installation and Entry points

Install `@wix/interact` using your project’s package manager:

```shell
npm install @wix/interact
```

Use `yarn add` or `pnpm add` instead when appropriate.

`@wix/motion` is installed automatically as a dependency and should not be installed separately.

## **Optional: ready-made effects**

Install `@wix/motion-presets` to use ready-made `namedEffect` animations:

```shell
npm install @wix/motion-presets
```

You do not need this package when using only `keyframeEffect` or `customEffect`.

## **Entry points**

Choose the entry point that matches your project:

| Entry point | Use when |
| :---- | :---- |
| `@wix/interact/web` | Static HTML, Web Components, SSR, or most non-React frameworks |
| `@wix/interact/react` | React, Next.js, or Remix |
| `@wix/interact` | Vanilla JavaScript or manual DOM management |

### **Web Components**

```ts
import { Interact } from '@wix/interact/web';
```

### **React**

```ts
import { Interact, Interaction } from '@wix/interact/react';
```

### **Vanilla JavaScript**

```ts
import { Interact, add, remove } from '@wix/interact';
```

All three entry points use the same configuration format, triggers, and effects. They differ only in how elements are connected to interactions.

## **Optional: configuration validation**

For agent-generated configurations or build-time and CI checks, install the validator as a development dependency:

```shell
npm install --save-dev @wix/interact-validate
```

The validator checks configurations without requiring a browser or DOM.

# 🧑‍🌾 My first interaction

## **Owner: [Monty Alon](mailto:montya@wix.com) Reviewer: [Idan Levi](mailto:idanlev@wix.com)**

## 

## **Set up an Interaction**  Types of triggers

Types of effects

Use the `Interaction` React component to wrap the element you want to animate.

````
<Steps>
  <Step title="Configure the Interaction">

Define the `config` object with a `hover` trigger and a `scale` effect:

```tsx
import React, { useEffect } from "react";
import { Interact, Interaction, InteractConfig } from "@wix/interact/react";

const config: InteractConfig = {
  interactions: [
    {
      key: "my-image",
      trigger: "hover",
      effects: [
        {
          keyframeEffect: {
            name: "scale",
            keyframes: [{ scale: 2 }],
          },
          duration: 300,
          easing: "ease-out",
          fill: "both",
        },
      ],
    },
  ],
  effects: {},
};
```

  </Step>
  <Step title="Create the Interaction and render the component">

To bind the Interaction to the target element on the DOM, wrap the target element in an `Interaction` component, and call [`Interact.create()`](ADDLINK) inside a `useEffect()` hook:

```tsx
function App() {
  useEffect(() => {
    const instance = Interact.create(config);
    return () => instance.destroy();
  }, []);

  return (
    <Interaction
      tagName="div"
      interactKey="my-image"
      className="image-container"
    >
      <img src="logo.png" alt="Logo" />
    </Interaction>
  );
}

export default App;
```

In the `useEffect()` cleanup method, call `instance.destroy()` to remove the Interaction when the component unmounts.

  </Step>
</Steps>
````

Use the `interact-element` custom element to wrap the element you want to animate:

````
Wrap your element in an `<interact-element>` tag and give it a unique `data-interact-key`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My First Interaction</title>
</head>
<body>
    <interact-element
    data-interact-key="my-image">
    <img src="logo.png" alt="Logo" />
    </interact-element>

    <script type="module" src="./main.js"></script>
</body>
</html>
```
</Step>
````

```
Define the config object with a hover trigger and a scale effect, then create the Interaction:
```

```javascript
// main.js
import { Interact } from "@wix/interact/web";

const config = {
  interactions: [
    {
      key: "my-image",
      trigger: "hover",
      effects: [
        {
          keyframeEffect: {
            name: "scale",
            keyframes: [{ scale: 2 }],
          },
          duration: 300,
          easing: "ease-out",
          fill: "both",
        },
      ],
    },
  ],
  effects: {},
};

const instance = Interact.create(config);
```

Clean up Interactions when the page unloads: 

```javascript
window.addEventListener("beforeunload", () => {
  instance.destroy();
});
```

Use the vanilla JavaScript entry point with [`add()`](http://ADDLINK) to bind elements after they exist in the DOM:

````
Add the element you want to animate:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My First Interaction</title>
</head>
<body>
    <div class="image-container">
      <img id="my-image" src="logo.png" alt="Logo" />
    </div>

    <script type="module" src="./main.js"></script>
</body>
</html>
```
</Step>
````

```javascript
// main.js
import { Interact, add } from "@wix/interact";

const config = {
  interactions: [
    {
      key: "my-image",
      trigger: "hover",
      effects: [
        {
          keyframeEffect: {
            name: "scale",
            keyframes: [{ scale: 2 }],
          },
          duration: 300,
          easing: "ease-out",
          fill: "both",
        },
      ],
    },
  ],
  effects: {},
};


const instance = Interact.create(config);
const imageContainer = document.querySelector(".image-container");
add(imageContainer, "my-image");
```

Clean up Interactions when the page unloads or when navigating to another component: 

```javascript
window.addEventListener("beforeunload", () => {
  instance.destroy();
});
```

The image now scales up when you hover over it and scales back down when you move the pointer away. The `hover` trigger automatically reverses the animation on pointer exit.

TO DO ADD VISUAL DEMONSTRATION

## **Instead of writing custom keyframes, you can use \[named effects\](ADDLINK), which are pre-made animations from the \`@wix/motion-presets\` package.**

# 🧑‍💻 HTML integration

## **Owner: [Bar Goldenberg](mailto:bargol@wix.com) Reviewer: [Ameer Abu-Fraiha](mailto:ameerf@wix.com)**

# Integration

Interact ships three entry points so you can drop it into any stack — a framework-free page, a React app, or a Web Components setup. All three share the same `Interact` class, the same `generate()` CSS helper, the same [`InteractConfig`](http://ADDLINK) shape, and the same [triggers](http://ADDLINK) and [effects](http://ADDLINK). The only thing that changes between them is **how a DOM element gets bound to an interaction `key`**.

| Entry point | Bind an element by… | Best for |
| :---- | :---- | :---- |
| `@wix/interact/web` | Wrapping content in `<interact-element>` | Server-rendered HTML, Web Components |
| `@wix/interact/react` | Rendering the `<Interaction>` component | React apps |
| `@wix/interact` | Calling `add(element, key)` yourself | Vanilla JS — you own the element lifecycle |

> **Info:** Interact is powered by `@wix/motion`, which comes bundled — you don't install it separately. If you want to use [named effects](http://ADDLINK) (pre-made presets), install `@wix/motion-presets` alongside Interact.

## **Install**

```shell
npm install @wix/interact
```

To use [named effects](http://ADDLINK) from the presets library, also install:

```shell
npm install @wix/motion-presets
```

`@wix/motion-presets` is optional but recommended — it provides the `namedEffect` catalog used throughout the examples.

### **CDN (no build tools)**

For environments without a package manager or build step, load the pre-bundled module straight from a CDN with a native ES module `<script>`. This uses the web (`<interact-element>`) entry point — no bundler required.

```html
<script type="module">
  import { Interact } from 'https://esm.sh/@wix/interact/web';
  // optional — for namedEffect presets
  import * as presets from 'https://esm.sh/@wix/motion-presets';

  Interact.registerEffects(presets); // only needed when using namedEffect
  Interact.create(config);
</script>
```

```html
<interact-element data-interact-key="hero">
  <section class="hero">Hello, animated world!</section>
</interact-element>
```

> **Tip:** Pin a version for production (e.g. `https://esm.sh/@wix/interact@2.5.1/web`) so the CDN can't serve a breaking update unexpectedly.

## **The integration lifecycle**

Regardless of the entry point, every integration follows the same three steps:

1. **Define a config** — an [`InteractConfig`](http://ADDLINK) object describing your interactions.  
2. **Register presets** *(optional)* — if your config uses [`namedEffect`](http://ADDLINK) presets, call `Interact.registerEffects(...)` **before** the next two steps. Both `generate()` and `Interact.create()` need the presets already registered. See [Named effects](#named-effects-registereffects).  
3. **Generate CSS** — call `generate(config)` at build time or on the server, and inject the result into `<head>`. This prepares `@keyframes`, `view-timeline` declarations, transitions, and — for entrance animations — prevents a flash of un-animated content (FOUC).  
4. **Create the runtime** — call `Interact.create(config)` on the client to start observing triggers and running effects.

The only per-framework difference is how each keyed element is bound to the runtime.

```
config ─┬─► generate(config) ─────► CSS → <head>   (build time / SSR)
        └─► Interact.create(config) ─► triggers → effects  (client)
```

---

## **Web (Custom Elements)**

The `@wix/interact/web` entry point registers the `<interact-element>` custom element. Wrap each interactive region in `<interact-element>` and give it a `data-interact-key` that matches your interaction's `key`. Binding happens automatically when the element connects — no manual `add()` call needed.

```ts
import { Interact, generate, type InteractConfig } from '@wix/interact/web';
// Optional — only if your config uses namedEffect presets
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

// Optional — register presets before generate()/create() when using namedEffect
Interact.registerEffects(presets);

// Render CSS (e.g. during SSR) — pass `true` so :first-child selectors are emitted
const interactCSS = generate(config, true);

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

**Key remarks**

- `data-interact-key` **must** be unique within the page and match the interaction's `key`.  
- `<interact-element>` **must** wrap at least one child element — Interact targets its `:first-child` by default.  
- When generating CSS for the web entry point, pass `generate(config, true)` so `:first-child` selectors are emitted correctly.

---

## **React**

The `@wix/interact/react` entry point adds the `<Interaction>` component. It renders the tag you specify, stamps the `data-interact-key` attribute, and binds/unbinds the element automatically through a ref — so you don't call `add()`/`remove()` yourself.

Create the runtime inside `useEffect` (so it never runs during server rendering) and tear it down on cleanup.

```
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

export function App() {
  // Pass `false` for React — <Interaction> renders the keyed element directly
  const interactCSS = generate(config, false);

  useEffect(() => {
    const instance = Interact.create(config);
    return () => instance.destroy();
  }, []);

  return (
    <>
      <style>{interactCSS}</style>

      {/* <Interaction> binds this <section> to the "hero" key */}
      <Interaction tagName="section" interactKey="hero" className="hero">
        <h1>Welcome</h1>
      </Interaction>
    </>
  );
}
```

**`<Interaction>` props**

| Prop | Type | Description |
| :---- | :---- | :---- |
| `tagName` | `string` | **Required.** The HTML tag to render (e.g. `"section"`, `"div"`). |
| `interactKey` | `string` | **Required.** Unique key matching an interaction's `key`. |
| `...rest` | — | Any valid props for `tagName` (`className`, `style`, event handlers, `ref`, etc.). |

**Manual binding with `createInteractRef`**

If you need to attach an interaction to an element you render yourself (instead of via `<Interaction>`), use the `createInteractRef` callback:

```
import { createInteractRef } from '@wix/interact/react';

function Hero() {
  const interactRef = createInteractRef('hero');
  return <section ref={interactRef} className="hero"><h1>Welcome</h1></section>;
}
```

**Key remarks**

- Always call `Interact.create()` inside `useEffect` and call `instance.destroy()` in the cleanup function.  
- `tagName` must be a valid HTML tag; `interactKey` must be unique within the page.  
- Pass `generate(config, false)` for React — the keyed element is rendered directly, without a `<interact-element>` wrapper.

---

## **Vanilla JS**

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
document.head.insertAdjacentHTML('beforeend', `<style>${generate(config)}</style>`);

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

**API**

| Function | Description |
| :---- | :---- |
| `add(element, key)` | Binds a DOM element to an interaction `key`. Call it **after** the element is in the DOM. |
| `remove(key)` | Unbinds every interaction registered for `key` and disconnects its triggers. |

**Notes**

- `add()` must run after the target element exists in the DOM.  
- For content that appears later (modals, infinite lists, route changes), call `add()` when the element mounts and `remove()` when it unmounts.

---

## **Named effects (`registerEffects`)**

To use `namedEffect` presets from `@wix/motion-presets`, register them **before** calling `generate()` or `Interact.create()`.

```ts
import { Interact } from '@wix/interact/web';
import * as presets from '@wix/motion-presets';

// Register all presets…
Interact.registerEffects(presets);

// …or register only the ones you use
import { FadeIn, ParallaxScroll } from '@wix/motion-presets';
Interact.registerEffects({ FadeIn, ParallaxScroll });
```

Then reference a preset by type inside an effect:

```ts
{ namedEffect: { type: 'FadeIn' }, duration: 800, easing: 'ease-out' }
```

> **Important:** `registerEffects()` must run before `generate()` and `Interact.create()` whenever your config uses `namedEffect`. Registering only the presets you use keeps your bundle smaller.

---

## **Generating CSS & preventing FOUC**

`generate(config, useFirstChild)` produces the complete CSS for **all** interactions in a config in one pass — `@keyframes`, animation/transition custom properties, `view-timeline` declarations, state-selector rules, and — for entrance animations — FOUC-prevention rules. Run it at build time or on the server and inject the output into `<head>`.

```ts
import { generate } from '@wix/interact/web';

const css = generate(config, /* useFirstChild */ true);
```

| Argument | Description |
| :---- | :---- |
| `config` | The same `InteractConfig` you pass to `Interact.create()`. |
| `useFirstChild` | `true` for the **web** (`<interact-element>`) entry point; `false` for **vanilla** and **React** integrations. |

### **Why FOUC prevention matters**

Entrance animations (for example, a `FadeIn` on `viewEnter`) start from a hidden or offset state. Before the animation engine applies that starting frame, the element would briefly render in its final, visible state — a **flash of un-animated content (FOUC)**. The CSS from `generate()` includes initial rules that hold those elements in their starting state until the animation begins.

**Notes**

- `generate()` covers the whole config, not just entrance triggers — always inject it, even for hover/click-only pages.  
- Call it server-side or at build time. Calling it on the client is fine only if page content is initially hidden (for example, behind a loader).  
- FOUC initial rules apply to `viewEnter` with `triggerType: 'once'` (the default) where the source and target are the same element.

---

## **Static API reference**

Each `Interact.create(config)` call returns an `Interact` instance. Keep a reference if you need to dynamically bind elements, or to destroy that instance later.

| Member | Description |
| :---- | :---- |
| `Interact.create(config, options?)` | Initializes a runtime for the config and returns the instance. Multiple configs create separate instances. |
| `Interact.registerEffects(presets)` | Registers `namedEffect` presets. Call before `generate()`/`create()` when using named effects. |
| `Interact.setup(options)` | Sets global defaults for scroll (`viewProgress`), pointer (`pointerMove`), and `viewEnter` behavior, and toggles a11y triggers. Call before `create()`. |
| `Interact.destroy()` | Tears down **all** instances (e.g. on full page navigation). |
| `instance.destroy()` | Tears down a single instance created by `Interact.create()`. |
| `Interact.forceReducedMotion` | `boolean` — force reduced-motion behavior regardless of the OS setting. Default: `false`. |
| `Interact.allowA11yTriggers` | `boolean` — enable the accessible trigger variants (`interest`, `activate`). Default: `true`. |

### **`Interact.setup(options)`**

Configure global trigger defaults before creating any instances:

```ts
Interact.setup({
  viewEnter: { threshold: 0.25 },              // default viewport-entry threshold
  scrollOptionsGetter: () => ({ /* … */ }),    // defaults for viewProgress
  pointerOptionsGetter: () => ({ /* … */ }),   // defaults for pointerMove
  allowA11yTriggers: true,                      // enable interest / activate
});
```

`scrollOptionsGetter` and `pointerOptionsGetter` each return a partial config that Interact merges into every scroll- or pointer-driven scene — use them to set global smoothing, velocity, or a custom scroll `root`. See [scroll options](http://ADDLINK) and [pointer options](http://ADDLINK) for the full list of fields.

---

## **Choosing an entry point**

- **Server-rendered HTML or a design tool output?** Use **web** (`<interact-element>`) — binding is automatic and works without hydration.  
- **React app?** Use **react** (`<Interaction>`) — lifecycle and binding are handled for you.  
- **Full control over the DOM, or a non-React framework?** Use **vanilla** — call `add()`/`remove()` at the right moments in your own lifecycle.

All three produce identical animations from the same config; pick the one that matches how you render markup.

## **See also**

- [Set up your first Interaction](http://ADDLINK)  
- [Configuration structure](http://ADDLINK)  
- [Named effects](http://ADDLINK)  
- [Triggers](http://ADDLINK)

# 🧑‍🌾 The final result \+ examples links

## **Owner: [Ori Tirosh](mailto:orit@wix.com) Reviewer: [Ameer Abu-Fraiha](mailto:ameerf@wix.com)**

A "connecting all together" example with html, css, js and explanations:

CSS \- `generate` viewEnter animation (\`generate(config)\`)

HTML \- interact-element (key)

FOUC \- flashing of unstyled content \- hover/click

Type of effects \- keyframeEffects, namedEffects, transitionEffects (states)

`interact.create(config)`

# Configuration

# 🧑‍🌾 the config object

## **Owner: [Hassan Kittany](mailto:hassank@wix.com) Reviewer: [Yehonatan Daniv](mailto:ydaniv@wix.com)**

---

## **About the Config Object**

## 

**InteractConfig** is the single object that describes every interaction on a page. It has one required field: **interactions** \- an array of Interaction definitions, plus three optional registries of reusable pieces those interactions can reference by id: 

* **effects** (by `effectId`)  
*  **sequences** (by `sequenceId`)  
* **conditions**

The whole config is built up front and passed to `Interact.create()`, which wires up all the triggers, observers, and timelines, or to `generate()` for generating CSS.

**Interactions:** An Interaction binds a trigger (click, hover, pointer-move, entrance, scroll or animation-end) on a source element to one or more effects that play in response. 

For more information on Interactions check out [“What is an interaction"]().

**Effects:**  An Effect is a single visual change applied to a target element that runs when its interaction's trigger fires. Each effect carries exactly one of the following: 

* `namedEffect`  \-a registered preset  
* `keyframeEffect` \- your own keyframes  
* `customEffect` \- an imperative per-frame callback  
* `transitionProperties` or `transition` \- a CSS style toggle.

For more information on Effects check out [“What are effects”]().

**Sequences:** A Sequence coordinates several Effects, possibly with staggered timing, so they are fired and controlled as one orchestrated group instead of multiple single Effects.

For more information on Sequences check out [“Sequences and lists”]().

**Conditions:**  A Condition is a named predicate (a CSS media query or a selector) that specifies whether something applies, evaluated against the environment or the DOM. conditions can be attached by id to an interaction (gating the whole trigger), to an individual effect (skipping just that effect), or to a sequence; all listed conditions must pass.

For more information on Conditions check out [“Conditions”]().

## **Structure**

The `InteractConfig` object has the following top-level properties:

```ts
type InteractConfig = {
  interactions: Interaction[]; // REQUIRED
  effects?: Record<string, Effect>; // reusable effects referenced by effectId
  sequences?: Record<string, SequenceConfig>; // reusable sequences by sequenceId
  conditions?: Record<string, Condition>; // named conditions; keys are condition ids
};
```

## **Example**

```html
<interact-element data-interact-key="card-row">
  <div class="cards">
    <article class="card">One</article>
    <article class="card">Two</article>
    <article class="card">Three</article>
  </div>
</interact-element>

```

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
      conditions: ['desktop'],              // references the conditions map below
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
      offset: 120,                          // ms between each card starting
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

# triggers

# 🧑‍🌾 what is a trigger?

## **Owner: [Ori Tirosh](mailto:orit@wix.com) Reviewer: [Bar Goldenberg](mailto:bargol@wix.com)**

---

## **Title: What is a trigger?**

A trigger is the event that starts — or continuously drives — an interaction. It's the bridge between something that happens (a hover, a click, a scroll, the cursor moving, an element entering the screen) and the animations Interact plays in response.

In Interact you don't wire up your own event listeners or observers. Instead you describe interactions declaratively: each interaction binds one trigger to one or more effects on a keyed element, and the library handles the listening, observing, and cleanup for you.

```ts
{  
  key: "my-element",     // which element (its data-interact-key)  
  trigger: "viewEnter",  // the event that fires the effects  
  effects: [{ effectId: "fade-in" }],  
}
```

## 

## **Trigger list and overview**

Interact ships with eight triggers, spanning pointer input, the viewport, scrolling, and animation chaining:

| Trigger | Fires when… |
| :---- | :---- |
| `hover` | the pointer enters or leaves the element |
| `click` | the element is clicked |
| `interest` | accessible hover — pointer or keyboard focus |
| `activate` | accessible click — click, Enter, or Space |
| `viewEnter` | the element scrolls into the viewport |
| `viewProgress` | continuously, mapped to scroll position |
| `pointerMove` | continuously, mapped to the cursor's position |
| `animationEnd` | another effect finishes (for chaining) |

*(In the live page, each trigger name links to its own chapter — a ↗ icon appears to its left and it underlines on hover.)*

Each trigger has its own chapter with its full options and examples — this page just introduces the concept and shows how they combine.

## **Combining triggers**

See [here]()

# 🧑‍💻 viewEnter

## **Owner: [Yehonatan Saharof](mailto:yehonatans@wix.com) Reviewer: [Bar Goldenberg](mailto:bargol@wix.com)**

# Entrance Animations (`viewEnter`)

Entrance animations play when an element becomes visible in the viewport. Scroll down, and content introduces itself — It is a common pattern for reveal-on-scroll sections, staggered grids, visual reveals, and ambient loops that should run only while they are on screen.

## **How it works:** `IntersectionObserver`

@wix/interact's viewEnter trigger is built on the native IntersectionObserver — the browser API that reports when an element crosses in and out of the viewport. The browser tells the library when the source element becomes visible, and the library plays the animation.  
[https://developer.mozilla.org/en-US/docs/Web/API/Intersection\_Observer\_API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

### **An event trigger**

The viewEnter trigger is an event trigger: something happens — the element enters the viewport — and an animation plays over its duration. Once triggered, the animation runs on its own clock; scrolling faster doesn't speed it up, and scrolling back doesn't rewind it. If you want motion that tracks the scroll position itself, that's viewProgress. If you want a self-contained animation to play the moment content appears, that's viewEnter.

Because the animation plays over time, viewEnter works with the time-based animation payloads — `keyframeEffect`, `namedEffect`, and `customEffect` — each paired with a `duration`, plus the usual timing controls: `delay`, `easing`, `fill`, `iterations`, `alternate`, `reversed`, and `composite`. It does not drive state effects (`transition` / `transitionProperties`); those respond to user input and are covered in the click & hover chapter.

`alternate` appears in two different places in the API. `triggerType: 'alternate'` controls what happens when the source enters and exits. The timing option `alternate: true` alternates the direction of successive animation iterations. They can be used together, but they solve different problems.

`reversed: true` makes the animation's initial playback direction run from its end toward its start. `composite` controls how animated values combine with other animations affecting the same properties: `'replace'` (the default), `'add'`, or `'accumulate'`.

Give every `keyframeEffect` a unique `name` within the config so its generated `@keyframes` rule cannot collide with another effect.

## **Choosing a behavior with** `triggerType`

The most important decision for a viewEnter animation is what happens on repeat visits — because unlike a click, scrolling past an element can happen many times. That behavior is chosen with `triggerType`, set **on each effect** or on a sequence (the interaction's `params` only holds observer tuning — see the next section). The table shows the enter/exit behavior; see the threshold note below when the exact trigger point matters.

| triggerType | When the element enters | When the element exits |
| :---- | :---- | :---- |
| `once` (default) | Plays once; the trigger is then removed | — |
| `repeat` | Restarts from the beginning | Resets, once the element is fully out of view |
| `alternate` | Plays forward | Plays in reverse |
| `state` | Plays or resumes | Pauses (keeping its progress), once fully out of view |

* `once` is the classic entrance: the element reveals itself the first time the visitor reaches it, and stays put. This is the default, and the right choice for most content reveals.  
* `repeat` replays the animation on every visit — the element resets when it has scrolled completely out of view, ready to play again on the next encounter. Good for counters and attention moments that should feel fresh each time.  
* `alternate` makes visibility reversible: the animation plays as the element enters and reverses as it exits. Note the boundary: alternate reverses as soon as the element crosses back below the trigger threshold, while repeat and state wait until the element is completely out of view before resetting or pausing.  
* `state` treats the animation as something that's running while the element is on screen — typically a loop with `iterations: Infinity`. It resumes where it left off on entry and pauses off-screen. Like all the re-triggering types, it should use a separate source and target when the animation can change the source's intersection geometry (see the caveat below). Here a stable wrapper is observed while the orb inside it animates:

Use `fill: 'both'` for `repeat`, `alternate`, and `state` effects so their endpoints remain applied and the animation stays available for replay. For a `once` effect whose final keyframe matches the element's normal styling, `fill: 'backwards'` is useful when a delay must hold the first keyframe. If a `once` effect ends in a look that differs from the element's normal CSS and that look must persist, use `fill: 'forwards'` or `'both'` instead.

```javascript
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

## **Tuning the observer:** `threshold` **and** `inset`

The interaction's `params` holds the observer options:

* `threshold` — a number from 0 to 1 passed to `IntersectionObserver`. The default is 0.2.  
* `inset` — a length (`'100px'`, `'10%'`) that shrinks or grows the trigger area at the top and bottom of the viewport. A positive inset contracts the area inward, so the trigger fires late — only once the element is that far inside the viewport (useful when triggering at the very edge feels premature). A negative inset extends the area beyond the viewport, so the trigger fires early — before the element is actually visible (useful for preparing content just off-screen). Two space-separated values set top and bottom independently (`'10% 30%'`).

The library also exposes `useSafeViewEnter` for a source whose configured threshold cannot fit inside the viewport. In that case, it falls back to a safe entry point near the viewport edge so the animation is not silently skipped. Supply an explicit `threshold` when enabling this option; it does not currently evaluate the default threshold.

If your whole site shares the same tuning, set it once with `Interact.setup({ viewEnter: { threshold: 0.2, inset: '-50px' } })` before calling `Interact.create(config)` — this example starts every entrance 50px before its element scrolls into view. Per-interaction `params` still override the global defaults. Setup changes affect handlers created afterward; they do not rebuild handlers that are already installed.

## **Keep the observed element stable**

For `repeat`, `alternate`, and `state`, prefer a stable source element and animate a separate target. This matters most when the effect translates, scales, clips, or otherwise changes the source's visible geometry.

The interaction's `key` identifies the keyed root used to resolve the source. Without further selection, that resolves to the keyed element itself in vanilla JS and React, or the first child of `<interact-element>` in the Custom Elements integration. An interaction-level `selector` or `listContainer` can instead resolve one or more actual source elements inside that root. An effect's `key` identifies its target root; when it is omitted, the effect uses the source root, and effect-level selection can narrow the target further. If source and target ultimately resolve to the same element, a geometry-changing animation can affect the visibility signal that controls its own playback, causing repeated or skipped triggers.

With `once`, self-targeting is fine and common because the trigger detaches after its first play. For a re-triggering type, observe a stable wrapper or sibling and animate the content inside it. The optional `@wix/interact-validate` package also warns about same-source/target re-triggering effects.

Also avoid mixing an `alternate` effect with `repeat` or `state` effects on the same observed source in the current release. `repeat` and `state` install an additional full-exit observer whose signal is shared by the source's handlers; an `alternate` effect can therefore reverse once at its threshold and again when the source becomes fully out of view. Use separate stable source elements for those behaviors until this limitation is removed.

Also make sure the source is actually observable. A source with no rendered box (`display: none`), one fully clipped by ancestor overflow, `clip-path`, or a mask, or one transformed entirely outside the viewport may never intersect, so its trigger never fires. When the visual effect needs those techniques, observe a stable wrapper and apply them to a separate target.

## **Preventing the entrance flash**

For details on preventing the entrance flash, see [this section](https://docs.google.com/document/d/1eA87a5WbgpyVhq_ovC7xdBE5xgG93MnmBz-4AazYex0/edit?tab=t.9c7lew2kb6lw#heading=h.ilmlqeeyctdx).

## **Example: a feature card reveal**

Trigger a single `viewEnter` interaction to reveal a feature card. Here, the card serves as both the observed source and the animated target. This self-targeting is safe because `once` is the default behavior, and the library's generation logic handles the initial hiding automatically.

```javascript
const config = {
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

Result: The feature card fades in and rises as a unified element once it crosses the 0.2 `threshold`. The animation is restricted to a single playback; it remains in its final state even if the visitor leaves and returns to the section.

## **Example: a counter that plays on every visit**

`customEffect` receives `(element, progress)`, with progress eased from 0 → 1 during playback. Cancellation or cleanup can report `null`, so callbacks should handle it. Here the observed source (the section) and the animated target (the number) are separate elements, as recommended for `repeat`:

```javascript
const config = {
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

Result: Each time the stats section enters the configured observer area, the number counts up from 0 to 12,500 over 1.8 seconds. Scroll it fully out of view and back, and it counts again. Swap to `triggerType: 'once'` if it should only ever count once. Because of the current threshold limitation above, do not describe `threshold: 0.5` as a guaranteed 50%-visible gate yet.

# 🧑‍💻 click & hover

## **Owner: [Yehonatan Saharof](mailto:yehonatans@wix.com) Reviewer: [Marine Bretonniere](mailto:marinebr@wix.com)**

# Click & Hover

Click and hover are the triggers of direct manipulation: the visitor does something, and the interface answers — a card lifts to meet the cursor, a menu unfolds on tap, a button pulses to confirm. They use the same declarative config as everything else in @wix/interact, so the library owns animation playback, event listeners, and cleanup. Application state that carries meaning — whether a menu is open, for example — still belongs to your UI code and accessibility layer.

## **One trigger, two kinds of payloads**

Here's the key mental model for this chapter. Click and hover can drive both effect families:

* Animations — `keyframeEffect`, `namedEffect`, or `customEffect` with a `duration`. A choreographed piece of motion that plays, reverses, restarts, or pauses when the trigger fires.  
* State effects — `transition` / `transitionProperties`. A set of target CSS values the element should move to, animated by a CSS transition. Firing the trigger switches the state on or off; think of it as a class toggle that comes with its transition built in.

The rule of thumb: if you're describing motion — keyframes, a bounce, a multi-step sequence — use an animation. If you're describing a second look for the element — "while hovered, the button is dark and lifted" — use a state effect, and let the transition handle getting there and back.

Both behaviors are configured on the effect itself: animations with `triggerType` (how the animation behaves across repeated triggers), state effects with `stateAction` (how the state is switched). Both are covered below.

As with `viewEnter`, the interaction's `key` identifies the keyed root used to resolve the source, and each effect's `key` identifies its target root. Interaction-level `selector` or `listContainer` fields can resolve descendant or list-item sources; effect-level selection does the same for targets. Omit the effect key to use the source root as the target root, or add `selector` to target descendants inside it.

Time-based effects can also be grouped into a sequence when one click or hover should coordinate several targets.  See the [Sequence section]().

## **Keyboard equivalents are enabled by default**

Pointer-only interactions exclude keyboard users, so @wix/interact wires keyboard equivalents automatically: the hover source is made focusable, focus in/out map to hover enter/leave, and Enter or Space count as a click (with Space's default page scroll suppressed). These behaviors also exist as explicit trigger names \- `activate` and `interest` \- and by default, click and hover are upgraded to them automatically.  
Two things remain your responsibility: semantic state (a toggled menu must still update aria-expanded \- Interact only animates), and respecting prefers-reduced-motion.

## **Use conditions for input capabilities and motion preferences**

Hover is not a dependable interaction on coarse-pointer touch devices. For decorative pointer-only effects, add a media condition so the interaction is installed only on devices that can hover accurately. Don't use this condition to suppress a focus treatment keyboard users need \- use `interest` for that.

```javascript
const config = {
  conditions: {
    'fine-hover': {
      type: 'media',
      predicate: '(hover: hover) and (pointer: fine)',
    },
  },
  interactions: [
    {
      key: 'decorative-card',
      trigger: 'hover',
      conditions: ['fine-hover'],
      effects: [
        {
          selector: '.artwork',
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

## **Hover**

The pointer path for hover uses enter and leave; with the default accessibility upgrade, focus in and focus out follow the same playback behavior. For animations, `triggerType` decides how those paired events map onto playback:

| triggerType | On pointer enter | On pointer leave |
| ----- | ----- | ----- |
| `alternate` (default) | Plays forward | Plays in reverse |
| `repeat` | Restarts from the beginning | Cancels — the target snaps to idle |
| `once` | Can play once per input method | — |
| `state` | Plays or resumes (unless finished) | Pauses, keeping its progress |

`alternate` is the natural hover feel and the default: the effect builds up while the pointer arrives and unwinds when it leaves. It's fully interruption-safe — if the pointer leaves mid-animation, the direction simply flips from wherever it is, with no jumps or restarts. Give alternate effects `fill: 'both'` so the target holds the hovered look while the pointer stays, and holds the rest look after unwinding.

`repeat` replays an attention effect — a wiggle, a pulse — from the top on every enter. Use `fill: 'both'` for repeat effects as well, so the animation remains available for efficient replay. `state` turns hover into a play/pause control for a loop (`iterations: Infinity`): spinning while hovered, frozen when not. Once a finite `state` animation finishes, it is not restarted by later hover entries, so use an infinite iteration count when ongoing play/pause behavior is required.

With the default accessibility upgrade, `once` applies independently to pointer entry and keyboard focus. A pointer entry and a later focus can therefore each play the effect once. Do not use this mode as a global exactly-once business guard.

### **Keep the hover hit area stable**

If an animation moves, scales, or rotates the hovered element considerably, it can slide out from under the pointer. That fires leave and reverses the animation, potentially bringing the element back under the pointer and starting a flicker loop. Small same-element motion may be stable in practice, but a stationary source with a separate animated child, overlay, or sibling is safer. `@wix/interact-validate` warns about same-source/target keyframes that contain translate, scale, or matrix transforms; rotation can create the same runtime risk even though that rule does not currently flag it.

### **Example: a product card that responds in layers**

One hover, three targets: the card surface lifts, the photo zooms inside its frame, and a quick-add button reveals itself a beat later. The outer `.product-card-hit-area` stays still as the hover/focus source; the animated card surface is a child. All three effects rely on `alternate` being the default, and `selector` narrows effects to descendants of the keyed element.

```javascript
const config = {
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
          selector: '.product-photo', // narrow the target to the photo
          keyframeEffect: {
            name: 'photo-zoom',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }],
          },
          duration: 350,
          easing: 'ease-out',
          fill: 'both',
        },
        {
          key: 'quick-add', // separate target: revealed by hovering the card
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
  effects: {},
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
  opacity: 0; /* matches the reveal's first keyframe — see note below */
  transform: translateY(8px);
}
```

Result: Hovering anywhere on the card lifts it, zooms the photo, and fades the button in — three effects with independent timing, all from one trigger. Moving the pointer away runs everything smoothly in reverse.

Match your CSS to the first keyframe. The reveal animation only exists after the first hover — before that, the button renders exactly as your stylesheet says. For reveal-style effects, the element's stylesheet state (here both `opacity` and `transform`) must equal the animation's first keyframe, or it can flash or jump when the first interaction begins. (This is the pointer-trigger cousin of the entrance-flash problem covered in the viewEnter chapter.)

## **Click**

Click fires once per activation — there's no natural "opposite" event like leave — so `triggerType` decides what successive clicks mean:

| triggerType | On each click |
| ----- | ----- |
| `alternate` (default) | First click plays; every further click reverses direction — a toggle |
| `repeat` | Restarts from the beginning |
| `once` | Has separate one-shot pointer and keyboard listeners |
| `state` | Plays or toggles play/pause while the animation is unfinished |

`alternate` turns any animation into an open/close toggle: click to play forward, click again to reverse — even mid-animation, where the direction just flips in place. `repeat` is for feedback bursts that confirm an action. `state` makes the click a play/pause button while the animation is unfinished; once a finite animation reaches its finished state, later clicks do not restart it. Use `iterations: Infinity` for a persistent play/pause control. If your element starts in the "open" pose and the first click should close it, add `reversed: true` to the effect to flip the initial direction.

Use `fill: 'both'` for alternate and repeat click effects so their endpoints remain applied and the animation can be replayed or reversed efficiently. For a once-only effect with a delay, `fill: 'backwards'` holds the first keyframe during that delay.

As with hover, `once` installs independent pointer and keyboard listeners. It is not a global exactly-once guard across input methods. In the current release, the keyboard listener itself uses one-shot event handling, so pressing a non-activation key while the source is focused can consume that listener before Enter or Space is pressed. Do not use this mode as an exactly-once business guard.

### **Example: a mobile menu toggle**

The nav starts closed in CSS (matching the first keyframe), and each tap of the hamburger reverses the animation direction without application-level playback bookkeeping, since `alternate` is the default. A second effect rotates the hamburger icon in sync. Semantic open/closed state is still the application's responsibility, as noted after the example.

```javascript
const config = {
  interactions: [
    {
      key: 'menu-button',
      trigger: 'click',
      effects: [
        {
          key: 'mobile-nav',
          keyframeEffect: {
            name: 'nav-slide',
            keyframes: [
              { transform: 'translateX(-100%)' },
              { transform: 'translateX(0)' },
            ],
          },
          duration: 300,
          easing: 'ease-out',
          fill: 'both',
        },
        {
          key: 'menu-button',
          selector: '.menu-icon',
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
  effects: {},
};
```

```html
<interact-element data-interact-key="menu-button">
  <button
    class="menu-button"
    aria-label="Menu"
    aria-controls="mobile-nav"
    aria-expanded="false"
  >
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

Result: Tapping the button slides the nav in and turns the icon; tapping again runs both in reverse. Because the trigger is keyboard-accessible by default — and the source is a native `<button>` — Enter and Space on the focused button do the same.

This config controls the visuals only \- keeping aria-expanded and the closed panel's focusability in sync is still your application's job.

## **State effects: toggle a look, not a timeline**

State effects flip the target between its stylesheet look and a declared alternate look. Instead of keyframes, you declare the destination values, and a transition carries the element there:

```javascript
{
  key: 'pricing-card',
  trigger: 'hover',
  effects: [
    {
      key: 'pricing-card',
      selector: '.cta-button', // hovering the card highlights its button
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

This is `:hover` with superpowers: it can target a different element than the one being hovered, it can be switched by clicks as well as hovers, and its on/off behavior is configurable via `stateAction` on the effect:

| stateAction | On click | On hover |
| ----- | :---- | :---- |
| `toggle` (default) | Each click flips the state on/off | On while hovered — added on enter, removed on leave |
| `add` | Switches the state on (repeat clicks are harmless) | Entering switches it on; it stays on |
| `remove` | Switches the state off | Entering switches it off |
| `clear` | Clears all active states on the target | Same, on enter |

`remove` only has something stable to remove when it refers to the same `effectId` that was previously added. 

Under the hood, Interact generates the CSS for you: your `styleProperties` are applied while the state is on, and the transition rule lives on the target — so both directions animate, into the state and back out. States persist until something removes them. If you pre-generate the CSS, apply the reduced-motion guidance above. Custom properties (`--accent-color`) can be set as state values; register them with CSS `@property` if they must interpolate smoothly. If you need different timing per property, use `transitionProperties` instead of `transition` — each entry carries its own `duration`, `delay`, and `easing`.

Inline state effects receive a generated internal identity. That is fine when `generate(config)` and `Interact.create(config)` use the same in-memory config object, but a server/build process and a separately evaluated client bundle can generate different identities. For deterministic pre-generated state CSS, declare the state effect in the top-level `effects` map and reference it by a stable `effectId`, as in the cart example below.

Because a state outlives the interaction that set it, several interactions can drive the same state. Declare the effect once in the top-level `effects` map, and reference it by `effectId`:

### **Example: a cart drawer with separate open and close buttons**

```javascript
const config = {
  effects: {
    'cart-open': {
      key: 'cart-panel',
      transition: {
        duration: 400,
        easing: 'ease-in-out',
        styleProperties: [{ name: 'transform', value: 'translateX(0)' }],
      },
    },
  },
  interactions: [
    {
      key: 'open-cart-button',
      trigger: 'click',
      effects: [{ effectId: 'cart-open', stateAction: 'add' }], // opening an open cart is a no-op
    },
    {
      key: 'close-cart-button',
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

Result: The cart button slides the panel in; the × slides it out. Because `add` and `remove` are idempotent, mashing either button never gets the drawer into a broken half-state — the two interactions just converge on the same shared cart-open state.

## **Presets from** `@wix/motion-presets`

For pointer feedback, reach for ongoing presets that return to a neutral pose: Bounce, Breathe, Cross, Flash, Flip, Fold, Jello, Poke, Pulse, Rubber, Spin, Swing, and Wiggle. They pair naturally with `triggerType: 'repeat'` for a fresh burst per interaction. For play/pause looping with `triggerType: 'state'`, also set `iterations: Infinity`.

```javascript
{
  key: 'notification-bell',
  trigger: 'hover',
  effects: [
    {
      key: 'notification-bell',
      selector: '.bell-icon', // keep the hover source stationary
      triggerType: 'repeat',
      namedEffect: { type: 'Wiggle' },
      duration: 500,
      easing: 'ease-in-out',
      fill: 'both',
    },
  ],
}
```

The entrance presets (FadeIn, SlideIn, ExpandIn, …) work here too: after registering the presets with `Interact.registerEffects(...)`, combine them with `triggerType: 'alternate'` and `fill: 'both'` to create reveal toggles for tooltips, menus, and overlays. Remember to match the target's stylesheet state to the hidden first keyframe, as covered above.

# 🧑‍💻 viewProgress

## **Owner: [Ameer Abu-Fraiha](mailto:ameerf@wix.com) Reviewer: [Marine Bretonniere](mailto:marinebr@wix.com)**

# Scroll-Driven Animations (`viewProgress`)

Scroll-driven animations tie an animation's progress directly to the scroll position, rather than to elapsed time. As you scroll, the animation advances; as you scroll back, it rewinds; when you stop, it holds. This is the technique behind parallax layers, reading-progress bars, reveal-on-scroll galleries, pinned "sticky" sections, and full scrolly-telling experiences.

Once the domain of heavy JavaScript scroll listeners, this class of effect has become a first-class web platform feature and a growing design trend. The browser can now drive these animations natively — off the main thread, without a single scroll event handler. For the wider platform picture, see [MDN: CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations).

## **How it works: `ViewTimeline`**

`@wix/interact`'s `viewProgress` trigger is built on the native [`ViewTimeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-timeline) — a timeline whose progress is defined by a subject element's position as it passes through its scroll container. `ViewTimeline` is supported across most modern browsers; where it isn't available natively, `@wix/interact` ships a built-in polyfill, so you can author the same configuration everywhere and let the library pick the native path when it can.

### **A continuous trigger, not an event trigger**

This is the key mental shift from the time-based triggers (`hover`, `click`, `viewEnter`). Those are **event triggers**: something happens, and an animation plays over a fixed `duration`. `viewProgress` is a **continuous trigger**: there is no duration and nothing "plays." Instead, the scroll position continuously drives — *scrubs* — the effect's progress from `0` to `1`.

- When the user isn't scrolling, the effect is **static** — frozen at whatever progress the current scroll position maps to.  
- Scrolling forward advances the effect; scrolling back reverses it.

Because the progress is scrubbed rather than played, `viewProgress` works with the animation payloads that expose a progress timeline — `keyframeEffect`, `namedEffect`, and `customEffect` — but it **cannot** be used with state effects (`transition` / `transitionProperties`). Those describe a discrete state change over a time-based transition, which has no meaning on a scrubbed timeline.

## **Critical caveat: `overflow: hidden` breaks `ViewTimeline`**

> **CRITICAL:** `overflow: hidden` on **any** element between the source and its scroll container silently breaks the timeline.

`overflow: hidden` establishes a new scroll container. When one appears between your source element and the scroll container the timeline expected, the `ViewTimeline` no longer resolves the way you intended and the animation won't track scroll correctly.

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

Audit every ancestor between your `viewProgress` source and its scroll container. (Using Tailwind? Replace `overflow-hidden` with `overflow-clip`.)

## **Parameters: `rangeStart` and `rangeEnd`**

`viewProgress` needs no `params` on the interaction — there is no threshold or hit-area to configure. Instead, the scroll window that maps to progress `0 → 1` is defined **per effect** with `rangeStart` and `rangeEnd`.

Each is a named range plus an optional offset:

```ts
rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } }
rangeEnd:   { name: 'cover', offset: { unit: 'percentage', value: 100 } }
```

The `name` selects a phase of the subject's pass through the scroll container:

| Range name | Meaning |
| :---- | :---- |
| `cover` | Full span, from the first pixel entering to the last pixel leaving. |
| `entry` | While the element is entering the viewport. |
| `exit` | While the element is exiting the viewport. |
| `contain` | While the element is fully contained in the viewport (great with sticky). |
| `entry-crossing` | Extends `entry` range on elements larger than the viewport up to the trailing edge entering the viewport. |
| `exit-crossing` | Extends `exit` range on elements larger than the viewport from where the leading edge left the viewport. |

The `offset` shifts a boundary within that phase — `{ unit: 'percentage', value: 0–100 }` for relative positions, or absolute lengths like `{ unit: 'px', value: 200 }`. These map directly to the CSS `animation-range` property; see [MDN: `animation-range`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-range) for the full range-name reference.

### **Hold the effect in place with `fill: 'both'`**

Notice that every scroll-driven effect in this chapter sets `fill: 'both'` — and as a rule, you should too. `fill` maps to the CSS [`animation-fill-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode), which decides how the target looks *outside* the active range: before `rangeStart` and after `rangeEnd`.

With the default, `fill: 'none'`, the effect only applies while the scroll position is inside the range; on either side the target snaps back to its un-animated state. For a scrubbed animation that almost always looks wrong — the element would pop into its start value as the range begins and pop back out once it ends. `fill: 'both'` instead pins the first keyframe before the range starts and holds the last keyframe after it finishes, so the target stays exactly where the scroll left it at either boundary. That continuity is what you want in virtually every `viewProgress` effect, so reach for `fill: 'both'` by default.

### **Example: a reading-progress bar with a live percentage**

A single `viewProgress` interaction can drive several effects from the same scroll position. Here the article's scroll fills a progress bar (`keyframeEffect`) and, above it, updates a label to the current percentage (`customEffect`):

```ts
const config = {
  interactions: [
    {
      key: 'article', // SOURCE — the article's scroll position drives everything
      trigger: 'viewProgress',
      effects: [
        {
          key: 'progress-bar', // fills from empty to full
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
          key: 'progress-label', // the text above the bar
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

## **Scroll presets from `@wix/motion-presets`**

`@wix/motion-presets` ships ready-made scroll effects — every preset whose name ends in `Scroll` (`FadeScroll`, `ParallaxScroll`, `RevealScroll`, `GrowScroll`, `SlideScroll`, `BlurScroll`, and more). Use them via `namedEffect`, just like any other preset.

Scroll presets have one required option: **`range`**, which declares how the animation relates to the element's **idle state** — its natural, at-rest layout and styling:

- **`'in'`** — the animation **ends** at the idle state. The element animates *into* its natural look as it enters.  
- **`'out'`** — the animation **starts** from the idle state. The element animates *away* from its natural look as it exits.  
- **`'continuous'`** — the animation **passes through** the idle state, animating from one side, through the natural look, and out the other.

The same preset produces different behavior depending on `range`. Fading in on entry vs. fading out on exit:

```ts
// range: 'in' — fades in as the panel enters, settling at its natural state.
{
  key: 'panel',
  trigger: 'viewProgress',
  effects: [
    {
      key: 'panel',
      namedEffect: { type: 'FadeScroll', range: 'in' },
      rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 0 } },
      rangeEnd: { name: 'entry', offset: { unit: 'percentage', value: 100 } },
      easing: 'linear',
      fill: 'both',
    },
  ],
}
```

(maybe next to it an ‘out’ animation for visual comparison)

> Only use a preset's extra options if you know them. `range` is required for scroll presets; beyond that, rely on each preset's defaults.

## **Scrolly-telling with lists and `position: sticky`**

Scrolly-telling puts the story on the scrollbar. Rather than the page merely revealing content as it moves past, the scroll position itself becomes the timeline of a narrative — copy, imagery, and motion are choreographed to advance exactly as fast as the reader scrolls. Because the reader is in control, the result feels physical and responsive: stop scrolling and the scene holds; scroll back and it plays in reverse. This is where scroll-driven animation is at its most expressive, and it shines brightest when `viewProgress` is paired with two companions — [`position: sticky`](https://developer.mozilla.org/en-US/docs/Web/CSS/position), which pins a scene in place while the surrounding page keeps scrolling, and [lists](http://Configuration/lists-and-sequences/lists), which let a single interaction animate a whole collection of items in sync.

The canonical demonstration is turning vertical scroll into horizontal motion — a **horizontal-scroll gallery**. It combines three ingredients: a **tall wrapper** that provides the scroll distance, a **`position: sticky`** child that pins to the viewport while that wrapper scrolls past, and scroll-driven effects that run during the pinned (`contain`) phase.

The layout works like this:

- **`h-scroll`** — a tall wrapper (e.g. `height: 400vh`). Its height *is* the horizontal scroll distance, and it's the `ViewTimeline` source.  
- **`.sticky-viewport`** — a `position: sticky; top: 0; height: 100vh` child that stays pinned while the wrapper scrolls. It uses **`overflow: clip`** (never `hidden`) to hide the off-screen cards without breaking the timeline.  
- **`.track`** — a horizontal flex row of cards. We translate it along X as the wrapper scrolls.

A single **`viewProgress`** interaction on `h-scroll` drives everything — its scroll timeline scrubs two effects at once:

1. The first effect targets the whole **track** and translates it along X during the pinned `contain` phase — this is the horizontal scroll itself.  
2. The second is a **list effect**: `listContainer: '.track'` applies it to every card and `selector: '.card-media'` narrows it to the media inside each one, giving them a gentle counter-parallax drift as the track pans. Because it animates the cards' inner media — a different target from the track — it never competes with the pan over the same property. See [lists](http://Configuration/lists-and-sequences/lists) for more on `listContainer`.

There are deliberately **no sequences** here: a sequence distributes *time-based* delay offsets across its effects, which has no meaning on a scroll-scrubbed timeline. On a `viewProgress` interaction, coordinate multiple items with `listContainer` and ranges rather than with a sequence.

```ts
const config = {
  interactions: [
    {
      key: 'h-scroll', // tall wrapper — the single ViewTimeline source
      trigger: 'viewProgress',
      effects: [
        // 1. Pan the whole track horizontally as the wrapper scrolls.
        {
          key: 'h-track', // the flex row of cards
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
          key: 'h-track',
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
  effects: {},
};
```

```html
<interact-element data-interact-key="h-scroll">
  <div class="h-scroll">
    <div class="sticky-viewport">
      <interact-element data-interact-key="h-track">
        <ul class="track">
          <li class="card"><div class="card-media"></div><h3 class="card-title">One</h3></li>
          <li class="card"><div class="card-media"></div><h3 class="card-title">Two</h3></li>
          <li class="card"><div class="card-media"></div><h3 class="card-title">Three</h3></li>
          <li class="card"><div class="card-media"></div><h3 class="card-title">Four</h3></li>
          <li class="card"><div class="card-media"></div><h3 class="card-title">Five</h3></li>
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

# 🧑‍💻 pointerMove

## **Owner: [Idan Levi](mailto:idanlev@wix.com) Reviewer: [Ameer Abu-Fraiha](mailto:ameerf@wix.com)**

# PointerMove

`pointerMove` creates continuous effects driven by the pointer’s position. It is useful for card tilts, cursor followers, spotlights, parallax, and other effects that react immediately to movement.

Like [viewProgress](), pointerMove is a continuous trigger: the pointer position directly controls the effect’s progress.

> **Important:** `pointerMove` effects are skipped when reduced-motion mode is enabled.

## **Two-dimensional progress**

Unlike other triggers, pointerMove has two-dimensional progress.  
A namedEffect or customEffect receives both the horizontal and vertical coordinates, while a keyframeEffect uses the axis selected in params.

```ts
{
  x: number; // horizontal progress, clamped to 0–1
  y: number; // vertical progress, clamped to 0–1
  v?: { x: number; y: number }; // velocity
  active?: boolean; // whether the pointer is inside the hit area
}
```

By default, progress is calculated from the hit area: `(0, 0)` is its top-left and `(1, 1)` is its bottom-right.

 `centeredToTarget: true`, to remap progress so the target’s center corresponds to `(0.5, 0.5)`. The values remain clamped to `0–1`. `centeredToTarget` is set on an **effect**, not in the trigger `params`.

## **Parameters**

```ts
params: {
  hitArea?: 'self' | 'root'; // default: 'root'
  axis?: 'x' | 'y';          // default: 'y'
}
```

- `hitArea: 'self'` tracks movement inside the source element. The source must receive pointer events, so do not apply `pointer-events: none` to it.  
- `hitArea: 'root'` tracks movement across the viewport.  
- `axis` maps either the horizontal (`'x'`) or vertical (`'y'`) position to a `keyframeEffect`. It defaults to `'y'`.  
- `axis` is ignored by `namedEffect` and `customEffect`, which receive both axes.

Set `hitArea` explicitly so the intended tracking area is clear.

## **Smoothing pointer movement**

The smoothing is set on the effect, not on the trigger:

```ts
{
  transitionDuration?: number;
  transitionEasing?: 'linear' | 'hardBackOut' | 'easeOut' | 'elastic' | 'bounce';
}
```

`transitionDuration` controls, in milliseconds, how long the effect takes to catch up with the pointer. Without it, the effect responds immediately. Short durations such as `100–300ms` soften the movement, while larger values create more noticeable lag.

`transitionEasing` controls how that transition progresses and defaults to `linear`. 

## **Named effects**

For two-dimensional pointer animations, prefer a registered mouse `namedEffect`. Pointer timelines are not yet supported in CSS, and accurately composing both axes with separate animations is difficult, so mouse named effects update the target’s styles with JavaScript.

## **Example: named effect**

```ts
{
  key: 'card-hit-area',
  trigger: 'pointerMove',
  params: {
    hitArea: 'self',
  },
  effects: [
    {
      key: 'card-visual',
      namedEffect: {
        type: 'Tilt3DMouse',
      },
      centeredToTarget: true,
      transitionDuration: 160,
      transitionEasing: 'easeOut',
    },
  ],
}
```

## **Example: composing two keyframe effects**

A `keyframeEffect` follows one axis. To respond to both axes, create two interactions and combine their transforms with `composite`.

```ts
const config = {
  interactions: [
    {
      key: 'card-hit-area',
      trigger: 'pointerMove',
      params: {
        hitArea: 'self',
        axis: 'x',
      },
      effects: [
        {
          key: 'card-visual',
          effectId: 'tilt-x',
        },
      ],
    },
    {
      key: 'card-hit-area',
      trigger: 'pointerMove',
      params: {
        hitArea: 'self',
        axis: 'y',
      },
      effects: [
        {
          key: 'card-visual',
          effectId: 'tilt-y',
        },
      ],
    },
  ],
  effects: {
    'tilt-x': {
      keyframeEffect: {
        name: 'tilt-x',
        keyframes: [
          { transform: 'rotateY(-12deg)' },
          { transform: 'rotateY(12deg)' },
        ],
      },
      easing: 'linear',
      composite: 'add',
      fill: 'both',
    },
    'tilt-y': {
      keyframeEffect: {
        name: 'tilt-y',
        keyframes: [
          { transform: 'rotateX(12deg)' },
          { transform: 'rotateX(-12deg)' },
        ],
      },
      easing: 'linear',
      composite: 'add',
      fill: 'both',
    },
  },
};
```

## **Example: custom effect**

Use a `customEffect` when the behavior depends on data that keyframes cannot express, such as pointer velocity, or when the intended effect requires JS (such as updating a canvas, SVGs, etc).

```ts
const config = {
  conditions: {
    'can-hover': {
      type: 'media',
      predicate: '(hover: hover)',
    },
  },
  interactions: [
    {
      key: 'spotlight-area',
      trigger: 'pointerMove',
      conditions: ['can-hover'],
      params: {
        hitArea: 'self',
      },
      effects: [
        {
          key: 'spotlight-visual',
          customEffect: (element, progress) => {
            const x = progress.x * 100;
            const y = progress.y * 100;
            const velocity = Math.hypot(
              progress.v?.x ?? 0,
              progress.v?.y ?? 0,
            );
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

Result: the spotlight follows the pointer and grows when the pointer moves faster. The media condition prevents the interaction from registering on touch-only devices.

## **FOUC prevention and avoiding jittering**

A Flash of Unstyled Content (FOUC) can occur when the target first renders in its base style and changes after the pointer interaction starts. Jitter can occur when an effect moves its own hit area, causing the pointer to repeatedly enter and leave it.

- Keep the hit area stationary. If an effect moves or scales content, animate a child or a separate target instead of the source.  
- For `keyframeEffect`, use `fill: 'both'` and define a suitable base style so the target does not jump between states.

# 🧑‍💻 animationEnd

## **Owner: [Idan Levi](mailto:idanlev@wix.com) Reviewer: [Marine Bretonniere](mailto:marinebr@wix.com)**

# 

# AnimationEnd

`animationEnd` starts an effect or sequence after another animation finishes. It is useful for building clear animation chains without calculating delays manually.

The connection between animations is made with an `effectId`.

## **Parameters**

```ts
params: {
  effectId: string;
}
```

`effectId` is required and must match the identifier of the effect being observed.

The interaction’s `key` must identify the element on which the previous effect runs. Effects started by `animationEnd` may target that element or another element.

## **Example: reveal content in two steps**

```ts
const config = {
  interactions: [
    {
      key: 'panel',
      trigger: 'viewEnter',
      effects: [
        {
          key: 'panel',
          effectId: 'panel-enter',
          keyframeEffect: {
            name: 'panel-enter-animation',
            keyframes: [
              { opacity: '0', transform: 'translateY(24px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 400,
          easing: 'ease-out',
          fill: 'both',
          triggerType: 'once',
        },
      ],
    },

    {
      // Observe the element animated by "panel-enter".
      key: 'panel',
      trigger: 'animationEnd',
      params: {
        effectId: 'panel-enter',
      },
      effects: [
        {
          key: 'panel-label',
          effectId: 'label-enter',
          keyframeEffect: {
            name: 'label-enter-animation',
            keyframes: [{ opacity: '0' }, { opacity: '1' }],
          },
          duration: 250,
          fill: 'both',
        },
      ],
    },
  ],
};
```

Result: `panel` enters first. Only after `panel-enter` completes does `panel-label` begin fading in.

## **Chaining more animations**

Give the produced effect its own `effectId`, then add another `animationEnd` interaction that waits for it:

```ts
{
  key: 'panel-label',
  trigger: 'animationEnd',
  params: {
    effectId: 'label-enter',
  },
  effects: [
    // The next timed effect
  ],
}
```

## **Important rules**

- Only time-based effects with an effectId can be observed by animationEnd.  
- The source `key` should match the element where the preceding animation finishes, not necessarily the element that originally triggered it.  
- Unrelated animations finishing on the same element do not activate the chain.  
- A canceled or interrupted animation does not count as completed.  
- Do not wait for an effect produced by the same `animationEnd` interaction; it can never start.  
- Avoid circular chains where effects wait for one another.  
- Use `animationEnd` instead of matching delays manually. The chain remains correct when an earlier animation’s duration changes.

# effects

# 🧑‍🌾 what are effects?

## **Owner: [Hassan Kittany](mailto:hassank@wix.com) Reviewer: [Yehonatan Daniv](mailto:ydaniv@wix.com)**

---

# What Are Effects?

An **Effect** is the visual change an interaction produces, what actually animates, and how. Every interaction connects a trigger to one or more effects; the trigger decides the *when*, the effect decides the *what*.

## **Two ways to classify an effect**

Effects vary along two independent axes. Keep them separate in your head — they answer different questions.

**1\. What drives the effect** (its timing model):

| Kind | Driven by | Used with triggers |
| :---- | :---- | :---- |
| **Time Effect** | a fixed `duration` — it plays from start to finish | `hover`, `click`, `viewEnter`, `animationEnd` |
| **Scrub Effect** | continuous progress, from scroll position or pointer movement | `viewProgress`, `pointerMove` |
| **State Effect** | a CSS state toggle, transitioned over time | `hover`, `click` |

> `hover` and `click` can drive **either** a Time Effect or a State Effect — you choose by which fields you set (see `triggerType` vs `stateAction` below). Scrub effects are the only kind bound to specific triggers.

**2\. How you describe the change** (its *payload*). Every effect carries **exactly one**:

- **`namedEffect`**: a ready-made preset from `@wix/motion-presets` (e.g. `FadeIn`, `Pulse`, `ParallaxScroll`). Tuned and GPU-friendly.  
- **`keyframeEffect`**:  your own WAAPI keyframes (`{ name, keyframes }`).  
- **`customEffect`**:  an imperative callback run every frame; for things CSS can't express (canvas, SVG attributes, text).  
- **`transition` / `transitionProperties`**: CSS style toggles; these *are* what makes an effect a State Effect.

Time and Scrub effects animate using `@wix/motion` under the hood and can pull in presets from `@wix/motion-presets`. State effects use plain CSS transitions.

---

## **Common fields**

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

`composite` and `fill` apply to **animation** effects (Time/Scrub), not to State effects.

### **`fill` guidance**

- **`'Both'`**:  for scroll-driven (`viewProgress`), pointer-driven (`pointerMove`), and any toggling effect (`triggerType` of `alternate`, `repeat`, or `state`). Keeps the effect applied while finished and prevents it from being garbage-collected.  
- **`'backwards'`**: for one-shot entrances (`triggerType: 'once'`) when the element's own resting CSS already matches the final keyframe.

### **`composite` (how this effect combines with others on the same property)**

- **`'replace'`** (default) — overrides prior values.  
- **`'add'`** — appends transform/filter functions after existing ones.  
- **`'accumulate'`** — sums arguments of matching functions (`translateX(10px)` \+ `translateX(20px)` → `translateX(30px)`).

---

## **Time Effects**

Play over a fixed duration. Used with `hover`, `click`, `viewEnter`, and `animationEnd`.

```ts
{
  duration: number;     // REQUIRED, ms
  easing?: string;      // CSS easing or a named easing from @wix/motion
  delay?: number;       // ms
  iterations?: number;  // >= 1, or Infinity for a perpetual loop
  alternate?: boolean;  // reverse direction every other iteration (within one playback)
  reversed?: boolean;   // start in the finished state
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
  triggerType?: 'once' | 'repeat' | 'alternate' | 'state';
  // + exactly one payload (namedEffect | keyframeEffect | customEffect)
}
```

### **`triggerType` — playback behavior**

| `triggerType` | hover | click | viewEnter |
| :---- | :---- | :---- | :---- |
| `'alternate'` | play in on enter, reverse on leave | toggle play/reverse per click | play in on enter, reverse on leave |
| `'repeat'` | restart on each enter | restart per click | restart on each entry |
| `'once'` | play once, first enter only | play once, first click only | play once, first entry only |
| `'state'` | play on enter, pause on leave | toggle play/pause per click | play on enter, pause on leave |

> 

> **Important:** For `viewEnter`, `repeat`/`alternate`/`state` require **separate** source and target elements. Animating the observed element itself can make it leave/re-enter the viewport and re-trigger. Same source-and-target is safe only with `once`.

## **Scrub Effects**

Driven continuously by progress rather than time. Used with `viewProgress` (scroll) and `pointerMove`.

```ts
{
  rangeStart?: RangeOffset; // REQUIRED for viewProgress
  rangeEnd?: RangeOffset;   // REQUIRED for viewProgress
  easing?: string;          // usually 'linear' for scroll
  fill?: 'none' | 'forwards' | 'backwards' | 'both'; // usually 'both'
  centeredToTarget?: boolean;     // pointerMove: 0.5 progress = target center
  transitionDuration?: number;    // ms, smoothing on progress jumps (pointerMove inertia)
  transitionEasing?: 'linear' | 'hardBackOut' | 'easeOut' | 'elastic' | 'bounce';
  // + exactly one payload
}
```

`RangeOffset` works like CSS:

```css
 animation-range: { name: 'entry' | 'exit' | 'contain' | 'cover' | …, offset: { value, unit: 'percentage' | 'px' | … } }.
```

**Scroll example**:

```ts
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

> **Pitfall:** `overflow: hidden` on any ancestor between the source and the scroll container breaks `viewProgress`. Use `overflow: clip` instead.

---

## **State Effects**

Toggle CSS styles via transitions instead of running keyframes. Used with `hover`/`click`.

Use `transition` when all properties share timing; use `transitionProperties` when each property needs its own `duration`/`delay`/`easing`. Control behavior with **`stateAction`**.

```ts
{
  key?: string;
  stateAction?: 'toggle' | 'add' | 'remove' | 'clear'; // default 'toggle'
  transition?: {
    duration?: number; delay?: number; easing?: string;
    styleProperties: { name: string; value: string }[];
  };
  // OR
  transitionProperties?: { name: string; value: string; duration?: number; delay?: number; easing?: string }[];
}
```

| `stateAction` | hover | click |
| :---- | :---- | :---- |
| `'toggle'` (default) | add state on enter, remove on leave | toggle per click |
| `'add'` | add on enter; leave does not remove | add on click |
| `'remove'` | remove on enter | remove on click |
| `'clear'` | reset all states on enter | reset all states |

CSS property names use **camelCase** (`backgroundColor`, `borderRadius`).

```ts
{
  key: 'menu-button',
  trigger: 'click',
  effects: [
    {
      transition: {
        duration: 200,
        easing: 'ease-out',
        styleProperties: [
          { name: 'backgroundColor', value: '#2563eb' },
          { name: 'color', value: '#ffffff' },
        ],
      },
    },
  ],
}
```

---

## **Targeting**

By default an effect animates its interaction's **source** element. Override the target with `key` (another keyed element) or narrow it with `selector` (a child).

**Same element (most common)** — omit `key`:

```ts
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
{
  key: 'menu-trigger',
  trigger: 'click',
  effects: [
    {
      key: 'mobile-menu',
      namedEffect: { type: 'SlideIn', direction: 'bottom' }, // top | right | bottom | left
      triggerType: 'alternate',
      fill: 'both',
      duration: 300,
    },
  ],
}
```

## **Combining multiple effects**

A single interaction's `effects` array can hold several effects on different targets. They share the trigger and fire together:

```ts
{
  key: 'card',
  trigger: 'hover',
  effects: [
    {
      // the card lifts (animate a child so the hovered card's hit-area doesn't shift)
      selector: '.card-body',
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
      key: 'card-title',
      keyframeEffect: { name: 'title-color', keyframes: [{ color: '#374151' }, { color: '#2563eb' }] },
      triggerType: 'alternate',
      fill: 'both',
      duration: 150,
    },
  ],
}
```

> Hover/click effects that change an element's **size or position** should target a **child** (`selector`) rather than the hovered element itself — otherwise the hit-area shifts and the pointer rapidly re-enters/leaves, causing jitter.

---

## **Inline vs. the effects registry**

Write an effect inline, or define it once in the top-level `effects` map and reference it by `effectId` (an `EffectRef`). A reference can override any field from the registry entry (target `key`, `duration`, etc.).

```ts
{
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
}
```

---

## **Chaining with `animationEnd`**

Start one effect when another finishes. Give the first effect an `effectId`, then reference it from an `animationEnd` trigger.

```ts
{
  interactions: [
    {
      key: 'logo',
      trigger: 'viewEnter',
      effects: [
        {
          keyframeEffect: {
            name: 'logo-in',
            keyframes: [{ opacity: 0, transform: 'scale(0.8)' }, { opacity: 1, transform: 'scale(1)' }],
          },
          duration: 600,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          fill: 'backwards',
          effectId: 'logo-entrance',
        },
      ],
    },
    {
      key: 'logo',
      trigger: 'animationEnd',
      params: { effectId: 'logo-entrance' }, // wait for the effect above
      effects: [
        {
          key: 'tagline',
          namedEffect: { type: 'SlideIn', direction: 'top' },
          duration: 400,
          fill: 'backwards',
        },
      ],
    },
  ],
}
```

## **`customEffect` for non-CSS animation**

Use a `customEffect` callback when CSS can't express the change. It receives the target and a `progress` value (0–1 for time/scroll triggers; a `{ x, y, … }` object for `pointerMove`).

```ts
{
  key: 'stats',
  trigger: 'viewEnter',
  params: { threshold: 0.5 }, // playback type goes on the effect, not here
  effects: [
    {
      key: 'counter',
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

---

## **Performance**

Animate properties the browser can composite cheaply:

- ✅ `transform` (translate, scale, rotate), `opacity`, `filter`  
- ⚠️ Avoid layout/paint-triggering properties: `width`, `height`, `margin`, `padding`, `top`, `left` — they force reflow.

Prefer `namedEffect` presets over hand-written keyframes where one fits — they're tuned by `@wix/motion`:

```ts
{ namedEffect: { type: 'FadeIn' }, duration: 300 }              // preferred
{ keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] }, duration: 300 } // when you need custom motion
```

> **Don't guess preset options.** If you're unsure of a preset's option names or accepted values, omit them and rely on defaults rather than inventing keys.

---

## **Reduced motion**

Provide a gentler alternative for users who prefer reduced motion: gate the full animation behind `(prefers-reduced-motion: no-preference)` and offer a calmer fallback for `reduce`. Conditions on an effect skip just that effect when they don't pass.

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
}
```

You can also force this globally: `Interact.forceReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches`.

---

## 

## **Timing & easing reference**

Rough starting points (tune to taste):

| Use | Duration |
| :---- | :---- |
| Micro-interactions (hover, click) | 100–300 ms |
| Page transitions | 300–500 ms |
| Entrance animations | 500–800 ms |
| Complex sequences | 800–1200 ms |

| Use | Easing |
| :---- | :---- |
| Entrances | `ease-out`, `cubic-bezier(0.16, 1, 0.3, 1)` |
| Exits | `ease-in`, `cubic-bezier(0.4, 0, 1, 1)` |
| Interactions | `ease-in-out` |
| Elastic / overshoot | `cubic-bezier(0.34, 1.56, 0.64, 1)`, or a named easing like `backOut` |

# 🧑‍🌾 Named Effects

## **Owner: [Hassan Kittany](mailto:hassank@wix.com) Reviewer: [Bar Goldenberg](mailto:bargol@wix.com)**

---

# Named Effects

Named effects are pre-built animations from the `@wix/motion-presets` package. They let you add polished motion to an Interaction by name (`FadeIn`, `Pulse`, `ParallaxScroll`...) without writing keyframes. Under the hood they run on `@wix/motion`, so they're GPU-friendly and consistent across browsers.

You use one by giving an effect a `namedEffect` payload instead of a `keyframeEffect` or `customEffect`:

```ts
{ namedEffect: { type: 'FadeIn' }, duration: 800 }
```

## **Categories**

Presets come in four categories, each built for a particular kind of motion (and therefore a particular trigger):

| Category | Built for | Typical trigger | Count |
| :---- | :---- | :---- | :---- |
| **Entrance** | An element appearing | `viewEnter` (also `hover`, `click`, `animationEnd`) | 19 |
| **Scroll** | Motion tied to scroll position | `viewProgress` | 19 |
| **Ongoing** | A continuous, looping animation | any trigger, with `iterations: Infinity` | 13 |
| **Mouse** | Real-time response to the pointer | `pointerMove` | 11 |

### **All available named effects**

**Entrance (19):** `ArcIn`, `BlurIn`, `BounceIn`, `CurveIn`, `DropIn`, `ExpandIn`, `FadeIn`, `FlipIn`, `FloatIn`, `FoldIn`, `GlideIn`, `RevealIn`, `ShapeIn`, `ShuttersIn`, `SlideIn`, `SpinIn`, `TiltIn`, `TurnIn`, `WinkIn`

**Scroll (19):** `ArcScroll`, `BlurScroll`, `FadeScroll`, `FlipScroll`, `GrowScroll`, `MoveScroll`, `PanScroll`, `ParallaxScroll`, `RevealScroll`, `ShapeScroll`, `ShrinkScroll`, `ShuttersScroll`, `SkewPanScroll`, `SlideScroll`, `Spin3dScroll`, `SpinScroll`, `StretchScroll`, `TiltScroll`, `TurnScroll`

**Ongoing (13):** `Bounce`, `Breathe`, `Cross`, `Flash`, `Flip`, `Fold`, `Jello`, `Poke`, `Pulse`, `Rubber`, `Spin`, `Swing`, `Wiggle`

**Mouse (11):** `AiryMouse`, `BlobMouse`, `BlurMouse`, `BounceMouse`, `ScaleMouse`, `SkewMouse`, `SpinMouse`, `SwivelMouse`, `Tilt3DMouse`, `Track3DMouse`, `TrackMouse`

For each preset's specific options (`direction`, `distance`, `range`, etc.), see its entry in the `@wix/motion-presets` reference.

---

## **Setup**

### **1\. Install the package**

```shell
npm install @wix/motion-presets
```

### **2\. Register the presets you use**

Registering tells Interact which presets exist. Import selectively (smaller bundles) or register everything:

```ts
// Selective — recommended
import { FadeIn, BounceIn } from '@wix/motion-presets';
Interact.registerEffects({ FadeIn, BounceIn });
```

```ts
// Everything
import * as presets from '@wix/motion-presets';
Interact.registerEffects(presets);
```

### **\`registerEffects()\` MUST be called \*\*before\*\* \`Interact.create()\`. A \`namedEffect\` whose \`type\` wasn't registered won't animate. 3\. Reference the preset by name**

Set `type` inside the `namedEffect` object to the preset's name:

```
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

---

## **Configuring a named effect**

There are **two distinct groups of options**, and mixing them up is the most common mistake:

**Animation options** live on the **effect**, next to `namedEffect` — they control timing and playback, and apply to any effect type:

```ts
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

**Preset options** live **inside** the `namedEffect` object alongside `type` — they're specific to that preset (a direction, a distance, a scroll `range`, etc.):

```ts
{
  namedEffect: { type: 'SlideIn', direction: 'bottom' }, // direction is a preset option
  duration: 600,
  fill: 'backwards',
}
```

\*\*Don't guess preset options.\*\* Option names and accepted values differ per preset. If you're unsure, omit them and rely on the preset's defaults. See the API Reference for each preset's options. A couple of cross-preset conventions worth knowing:

- **`direction` is overloaded** — it means different things per preset. `SlideIn`/`FloatIn` take cardinal values (`top | right | bottom | left`), `WinkIn` takes an axis (`horizontal | vertical`), `GlideIn` takes an angle (`0–360`), `SpinIn` takes `clockwise | counter-clockwise`, etc. Check the preset's reference.  
- **Distances use object notation** — `distance: { value: 120, unit: 'px' }` (units: `px`, `em`, `rem`, `vh`, `vw`, `vmin`, `vmax`, `percentage`). A flat string (`'120px'`) also works; pick one style and stay consistent.

---

## **By category**

### **Entrance — `viewEnter`**

Play once as the element scrolls into view. `triggerType` defaults to `once`.

```ts
{
  key: 'card',
  trigger: 'viewEnter',
  params: { threshold: 0.3 },
  effects: [{ namedEffect: { type: 'FloatIn', direction: 'bottom' }, duration: 700, easing: 'ease-out', fill: 'backwards' }],
}
```

### **Entrance presets start the element in a hidden state (e.g. \`opacity: 0\`). To avoid a flash before the animation initializes, pre-render the CSS with \`generate(config)\` and mark the element with \`data-interact-initial="true"\`. See \*\*FOUC prevention\*\*. Scroll — `viewProgress`**

Progress is driven by scroll position, not time (no `duration`). Use `rangeStart`/`rangeEnd` on the effect to control the active scroll window.

```ts
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

### **\*\*CRITICAL:\*\* Every scroll preset (\`\*Scroll\`) MUST include a \`range\` option — \`'in'\` (ends at the idle state), \`'out'\` (starts from idle), or \`'continuous'\` (passes through idle). Also: \`overflow: hidden\` on any ancestor between the source and the scroll container breaks \`viewProgress\` — use \`overflow: clip\`. Ongoing — continuous loop**

Ongoing presets loop indefinitely. Start one with any trigger and set `iterations: Infinity`. The ongoing-only preset option `iterationDelay` (ms) inserts a pause between repetitions.

```ts
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

### **Mouse — `pointerMove`**

Transform values are driven by the cursor in real time. Mouse presets handle 2D internally — prefer them over `keyframeEffect` for pointer effects.

```ts
{
  key: 'feature-card',
  trigger: 'pointerMove',
  params: { hitArea: 'self' },
  effects: [{ namedEffect: { type: 'Tilt3DMouse' }, fill: 'both', transitionDuration: 400 }],
}
```

Mouse presets only make sense on hover-capable devices and may behave differently on touch. Gate them with a \`(hover: hover)\` media condition and consider a \`viewEnter\`/\`viewProgress\` fallback for touch. 

---

## **Accessibility**

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

# 🧑‍💻 keyframe Effects

## **Owner: [Zion Ben Yacov](mailto:zionbe@wix.com) Reviewer: [Monty Alon](mailto:montya@wix.com)**

---

## **title: "Time effects" description: "Create time-based animations"**

## **Time effects**

Time effects are traditional time-based animations perfect for entrance effects, hover interactions, and click responses.

Named effects are pre-built animations from \`@wix/motion-presets\` or effects registered via \`Interact.registerEffects()\`: 

````
```typescript
{
    key: 'my-element',
    namedEffect: { type: 'FadeIn' },     // Predefined animation
    duration: 800,             // Animation duration in ms
    easing: 'ease-out',        // Animation timing curve
    delay: 200,                // Delay before starting
    iterations: 1,             // How many times to repeat
    fill: 'forwards'           // Animation fill mode
}
```
````

Use keyframeEffect when you need a custom animation that isn’t covered by a named effect. The keyframeEffect payload takes a \`name\` (used to generate the underlying CSS keyframes rule) and a \`keyframes\` array of WAAPI-style keyframe objects. Give every keyframeEffect a unique name within the config so its generated keyframes rule doesn’t collide with another effect.

For custom animations, use keyframe effects: 

````
```typescript
{
    key: 'custom-animation',
    keyframeEffect: {
        name: 'custom-animation',
        keyframes: [
            { transform: 'scale(1) rotate(0deg)', opacity: '1', backgroundColor: '#ff0000' },
            { transform: 'scale(1.2) rotate(180deg)', opacity: '0.8', backgroundColor: '#0000ff' }
        ]
    },
    duration: 600,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
}
```
````

### **Real-world example: card entrance**

This combines a viewEnter trigger with a custom keyframeEffect: the card fades and scales in the first time it enters the viewport, using a custom easing curve instead of a named effect.

```ts
{
    key: 'product-card',
    trigger: 'viewEnter',
    params: { threshold: 0.3 }
,
    effects: [
        {
            keyframeEffect: {
                name: 'card-entrance',
                keyframes: [
                    { opacity: '0', transform: 'translateY(60px) scale(0.9)' },
                    { opacity: '1', transform: 'translateY(0) scale(1)' }
                ]
            },
            duration: 800,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',  // Custom easing
            fill: 'forwards'
        }
    ]
}
```

---

Accessibility: wrap keyframeEffect-driven entrance animations in a condition that checks prefers-reduced-motion, the same technique used for named effects. Define two conditions – one matching users who are fine with motion and one matching prefers-reduced-motion – and register a reduced or instant version of the effect (for example, a plain opacity fade or immediate fill: ‘forwards’ state) for the reduced-motion condition instead of the transform-heavy keyframes.

## **title: "Scrub effects" description: "Create scrub animations"**

## **Scrub effects**

Scrub effects are progress-based animations that respond to scroll position or pointer position.

### **Basic scrub effect**

```ts
{
    key: 'parallax-bg',
    keyframeEffect: {
        name: 'parallax',
        keyframes: [
            { transform: 'translateY(0)' },
            { transform: 'translateY(-200px)' }
        ]
    },
    // No duration - controlled by scroll/pointer progress
    easing: 'linear',
    rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
    rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } }
}
```

### **Range configuration**

Control when the animation starts and stops:

Both rangeStart and rangeEnd take a { name, offset } shape. name selects which part of the scroll range to anchor to: cover (from first to last visible), contain (fully inside to fully outside), entry (entering the view), exit (leaving the view), entry-crossing, and exit-crossing. offset is { unit: ‘percentage’ | ‘px’, value } and shifts the anchor point within that named range; percentage values map to the CSS animation-range syntax. The default fill is ‘none’, so add fill: ‘both’ to hold the effect’s end state once rangeEnd is reached instead of snapping back.

```ts
{
    key: 'fade-element',
    keyframeEffect: {
        name: 'fade',
        keyframes: [
            { opacity: '1' },
            { opacity: '0' }
        ]
    },
    rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 30 } },  // Start at 30% scroll
    rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 80 } }     // End at 80% scroll
}
```

### **Advanced pointer properties**

Pointer-driven scrub effects accept params: { hitArea?: ‘self’ | ‘root’; axis?: ‘x’ | ‘y’ }. hitArea chooses which element’s pointer events drive the effect (‘self’ the target element itself, ‘root’ its nearest positioned ancestor); axis restricts a keyframeEffect to tracking horizontal or vertical pointer movement only.

Important rules: pointer effects ignore duration, delay, triggerType, rangeStart, and rangeEnd – use transitionDuration and transitionEasing instead to smooth movement. A keyframeEffect only follows the single axis you choose, so use a namedEffect or customEffect if you need two-dimensional tracking. If hitArea is ‘self’, the target element must be able to receive pointer events. Avoid animating the hit-area element itself. Prefer fill: ‘both’ so the effect holds its position between updates. The library skips pointer-driven effects entirely when reduced motion is preferred.

### **Real-world example: parallax hero**

A single viewProgress trigger drives two keyframeEffects at different rangeStart/rangeEnd offsets, so the background scrolls at a slower rate than the foreground text for a parallax feel.

```ts
{
    key: 'hero-section',
    trigger: 'viewProgress',
    effects: [
        // Background image moves slower
        {
            key: 'hero-bg',
            keyframeEffect: {
                name: 'image-parallax',
                keyframes: [
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-150px)' }
                ]
            },
            rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
            rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } }
        },
        // Text fades out faster
        {
            key: 'hero-text',
            keyframeEffect: {
                name: 'text-fade',
                keyframes: [
                    { opacity: '1', transform: 'translateY(0)' },
                    { opacity: '0', transform: 'translateY(-50px)' }
                ]
            },
            rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 20 } },
            rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 60 } }
        }
    ]
}
```

# 🧑‍💻 transition Effects

## **Owner: [Zion Ben Yacov](mailto:zionbe@wix.com) Reviewer: [Ameer Abu-Fraiha](mailto:ameerf@wix.com)**

---

## 

## **Transition effects**

Transition effects create smooth CSS property changes with automatic transitions.

### **How it works: state, not a timeline**

A transition effect is Interact’s state effect: instead of playing a keyframe timeline from start to finish, it flips the target between its normal CSS look and a declared alternate look, and lets the browser’s native CSS transition animate the change. When the trigger fires, Interact toggles a state on the target and applies your styleProperties (or transitionProperties) values while that state is active; the transition itself lives on the target, so both directions \- turning the state on and turning it off \- animate using the same duration, delay, and easing. There is no separate “reverse” to define and no timeline to restart: firing the trigger again mid-transition just reverses smoothly from wherever the value currently is.

Because the effect describes a state rather than a run, that state persists until something removes it. stateAction controls how the trigger changes the state: toggle (the default) flips it on and off with each click, or turns it on while hovered and off on leave; add only ever turns it on; remove only ever turns it off; and clear removes every active state on the target at once. Add and remove are useful when two different elements should independently open and close the same target \- give both effects the same effectId, declared once in the top-level effects map, so they drive the same shared state.

### **Which triggers support transition effects**

Transition effects are only used with the hover and click triggers (and their accessibility-upgraded equivalents, interest and activate). The other triggers \- viewEnter, viewProgress, pointerMove, and animationEnd \- drive keyframe, named, and custom effects instead, because those describe motion across a run rather than an on/off look.

### **Basic transition effect**

```ts
{
    key: 'theme-button',
    transition: {
        duration: 300,
        delay: 0,
        easing: 'ease-in-out',
        styleProperties: [
            { name: 'backgroundColor', value: '#2563eb' },
            { name: 'color', value: '#ffffff' },
            { name: 'borderRadius', value: '12px' }
        ]
    }
}
```

### **Individual property transitions**

For different timing per property: 

The example above used a single transition block because every property (backgroundColor, color, and borderRadius) shares identical timing. Use transition whenever that is true. Reach for transitionProperties instead as soon as different properties need independent timing \- for example, a background fade that should be slower than an accompanying scale bounce. transitionProperties is an array where each entry names its own target property and value, and can override duration, delay, and easing individually, instead of inheriting one shared set of timing values.

```ts
{
    key: 'complex-transition',
    transitionProperties: [
        {
            name: 'backgroundColor',
            value: '#ef4444',
            duration: 200,
            delay: 0,
            easing: 'ease-out'
        },
        {
            name: 'transform',
            value: 'scale(1.05)',
            duration: 300,
            delay: 100,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }
    ]
}
```

### **Real-world example: theme switcher**

```ts
{
  key: 'theme-toggle',
  trigger: 'click',
  effects: [
    {
      key: 'page-body',
      stateAction: 'toggle',
      transition: {
        duration: 400,
        easing: 'ease-in-out',
        styleProperties: [
          { name: '--bg-color', value: '#1a1a1a' },
          { name: '--text-color', value: '#ffffff' },
          { name: '--accent-color', value: '#3b82f6' }
        ]
      },
      effectId: 'theme-switch'
    }
  ]
}
```

### **CSS custom properties as transition targets**

The theme switcher above sets CSS custom properties (--bg-color, \--text-color, \--accent-color) as its transition values rather than concrete style properties. That works because the rest of the stylesheet reads those custom properties, for example background-color: var(--bg-color), so changing the custom property cascades into every rule that references it \- one transition effect can drive many computed styles at once.

One caveat: browsers do not interpolate custom properties smoothly by default \- the value jumps instead of transitioning \- unless you register the property's type with CSS @property, for example @property \--accent-color { syntax: '\<color\>'; inherits: true; initial-value: \#3b82f6; }. Register any custom property you want to transition smoothly this way.

### **Accessibility and other pitfalls**

fill and composite are animation-only options and do not apply to transition effects. Interact only handles the visual toggle \- keeping semantic state such as aria-expanded in sync with the target, and respecting prefers-reduced-motion, is still your application's responsibility. And remove only has something stable to remove when it targets a shared effectId; relying on it against a purely inline, auto-generated effect identity can be unreliable across separately built client bundles.

# 🧑‍💻 custom Effects

## **Owner: [Marine Bretonniere](mailto:marinebr@wix.com) Reviewer: [Ameer Abu-Fraiha](mailto:ameerf@wix.com)**

---

## **title: "Custom effects" description: "Create custom effects with JavaScript functions"**

## **Custom effects**

Imperative effect callback for cases that are not well served by `namedEffect`, `keyframeEffect`, or CSS transitions.

## **When to use `customEffect`**

Prefer the declarative options first:

* Use `namedEffect` for registered reusable presets.  
* Use `keyframeEffect` for standard WAAPI/CSS-keyframe animation.  
* Use `transition` or `transitionProperties` for stateful CSS changes.

Use `customEffect` when you need JavaScript on every update in cases such as:

* Animating SVG attributes such as `stroke-dashoffset`  
* Updating counters or text content  
* Driving canvas, WebGL, or third-party renderers  
* Writing progress into CSS custom properties for more advanced styling

## **Basic shape**

`customEffect` is mutually exclusive with `namedEffect` and `keyframeEffect`.

```javascript
{
  customEffect: (element, progress) => {
  if (progress === null) {
// Handle cleanup when the effect is cancelled.
    return;
  }
    element.style.opacity = String(progress);
  },
}
```

You can still use normal effect options around it, including `key`, `selector`, `conditions`, `effectId`, `duration`, `delay`, `easing`, `fill`, `triggerType`, `rangeStart`, and `rangeEnd`.

## **Callback behavior**

The first argument is the resolved target element. The second argument depends on the trigger type.

### **Time-based triggers**

For `viewEnter`, `pageVisible`, `hover`, `click`, `activate`, `interest`, and `animationEnd`, `progress` is a `number | null`.

* `0` means the effect is at the beginning  
* `1` means the effect is complete  
* `null` is a one-time signal that the effect has stopped being active

```javascript
{
  key: 'stat',
  trigger: 'viewEnter',
  effects: [
    {
      duration: 1200,
      customEffect: (element, progress) => {
        element.textContent = progress === null ? '0' : String(Math.round(2500 * progress));
      },
    },
  ],
}
```

### **`viewProgress`**

For `viewProgress`, `progress` is also `number | null`, but it is driven by scroll position instead of time.

* Use `rangeStart` and `rangeEnd` to control when progress maps from `0` to `1.` See [`viewprogress` chapter]()

```javascript
{
  key: 'chart-line',
  trigger: 'viewProgress',
  effects: [
    {
      rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 10 } },
      rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 90 } },
      customEffect: (element, progress) => {
        element.style.strokeDashoffset = String(100 * (1 - progress));
      },
    },
  ],
}
```

### **`pointerMove`**

For `pointerMove`, the callback receives a normalized 2D progress object instead of a scalar number.

```javascript
type PointerProgress = {
  x: number;
  y: number;
  v?: { x: number; y: number };
  active?: boolean;
};
```

* `x` and `y` are normalized pointer progress values, usually based on the hit area, and remapped when `centeredToTarget` is enabled (see more in pointerMove)  
* `v` is the optional velocity vector  
* `active` indicates whether the pointer is currently active

```javascript
{
  key: 'card',
  trigger: 'pointerMove',
  effects: [
    {
      customEffect: (element, progress) => {
        const ctx = element.getContext('2d');
        if (!ctx) return;

        const x = element.width * progress.x;
        const y = element.height * progress.y;

        ctx.clearRect(0, 0, element.width, element.height);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 120);
        gradient.addColorStop(0, 'rgba(255,255,255,0.35)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, element.width, element.height);
      },
    },
  ],
}
```

## **Cancellation and reset**

When a custom animation is cancelled, the runtime calls the callback with `progress === null`. Treat that as your reset hook.

Use it to:

* Clear inline styles  
* Restore text content  
* Reset CSS variables  
* Return the element to a neutral visual state  
* 

```javascript
customEffect: (element, progress) => {
const ctx = (element as HTMLCanvasElement).getContext('2d');
if (!ctx) return;
if (progress === null) {
   	ctx.clearRect(0, 0, element.width, element.height);
   	return;
  }
  ctx.clearRect(0, 0, element.width, element.height);
  ctx.fillRect(0, 0, element.width * progress, 8);

}
```

# interactions

# 🧑‍🌾 what is an interaction?

## **Owner: [Adi Huri](mailto:adih@wix.com) Reviewer: [Marine Bretonniere](mailto:marinebr@wix.com)**

\[Explain that interaction is the connection between a trigger and effects.\]

# **What is an Interaction?**

*\[Visual example: A scroll-based interaction. As the user enters the section, the headline appears, cards reveal one by one, and background elements animate into place.\]*

The example above is powered by an Interaction.

An **Interaction** connects a **trigger** with one or more **effects** or **sequences**. It defines how your interface should respond when a trigger occurs.

**Trigger → Effects / Sequences**

In this example:

**Trigger**

`viewEnter`

The section enters the viewport.

**Effects**

* Reveal the headline  
* Stagger the cards  
* Animate the background elements

When the trigger occurs, Interact runs the connected effects and sequences to create the complete experience.

## **One trigger. Multiple effects.**

A single trigger can coordinate multiple effects across multiple elements.

Instead of treating each animation as a separate piece of logic, Interact groups them into a single Interaction that describes the behavior you want.

```
Trigger:
User enters a section

↓

Reveal the headline
Animate the image
Stagger the cards
Transition the background
```

One trigger.

One Interaction.

Multiple effects.

# 🧑‍💻 source and target resolving

## **Owner: [Ameer Abu-Fraiha](mailto:ameerf@wix.com) Reviewer: [Yehonatan Daniv](mailto:ydaniv@wix.com)**

---

# Source and Target Resolving

Every interaction in Interact binds a **trigger** to one or more **effects**. That binding is the key to a lot of the library's flexibility: because the trigger and the effect are described separately, the element that *listens* for the interaction (the **source**) does not have to be the element that gets *animated* (the **target**).

- The **source** is where the trigger attaches — the element that is hovered, clicked, scrolled into view, or moved over.  
- The **target** is where the effect runs — the element that fades, moves, scales, or changes color.

For the majority of interactions the source and the target are the same element, and you never have to think about the distinction. But when they differ, this chapter explains exactly how each element is located.

## **Source and target can be different elements**

Because the trigger lives on the interaction and the animation lives on the effect, one element can trigger/drive an animation on a completely different element. A classic example is a menu button that opens a sidebar:

```ts
const config = {
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

The same interaction can also fan out to several targets at once — a single trigger with multiple effects, each pointing at a different element — but the underlying idea is always the same: source and target are resolved independently. For more information about multiple effects on the same interaction see [Lists and Sequences](http://Configuration/interactions/effects-array)

## **The `ElementIdentifier`**

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

### **`key` — the main identifier**

`key` is the primary identifier and the only required field. It matches the value you assign when binding an element:

| Integration | How the key is assigned |
| :---- | :---- |
| Web | `data-interact-key="hero"` on `<interact-element>` |
| React | `interactKey="hero"` on `<Interaction>` |
| Vanilla JS | `add(element, 'hero')` (or a `data-interact-key` attribute) |

On the interaction, `key` is mandatory — the trigger has to attach *somewhere*. On the effect, `key` is **optional**: when you omit it, the effect inherits the interaction's `key`, so the effect targets the same root as the source. This is what makes self-targeting effects so concise:

```ts
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

### **The other selectors — granular selection**

`selector`, `listContainer`, and `listItemSelector` narrow the identifier down from the root `key` to a more specific element (or set of elements). They are covered in detail in the [FOUC and refined targets](#when-source-and-target-differ-fouc-and-refined-targets) and [Lists](#lists-listcontainer-and-listitemselector) sections below.

### **Identical identifiers mean the same element**

Interact compares the **whole** `ElementIdentifier` — all four fields, not just `key` — to decide whether two references point at the same element. Two identifiers with the same `key`, `selector`, `listContainer`, and `listItemSelector` are treated as identifying the exact same element(s); if any field differs, they are treated as different elements.

## **When source and target differ: FOUC and refined targets**

Entrance animations are a good illustration of why you sometimes *want* the source and target to differ. An element with an entrance effect (say `viewEnter` \+ `FadeIn`) is styled in its final, visible state. Before the runtime applies the animation's starting keyframe (e.g. `opacity: 0`), the element flashes at full opacity — a **Flash Of Un-styled Content (FOUC)**.

To prevent this, `generate()` emits the applied animation effect, plus initial-state CSS that may be required for first paint in special cases. The moment the identifiers diverge, Interact considers them separate elements and does not auto-generate that special initial state.

In some cases it is required to separate source and target elements. Animating the very element you observe or hover can be counter-productive:

- A `viewEnter` effect that moves or resizes the observed element can push it back out of (or into) the viewport, causing it to re-trigger.  
- A `hover` or `pointerMove` effect that scales or translates the hovered element shifts its own hit-area, producing jittery enter/leave cycles.

The fix is to keep the trigger on a stable outer element and refine the **target** down to an inner child with `selector`:

```ts
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

**Result:** The section as a whole is observed for viewport entry, while only `.hero-content` fades in. Because the effect's identifier (`key: 'hero'` \+ `selector: '.hero-content'`) is no longer identical to the interaction's identifier (`key: 'hero'`), Interact treats them as different elements — so the automatic FOUC initial special state does not cover this split target, and you should apply the starting keyframe to it yourself (for example, an initial `opacity: 0` in the effect, together with `fill: 'both'`).

### **These fields refine source and target independently**

This is the most important rule to internalize: `selector`, `listContainer`, and `listItemSelector` **behave differently depending on where they appear**.

- On the **interaction**, they refine the **source** — which element the trigger attaches to.  
- On the **effect**, they refine the **target** — which element the animation runs on.

And unlike `key`, they are **not inherited** from the interaction to the effect. Omitting `key` on an effect makes it fall back to the interaction's key; omitting `selector` on an effect does **not** make it fall back to the interaction's `selector`.

```ts
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

**Rule of thumb:** if you need `selector` / `listContainer` / `listItemSelector` on both the source and the target, specify them explicitly in both places.

## **Lists: `listContainer` and `listItemSelector`**

When you have a repeating structure — a grid of cards, a list of items — you rarely want to declare an interaction per item. `listContainer` tells Interact to treat the children of a container as a set, binding the same interaction (as source) or effect (as target) to each of them.

```ts
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

Lists are also the foundation for staggered, coordinated animations. For the full picture — mutation tracking, staggered entrances, and using `listContainer` inside sequences — see [Lists and Sequences](http://Configuration/lists-and-sequences).

## **Recap: how an `ElementIdentifier` resolves to an element**

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

# 🧑‍💻 effects array & cascading logic

## **Owner: [Ameer Abu-Fraiha](mailto:ameerf@wix.com) Reviewer: [Yehonatan Daniv](mailto:ydaniv@wix.com)**

# Effects Array & Cascading Logic

Because a trigger and its effects are described separately, a single trigger doesn't have to drive a single animation. An interaction holds an **array** of effects, and every effect in that array fires from the same trigger event. Since each effect resolves its own **separate target**, one trigger can orchestrate a whole set of animations across many different elements at once.

## **One trigger, many targets**

The `effects` array is how you compose a scene. Each entry is an independent effect with its own target and its own animation payload; they all fire together when the trigger activates.

Here's a hero section that comes to life as a single unit when it scrolls into view — the background fades, the heading glides in, the subtitle follows, and the call-to-action pops — all from one `viewEnter` interaction:

```ts
const config = {
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

## **Multiple effects on the same target override each other**

Both `namedEffect` and `keyframeEffect` are ultimately compiled down to the CSS `animation` property on their target element. When two such effects in the same interaction land on the **exact same element**, the one applied last overrides the ones before it — the earlier animations do not show.

> **What counts as "the same element"?** Interact compares the whole `ElementIdentifier` (`key` plus `selector` / `listContainer` / `listItemSelector`). Two effects with matching identifiers resolve to the same element; if any field differs, they are different elements. See [Source and Target Resolving](http://Configuration/interactions/source-and-target-resolving) for the details.

This means the `effects` array is **not** the tool for layering several animations onto a single element:

```ts
// ❌ Both effects target the same element ('panel'). The 'grow' animation
//    overrides 'slide' — only the last one runs.
{
  key: 'panel',
  trigger: 'viewEnter',
  effects: [
    { keyframeEffect: { name: 'slide', keyframes: [/* ... */] }, duration: 600 },
    { keyframeEffect: { name: 'grow', keyframes: [/* ... */] }, duration: 600 },
  ],
}
```

To play multiple animations together on one element, use a **sequence** instead. The effects inside a sequence are coordinated into a single timeline and never override one another — they combine into one orchestrated animation. See [Sequences & Staggering](http://Configuration/sequences-and-lists).

## **The `sequences` array works the same way — with one difference**

An interaction can also hold an array of `sequences`, and it behaves just like the `effects` array at the top level: every sequence fires from the same trigger, and each sequence can carry its own `conditions`, so the array defines the same kind of conditional cascade.

The difference is what happens **inside** each entry. Where two effects targeting the same element in the `effects` array override each other, the effects *within a single sequence* can coexist on the same target — they're merged into one coordinated timeline rather than competing for the element's `animation` property. That's exactly why sequences are the right choice for layering animations on one element.

## **The array as a cascade: conditional, responsive effects**

If stacking effects on one target overrides, why would you ever point two effects at the same element on purpose? For **responsive and conditional behavior**.

Each effect can carry its own `conditions`. Combined with the last-one-wins override, the `effects` array becomes an ordered **cascade** for a single target — much like the CSS cascade. You list variants of the same animation, each gated by a condition, and order them from the most general fallback to the most specific override. Whichever conditions match determine what runs, and when more than one matches, the effect placed later wins:

```ts
const config = {
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

**Result:** All three effects target the same `panel`, but only the ones whose conditions match are applied — and their order defines the cascade. Because a later applicable effect overrides an earlier one, place broad defaults first and the higher-priority overrides last. For everything you can express with conditions, see [Conditions](http://Configuration/conditions).

# 🧑‍💻 multi-interaction compositions

## **Owner: [Ameer Abu-Fraiha](mailto:ameerf@wix.com) Reviewer: [Yehonatan Daniv](mailto:ydaniv@wix.com)**

# Multi-Interaction Compositions

The ["effects array & cascading logic"](http://Configuration/effects-array-and-cascading-logic) showed how one trigger can drive many effects across many targets. The separation of trigger and effect works just as well in the other direction: because an effect names its own target independently of any trigger, several **different triggers** can each drive their own animation on the **same** element.

This is what makes rich, layered motion possible. A single element can react to scrolling, to the pointer, and to hover — all at once — by being the target of several interactions, each built around a different trigger type. You compose the behavior not by cramming everything into one interaction, but by pointing multiple interactions at the same element.

## **Combining trigger types on one target**

Here is a feature card that is alive on three axes simultaneously:

- it **drifts upward as you scroll** (`viewProgress`),  
- it **tilts in 3D toward the cursor** (`pointerMove`, driven from the surrounding section),  
- and it **scales up on hover** (`hover`).

Each behavior is its own interaction, and all three effects target `feature-card`:

```ts
const config = {
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
            keyframes: [{ transform: 'rotateX(-15deg)' }, { transform: 'rotateX(15deg)' }],
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

## **Effects from different interactions live together**

This is the crucial difference from stacking effects inside a single interaction. As covered in the ["effects array & cascading logic"](http://Configuration/effects-array-and-cascading-logic), two effects in the **same** interaction's `effects` array that hit the same element share one animation slot, so the later one overrides the earlier.

Effects that come from **separate** interactions behave the opposite way: each interaction contributes its own entry to the element's animation list, so the animations run **simultaneously without overriding one another** — even when they all target the same element. That's precisely why the scroll, tilt, and hover animations above coexist instead of the last one winning.

## **`composite`: when animations share a CSS property**

"Living together" is seamless when the coexisting animations touch **different** properties (say one animates `opacity` and another `filter`). But layered motion often means several animations touch the **same** property — in the example above, the parallax, the tilt, and the hover scale all animate `transform`.

When two animations on an element animate the same property, the default behavior (`composite: 'replace'`) is that each fully replaces the value beneath it, so only one contribution to that property is visible at a time. To make them blend, set `composite` on the effects that should stack:

- **`'replace'`** (default) — the animation fully replaces the underlying value of the property.  
- **`'add'`** — appends this animation's transform/filter functions after the existing ones (e.g. an underlying `translateY(…)` plus an added `rotate(…)` and `scale(…)` all apply together).  
- **`'accumulate'`** — merges the arguments of matching functions (e.g. `translateX(10px)` \+ `translateX(20px)` → `translateX(30px)`), while non-matching functions concatenate like `'add'`.

In the composition above, the parallax is the base layer, and the tilt and hover effects use `composite: 'add'` so their transforms are added on top of it rather than clobbering it. `composite` maps directly to the CSS `animation-composition` property — see [MDN: `animation-composition`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-composition) for the underlying semantics.

> **Reminder:** "the same element" means a matching `ElementIdentifier`. Interactions whose effects resolve to the same identifier stack on the same element; effects that resolve to different identifiers animate different elements and never interact. See [Source and Target Resolving](http://Configuration/source-and-target-resolving).

# conditions

# 🧑‍💻 understanding conditions

## **Owner: [Bar Goldenberg](mailto:bargol@wix.com) Reviewer: [Marine Bretonniere](mailto:marinebr@wix.com)**

---

# Conditions

Conditions gate **when** an interaction, effect, or sequence is allowed to run. Use them to build responsive interactions that adapt to screen size, user preferences (like reduced motion), or the current state of the page — without duplicating configs or writing imperative checks.

A condition is a named, reusable rule defined once in the top-level `conditions` map and referenced by ID wherever you need it.

```ts
const config: InteractConfig = {
  conditions: {
    desktop: { type: 'media', predicate: '(min-width: 1024px)' },
  },
  interactions: [
    {
      key: 'product-card',
      trigger: 'hover',
      conditions: ['desktop'], // only runs on viewports ≥ 1024px
      effects: [{ effectId: 'lift' }],
    },
  ],
  effects: {
    /* … */
  },
};
```

> **Info:** Conditions never *cause* an interaction — a trigger does. They only decide whether a triggered interaction is permitted to run in the current environment.

## **Defining conditions**

Every condition has two fields:

| Field | Type | Description |
| :---- | :---- | :---- |
| `type` | `'media'` | `'selector'` | How the condition is evaluated. |
| `predicate` | `string` | The query or selector to test, matching the `type`. |

```ts
{
  conditions: {
    'desktop':    { type: 'media',    predicate: '(min-width: 1024px)' },
    'can-hover':  { type: 'media',    predicate: '(hover: hover)' },
    'is-active':  { type: 'selector', predicate: '.is-active' },
  },
}
```

### **Media conditions**

A `media` condition evaluates a standard CSS media query against the viewport. Use it to target device width, pointer capabilities, or user preferences.

```ts
{
  conditions: {
    'desktop':        { type: 'media', predicate: '(min-width: 1024px)' },
    'mobile':         { type: 'media', predicate: '(max-width: 767px)' },
    'can-hover':      { type: 'media', predicate: '(hover: hover)' },
    'prefers-motion': { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
  },
}
```

Media conditions are evaluated with `window.matchMedia` at runtime and emitted as `@media` rules in the [generated CSS](http://ADDLINK), so they re-evaluate automatically when the viewport changes.

### **Selector conditions**

A `selector` condition scopes an interaction or effect to when the target element matches a CSS selector. Use it to make interactions depend on a state class (for example, only animate while an element carries `.is-active`, or when a `.dark-mode` theme is applied).

```ts
{
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
}
```

The predicate is applied via CSS `:is(...)`, so the rule takes effect only while the element matches. Because it's expressed in CSS, it updates live as the element's classes or attributes change.

## **Where conditions can be applied**

Reference conditions by ID from a `conditions: string[]` array at three levels. **All listed conditions must pass** (they combine with AND).

| Level | Effect when it fails |
| :---- | :---- |
| **Interaction** | The entire interaction (all its effects and sequences) is gated. |
| **Effect** | Only that individual effect is gated. |
| **Sequence** | The whole sequence is gated. |

```ts
{
  interactions: [
    {
      key: 'card',
      trigger: 'viewEnter',
      conditions: ['desktop'],        // interaction-level: gates everything below
      effects: [
        { effectId: 'reveal' },
        { effectId: 'extra', conditions: ['prefers-motion'] }, // effect-level: gates only this effect
      ],
    },
  ],
}
```

> **Note:** Combine conditions by listing multiple IDs — `conditions: ['desktop', 'can-hover']` runs only when **both** match. Multiple `media` predicates are merged into a single `and`\-joined media query.

## 

## **Reduced motion**

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

## **Validation**

Condition IDs referenced from `conditions: [...]` arrays must exist in the top-level `conditions` map, and `media` predicates must be valid media queries. [`@wix/interact-validate`](http://ADDLINK) checks both — unused condition definitions and invalid media queries are reported as errors.

## **See also**

- [Configuration structure](http://ADDLINK)  
- [Effects](http://ADDLINK)  
- [Sequences](http://ADDLINK)  
- [Validating a config](http://ADDLINK)

# 🧑‍💻 responsive animation design

## **Owner: [Marine Bretonniere](mailto:marinebr@wix.com) Reviewer: [Bar Goldenberg](mailto:bargol@wix.com)**

## **Responsive animation design**

Conditions let you adapt interactions to different screen sizes, container sizes, and user preferences without duplicating your entire animation system.

## **Cascading effects**

When multiple effects in the same `effects` array target the same element and animate the same output, Interact resolves them in order, similarly to CSS:

* The effects must belong to the same interaction  
* The effects must target the same element  
* If multiple matching effects overlap, later ones take precedence over earlier ones

For responsive variants, this means you can define a base effect first, then layer more specific breakpoint overrides after it.

Important: to get this cascading behavior, place the conditions on the effect entries, not on the interaction.

Here is a mobile-first example for a card slide-in effect:

```javascript
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
        keyframes: [
          { transform: 'translateY(100%)' },
          { transform: 'translateY(0)' },
        ],
      },
      duration: 600,
      easing: 'backOut',
    },
    'slide-tablet': {
      keyframeEffect: {
        name: 'slide-tablet',
        keyframes: [
          { transform: 'translateY(50%)' },
          { transform: 'translateY(0)' },
        ],
      },
      duration: 400,
      easing: 'ease-in-out',
    },
    'slide-desktop': {
      keyframeEffect: {
        name: 'slide-desktop',
        keyframes: [
          { transform: 'translateY(100px)' },
          { transform: 'translateY(0)' },
        ],
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

In this example:

* Mobile is the base behavior  
* Tablet overrides mobile starting at `768px`  
* Desktop overrides tablet starting at `1024px`  
* The order matters: base first, more specific variants later

## **Combining multiple responsive signals**

Responsive animation design is not limited to viewport width. You can combine media conditions, container conditions, and user-preference conditions to gate more advanced effects.

```javascript
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
    'wide-container': {
      type: 'container',
      predicate: '(min-width: 600px)',
    },
  },

  interactions: [
    {
      key: 'hero-animation',
      trigger: 'viewEnter',
      conditions: ['desktop', 'motion-ok', 'wide-container'],
      effects: [
        {
          key: 'hero-background',
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
          key: 'hero-content',
          keyframeEffect: {
            name: 'slide-content',
            keyframes: [
              { opacity: '0', transform: 'translateY(80px)' },
              { opacity: '1', transform: 'translateY(0)' },
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

Use this pattern when the animation should only run in environments that can support it comfortably.

## **Swapping interaction models by breakpoint**

Sometimes the right responsive behavior is not just a milder or stronger version of the same animation. Sometimes the interaction model itself should change.

For example:

* On mobile, a menu should open on tap  
* On desktop, navigation should respond to hover

In that case, use separate interactions rather than trying to cascade effect variants inside one interaction.

```javascript
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
      key: 'menu-toggle',
      trigger: 'activate',
      conditions: ['mobile'],
      effects: [
        {
          key: 'mobile-menu',
          keyframeEffect: {
            name: 'mobile-menu-slide',
            keyframes: [
              { transform: 'translateX(-100%)' },
              { transform: 'translateX(0)' },
            ],
          },
          duration: 300,
          easing: 'ease-out',
          triggerType: 'alternate',
          fill: 'both',
        },
        {
          key: 'menu-overlay',
          keyframeEffect: {
            name: 'mobile-menu-overlay',
            keyframes: [{ opacity: '0' }, { opacity: '0.5' }],
          },
          duration: 300,
          triggerType: 'alternate',
          fill: 'both',
        },
      ],
    },

    {
      key: 'nav-item',
      trigger: 'hover',
      conditions: ['desktop'],
      effects: [
        {
          key: 'dropdown-menu',
          keyframeEffect: {
            name: 'desktop-dropdown',
            keyframes: [
              { opacity: '0', transform: 'translateY(-10px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 200,
        },
      ],
    },
  ],
};
```

Use this approach when different breakpoints need different triggers, not just different effect strengths.

## **Best practices**

### **Condition naming**

Use descriptive, semantic names:

```javascript
'desktop-large': { type: 'media', predicate: '(min-width: 1200px)' }
'touch-primary': { type: 'media', predicate: '(pointer: coarse)' }
'motion-safe': { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' }
```

### **Progressive enhancement**

Start with a baseline interaction that works everywhere, then layer enhancements for devices and contexts that can support them.

### **Accessibility first**

Always provide a motion-safe alternative when the primary interaction depends on animation (see reduced motion \<add link to understanding condition \- reduced motion\>)

# sequences and lists

# 🧑‍🌾 what is a list?

## **Owner: [Hassan Kittany](mailto:hassank@wix.com) Reviewer: [Michael Be\`eri](mailto:michaelb@wix.com)**

#  What is a List?

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

## **Why lists exist**

- **One definition, many elements.** Describe the behavior once; it applies to every item in the container.  
- **Dynamic content.** Interact watches the container and applies interactions to items added later, and cleans up items that are removed — no re-wiring. This is what makes lists ideal for feeds, search results, carts, and infinite scroll.  
- **Consistency.** Every item behaves identically because they share one definition.  
- **Staggering.** Lists are the foundation for staggered, one-after-another animations (see **Sequences**).

## **The container and its items**

- **`listContainer`** — a CSS selector for the container element, resolved *within* the keyed `<interact-element>`. So the keyed element wraps the container, and the container holds the items. **This is what establishes a list.**  
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

### **A list vs. a plain multi-select**

`listContainer` isn't the only way to touch *several* elements — a `selector` alone matches via `querySelectorAll`, so it also fans an interaction across every match. But that's a **static, one-time query**: it has none of the list semantics.

| Mechanism | Targets multiple elements? | A managed list? |
| :---- | :---- | :---- |
| `listContainer` | the container's children |  dynamic tracking \+ stagger |
| `listContainer` \+ `listItemSelector` |  a filtered subset of children |  (filtered) |
| `selector` only |  `querySelectorAll` matches |  static — no tracking, no coordination |

The difference is what you get for free: a list is **dynamically tracked** (children added/removed are handled automatically) and can be **coordinated into a stagger** via a sequence. A `selector` multi-select is just "these elements, right now."

## **`listContainer` works at two levels**

Because both interactions and effects accept `listContainer`, you control the list on two axes:

- **On the interaction** (the *source*) — the trigger attaches to **each item**. e.g. `hover` fires per card, when you hover *that* card.  
- **On the effect** (the *target*) — the effect applies to **each item**.

The common case uses the same container for both: each item is its own trigger *and* its own target (hover a card → that card animates). You can also combine `listContainer` with `selector` on the effect to animate a **child inside each item** — e.g. hovering a card zooms the `img` within it:

```ts
{
  key: 'products',
  listContainer: '.grid',
  trigger: 'hover',
  effects: [
    {
      listContainer: '.grid',
      selector: 'img',   // animate the image inside each hovered card
      keyframeEffect: { name: 'zoom', keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }] },
      triggerType: 'alternate',
      fill: 'both',
      duration: 300,
    },
  ],
}
```

## **Dynamic content is automatic**

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
        keyframes: [{ opacity: '0', transform: 'translateY(20px)' }, { opacity: '1', transform: 'translateY(0)' }],
      },
      duration: 400,
    },
  ],
}
```

## **Lists and sequences**

A list applies the *same* effect to every item, all firing together. To make items animate **one after another**  (a staggered cascade) combine a list with a **sequence**: the sequence's `offset` spaces each item's start, and its `offsetEasing` shapes how that spacing is distributed. New items added to the DOM rejoin the sequence with recalculated offsets.

## **Notes**

- `listContainer` is resolved relative to the keyed element, so structure your markup as `<interact-element key> → container → items`.  
- Prefer **one container** over many separate keys for large or dynamic lists — it's a single observer and a single definition, not one per item.  
- `selector` targets a single child *within a root*; `listContainer` fans an interaction *across many children*. They compose (`listContainer` \+ `selector` \= "a child inside each item").

# 🧑‍💻 using lists

## **Owner: [Michael Be\`eri](mailto:michaelb@wix.com) Reviewer: [Bar Goldenberg](mailto:bargol@wix.com)**

# **Using lists**

Most real interfaces repeat a shape many times: product grids, feeds, galleries, navigation menus, search results. Wiring an interaction to each item by hand is tedious and breaks the moment the data changes. Interact solves this with **lists** \- you point one interaction at a *container*, and Interact applies the behavior to every child, keeps it in sync as items are added or removed, and can stagger them into a sequence.

## **The three properties that define a list**

A list is described by up to three properties, which appear **both** on the `Interaction` (the trigger side) and on the `Effect` (the target side):

| Property | What it does |
| :---- | :---- |
| `listContainer` | A CSS selector, resolved **within the interaction's root element**, that finds the container holding the items. This is what turns an interaction into a list. |
| `selector` | Optional. With `listContainer`, Interact runs `querySelectorAll(selector)` **inside the container** and treats each match as the target. Without it, every **direct child** of the container is a target. |
| `listItemSelector` | Optional. Narrows which direct children count as list items when Interact generates CSS (for `transition` / state effects). Use it when the container also holds elements that are not items. |

Two rules that trip people up:

1. **`listContainer` is not inherited from the interaction to its effects.** If the trigger uses `listContainer`, each effect that should also operate per item must repeat it (and `selector`, if used). An effect without `listContainer` falls back to normal single-element selection.  
2. The container selector is resolved **relative to the interaction's root element** (the element identified by `key`), not the whole document. With the Web Components entry that root is the `<interact-element>`; the container must live inside it.

## **A basic list entrance**

The most common list interaction is a `viewEnter` entrance applied to each item. Note how `listContainer` appears on the interaction **and** on the effect.

| `HTML` `<interact-element data-interact-key="feature-list">`   `<ul class="features">`     `<li>Fast</li>`     `<li>Declarative</li>`     `<li>Framework-agnostic</li>`     `<li>Accessible</li>`   `</ul>` `</interact-element>` |
| :---- |

| `TypeScript` `const config = {`   `interactions: [`     `{`       `key: "feature-list",`       `listContainer: ".features", // turns this into a list`       `trigger: "viewEnter",`       `params: { threshold: 0.15 },`       `effects: [`         `{`           `key: "feature-list",`           `listContainer: ".features", // repeat on the effect`           `keyframeEffect: {`             `name: "fade-up",`             `keyframes: [`               `{ opacity: "0", transform: "translateY(24px)" },`               `{ opacity: "1", transform: "translateY(0)" },`             `],`           `},`           `duration: 600,`           `easing: "ease-out",`           `fill: "both",`         `},`       `],`     `},`   `],` `};` `Interact.create(config);` |
| :---- |

Each `<li>` now fades and slides up independently as the list scrolls into view. Add a fifth `<li>` to the markup and it animates too \- no config change required.

**Avoid a flash of unstyled content.** For entrance effects, pass the config through `generate(config)` and inject the returned CSS into `<head>` so items start hidden before JavaScript runs.

## **Targeting elements inside each item**

Combine `listContainer` with `selector` to reach a specific descendant of every item. Here the hover trigger listens on each card, and the effect zooms only the image inside that card:

| `HTML` `<interact-element data-interact-key="gallery">`   `<div class="gallery-grid">`     `<figure class="gallery-item">`       `<img src="1.jpg" alt="" />`       `<figcaption class="overlay">View</figcaption>`     `</figure>`     `<figure class="gallery-item">`       `<img src="2.jpg" alt="" />`       `<figcaption class="overlay">View</figcaption>`     `</figure>`   `</div>` `</interact-element>` |
| :---- |

| `TypeScript` `{`   `key: 'gallery',`   `listContainer: '.gallery-grid',`   `selector: '.gallery-item', // trigger on each item`   `trigger: 'interest', // accessible hover (pointer + keyboard)`   `effects: [`     `{`       `key: 'gallery',`       `listContainer: '.gallery-grid',`       `selector: '.gallery-item img', // effect on the image within the item`       `keyframeEffect: {`         `name: 'zoom',`         `keyframes: [`           `{ transform: 'scale(1)' },`           `{ transform: 'scale(1.08)' },`         `],`       `},`       `duration: 300,`       `easing: 'ease-out',`       `fill: 'both',`     `},`   `],` `}` |
| :---- |

The interaction's `selector` and the effect's `selector` are independent \- the trigger element and the animated element can differ within the same item.

## **Dynamic lists: additions and removals are automatic**

This is the part that makes lists worth using. When an interaction (or effect) declares a `listContainer`, Interact attaches a `MutationObserver` to that container. From then on:

* **Appending** a direct child to the container applies the list's interactions and effects to the new item automatically.  
* **Removing** a direct child cleans up its listeners and removes it from any sequences.

You do **not** need to call any imperative "add item" API \- mutating the DOM is enough. 

| `TypeScript const config = {`   `interactions: [`     `{`       `key: 'feed',`       `listContainer: '.feed-items',`       `trigger: 'viewEnter',`       `effects: [`         `{`           `key: 'feed',`           `listContainer: '.feed-items',`           `triggerType: 'repeat', // re-arm so late arrivals animate too`           `keyframeEffect: {name: 'slide-in', keyframes: [...]}`         `},`       `],`     `},`   `],` `}; Interact.create(config); // Later - the new node animates automatically: document.querySelector('.feed-items').appendChild(makeItem('New post'));` |
| :---- |

Two things to keep in mind:

* Only **direct children** of the container are tracked. Wrapping items in an extra layer moves them out of view of the observer.  
* Use `triggerType: 'repeat'` on the effect when items arrive after the initial trigger fired (infinite scroll, "load more", live feeds), so the animation is armed to run again rather than only once.

# 🧑‍🌾 what is a sequence?

## **Owner: [Monty Alon](mailto:montya@wix.com) Reviewer: [Michael Be\`eri](mailto:michaelb@wix.com)**

#  What is a Sequence?

A **Sequence** coordinates several Effects, possibly with staggered timing, so they are fired and controlled as one orchestrated group instead of multiple single Effects.

Instead of manually wiring up independent timelines or guessing escalating delay values across elements, you describe the orchestration up front in the configuration registry. The sequence handles the timing, math, and lifecycle of the grouped effects automatically.

### **Why sequences exist**

* **One orchestrated group:** Bundles multiple visual changes across the page and triggers them as a single cohesive unit.  
* **Staggering made easy:** Effortlessly creates waterfalls of motion (e.g., elements in a layout revealing one after another).  
* **Dynamic content recalculation:** When paired with lists, newly appended items automatically rejoin the sequence with properly calculated timeline offsets.

### **Anatomy of a Sequence Config**

Sequences live in the top-level sequences record as a registry of reusable configurations referenced by a unique ID.

TypeScript

```javascript
type SequenceConfig = {
  offset?: number;         // Optional: ms between each item's playback start
  offsetEasing?: string;  // Optional: easing function to distribute the offset spacing
  effects: (Effect | EffectRef)[];   // REQUIRED: array of effects participating in the sequence
};
```

* **offset**: The delay in milliseconds introduced between the start of consecutive elements in the sequence.  
* **offsetEasing**: Shapes how the spacing between staggered animations is distributed over time (e.g., accelerating or decelerating the cascade).

### **Sequences \+ Lists: The Staggered Cascade**

While a sequence can coordinate distinct target elements, it is most frequently paired with a listContainer.

Without a sequence, a list interaction applies the same effect to every item simultaneously. Introducing a sequence splits that simultaneous execution into a beautifully staggered cascade across the container's children.

### **Example: Staggering Card Entrances**

This configuration triggers a staggered fade-in for an entire row of items the moment the container enters the viewport.

TypeScript

```java
import { Interact } from '@wix/interact/web';
import * as presets from '@wix/motion-presets';
import type { InteractConfig } from '@wix/interact';

const config: InteractConfig = {
  interactions: [
    {
      key: 'card-row',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      // References the sequences map below
      sequences: [{ sequenceId: 'cards-in' }], 
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
        // References card-fade, staggered across list children
        { effectId: 'card-fade', listContainer: '.cards' }, 
      ],
    },
  },
};

Interact.registerEffects({ FloatIn: presets.FloatIn }); // Required before create() when using namedEffect
Interact.create(config);
```

HTML

```html
<interact-element data-interact-key="card-row">
  <div class="cards">
    <article class="card">One</article>
    <article class="card">Two</article>
    <article class="card">Three</article>
  </div>
</interact-element>
```

### **⚠️ Pitfalls**

* **Missing listContainer on Effect Ref:** When referencing an effect inside a sequence registry, ensure listContainer is explicitly declared on the effect entry so the sequence runtime knows which elements to stagger.  
* **Overshooting durations:** If your sequence contains structural loops or heavy offsets, ensure total sequence time aligns well with the user's viewport residency time.

### **See also**

* [What is a list?](https://www.google.com/search?q=ADDLINK)  
* [About the config object](https://www.google.com/search?q=ADDLINK)  
* [What are effects](https://www.google.com/search?q=ADDLINK)

# 🧑‍💻 using sequences

## **Owner: [Zion Ben Yacov](mailto:zionbe@wix.com) Reviewer: [Michael Be\`eri](mailto:michaelb@wix.com)**

Attach, configure, and trigger staggered sequences in a live Interact config

## **Using Sequences**

Once you know what a sequence is, using one comes down to three decisions: whether to define it inline or as a reusable top-level entry, which trigger drives it, and whether it targets discrete elements or a `listContainer`.

### **1\. Inline vs. reusable sequences**

For a one-off stagger, define the sequence directly inside the interaction's `sequences` array:

```javascript
{
  key: 'card-row',
  trigger: 'viewEnter',
  params: { threshold: 0.2 },
  sequences: [
    {
      offset: 120,
      effects: [{ 
        effectId: 'card-fade', 
        listContainer: '.cards' 
      }],
    },
  ],
}
```

For a sequence reused across multiple interactions, define it once under the top-level `sequences` record and reference it by `sequenceId`:

```javascript
{
  sequences: {
    'cards-in': {
      offset: 120,
      effects: [{ 
        effectId: 'card-fade', 
        listContainer: '.cards' 
      }]
    }
  }
  interactions: [
    { 
      key: 'card-row', 
      trigger: 'viewEnter', 
      sequences: [{ sequenceId: 'cards-in' }] 
    }
  ]
}
```

A `sequenceId` must point to an existing key in `config.sequences`, or validation fails with `SEQUENCE_ID_NOT_FOUND`.

### **2\. Pick a trigger**

Sequences work with the same triggers as single effects: `viewEnter`, `hover`, `click`, `interest`, `activate`. For `hover`/`click` (and their accessible variants), playback behavior is controlled by setting `triggerType` on the **sequence config itself**, not on the individual effects inside it:

```
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

For `viewEnter`, the same `triggerType` values apply (`'once'` is the default), with the usual rule: if any effect in the sequence shares its key with the source element, use `triggerType: 'once'` only.

### **3\. Stagger a list**

Sequences are most commonly paired with a `listContainer` so each child of the container gets its own offset animation start:

```
effects: [
  { effectId: 'card-fade', listContainer: '.cards' },
]
```

Since the effect targets the list rather than a single key, newly added children are automatically picked up and animated with the correct calculated offset — you don't need to re-register anything when the DOM changes.

### **4\. Tune the timing**

* `offset` — milliseconds between the start of each participant's animation. Must be zero or greater; a negative value raises `NEGATIVE_OFFSET`.  
* `offsetEasing` — a CSS or `@wix/motion` easing name that reshapes how the offsets are distributed (e.g. front-loaded vs. back-loaded stagger) rather than a linear stagger.  
* `delay` — a single base delay, in milliseconds, applied before the whole sequence starts (separate from each item's `offset`).

### **5\. Validate before shipping**

Run the config through `@wix/interact-validate` and fix any errors before calling `Interact.create()`:

```javascript
import { assertValidInteractConfig } from '@wix/interact-validate';
assertValidInteractConfig(config);
```

This catches dangling `sequenceId`/`effectId` references, negative `offset`/`delay` values, and unused sequence definitions (`UNUSED_SEQUENCE`) before they reach the runtime.

### **See also**

* What is a Sequence?  
* Using Lists  
* effects array & cascading logic  
* understanding conditions


