# interact-element Custom Element

The `interact-element` is a custom HTML element that serves as a wrapper for content that should have interactions applied to it. It automatically manages the connection between DOM elements and Interact when using the `@wix/interact/web` integration.

> **Note for React Users**: Consider using the [`Interaction` component](../integration/react.md) from `@wix/interact/react` instead, which provides better React integration with ref forwarding and automatic cleanup.

## Import and Setup

When using the web entry point, you must ensure the custom element is defined before using it:

```typescript
import { Interact } from '@wix/interact/web';

// Create your configuration - this automatically defines the custom element
const interact = Interact.create(config);
```

## Basic Usage

```html
<interact-element data-interact-key="unique-id">
  <div class="content">Your interactive content here</div>
</interact-element>
```

```typescript
import { Interact } from '@wix/interact/web';

// Configure interactions for the element
const config = {
  interactions: [
    {
      trigger: 'viewEnter',
      key: 'unique-id',
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
```

## HTML Usage

### Basic Structure

```html
<!-- Minimal structure -->
<interact-element data-interact-key="my-element">
  <div>Content to animate</div>
</interact-element>
```

### Required Attributes

#### `data-interact-key`

**Required:** Yes  
**Type:** `string`  
**Description:** Unique identifier matching the interaction configuration.

**Example:**

```html
<interact-element data-interact-key="hero">
  <div>Hero content</div>
</interact-element>
```

### Child Element Requirements

The custom element **must** contain at least one child to be the event/animation target element:

```html
<!-- ✅ Correct: Single child element -->
<interact-element data-interact-key="hero">
  <div class="hero-content">
    <h1>Title</h1>
    <p>Description</p>
  </div>
</interact-element>

<!-- ❌ Incorrect: No child element -->
<interact-element data-interact-key="empty"> </interact-element>

<!-- ❌ Incorrect: Text node only -->
<interact-element data-interact-key="text"> Just text content </interact-element>
```

## Properties

### `controller: IInteractionController`

The internal controller that manages this element's interactions.

**Example:**

```typescript
const element = document.querySelector('interact-element') as IInteractElement;

// Access the controller
const controller = element.controller;
console.log('Connected:', controller.connected);
console.log('Key:', controller.key);

// Toggle effects through controller
controller.toggleEffect('my-effect', 'add');
```

## Methods

### `connect(key?: string)`

Connects the element to the interaction system.

**Parameters:**

- `key?: string` - Optional key override; defaults to `data-interact-key` attribute

**Example:**

```typescript
const element = document.querySelector('interact-element') as IInteractElement;

// Manually connect (usually automatic via connectedCallback)
element.connect('my-key');
```

### `disconnect()`

Disconnects the element from the interaction system and cleans up resources.

**Example:**

```typescript
const element = document.querySelector('interact-element') as IInteractElement;

// Manually disconnect
element.disconnect();
```

### `toggleEffect(effectId, stateAction, item?)`

Toggles a CSS state effect on the element.

**Parameters:**

- `effectId: string` - The effect identifier
- `stateAction: StateAction` - How to change the state (`'add' | 'remove' | 'toggle' | 'clear'`)
- `item?: HTMLElement | null` - Optional specific element for list items

**Example:**

```typescript
const element = document.querySelector('interact-element') as IInteractElement;

// Add an effect
element.toggleEffect('active', 'add');

// Toggle an effect
element.toggleEffect('expanded', 'toggle');

// Remove an effect
element.toggleEffect('active', 'remove');

// Clear all effects
element.toggleEffect('', 'clear');
```

### `getActiveEffects(): string[]`

Returns an array of currently active effect IDs.

**Example:**

```typescript
const element = document.querySelector('interact-element') as IInteractElement;

const activeEffects = element.getActiveEffects();
console.log('Active effects:', activeEffects);
// e.g., ['hover', 'expanded']
```

## Framework Integration

### Vanilla JavaScript

```typescript
import { Interact } from '@wix/interact/web';

const config = {
  interactions: [
    {
      key: 'my-card',
      trigger: 'hover',
      effects: [{ effectId: 'lift' }],
    },
  ],
  effects: {
    lift: {
      duration: 200,
      keyframeEffect: {
        name: 'lift',
        keyframes: [{ transform: 'translateY(-4px)' }],
      },
    },
  },
};

Interact.create(config);

// Elements automatically connect when added to DOM
document.body.innerHTML = `
  <interact-element data-interact-key="my-card">
    <div class="card">Card content</div>
  </interact-element>
`;
```

### React (Using interact-element)

> **Note**: You can use the [`Interaction` component](../integration/react.md) from `@wix/interact/react` instead.

```tsx
import { useEffect } from 'react';
import { Interact } from '@wix/interact/web';

function InteractiveCard() {
  useEffect(() => {
    Interact.create(config);
    return () => Interact.destroy();
  }, []);

  return (
    <interact-element data-interact-key="card-toggle">
      <button>Toggle Effect</button>
    </interact-element>
  );
}
```

## Lifecycle

### Connection Flow

1. Element is added to DOM
2. `connectedCallback()` is called
3. `connect()` creates or retrieves an `InteractionController`
4. Controller is stored in `Interact.controllerCache`
5. Interactions are applied based on configuration

### Disconnection Flow

1. Element is removed from DOM
2. `disconnectedCallback()` is called
3. `disconnect()` cleans up the controller
4. Event listeners are removed
5. Controller is removed from cache (if element is fully removed)

## Browser Support

### Modern Browsers

- Full feature support including CSS custom states
- ElementInternals API for state management
- Adopted stylesheets for dynamic CSS

### Legacy Browsers

- Automatic fallback to data attributes
- CSS custom property fallbacks
- Polyfill support for custom elements

### Detection

```typescript
function checkSupport() {
  const element = document.createElement('interact-element') as IInteractElement;

  return {
    customElements: !!window.customElements,
    elementInternals: !!element.attachInternals,
    adoptedStyleSheets: !!document.adoptedStyleSheets,
    cssCustomStates: !!element._internals?.states,
  };
}

const support = checkSupport();
console.log('Browser support:', support);
```

## Debugging

### Element Inspection

```typescript
// Debug element state
function debugElement(key: string) {
  const controller = Interact.getController(key);

  if (!controller) {
    console.log(`Controller for ${key} not found in cache`);
    return;
  }

  const element = controller.element as IInteractElement;

  console.log(`Element ${key}:`, {
    connected: controller.connected,
    hasChild: !!element.firstElementChild,
    hasSheet: !!controller.sheet,
    hasInternals: !!element._internals,
    activeEffects: controller.getActiveEffects(),
  });
}

// Usage
debugElement('hero');
```

### Common Issues

```typescript
// Check for common problems
function validateElement(element: IInteractElement) {
  const issues: string[] = [];

  if (!element.dataset.interactKey) {
    issues.push('Missing data-interact-key attribute');
  }

  if (!element.firstElementChild) {
    issues.push('Missing child element');
  }

  if (!element.controller?.connected) {
    issues.push('Controller not connected to interaction system');
  }

  return issues;
}
```

## Comparison with Interaction Component

| Feature      | `<interact-element>` | `<Interaction>` (React) |
| ------------ | -------------------- | ----------------------- |
| Import       | `@wix/interact/web`  | `@wix/interact/react`   |
| Type         | Web Component        | React Component         |
| Ref handling | Manual               | Built-in forwarding     |
| TypeScript   | Requires casting     | Full inference          |
| SSR          | Requires care        | Better compatibility    |
| Framework    | Any                  | React only              |

## See Also

- [Interact Class](interact-class.md) - Main interaction manager
- [InteractionController](interaction-controller.md) - Controller API
- [Functions](functions.md) - `add()` and `remove()` functions
- [Type Definitions](types.md) - `IInteractElement` interface
- [React Integration](../integration/react.md) - React components
- [Configuration Guide](../guides/configuration-structure.md) - Setting up interactions
- [Getting Started](../guides/getting-started.md) - Basic usage examples
