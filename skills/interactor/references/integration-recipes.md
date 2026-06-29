# Integration recipes (@wix/interact)

Copy-paste setup for each entry point. Pick the one matching the project's stack
(see the decision procedure in SKILL.md Step 2). All entry points re-export the same
`Interact`, `generate`, `add`, `remove`, and types — they differ only in how
elements get bound.

Shared rules that apply to **every** recipe:

- `Interact.registerEffects(presets)` runs **before** `generate()` / `create()`.
- `generate(config, useFirstChild)`: `true` for **web**, `false` for **vanilla/React**.
- Inject the generated CSS into `<head>` (or top of `<body>`) so it applies before JS.
- Keep the instance reference; call `instance.destroy()` on teardown (route change / unmount).

---

## A. Web Components — `@wix/interact/web`

Best default for plain HTML and most non-React bundled apps. Importing `/web`
auto-registers the `<interact-element>` custom element. Wrap each target in an
`<interact-element>` with a unique `data-interact-key`; it must contain **exactly
one** child (the library targets `:first-child`).

```ts
// interactions.ts
import { Interact, generate, type InteractConfig } from '@wix/interact/web';
import { FadeIn } from '@wix/motion-presets'; // import only what you use (tree-shakes)

Interact.registerEffects({ FadeIn });

export const config: InteractConfig = {
  interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'hero-in' }] }],
  effects: {
    'hero-in': {
      duration: 800,
      easing: 'ease-out',
      namedEffect: { type: 'FadeIn' },
      triggerType: 'once',
    },
  },
};

export const interactCSS = generate(config, true); // useFirstChild = true for web
export const instance = Interact.create(config); // binds <interact-element>s automatically
```

```html
<head>
  <style>
    /* optional: keep the wrapper out of layout. Omit if you want it to lay out
       like a normal block — it's a layout preference, not a requirement. */
    interact-element {
      display: contents;
    }
    /* inject interactCSS here (build-time or via the <script> below) */
  </style>
</head>
<body>
  <interact-element data-interact-key="hero>
    <section class="hero">Hello, animated world!</section>
  </interact-element>
</body>
```

---

## B. CDN / no build step — `@wix/interact/web` via [esm.sh](http://esm.sh)

For a static `.html` page with no bundler. Inject `generate()` output and run
`create()` client-side. Because the CSS is generated _after_ first paint here, an
entrance can flash before the script runs. For strict FOUC safety, either keep page
content hidden behind a loader until injection, or **precompile** `generate(config, true)`
once and paste its output into a static `<style>` in `<head>` (the robust option).
If you instead hand-write an initial hide rule, it must release on the same
signal the runtime uses — gate it with `:not([data-interact-enter])` (interact sets
`data-interact-enter` on the target once the animation plays) so the element can't
get stranded hidden.

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      interact-element {
        display: contents;
      }
    </style>
  </head>
  <body>
    <interact-element data-interact-key="hero">
      <section class="hero">Hello, animated world!</section>
    </interact-element>

    <script type="module">
      import { Interact, generate } from 'https://esm.sh/@wix/interact/web';
      import * as presets from 'https://esm.sh/@wix/motion-presets';

      Interact.registerEffects(presets);

      const config = {
        interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'hero-in' }] }],
        effects: {
          'hero-in': {
            duration: 800,
            easing: 'ease-out',
            namedEffect: { type: 'FadeIn' },
            triggerType: 'once',
          },
        },
      };

      const style = document.createElement('style');
      style.textContent = generate(config, true);
      document.head.appendChild(style);

      Interact.create(config);
    </script>
  </body>
</html>
```

---

## C. React — `@wix/interact/react`

Use the `<Interaction>` component (it handles element binding via a ref) and run `Interact.create()` inside `useEffect` so it never executes during SSR.
It is recommended to use `Interact.create()` and `generate()` once in the top level component (e.g. the "App" component).
It's possible to break down pieces of the Interact Config for separate lazy parts of the UI, and `Interact.create()` them using a separate call.

```tsx
// App.tsx
import { useEffect } from 'react';
import { Interact, Interaction, generate, type InteractConfig } from '@wix/interact/react';
import { FadeIn } from '@wix/motion-presets'; // import only what you use (tree-shakes)

Interact.registerEffects({ FadeIn }); // module scope — runs once

const config: InteractConfig = {
  interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'hero-in' }] }],
  effects: {
    'hero-in': {
      duration: 800,
      easing: 'ease-out',
      namedEffect: { type: 'FadeIn' },
    },
  },
};

export function App() {
  const interactCSS = generate(config, false); // useFirstChild = false for React

  useEffect(() => {
    const instance = Interact.create(config);
    return () => instance.destroy(); // cleanup on unmount (StrictMode-safe)
  }, []);

  return (
    <>
      <style>{interactCSS}</style>
      <Hero />
      /* rest of the app content */
    </>
  );
}
```

```tsx
// Hero.tsx
export function Hero() {
  return (
    <>
      <style>{interactCSS}</style>
      <Interaction tagName="section" interactKey="hero">
        Hello, animated world!
      </Interaction>
    </>
  );
}
```

`<Interaction>` props: `tagName` (required — the HTML tag to render), `interactKey`
(required — emitted as `data-interact-key`), plus `children`, a forwarded `ref`, and any
valid intrinsic props for `tagName`. For an element you don't want to wrap, use
`createInteractRef(key)` on a plain element that carries `data-interact-key`.

For SSR frameworks (Next, Remix), render the `<style>{generate(config, false)}</style>`
on the server and keep `Interact.create()` in `useEffect` (client only).

---

## D. Vanilla JS — `@wix/interact`

Manual binding — **two steps**: `create(config)` loads the config but binds nothing;
then call the **standalone** `add(element, key)` for each element once it's in the
DOM.

```ts
import { Interact, add, remove, generate, type InteractConfig } from '@wix/interact';
import { FadeIn } from '@wix/motion-presets'; // import only what you use (tree-shakes)

Interact.registerEffects({ FadeIn });

const config: InteractConfig = {
  interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'hero-in' }] }],
  effects: { 'hero-in': { duration: 800, namedEffect: { type: 'FadeIn' }, triggerType: 'once' } },
};

const style = document.createElement('style');
style.textContent = generate(config, false); // useFirstChild = false for vanilla
document.head.appendChild(style);

Interact.create(config); // 1) load config
add(document.querySelector('#hero')!, 'hero'); // 2) bind the element (key optional if it has data-interact-key)
// later: remove('hero');
```

```html
<section id="hero" data-interact-key="hero">Hello, animated world!</section>
```

---

## Verifying the integration

1. **Console is clean** — no `"… not found in registry"` warnings (means a `namedEffect.type` wasn't registered or is misspelled).
2. **Entrance elements aren't flashing** — with the FOUC setup correct, `once` entrances start hidden and animate in.
3. **Scroll animations track scroll** — if a `viewProgress` effect doesn't move, check for `overflow: hidden` on an ancestor (must be `overflow: clip`).
4. **Run the validation checklist** in SKILL.md against the final config.
5. If a dev server exists, load the page and watch the effect actually play. Animations are hard to assert headlessly, so the static checklist is the primary proxy and the live load is confirmation.
