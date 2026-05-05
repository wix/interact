---
name: Text Splitter Package
overview: Add a new `@wix/splittext` package to the interact monorepo that provides a lightweight, accessible text splitting utility for creating staggered animations on characters, words, and lines.
todos:
  - id: pkg-setup
    content: Create package directory structure, package.json, tsconfig, vite.config
    status: pending
  - id: types
    content: Define TypeScript interfaces for options and result types
    status: pending
    dependencies:
      - pkg-setup
  - id: line-detection
    content: Implement Range API-based line detection (lineDetection.ts)
    status: pending
    dependencies:
      - types
  - id: core-split
    content: Implement core splitText function with chars/words/lines splitting
    status: pending
    dependencies:
      - types
      - line-detection
      - wrapper-spans
  - id: accessibility
    content: Add ARIA attribute handling for screen reader support
    status: pending
    dependencies:
      - core-split
  - id: wrapper-spans
    content: Implement customizable span wrapper creation with class/style/attrs options
    status: pending
    dependencies:
      - types
  - id: autosplit
    content: Add responsive autoSplit with resize/font-load observers
    status: pending
    dependencies:
      - core-split
  - id: react-hook
    content: Create useSplitText React hook with proper cleanup
    status: pending
    dependencies:
      - core-split
  - id: tests
    content: Write comprehensive test suite for all features
    status: pending
    dependencies:
      - core-split
      - accessibility
      - autosplit
      - react-hook
  - id: docs
    content: Create documentation following interact package structure
    status: pending
    dependencies:
      - tests
isProject: false
---

# Text Splitting Package Plan

## Overview

Create a new `@wix/splittext` package within the `packages/` directory that exports a functional API for splitting text into animatable parts (characters, words, lines, sentences). The package will be framework-agnostic with optional React bindings.

**Browser requirement:** This package uses `Intl.Segmenter` for locale-aware text segmentation (95%+ global support: Chrome 87+, Safari 14.1+, Firefox 125+). For environments without native support, a polyfill can be provided via the `segmenter` option (see **Segmenter Polyfill API** section).

## Key Design Decisions

The API will have:

- **Functional approach**: Export a `splitText()` function rather than a class-based API
- **Return arrays**: Return `{ chars, words, lines, sentences }` arrays of `HTMLSpanElement` for direct use with animation libraries
- **Customizable `<span>` wrappers**: All split items wrapped in `<span>` tags with configurable classes, styles, and attributes for styling and animation
- **Lazy evaluation with caching**: Split types are computed on-demand when accessed, not eagerly on invocation
- **Eager split when `type` provided**: If `type` option is specified, only those types are split immediately
- **Accessibility by default**: Split content wrapped in an inner `aria-hidden` div; original text preserved via visually-hidden span (see Accessibility and SEO sections)
- **Revertible**: Include a `revert()` method to restore original content
- **Responsive support**: Optional `autoSplit` mode that re-splits on resize/font-load
- `Intl.Segmenter` API for locale-sensitive text segmentation to split on meaningful items (graphemes, words or sentences) in a string
- **Range API for line detection**: Use `Range.getClientRects()` to detect line breaks from text nodes _before_ DOM manipulation, avoiding unnecessary wrapper creation during measurement

## Package Structure

```javascript
packages/splittext/
├── src/
│   ├── index.ts              # Main entry point
│   ├── splitText.ts          # Core splitting logic
│   ├── lineDetection.ts      # Range API-based line detection
│   ├── wrappers.ts           # Span wrapper creation & customization
│   ├── types.ts              # TypeScript interfaces
│   ├── utils.ts              # Helper functions
│   ├── accessibility.ts      # ARIA handling
│   └── react/
│       ├── index.ts          # React entry
│       └── useSplitText.ts   # React hook
├── test/
│   ├── splitText.e2e.ts      # E2E tests
│   ├── splitText.spec.ts     # Unit tests
│   └── react.spec.tsx        # React hook tests
├── docs/
│   ├── README.md             # Overview
│   ├── api/
│   │   ├── splitText.md      # Function API
│   │   └── types.md          # Type definitions (incl. wrapper config types)
│   ├── guides/
│   │   ├── getting-started.md
│   │   ├── accessibility.md
│   │   └── styling-wrappers.md  # Wrapper customization guide
│   └── examples/
│       ├── animations.md        # Animation library examples
│       └── css-animations.md    # CSS-only animation examples
├── README.md
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── vite.config.ts
└── vitest.config.ts
```

## API Design

### Core Function

```typescript
function splitText(target: string | HTMLElement, options?: SplitTextOptions): SplitTextResult;
```

### Types (`[packages/splittext/src/types.ts](packages/splittext/src/types.ts)`)

```typescript
interface SplitTextOptions {
  // What to split
  type?: 'chars' | 'words' | 'lines' | 'sentences' | ('chars' | 'words' | 'lines' | 'sentences')[];

  // Wrapper customization for styling/animation
  wrapperClass?: string | WrapperClassConfig;  // CSS class(es) for wrapper spans
  wrapperStyle?: Partial<CSSStyleDeclaration> | WrapperStyleConfig;  // Inline styles
  wrapperAttrs?: Record<string, string> | WrapperAttrsConfig;  // Custom attributes (data-*, etc.)
  contentAttribute?: 'none' | 'both' | 'attribute-only';  // default: 'both' - controls data-content on char/word wrappers

  // Accessibility
  aria?: 'auto' | 'none';  // default: 'auto'

  // SEO and a11y
  preserveText?: boolean;  // default: true - visually-hidden duplicate for SEO and screen readers

  // DOM structure
  nested?: 'flatten' | 'preserve' | number;  // default: 'preserve'

  // Text segmentation polyfill (optional — see "Segmenter Polyfill API" section)
  segmenter?: Intl.Segmenter | { new(locale: string, options: { granularity: string }): Intl.Segmenter };

  // BiDi (optional external plugin — see "BiDi Plugin API" section)
  bidiResolver?: (text: string) => Array<{ text: string; direction: 'ltr' | 'rtl' }>;

  // Responsive re-splitting
  autoSplit?: boolean;
  onSplit?: (result: SplitTextResult) => Animation | void;

  // Indexing - set CSS custom properties (--char-index, --word-index, etc.) on each wrapper
  partIndexing?: boolean;  // default: true

  // Advanced
  ignore?: string[] | ((node: Node) => boolean);  // selectors to skip or predicate (e.g., ['sup', 'sub'])
}

// Per-type wrapper configuration
interface WrapperClassConfig {
  chars?: string;
  words?: string;
  lines?: string;
  sentences?: string;
}

interface WrapperStyleConfig {
  chars?: Partial<CSSStyleDeclaration>;
  words?: Partial<CSSStyleDeclaration>;
  lines?: Partial<CSSStyleDeclaration>;
  sentences?: Partial<CSSStyleDeclaration>;
}

interface WrapperAttrsConfig {
  chars?: Record<string, string>;
  words?: Record<string, string>;
  lines?: Record<string, string>;
  sentences?: Record<string, string>;
}

interface SplitTextResult {
  // Lazy getters - split on first access, return cached on subsequent access
  // Each element is a <span> wrapper that can be styled/animated
  get chars: HTMLSpanElement[];      // Splits into characters on first access
  get words: HTMLSpanElement[];      // Splits into words on first access
  get lines: HTMLSpanElement[];      // Splits into lines on first access (note: triggers layout queries)
  get sentences: HTMLSpanElement[];  // Splits into sentences on first access

  // Methods
  revert(): void;
  split(options?: SplitTextOptions): SplitTextResult;

  // Original content
  readonly originalHTML: string;
  readonly element: HTMLElement;
  readonly isSplit: boolean;
}
```

### React Hook

```typescript
function useSplitText(
  ref: RefObject<HTMLElement>,
  options?: SplitTextOptions,
): SplitTextResult | null;
```

## Implementation Plan

### Phase 1: Core Package Infrastructure

1. Create package directory structure
2. Set up `[package.json](packages/splittext/package.json)` following existing conventions:

- Name: `@wix/splittext`
- Dual CJS/ESM exports
- React as optional peer dependency

1. Configure TypeScript, Vite, and Vitest matching [interact package](packages/interact/package.json)

### Phase 2: Core Splitting Logic

Key files to implement:

1. `src/splitText.ts` - Main function:

- Parse target (CSS selector or element)
- **Use Range API for line detection** (see Key Implementation Details)
- Extract text content preserving structure
- Use `Intl.Segmenter` API for locale-sensitive text splitting on meaningful items (chars, words, sentences)
- Create wrapper spans with appropriate classes after detection

1. `src/lineDetection.ts` - Range-based line detection:

- `detectLines(element)` - Main detection function using Range API
- `detectLinesFromTextNode(textNode)` - Per-node detection with `getClientRects()`
- Handle Safari whitespace normalization
- Support for nested elements via TreeWalker

1. `src/accessibility.ts`:

- When `aria: 'auto'` and `preserveText` is true: insert a visually-hidden `<span>` with the original text as a direct child of the container (exposed to AT and crawlers). Wrap all split content in an inner `<div aria-hidden="true" data-splittext-wrapper>` with `display: contents` (via base CSS) so it doesn't affect layout. Assistive tech ignores the visual split spans while the original text remains accessible.
- When `aria: 'auto'` and `preserveText` is false: set `aria-label` with the original text on the container and wrap split content in an inner `<div aria-hidden="true" data-splittext-wrapper>` with `display: contents`.
- When `aria: 'none'`: no ARIA changes, no wrapper div.

1. `src/utils.ts`:

- Text segmentation (handle emoji, unicode)
- DOM manipulation helpers
- Resize/font-load observers for autoSplit

### Phase 3: React Integration

1. `src/react/useSplitText.ts`:

- Hook that wraps core function
- Handle cleanup on unmount
- Support autoSplit with effect dependencies

### Phase 4: Testing

Test coverage for:

- Basic splitting (chars, words, lines, sentences)
- Various text content (emoji, unicode, mixed, RTL)
- Nested elements handling
- Accessibility attributes
- Revert functionality
- AutoSplit behavior
- React hook lifecycle
- **Lazy evaluation**: Verify no DOM changes until getter accessed
- **Caching**: Verify same array reference returned on repeated access
- **Eager split with `type`**: Verify immediate DOM changes when type provided
- **Cache invalidation**: Verify cache cleared on `revert()` and `autoSplit` resize
- Use Playwright for E2E testing all APIs that depend on DOM APIs

**Wrapper customization tests:**

- **Default wrapper classes**: Verify `split-c`, `split-w`, etc. are applied
- **Custom wrapperClass (string)**: Verify single class applied to all wrappers
- **Custom wrapperClass (config)**: Verify per-type classes applied correctly
- **Multiple classes**: Verify space-separated classes all applied
- **wrapperStyle (global)**: Verify inline styles applied to all wrapper spans
- **wrapperStyle (per-type)**: Verify different styles for chars vs words vs lines
- **wrapperAttrs**: Verify custom data attributes and other attributes applied
- **contentAttribute**: Verify char/word wrappers `data-content` modes renders the correct html (`none`, `both`, `attribute-only`)
- **CSS custom property indexing**: Verify each wrapper has correct `--char-index` / `--word-index` / etc. for animation sequencing
- **partIndexing: false**: Verify no CSS custom properties set when indexing disabled
- **Combined options**: Verify class + style + attrs work together
- **Inline-block for transforms**: Verify transforms work when display: inline-block set
- **Revert cleans wrappers**: Verify all span wrappers removed on revert()
- **Re-split preserves options**: Verify wrapper options reapplied on autoSplit resize

**E2E wrapper animation tests** → `test/splitText.e2e.ts` (Playwright):

```typescript
test('wrapper spans are animatable with CSS transitions', async ({ page }) => {
  await page.setContent(`<h1 class="title">Hello</h1>`);
  await page.addStyleTag({
    content: `
      .char-animate {
        display: inline-block;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .char-animate.visible { opacity: 1; }
    `,
  });

  await page.evaluate(() => {
    const { chars } = splitText('.title', {
      type: 'chars',
      wrapperClass: 'char-animate',
      wrapperStyle: { display: 'inline-block' },
    });

    // Trigger animation
    chars.forEach((char) => char.classList.add('visible'));
  });

  // Verify opacity transition occurred
  const opacity = await page
    .locator('.char-animate')
    .first()
    .evaluate((el) => {
      return getComputedStyle(el).opacity;
    });
  expect(opacity).toBe('1');
});

test('wrapper spans support transform animations', async ({ page }) => {
  await page.setContent(`<h1 class="title">Test</h1>`);

  await page.evaluate(() => {
    const { chars } = splitText('.title', {
      type: 'chars',
      wrapperStyle: {
        display: 'inline-block',
        transform: 'translateY(20px)',
      },
    });
  });

  const transform = await page
    .locator('.split-c')
    .first()
    .evaluate((el) => {
      return getComputedStyle(el).transform;
    });
  expect(transform).toContain('matrix'); // translateY creates a matrix
});

test('CSS custom properties enable staggered animations', async ({ page }) => {
  await page.setContent(`<p>Hello World</p>`);

  const indices = await page.evaluate(() => {
    const { words } = splitText('p', { type: 'words' });
    return words.map((w) => w.style.getPropertyValue('--word-index'));
  });

  expect(indices).toEqual(['0', '1']);
});
```

**Safari whitespace normalization test** → `test/splitText.e2e.ts` (Playwright, run on WebKit):

```typescript
test('Safari: getClientRects line detection requires whitespace normalization', async ({
  page,
}) => {
  await page.setContent(`
    <p class="sample" style="width: 300px;">
      Hello    world    with     extra    spaces
      and
      newlines    that    collapse
    </p>
  `);

  const { withoutNorm, withNorm } = await page.evaluate(() => {
    function detectLineCount(textNode) {
      const text = textNode.textContent;
      const range = document.createRange();
      let maxLineIndex = 0;
      for (let i = 0; i < text.length; i++) {
        range.setStart(textNode, 0);
        range.setEnd(textNode, i + 1);
        maxLineIndex = Math.max(maxLineIndex, range.getClientRects().length - 1);
      }
      return maxLineIndex + 1;
    }

    const el = document.querySelector('.sample');
    const originalContent = el.firstChild!.textContent!;

    // Without normalization (raw markup whitespace)
    const withoutNorm = detectLineCount(el.firstChild as Text);

    // With normalization (collapsed whitespace)
    el.firstChild!.textContent = originalContent.trim().replace(/\s+/g, ' ');
    const withNorm = detectLineCount(el.firstChild as Text);

    el.firstChild!.textContent = originalContent;
    return { withoutNorm, withNorm };
  });

  // Without normalization, Safari detects one "line" per whitespace-separated word (9 words = 9 "lines").
  // This test documents the quirk; the implementation must always normalize.
  expect(withoutNorm).toBe(9);
  expect(withNorm).toBe(2);
});
```

### Phase 5: Documentation

Following the [interact docs structure](packages/interact/docs/README.md):

- API reference with TypeScript signatures
- Getting started guide
- Accessibility guide
- Animation examples with `@wix/motion`

**Additional documentation for wrapper customization:**

1. `docs/api/types.md` - Update with wrapper option types:

- `WrapperClassConfig` interface documentation
- `WrapperStyleConfig` interface documentation
- `WrapperAttrsConfig` interface documentation
- Explanation of global vs per-type configuration

1. `docs/guides/styling-wrappers.md` - New guide covering:

- Default CSS classes (`split-c`, `split-w`, etc.)
- Customizing wrapper classes
- Applying inline styles for animation setup
- Using `data-content` with `::before` / `::after` duplicated text effects
- Using CSS custom property indexing for animation hooks
- Best practices for `display: inline-block` with transforms
- CSS custom properties for staggered animations

1. `docs/examples/animations.md` - Expanded with wrapper examples:

- **Fade-in character animation** using wrapperClass + CSS
- **Slide-up word reveal** using wrapperStyle initial state
- **Duplicate text reveal** using `contentAttribute: 'both'` and `content: attr(data-content)` animated vertically inside a clipped container to create a slot-machine / rolling-clock effect
- **Staggered line animation** using CSS custom property indexing (`--line-index`)
- **@wix/motion integration** with custom wrapper classes
- **CSS-only animations** using @keyframes and animation-delay
- **Intersection Observer** trigger with wrapper data attributes

1. `docs/examples/css-animations.md` - New CSS-focused examples:

```css
/* Typewriter effect using staggered animation-delay via --char-index custom property */
.split-c {
  opacity: 0;
  animation: typewriter 0.1s ease forwards;
  animation-delay: calc(var(--char-index) * 0.1s);
}

@keyframes typewriter {
  to {
    opacity: 1;
  }
}
```

1. `README.md` - Quick start section update:

```typescript
// Split with wrapper options, then animate
const { chars } = splitText('.headline', {
  type: 'chars',
  wrapperClass: 'animate-char',
  wrapperStyle: { opacity: '0', transform: 'translateY(10px)' },
});
animate(chars, { opacity: 1, transform: 'translateY(0)', stagger: 0.03 });
```

## Integration Example

```typescript
import { splitText } from '@wix/splittext';

// Example 1: Lazy evaluation - no splitting happens yet
const result = splitText('.headline');

// Splitting happens on first access, result is cached
const chars = result.chars; // Splits into chars NOW, caches result
const chars2 = result.chars; // Returns cached result (no re-split)

// Example 2: Eager split with type option
const eagerResult = splitText('.headline', { type: 'words' });
// Words are split immediately on invocation

// Example 3: Multiple types eager
const multiResult = splitText('.headline', { type: ['chars', 'words'] });
// Both chars and words split immediately

// Example 4: With animation library
const { chars: titleChars } = splitText('.title', { type: 'chars' });
animate(titleChars, { opacity: [0, 1], stagger: 0.05 });
```

## Key Implementation Details

### Span Wrapper Creation & Customization

All split items are wrapped in `<span>` elements to enable styling and animation. The wrapper spans are fully customizable through options.

**Content attribute option:**

- Option: `contentAttribute`
- Values: `'none' | 'both' | 'attribute-only'`
- DOM attribute: `data-content`

`contentAttribute` controls how character and word wrappers expose their text for CSS-generated content effects:

- `'none'`: render normal text content only; do not set `data-content`.
- `'both'` (default): render normal text content and mirror it to `data-content`.
- `'attribute-only'`: set `data-content` and leave the wrapper's text content empty, for effects that render visible text only through `::before` / `::after`.

This enables CSS patterns such as:

```css
.split-c::before,
.split-c::after {
  content: attr(data-content);
}
```

**Default wrapper structure:**

```html
<!-- Characters -->
<span class="split-c" data-content="H">H</span>
<span class="split-c" data-content="e">e</span>
<span class="split-c" data-content="l">l</span>
<span class="split-c" data-content="l">l</span>
<span class="split-c" data-content="o">o</span>

<!-- Words -->
<span class="split-w" data-content="Hello">Hello</span>
<span class="split-w" data-content="World">World</span>

<!-- Lines -->
<span class="split-l">Hello World, this is</span>
<span class="split-l">the second line</span>

<!-- Sentences -->
<span class="split-s">Hello World.</span>
<span class="split-s">This is another sentence.</span>
```

**Wrapper creation implementation** → `src/wrappers.ts`:

```typescript
type SplitType = 'chars' | 'words' | 'lines' | 'sentences';

function createWrapper(
  content: string | Node,
  type: SplitType,
  index: number,
  options: SplitTextOptions,
): HTMLSpanElement {
  const span = document.createElement('span');

  // Apply default class
  span.classList.add(`split-${type[0]}`); // 'chars' -> 'split-c'

  // Apply custom classes
  const customClass = resolveWrapperOption(options.wrapperClass, type);
  if (customClass) {
    span.classList.add(...customClass.split(' ').filter(Boolean));
  }

  // Apply custom styles
  const customStyle = resolveWrapperOption(options.wrapperStyle, type);
  if (customStyle) {
    Object.assign(span.style, customStyle);
  }

  // Apply custom attributes
  const customAttrs = resolveWrapperOption(options.wrapperAttrs, type);
  if (customAttrs) {
    for (const [key, value] of Object.entries(customAttrs)) {
      span.setAttribute(key, value);
    }
  }

  // Set CSS custom property for animation sequencing (when setIndex is true, which is the default)
  // Uses long-form names: --char-index, --word-index, --line-index, --sentence-index
  if (options.partIndexing !== false) {
    const indexProp = `--${type === 'chars' ? 'char' : type === 'words' ? 'word' : type === 'lines' ? 'line' : 'sentence'}-index`;
    span.style.setProperty(indexProp, String(index));
  }

  // Mirror char/word content into data-content for CSS generated-content effects.
  const contentAttribute = options.contentAttribute ?? 'both';
  const canUseContentAttribute = type === 'chars' || type === 'words';
  if (typeof content === 'string' && canUseContentAttribute && contentAttribute !== 'none') {
    span.setAttribute('data-content', content);
  }
  const shouldUseAttributeOnly =
    typeof content === 'string' && canUseContentAttribute && contentAttribute === 'attribute-only';

  // Set content
  if (typeof content === 'string' && !shouldUseAttributeOnly) {
    span.textContent = content;
  } else if (typeof content !== 'string') {
    span.appendChild(content);
  }

  return span;
}

// Helper to resolve per-type or global config
function resolveWrapperOption<T>(
  option: T | Record<SplitType, T> | undefined,
  type: SplitType,
): T | undefined {
  if (!option) return undefined;
  if (typeof option === 'object' && type in option) {
    return (option as Record<SplitType, T>)[type];
  }
  return option as T;
}
```

### Base CSS Strategy

The package injects a global base stylesheet once per document via `adoptedStyleSheets`. This is not a per-split option — the styles are injected automatically on first use and deduplicated. Using `adoptedStyleSheets` avoids adding `<style>` tags to the document and works well in shadow DOM contexts.

**Required base styles:**

- `.split-c`, `.split-w`: `display: inline-block; white-space: pre;` — enables transforms and preserves space width.
- `.split-l`: `display: block;`
- `.split-s`: same inline-block treatment as chars/words if needed for animation.
- `[aria-hidden="true"][data-splittext-wrapper]`: `display: contents;` — the inner aria-hidden wrapper must not introduce a new box in the layout.
- `.sr-only`: `position: absolute; width: 1px; height: 1px; overflow: clip;` — visually-hidden pattern for the preserved original text (used when `preserveText: true`).

**Documentation note (shaped languages):** Arabic and Arabic-like joining scripts can lose shaping when split per-character because each letter may lose its positional form (initial/medial/final/isolated). This is a limitation of character-level text splitting for joining scripts, not a blanket rule for every complex script. Recommend per-word splitting for affected scripts. Implementation documentation for this limitation should reference the demo CodePen: <https://codepen.io/tombigel/pen/pvNzJoZ>. Font-level shaping (e.g. via HarfBuzz) is out of scope for this library.

### Accessibility

DOM structure when `aria: 'auto'` and `preserveText: true` (defaults):

```html
<container>
  <span class="sr-only">Original text (visually hidden, exposed to AT & crawlers)</span>
  <div aria-hidden="true" data-splittext-wrapper style="display: contents;">
    <span class="split-c">H</span>
    <span class="split-c">e</span>
    <!-- ...split wrapper spans... -->
  </div>
</container>
```

- `aria: 'auto'` (default): Wrap all split content in an inner `<div aria-hidden="true" data-splittext-wrapper>` with `display: contents` (via base CSS) so it doesn't affect layout. The container itself remains accessible. When `preserveText` is true, the visually-hidden `<span>` with the original text sits as a sibling alongside the inner div, exposed to screen readers and crawlers. When `preserveText` is false, set `aria-label` with the original text on the container instead.
- `aria: 'none'`: No ARIA changes, no inner wrapper div.

### SEO Considerations

When `preserveText` is true (default), create a visually-hidden duplicate of the original text for both SEO and accessibility:

- Clone the original text content into a `<span>` with the visually-hidden pattern: `position: absolute; width: 1px; height: 1px; overflow: clip;` (or equivalent sr-only pattern).
- Insert this span as a direct child of the container, alongside the `<div aria-hidden="true">` that wraps the split content.
- The container remains accessible (no `aria-hidden` on it), so the visually-hidden span is exposed to assistive tech and crawlers.
- When `preserveText` is false, do not create the hidden block; use `aria-label` with the original text on the container instead (ARIA is not used by crawlers, so SEO is weaker in this mode).

### Segmenter Polyfill API

The package uses `Intl.Segmenter` for locale-aware text segmentation. When native support is missing, users can provide a polyfill via the `segmenter` option. If neither native `Intl.Segmenter` nor the `segmenter` option is available, throw a clear error with instructions.

**Contract — required API surface:**

The polyfill must implement the `Intl.Segmenter` constructor and instance API. Specifically, the package relies on:

- `new Intl.Segmenter(locale, { granularity })` — constructor accepting a locale string and an options object with `granularity` set to `'grapheme'`, `'word'`, or `'sentence'`.
- `segmenter.segment(text)` — returns an iterable of segments.
- Each segment must have:
  - `segment: string` — the segmented text.
  - `isWordLike: boolean` — (only needed for `granularity: 'word'`) used to filter out whitespace/punctuation-only segments.

**Usage:**

```typescript
// Option A: pass a constructor (used to create segmenters for each granularity)
import { createIntlSegmenterPolyfill } from 'intl-segmenter-polyfill';
const Segmenter = await createIntlSegmenterPolyfill();
splitText('.title', { type: 'chars', segmenter: Segmenter });

// Option B: polyfill the global before calling splitText (no option needed)
import '@formatjs/intl-segmenter/polyfill';
splitText('.title', { type: 'chars' });
```

**Compatible polyfills:**

| Package                    | Approach            | Bundle impact                | Notes                                                        |
| -------------------------- | ------------------- | ---------------------------- | ------------------------------------------------------------ |
| `@formatjs/intl-segmenter` | Pure JS, CLDR rules | ~274 KB (IIFE)               | Patches global `Intl.Segmenter`; zero-config                 |
| `intl-segmenter-polyfill`  | WASM (icu4c)        | Small JS shim + lazy `.wasm` | Smallest runtime cost; returns constructor via async factory |

### BiDi Plugin API

BiDi handling is **entirely external**. The core library does not detect RTL text, validate bidi output, or warn about missing resolvers — all of that is the plugin's responsibility. The core simply provides a hook (`bidiResolver` option) and a contract for how the plugin's output is consumed.

**Contract:** When a `bidiResolver` is provided, the core calls it with the element's flat text content (or, when `nested: 'preserve'`, the inline text content of each block-level container). The resolver returns an array of runs `{ text: string, direction: 'ltr' | 'rtl' }`. The core wraps each run in a `<span dir="ltr|rtl">` (with `.split-rtl` / `.split-ltr` classes) and applies character/word splitting within each run. When no `bidiResolver` is provided, the core splits without any direction-aware wrapping.

**Plugin responsibilities (not part of the core library):**

- **RTL detection:** Determine whether the text contains RTL content (via `getComputedStyle().direction`, Unicode range scanning, or both).
- **Bidi algorithm:** Run the Unicode Bidi Algorithm (e.g. via `bidi-js`) to produce correctly ordered runs with explicit direction per run.
- **Validation:** Ensure the returned runs cover the full input text (concatenation of all `run.text` values equals the original input) and that each `direction` is `'ltr'` or `'rtl'`.
- **Error handling:** Handle malformed input gracefully (e.g. skip resolution if the text has no mixed-direction content).

**Core responsibilities:**

- Call `bidiResolver(text)` before splitting when the option is provided.
- Wrap each returned run in a `<span dir="...">` with appropriate classes.
- Split within each run as normal (chars/words).
- When `bidiResolver` is not provided, split the text as-is with no direction awareness.

Document the plugin API with examples (e.g. using `bidi-js`) in the guides.

### Lazy Evaluation & Caching Strategy

The `SplitTextResult` object uses lazy getters with internal caching to avoid unnecessary DOM operations.

`SplitTextResultImpl` → `src/splitText.ts`:

```typescript
class SplitTextResultImpl implements SplitTextResult {
  private _element: HTMLElement;
  private _originalHTML: string;
  private _options?: SplitTextOptions;
  // Internal cache for split results
  private _cache: {
    chars?: HTMLSpanElement[];
    words?: HTMLSpanElement[];
    lines?: HTMLSpanElement[];
    sentences?: HTMLSpanElement[];
  } = {};

  constructor(element: HTMLElement, options?: SplitTextOptions) {
    this._element = element;
    this._originalHTML = element.innerHTML;
    this._options = options;

    // Eager split if type is provided
    if (options?.type) {
      const types = Array.isArray(options.type) ? options.type : [options.type];
      for (const type of types) {
        this._performSplit(type);
      }
    }
  }

  // Lazy getter - split on first access, return cached thereafter
  get chars(): HTMLSpanElement[] {
    if (!this._cache.chars) {
      this._cache.chars = this._performSplit('chars');
    }
    return this._cache.chars;
  }

  get words(): HTMLSpanElement[] {
    if (!this._cache.words) {
      this._cache.words = this._performSplit('words');
    }
    return this._cache.words;
  }

  get lines(): HTMLSpanElement[] {
    if (!this._cache.lines) {
      this._cache.lines = this._performSplit('lines');
    }
    return this._cache.lines;
  }

  get sentences(): HTMLSpanElement[] {
    if (!this._cache.sentences) {
      this._cache.sentences = this._performSplit('sentences');
    }
    return this._cache.sentences;
  }

  private _performSplit(type: 'chars' | 'words' | 'lines' | 'sentences'): HTMLSpanElement[] {
    // Actual splitting logic - creates wrapper spans in DOM
    // Returns array of created HTMLSpanElements
  }

  revert(): void {
    this._element.innerHTML = this._originalHTML;
    this._cache = {}; // Clear cache on revert
  }
}
```

**Cache invalidation:**

- `revert()` clears the cache
- `autoSplit` on resize clears and re-populates cache for previously accessed types
- Manual `split()` call can force re-split with new options

### Line Detection Algorithm

**Primary Approach: Range API with `getClientRects()`** → `src/lineDetection.ts`

Use the DOM Range API to detect line breaks from text nodes _before_ creating wrapper elements. This avoids unnecessary DOM manipulation and provides accurate line detection based on the browser's actual rendering:

```typescript
function detectLines(textNode: Text): string[] {
  const range = document.createRange();
  const text = textNode.textContent || '';
  const lines: string[][] = [];
  let lineChars: string[] = [];

  // Normalize whitespace (Safari compatibility — see Browser Compatibility)
  textNode.textContent = text.trim().replace(/\s+/g, ' ');

  for (let i = 0; i < text.length; i++) {
    range.setStart(textNode, 0);
    range.setEnd(textNode, i + 1);

    // getClientRects() returns one rect per rendered line
    const lineIndex = range.getClientRects().length - 1;

    if (!lines[lineIndex]) {
      lines.push((lineChars = []));
    }
    lineChars.push(text.charAt(i));
  }

  return lines.map((chars) => chars.join('').trim());
}
```

**Why Range API over offsetTop measurement:**

1. **No pre-wrapping required** - Detect lines from original text nodes
2. **Accurate to browser rendering** - Uses actual layout, not approximated positions
3. **Simpler code path** - Measure first, wrap second
4. **Works before any DOM mutation** - Original text stays intact during detection

**For nested elements** → `src/lineDetection.ts`: Use `TreeWalker` to iterate child text nodes, applying Range detection to each:

```typescript
const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
let node: Text | null;
while ((node = walker.nextNode() as Text)) {
  // Apply Range-based line detection to each text node
}
```

**Re-splitting on resize** → `src/splitText.ts` (`SplitTextResultImpl`): If `autoSplit` is enabled:

1. Track which types have been accessed (are in cache)
2. On resize/font-load, clear cache and re-split only those types
3. Call `onSplit` callback with updated result

```typescript
private _handleResize(): void {
  const accessedTypes = Object.keys(this._cache) as SplitType[];
  this._cache = {}; // Clear cache

  // Re-split only previously accessed types
  for (const type of accessedTypes) {
    this._performSplit(type);
  }

  this._options.onSplit?.(this);
}
```

### Unicode/Emoji Handling & Text Segmentation

Use `Intl.Segmenter` (native or via the `segmenter` option — see **Segmenter Polyfill API**) for all text segmentation (characters, words, sentences). Use granularity `'grapheme'` for characters, `'word'` for words (filter by `isWordLike`), and `'sentence'` for sentences.

### Nested Element Handling

The `nested` option controls how inner DOM structure is handled (default: `'preserve'`).

- `'preserve'` (default): Use `TreeWalker` to traverse the original text nodes before creating split wrappers. Apply line detection (when lines are requested) and splitting per text node while keeping parent element references. This preserves inline structure such as links, bold, and italic text. Use guards: skip non-text/non-element nodes; skip `script`/`style`; enforce a max depth safety limit (e.g. 10 levels).
- `'flatten'`: Extract plain text via `element.textContent`, ignore all inner DOM, and split that string only. Store original `innerHTML` for `revert()`. This is useful for dirty/generated markup where preserving every wrapper would make the split DOM too complex.
- `number`: Same as `'preserve'`, but preserve only the first N element levels. Deeper content is flattened into text inside the nearest preserved parent. Example: with `nested: 2`, `<b>bold <i>italic <u>underlined</u></i></b>` keeps `<b>` and `<i>`, removes `<u>`, and keeps the text as `<b>bold <i>italic underlined</i></b>`.

The `ignore` option can be an array of selectors (e.g. `['sup', 'sub']`) or a predicate `(node: Node) => boolean` to skip nodes during traversal in preserve/number modes.

### Performance Considerations

The Range API approach has O(n) character iteration complexity, but:

1. **Instantaneous for typical text** - Single paragraphs feel instant (per Ben Nadel's testing)
2. **No layout thrashing** - Detection happens before any DOM mutation
3. **Efficient for repeated splits** - `autoSplit` re-detection is fast since original structure is preserved
4. **Consider chunking for very long text** - For 10k+ character blocks, batch processing may help
5. **Line detection is expensive** - Requires O(n) layout queries (see Line Detection); for long text prefer word-level splitting or `autoSplit` rather than frequent line re-detection

### Browser Compatibility

- `Range.getClientRects()` and `Range.getBoundingClientRect()`: Widely supported (all modern browsers).
- **Safari whitespace quirk (confirmed present in Safari 26.2, Feb 2025):** Safari's `getClientRects()` returns rects based on markup whitespace rather than rendered layout — raw spaces/newlines that visually collapse produce extra rects. Whitespace normalization (`text.trim().replace(/\s+/g, ' ')`) must be applied unconditionally in `lineDetection.ts` before any rect-based detection (harmless on other browsers). Originally documented by Ben Nadel (blog #4310); a Playwright regression test is included in Phase 4.
- **Fallback**: For edge cases, the offsetTop-based measurement can serve as fallback.
