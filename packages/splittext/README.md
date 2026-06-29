# @wix/splittext

Lightweight, accessible text splitting utility for creating staggered animations on characters, words, lines, and sentences.

[![npm version](https://img.shields.io/npm/v/@wix/splittext)](https://www.npmjs.com/package/@wix/splittext)
[![license](https://img.shields.io/npm/l/@wix/splittext)](https://github.com/wix/interact/blob/master/LICENSE)

## Features

- **Split by chars, words, lines, or sentences** — each piece wrapped in an animatable `<span>`
- **Locale-aware segmentation** — uses `Intl.Segmenter` (handles emoji, unicode, grapheme clusters)
- **Range API line detection** — accurate line breaks from browser rendering, no pre-wrapping required
- **Lazy evaluation** — DOM is only mutated when a result getter is first accessed
- **Accessible by default** — original text preserved for screen readers and SEO
- **Customizable wrappers** — add classes, inline styles, and data attributes per split type
- **CSS stagger hooks** — `--char-index`, `--word-index`, etc. set automatically on every span
- **React hook** — `useSplitText` with automatic cleanup on unmount
- **Responsive** — optional `autoSplit` re-splits on resize and font load
- **Revertible** — restore the original DOM at any time with `result.revert()`

## Installation

```bash
npm install @wix/splittext
```

**Browser requirement:** `Intl.Segmenter` (Chrome 87+, Safari 14.1+, Firefox 125+). For older environments supply a polyfill via the `segmenter` option.

## Quick Start

```typescript
import { splitText } from '@wix/splittext';

// Lazy — DOM unchanged until getter accessed
const result = splitText('.headline');
const chars = result.chars; // DOM split into chars here, cached

// Eager — split immediately on call
const { chars } = splitText('.headline', { type: 'chars' });

// Animate with the Web Animations API
chars.forEach((char, index) => {
  char.animate(
    { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0)'] },
    { duration: 400, delay: index * 30, fill: 'forwards' },
  );
});
```

When `type` is an array of two or more values, a **nested** DOM tree is built (coarse → fine), e.g. words containing chars. Array order is normalized automatically (`lines → sentences → words → chars`). Multi-type splits require `nested: 'flatten'`.

```typescript
// Words containing chars — order in the array does not matter
splitText('.headline', {
  nested: 'flatten',
  type: ['chars', 'words'],
});
```

### Staggered CSS animation

```typescript
splitText('.headline', {
  type: 'chars',
  wrapperClass: 'char',
});
```

```css
.char {
  opacity: 0;
  animation: fadeUp 0.4s ease forwards;
  animation-delay: calc(var(--char-index) * 0.04s);
}
@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### React

`useSplitText` returns `null` on the first render and during SSR because the ref is not attached yet. After mount it returns a `SplitTextResult`; the element is automatically reverted on unmount. Memoize function-valued options (`bidiResolver`, `onSplit`, `segmenter`, `ignore`) with `useCallback`/`useMemo` to avoid re-splitting on every render.

```tsx
import { useRef, useEffect } from 'react';
import { useSplitText } from '@wix/splittext/react';

function Headline() {
  const ref = useRef<HTMLHeadingElement>(null);
  const result = useSplitText(ref, { type: 'chars' });

  useEffect(() => {
    if (!result) return;
    // animate result.chars …
  }, [result]);

  return <h1 ref={ref}>Hello World</h1>;
}
```

## Use with @wix/interact

The `@wix/splittext/interact` entry point exposes a resolver that lets you wire
splitting declaratively into [`@wix/interact`](https://www.npmjs.com/package/@wix/interact)
configs. Register it once, before creating interactions:

```ts
import { Interact } from '@wix/interact';
import { splitTextResolver } from '@wix/splittext/interact';

Interact.use('splitText', splitTextResolver);
Interact.create(config);
```

With the resolver registered, any `splitText` block in your config splits the
target element's text into wrapper spans **before** Interact resolves animation
targets, so the generated `.split-c` / `.split-w` / `.split-l` / `.split-s`
spans become animatable targets:

```ts
const config = {
  interactions: [
    {
      trigger: 'viewEnter',
      key: 'hero',
      // split the heading into characters on connect …
      splitText: { container: '.headline', type: 'chars', hide: true },
      // … then stagger an entrance across the generated spans
      effects: [{ key: 'hero', selector: '.split-c', effectId: 'fade-in' }],
    },
  ],
  effects: {
    'fade-in': { namedEffect: { type: 'FadeIn' }, duration: 400 },
  },
};
```

`hide: true` opts into the FOUC guard: the container is hidden (via the
`data-text-split` attribute + a generated CSS rule) until splitting completes.
On disconnect the resolver reverts the container to its original content.

> This entry point has a **type-only** dependency on `@wix/interact`; it adds
> no interact code to your runtime bundle. The full config surface
> (`SplitTextConfig`, levels, the `hide` SSR contract) is documented in the
> `@wix/interact` README.

## API

### `splitText(target, options?)`

| Parameter | Type                    | Description               |
| --------- | ----------------------- | ------------------------- |
| `target`  | `string \| HTMLElement` | CSS selector or element   |
| `options` | `SplitTextOptions`      | Configuration (see below) |

Returns a `SplitTextResult` with lazy getters: `.chars`, `.words`, `.lines`, `.sentences`.

### Options

| Option             | Type                                                                                 | Default      | Description                                                               |
| ------------------ | ------------------------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------- |
| `type`             | `'chars' \| 'words' \| 'lines' \| 'sentences'` or array of those                     | —            | Split eagerly on call instead of lazily                                   |
| `wrapperClass`     | `string` or `{ chars?: string, words?: string, lines?: string, sentences?: string }` | —            | Extra CSS class(es) on wrapper spans                                      |
| `wrapperStyle`     | CSS style object or `{ chars?, words?, lines?, sentences? }` per-type partial styles | —            | Inline styles on wrapper spans                                            |
| `wrapperAttrs`     | `Record<string, string>` or `{ chars?, words?, lines?, sentences? }` per-type attrs  | —            | Custom attributes on wrapper spans                                        |
| `contentAttribute` | `'none' \| 'both' \| 'attribute-only'`                                               | `'both'`     | `both`: text content and `data-content`; `attribute-only`: attribute only |
| `aria`             | `'auto' \| 'none'`                                                                   | `'auto'`     | ARIA handling mode                                                        |
| `preserveText`     | `boolean`                                                                            | `true`       | Insert visually-hidden original text for a11y/SEO                         |
| `partIndexing`     | `boolean`                                                                            | `true`       | Set `--char-index` / `--word-index` etc. on spans                         |
| `wordGlue`         | `'adjacent' \| 'none'`                                                               | `'adjacent'` | Glue punctuation to words, or wrap it separately                          |
| `nested`           | `'flatten' \| 'preserve' \| number`                                                  | `'preserve'` | How inner DOM structure is handled                                        |
| `autoSplit`        | `boolean`                                                                            | `false`      | Re-split on resize / font load                                            |
| `onSplit`          | `(result) => void`                                                                   | —            | Callback after each split                                                 |
| `segmenter`        | `Intl.Segmenter` or constructor                                                      | —            | Polyfill for `Intl.Segmenter`                                             |
| `ignore`           | CSS selector string or `(node) => boolean`                                           | —            | Skip matching elements during traversal (selector uses native OR via `,`) |

### Default CSS classes

Every wrapper `<span>` automatically receives a built-in class in addition to any `wrapperClass` you pass:

| Split type  | Class added automatically |
| ----------- | ------------------------- |
| `chars`     | `.split-c`                |
| `words`     | `.split-w`                |
| `lines`     | `.split-l`                |
| `sentences` | `.split-s`                |

Base styles (`display: inline-block`, etc.) are injected once via `adoptedStyleSheets`.

## Accessibility

With defaults (`aria: 'auto'`, `preserveText: true`), split content is wrapped in an `aria-hidden` inner div and a screen-reader-accessible copy of the original text is injected as a sibling:

```html
<h1>
  <span class="sr-only" data-splittext-sr>Original text</span>
  <div aria-hidden="true" data-splittext-wrapper>
    <span class="split-c" data-content="H">H</span>
    <!-- … -->
  </div>
</h1>
```

When `preserveText` is `false`, `aria-label` is set on the container instead of injecting the visually-hidden span. With `aria: 'none'`, no ARIA attributes are added — a transparent wrapper div is still used so callers have a consistent element to append split spans to.

Screen readers and crawlers see the original text; the split spans are hidden from the accessibility tree. `result.revert()` restores `originalHTML` captured at construction time. On re-split (`autoSplit`), plain text is re-read from the element so content changes are picked up.

## License

[MIT](https://github.com/wix/interact/blob/master/LICENSE)
