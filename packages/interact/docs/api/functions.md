# Standalone Functions

The `@wix/interact` package exports standalone functions for managing interactions at the element level: `add()`, `remove()`, and `generate()`. These functions work with any HTML element to apply and remove interactions.

## Import

```typescript
import { add, remove, generate } from '@wix/interact';
```

> **Note**: `add`, `remove`, and `generate` are available from all entry points: `@wix/interact`, `@wix/interact/web`, and `@wix/interact/react`.

## Functions Overview

| Function     | Purpose                                                   | Parameters                 | Returns  |
| ------------ | --------------------------------------------------------- | -------------------------- | -------- |
| `add()`      | Add interactions to an element                            | `element`, `key?`          | `void`   |
| `remove()`   | Remove interactions from an element                       | `key`                      | `void`   |
| `generate()` | Generate CSS for hiding elements with entrance animations | `config`, `useFirstChild?` | `string` |

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

Generates CSS styles needed to hide elements that have entrance animations with a `viewEnter` trigger and the default (or explicit) `triggerType: 'once'` on effects. This prevents a flash of unstyled content (FOUC) where elements briefly appear before their entrance animation starts.

### Signature

```typescript
function generate(config: InteractConfig, useFirstChild?: boolean): string;
```

### Parameters

**`config: InteractConfig`** - The interaction configuration; used to find `viewEnter` interactions whose time effects use `triggerType: 'once'` (the default) and build selectors.

**`useFirstChild?: boolean`** - When `true`, targets the first child of each key (e.g. for `<interact-element>`). Default `false`.

### Returns

**`string`** - A CSS string to inject into a `<style>` tag or stylesheet.

### Generated CSS

The function generates CSS that:

1. **Respects reduced motion**: Wrapped in `@media (prefers-reduced-motion: no-preference)`.
2. **Targets elements by key**: Selectors use `[data-interact-key="..."]` for each interaction key that has a `viewEnter` entrance with `triggerType: 'once'` (including the default).
3. **Excludes completed animations**: Uses `:not([data-interact-enter])` so elements are shown after the animation runs.

**With `useFirstChild: false` (vanilla/React, element is the target)**:

```css
@media (prefers-reduced-motion: no-preference) {
  [data-interact-key='hero']:not([data-interact-enter]) {
    visibility: hidden;
    transform: none;
    translate: none;
    scale: none;
    rotate: none;
  }
}
```

**With `useFirstChild: true` (e.g. custom elements, first child is the target)**:

```css
@media (prefers-reduced-motion: no-preference) {
  [data-interact-key='hero'] > :first-child:not([data-interact-enter]) {
    visibility: hidden;
    transform: none;
    translate: none;
    scale: none;
    rotate: none;
  }
}
```

### Examples

#### Basic Usage

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

// Generate the CSS (pass true when using custom elements so first child is targeted)
const css = generate(config, false);

// Inject into page
const styleElement = document.createElement('style');
styleElement.textContent = css;
document.head.appendChild(styleElement);

// Create the Interact instance
Interact.create(config);
```

#### Server-Side Rendering (SSR)

For SSR scenarios, generate the CSS on the server and include it in the initial HTML:

```typescript
// server.ts
import { generate, InteractConfig } from '@wix/interact';

const config: InteractConfig = {
  interactions: [
    /* your interactions */
  ],
  effects: {},
};

const css = generate(config);

// Include in your HTML template
const html = `
<!DOCTYPE html>
<html>
<head>
  <style>${css}</style>
</head>
<body>
  <!-- Your content -->
</body>
</html>
`;
```

### HTML Setup

Elements must have `data-interact-key` matching the interaction key in your config. When using `<interact-element>`, use `generate(config, true)` so the first child is targeted. With the React `Interaction` component, use `initial={true}` to set `data-interact-initial="true"` for FOUC prevention; the generated CSS still selects by `data-interact-key`.

---

## See Also

- [Interact Class](interact-class.md) - Main interaction manager
- [InteractionController](interaction-controller.md) - Controller API
- [Custom Element](interact-element.md) - `interact-element` API
- [React Integration](../integration/react.md) - React components and hooks
- [Entrance Animations](../examples/entrance-animations.md) - `viewEnter` trigger examples
- [Type Definitions](types.md) - `IInteractionController` and other types
- [Getting Started](../guides/getting-started.md) - Basic usage examples
