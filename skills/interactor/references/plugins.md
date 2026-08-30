# Plugins (@wix/interact)

Extend `@wix/interact` with external packages via `Interact.use()` and `$`-prefixed
config fields. Interact is a **generic bridge** — it matches a registered name to
a `$<name>` field and passes the value through un-inspected. It never inspects
what the plugin does.

## Model

- `@wix/interact` has **no** plugin-specific code and does **not** depend on any
  plugin package.
- A plugin package (e.g. `@wix/splittext`) does **not** depend on `@wix/interact`.
- A plugin package MAY ship a ready-made adapter (e.g. `@wix/splittext/plugin`),
  typed _structurally_ against the contract below so it stays assignable to
  `InteractPlugin` without importing Interact. **Prefer the shipped adapter over
  hand-rolling one.**
- Only the **typing** glue lives in your app — the declaration merge on
  `InteractPluginConfigMap` (see [TypeScript glue](#typescript-glue)).

---

## Registration

Register before any affected element connects. In the normal setup, call
`Interact.use()` before `Interact.create()` because `create()` may immediately
connect elements already in the document:

```ts
Interact.use('<plugin-name>', (value, context) => {
  // value:   the value of the `$<plugin-name>` field
  // context: { root, key, scope: 'interaction' | 'effect', config }
  // return:  optional cleanup () => void, run on disconnect/teardown
});
```

- `Interact.getPlugin(name)` / `Interact.getPluginsNames()` inspect the registry.

---

## Config placement

Add a `$<plugin-name>` field on an **interaction** or an **effect**:

```ts
{
  key: 'hero',
  trigger: 'viewEnter',
  $splitText: { /* any value */ },
  sequences: [ /* ... */ ],
}
```

### Rules

- Register the plugin before the element connects (`add()` in vanilla, mount in
  React, or `Interact.create()` in the normal web-component flow). An
  unregistered `$<name>` field is silently ignored for that connection; later
  registration does not replay it until the element reconnects.
- **MUST** prefix plugin fields with `$` (e.g. `$splitText`). A non-prefixed
  unknown key on an interaction/effect is rejected by `@wix/interact-validate`.
- Plugins run at **connect time, before target resolution** — DOM a plugin
  creates is visible to the `selector` / `listContainer` queries that follow.
- A returned cleanup runs on disconnect, on `Interact.destroy()`, and on
  media-query reconnect. Use it to fully undo the plugin's work.
- Runtime dedupe applies only when the **same object reference** is reused on the
  same controller. Separate inline objects and primitive values run separately.
- `root` is the keyed controller element, before `selector` / `listContainer`
  resolution. Interaction fields use the source controller; effect fields use
  the effect target's controller.

---

## SSR styling (FOUC prevention)

Runtime plugins mutate the DOM only after JS loads. To style the element _before_
that (e.g. hide un-split text so an entrance animation doesn't flash), pass a
**separate** per-plugin callback in the `plugins` option of `generate()`'s
options bag:

```ts
const css = generate(config, {
  useFirstChild: true,
  plugins: {
    myPlugin: (value, _context) => {
      const { container } = value as { container: string };
      // value: the opaque `$myPlugin` value;
      // context: { key, scope: 'interaction' | 'effect', config }
      // return: { declarations: { name: string; value: number | string }[]; selectorSuffix?: string }[]
      return [
        {
          declarations: [{ name: 'visibility', value: 'hidden' }],
          selectorSuffix: ` ${container}:not([data-myplugin-ready])`,
        },
      ];
    },
  },
});
```

- If the plugin package ships its own generator, pass that instead of writing one
  — e.g. `splitTextStyle` from `@wix/splittext/plugin`.
- This is **NOT** the callback registered via `Interact.use()` — it's a
  build-time styling generator.
- `generate()` does **not** inspect the `$<name>` value (same as `create()`); it
  just routes it to the generator, which returns partial CSS rule(s) data.
- `declarations` is an array of CSS property names and values; `selectorSuffix`
  refines the target — the resulting selector is
  `[data-interact-key="${key}"]${selectorSuffix}`.
- Plugin rules attach directly to that keyed selector; `useFirstChild` does not
  add its `> :first-child` combinator to plugin rules.
- Typical pattern: the runtime plugin sets a marker attribute after applying
  (e.g. `data-splittext-ready`), and the SSR rule hides until that marker is
  present.

---

## Worked example — `@wix/splittext`

Split text into `<span>`s, then target the generated spans with a normal
`selector`. Default classes: `.split-c` (chars), `.split-w` (words), `.split-l`
(lines), `.split-s` (sentences).

**Do NOT hand-roll this adapter.** `@wix/splittext/plugin` ships both callbacks
— `splitTextPlugin` (runtime) and `splitTextStyle` (SSR) — already paired on
the `data-splittext-ready` marker.

### Installation

```bash
npm install @wix/splittext
```

`@wix/splittext` is a **separate** package — it is **not** transitive inside
`@wix/interact` (unlike `@wix/motion`). Install it only when you need per-char,
per-word, or per-line text animation.

**Browser requirement:** `Intl.Segmenter` (Chrome 87+, Safari 14.1+, Firefox 125+).
For older environments supply a polyfill via the `segmenter` option.

**CDN:** `import { splitTextPlugin, splitTextStyle } from 'https://esm.sh/@wix/splittext/plugin'`

### Canonical recipe

```ts
import { Interact, generate } from '@wix/interact/web';
import { splitTextPlugin, splitTextStyle } from '@wix/splittext/plugin';
import { FadeIn } from '@wix/motion-presets';

Interact.registerEffects({ FadeIn });

const config = {
  effects: {
    'char-fade-up': {
      namedEffect: { type: 'FadeIn' },
      duration: 400,
      fill: 'backwards',
    },
  },
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      // `hideUntilReady` hides the container until the split runs, preventing a FOUC.
      $splitText: { container: '.title', type: 'chars', hideUntilReady: true },
      sequences: [{ offset: 30, effects: [{ effectId: 'char-fade-up', selector: '.split-c' }] }],
    },
  ],
};

Interact.use('splitText', splitTextPlugin);

const css = generate(config, { useFirstChild: true, plugins: { splitText: splitTextStyle } });
// Embed css in HTML — see integration-recipes.md

Interact.create(config);
```

```html
<interact-element data-interact-key="hero">
  <section class="hero">
    <h1 class="title">Hello World</h1>
  </section>
</interact-element>
```

### `$splitText` config

`$splitText` takes `{ container, hideUntilReady?, ...SplitTextOptions }`.

| Field              | Type                                                             | Description                                                                                                                          |
| :----------------- | :--------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `container`        | `string`                                                         | **Required.** CSS selector resolved with `querySelectorAll` within `root`; every match is split.                                     |
| `hideUntilReady`   | `boolean`                                                        | Opt into the SSR hide rule emitted by `splitTextStyle`.                                                                              |
| `type`             | `'chars' \| 'words' \| 'lines' \| 'sentences'` or array of those | **Required for plugin use.** Without it, lazy getters are never read and no spans are created. Array order normalizes coarse → fine. |
| `wrapperClass`     | `string` or `{ chars?, words?, lines?, sentences? }`             | Extra CSS class(es) on wrapper spans.                                                                                                |
| `wrapperStyle`     | `Partial<CSSStyleDeclaration>` or per-type object                | Inline styles applied to wrapper spans.                                                                                              |
| `wrapperAttrs`     | `Record<string, string>` or per-type object                      | HTML attributes applied to wrapper spans.                                                                                            |
| `nested`           | `'flatten' \| 'preserve' \| number`                              | Single-type default `'preserve'`. For multi-type splits, omit it or use `'flatten'`; explicit `'preserve'` / numeric depth throws.   |
| `autoSplit`        | `boolean`                                                        | Default `false`; re-split on width change / initial font load. Recommended for `type: 'lines'`.                                      |
| `ignore`           | CSS selector string or `(node) => boolean`                       | Skip subtrees in preserve modes; flatten mode excludes their text.                                                                   |
| `preserveText`     | `boolean`                                                        | Default `true` — insert visually-hidden original text for a11y/SEO.                                                                  |
| `aria`             | `'auto' \| 'none'`                                               | Default `'auto'`; `'none'` disables the default screen-reader handling.                                                              |
| `partIndexing`     | `boolean`                                                        | Default `true` — set the corresponding `--char/word/line/sentence-index`.                                                            |
| `wordGlue`         | `'adjacent' \| 'none'`                                           | Default `'adjacent'`; glue punctuation to words or wrap it separately.                                                               |
| `contentAttribute` | `'none' \| 'both' \| 'attribute-only'`                           | Default `'both'`; applies to character and word spans only.                                                                          |
| `segmenter`        | `Intl.Segmenter` instance or constructor                         | Supply a polyfill when native `Intl.Segmenter` is unavailable.                                                                       |
| `bidiResolver`     | `(text) => { text, direction }[]`                                | Optional bidirectional-text resolver; adds `.split-ltr` / `.split-rtl` run wrappers.                                                 |
| `onSplit`          | `(result) => void`                                               | Callback after each split, including automatic re-splits.                                                                            |

### Generated hooks

Every wrapper `<span>` automatically receives a built-in class:

| Split type  | Class added automatically |
| :---------- | :------------------------ |
| `chars`     | `.split-c`                |
| `words`     | `.split-w`                |
| `lines`     | `.split-l`                |
| `sentences` | `.split-s`                |

Base styles are injected once per document. Character, word, and sentence spans are
`inline-block`; line spans are `block`. With `partIndexing: true` (default), each
span gets `--char-index`, `--word-index`, `--line-index`, or
`--sentence-index`.

### Staggering split spans

Staggering split spans is the same one-trigger `selector` case as any other list
of targets — use a **sequence** with `offset`, put `selector` on the **effect**
(not the interaction), and set `fill: 'backwards'` on the entrance effect
(the effect's `.split-*` selector makes its element identifier differ from the
interaction's, so `generate()` emits no built-in FOUC-hiding rule for the spans).

```ts
sequences: [{ offset: 30, effects: [{ effectId: 'char-fade-up', selector: '.split-c' }] }];
```

Match the selector to the class the chosen `type` produces: `.split-c` for
`chars`, `.split-w` for `words`, `.split-l` for `lines`, `.split-s` for
`sentences`.

## Failure modes

Most plugin mistakes are silent at runtime; the exceptions are noted below.

1. **Registration after connect** — the plugin is not replayed automatically.
   Register before `create()` in the standard flow, or reconnect the element.
2. **SSR generator without runtime plugin** — with `hideUntilReady: true`, the
   matching container stays hidden because its ready marker is never set.
3. **`hideUntilReady` without `splitTextStyle`** — there is no FOUC protection,
   so unsplit text may flash before the animation.
4. **Missing `type`** — the adapter creates a lazy result but reads no getter, so
   no `.split-*` spans are created.
5. **Wrong `container` scope** — `querySelectorAll` searches descendants of the
   keyed `root`; it cannot match `root` itself. If content is inserted only after
   connect, reconnect so the plugin can process it.
6. **Wrong `.split-*` selector** — the effect resolves zero targets.
7. **`type: 'lines'` without `autoSplit`** — line wrappers do not update after
   width or initial font-layout changes.
8. **Long per-character copy** — N characters create N animation targets; prefer
   word splitting for longer passages and keep the accessibility defaults.

`@wix/interact-validate` treats `$` fields as opaque, so it does not validate
`container`, `type`, or other plugin-specific values. TypeScript augmentation
provides static checking. At runtime, an invalid `container` selector throws a
`DOMException`, and multi-type splitting with explicit `nested: 'preserve'` or a
numeric nesting depth throws an error.
