# @wix/interact Documentation

Welcome to the complete documentation for the `@wix/interact` package - a powerful, declarative interaction library for creating engaging web animations and effects.

## Package Entry Points

| Entry Point           | Use Case           | Key Exports                                                                 |
| --------------------- | ------------------ | --------------------------------------------------------------------------- |
| `@wix/interact/web`   | Web Components     | `Interact`, `add`, `remove`, `generate`                                     |
| `@wix/interact/react` | React applications | `Interact`, `add`, `remove`, `generate`, `Interaction`, `createInteractRef` |
| `@wix/interact`       | Vanilla JS         | `Interact`, `add`, `remove`, `generate`                                     |

## Table of Contents

### **API Reference**

- [**Core API**](api/README.md) - Main classes and functions
  - [Interact Class](api/interact-class.md) - Main interaction manager
  - [InteractionController](api/interaction-controller.md) - Controller for element interactions
  - [Standalone Functions](api/functions.md) - `add()`, `remove()`, `generate()`
  - [Custom Element](api/interact-element.md) - `<interact-element>` API
  - [Element Selection](api/element-selection.md) - Selection priority and patterns
- [**Type Definitions**](api/types.md) - TypeScript interfaces and types

### **Guides**

- [**Getting Started**](guides/getting-started.md) - Your first interaction
- [**Core Concepts**](guides/README.md)
  - [Understanding Triggers](guides/understanding-triggers.md)
  - [Effects and Animations](guides/effects-and-animations.md)
  - [Configuration Structure](guides/configuration-structure.md)
  - [Custom Elements](guides/custom-elements.md)
  - [Lists and Dynamic Content](guides/lists-and-dynamic-content.md)
  - [State Management](guides/state-management.md)
  - [Conditions & Media Queries](guides/conditions-and-media-queries.md)

### **Examples**

- [**Examples**](examples/README.md)
  - [Entrance Animations](examples/entrance-animations.md)
  - [Click Interactions](examples/click-interactions.md)
  - [Hover Effects](examples/hover-effects.md)
  - [List Patterns](examples/list-patterns.md)

### **Integration**

- [**Framework Integration**](integration/README.md)
  - [React Integration](integration/react.md)

### **Advanced**

- [**Advanced Topics**](advanced/README.md)

## Quick Navigation

### I want to...

**Get started quickly**
→ [Getting Started Guide](guides/getting-started.md)

**Use with React**
→ [React Integration](integration/react.md)

**Understand the concepts**
→ [Core Concepts](guides/README.md)

**See code examples**
→ [Examples & Patterns](examples/README.md)

**Look up API details**
→ [API Reference](api/README.md)

**Integrate with my framework**
→ [Integration](integration/README.md)

**Extend functionality**
→ [Advanced Topics](advanced/README.md)

## Quick Start

### React

```tsx
import { useEffect } from 'react';
import { Interact, Interaction } from '@wix/interact/react';

const config = {
  interactions: [
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
        },
      ],
    },
  ],
  effects: {},
};

function App() {
  useEffect(() => {
    const instance = Interact.create(config);
    return () => instance.destroy();
  }, []);

  return (
    <Interaction tagName="div" interactKey="card" className="card">
      <h2>Hover me!</h2>
    </Interaction>
  );
}
```

### Web Components

```html
<interact-element data-interact-key="card">
  <div class="card">
    <h2>Hover me!</h2>
  </div>
</interact-element>
```

```javascript
import { Interact } from '@wix/interact/web';

Interact.create({
  interactions: [
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
        },
      ],
    },
  ],
});
```

### Vanilla JS

```html
<div class="card" data-interact-key="nice-card">
  <h2>Hover me!</h2>
</div>
```

```javascript
import { Interact, add } from '@wix/interact';

const niceCard = document.querySelector('[data-interact-key="nice-card"]');

add(niceCard);

Interact.create({
  interactions: [
    {
      key: 'nice-card',
      trigger: 'hover',
      effects: [
        {
          keyframeEffect: {
            name: 'lift',
            keyframes: [{ transform: 'translateY(-4px)' }],
          },
          duration: 200,
        },
      ],
    },
  ],
});
```

## Version Information

This documentation is for `@wix/interact` v2.0.0.

## Feedback

Found an issue with the documentation? Please [open an issue](https://github.com/wix/interact/issues) or contribute improvements via pull request.
