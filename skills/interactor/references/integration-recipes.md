# Integration recipes (@wix/interact)

Copy-paste setup for each entry point. Pick the one matching the project's stack
(see the decision procedure in SKILL.md Step 2). All entry points re-export the same
`Interact`, `generate`, `add`, `remove`, and types — they differ only in how
elements get bound.

Shared rules that apply to **every** recipe:

- `Interact.registerEffects(presets)` runs **before** `generate()` / `create()`.
- `generate(config, useFirstChild)`: `true` for **web**, `false` for **vanilla/React**.
- When a config uses `$`-prefixed plugin fields, register the runtime plugin with
  `Interact.use()` **before** `create()` and pass the matching SSR style generator
  in `generate()`'s `plugins` option — see [Plugins (`$` fields)](#plugins--fields)
  and `references/plugins.md`.
- For static or pre-rendered output, follow the canonical
  [CSS generation policy](#css-generation-policy-for-static-and-pre-rendered-output).
- Keep the instance reference; call `instance.destroy()` on teardown (route change / unmount).
- Validate the config with `@wix/interact-validate` before `generate()` / `create()` — agent-side always; see `references/validate.md`. Shipped files must contain no validator reference unless the user asked for a permanent CI guard.

## CSS generation policy for static and pre-rendered output

Prefer calling `generate(config, useFirstChild)` for the complete config at
build/generation time and embedding the resulting CSS in the shipped HTML. Embed
it with one of:

- `<style>…css…</style>` in `<head>` (preferred)
- `<link rel="stylesheet" href="interact.css">` in `<head>`
- `<style blocking="render">…css…</style>` or
  `<link rel="stylesheet" href="interact.css" blocking="render">` at the
  **start of `<body>`** when render-blocking is needed to prevent FOUC

If some interactions depend on runtime-only data, split them into a separate
config: pre-generate the static config, then generate and inject the
runtime-dependent config in the browser before its `Interact.create()` call. If
splitting is impractical, generating the complete CSS at runtime is an acceptable
fallback; apply it before revealing initially hidden content.

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

> **Validation:** static config → validate in a scratch script before writing files. Dynamic config (e.g. built from fetched data) → temporarily inject `assertValidInteractConfig(config)` before `generate()`/`create()`, run, fix, **remove**. An optional _permanent_ dev/CI guard may stay as a devDependency (opt-in only) — see `references/validate.md`.

```html
<head>
  <style>
    /* optional: keep the wrapper out of layout. Omit if you want it to lay out
       like a normal block — it's a layout preference, not a requirement. */
    interact-element {
      display: contents;
    }
    /* paste interactCSS here — generated at build time */
  </style>
</head>
<body>
  <interact-element data-interact-key="hero">
    <section class="hero">Hello, animated world!</section>
  </interact-element>
</body>
```

---

## B. CDN / no build step — `@wix/interact/web` via [esm.sh](https://esm.sh)

For a static `.html` page with no bundler, follow the
[canonical CSS generation policy](#css-generation-policy-for-static-and-pre-rendered-output);
a Node scratch script can pre-generate the CSS before deploy.

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      interact-element {
        display: contents;
      }
      /* …paste pre-generated css from generate(config, true)… */
    </style>
  </head>
  <body>
    <interact-element data-interact-key="hero">
      <section class="hero">Hello, animated world!</section>
    </interact-element>

    <script type="module">
      import { Interact } from 'https://esm.sh/@wix/interact/web';
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

      Interact.create(config);
    </script>
  </body>
</html>
```

> **Validation — shipped page must never import validate.** Static config → agent validates in a scratch script before writing the file. Dynamic config built in-page → agent may _temporarily_ add an `https://esm.sh/@wix/interact-validate` import + `assertValidInteractConfig(config)` call, run validation, then **must remove both** before finishing (verify with the grep in `references/validate.md`).

---

## C. React — `@wix/interact/react`

Use the `<Interaction>` component (it handles element binding via a ref) and run
`Interact.create()` inside `useEffect` so it never executes during SSR. Prefer
calling `generate()` for the complete config during SSR/build and embedding the
CSS in document `<head>`. If some config depends on client-only props or data,
split it and generate that portion before its client-side `Interact.create()`;
fall back to generating the complete config client-side if splitting is
impractical. It is recommended to use `Interact.create()` and `generate()` once
in the top-level component (e.g. the "App" component).
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

For SSR frameworks (Next, Remix), follow the
[canonical CSS generation policy](#css-generation-policy-for-static-and-pre-rendered-output)
with `generate(config, false)`. Keep `Interact.create()` in `useEffect` (client
only).

> **Validation:** static config → scratch script before emit. Dynamic config (e.g. built from props or a `cards.map(...)`) → temporarily inject `assertValidInteractConfig(config)` before `generate()`/`create()`, run so the path executes, fix, **remove**. Optional permanent dev/CI guard is opt-in — see `references/validate.md`.

---

## D. Vanilla JS — `@wix/interact`

Manual binding — **two steps**: `create(config)` loads the config but binds nothing;
then call the **standalone** `add(element, key)` for each element once it's in the
DOM. Follow the
[canonical CSS generation policy](#css-generation-policy-for-static-and-pre-rendered-output)
with `generate(config, false)`.

```ts
import { Interact, add, remove, generate, type InteractConfig } from '@wix/interact';
import { FadeIn } from '@wix/motion-presets'; // import only what you use (tree-shakes)

Interact.registerEffects({ FadeIn });

const config: InteractConfig = {
  interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'hero-in' }] }],
  effects: { 'hero-in': { duration: 800, namedEffect: { type: 'FadeIn' }, triggerType: 'once' } },
};

// Build/generation script — write css into HTML <head> or interact.css
export const interactCSS = generate(config, false); // useFirstChild = false for vanilla
```

```html
<head>
  <style>
    …interactCSS…
  </style>
  <!-- or: <link rel="stylesheet" href="interact.css" /> -->
</head>
```

```ts
// Runtime (browser bundle)
Interact.create(config); // 1) load config
add(document.querySelector('#hero')!, 'hero'); // 2) bind the element (key optional if it has data-interact-key)
// later: remove('hero');
```

```html
<section id="hero" data-interact-key="hero">Hello, animated world!</section>
```

> **Validation:** same as recipe A — static scratch script or temporary inject→run→fix→remove for dynamic configs. See `references/validate.md`.

---

## Plugins (`$` fields)

When a config carries a `$<name>` field (e.g. `$splitText`), you need **both**
halves wired up — the runtime plugin and the SSR style generator. See
`references/plugins.md` for the full contract.

**Web / bundled vanilla:**

```ts
import { Interact, generate } from '@wix/interact/web';
import { splitTextPlugin, splitTextStyle } from '@wix/splittext/plugin';

Interact.use('splitText', splitTextPlugin); // BEFORE create()

const css = generate(config, {
  useFirstChild: true, // or false for vanilla/React
  plugins: { splitText: splitTextStyle },
});

Interact.create(config);
```

**CDN / no build step:**

```html
<script type="module">
  import { Interact, generate } from 'https://esm.sh/@wix/interact/web';
  import { splitTextPlugin, splitTextStyle } from 'https://esm.sh/@wix/splittext/plugin';

  Interact.use('splitText', splitTextPlugin);
  // Pre-generate css in a scratch script with plugins: { splitText: splitTextStyle }
  Interact.create(config);
</script>
```

**React:** register `Interact.use()` at module scope (before `create()` in
`useEffect`). Plugin cleanups run automatically when `instance.destroy()` is
called on unmount. Pass the matching generator in `generate()` at build/SSR time.

---

## Verifying the integration

1. **Config passes validation** — `validateInteractConfig(config)` returns no errors; shipped files contain no `@wix/interact-validate` reference (grep check in `references/validate.md`).
2. **Semantic checklist** — run the checklist in SKILL.md (presets, FOUC, markup keys, overflow, etc.).
3. **Console is clean** — no `"… not found in registry"` warnings (means a `namedEffect.type` wasn't registered or is misspelled).
4. **Entrance elements aren't flashing** — with the FOUC setup correct, `once` entrances start hidden and animate in.
5. **Scroll animations track scroll** — if a `viewProgress` effect doesn't move, check for `overflow: hidden` on an ancestor (must be `overflow: clip`).
6. **Plugin containers aren't stuck hidden** — if a `$splitText` field uses `hideUntilReady`, confirm both `splitTextPlugin` (runtime) and `splitTextStyle` (SSR generator) are wired; missing the runtime plugin leaves the container `visibility: hidden` forever.
7. If a dev server exists, load the page and watch the effect actually play. Animations are hard to assert headlessly, so the static checks are the primary proxy and the live load is confirmation.
