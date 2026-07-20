# @wix/interact Plugin Rules

Rules for extending `@wix/interact` with external plugins via `Interact.use()` and `$`-prefixed config fields.

## Model

Interact is a **generic bridge**. It knows a plugin only by the name it was registered under. When an interaction or effect carries a field named `$<name>`, Interact passes that field's value to the matching plugin and (optionally) stores a cleanup. Interact never inspects what the plugin does.

- `@wix/interact` has **no** plugin-specific code and does **not** depend on any plugin package.
- A plugin package (e.g. `@wix/splittext`) has **no** Interact-specific code and does **not** depend on `@wix/interact`.
- The adapter that maps an Interact plugin call to the plugin's own API lives in **your app** — the only place that imports both.

## Registration

Register before `Interact.create()`:

```js
Interact.use('<plugin-name>', (value, context) => {
  // value:   the value of the `$<plugin-name>` field
  // context: { root, key, scope: 'interaction' | 'effect', config }
  // return:  optional cleanup () => void, run on disconnect/teardown
});
```

- `Interact.getPlugin(name)` / `Interact.hasPlugins()` inspect the registry.

## Config placement

Add a `$<plugin-name>` field on an **interaction** or an **effect**:

```js
{
  key: 'hero',
  trigger: 'viewEnter',
  $splitText: { /* any value */ },
  effects: [ /* ... */ ],
}
```

## Rules

- **MUST** register the plugin (`Interact.use`) before `Interact.create()`. A `$<name>` field with no registered plugin throws at connect time.
- **MUST** prefix plugin fields with `$` (e.g. `$splitText`). A non-prefixed unknown key on an interaction/effect is rejected by `@wix/interact-validate` (via `catchall` + key check). Only `$`-prefixed fields are treated as opaque, un-inspected plugin config.
- Use a bare, unquoted `$<name>` key — no quotes needed since `$` is a valid identifier start (e.g. `$splitText:`, not `'plugin:splitText':`).
- Plugins run at **connect time, before target resolution** — DOM a plugin creates is visible to the `selector` / `listContainer` queries that follow.
- A returned cleanup runs on disconnect, on `Interact.destroy()`, and on media-query reconnect. Use it to fully undo the plugin's work.
- Each distinct plugin value is applied **once per connect**, even across multiple triggers on the same element.
- Interaction-level fields use the interaction's element as `root`; effect-level fields use the effect's target element as `root`.

## SSR styling (FOUC prevention)

Runtime plugins mutate the DOM only after JS loads. To style the element _before_ that (e.g. hide un-split text so an entrance animation doesn't flash), pass a **separate** per-plugin callback as `generate()`'s third argument:

```js
const css = generate(config, /* useFirstChild */ true, {
  splitText: (value, _context) => {
    // value: the opaque `$splitText` value;
    // context: { key, scope: 'interaction' | 'effect', config }
    // return: { declarations: { name: string; value: number | string }[]; selectorSuffix?: string }[]
    return [
      {
        declarations: [{ name: 'visibility', value: 'hidden' }],
        selectorSuffix: ` ${value.container ?? ''}:not([data-splittext-ready])`,
      },
    ];
  },
});
```

- This is **NOT** the callback registered via `Interact.use()` — it's a build-time styling generator.
- `generate()` does **not** inspect the `$<name>` value (same as `create()`); it just routes it to the generator, which returns partial CSS rule(s) data.
- `declarations` is an array of names and values of CSS properties to set; `selectorSuffix` is used to refine the target of the CSS rule - the resulting selector for the rule is `[data-interact-key=${key}]${selectorSuffix}`
- Context: `{ key, scope: 'interaction' | 'effect', config }`.
- Typical pattern: the runtime plugin sets a marker attribute after applying (e.g. `data-splittext-ready`), and the SSR rule hides until that marker is present.

## Example: `@wix/splittext`

Split text into `<span>`s, then target the generated spans with a normal `selector`. Default classes: `.split-c` (chars), `.split-w` (words), `.split-l` (lines), `.split-s` (sentences).

```js
import { Interact } from '@wix/interact';
import { splitText } from '@wix/splittext';

const config = {
  effects: { 'char-fade-up': { namedEffect: { type: 'FadeIn' }, duration: 400 } },
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      $splitText: { container: '.title', type: 'chars' },
      sequences: [{ offset: 30, effects: [{ effectId: 'char-fade-up', selector: '.split-c' }] }],
    },
  ],
};

Interact.use('splitText', (value, { root }) => {
  const { container, ...options } = value;
  const el = root.querySelector(container);
  if (!el) return;
  const result = splitText(el, options);
  return () => result.revert();
});

const css = Interact.generate(config, /* useFirstChild */ true, {
  splitText: (value, _) => {
    return [
      {
        declarations: [{ name: 'visibility', value: 'hidden' }],
        selectorSuffix: ` ${value.container ?? ''}:not([data-splittext-ready])`,
      },
    ];
  },
});
// Embed css in HTML — see CSS Generation & FOUC Prevention

Interact.create(config);
```
