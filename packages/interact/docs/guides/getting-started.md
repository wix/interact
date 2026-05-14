# Getting Started

Welcome to `@wix/interact`! This guide will help you create your first interaction in under 4 minutes.

## What is @wix/interact?

`@wix/interact` is a powerful library that lets you create interactive animations and effects triggered by user actions like clicking, hovering, or scrolling. It integrates seamlessly with `@wix/motion` to provide smooth, performant animations.

## Core Concepts

Before we dive in, let's understand the three main concepts:

1. **Triggers** - User actions that start an interaction (click, hover, scroll, etc.)
2. **Effects** - The visual changes that happen (animations, transitions, style changes)
3. **Elements** - The HTML elements that participate in the interaction

## Installation

```bash
npm install @wix/interact
```

### Optional: Animation Presets

To use `namedEffect` presets (e.g. `FadeIn`, `SlideIn`, `BounceIn`, etc.), you can register effect modules from `@wix/motion-presets` or register your own custom-made effects.

```bash
npm install @wix/motion-presets
```

Then register the presets before creating interactions:

```typescript
import { Interact } from '@wix/interact/web';
import { FadeIn } from '@wix/motion-presets';

// Register animation presets
Interact.registerEffects({ FadeIn });

// Now you can use namedEffect in your config
const config = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [
        {
          namedEffect: { type: 'FadeIn' },
          duration: 1000,
        },
      ],
    },
  ],
};

Interact.create(config);
```

> **Note:** If you only use `keyframeEffect` (custom keyframes), you don't need `@wix/motion-presets`.

## Package Entry Points

`@wix/interact` provides three entry points for different use cases:

| Entry Point           | Use Case           | Key Exports                                          |
| --------------------- | ------------------ | ---------------------------------------------------- |
| `@wix/interact/react` | React applications | `Interaction`, `createInteractRef`, `Interact`       |
| `@wix/interact/web`   | Web Components     | `Interact`, `defineInteractElement`, `add`, `remove` |
| `@wix/interact`       | Vanilla JS         | `Interact`, `add`, `remove`                          |

Choose the entry point that matches your framework:

```typescript
// For React applications
import { Interact, Interaction } from '@wix/interact/react';

// For native Web Components
import { Interact } from '@wix/interact/web';

// For vaniall JavaScript
import { Interact, add, remove } from '@wix/interact';
```

---

## Your First Interaction (React)

If you're using React, here's the quickest way to get started using the `Interaction` component:

### Step 1: Create the Configuration

```tsx
import React, { useEffect } from 'react';
import { Interact, Interaction, InteractConfig } from '@wix/interact/react';

const config: InteractConfig = {
  interactions: [
    {
      key: 'my-image', // What element triggers the interaction
      trigger: 'hover', // What user action starts it
      effects: [
        {
          keyframeEffect: {
            name: 'scale',
            keyframes: [{ scale: 2 }],
          },
          duration: 300, // Animation duration in milliseconds
          easing: 'ease-out', // Animation timing
        },
      ],
    },
  ],
  effects: {},
};
```

### Step 2: Create the Component

```tsx
function App() {
  useEffect(() => {
    const instance = Interact.create(config);
    return () => instance.destroy();
  }, []);

  return (
    <Interaction tagName="div" interactKey="my-image" className="image-container">
      <img src="logo.png" alt="Logo" />
    </Interaction>
  );
}

export default App;
```

That's it! The image will now scale up when you hover over it.

---

## Your First Interaction (Vanilla JavaScript)

For vanilla JavaScript or non-React frameworks, use the `interact-element` custom element:

### Step 1: Basic HTML Structure

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My First Interaction</title>
  </head>
  <body>
    <interact-element data-interact-key="my-image">
      <img id="my-image" src="logo.png" alt="Logo" />
    </interact-element>

    <script type="module" src="./main.js"></script>
  </body>
</html>
```

**Key points:**

- Wrap your element in `<interact-element>`
- Use `data-interact-key` to identify the element (must be unique)
- The key in your interaction config should be a unique string that matches the value of `data-interact-key` for that element

### Step 2: Configure the Interaction

```javascript
// main.js
import { Interact } from '@wix/interact/web';

// Create the interaction configuration
const config = {
  interactions: [
    {
      key: 'my-image', // What element triggers the interaction
      trigger: 'hover', // What user action starts it
      effects: [
        {
          keyframeEffect: {
            name: 'scale',
            keyframes: [{ scale: 2 }],
          },
          duration: 300, // Animation duration in milliseconds
          easing: 'ease-out', // Animation timing
        },
      ],
    },
  ],
  effects: {},
};

// Initialize the interaction
Interact.create(config);
```

---

## Understanding the Configuration

Let's break down what each part does:

### The `interactions` Array

This contains all your interactions. Each interaction defines:

- **key**: Which element triggers the interaction
- **trigger**: What user action starts it
- **effects**: What animations happen

### The `effects` Object

Define reusable effects that can be referenced by `effectId`:

```typescript
const config = {
  effects: {
    'fade-in': {
      duration: 1000,
      keyframeEffect: {
        name: 'fade-in',
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
      },
    },
  },
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [{ effectId: 'fade-in' }], // Reference the effect
    },
  ],
};
```

### Effect Properties

Each effect defines:

- **key**: Which element gets animated (if missing it defaults to source)
- **keyframeEffect**: An object containing a `keyframes` property that maps to an array of keyframe objects, and a `name` containing a unique name for that effect
- **duration**: How long the animation takes
- **easing**: The animation timing curve

---

## Common Patterns

### Hover with Scale and Rotation

```javascript
{
    key: 'my-element',
    trigger: 'hover',
    effects: [
        {
            key: 'my-element',
            keyframeEffect: {
                name: 'twist',
                keyframes: [
                    { transform: 'scale(1) rotate(0deg)' },
                    { transform: 'scale(1.1) rotate(5deg)' }
                ]
            },
            duration: 200,
            easing: 'ease-out'
        }
    ]
}
```

### Click to Toggle State

```javascript
{
    key: 'my-button',
    trigger: 'click',
    effects: [
        {
            key: 'my-content',
            effectId: 'expand',
        }
    ]
}
```

### Entrance Animation on Viewport Entry

```javascript
{
    key: 'my-element',
    trigger: 'viewEnter',
    effects: [
        {
            key: 'my-element',
            namedEffect: { type: 'FadeIn' },
            duration: 800,
            easing: 'ease-out'
        }
    ]
}
```

> **Note**: Using `namedEffect` requires registering effects first with `Interact.registerEffects(...)` (presets from `@wix/motion-presets` or your own custom-made effects). See [Installation](#optional-animation-presets).

> **Tip**: Call `generate(config)` to produce complete CSS for all interactions — `@keyframes`, animation properties, scroll-driven timelines, state effects, and FOUC-prevention rules. The generated CSS uses attribute selectors, so animations bind reactively as elements appear in the DOM without needing JS-managed DOM references. See [generate() documentation](../api/functions.md#generate) for details.

---

## React vs Web Components

| Approach                                | When to Use                                                                                          |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **React (`Interaction` component)**     | React applications, automatic cleanup                                                                |
| **Web Components (`interact-element`)** | Framework-agnostic projects, declerative creation and automatic DOM-changes handling                 |
| **Mini**                                | Framework-agnostic projects, if no need for dynamic DOM changes or integrating with other frameworks |

### React Example (Recommended for React)

```tsx
import { Interact, Interaction } from '@wix/interact/react';

function Card() {
  useEffect(() => {
    Interact.create(config);
    return () => Interact.destroy();
  }, []);

  return (
    <Interaction tagName="article" interactKey="card" className="card">
      <h2>Card Title</h2>
      <p>Card content here</p>
    </Interaction>
  );
}
```

### Web Component Example (Framework-agnostic)

```html
<interact-element data-interact-key="card">
  <article class="card">
    <h2>Card Title</h2>
    <p>Card content here</p>
  </article>
</interact-element>
```

```typescript
import { Interact } from '@wix/interact/web';
Interact.create(config);
```

---

## TypeScript Support

Both entry points provide full TypeScript support:

```typescript
import { Interact, InteractConfig, Interaction } from '@wix/interact/react';

const config: InteractConfig = {
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter', // TypeScript validates trigger types
      effects: [
        {
          duration: 1000,
          keyframeEffect: {
            name: 'fade',
            keyframes: [{ opacity: 0 }, { opacity: 1 }],
          },
        },
      ],
    },
  ],
  effects: {},
};

// Full type inference
const instance = Interact.create(config);
```

---

## Cleanup

Always clean up interactions when components unmount or pages change:

### React

```tsx
useEffect(() => {
  const instance = Interact.create(config);
  return () => instance.destroy();
}, []);
```

### Vanilla JavaScript

```javascript
// On page unload or SPA navigation
window.addEventListener('beforeunload', () => {
  Interact.destroy();
});
```

---

## Next Steps

Congratulations! You've created your first interaction. Here's what to explore next:

1. **[Understanding Triggers](./understanding-triggers.md)** - Learn about all 7 trigger types
2. **[Effects and Animations](./effects-and-animations.md)** - Discover more animation options
3. **[Custom Elements](./custom-elements.md)** - Understand how `<interact-element>` works
4. **[React Integration](../integration/react.md)** - Deep dive into React components and hooks
5. **[Configuration Structure](./configuration-structure.md)** - Organize complex interactions
