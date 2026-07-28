# Plugins

`@wix/interact` can route parts of your config to **plugins** — external code registered at runtime. Interact acts purely as a bridge: it knows a plugin's _name_, and when an interaction or effect carries a field named `$<name>` it hands that field's value to the plugin. Interact never knows what the plugin does.

This keeps Interact free of any plugin-specific code, and keeps plugins (like [`@wix/splittext`](https://www.npmjs.com/package/@wix/splittext)) free of any dependency on Interact. A plugin package can still ship its own adapter — `@wix/splittext/plugin` does — by typing it _structurally_ against the contract below rather than importing `@wix/interact`. Your app then only supplies the type glue.

## How it works

1. Register a plugin by name, before `Interact.create()`:

   ```ts
   import { Interact } from '@wix/interact';

   Interact.use('myPlugin', (value, context) => {
     // `value` is whatever the config put in the `$myPlugin` field
     // `context` describes where it was found (see below)
     // return an optional cleanup function
   });
   ```

2. Reference it with a `$`-prefixed field on an **interaction** or an **effect**:

   ```ts
   Interact.create({
     interactions: [
       {
         key: 'hero',
         trigger: 'viewEnter',
         $myPlugin: { any: 'value' },
         effects: [{ effectId: 'fade-in' }],
       },
     ],
   });
   ```

When the `hero` element connects, Interact sees the `$myPlugin` field, looks up the `myPlugin` plugin, and calls it with `{ any: 'value' }`. Plugins run **before** target resolution, so any DOM a plugin creates is visible to the `selector` / `listContainer` queries that follow.

If a `$`-prefixed field names a plugin that was never registered, Interact ignores it.

> **Why the `$` prefix?** It marks a field as plugin config unambiguously (no clash with real config fields), it's a valid unquoted key in JS/TS and valid JSON, and it lets `@wix/interact-validate` accept plugin fields (via `catchall`) while still flagging genuinely-unknown keys.

## The plugin contract

```ts
type InteractPlugin = (
  value: unknown,
  context: {
    root: HTMLElement; // the interaction's (or effect target's) root element
    key: string; // the interaction/effect key
    scope: 'interaction' | 'effect';
    config: Record<string, unknown>; // the interaction/effect object the field was on
  },
) => void | (() => void); // optionally return a cleanup function
```

- Plugins run at **connect** time (when the element enters the DOM / is added).
- A returned **cleanup** runs on disconnect, on teardown (`Interact.destroy()`), and when an interaction re-connects after a media-query change — so plugins can fully undo their work.
- Each distinct plugin value is applied **once per connect**, even if referenced by multiple triggers on the same element.

### Type-safe config (optional)

Augment `InteractPluginConfigMap` — keyed by the **unprefixed** plugin name — so the `$<name>` field is type-checked:

```ts
declare module '@wix/interact' {
  interface InteractPluginConfigMap {
    myPlugin: { any: string };
  }
}
// now `$myPlugin` is typed as `{ any: string }` on interactions and effects
```

## Example: `@wix/splittext`

`@wix/splittext` splits an element's text into `<span>` wrappers (`.split-c` for chars, `.split-w` for words, `.split-l` for lines, `.split-s` for sentences). You don't need to write the adapter — it ships from the `@wix/splittext/plugin` entry point, written against the contract above _structurally_ so `@wix/splittext` keeps no dependency on `@wix/interact`. Register it, then target the generated spans with a normal `selector`:

```ts
// splitTextTypes.ts — the ONLY module that needs both packages, and only for types
import type { SplitTextPluginConfig } from '@wix/splittext/plugin';

declare module '@wix/interact' {
  interface InteractPluginConfigMap {
    splitText: SplitTextPluginConfig;
  }
}
```

```ts
import { Interact } from '@wix/interact';
import { splitTextPlugin } from '@wix/splittext/plugin';

Interact.use('splitText', splitTextPlugin);

Interact.create({
  effects: {
    'char-fade-up': { namedEffect: { type: 'FadeIn' }, duration: 400 },
  },
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      // split `.title` into characters before the sequence resolves
      $splitText: { container: '.title', type: 'chars' },
      sequences: [
        {
          offset: 30,
          offsetEasing: 'quadIn',
          // stagger the generated char spans
          effects: [{ effectId: 'char-fade-up', selector: '.split-c' }],
        },
      ],
    },
  ],
});
```

### Effect-level (cross-element) splitting

A `$`-prefixed field can also sit on an individual effect, using that effect's **target** element as the root — useful for splitting a different element inside a multi-effect sequence:

```ts
{
  key: 'cta',
  trigger: 'click',
  sequences: [
    {
      offset: 60,
      effects: [
        {
          key: 'heading',
          $splitText: { container: '.heading-text', type: 'chars' },
          selector: '.split-c',
          effectId: 'scatter',
        },
        { key: 'subtitle', effectId: 'fade-out' },
      ],
    },
  ],
}
```

## SSR styling (FOUC prevention)

A plugin often needs initial CSS _before_ it runs — e.g. hiding the un-split text so an entrance animation doesn't flash the raw content. That's a build-time concern, so it lives in [`generate()`](../api/functions.md#generateconfig-options), not in the runtime `use()` callback.

Pass a **second, separate callback per plugin** in the `plugins` option of `generate()`'s options bag — `generate(config, { useFirstChild, plugins })`. For every `$<name>` field, `generate()` calls the matching generator with the field's (opaque) value and a context, and appends the returned CSS. Like `create()`, `generate()` never looks inside the value — the plugin decides what to emit (and defines its own selectors under `selectorSuffix`).

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

`selectorSuffix` is concatenated to the base selector (`[data-interact-key="<key>"]`), to refine the target for the styling.

### SplitText example — hide until split

`@wix/splittext/plugin` ships this pairing ready-made: `splitTextStyle` is the SSR counterpart to `splitTextPlugin`, and the two agree on a `data-splittext-ready` marker. Opt in per-field with `hideUntilReady`:

```ts
import { generate } from '@wix/interact';
import { splitTextStyle } from '@wix/splittext/plugin';

const config = {
  effects: { 'char-fade-up': { namedEffect: { type: 'FadeIn' }, duration: 400 } },
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      $splitText: { container: '.title', type: 'chars', hideUntilReady: true },
      sequences: [{ offset: 30, effects: [{ effectId: 'char-fade-up', selector: '.split-c' }] }],
    },
  ],
};

// Embed this CSS in <head> at build/SSR time.
const css = generate(config, { plugins: { splitText: splitTextStyle } });
// → `[data-interact-key="hero"] .title:not([data-splittext-ready]) { visibility: hidden; }`
```

On first paint the container is hidden; once the runtime plugin splits it and sets `data-splittext-ready`, the hide rule stops matching and the (individually-hidden) spans take over their entrance animation — no flash of un-split text. Without `hideUntilReady`, `splitTextStyle` emits nothing.

> Plugin styles are emitted verbatim and unconditionally. If a rule should be scoped to a media query or condition, have the generator build that itself (it receives the interaction/effect `config`).

## Validation

`@wix/interact-validate` accepts any `$`-prefixed field as opaque plugin config (via zod's `catchall`) — it does not inspect plugin-specific shapes (it has no knowledge of any plugin). Non-prefixed unknown keys are still rejected, so a typo like `slector` (or forgetting the `$` on a plugin field) is caught.
