# Standalone Functions

The `@wix/interact` package exports standalone functions for managing interactions at the element level: `add()`, `remove()`, and `generate()`. These functions work with any HTML element to apply and remove interactions.

## Import

```typescript
import { add, remove, generate } from '@wix/interact';
```

> **Note**: `add`, `remove`, and `generate` are available from all entry points: `@wix/interact`, `@wix/interact/web`, and `@wix/interact/react`.

## Functions Overview

| Function     | Purpose                                                                          | Parameters                 | Returns  |
| ------------ | -------------------------------------------------------------------------------- | -------------------------- | -------- |
| `add()`      | Add interactions to an element                                                   | `element`, `key?`          | `void`   |
| `remove()`   | Remove interactions from an element                                              | `key`                      | `void`   |
| `generate()` | Generate complete CSS for all animations, transitions, and scroll-driven effects | `config`, `useFirstChild?` | `string` |

---

## `add(element, key?)`

Adds all configured interactions and effects to an element based on its key configuration. This function creates an `InteractionController` internally to manage the element's interactions.

### Signature

```typescript
function add(element: HTMLElement, key?: string): void;
```

### Parameters

**`element: HTMLElement`**

- Any HTML element that should have interactions applied
- Can be an `interact-element` custom element or a regular HTML element
- Should have `data-interact-key` attribute if `key` is not provided

**`key?: string`** (optional)

- The unique identifier for the element in the interaction configuration
- If not provided, the function will use `element.dataset.interactKey`
- Must match a key defined in an `Interact` instance's configuration

### Returns

**`void`** - This function does not return a value. The element's controller is stored in `Interact.controllerCache`.

### Examples

#### Basic Usage

```typescript
import { Interact, add } from '@wix/interact';

// Create interaction configuration
const config = {
  interactions: [
    {
      trigger: 'viewEnter',
      key: 'my-hero',
      effects: [{ effectId: 'fade-in' }],
    },
  ],
  effects: {
    'fade-in': {
      duration: 1000,
      keyframeEffect: {
        name: 'fade-in',
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
      },
    },
  },
};

Interact.create(config);

// Get the element and add interactions
const element = document.querySelector('[data-interact-key="my-hero"]');
if (element) {
  add(element as HTMLElement, 'my-hero');
}
```

#### Using data-interact-key Attribute

```typescript
// When key is stored in the element's data attribute
const element = document.querySelector('[data-interact-key="hero"]');
if (element) {
  // Key is inferred from data-interact-key
  add(element as HTMLElement);
}
```

#### With Regular HTML Elements (React approach)

```tsx
import { add, remove } from '@wix/interact/react';

function MyComponent() {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      add(elementRef.current, 'my-hero');
    }

    return () => {
      if (elementRef.current) {
        remove('my-hero');
      }
    };
  }, []);

  return (
    <div ref={elementRef} data-interact-key="my-hero">
      Content to animate
    </div>
  );
}
```

### Element Requirements:

```html
<!-- ✅ Using interact-element (web approach) -->
<interact-element data-interact-key="my-hero">
  <div class="hero-content">Content to animate</div>
</interact-element>

<!-- ✅ Using regular element (Vanilla/React approach) -->
<div data-interact-key="my-hero">Content to animate</div>

<!-- ❌ Missing data-interact-key (and no key parameter) -->
<div>Content without key</div>
```

### Advanced Usage

#### Programmatic Element Creation

```typescript
import { add } from '@wix/interact';

// Create element programmatically
const container = document.createElement('div');

// add stuff to container...

document.body.appendChild(container);

// Add interactions
add(container, 'dynamic-element');
```

---

## `remove(key)`

Removes all interactions and effects from an element and cleans up associated resources.

### Signature

```typescript
function remove(key: string): void;
```

### Parameters

**`key: string`**

- The unique identifier for the element to remove interactions from
- Should match the key used when interactions were added
- Used to look up the cached controller and its interactions

### Returns

**`void`** - This function does not return a value

### Examples

#### Basic Removal

```typescript
import { remove } from '@wix/interact';

// Remove all interactions from an element
remove('hero');

// The element is no longer interactive and is removed from cache
console.log('Interactions removed for hero');
```

---

## `generate(config, useFirstChild?)`

Generates a complete CSS string from an `InteractConfig`. The output includes `@keyframes`, animation and transition custom properties, view-timeline declarations, state-selector rules, coordinated-list aggregation, and FOUC-prevention initial rules — everything the browser needs to run the configured animations and transitions natively, without waiting for JavaScript.

### Signature

```typescript
function generate(config: InteractConfig, useFirstChild?: boolean): string;
```

### Parameters

**`config: InteractConfig`** - The full interaction configuration. Every interaction in the config is processed — not just `viewEnter`.

**`useFirstChild?: boolean`** - When `true` (the default), generated selectors target the first child of each keyed element (e.g. `[data-interact-key="hero"] > :first-child`). This is the correct mode for `<interact-element>` custom elements. Pass `false` when the keyed element itself is the animation target (vanilla JS or React `<Interaction>`).

### Returns

**`string`** - A CSS string to inject into a `<style>` tag, adopted stylesheet, or inline `<style>` in the document `<head>`.

### What it generates

The output covers every CSS-expressible aspect of the configuration:

- **`@keyframes`** for every `namedEffect` and `keyframeEffect` across all interactions.
- **Animation custom properties** (`--animation-*`, `--animation-composition-*`, `--animation-timeline-*`, `--animation-range-*`) that wire each effect to its target.
- **`view-timeline` declarations** for `viewProgress` triggers, enabling native scroll-driven animations.
- **Transition custom properties** for `StateEffect` CSS transitions.
- **State selector rules** using `:state()`, `:--`, and `[data-interact-effect~=]` for state-driven style overrides.
- **Coordinated-list aggregation rules** that combine animation/transition properties from multiple interactions targeting the same element, using CSS custom properties so they compose rather than override.
- **FOUC-prevention initial rules** for `viewEnter` + `triggerType: 'once'` effects where source and target are the same element — these hide the target with `visibility: hidden` and neutral transform values until the animation starts (gated by `:not([data-interact-enter])`).
- **Condition-gated rules** — `@media` wrappers for media-type conditions, and selector-based conditions appended to the element selector.

### Benefits

- **No DOM element references needed.** The generated CSS uses attribute selectors (`[data-interact-key="..."]`, `:state()`, `[data-interact-effect~="..."]`) rather than JS-managed DOM references. Animations bind reactively as elements appear in the DOM — no `querySelector`, no cached element references, no observer wiring, no cleanup on unmount. This removes entire categories of error-prone JS: stale references, race conditions between element mount and JS initialization, and manual lifecycle management. The browser's style engine handles the binding.
- **Reduced runtime JS.** CSS-expressible animations and transitions run natively on the compositor thread, freeing the main thread. Scroll-driven animations via `view-timeline` are especially beneficial — they run entirely in CSS without any JS scroll listeners.
- **Instant first paint.** When injected in `<head>`, animations are ready before the page content is painted. No waiting for JS to load, parse, and execute.

### Use cases

1. **FOUC prevention** — hide entrance-animated elements (`viewEnter` + `triggerType: 'once'`) until their animation starts.
2. **Pre-rendering scroll-driven animations** — `viewProgress` effects produce `view-timeline` + `animation-timeline` CSS that works before (or without) JS.
3. **Reducing runtime JS overhead** — all CSS-expressible animations run natively; the runtime only handles `customEffect` callbacks and event-trigger wiring.
4. **SSR / static-site generation** — generate CSS at build time or on the server and embed it in the HTML.
5. **Declarative, reference-free animation binding** — no element queries, no reference caching; elements animate simply by having the right `data-interact-key` attribute in the DOM.

### FOUC prevention (viewEnter)

For entrance animations where the source and target are the same element, `generate()` emits an initial rule that hides the element until its animation starts. Inject the generated CSS into `<head>` (preferred) or the beginning of `<body>`.

The initial rule uses `:not([data-interact-enter])` so the element becomes visible once the animation begins. This only applies to `viewEnter` interactions with `triggerType: 'once'` (the default for `viewEnter`)

For any entrance animation, use `fill: 'backwards'` (or `'both'` when the final keyframe must persist). Entrance presets default to `backwards`.

For `triggerType: 'repeat'`/`'alternate'`/`'state'`, manually apply the starting keyframe as inline styles on the target element and use `fill: 'both'`.

**Generated FOUC CSS with `useFirstChild: false`:**

```css
[data-interact-key='hero']:not([data-interact-enter]) {
  visibility: hidden;
  transform: none !important;
  translate: none !important;
  scale: none !important;
  rotate: none !important;
}
```

**Generated FOUC CSS with `useFirstChild: true`:**

```css
[data-interact-key='hero'] > :first-child:not([data-interact-enter]) {
  visibility: hidden;
  transform: none;
  translate: none;
  scale: none;
  rotate: none;
}
```

### Scroll-driven CSS (viewProgress)

For `viewProgress` interactions, `generate()` emits `view-timeline` declarations and `animation-timeline`/`animation-range` custom properties. This produces fully native scroll-driven animations that work before JavaScript loads — the browser drives the animation based on the element's scroll position, with zero JS overhead.

### Examples

#### Entrance animation (viewEnter)

```typescript
import { Interact, generate } from '@wix/interact';

const config = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      effects: [
        {
          keyframeEffect: {
            name: 'fade-in',
            keyframes: [
              { opacity: 0, transform: 'translateY(40px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          duration: 800,
        },
      ],
    },
  ],
  effects: {},
};

const css = generate(config, false);

const styleElement = document.createElement('style');
styleElement.textContent = css;
document.head.appendChild(styleElement);

Interact.create(config);
```

#### Scroll-driven animation (viewProgress)

```typescript
import { generate } from '@wix/interact';

const config = {
  interactions: [
    {
      key: 'parallax-section',
      trigger: 'viewProgress',
      effects: [
        {
          keyframeEffect: {
            name: 'parallax',
            keyframes: [{ transform: 'translateY(50px)' }, { transform: 'translateY(-50px)' }],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
          fill: 'both',
        },
      ],
    },
  ],
  effects: {},
};

const css = generate(config, false);
// Produces @keyframes, view-timeline, animation-timeline, and animation-range CSS
```

#### Mixed config (multiple trigger types)

```typescript
const config = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [
        {
          keyframeEffect: {
            name: 'fade-in',
            keyframes: [{ opacity: 0 }, { opacity: 1 }],
          },
          duration: 800,
        },
      ],
    },
    {
      key: 'card',
      trigger: 'hover',
      effects: [
        {
          keyframeEffect: {
            name: 'lift',
            keyframes: [{ transform: 'translateY(-4px)' }],
          },
          duration: 200,
          fill: 'both',
        },
      ],
    },
    {
      key: 'progress-bar',
      trigger: 'viewProgress',
      effects: [
        {
          keyframeEffect: {
            name: 'fill-bar',
            keyframes: [{ width: '0%' }, { width: '100%' }],
          },
          rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 0 } },
          rangeEnd: { name: 'exit', offset: { unit: 'percentage', value: 100 } },
          fill: 'both',
        },
      ],
    },
  ],
  effects: {},
};

// generate() processes ALL interactions — viewEnter, hover, AND viewProgress
const css = generate(config, false);
```

#### Server-Side Rendering (SSR)

```typescript
// server.ts
import { generate, InteractConfig } from '@wix/interact';

const config: InteractConfig = {
  interactions: [
    /* all your interactions */
  ],
  effects: {},
};

const css = generate(config);

const html = `
<!DOCTYPE html>
<html>
<head>
  <style>${css}</style>
</head>
<body>
  <!-- Animations are ready before JS loads -->
</body>
</html>
`;
```

### HTML Setup

Elements must have `data-interact-key` matching the interaction key in your config.

- **Custom elements (`<interact-element>`)**: use `generate(config, true)` (the default) so selectors target the first child.
- **Vanilla JS / React**: use `generate(config, false)` so selectors target the keyed element directly.
- **FOUC prevention**: for `viewEnter` + `triggerType: 'once'`, inject `generate()` output into `<head>` before the page paints.

---

## See Also

- [Interact Class](interact-class.md) - Main interaction manager
- [InteractionController](interaction-controller.md) - Controller API
- [Custom Element](interact-element.md) - `interact-element` API
- [React Integration](../integration/react.md) - React components and hooks
- [Entrance Animations](../examples/entrance-animations.md) - `viewEnter` trigger examples
- [Type Definitions](types.md) - `IInteractionController` and other types
- [Getting Started](../guides/getting-started.md) - Basic usage examples
