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

// Animate with any library
animate(chars, { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0)'], stagger: 0.03 });
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

## API

### `splitText(target, options?)`

| Parameter | Type                    | Description               |
| --------- | ----------------------- | ------------------------- |
| `target`  | `string \| HTMLElement` | CSS selector or element   |
| `options` | `SplitTextOptions`      | Configuration (see below) |

Returns a `SplitTextResult` with lazy getters: `.chars`, `.words`, `.lines`, `.sentences`.

### Options

| Option             | Type                                                 | Default      | Description                                       |
| ------------------ | ---------------------------------------------------- | ------------ | ------------------------------------------------- |
| `type`             | `SplitType \| SplitType[]`                           | —            | Split eagerly on call instead of lazily           |
| `wrapperClass`     | `string \| WrapperClassConfig`                       | —            | Extra CSS class(es) on wrapper spans              |
| `wrapperStyle`     | `Partial<CSSStyleDeclaration> \| WrapperStyleConfig` | —            | Inline styles on wrapper spans                    |
| `wrapperAttrs`     | `Record<string, string> \| WrapperAttrsConfig`       | —            | Custom attributes on wrapper spans                |
| `contentAttribute` | `'none' \| 'both' \| 'attribute-only'`               | `'both'`     | Controls `data-content` on char/word wrappers     |
| `aria`             | `'auto' \| 'none'`                                   | `'auto'`     | ARIA handling mode                                |
| `preserveText`     | `boolean`                                            | `true`       | Insert visually-hidden original text for a11y/SEO |
| `partIndexing`     | `boolean`                                            | `true`       | Set `--char-index` / `--word-index` etc. on spans |
| `wordGlue`         | `'adjacent' \| 'none'`                               | `'adjacent'` | Glue punctuation to words, or wrap it separately  |
| `autoSplit`        | `boolean`                                            | —            | Re-split on resize / font load                    |
| `onSplit`          | `(result) => void`                                   | —            | Callback after each split                         |
| `segmenter`        | `Intl.Segmenter \| constructor`                      | —            | Polyfill for `Intl.Segmenter`                     |
| `ignore`           | `string[] \| (node) => boolean`                      | —            | Selectors / predicate to skip nodes               |

### Default CSS classes

| Split type  | Class      |
| ----------- | ---------- |
| `chars`     | `.split-c` |
| `words`     | `.split-w` |
| `lines`     | `.split-l` |
| `sentences` | `.split-s` |

Base styles (`display: inline-block`, etc.) are injected once via `adoptedStyleSheets`.

## Accessibility

With defaults (`aria: 'auto'`, `preserveText: true`), the DOM looks like:

```html
<h1>
  <span class="sr-only">Original text</span>
  <div aria-hidden="true" data-splittext-wrapper>
    <span class="split-c" data-content="H">H</span>
    <!-- … -->
  </div>
</h1>
```

Screen readers and crawlers see the original text; the split spans are hidden from the accessibility tree.

## License

[MIT](https://github.com/wix/interact/blob/master/LICENSE)
