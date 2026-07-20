# Plugins

`@wix/interact` can route parts of your config to **plugins** — external code registered at runtime. Interact acts purely as a bridge: it knows a plugin's *name*, and when an interaction or effect carries a field named `$<name>` it hands that field's value to the plugin. Interact never knows what the plugin does.

This keeps Interact free of any plugin-specific code, and keeps plugins (like [`@wix/splittext`](https://www.npmjs.com/package/@wix/splittext)) free of any Interact-specific code. Neither package depends on the other — the glue lives in your app.

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

If a `$`-prefixed field names a plugin that was never registered, Interact throws a clear error at connect time.

> **Why the `$` prefix?** It marks a field as plugin config unambiguously (no clash with real config fields), it's a valid unquoted key in JS/TS and valid JSON, and it lets `@wix/interact-validate` accept plugin fields (via `catchall`) while still flagging genuinely-unknown keys.

## The plugin contract

```ts
type InteractPlugin = (
  value: unknown,
  context: {
    root: HTMLElement;              // the interaction's (or effect target's) root element
    key: string;                    // the interaction/effect key
    scope: 'interaction' | 'effect';
    config: Record<string, unknown>; // the interaction/effect object the field was on
  },
) => void | (() => void);            // optionally return a cleanup function
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

`@wix/splittext` splits an element's text into `<span>` wrappers (`.split-c` for chars, `.split-w` for words, `.split-l` for lines, `.split-s` for sentences). Wire it up as a plugin, then target the generated spans with a normal `selector`:

```ts
// splitTextPlugin.ts — the ONLY module that imports both packages
import { splitText, type SplitTextOptions, type SplitTextResult } from '@wix/splittext';
import type { InteractPlugin } from '@wix/interact';

export type SplitTextPluginConfig = { container: string } & SplitTextOptions;

export const splitTextPlugin: InteractPlugin = (value, { root }) => {
  const { container, ...options } = value as SplitTextPluginConfig;
  const element = root.querySelector<HTMLElement>(container);
  if (!element) return;
  const result: SplitTextResult = splitText(element, options);
  return () => result.revert(); // Interact reverts the split on teardown
};

declare module '@wix/interact' {
  interface InteractPluginConfigMap {
    splitText: SplitTextPluginConfig;
  }
}
```

```ts
import { Interact } from '@wix/interact';
import { splitTextPlugin } from './splitTextPlugin';

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

A plugin often needs initial CSS *before* it runs — e.g. hiding the un-split text so an entrance animation doesn't flash the raw content. That's a build-time concern, so it lives in [`generate()`](../api/functions.md#generateconfig-usefirstchild-plugins), not in the runtime `use()` callback.

Pass a **second, separate callback per plugin** as `generate()`'s third argument. For every `$<name>` field, `generate()` calls the matching generator with the field's (opaque) value and a context, and appends the returned CSS. Like `create()`, `generate()` never looks inside the value — the plugin decides what to emit (and defines its own selectors under `selectorSuffix`).

```ts
type InteractPluginStyleGenerator = (
  value: unknown,
  context: {
    key: string;
    scope: 'interaction' | 'effect';
    config: Record<string, unknown>;
  },
) => { declarations: { name: string; value: string | number; }[]; selectorSuffix?: string }[];
```

`selectorSuffix` is concatenated to the base selector (`[data-interact-key="<key>"]`), to refine the target for the styling.

### SplitText example — hide until split

Pair a runtime marker with a build-time hide rule so the container is hidden on first paint and revealed once split:

```ts
// splitTextPlugin.ts (extends the earlier example)
import type { InteractPlugin, InteractPluginStyleGenerator } from '@wix/interact';

const READY_ATTR = 'data-splittext-ready';

export const splitTextPlugin: InteractPlugin = (value, { root }) => {
  const { container, hideUntilReady, ...options } = value as {
    container: string;
    hideUntilReady?: boolean;
  } & SplitTextOptions;
  const el = root.querySelector<HTMLElement>(container);
  if (!el) return;
  const result = splitText(el, options);
  if (hideUntilReady) el.setAttribute(READY_ATTR, ''); // reveal (see the SSR rule below)
  return () => {
    result.revert();
    el.removeAttribute(READY_ATTR);
  };
};

// The SSR counterpart — NOT the same callback as splitTextPlugin.
export const splitTextStyle: InteractPluginStyleGenerator = (value, _) => {
  const { container, hideUntilReady } = value as { container: string; hideUntilReady?: boolean };
  if (!hideUntilReady) return;
  return [{
    declarations: [{name: 'visibility', value: 'hidden'}],
    selectorSuffix: ` ${container}:not([${READY_ATTR}])`,
  }];
};
```

```ts
import { generate } from '@wix/interact';
import { splitTextStyle } from './splitTextPlugin';

// Embed this CSS in <head> at build/SSR time.
const css = generate(config, true, { splitText: splitTextStyle });
// → `[data-interact-key="hero"] .title:not([data-splittext-ready]) { visibility: hidden; }`
```

On first paint the container is hidden; once the runtime plugin splits it and sets `data-splittext-ready`, the hide rule stops matching and the (individually-hidden) spans take over their entrance animation — no flash of un-split text.

> Plugin styles are emitted verbatim and unconditionally. If a rule should be scoped to a media query or condition, have the generator build that itself (it receives the interaction/effect `config`).

## Validation

`@wix/interact-validate` accepts any `$`-prefixed field as opaque plugin config (via zod's `catchall`) — it does not inspect plugin-specific shapes (it has no knowledge of any plugin). Non-prefixed unknown keys are still rejected, so a typo like `slector` (or forgetting the `$` on a plugin field) is caught.
